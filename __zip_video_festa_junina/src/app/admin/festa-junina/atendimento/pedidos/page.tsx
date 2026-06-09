import Link from "next/link";
import { ClipboardList, CreditCard, Truck } from "lucide-react";
import { AdminPageShell } from "@/components/admin-page-shell";
import { requireAdmin } from "@/lib/auth";
import { getCurrentEventForAdmin } from "@/lib/current-event";
import { formatCurrency } from "@/lib/format";
import { deliveryStatusLabel, getConsumptionOrdersForEvent, orderStatusLabel, paymentStatusLabel } from "@/lib/operation-dashboard";
import { updateConsumptionOrderStatus } from "../actions";

export const dynamic = "force-dynamic";

export default async function AtendimentoPedidosPage() {
  await requireAdmin(["admin", "coordenador", "caixa"], "/admin/festa-junina/atendimento/pedidos");
  const event = await getCurrentEventForAdmin();
  const orders = await getConsumptionOrdersForEvent(event.id);
  const pendingDelivery = orders.filter((order) => order.delivery_status !== "delivered" && order.status !== "cancelled").length;
  const pendingPayment = orders.filter((order) => order.payment_status !== "paid" && order.status !== "cancelled").length;

  return (
    <AdminPageShell>
      <section className="mx-auto max-w-7xl px-5 py-10">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link href="/admin/festa-junina" className="rounded-full bg-white px-4 py-2 text-sm font-bold text-green-950 shadow-sm" prefetch={false}>← Painel do evento</Link>
          <a href="/admin/logout" className="rounded-full bg-white px-4 py-2 text-sm font-bold text-green-950 shadow-sm">Sair da gestão</a>
        </div>
        <div className="rounded-[2rem] border border-green-100 bg-white p-6 shadow-sm">
          <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-black text-green-900">Atendimento · Pedidos</span>
          <h1 className="mt-4 text-3xl font-black text-green-950">Pedidos de consumo</h1>
          <p className="mt-3 max-w-3xl text-stone-700">Visão administrativa dos pedidos do cardápio no dia do evento: mesa, responsável, itens, entrega e pagamento.</p>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl bg-white p-5 shadow-sm"><ClipboardList className="h-6 w-6 text-green-800" /><p className="mt-2 text-3xl font-black text-green-950">{orders.length}</p><p className="text-sm text-stone-600">pedidos</p></div>
          <div className="rounded-3xl bg-white p-5 shadow-sm"><Truck className="h-6 w-6 text-green-800" /><p className="mt-2 text-3xl font-black text-green-950">{pendingDelivery}</p><p className="text-sm text-stone-600">entregas pendentes</p></div>
          <div className="rounded-3xl bg-white p-5 shadow-sm"><CreditCard className="h-6 w-6 text-green-800" /><p className="mt-2 text-3xl font-black text-green-950">{pendingPayment}</p><p className="text-sm text-stone-600">pagamentos pendentes</p></div>
        </div>
        <div className="mt-6 grid gap-4">
          {orders.map((order) => (
            <article key={order.id} className="rounded-[2rem] border border-green-100 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-black text-green-950">Pedido #{order.id.slice(0, 8)} · {order.table_label || order.customer_name || "Sem identificação"}</h2>
                  <p className="mt-1 text-sm text-stone-600">{order.customer_name || "Cliente não informado"} · {order.customer_phone || "WhatsApp não informado"}</p>
                </div>
                <div className="text-right"><p className="text-2xl font-black text-green-950">{formatCurrency(order.total_amount)}</p><p className="text-xs text-stone-500">{new Date(order.created_at).toLocaleString("pt-BR")}</p></div>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <span className="rounded-2xl bg-stone-50 px-4 py-3 text-sm"><strong>Status:</strong> {orderStatusLabel(order.status)}</span>
                <span className="rounded-2xl bg-stone-50 px-4 py-3 text-sm"><strong>Entrega:</strong> {deliveryStatusLabel(order.delivery_status)}</span>
                <span className="rounded-2xl bg-stone-50 px-4 py-3 text-sm"><strong>Pagamento:</strong> {paymentStatusLabel(order.payment_status)}</span>
              </div>
              <div className="mt-4 overflow-x-auto rounded-2xl border border-stone-100">
                <table className="w-full min-w-[720px] text-left text-sm"><thead className="bg-green-950 text-white"><tr><th className="p-3">Item</th><th className="p-3">Qtd.</th><th className="p-3">Valor unit.</th><th className="p-3">Total</th></tr></thead><tbody>{order.items.map((item) => <tr key={item.id} className="border-b border-stone-100 last:border-0"><td className="p-3 font-bold">{item.item_name}</td><td className="p-3">{Number(item.quantity)}</td><td className="p-3">{formatCurrency(item.unit_price)}</td><td className="p-3 font-bold">{formatCurrency(item.total_price)}</td></tr>)}</tbody></table>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <form action={updateConsumptionOrderStatus}><input type="hidden" name="order_id" value={order.id} /><input type="hidden" name="status" value="preparing" /><button className="rounded-full bg-amber-100 px-4 py-2 text-xs font-black text-amber-950">Marcar em preparo</button></form>
                <form action={updateConsumptionOrderStatus}><input type="hidden" name="order_id" value={order.id} /><input type="hidden" name="status" value="ready" /><button className="rounded-full bg-blue-100 px-4 py-2 text-xs font-black text-blue-950">Marcar pronto</button></form>
                <form action={updateConsumptionOrderStatus}><input type="hidden" name="order_id" value={order.id} /><input type="hidden" name="status" value="delivered" /><input type="hidden" name="delivery_status" value="delivered" /><button className="rounded-full bg-green-900 px-4 py-2 text-xs font-black text-white">Marcar entregue</button></form>
              </div>
            </article>
          ))}
          {orders.length === 0 ? <div className="rounded-[2rem] bg-white p-8 text-center text-stone-500 shadow-sm">Nenhum pedido de consumo registrado ainda.</div> : null}
        </div>
      </section>
    </AdminPageShell>
  );
}
