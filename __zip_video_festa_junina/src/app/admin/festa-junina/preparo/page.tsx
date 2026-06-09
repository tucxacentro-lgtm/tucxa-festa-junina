import Link from "next/link";
import { ChefHat, Clock3 } from "lucide-react";
import { AdminPageShell } from "@/components/admin-page-shell";
import { requireAdmin } from "@/lib/auth";
import { getCurrentEventForAdmin } from "@/lib/current-event";
import { formatCurrency } from "@/lib/format";
import { getConsumptionOrdersForEvent, orderStatusLabel } from "@/lib/operation-dashboard";
import { updateConsumptionOrderStatus } from "../atendimento/actions";

export const dynamic = "force-dynamic";

export default async function PreparoPage() {
  await requireAdmin(["admin", "coordenador"], "/admin/festa-junina/preparo");
  const event = await getCurrentEventForAdmin();
  const orders = (await getConsumptionOrdersForEvent(event.id)).filter((order) => ["received", "preparing"].includes(order.status));

  return (
    <AdminPageShell>
      <section className="mx-auto max-w-6xl px-5 py-10">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3"><Link href="/admin/festa-junina" className="rounded-full bg-white px-4 py-2 text-sm font-bold text-green-950 shadow-sm" prefetch={false}>← Painel do evento</Link><a href="/admin/logout" className="rounded-full bg-white px-4 py-2 text-sm font-bold text-green-950 shadow-sm">Sair da gestão</a></div>
        <article className="rounded-[2rem] border border-green-100 bg-white p-6 shadow-sm">
          <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-black text-green-900">Atendimento · Preparo</span>
          <h1 className="mt-4 text-3xl font-black text-green-950">Fila de preparo</h1>
          <p className="mt-3 max-w-3xl text-stone-700">Pedidos recebidos ou em preparo. A cozinha pode marcar o início do preparo e sinalizar quando o pedido estiver pronto.</p>
          <div className="mt-5 grid gap-4 md:grid-cols-2"><div className="rounded-3xl bg-amber-50 p-5"><ChefHat className="h-6 w-6 text-green-800" /><p className="mt-2 text-3xl font-black text-green-950">{orders.length}</p><p className="text-sm text-stone-600">pedidos na fila</p></div><div className="rounded-3xl bg-amber-50 p-5"><Clock3 className="h-6 w-6 text-green-800" /><p className="mt-2 text-3xl font-black text-green-950">{orders.filter((order) => order.status === "preparing").length}</p><p className="text-sm text-stone-600">em preparo</p></div></div>
        </article>
        <div className="mt-6 grid gap-4">
          {orders.map((order) => (
            <div key={order.id} className="rounded-[2rem] bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-xl font-black text-green-950">{order.table_label || order.customer_name || `Pedido #${order.id.slice(0, 8)}`}</h2><p className="mt-1 text-sm text-stone-600">{orderStatusLabel(order.status)} · {new Date(order.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</p></div><strong className="text-xl text-green-950">{formatCurrency(order.total_amount)}</strong></div>
              <ul className="mt-4 grid gap-2 text-sm text-stone-700">{order.items.map((item) => <li key={item.id} className="rounded-2xl bg-stone-50 p-3"><strong>{Number(item.quantity)}x</strong> {item.item_name}</li>)}</ul>
              <div className="mt-4 flex flex-wrap gap-2"><form action={updateConsumptionOrderStatus}><input type="hidden" name="order_id" value={order.id} /><input type="hidden" name="status" value="preparing" /><button className="rounded-full bg-amber-100 px-4 py-2 text-xs font-black text-amber-950">Iniciar preparo</button></form><form action={updateConsumptionOrderStatus}><input type="hidden" name="order_id" value={order.id} /><input type="hidden" name="status" value="ready" /><button className="rounded-full bg-green-900 px-4 py-2 text-xs font-black text-white">Marcar pronto</button></form></div>
            </div>
          ))}
          {orders.length === 0 ? <div className="rounded-[2rem] bg-white p-8 text-center text-stone-500 shadow-sm">Não há pedidos aguardando preparo.</div> : null}
        </div>
      </section>
    </AdminPageShell>
  );
}
