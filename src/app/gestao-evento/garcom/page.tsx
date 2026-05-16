import Link from "next/link";
import { Search, Utensils } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { getCurrentEventForPublic } from "@/lib/current-event";
import { formatCurrency } from "@/lib/format";
import { deliveryStatusLabel, getConsumptionOrdersForEvent, orderStatusLabel, paymentStatusLabel } from "@/lib/operation-dashboard";

export const dynamic = "force-dynamic";

function shortId(id: string) { return id.slice(0, 8).toUpperCase(); }
function statusClass(value: string) {
  if (value === "delivered" || value === "paid") return "bg-green-100 text-green-900";
  if (value === "ready" || value === "proof_sent" || value === "registered") return "bg-blue-100 text-blue-900";
  if (value === "preparing") return "bg-amber-100 text-amber-900";
  if (value === "cancelled") return "bg-red-100 text-red-900";
  return "bg-stone-100 text-stone-700";
}

export default async function GarcomPublicPage() {
  const event = await getCurrentEventForPublic();
  const orders = await getConsumptionOrdersForEvent(event.id);
  const openOrders = orders.filter((order) => order.status !== "delivered" && order.status !== "cancelled");
  const deliveredOrders = orders.filter((order) => order.delivery_status === "delivered");
  const pendingDelivery = orders.filter((order) => order.delivery_status !== "delivered" && order.status !== "cancelled");

  return (
    <main className="min-h-screen bg-amber-50 text-green-950">
      <SiteHeader />
      <section className="mx-auto max-w-7xl px-5 py-10">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link href="/gestao-evento" className="rounded-full bg-white px-5 py-3 text-sm font-black text-green-950 shadow-sm" prefetch={false}>← Gestão do Evento</Link>
          <Link href="/cardapio/arraia-tucxa-2026" className="rounded-full bg-green-900 px-5 py-3 text-sm font-black text-white shadow-sm" prefetch={false}>Abrir cardápio</Link>
        </div>

        <div className="rounded-[2rem] border border-green-100 bg-white p-6 shadow-sm">
          <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-black text-green-900">Operação · Garçom</span>
          <h1 className="mt-4 text-3xl font-black">Pedidos por mesa ou cliente</h1>
          <p className="mt-3 max-w-4xl text-stone-700">Acompanhe pedidos recebidos pelo cardápio, identifique mesa/responsável, confira itens e organize entrega ou retirada.</p>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-3xl bg-amber-50 p-5"><p className="text-sm font-bold text-stone-600">Pedidos abertos</p><p className="mt-2 text-3xl font-black">{openOrders.length}</p></div>
            <div className="rounded-3xl bg-amber-50 p-5"><p className="text-sm font-bold text-stone-600">Pendentes de entrega</p><p className="mt-2 text-3xl font-black">{pendingDelivery.length}</p></div>
            <div className="rounded-3xl bg-amber-50 p-5"><p className="text-sm font-bold text-stone-600">Entregues</p><p className="mt-2 text-3xl font-black">{deliveredOrders.length}</p></div>
          </div>
        </div>

        <div className="mt-8 rounded-[2rem] border border-green-100 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div><h2 className="text-2xl font-black">Lista de pedidos</h2><p className="mt-1 text-sm text-stone-600">Mesa, cliente, itens, entrega e pagamento.</p></div>
            <div className="inline-flex items-center gap-2 rounded-full bg-stone-50 px-4 py-2 text-sm font-bold text-stone-600"><Search className="h-4 w-4" /> Use Ctrl+F para buscar</div>
          </div>
          <div className="mt-5 grid gap-4">
            {orders.map((order) => (
              <article key={order.id} className="rounded-3xl border border-green-100 bg-stone-50 p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div><p className="text-xs font-black uppercase tracking-[0.16em] text-green-800">Pedido {shortId(order.id)}</p><h3 className="mt-1 text-xl font-black">{order.customer_name || "Cliente sem nome"}{order.table_label ? ` · ${order.table_label}` : ""}</h3><p className="mt-1 text-sm text-stone-600">WhatsApp: {order.customer_phone || "não informado"}</p></div>
                  <div className="flex flex-wrap gap-2 text-xs font-black"><span className={`rounded-full px-3 py-1 ${statusClass(order.status)}`}>{orderStatusLabel(order.status)}</span><span className={`rounded-full px-3 py-1 ${statusClass(order.delivery_status)}`}>Entrega: {deliveryStatusLabel(order.delivery_status)}</span><span className={`rounded-full px-3 py-1 ${statusClass(order.payment_status)}`}>Pagamento: {paymentStatusLabel(order.payment_status)}</span></div>
                </div>
                <div className="mt-4 grid gap-2 md:grid-cols-2">
                  {order.items.map((item) => <div key={item.id} className="rounded-2xl bg-white p-3 text-sm"><div className="flex items-start gap-2"><Utensils className="mt-0.5 h-4 w-4 text-green-800" /><div><strong>{item.item_name}</strong><p className="text-stone-600">{Number(item.quantity)} × {formatCurrency(item.unit_price)} = {formatCurrency(item.total_price)}</p></div></div></div>)}
                </div>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white p-4"><strong>Total: {formatCurrency(order.total_amount)}</strong><Link href={`/cardapio/arraia-tucxa-2026/pedido/${order.id}`} className="rounded-full bg-green-900 px-5 py-3 text-sm font-black text-white" prefetch={false}>Abrir pedido</Link></div>
              </article>
            ))}
            {orders.length === 0 ? <div className="rounded-3xl border border-dashed border-green-200 bg-green-50 p-8 text-center text-sm text-stone-700">Nenhum pedido registrado ainda.</div> : null}
          </div>
        </div>
      </section>
    </main>
  );
}
