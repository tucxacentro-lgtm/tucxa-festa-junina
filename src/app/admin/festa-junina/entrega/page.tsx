import Link from "next/link";
import { Bike, CheckCircle2 } from "lucide-react";
import { AdminPageShell } from "@/components/admin-page-shell";
import { requireAdmin } from "@/lib/auth";
import { getCurrentEventForAdmin } from "@/lib/current-event";
import { formatCurrency } from "@/lib/format";
import { deliveryStatusLabel, getConsumptionOrdersForEvent, paymentStatusLabel } from "@/lib/operation-dashboard";
import { updateConsumptionOrderStatus } from "../atendimento/actions";

export const dynamic = "force-dynamic";

export default async function EntregaPage() {
  await requireAdmin(["admin", "coordenador"], "/admin/festa-junina/entrega");
  const event = await getCurrentEventForAdmin();
  const allOrders = await getConsumptionOrdersForEvent(event.id);
  const orders = allOrders.filter((order) => order.status === "ready" || order.delivery_status === "delivered");
  const delivered = orders.filter((order) => order.delivery_status === "delivered").length;

  return (
    <AdminPageShell>
      <section className="mx-auto max-w-6xl px-5 py-10">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link href="/admin/festa-junina" className="rounded-full bg-white px-4 py-2 text-sm font-bold text-green-950 shadow-sm" prefetch={false}>← Painel do evento</Link>
          <a href="/admin/logout" className="rounded-full bg-white px-4 py-2 text-sm font-bold text-green-950 shadow-sm">Sair da gestão</a>
        </div>
        <article className="rounded-[2rem] border border-green-100 bg-white p-6 shadow-sm">
          <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-black text-green-900">Atendimento · Entrega</span>
          <h1 className="mt-4 text-3xl font-black text-green-950">Entrega em mesa</h1>
          <p className="mt-3 max-w-3xl text-stone-700">Pedidos prontos para entrega ou já entregues. Confira mesa/responsável e registre a entrega para evitar duplicidade.</p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl bg-amber-50 p-5"><Bike className="h-6 w-6 text-green-800" /><p className="mt-2 text-3xl font-black text-green-950">{orders.length}</p><p className="text-sm text-stone-600">pedidos na tela</p></div>
            <div className="rounded-3xl bg-green-50 p-5"><CheckCircle2 className="h-6 w-6 text-green-800" /><p className="mt-2 text-3xl font-black text-green-950">{delivered}</p><p className="text-sm text-stone-600">entregues</p></div>
          </div>
        </article>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {orders.map((order) => (
            <article key={order.id} className="rounded-[2rem] bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3"><div><h2 className="text-xl font-black text-green-950">{order.table_label || order.customer_name || `Pedido #${order.id.slice(0, 8)}`}</h2><p className="mt-1 text-sm text-stone-600">{order.customer_name || "Cliente não informado"} · {order.customer_phone || "WhatsApp não informado"}</p></div><strong>{formatCurrency(order.total_amount)}</strong></div>
              <div className="mt-4 grid gap-2 text-sm"><span className="rounded-2xl bg-stone-50 p-3"><strong>Entrega:</strong> {deliveryStatusLabel(order.delivery_status)}</span><span className="rounded-2xl bg-stone-50 p-3"><strong>Pagamento:</strong> {paymentStatusLabel(order.payment_status)}</span></div>
              <ul className="mt-4 grid gap-2 text-sm text-stone-700">{order.items.map((item) => <li key={item.id} className="rounded-2xl bg-stone-50 p-3"><strong>{Number(item.quantity)}x</strong> {item.item_name}</li>)}</ul>
              {order.delivery_status !== "delivered" ? <form action={updateConsumptionOrderStatus} className="mt-4"><input type="hidden" name="order_id" value={order.id} /><input type="hidden" name="status" value="delivered" /><input type="hidden" name="delivery_status" value="delivered" /><button className="w-full rounded-2xl bg-green-900 px-4 py-3 text-sm font-black text-white">Confirmar entrega</button></form> : null}
            </article>
          ))}
          {orders.length === 0 ? <div className="rounded-[2rem] bg-white p-8 text-center text-stone-500 shadow-sm md:col-span-2">Não há pedidos prontos para entrega.</div> : null}
        </div>
      </section>
    </AdminPageShell>
  );
}
