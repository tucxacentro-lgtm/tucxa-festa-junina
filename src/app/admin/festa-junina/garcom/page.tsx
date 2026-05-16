import Link from "next/link";
import { ClipboardList, Search, Utensils } from "lucide-react";
import { AdminPageShell } from "@/components/admin-page-shell";
import { requireAdmin } from "@/lib/auth";
import { getCurrentEventForAdmin } from "@/lib/current-event";
import { formatCurrency } from "@/lib/format";
import { deliveryStatusLabel, getConsumptionOrdersForEvent, orderStatusLabel, paymentStatusLabel } from "@/lib/operation-dashboard";

export const dynamic = "force-dynamic";

function shortId(id: string) {
  return id.slice(0, 8).toUpperCase();
}

function statusClass(value: string) {
  if (value === "delivered" || value === "paid") return "bg-green-100 text-green-900";
  if (value === "ready" || value === "proof_sent" || value === "registered") return "bg-blue-100 text-blue-900";
  if (value === "preparing") return "bg-amber-100 text-amber-900";
  if (value === "cancelled") return "bg-red-100 text-red-900";
  return "bg-stone-100 text-stone-700";
}

export default async function GarcomPage() {
  await requireAdmin(["admin", "coordenador", "garcom"], "/admin/festa-junina/garcom");
  const event = await getCurrentEventForAdmin();
  const orders = await getConsumptionOrdersForEvent(event.id);
  const openOrders = orders.filter((order) => order.status !== "delivered" && order.status !== "cancelled");
  const deliveredOrders = orders.filter((order) => order.delivery_status === "delivered");
  const pendingDelivery = orders.filter((order) => order.delivery_status !== "delivered" && order.status !== "cancelled");

  return (
    <AdminPageShell>
      <section className="mx-auto max-w-7xl px-5 py-10">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link href="/admin/festa-junina" className="rounded-full bg-white px-5 py-3 text-sm font-black text-green-950 shadow-sm" prefetch={false}>← Painel de Gestão</Link>
          <Link href="/cardapio/arraia-tucxa-2026" className="rounded-full bg-green-900 px-5 py-3 text-sm font-black text-white shadow-sm" prefetch={false}>Abrir cardápio público</Link>
        </div>

        <div className="rounded-[2rem] border border-green-100 bg-white p-6 shadow-sm">
          <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-black text-green-900">Operação · Garçom</span>
          <h1 className="mt-4 text-3xl font-black text-green-950">Pedidos por mesa ou cliente</h1>
          <p className="mt-3 max-w-4xl text-stone-700">
            Use esta visão para acompanhar pedidos recebidos pelo cardápio, identificar mesa/responsável, conferir itens e orientar entrega ou retirada.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-3xl bg-amber-50 p-5"><p className="text-sm font-bold text-stone-600">Pedidos abertos</p><p className="mt-2 text-3xl font-black text-green-950">{openOrders.length}</p></div>
            <div className="rounded-3xl bg-amber-50 p-5"><p className="text-sm font-bold text-stone-600">Pendentes de entrega</p><p className="mt-2 text-3xl font-black text-green-950">{pendingDelivery.length}</p></div>
            <div className="rounded-3xl bg-amber-50 p-5"><p className="text-sm font-bold text-stone-600">Entregues</p><p className="mt-2 text-3xl font-black text-green-950">{deliveredOrders.length}</p></div>
          </div>
        </div>

        <div className="mt-8 rounded-[2rem] border border-green-100 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-black text-green-950">Lista de pedidos</h2>
              <p className="mt-1 text-sm text-stone-600">Mostra todos os pedidos com mesa/cliente e itens associados.</p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-stone-50 px-4 py-2 text-sm font-bold text-stone-600"><Search className="h-4 w-4" /> Use Ctrl+F para buscar mesa ou cliente</div>
          </div>

          <div className="mt-5 grid gap-4">
            {orders.map((order) => (
              <article key={order.id} className="rounded-3xl border border-green-100 bg-stone-50 p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-green-800">Pedido {shortId(order.id)}</p>
                    <h3 className="mt-1 text-xl font-black text-green-950">{order.customer_name || "Cliente sem nome"}{order.table_label ? ` · ${order.table_label}` : ""}</h3>
                    <p className="mt-1 text-sm text-stone-600">WhatsApp: {order.customer_phone || "não informado"}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs font-black">
                    <span className={`rounded-full px-3 py-1 ${statusClass(order.status)}`}>{orderStatusLabel(order.status)}</span>
                    <span className={`rounded-full px-3 py-1 ${statusClass(order.delivery_status)}`}>Entrega: {deliveryStatusLabel(order.delivery_status)}</span>
                    <span className={`rounded-full px-3 py-1 ${statusClass(order.payment_status)}`}>Pagamento: {paymentStatusLabel(order.payment_status)}</span>
                  </div>
                </div>

                <div className="mt-4 grid gap-2 md:grid-cols-2">
                  {order.items.map((item) => (
                    <div key={item.id} className="rounded-2xl bg-white p-3 text-sm">
                      <div className="flex items-start gap-2">
                        <Utensils className="mt-0.5 h-4 w-4 text-green-800" />
                        <div>
                          <strong className="text-green-950">{item.item_name}</strong>
                          <p className="text-stone-600">{Number(item.quantity)} × {formatCurrency(item.unit_price)} = {formatCurrency(item.total_price)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white p-4">
                  <div>
                    <p className="text-xs font-bold text-stone-500">Total do pedido</p>
                    <p className="text-2xl font-black text-green-950">{formatCurrency(order.total_amount)}</p>
                  </div>
                  <Link href={`/cardapio/arraia-tucxa-2026/pedido/${order.id}`} className="inline-flex items-center gap-2 rounded-2xl bg-green-900 px-5 py-3 text-sm font-black text-white" prefetch={false}>
                    <ClipboardList className="h-4 w-4" /> Abrir pedido
                  </Link>
                </div>
              </article>
            ))}

            {orders.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-green-200 bg-green-50 p-8 text-center text-sm text-stone-700">
                Nenhum pedido de consumo foi registrado ainda.
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </AdminPageShell>
  );
}
