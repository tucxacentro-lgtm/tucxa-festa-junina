import Link from "next/link";
import { ClipboardList, QrCode, Search, UserPlus } from "lucide-react";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import { SiteHeader } from "@/components/site-header";
import { QrCodeInline } from "@/components/qr-code-inline";
import { cancelConsumptionGroup, cancelConsumptionOrder, createServiceResponsible } from "@/app/gestao-evento/actions";
import { getCurrentEventForPublic } from "@/lib/current-event";
import { formatCurrency } from "@/lib/format";
import { filterServiceRows, getServiceResponsiblesForEvent, getWaiterOptions, pendingFromOrders, totalFromOrders, type ServiceResponsibleRow } from "@/lib/operation-dashboard";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams?: Promise<{ q?: string; garcom?: string; erro?: string; nome?: string; cancelado?: string }>;
};


function cardapioUrl(eventSlug: string, row: ServiceResponsibleRow) {
  const params = new URLSearchParams();
  if (!row.id.startsWith("order:")) params.set("sessao", row.id);
  params.set("responsavel", row.responsibleName);
  if (row.waiterName) params.set("garcom", row.waiterName);
  params.set("fechamento", row.settlementMode || "fechamento_final");
  return `/cardapio/${eventSlug}?${params.toString()}`;
}

function trackingUrl(row: ServiceResponsibleRow) {
  if (row.id.startsWith("order:")) return `/gestao-evento/responsavel?nome=${encodeURIComponent(row.responsibleName)}`;
  return `/gestao-evento/responsavel/${row.id}`;
}

function statusText(row: ServiceResponsibleRow) {
  if (row.orders.length === 0) return "Sem pedidos";
  const pending = pendingFromOrders(row.orders);
  if (pending > 0) return "Com pendência";
  return "Pago";
}

function normalizeResponsibleKey(value: string) {
  return value.trim().toLocaleLowerCase("pt-BR");
}

function mergeRowsByResponsible(rows: ServiceResponsibleRow[]) {
  const map = new Map<string, ServiceResponsibleRow>();

  for (const row of rows) {
    const key = normalizeResponsibleKey(row.responsibleName);
    const current = map.get(key);

    if (!current) {
      map.set(key, {
        ...row,
        waiterName: row.waiterName ?? null,
        orders: [...row.orders],
      });
      continue;
    }

    current.orders.push(...row.orders);

    const waiterNames = new Set(
      [current.waiterName, row.waiterName]
        .flatMap((value) => (value ?? "").split("/"))
        .map((value) => value.trim())
        .filter(Boolean),
    );

    current.waiterName = Array.from(waiterNames).join(" / ") || current.waiterName || row.waiterName;
    current.responsiblePhone = current.responsiblePhone || row.responsiblePhone;
    current.tableLabel = current.tableLabel || row.tableLabel;
    current.settlementMode = current.settlementMode || row.settlementMode;
  }

  return Array.from(map.values()).sort((a, b) => a.responsibleName.localeCompare(b.responsibleName, "pt-BR"));
}

