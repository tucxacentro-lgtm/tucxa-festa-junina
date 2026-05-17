import Link from "next/link";
import type { ReactNode } from "react";
import { Search, Utensils, UsersRound, Wheat, ReceiptText } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { cancelConsumptionGroup, cancelConsumptionOrder } from "@/app/gestao-evento/actions";
import { getCurrentEventForPublic } from "@/lib/current-event";
import { formatCurrency } from "@/lib/format";
import { deliveryStatusLabel, getConsumptionOrdersForEvent, orderStatusLabel, paymentStatusLabel, type ConsumptionOrderWithDetails } from "@/lib/operation-dashboard";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams?: Promise<{ view?: string; sort?: string; cancelado?: string }>;
};

type ServiceGroup = {
  key: string;
  label: string;
  responsible: string;
  tableLabel: string;
  orders: ConsumptionOrderWithDetails[];
  demo?: boolean;
  waiterName?: string;
  settlementMode?: string;
};

const DEMO_TABLES: ServiceGroup[] = [
  { key: "demo-1", label: "Mesa 1", tableLabel: "Mesa 1", responsible: "Família Silva", waiterName: "Voluntário exemplo", settlementMode: "fechamento_final", orders: [], demo: true },
  { key: "demo-2", label: "Mesa 2", tableLabel: "Mesa 2", responsible: "Coordenação", waiterName: "Voluntário exemplo", settlementMode: "por_pedido", orders: [], demo: true },
  { key: "demo-3", label: "Mesa 3", tableLabel: "Mesa 3", responsible: "Voluntários", waiterName: "Voluntário exemplo", settlementMode: "fechamento_final", orders: [], demo: true },
  { key: "demo-4", label: "Mesa 4", tableLabel: "Mesa 4", responsible: "Amigos do Tucxa", waiterName: "Voluntário exemplo", settlementMode: "por_pedido", orders: [], demo: true },
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

function cardapioUrl(eventSlug: string, tableLabel: string, responsible: string, waiterName?: string, settlementMode?: string) {
  const params = new URLSearchParams();
  if (tableLabel) params.set("mesa", tableLabel);
  if (responsible) params.set("responsavel", responsible);
  if (waiterName) params.set("garcom", waiterName);
  if (settlementMode) params.set("fechamento", settlementMode);
  const query = params.toString();
  return `/cardapio/${eventSlug}${query ? `?${query}` : ""}`;
}

function groupOrders(orders: ConsumptionOrderWithDetails[], view: string): ServiceGroup[] {
  const groups = new Map<string, ServiceGroup>();

  for (const order of orders) {
    const tableLabel = firstNonEmpty(order.table_label, order.customer_name, "Sem mesa");
    const responsible = firstNonEmpty(order.customer_name, order.table_label, "Responsável não informado");
    const key = view === "pedidos" ? order.id : view === "responsavel" ? responsible : tableLabel;
    const current = groups.get(key) ?? {
      key,
      label: view === "pedidos" ? `Pedido ${shortId(order.id)}` : view === "responsavel" ? responsible : tableLabel,
      tableLabel,
      responsible,
      waiterName: order.waiter_name ?? undefined,
      settlementMode: order.settlement_mode ?? "por_pedido",
      orders: [],
    };
    current.orders.push(order);
    groups.set(key, current);
  }

  return Array.from(groups.values());
}

function sortGroups(groups: ServiceGroup[], sort: string) {
  const sorted = [...groups];
  if (sort === "responsavel") sorted.sort((a, b) => a.responsible.localeCompare(b.responsible, "pt-BR"));
  else if (sort === "cadastro") sorted.sort((a, b) => (b.orders[0]?.created_at ?? "").localeCompare(a.orders[0]?.created_at ?? ""));
  else sorted.sort((a, b) => a.tableLabel.localeCompare(b.tableLabel, "pt-BR", { numeric: true }));
  return sorted;
}

function totalFromOrders(orders: ConsumptionOrderWithDetails[]) {
  return orders.reduce((sum, order) => sum + Number(order.total_amount ?? 0), 0);
}

function FilterLink({ href, active, children }: { href: string; active: boolean; children: ReactNode }) {
  return <Link href={href} className={`rounded-full px-4 py-2 text-sm font-black ${active ? "bg-green-900 text-white" : "bg-white text-green-950 shadow-sm"}`} prefetch={false}>{children}</Link>;
}

export default async function GarcomPublicPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const view = params?.view ?? "mesa";
  const sort = params?.sort ?? "mesa";
  const event = await getCurrentEventForPublic();
  const orders = await getConsumptionOrdersForEvent(event.id);
  const openOrders = orders.filter((order) => order.status !== "delivered" && order.status !== "cancelled");
  const deliveredOrders = orders.filter((order) => order.delivery_status === "delivered");
  const pendingDelivery = orders.filter((order) => order.delivery_status !== "delivered" && order.status !== "cancelled");
  const realGroups = sortGroups(groupOrders(orders, view), sort);
  const groups = realGroups.length > 0 ? realGroups : DEMO_TABLES;

  return (
    <main className="min-h-screen bg-amber-50 text-green-950">
      <SiteHeader />
      <section className="mx-auto max-w-7xl px-5 py-10">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link href="/gestao-evento" className="rounded-full bg-white px-5 py-3 text-sm font-black text-green-950 shadow-sm" prefetch={false}>← Gestão do Evento</Link>
          <Link href="/cardapio/arraia-tucxa-2026" className="rounded-full bg-green-900 px-5 py-3 text-sm font-black text-white shadow-sm" prefetch={false}>Abrir cardápio geral</Link>
        </div>

        <div className="rounded-[2rem] border border-green-100 bg-white p-6 shadow-sm">
          <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-black text-green-900">Operação · Garçom</span>
          <h1 className="mt-4 text-3xl font-black">Atendimento por mesa, responsável ou pedido</h1>
          <p className="mt-3 max-w-4xl text-stone-700">No início do atendimento, informe o nome do garçom, a mesa ou responsável e combine se o pagamento será pedido a pedido ou no fechamento final.</p>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-3xl bg-amber-50 p-5"><p className="text-sm font-bold text-stone-600">Pedidos abertos</p><p className="mt-2 text-3xl font-black">{openOrders.length}</p></div>
            <div className="rounded-3xl bg-amber-50 p-5"><p className="text-sm font-bold text-stone-600">Pendentes de entrega</p><p className="mt-2 text-3xl font-black">{pendingDelivery.length}</p></div>
            <div className="rounded-3xl bg-amber-50 p-5"><p className="text-sm font-bold text-stone-600">Entregues</p><p className="mt-2 text-3xl font-black">{deliveredOrders.length}</p></div>
          </div>
        </div>

        {params?.cancelado ? (
          <div className="mt-5 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm font-bold text-green-900">
            Registro cancelado. Ele não aparece mais para Garçom/Atendimento nem para Caixa; ficará disponível apenas na área logada em Atendimento &gt; Cancelados.
          </div>
        ) : null}

        <form action={`/cardapio/${event.slug}`} className="mt-8 rounded-[2rem] border border-green-100 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3"><UsersRound className="h-6 w-6 text-green-800" /><div><h2 className="text-2xl font-black">Iniciar atendimento de mesa</h2><p className="mt-1 text-sm text-stone-600">O link abre o cardápio já preenchido para a mesa/responsável.</p></div></div>
          <div className="mt-5 grid gap-3 md:grid-cols-4">
            <label className="grid gap-1 text-sm font-bold">Garçom<input name="garcom" className="rounded-2xl border border-green-100 p-3 font-normal" placeholder="Nome do garçom" /></label>
            <label className="grid gap-1 text-sm font-bold">Mesa<input name="mesa" className="rounded-2xl border border-green-100 p-3 font-normal" placeholder="Ex.: Mesa 4" /></label>
            <label className="grid gap-1 text-sm font-bold">Responsável<input name="responsavel" className="rounded-2xl border border-green-100 p-3 font-normal" placeholder="Nome do responsável" /></label>
            <label className="grid gap-1 text-sm font-bold">Pagamento<select name="fechamento" defaultValue="por_pedido" className="rounded-2xl border border-green-100 p-3 font-normal"><option value="por_pedido">Pedido a pedido</option><option value="fechamento_final">Somente no final</option></select></label>
          </div>
          <button className="mt-5 rounded-2xl bg-green-900 px-5 py-3 text-sm font-black text-white">Abrir cardápio para esta mesa</button>
        </form>

        <section className="mt-8 rounded-[2rem] border border-green-100 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div><h2 className="text-2xl font-black">Mesas em atendimento</h2><p className="mt-1 text-sm text-stone-600">Cards de mesa para abrir o cardápio, conferir pedidos e orientar entrega/retirada. Se ainda não houver pedidos reais, aparecem exemplos para homologação.</p></div>
            <div className="grid gap-2 text-sm">
              <div className="flex flex-wrap gap-2"><FilterLink href="/gestao-evento/garcom?view=mesa" active={view === "mesa"}>Por mesa</FilterLink><FilterLink href="/gestao-evento/garcom?view=responsavel" active={view === "responsavel"}>Por responsável</FilterLink><FilterLink href="/gestao-evento/garcom?view=pedidos" active={view === "pedidos"}>Por pedidos</FilterLink></div>
              <div className="flex flex-wrap gap-2"><FilterLink href={`/gestao-evento/garcom?view=${view}&sort=mesa`} active={sort === "mesa"}>Ordenar por mesa</FilterLink><FilterLink href={`/gestao-evento/garcom?view=${view}&sort=responsavel`} active={sort === "responsavel"}>A-Z responsável</FilterLink><FilterLink href={`/gestao-evento/garcom?view=${view}&sort=cadastro`} active={sort === "cadastro"}>Ordem de cadastro</FilterLink></div>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {groups.map((group) => {
              const groupTotal = totalFromOrders(group.orders);
              return (
                <article key={group.key} className="relative overflow-hidden rounded-[2rem] border border-amber-200 bg-gradient-to-br from-amber-100 via-yellow-50 to-orange-50 p-5 shadow-sm">
                  <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-red-600/10" />
                  <div className="flex items-start justify-between gap-3">
                    <div><p className="text-xs font-black uppercase tracking-[0.16em] text-green-800">{group.demo ? "Exemplo de mesa" : "Mesa/atendimento"}</p><h3 className="mt-1 text-2xl font-black">{group.tableLabel}</h3><p className="mt-1 text-sm font-bold text-stone-700">Responsável: {group.responsible}</p></div>
                    <Wheat className="h-8 w-8 text-amber-700" />
                  </div>
                  <div className="mt-4 rounded-2xl bg-white/80 p-3 text-sm text-stone-700">
                    <p><strong>Garçom:</strong> {group.waiterName || "a definir"}</p>
                    <p><strong>Pagamento:</strong> {settlementLabel(group.settlementMode)}</p>
                    <p><strong>Pedidos:</strong> {group.orders.length}{group.demo ? " exemplo" : ""}</p>
                    <p><strong>Total:</strong> {group.demo ? "exemplo" : formatCurrency(groupTotal)}</p>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link href={cardapioUrl(event.slug, group.tableLabel, group.responsible, group.waiterName, group.settlementMode)} className="rounded-full bg-green-900 px-4 py-2 text-sm font-black text-white" prefetch={false}>Abrir cardápio desta mesa</Link>
                    {!group.demo && group.orders[0] ? <Link href={`/cardapio/${event.slug}/pedido/${group.orders[0].id}`} className="rounded-full bg-white px-4 py-2 text-sm font-black text-green-950 shadow-sm" prefetch={false}>Ver último pedido</Link> : null}
                    {!group.demo ? (
                      <form action={cancelConsumptionGroup}>
                        <input type="hidden" name="event_id" value={event.id} />
                        <input type="hidden" name="event_slug" value={event.slug} />
                        <input type="hidden" name="table_label" value={view === "responsavel" ? "" : group.tableLabel} />
                        <input type="hidden" name="responsible" value={group.responsible} />
                        <input type="hidden" name="return_to" value="/gestao-evento/garcom" />
                        <input type="hidden" name="reason" value="Mesa/responsável cancelado na tela Garçom/Atendimento." />
                        <button className="rounded-full bg-red-50 px-4 py-2 text-sm font-black text-red-800">Cancelar mesa/responsável</button>
                      </form>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <div className="mt-8 rounded-[2rem] border border-green-100 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div><h2 className="text-2xl font-black">Lista de pedidos</h2><p className="mt-1 text-sm text-stone-600">Mesa, cliente, itens, entrega e pagamento.</p></div>
            <div className="inline-flex items-center gap-2 rounded-full bg-stone-50 px-4 py-2 text-sm font-bold text-stone-600"><Search className="h-4 w-4" /> Use Ctrl+F para buscar</div>
          </div>
          <div className="mt-5 grid gap-4">
            {orders.map((order) => (
              <article key={order.id} className="rounded-3xl border border-green-100 bg-stone-50 p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div><p className="text-xs font-black uppercase tracking-[0.16em] text-green-800">Pedido {shortId(order.id)}</p><h3 className="mt-1 text-xl font-black">{order.customer_name || "Cliente sem nome"}{order.table_label ? ` · ${order.table_label}` : ""}</h3><p className="mt-1 text-sm text-stone-600">WhatsApp: {order.customer_phone || "não informado"}</p><p className="mt-1 text-sm text-stone-600">Garçom: {order.waiter_name || "não informado"} · {settlementLabel(order.settlement_mode)}</p></div>
                  <div className="flex flex-wrap gap-2 text-xs font-black"><span className={`rounded-full px-3 py-1 ${statusClass(order.status)}`}>{orderStatusLabel(order.status)}</span><span className={`rounded-full px-3 py-1 ${statusClass(order.delivery_status)}`}>Entrega: {deliveryStatusLabel(order.delivery_status)}</span><span className={`rounded-full px-3 py-1 ${statusClass(order.payment_status)}`}>Pagamento: {paymentStatusLabel(order.payment_status)}</span></div>
                </div>
                <div className="mt-4 grid gap-2 md:grid-cols-2">
                  {order.items.map((item) => <div key={item.id} className="rounded-2xl bg-white p-3 text-sm"><div className="flex items-start gap-2"><Utensils className="mt-0.5 h-4 w-4 text-green-800" /><div><strong>{item.item_name}</strong><p className="text-stone-600">{Number(item.quantity)} × {formatCurrency(item.unit_price)} = {formatCurrency(item.total_price)}</p></div></div></div>)}
                </div>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white p-4"><strong>Total: {formatCurrency(order.total_amount)}</strong><div className="flex flex-wrap gap-2"><Link href={`/cardapio/${event.slug}/pedido/${order.id}`} className="rounded-full bg-green-900 px-5 py-3 text-sm font-black text-white" prefetch={false}><ReceiptText className="mr-1 inline h-4 w-4" /> Abrir pedido</Link><form action={cancelConsumptionOrder}><input type="hidden" name="order_id" value={order.id} /><input type="hidden" name="event_slug" value={event.slug} /><input type="hidden" name="return_to" value="/gestao-evento/garcom" /><input type="hidden" name="reason" value="Pedido cancelado na tela Garçom/Atendimento." /><button className="rounded-full bg-red-50 px-5 py-3 text-sm font-black text-red-800">Cancelar pedido</button></form></div></div>
              </article>
            ))}
            {orders.length === 0 ? <div className="rounded-3xl border border-dashed border-green-200 bg-green-50 p-8 text-center text-sm text-stone-700">Nenhum pedido registrado ainda. Use os cards de exemplo acima para simular o atendimento.</div> : null}
          </div>
        </div>
      </section>
    </main>
  );
}
