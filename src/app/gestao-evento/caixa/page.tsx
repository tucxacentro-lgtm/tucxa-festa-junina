import Link from "next/link";
import type { ReactNode } from "react";
import { CreditCard, ReceiptText, Search, QrCode, Wheat } from "lucide-react";
import { PixPaymentBox } from "@/components/pix-payment-box";
import { SiteHeader } from "@/components/site-header";
import { cancelConsumptionGroup, cancelConsumptionOrder } from "@/app/gestao-evento/actions";
import { getCurrentEventForPublic } from "@/lib/current-event";
import { formatCurrency } from "@/lib/format";
import { buildPixCopyPastePayload } from "@/lib/pix";
import { deliveryStatusLabel, getConsumptionOrdersForEvent, orderStatusLabel, paymentMethodLabel, paymentStatusLabel, type ConsumptionOrderWithDetails } from "@/lib/operation-dashboard";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams?: Promise<{ view?: string; sort?: string; cancelado?: string }>;
};

type CashierGroup = {
  key: string;
  label: string;
  responsible: string;
  tableLabel: string;
  orders: ConsumptionOrderWithDetails[];
  demo?: boolean;
  demoTotal?: number;
  settlementMode?: string;
};

const DEMO_GROUPS: CashierGroup[] = [
  { key: "demo-1", label: "Mesa 1", tableLabel: "Mesa 1", responsible: "Família Silva", orders: [], demo: true, demoTotal: 42, settlementMode: "fechamento_final" },
  { key: "demo-2", label: "Mesa 2", tableLabel: "Mesa 2", responsible: "Coordenação", orders: [], demo: true, demoTotal: 58, settlementMode: "por_pedido" },
  { key: "demo-3", label: "Mesa 3", tableLabel: "Mesa 3", responsible: "Voluntários", orders: [], demo: true, demoTotal: 35, settlementMode: "fechamento_final" },
  { key: "demo-4", label: "Mesa 4", tableLabel: "Mesa 4", responsible: "Amigos do Tucxa", orders: [], demo: true, demoTotal: 76, settlementMode: "por_pedido" },
];

function shortId(id: string) { return id.slice(0, 8).toUpperCase(); }
function statusClass(value: string) {
  if (value === "delivered" || value === "paid") return "bg-green-100 text-green-900";
  if (value === "ready" || value === "proof_sent" || value === "registered") return "bg-blue-100 text-blue-900";
  if (value === "preparing") return "bg-amber-100 text-amber-900";
  if (value === "cancelled") return "bg-red-100 text-red-900";
  return "bg-stone-100 text-stone-700";
}

function settlementLabel(value?: string | null) {
  return value === "fechamento_final" ? "Pagamento no final" : "Pedido a pedido";
}

function firstNonEmpty(...values: Array<string | null | undefined>) {
  return values.find((value) => value && value.trim())?.trim() ?? "";
}

function groupOrders(orders: ConsumptionOrderWithDetails[], view: string): CashierGroup[] {
  const groups = new Map<string, CashierGroup>();

  for (const order of orders) {
    const tableLabel = firstNonEmpty(order.table_label, order.customer_name, "Sem mesa");
    const responsible = firstNonEmpty(order.customer_name, order.table_label, "Responsável não informado");
    const key = view === "pedidos" ? order.id : view === "responsavel" ? responsible : tableLabel;
    const current = groups.get(key) ?? {
      key,
      label: view === "pedidos" ? `Pedido ${shortId(order.id)}` : view === "responsavel" ? responsible : tableLabel,
      tableLabel,
      responsible,
      settlementMode: order.settlement_mode ?? "por_pedido",
      orders: [],
    };
    current.orders.push(order);
    groups.set(key, current);
  }

  return Array.from(groups.values());
}

function sortGroups(groups: CashierGroup[], sort: string) {
  const sorted = [...groups];
  if (sort === "responsavel") sorted.sort((a, b) => a.responsible.localeCompare(b.responsible, "pt-BR"));
  else if (sort === "cadastro") sorted.sort((a, b) => (b.orders[0]?.created_at ?? "").localeCompare(a.orders[0]?.created_at ?? ""));
  else sorted.sort((a, b) => a.tableLabel.localeCompare(b.tableLabel, "pt-BR", { numeric: true }));
  return sorted;
}

