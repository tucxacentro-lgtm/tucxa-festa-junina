import Link from "next/link";
import { PackageCheck } from "lucide-react";
import { AdminPageShell } from "@/components/admin-page-shell";
import { requireAdmin } from "@/lib/auth";
import { getCurrentEventForAdmin } from "@/lib/current-event";
import { formatCurrency } from "@/lib/format";
import { getConsumptionOrdersForEvent, paymentStatusLabel } from "@/lib/operation-dashboard";
import { updateConsumptionOrderStatus } from "../atendimento/actions";

export const dynamic = "force-dynamic";

export default async function RetiradaPage() {
  await requireAdmin(["admin", "coordenador"], "/admin/festa-junina/retirada");
  const event = await getCurrentEventForAdmin();
  const orders = (await getConsumptionOrdersForEvent(event.id)).filter((order) => order.status === "ready" && order.delivery_status !== "delivered");

  return (
    <AdminPageShell>
      <section className="mx-auto max-w-6xl px-5 py-10">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3"><Link href="/admin/festa-junina" className="rounded-full bg-white px-4 py-2 text-sm font-bold text-green-950 shadow-sm" prefetch={false}>← Painel do evento</Link><a href="/admin/logout" className="rounded-full bg-white px-4 py-2 text-sm font-bold text-green-950 shadow-sm">Sair da gestão</a></div>
        <article className="rounded-[2rem] border border-green-100 bg-white p-6 shadow-sm"><span className="rounded-full bg-green-50 px-3 py-1 text-xs font-black text-green-900">Atendimento · Retirada</span><h1 className="mt-4 text-3xl font-black text-green-950">Retirada no balcão</h1><p className="mt-3 max-w-3xl text-stone-700">Pedidos prontos aguardando retirada pelo cliente ou responsável. Confira número, nome e mesa antes de entregar.</p><div className="mt-5 rounded-3xl bg-amber-50 p-5"><PackageCheck className="h-6 w-6 text-green-800" /><p className="mt-2 text-3xl font-black text-green-950">{orders.length}</p><p className="text-sm text-stone-600">pedidos prontos aguardando retirada</p></div></article>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {orders.map((order) => <article key={order.id} className="rounded-[2rem] bg-white p-5 shadow-sm"><h2 className="text-xl font-black text-green-950">{order.table_label || order.customer_name || `Pedido #${order.id.slice(0, 8)}`}</h2><p className="mt-1 text-sm text-stone-600">{order.customer_name || "Cliente não informado"} · {paymentStatusLabel(order.payment_status)}</p><p className="mt-3 text-2xl font-black text-green-950">{formatCurrency(order.total_amount)}</p><ul className="mt-4 grid gap-2 text-sm text-stone-700">{order.items.map((item) => <li key={item.id} className="rounded-2xl bg-stone-50 p-3"><strong>{Number(item.quantity)}x</strong> {item.item_name}</li>)}</ul><form action={updateConsumptionOrderStatus} className="mt-4"><input type="hidden" name="order_id" value={order.id} /><input type="hidden" name="status" value="delivered" /><input type="hidden" name="delivery_status" value="delivered" /><button className="w-full rounded-2xl bg-green-900 px-4 py-3 text-sm font-black text-white">Confirmar retirada</button></form></article>)}
          {orders.length === 0 ? <div className="rounded-[2rem] bg-white p-8 text-center text-stone-500 shadow-sm md:col-span-2">Não há pedidos prontos aguardando retirada.</div> : null}
        </div>
      </section>
    </AdminPageShell>
  );
}
