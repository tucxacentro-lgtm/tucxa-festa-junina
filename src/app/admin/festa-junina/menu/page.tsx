import { AdminPageShell } from "@/components/admin-page-shell";
import {
  MENU_STATUS_OPTIONS,
  getAdminMenuCatalog,
  getEventMenuConfigurations,
  type AdminMenuCatalogItem,
} from "@/lib/admin-menu";
import { requireAdmin } from "@/lib/auth";
import { getCurrentEventForAdmin } from "@/lib/current-event";
import { createEventMenuDefaults, saveEventMenuItem, saveGlobalMenuItem } from "./actions";

export const dynamic = "force-dynamic";

type PageProps = { searchParams?: Promise<Record<string, string | string[] | undefined>> };

type MenuNode = AdminMenuCatalogItem & { children: MenuNode[] };

const sections = ["Geral", "Evento selecionado", "Conveniências", "Operação"];

async function getData() {
  const [event, catalog] = await Promise.all([getCurrentEventForAdmin(), getAdminMenuCatalog()]);
  const eventConfigs = await getEventMenuConfigurations(event.id);
  return { event, catalog, eventConfigs };
}

function statusLabel(value: string) {
  return MENU_STATUS_OPTIONS.find((option) => option.value === value)?.label ?? value;
}

