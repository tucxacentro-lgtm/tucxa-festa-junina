import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { getCurrentEventForPublic } from "@/lib/current-event";
import { formatCurrency } from "@/lib/format";
import { getServiceResponsiblesForEvent, pendingFromOrders, totalFromOrders } from "@/lib/operation-dashboard";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ sessionId: string }> };

export default async function ResponsibleTrackingPage({ params }: PageProps) {
  const { sessionId } = await params;
  const event = await getCurrentEventForPublic();
  const rows = await getServiceResponsiblesForEvent(event.id);
  const row = rows.find((item) => item.id === sessionId);
  if (!row) notFound();

  return (
    <main className="min-h-screen bg-amber-50 text-green-950">
      <SiteHeader />
      <section className="mx-auto max-w-3xl px-5 py-8">
        <Link href="/gestao-evento" className="rounded-full bg-white px-5 py-3 text-sm font-black text-green-950 shadow-sm" prefetch={false}>← Voltar</Link>
        <div className="mt-6 rounded-[2rem] border border-green-100 bg-white p-6 shadow-sm">
          <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-black text-green-900">Acompanhamento</span>
          <h1 className="mt-4 text-3xl font-black">{row.responsibleName}</h1>
          <p className="mt-2 text-stone-700">Acompanhe os pedidos registrados para este responsável. Em caso de dúvida, procure a coordenação.</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-3xl bg-amber-50 p-4"><p className="text-xs font-bold text-stone-600">Pedidos</p><p className="mt-1 text-2xl font-black">{row.orders.length}</p></div>
            <div className="rounded-3xl bg-green-50 p-4"><p className="text-xs font-bold text-stone-600">Total</p><p className="mt-1 text-2xl font-black">{formatCurrency(totalFromOrders(row.orders))}</p></div>
            <div className="rounded-3xl bg-red-50 p-4"><p className="text-xs font-bold text-stone-600">Pendente</p><p className="mt-1 text-2xl font-black">{formatCurrency(pendingFromOrders(row.orders))}</p></div>
          </div>
        </div>
        <div className="mt-5 grid gap-3">
          {row.orders.map((order) => (
            <article key={order.id} className="rounded-[1.5rem] border border-green-100 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div><p className="font-black">Pedido {order.id.slice(0, 8).toUpperCase()}</p><p className="mt-1 text-sm text-stone-600">Garçom: {order.waiter_name || row.waiterName || "—"}</p></div>
                <strong>{formatCurrency(order.total_amount)}</strong>
              </div>
              <ul className="mt-4 space-y-2 text-sm text-stone-700">
                {order.items.map((item) => <li key={item.id}>{Number(item.quantity)} × {item.item_name} · {formatCurrency(item.total_price)}</li>)}
              </ul>
              <p className="mt-4 rounded-2xl bg-amber-50 p-3 text-sm text-amber-950">Pagamento: {order.payment_status === "paid" ? "pago" : "pendente"}</p>
            </article>
          ))}
          {row.orders.length === 0 ? <div className="rounded-3xl bg-white p-8 text-center text-sm text-stone-600 shadow-sm">Nenhum pedido registrado ainda.</div> : null}
        </div>
      </section>
    </main>
  );
}
