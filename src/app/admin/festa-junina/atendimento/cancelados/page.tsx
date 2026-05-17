import Link from "next/link";
import { RotateCcw, Ban, Utensils } from "lucide-react";
import { AdminPageShell } from "@/components/admin-page-shell";
import { requireAdmin } from "@/lib/auth";
import { getCurrentEventForAdmin } from "@/lib/current-event";
import { formatCurrency } from "@/lib/format";
import { deliveryStatusLabel, getConsumptionOrdersForEvent, orderStatusLabel, paymentStatusLabel } from "@/lib/operation-dashboard";
import { reactivateConsumptionOrder } from "./actions";

export const dynamic = "force-dynamic";

type PageProps = { searchParams?: Promise<{ restaurado?: string }> };

function shortId(id: string) {
  return id.slice(0, 8).toUpperCase();
}

export default async function CancelledConsumptionOrdersPage({ searchParams }: PageProps) {
  await requireAdmin(["admin", "coordenador"], "/admin/festa-junina/atendimento/cancelados");
  const params = await searchParams;
  const event = await getCurrentEventForAdmin();
  const orders = (await getConsumptionOrdersForEvent(event.id, { includeCancelled: true })).filter((order) => order.status === "cancelled");
  const totalCancelled = orders.reduce((sum, order) => sum + Number(order.total_amount ?? 0), 0);

  return (
    <AdminPageShell>
      <section className="mx-auto max-w-7xl px-5 py-10">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link href="/admin/festa-junina/atendimento" className="rounded-full bg-white px-5 py-3 text-sm font-black text-green-950 shadow-sm" prefetch={false}>
            ← Atendimento
          </Link>
          <Link href="/gestao-evento/garcom" className="rounded-full bg-green-900 px-5 py-3 text-sm font-black text-white shadow-sm" prefetch={false}>
            Ir para Garçom/Atendimento
          </Link>
        </div>

        <div className="rounded-[2rem] border border-green-100 bg-white p-6 shadow-sm">
          <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-black text-red-900">Atendimento · Cancelados</span>
          <h1 className="mt-4 text-3xl font-black text-green-950">Mesas, responsáveis e pedidos cancelados</h1>
          <p className="mt-3 max-w-4xl text-stone-700">
            Pedidos cancelados não aparecem nas telas operacionais de Garçom/Atendimento e Caixa. Esta tela logada mantém o histórico para auditoria, revisão e eventual restauração.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-3xl bg-red-50 p-5"><p className="text-sm font-bold text-stone-600">Pedidos cancelados</p><p className="mt-2 text-3xl font-black text-red-900">{orders.length}</p></div>
            <div className="rounded-3xl bg-amber-50 p-5"><p className="text-sm font-bold text-stone-600">Valor cancelado</p><p className="mt-2 text-3xl font-black text-green-950">{formatCurrency(totalCancelled)}</p></div>
            <div className="rounded-3xl bg-stone-50 p-5"><p className="text-sm font-bold text-stone-600">Evento</p><p className="mt-2 text-xl font-black text-green-950">{event.name}</p></div>
          </div>
        </div>

        {params?.restaurado ? (
          <div className="mt-5 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm font-bold text-green-900">Pedido restaurado para a operação.</div>
        ) : null}

        <div className="mt-8 grid gap-4">
          {orders.map((order) => (
            <article key={order.id} className="rounded-[2rem] border border-red-100 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-red-800"><Ban className="mr-1 inline h-4 w-4" /> Pedido {shortId(order.id)}</p>
                  <h2 className="mt-1 text-2xl font-black text-green-950">{order.table_label || "Sem mesa"} · {order.customer_name || "Responsável não informado"}</h2>
                  <p className="mt-1 text-sm text-stone-600">Garçom: {order.waiter_name || "não informado"} · WhatsApp: {order.customer_phone || "não informado"}</p>
                  <p className="mt-1 text-sm text-stone-600">Motivo: {order.cancellation_reason || "não informado"}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-stone-500">Total cancelado</p>
                  <p className="text-2xl font-black text-green-950">{formatCurrency(order.total_amount)}</p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2 text-xs font-black">
                <span className="rounded-full bg-red-100 px-3 py-1 text-red-900">{orderStatusLabel(order.status)}</span>
                <span className="rounded-full bg-red-100 px-3 py-1 text-red-900">Entrega: {deliveryStatusLabel(order.delivery_status)}</span>
                <span className="rounded-full bg-red-100 px-3 py-1 text-red-900">Pagamento: {paymentStatusLabel(order.payment_status)}</span>
              </div>

              <div className="mt-4 grid gap-2 md:grid-cols-2">
                {order.items.map((item) => (
                  <div key={item.id} className="rounded-2xl bg-stone-50 p-3 text-sm">
                    <div className="flex items-start gap-2">
                      <Utensils className="mt-0.5 h-4 w-4 text-green-800" />
                      <div><strong>{item.item_name}</strong><p className="text-stone-600">{Number(item.quantity)} × {formatCurrency(item.unit_price)} = {formatCurrency(item.total_price)}</p></div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <Link href={`/cardapio/${event.slug}/pedido/${order.id}`} className="rounded-full bg-white px-5 py-3 text-sm font-black text-green-950 shadow-sm" prefetch={false}>Abrir pedido</Link>
                <form action={reactivateConsumptionOrder}>
                  <input type="hidden" name="order_id" value={order.id} />
                  <button className="inline-flex items-center gap-2 rounded-full bg-green-900 px-5 py-3 text-sm font-black text-white"><RotateCcw className="h-4 w-4" /> Restaurar pedido</button>
                </form>
              </div>
            </article>
          ))}
          {orders.length === 0 ? (
            <div className="rounded-[2rem] border border-dashed border-green-200 bg-green-50 p-8 text-center text-sm text-stone-700">
              Nenhum pedido cancelado no momento.
            </div>
          ) : null}
        </div>
      </section>
    </AdminPageShell>
  );
}