function totalFromOrders(orders: ConsumptionOrderWithDetails[]) {
  return orders.reduce((sum, order) => sum + Number(order.total_amount ?? 0), 0);
}

function pendingFromOrders(orders: ConsumptionOrderWithDetails[]) {
  return orders.filter((order) => order.payment_status !== "paid" && order.status !== "cancelled").reduce((sum, order) => sum + Number(order.total_amount ?? 0), 0);
}

function FilterLink({ href, active, children }: { href: string; active: boolean; children: ReactNode }) {
  return <Link href={href} className={`rounded-full px-4 py-2 text-sm font-black ${active ? "bg-green-900 text-white" : "bg-white text-green-950 shadow-sm"}`} prefetch={false}>{children}</Link>;
}

export default async function CaixaPublicPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const view = params?.view ?? "mesa";
  const sort = params?.sort ?? "mesa";
  const event = await getCurrentEventForPublic();
  const orders = await getConsumptionOrdersForEvent(event.id);
  const totalOrders = orders.reduce((sum, order) => sum + Number(order.total_amount ?? 0), 0);
  const paidOrders = orders.filter((order) => order.payment_status === "paid");
  const pendingOrders = orders.filter((order) => order.payment_status !== "paid" && order.status !== "cancelled");
  const paidAmount = paidOrders.reduce((sum, order) => sum + Number(order.total_amount ?? 0), 0);
  const pendingAmount = pendingOrders.reduce((sum, order) => sum + Number(order.total_amount ?? 0), 0);
  const realGroups = sortGroups(groupOrders(orders, view), sort);
  const groups = realGroups.length > 0 ? realGroups : DEMO_GROUPS;

  return (
    <main className="min-h-screen bg-amber-50 text-green-950">
      <SiteHeader />
      <section className="mx-auto max-w-7xl px-5 py-10">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link href="/gestao-evento" className="rounded-full bg-white px-5 py-3 text-sm font-black text-green-950 shadow-sm" prefetch={false}>← Gestão do Evento</Link>
          <Link href="/gestao-evento/garcom" className="rounded-full bg-white px-5 py-3 text-sm font-black text-green-950 shadow-sm" prefetch={false}>Ver Garçom</Link>
        </div>

        <div className="rounded-[2rem] border border-green-100 bg-white p-6 shadow-sm">
          <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-black text-green-900">Operação · Caixa</span>
          <h1 className="mt-4 text-3xl font-black">Fechamento por mesa, responsável ou pedido</h1>
          <p className="mt-3 max-w-4xl text-stone-700">Clique em uma mesa/responsável para conferir pedidos, entrega, pagamento e Pix com QR Code de valor total.</p>
          <div className="mt-6 grid gap-4 md:grid-cols-4">
            <div className="rounded-3xl bg-amber-50 p-5"><p className="text-sm font-bold text-stone-600">Total pedidos</p><p className="mt-2 text-2xl font-black">{formatCurrency(totalOrders)}</p></div>
            <div className="rounded-3xl bg-green-50 p-5"><p className="text-sm font-bold text-stone-600">Pago</p><p className="mt-2 text-2xl font-black">{formatCurrency(paidAmount)}</p></div>
            <div className="rounded-3xl bg-red-50 p-5"><p className="text-sm font-bold text-stone-600">Pendente</p><p className="mt-2 text-2xl font-black">{formatCurrency(pendingAmount)}</p></div>
            <div className="rounded-3xl bg-stone-50 p-5"><p className="text-sm font-bold text-stone-600">Pedidos</p><p className="mt-2 text-2xl font-black">{orders.length}</p></div>
          </div>
        </div>

        {params?.cancelado ? (
          <div className="mt-5 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm font-bold text-green-900">
            Registro cancelado. Ele não aparece mais para Garçom/Atendimento nem para Caixa; ficará disponível apenas na área logada em Atendimento &gt; Cancelados.
          </div>
        ) : null}

        <section className="mt-8 rounded-[2rem] border border-green-100 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div><h2 className="text-2xl font-black">Mesas e responsáveis</h2><p className="mt-1 text-sm text-stone-600">Visualize por mesa, responsável ou pedidos. Se ainda não houver pedidos, aparecem exemplos para apresentação aos coordenadores.</p></div>
            <div className="grid gap-2 text-sm">
              <div className="flex flex-wrap gap-2"><FilterLink href="/gestao-evento/caixa?view=mesa" active={view === "mesa"}>Por mesa</FilterLink><FilterLink href="/gestao-evento/caixa?view=responsavel" active={view === "responsavel"}>Por responsável</FilterLink><FilterLink href="/gestao-evento/caixa?view=pedidos" active={view === "pedidos"}>Por pedidos</FilterLink></div>
              <div className="flex flex-wrap gap-2"><FilterLink href={`/gestao-evento/caixa?view=${view}&sort=mesa`} active={sort === "mesa"}>Ordenar por mesa</FilterLink><FilterLink href={`/gestao-evento/caixa?view=${view}&sort=responsavel`} active={sort === "responsavel"}>A-Z responsável</FilterLink><FilterLink href={`/gestao-evento/caixa?view=${view}&sort=cadastro`} active={sort === "cadastro"}>Ordem de cadastro</FilterLink></div>
            </div>
          </div>

          <div className="mt-6 grid gap-5">
            {groups.map((group) => {
              const groupTotal = group.demo ? group.demoTotal ?? 0 : totalFromOrders(group.orders);
              const groupPending = group.demo ? group.demoTotal ?? 0 : pendingFromOrders(group.orders);
              const pixPayload = buildPixCopyPastePayload({
                pixKey: event.pix_key || "58.392.598/0001-91",
                amount: groupPending,
                receiverName: event.pix_receiver_name || "Tucxa",
                receiverCity: "Campinas",
                txid: group.demo ? group.key : group.key.replace(/[^a-zA-Z0-9]/g, "").slice(0, 25),
                description: `${group.tableLabel} ${group.responsible}`,
              });
              return (
                <article key={group.key} className="rounded-[2rem] border border-green-100 bg-stone-50 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex items-start gap-3"><div className="rounded-2xl bg-amber-100 p-3"><Wheat className="h-6 w-6 text-amber-800" /></div><div><p className="text-xs font-black uppercase tracking-[0.16em] text-green-800">{group.demo ? "Exemplo de fechamento" : "Mesa/responsável"}</p><h3 className="mt-1 text-2xl font-black">{group.tableLabel} · {group.responsible}</h3><p className="mt-1 text-sm text-stone-600">{settlementLabel(group.settlementMode)} · {group.demo ? "dados demonstrativos" : `${group.orders.length} pedido(s)`}</p></div></div>
                    <div className="grid gap-3 text-right"><div><p className="text-xs font-bold text-stone-500">Total</p><p className="text-2xl font-black">{formatCurrency(groupTotal)}</p><p className="text-xs font-bold text-red-800">Pendente: {formatCurrency(groupPending)}</p></div>{!group.demo ? (<form action={cancelConsumptionGroup} className="justify-self-end"><input type="hidden" name="event_id" value={event.id} /><input type="hidden" name="event_slug" value={event.slug} /><input type="hidden" name="table_label" value={view === "responsavel" ? "" : group.tableLabel} /><input type="hidden" name="responsible" value={group.responsible} /><input type="hidden" name="return_to" value="/gestao-evento/caixa" /><input type="hidden" name="reason" value="Mesa/responsável cancelado na tela Caixa." /><button className="rounded-full bg-red-50 px-4 py-2 text-sm font-black text-red-800">Cancelar mesa/responsável</button></form>) : null}</div>
                  </div>

                  {groupPending > 0 ? (
                    <div className="mt-5 rounded-3xl border border-green-100 bg-white p-4">
                      <div className="flex items-center gap-2"><QrCode className="h-5 w-5 text-green-800" /><h4 className="text-lg font-black">Pix para fechamento desta mesa</h4></div>
                      <p className="mt-1 text-sm text-stone-600">Ao escanear, o app do banco deve preencher a chave do Tucxa e o valor total pendente.</p>
                      <PixPaymentBox pixCopyPaste={pixPayload} amount={groupPending} pixKey={event.pix_key || "58.392.598/0001-91"} receiverName={event.pix_receiver_name || "Tucxa"} title="Pix do fechamento" />
                    </div>
                  ) : null}

                  {group.demo ? (
                    <div className="mt-5 rounded-2xl bg-white p-4 text-sm text-stone-700">
                      <p className="font-black text-green-950">Exemplo de itens da mesa</p>
                      <ul className="mt-2 list-disc space-y-1 pl-5">
                        <li>2 refrigerantes lata · 1 pastel salgado · 1 cartela de bingo</li>
                        <li>Status de entrega: parcialmente entregue</li>
                        <li>Status de pagamento: pendente</li>
                      </ul>
                    </div>
                  ) : (
                    <div className="mt-5 grid gap-3">
                      {group.orders.map((order) => (
                        <article key={order.id} className="rounded-2xl bg-white p-4">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div><p className="font-black">Pedido {shortId(order.id)} · {order.customer_name || "Cliente"}</p><p className="text-sm text-stone-600">WhatsApp: {order.customer_phone || "não informado"}</p><p className="text-sm text-stone-600">Garçom: {order.waiter_name || "não informado"} · {settlementLabel(order.settlement_mode)}</p></div>
                            <div className="flex flex-wrap gap-2 text-xs font-black"><span className={`rounded-full px-3 py-1 ${statusClass(order.status)}`}>{orderStatusLabel(order.status)}</span><span className={`rounded-full px-3 py-1 ${statusClass(order.delivery_status)}`}>Entrega: {deliveryStatusLabel(order.delivery_status)}</span><span className={`rounded-full px-3 py-1 ${statusClass(order.payment_status)}`}>Pagamento: {paymentStatusLabel(order.payment_status)}</span></div>
                          </div>
                          <div className="mt-4 overflow-x-auto rounded-2xl border border-stone-100"><table className="w-full min-w-[640px] text-left text-sm"><thead className="bg-green-950 text-white"><tr><th className="p-3">Item</th><th className="p-3">Qtd.</th><th className="p-3">Unitário</th><th className="p-3">Total</th><th className="p-3">Status</th></tr></thead><tbody>{order.items.map((item) => <tr key={item.id} className="border-b border-stone-100 last:border-0"><td className="p-3 font-bold">{item.item_name}</td><td className="p-3">{Number(item.quantity)}</td><td className="p-3">{formatCurrency(item.unit_price)}</td><td className="p-3 font-black">{formatCurrency(item.total_price)}</td><td className="p-3">{orderStatusLabel(item.status)}</td></tr>)}</tbody></table></div>
                          <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto] md:items-center"><div className="rounded-2xl bg-stone-50 p-3 text-sm"><p className="font-black"><CreditCard className="mr-1 inline h-4 w-4" /> Pagamentos registrados</p>{order.payments.length > 0 ? <ul className="mt-2 space-y-1 text-stone-700">{order.payments.map((payment) => <li key={payment.id}>{paymentMethodLabel(payment.method)} · {formatCurrency(payment.amount)} · {paymentStatusLabel(payment.status)}{payment.proof_file_path ? " · comprovante anexado" : ""}</li>)}</ul> : <p className="mt-2 text-stone-600">Nenhum pagamento registrado.</p>}</div><div className="flex flex-wrap gap-2"><Link href={`/cardapio/${event.slug}/pedido/${order.id}`} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-green-900 px-5 py-3 text-sm font-black text-white" prefetch={false}><ReceiptText className="h-4 w-4" /> Abrir pedido</Link><form action={cancelConsumptionOrder}><input type="hidden" name="order_id" value={order.id} /><input type="hidden" name="event_slug" value={event.slug} /><input type="hidden" name="return_to" value="/gestao-evento/caixa" /><input type="hidden" name="reason" value="Pedido cancelado na tela Caixa." /><button className="rounded-2xl bg-red-50 px-5 py-3 text-sm font-black text-red-800">Cancelar pedido</button></form></div></div>
                        </article>
                      ))}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </section>

        <div className="mt-8 rounded-[2rem] border border-green-100 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div><h2 className="text-2xl font-black">Todos os pedidos</h2><p className="mt-1 text-sm text-stone-600">Conferência individual por pedido.</p></div>
            <div className="inline-flex items-center gap-2 rounded-full bg-stone-50 px-4 py-2 text-sm font-bold text-stone-600"><Search className="h-4 w-4" /> Use Ctrl+F para buscar</div>
          </div>
          {orders.length === 0 ? <div className="mt-5 rounded-3xl border border-dashed border-green-200 bg-green-50 p-8 text-center text-sm text-stone-700">Nenhum pedido de consumo foi registrado ainda. Os cards acima mostram exemplos para homologação.</div> : null}
        </div>
      </section>
    </main>
  );
}
