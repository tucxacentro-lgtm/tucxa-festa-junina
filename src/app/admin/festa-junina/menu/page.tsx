import { AdminPageShell } from "@/components/admin-page-shell";
import { MENU_STATUS_OPTIONS, getAdminMenuCatalog, getEventMenuConfigurations } from "@/lib/admin-menu";
import { requireAdmin } from "@/lib/auth";
import { getCurrentEventForAdmin } from "@/lib/current-event";
import { createEventMenuDefaults, saveEventMenuItem, saveGlobalMenuItem } from "./actions";

export const dynamic = "force-dynamic";

type PageProps = { searchParams?: Promise<Record<string, string | string[] | undefined>> };

const sections = ["Geral", "Evento selecionado", "Conveniências", "Operação"];

async function getData() {
  const [event, catalog] = await Promise.all([getCurrentEventForAdmin(), getAdminMenuCatalog()]);
  const eventConfigs = await getEventMenuConfigurations(event.id);
  return { event, catalog, eventConfigs };
}

function statusLabel(value: string) {
  return MENU_STATUS_OPTIONS.find((option) => option.value === value)?.label ?? value;
}

export default async function AdminMenuPage({ searchParams }: PageProps) {
  await requireAdmin(["admin", "coordenador"], "/admin/festa-junina/menu");
  const params = await searchParams;
  const { event, catalog, eventConfigs } = await getData();

  return (
    <AdminPageShell>
      <section className="mx-auto max-w-7xl px-5 py-10">
        <div className="rounded-[2rem] border border-green-100 bg-white p-6 shadow-sm">
          <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-black text-green-900">Menu configurável</span>
          <h1 className="mt-4 text-3xl font-black text-green-950">Cadastro do menu do sistema</h1>
          <p className="mt-3 max-w-4xl text-stone-700">
            Defina os itens, hierarquia, sequência e página associada ao menu lateral. Depois, configure quais itens serão usados em cada evento. Se o item ainda não tiver dados cadastrados para o evento, a própria tela associada abre pronta para iniciar a configuração.
          </p>
          <div className="mt-5 rounded-2xl bg-amber-50 p-4 text-sm font-bold text-amber-900">Evento aberto: {event.name}</div>
          {params?.saved ? <div className="mt-5 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm font-bold text-green-900">Menu salvo com sucesso.</div> : null}
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_24rem]">
          <div className="grid gap-5">
            <div className="rounded-[2rem] border border-green-100 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black text-green-950">Menu deste evento</h2>
                  <p className="mt-2 max-w-3xl text-sm leading-relaxed text-stone-600">
                    Ative, desative, renomeie, reordene e marque o status de cada funcionalidade no evento aberto. Esses registros controlam o que aparece no menu lateral.
                  </p>
                </div>
                <form action={createEventMenuDefaults}>
                  <input type="hidden" name="event_id" value={event.id} />
                  <button className="rounded-full bg-green-900 px-5 py-3 text-sm font-black text-white shadow-sm transition hover:bg-green-800">Criar/atualizar padrão</button>
                </form>
              </div>
            </div>

            {sections.map((section) => {
              const items = catalog.filter((item) => item.section === section).sort((a, b) => a.sort_order - b.sort_order);
              if (!items.length) return null;

              return (
                <div key={section} className="rounded-[2rem] border border-green-100 bg-white p-6 shadow-sm">
                  <h3 className="text-xl font-black text-green-950">{section}</h3>
                  <div className="mt-5 grid gap-4">
                    {items.map((item) => {
                      const config = eventConfigs.get(item.item_key);
                      const enabled = config?.enabled ?? item.default_enabled;
                      const status = config?.status ?? (enabled ? "suggested" : "not_used");
                      const sortOrder = config?.sort_order ?? item.sort_order;
                      const label = config?.custom_label ?? "";

                      return (
                        <form key={item.item_key} action={saveEventMenuItem} className="rounded-3xl border border-stone-100 bg-stone-50 p-4">
                          <input type="hidden" name="event_id" value={event.id} />
                          <input type="hidden" name="menu_item_id" value={item.id ?? ""} />
                          <input type="hidden" name="item_key" value={item.item_key} />
                          <div className="grid gap-4 lg:grid-cols-[1fr_11rem_12rem_7rem] lg:items-end">
                            <div>
                              <p className="text-xs font-black uppercase tracking-[0.14em] text-green-800">{item.parent_key ? `Filho de ${item.parent_key}` : "Raiz"}</p>
                              <h4 className="mt-1 font-black text-green-950">{item.label}</h4>
                              <p className="mt-1 text-xs leading-relaxed text-stone-600">{item.description ?? "Sem descrição."}</p>
                              <p className="mt-2 text-xs text-stone-500">Rota: <span className="font-mono">{item.route_path ?? "Apenas agrupador"}</span></p>
                            </div>
                            <label className="grid gap-1 text-sm font-bold text-green-950">
                              Nome no evento
                              <input name="custom_label" defaultValue={label} className="rounded-2xl border border-stone-200 bg-white p-3 font-normal" placeholder={item.label} />
                            </label>
                            <label className="grid gap-1 text-sm font-bold text-green-950">
                              Status
                              <select name="status" defaultValue={status} className="rounded-2xl border border-stone-200 bg-white p-3 font-normal">
                                {MENU_STATUS_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                              </select>
                            </label>
                            <label className="grid gap-1 text-sm font-bold text-green-950">
                              Ordem
                              <input name="sort_order" type="number" defaultValue={sortOrder} className="rounded-2xl border border-stone-200 bg-white p-3 font-normal" />
                            </label>
                          </div>
                          <div className="mt-4 grid gap-4 lg:grid-cols-[10rem_1fr_1fr_auto] lg:items-end">
                            <label className="flex items-center gap-2 rounded-2xl bg-white p-3 text-sm font-bold text-green-950">
                              <input name="enabled" type="checkbox" defaultChecked={enabled} /> Usar
                            </label>
                            <label className="grid gap-1 text-sm font-bold text-green-950">
                              Responsável
                              <input name="responsible_name" defaultValue={config?.responsible_name ?? ""} className="rounded-2xl border border-stone-200 bg-white p-3 font-normal" placeholder="Nome do responsável" />
                            </label>
                            <label className="grid gap-1 text-sm font-bold text-green-950">
                              Observações
                              <input name="notes" defaultValue={config?.notes ?? ""} className="rounded-2xl border border-stone-200 bg-white p-3 font-normal" placeholder="Pendências ou decisões" />
                            </label>
                            <button className="rounded-2xl bg-green-900 px-5 py-3 text-sm font-black text-white">Salvar</button>
                          </div>
                          <p className="mt-3 text-xs font-bold text-stone-500">Status atual: {statusLabel(status)}</p>
                        </form>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <aside className="rounded-[2rem] border border-green-100 bg-white p-6 shadow-sm xl:sticky xl:top-24 xl:self-start">
            <h2 className="text-xl font-black text-green-950">Catálogo global</h2>
            <p className="mt-2 text-sm leading-relaxed text-stone-600">
              Use esta área para ajustar a definição global de um item do menu. A configuração por evento fica à esquerda.
            </p>
            <form action={saveGlobalMenuItem} className="mt-5 grid gap-3">
              <label className="grid gap-1 text-sm font-bold text-green-950">
                Chave do item
                <input name="item_key" required className="rounded-2xl border border-stone-200 p-3 font-normal" placeholder="ex.: vendas_convites" />
              </label>
              <label className="grid gap-1 text-sm font-bold text-green-950">
                Título
                <input name="label" required className="rounded-2xl border border-stone-200 p-3 font-normal" placeholder="Nome exibido" />
              </label>
              <label className="grid gap-1 text-sm font-bold text-green-950">
                Descrição
                <textarea name="description" className="min-h-20 rounded-2xl border border-stone-200 p-3 font-normal" />
              </label>
              <label className="grid gap-1 text-sm font-bold text-green-950">
                Seção
                <select name="section" defaultValue="Evento selecionado" className="rounded-2xl border border-stone-200 p-3 font-normal">
                  {sections.map((section) => <option key={section} value={section}>{section}</option>)}
                </select>
              </label>
              <label className="grid gap-1 text-sm font-bold text-green-950">
                Chave do item pai
                <input name="parent_key" className="rounded-2xl border border-stone-200 p-3 font-normal" placeholder="vendas, operacao_compras..." />
              </label>
              <label className="grid gap-1 text-sm font-bold text-green-950">
                Rota/página associada
                <input name="route_path" className="rounded-2xl border border-stone-200 p-3 font-normal" placeholder="/admin/festa-junina/convites" />
              </label>
              <label className="grid gap-1 text-sm font-bold text-green-950">
                Ícone
                <input name="icon_key" className="rounded-2xl border border-stone-200 p-3 font-normal" placeholder="opcional" />
              </label>
              <label className="grid gap-1 text-sm font-bold text-green-950">
                Ordem padrão
                <input name="sort_order" type="number" defaultValue={999} className="rounded-2xl border border-stone-200 p-3 font-normal" />
              </label>
              <label className="flex items-center gap-2 rounded-2xl bg-amber-50 p-3 text-sm font-bold text-green-950"><input name="default_enabled" type="checkbox" defaultChecked /> Habilitado por padrão</label>
              <label className="flex items-center gap-2 rounded-2xl bg-amber-50 p-3 text-sm font-bold text-green-950"><input name="implemented" type="checkbox" defaultChecked /> Página implementada</label>
              <label className="flex items-center gap-2 rounded-2xl bg-amber-50 p-3 text-sm font-bold text-green-950"><input name="active" type="checkbox" defaultChecked /> Ativo no catálogo</label>
              <label className="grid gap-1 text-sm font-bold text-green-950">
                Mensagem se não implementado
                <input name="not_implemented_message" className="rounded-2xl border border-stone-200 p-3 font-normal" />
              </label>
              <button className="rounded-2xl bg-green-900 px-5 py-3 font-black text-white">Salvar item global</button>
            </form>
            <div className="mt-6 rounded-2xl bg-green-50 p-4 text-xs leading-relaxed text-green-950">
              Para editar um item existente, use a mesma chave do item. O sistema fará atualização pelo campo <strong>item_key</strong>.
            </div>
          </aside>
        </div>
      </section>
    </AdminPageShell>
  );
}