function buildMenuTree(
  items: AdminMenuCatalogItem[],
  section: string,
  eventConfigs: Awaited<ReturnType<typeof getEventMenuConfigurations>>,
) {
  const getOrder = (item: AdminMenuCatalogItem) => eventConfigs.get(item.item_key)?.sort_order ?? item.sort_order;
  const sortedItems = items
    .filter((item) => item.section === section)
    .sort((a, b) => getOrder(a) - getOrder(b) || a.label.localeCompare(b.label));

  const nodes = new Map<string, MenuNode>();

  for (const item of sortedItems) {
    nodes.set(item.item_key, { ...item, children: [] });
  }

  const roots: MenuNode[] = [];

  for (const item of sortedItems) {
    const node = nodes.get(item.item_key);
    if (!node) continue;

    const parent = item.parent_key ? nodes.get(item.parent_key) : null;
    if (parent) {
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  }

  function sortChildren(node: MenuNode) {
    node.children.sort((a, b) => getOrder(a) - getOrder(b) || a.label.localeCompare(b.label));
    node.children.forEach(sortChildren);
  }

  roots.forEach(sortChildren);
  return roots;
}

function parentOptions(catalog: AdminMenuCatalogItem[], currentKey?: string) {
  return catalog
    .filter((item) => item.item_key !== currentKey)
    .sort((a, b) => a.section.localeCompare(b.section) || a.sort_order - b.sort_order || a.label.localeCompare(b.label));
}

function depthPadding(depth: number) {
  if (depth <= 0) return "pl-4";
  if (depth === 1) return "pl-8";
  if (depth === 2) return "pl-12";
  return "pl-16";
}

function MenuEditorRow({
  item,
  depth,
  catalog,
  eventId,
  eventConfigs,
}: {
  item: MenuNode;
  depth: number;
  catalog: AdminMenuCatalogItem[];
  eventId: string;
  eventConfigs: Awaited<ReturnType<typeof getEventMenuConfigurations>>;
}) {
  const config = eventConfigs.get(item.item_key);
  const enabled = config?.enabled ?? item.default_enabled;
  const status = config?.status ?? (enabled ? "suggested" : "not_used");
  const sortOrder = config?.sort_order ?? item.sort_order;
  const customLabel = config?.custom_label ?? "";
  const parents = parentOptions(catalog, item.item_key);

  return (
    <div className="rounded-2xl border border-stone-100 bg-white shadow-sm">
      <div className={`flex flex-wrap items-center gap-3 border-b border-stone-100 bg-stone-50 px-4 py-3 ${depthPadding(depth)}`}>
        <span className="cursor-grab select-none rounded-lg bg-white px-2 py-1 text-lg font-black text-stone-500 shadow-sm" title="Referência visual: arrastar será implementado em etapa futura.">☰</span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="font-black text-green-950">{customLabel || item.label}</h4>
            <span className="rounded-full bg-green-50 px-2 py-1 text-[0.65rem] font-black text-green-800">{statusLabel(status)}</span>
            {!item.active ? <span className="rounded-full bg-red-50 px-2 py-1 text-[0.65rem] font-black text-red-700">Inativo no catálogo</span> : null}
          </div>
          <p className="mt-1 text-xs text-stone-500">
            Chave: <span className="font-mono">{item.item_key}</span> · Pai: <span className="font-mono">{item.parent_key || "raiz"}</span> · Rota: <span className="font-mono">{item.route_path || "agrupador"}</span>
          </p>
        </div>
      </div>

      <div className="grid gap-4 p-4 xl:grid-cols-2">
        <form action={saveGlobalMenuItem} className="rounded-2xl border border-green-100 bg-green-50/50 p-4">
          <input type="hidden" name="item_key" value={item.item_key} />
          <p className="text-xs font-black uppercase tracking-[0.14em] text-green-800">Catálogo global</p>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <label className="grid gap-1 text-sm font-bold text-green-950">
              Título
              <input name="label" defaultValue={item.label} required className="rounded-2xl border border-stone-200 bg-white p-3 font-normal" />
            </label>
            <label className="grid gap-1 text-sm font-bold text-green-950">
              Seção
              <select name="section" defaultValue={item.section} className="rounded-2xl border border-stone-200 bg-white p-3 font-normal">
                {sections.map((section) => <option key={section} value={section}>{section}</option>)}
              </select>
            </label>
            <label className="grid gap-1 text-sm font-bold text-green-950">
              Item pai / indentação
              <select name="parent_key" defaultValue={item.parent_key ?? ""} className="rounded-2xl border border-stone-200 bg-white p-3 font-normal">
                <option value="">Sem item pai</option>
                {parents.map((parent) => <option key={parent.item_key} value={parent.item_key}>{parent.section} · {parent.label} ({parent.item_key})</option>)}
              </select>
            </label>
            <label className="grid gap-1 text-sm font-bold text-green-950">
              Ordem padrão
              <input name="sort_order" type="number" defaultValue={item.sort_order} className="rounded-2xl border border-stone-200 bg-white p-3 font-normal" />
            </label>
            <label className="grid gap-1 text-sm font-bold text-green-950 md:col-span-2">
              Rota/página associada
              <input name="route_path" defaultValue={item.route_path ?? ""} className="rounded-2xl border border-stone-200 bg-white p-3 font-normal" placeholder="/admin/festa-junina/convites" />
            </label>
            <label className="grid gap-1 text-sm font-bold text-green-950 md:col-span-2">
              Descrição
              <textarea name="description" defaultValue={item.description ?? ""} className="min-h-20 rounded-2xl border border-stone-200 bg-white p-3 font-normal" />
            </label>
            <label className="grid gap-1 text-sm font-bold text-green-950">
              Ícone
              <input name="icon_key" defaultValue={item.icon_key ?? ""} className="rounded-2xl border border-stone-200 bg-white p-3 font-normal" placeholder="opcional" />
            </label>
            <label className="grid gap-1 text-sm font-bold text-green-950">
              Mensagem se não implementado
              <input name="not_implemented_message" defaultValue={item.not_implemented_message ?? ""} className="rounded-2xl border border-stone-200 bg-white p-3 font-normal" />
            </label>
          </div>
          <div className="mt-3 flex flex-wrap gap-3">
            <label className="flex items-center gap-2 rounded-2xl bg-white px-3 py-2 text-sm font-bold text-green-950"><input name="default_enabled" type="checkbox" defaultChecked={item.default_enabled} /> Padrão usado</label>
            <label className="flex items-center gap-2 rounded-2xl bg-white px-3 py-2 text-sm font-bold text-green-950"><input name="implemented" type="checkbox" defaultChecked={item.implemented} /> Página implementada</label>
            <label className="flex items-center gap-2 rounded-2xl bg-white px-3 py-2 text-sm font-bold text-green-950"><input name="active" type="checkbox" defaultChecked={item.active} /> Ativo no catálogo</label>
          </div>
          <button className="mt-4 rounded-2xl bg-green-900 px-5 py-3 text-sm font-black text-white">Salvar catálogo</button>
        </form>

        <form action={saveEventMenuItem} className="rounded-2xl border border-amber-100 bg-amber-50/70 p-4">
          <input type="hidden" name="event_id" value={eventId} />
          <input type="hidden" name="menu_item_id" value={item.id ?? ""} />
          <input type="hidden" name="item_key" value={item.item_key} />
          <input type="hidden" name="enabled" value="on" />
          <p className="text-xs font-black uppercase tracking-[0.14em] text-amber-900">Configuração do evento</p>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <label className="grid gap-1 text-sm font-bold text-green-950">
              Nome no evento
              <input name="custom_label" defaultValue={customLabel} className="rounded-2xl border border-stone-200 bg-white p-3 font-normal" placeholder={item.label} />
            </label>
            <label className="grid gap-1 text-sm font-bold text-green-950">
              Status
              <select name="status" defaultValue={status} className="rounded-2xl border border-stone-200 bg-white p-3 font-normal">
                {MENU_STATUS_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </label>
            <label className="grid gap-1 text-sm font-bold text-green-950">
              Ordem no evento
              <input name="sort_order" type="number" defaultValue={sortOrder} className="rounded-2xl border border-stone-200 bg-white p-3 font-normal" />
            </label>
            <label className="grid gap-1 text-sm font-bold text-green-950">
              Responsável
              <input name="responsible_name" defaultValue={config?.responsible_name ?? ""} className="rounded-2xl border border-stone-200 bg-white p-3 font-normal" />
            </label>
            <label className="grid gap-1 text-sm font-bold text-green-950 md:col-span-2">
              Observações
              <input name="notes" defaultValue={config?.notes ?? ""} className="rounded-2xl border border-stone-200 bg-white p-3 font-normal" />
            </label>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-amber-900">
            Mesmo quando marcado como “Não usado neste evento”, o item continua aparecendo no menu para mostrar todas as possibilidades do sistema.
          </p>
          <button className="mt-4 rounded-2xl bg-green-900 px-5 py-3 text-sm font-black text-white">Salvar status do evento</button>
        </form>
      </div>

      {item.children.length ? (
        <div className="space-y-4 border-t border-stone-100 p-4">
          {item.children.map((child) => (
            <MenuEditorRow key={child.item_key} item={child} depth={depth + 1} catalog={catalog} eventId={eventId} eventConfigs={eventConfigs} />
          ))}
        </div>
      ) : null}
    </div>
  );
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
            Defina os itens, hierarquia, sequência e página associada ao menu lateral. Todas as funcionalidades cadastradas aparecem para todos os eventos; o status apenas indica se a organização usará ou não aquela opção no evento aberto.
          </p>
          <div className="mt-5 rounded-2xl bg-amber-50 p-4 text-sm font-bold text-amber-900">Evento aberto: {event.name}</div>
          {params?.saved ? <div className="mt-5 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm font-bold text-green-900">Menu salvo com sucesso.</div> : null}
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_24rem]">
          <div className="grid gap-6">
            <div className="rounded-[2rem] border border-green-100 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black text-green-950">Editor visual de hierarquia</h2>
                  <p className="mt-2 max-w-3xl text-sm leading-relaxed text-stone-600">
                    Use o campo <strong>Item pai / indentação</strong> para mover um item para dentro de outro. Use <strong>Ordem</strong> para mudar a sequência. O ícone ☰ indica o conceito de arrastar, que pode ser evoluído depois para drag-and-drop.
                  </p>
                </div>
                <form action={createEventMenuDefaults}>
                  <input type="hidden" name="event_id" value={event.id} />
                  <button className="rounded-full bg-green-900 px-5 py-3 text-sm font-black text-white shadow-sm transition hover:bg-green-800">Criar/atualizar status do evento</button>
                </form>
              </div>
            </div>

            {sections.map((section) => {
              const roots = buildMenuTree(catalog, section, eventConfigs);
              if (!roots.length) return null;

              return (
                <div key={section} className="rounded-[2rem] border border-green-100 bg-stone-50 p-5 shadow-sm">
                  <h3 className="text-xl font-black text-green-950">{section}</h3>
                  <div className="mt-5 grid gap-4">
                    {roots.map((item) => (
                      <MenuEditorRow key={item.item_key} item={item} depth={0} catalog={catalog} eventId={event.id} eventConfigs={eventConfigs} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <aside className="rounded-[2rem] border border-green-100 bg-white p-6 shadow-sm xl:sticky xl:top-24 xl:self-start">
            <h2 className="text-xl font-black text-green-950">Incluir novo item</h2>
            <p className="mt-2 text-sm leading-relaxed text-stone-600">
              Cadastre novas opções do menu. Depois de salvar, o item passa a aparecer no menu lateral e pode ter status específico por evento.
            </p>
            <form action={saveGlobalMenuItem} className="mt-5 grid gap-3">
              <label className="grid gap-1 text-sm font-bold text-green-950">
                Chave do item
                <input name="item_key" required className="rounded-2xl border border-stone-200 p-3 font-normal" placeholder="ex.: operacao_sorteio_air_fryer" />
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
                Item pai / indentação
                <select name="parent_key" defaultValue="" className="rounded-2xl border border-stone-200 p-3 font-normal">
                  <option value="">Sem item pai</option>
                  {parentOptions(catalog).map((parent) => <option key={parent.item_key} value={parent.item_key}>{parent.section} · {parent.label} ({parent.item_key})</option>)}
                </select>
              </label>
              <label className="grid gap-1 text-sm font-bold text-green-950">
                Rota/página associada
                <input name="route_path" className="rounded-2xl border border-stone-200 p-3 font-normal" placeholder="/admin/festa-junina/outros" />
              </label>
              <label className="grid gap-1 text-sm font-bold text-green-950">
                Ordem padrão
                <input name="sort_order" type="number" defaultValue={999} className="rounded-2xl border border-stone-200 p-3 font-normal" />
              </label>
              <input type="hidden" name="icon_key" value="" />
              <input type="hidden" name="not_implemented_message" value="" />
              <label className="flex items-center gap-2 rounded-2xl bg-amber-50 p-3 text-sm font-bold text-green-950"><input name="default_enabled" type="checkbox" defaultChecked /> Padrão usado</label>
              <label className="flex items-center gap-2 rounded-2xl bg-amber-50 p-3 text-sm font-bold text-green-950"><input name="implemented" type="checkbox" defaultChecked /> Página implementada</label>
              <label className="flex items-center gap-2 rounded-2xl bg-amber-50 p-3 text-sm font-bold text-green-950"><input name="active" type="checkbox" defaultChecked /> Ativo no catálogo</label>
              <button className="rounded-2xl bg-green-900 px-5 py-3 font-black text-white">Adicionar item ao menu</button>
            </form>
            <div className="mt-6 rounded-2xl bg-green-50 p-4 text-xs leading-relaxed text-green-950">
              Para alterar um item existente, use os formulários do editor visual à esquerda. Para criar uma nova página depois, associe a rota desejada neste cadastro.
            </div>
          </aside>
        </div>
      </section>
    </AdminPageShell>
  );
}