export default async function GarcomPublicPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const event = await getCurrentEventForPublic();
  const rows = await getServiceResponsiblesForEvent(event.id);
  const waiters = getWaiterOptions(rows);
  const filteredRows = mergeRowsByResponsible(filterServiceRows(rows, params?.q, params?.garcom));

  return (
    <main className="min-h-screen bg-amber-50 text-green-950">
      <SiteHeader />
      <section className="mx-auto max-w-7xl px-5 py-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link href="/gestao-evento" className="inline-flex min-h-12 items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-black text-green-950 shadow-sm" prefetch={false}>← Gestão do Evento</Link>
          <Link href="/gestao-evento/caixa" className="inline-flex min-h-12 items-center justify-center rounded-full bg-green-900 px-5 py-3 text-sm font-black text-white shadow-sm" prefetch={false}>Ir para Caixa</Link>
        </div>

        <div className="rounded-[2rem] border border-green-100 bg-white p-6 shadow-sm">
          <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-black text-green-900">Operação · Garçom/Atendimento</span>
          <h1 className="mt-4 text-3xl font-black">Responsáveis por pedidos</h1>
          <p className="mt-3 max-w-4xl text-stone-700">
            Cadastre o responsável pelos pedidos. O nome do garçom é opcional neste ano. Se o responsável já existir, o sistema não permite novo cadastro com o mesmo nome. Depois clique no nome para abrir o cardápio já vinculado ao responsável.
          </p>
        </div>

        {params?.erro === "responsavel-existe" ? (
          <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-800">
            O responsável {params.nome ? <strong>{params.nome}</strong> : "informado"} já existe no sistema. Use a linha existente na lista abaixo para abrir o cardápio.
          </div>
        ) : null}
        {params?.erro === "campos-obrigatorios" ? (
          <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-800">Informe o nome do responsável pelos pedidos.</div>
        ) : null}
        {params?.cancelado ? (
          <div className="mt-5 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm font-bold text-green-900">Registro cancelado. Ele não aparece mais para Garçom/Atendimento nem para Caixa.</div>
        ) : null}

        <form action={createServiceResponsible} className="mt-8 rounded-[2rem] border border-green-100 bg-white p-6 shadow-sm">
          <input type="hidden" name="event_id" value={event.id} />
          <input type="hidden" name="event_slug" value={event.slug} />
          <div className="flex items-center gap-3">
            <UserPlus className="h-6 w-6 text-green-800" />
            <div>
              <h2 className="text-2xl font-black">Cadastrar responsável</h2>
              <p className="mt-1 text-sm text-stone-600">Use um cadastro por responsável. O nome do garçom é opcional e o fechamento padrão será no caixa ao final.</p>
            </div>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-4">
            <label className="grid gap-1 text-sm font-bold">Nome do garçom <span className="text-xs font-bold text-stone-500">opcional</span><input name="waiter_name" className="rounded-2xl border border-green-100 p-3 font-normal" placeholder="Ex.: João (opcional)" /></label>
            <label className="grid gap-1 text-sm font-bold">Responsável pelos pedidos<input name="responsible_name" required className="rounded-2xl border border-green-100 p-3 font-normal" placeholder="Nome do responsável" /></label>
            <label className="grid gap-1 text-sm font-bold">WhatsApp opcional<input name="responsible_phone" className="rounded-2xl border border-green-100 p-3 font-normal" placeholder="Opcional" /></label>
            <label className="grid gap-1 text-sm font-bold">Pagamento<select name="settlement_mode" defaultValue="fechamento_final" className="rounded-2xl border border-green-100 p-3 font-normal"><option value="fechamento_final">Somente no final</option><option value="por_pedido">Pedido a pedido</option></select></label>
          </div>
          <button className="mt-5 w-full rounded-2xl bg-green-900 px-5 py-4 text-sm font-black text-white md:w-auto">Cadastrar e abrir cardápio</button>
        </form>

        <section className="mt-8 rounded-[2rem] border border-green-100 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black">Lista de responsáveis</h2>
              <p className="mt-1 text-sm text-stone-600">Lista em ordem alfabética, com busca por nome e filtro por garçom.</p>
            </div>
            <form action="/gestao-evento/garcom#resultado-busca" className="grid w-full gap-2 md:w-auto md:grid-cols-[1fr_1fr_auto]">
              <label className="relative block">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
                <input name="q" defaultValue={params?.q ?? ""} className="w-full rounded-full border border-green-100 bg-white py-3 pl-9 pr-4 text-sm" placeholder="Buscar responsável" />
              </label>
              <select name="garcom" defaultValue={params?.garcom ?? ""} className="rounded-full border border-green-100 bg-white px-4 py-3 text-sm font-bold text-green-950">
                <option value="">Todos os garçons</option>
                <option value="__sem_garcom">Sem garçom informado</option>
                {waiters.map((waiter) => <option key={waiter} value={waiter}>{waiter}</option>)}
              </select>
              <button className="rounded-full bg-green-900 px-5 py-3 text-sm font-black text-white">Filtrar</button>
            </form>
          </div>

          <div id="resultado-busca" className="scroll-mt-24" />

          <div className="mt-6 grid gap-3 md:hidden">
            {filteredRows.map((row) => {
              const total = totalFromOrders(row.orders);
              const pending = pendingFromOrders(row.orders);
              const publicTrackingUrl = trackingUrl(row);
              return (
                <article key={row.id} className="rounded-3xl border border-green-100 bg-white p-4 shadow-sm">
                  <Link href={cardapioUrl(event.slug, row)} className="block text-lg font-black text-green-900 underline" prefetch={false}>{row.responsibleName}</Link>
                  <p className="mt-1 text-xs text-stone-500">{statusText(row)}</p>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                    <div className="rounded-2xl bg-stone-50 p-3"><p className="text-xs font-bold text-stone-500">Garçom</p><p className="font-black">{row.waiterName || "—"}</p></div>
                    <div className="rounded-2xl bg-stone-50 p-3"><p className="text-xs font-bold text-stone-500">Pedidos</p><p className="font-black">{row.orders.length}</p></div>
                    <div className="rounded-2xl bg-stone-50 p-3"><p className="text-xs font-bold text-stone-500">Total</p><p className="font-black">{formatCurrency(total)}</p></div>
                    <div className="rounded-2xl bg-red-50 p-3"><p className="text-xs font-bold text-red-700">Pendente</p><p className="font-black text-red-800">{formatCurrency(pending)}</p></div>
                  </div>
                  <details className="mt-3 rounded-2xl bg-green-50 p-3">
                    <summary className="cursor-pointer font-black text-green-900"><QrCode className="mr-1 inline h-4 w-4" /> QR Code único</summary>
                    <div className="mt-3"><QrCodeInline value={publicTrackingUrl} /><p className="mt-2 break-all text-xs text-stone-600">{publicTrackingUrl}</p></div>
                  </details>
                  <div className="mt-3 grid gap-2">
                    <Link href={cardapioUrl(event.slug, row)} className="rounded-full bg-green-900 px-4 py-3 text-center text-sm font-black text-white" prefetch={false}>Abrir pedidos</Link>
                    <form action={cancelConsumptionGroup}>
                      <input type="hidden" name="event_id" value={event.id} />
                      <input type="hidden" name="responsible" value={row.responsibleName} />
                      <input type="hidden" name="return_to" value="/gestao-evento/garcom" />
                      <input type="hidden" name="reason" value="Responsável cancelado na tela Garçom/Atendimento." />
                      <ConfirmSubmitButton className="w-full rounded-full bg-red-50 px-4 py-3 text-sm font-black text-red-800" message={`Tem certeza que deseja cancelar o responsável ${row.responsibleName} e ocultar seus pedidos das telas de Garçom/Atendimento e Caixa? Os registros continuarão salvos no sistema.`}>Cancelar</ConfirmSubmitButton>
                    </form>
                  </div>
                </article>
              );
            })}
            {filteredRows.length === 0 ? <p className="rounded-2xl bg-stone-50 p-4 text-center text-sm text-stone-600">Nenhum responsável encontrado. Cadastre o primeiro responsável acima.</p> : null}
          </div>

          <div className="mt-6 hidden overflow-x-auto rounded-3xl border border-green-100 md:block">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead className="bg-green-950 text-white">
                <tr>
                  <th className="p-3">Responsável</th>
                  <th className="p-3">Garçom</th>
                  <th className="p-3">Pedidos</th>
                  <th className="p-3">Total</th>
                  <th className="p-3">Pendente</th>
                  <th className="p-3">Acompanhamento</th>
                  <th className="p-3">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-green-100 bg-white">
                {filteredRows.map((row) => {
                  const total = totalFromOrders(row.orders);
                  const pending = pendingFromOrders(row.orders);
                  const publicTrackingUrl = trackingUrl(row);
                  return (
                    <tr key={row.id} className="align-top">
                      <td className="p-3"><Link href={cardapioUrl(event.slug, row)} className="font-black text-green-900 underline" prefetch={false}>{row.responsibleName}</Link><p className="mt-1 text-xs text-stone-500">{statusText(row)}</p></td>
                      <td className="p-3">{row.waiterName || "—"}</td>
                      <td className="p-3">{row.orders.length}</td>
                      <td className="p-3 font-black">{formatCurrency(total)}</td>
                      <td className="p-3 font-black text-red-800">{formatCurrency(pending)}</td>
                      <td className="p-3"><details><summary className="cursor-pointer font-black text-green-900"><QrCode className="mr-1 inline h-4 w-4" /> QR Code</summary><div className="mt-3 rounded-2xl bg-stone-50 p-3"><QrCodeInline value={publicTrackingUrl} /><p className="mt-2 break-all text-xs text-stone-600">{publicTrackingUrl}</p></div></details></td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-2">
                          <Link href={cardapioUrl(event.slug, row)} className="rounded-full bg-green-900 px-4 py-2 text-xs font-black text-white" prefetch={false}>Abrir pedidos</Link>
                          <form action={cancelConsumptionGroup}>
                            <input type="hidden" name="event_id" value={event.id} />
                            <input type="hidden" name="responsible" value={row.responsibleName} />
                            <input type="hidden" name="return_to" value="/gestao-evento/garcom" />
                            <input type="hidden" name="reason" value="Responsável cancelado na tela Garçom/Atendimento." />
                            <ConfirmSubmitButton className="rounded-full bg-red-50 px-4 py-2 text-xs font-black text-red-800" message={`Tem certeza que deseja cancelar o responsável ${row.responsibleName} e ocultar seus pedidos das telas de Garçom/Atendimento e Caixa? Os registros continuarão salvos no sistema.`}>Cancelar</ConfirmSubmitButton>
                          </form>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredRows.length === 0 ? (
                  <tr><td colSpan={7} className="p-8 text-center text-sm text-stone-600">Nenhum responsável encontrado. Cadastre o primeiro responsável acima.</td></tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-8 rounded-[2rem] border border-green-100 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3"><ClipboardList className="h-6 w-6 text-green-800" /><div><h2 className="text-2xl font-black">Pedidos registrados</h2><p className="mt-1 text-sm text-stone-600">Conferência operacional. O cliente retira os itens com as fichas em papel entregues pelo garçom.</p></div></div>
          <div className="mt-5 grid gap-3">
            {filteredRows.flatMap((row) => row.orders.map((order) => (
              <article key={order.id} className="rounded-2xl border border-stone-100 bg-stone-50 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div><p className="font-black">{row.responsibleName} · Pedido {order.id.slice(0, 8).toUpperCase()}</p><p className="mt-1 text-sm text-stone-600">{order.items.map((item) => `${Number(item.quantity)} ${item.item_name}`).join(" · ")}</p></div>
                  <div className="flex flex-wrap gap-2"><strong>{formatCurrency(order.total_amount)}</strong><form action={cancelConsumptionOrder}><input type="hidden" name="order_id" value={order.id} /><input type="hidden" name="event_slug" value={event.slug} /><input type="hidden" name="return_to" value="/gestao-evento/garcom" /><input type="hidden" name="reason" value="Pedido cancelado na tela Garçom/Atendimento." /><ConfirmSubmitButton className="rounded-full bg-red-50 px-4 py-2 text-xs font-black text-red-800" message="Tem certeza que deseja cancelar este pedido? Ele não será apagado; apenas deixará de aparecer nas telas de Garçom/Atendimento e Caixa.">Cancelar pedido</ConfirmSubmitButton></form></div>
                </div>
              </article>
            )))}
          </div>
        </section>
      </section>
    </main>
  );
}
