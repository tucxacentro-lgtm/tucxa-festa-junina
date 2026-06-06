import Link from "next/link";
import { Download, FileSpreadsheet, ReceiptText } from "lucide-react";
import { AdminPageShell } from "@/components/admin-page-shell";
import { requireAdmin } from "@/lib/auth";
import { getCurrentEventForAdmin } from "@/lib/current-event";
import { formatCurrency } from "@/lib/format";
import {
  buildSalesSummary,
  getConsumptionOrdersForEvent,
  paidAmountFromOrder,
  paymentMethodLabel,
  pendingAmountFromOrder,
  totalFromOrders,
} from "@/lib/operation-dashboard";

export const dynamic = "force-dynamic";

function numeric(value: number | string | null | undefined) {
  const parsed = Number(String(value ?? 0).replace(",", "."));
  return Number.isFinite(parsed) ? parsed : 0;
}

function shortId(id: string) {
  return id.slice(0, 8).toUpperCase();
}

export default async function PrestacaoContasPage() {
  await requireAdmin(["admin", "coordenador", "caixa"], "/admin/festa-junina/prestacao-contas");
  const event = await getCurrentEventForAdmin();
  const orders = await getConsumptionOrdersForEvent(event.id, { includeCancelled: true });
  const activeOrders = orders.filter((order) => order.status !== "cancelled");
  const cancelledOrders = orders.filter((order) => order.status === "cancelled");
  const summary = buildSalesSummary(activeOrders);
  const cancelledTotal = totalFromOrders(cancelledOrders);

  const paymentTotals = new Map<string, number>();
  for (const order of activeOrders) {
    for (const payment of order.payments.filter((item) => item.status === "paid")) {
      paymentTotals.set(payment.method, (paymentTotals.get(payment.method) ?? 0) + numeric(payment.amount));
    }
  }

  const categoryTotals = new Map<string, { quantity: number; total: number }>();
  for (const order of activeOrders) {
    for (const item of order.items) {
      const category = item.item_name.includes("-") ? item.item_name.split("-")[0].trim() : "Cardápio";
      const current = categoryTotals.get(category) ?? { quantity: 0, total: 0 };
      current.quantity += numeric(item.quantity);
      current.total += numeric(item.total_price);
      categoryTotals.set(category, current);
    }
  }

  return (
    <AdminPageShell>
      <section className="mx-auto max-w-7xl px-5 py-10">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link href="/admin/festa-junina" className="rounded-full bg-white px-5 py-3 text-sm font-black text-green-950 shadow-sm" prefetch={false}>← Gestão</Link>
          <Link href="/admin/festa-junina/prestacao-contas/exportar-pedidos" className="inline-flex items-center gap-2 rounded-full bg-green-900 px-5 py-3 text-sm font-black text-white shadow-sm" prefetch={false}>
            <Download className="h-4 w-4" /> Exportar pedidos CSV
          </Link>
        </div>

        <div className="rounded-[2rem] border border-green-100 bg-white p-6 shadow-sm">
          <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-black text-green-900">Prestação de contas</span>
          <h1 className="mt-4 text-3xl font-black text-green-950">Relatório final do evento</h1>
          <p className="mt-3 max-w-4xl text-stone-700">
            Relatório em drill-down: começa no resumo geral e vai abrindo por forma de pagamento, categorias, itens, responsáveis e pedidos individuais. Use o CSV como plano B ou apoio para conferência em planilha.
          </p>
        </div>

        <section className="mt-8 grid gap-4 md:grid-cols-4">
          <div className="rounded-3xl bg-white p-5 shadow-sm"><p className="text-sm font-bold text-stone-600">Total vendido</p><p className="mt-2 text-3xl font-black text-green-950">{formatCurrency(summary.soldTotal)}</p></div>
          <div className="rounded-3xl bg-white p-5 shadow-sm"><p className="text-sm font-bold text-stone-600">Total pago</p><p className="mt-2 text-3xl font-black text-green-950">{formatCurrency(summary.paidTotal)}</p></div>
          <div className="rounded-3xl bg-white p-5 shadow-sm"><p className="text-sm font-bold text-stone-600">Total pendente</p><p className="mt-2 text-3xl font-black text-red-900">{formatCurrency(summary.pendingTotal)}</p></div>
          <div className="rounded-3xl bg-white p-5 shadow-sm"><p className="text-sm font-bold text-stone-600">Cancelado</p><p className="mt-2 text-3xl font-black text-stone-700">{formatCurrency(cancelledTotal)}</p></div>
        </section>

        <section className="mt-8 grid gap-4 lg:grid-cols-2">
          <details open className="rounded-[2rem] border border-green-100 bg-white p-6 shadow-sm">
            <summary className="cursor-pointer text-xl font-black text-green-950">1. Totais por forma de pagamento</summary>
            <div className="mt-4 grid gap-3">
              {Array.from(paymentTotals.entries()).sort((a, b) => b[1] - a[1]).map(([method, total]) => (
                <div key={method} className="flex items-center justify-between rounded-2xl bg-green-50 p-4"><span className="font-bold">{paymentMethodLabel(method)}</span><strong>{formatCurrency(total)}</strong></div>
              ))}
              {paymentTotals.size === 0 ? <p className="text-sm text-stone-600">Nenhum pagamento registrado.</p> : null}
            </div>
          </details>

          <details open className="rounded-[2rem] border border-green-100 bg-white p-6 shadow-sm">
            <summary className="cursor-pointer text-xl font-black text-green-950">2. Totais por categoria/resumo</summary>
            <div className="mt-4 grid gap-3">
              {Array.from(categoryTotals.entries()).sort((a, b) => b[1].total - a[1].total).map(([category, item]) => (
                <div key={category} className="flex items-center justify-between rounded-2xl bg-amber-50 p-4"><span className="font-bold">{category} · {item.quantity} un.</span><strong>{formatCurrency(item.total)}</strong></div>
              ))}
              {categoryTotals.size === 0 ? <p className="text-sm text-stone-600">Nenhum item registrado.</p> : null}
            </div>
          </details>
        </section>

        <details className="mt-8 rounded-[2rem] border border-green-100 bg-white p-6 shadow-sm">
          <summary className="cursor-pointer text-xl font-black text-green-950">3. Drill-down por item do cardápio</summary>
          <div className="mt-4 overflow-x-auto rounded-2xl border border-stone-100">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="bg-green-950 text-white"><tr><th className="p-3">Item</th><th className="p-3">Quantidade</th><th className="p-3">Total</th></tr></thead>
              <tbody className="divide-y divide-stone-100">
                {summary.itemDetails.map((item) => <tr key={item.itemName}><td className="p-3 font-bold">{item.itemName}</td><td className="p-3">{item.quantity}</td><td className="p-3 font-black">{formatCurrency(item.total)}</td></tr>)}
              </tbody>
            </table>
          </div>
        </details>

        <details className="mt-8 rounded-[2rem] border border-green-100 bg-white p-6 shadow-sm">
          <summary className="cursor-pointer text-xl font-black text-green-950">4. Drill-down por responsável e pedido</summary>
          <div className="mt-4 grid gap-4">
            {activeOrders.map((order) => (
              <details key={order.id} className="rounded-3xl border border-green-100 bg-stone-50 p-4">
                <summary className="cursor-pointer font-black text-green-950">
                  {order.customer_name || order.table_label || "Responsável não informado"} · Pedido {shortId(order.id)} · {formatCurrency(order.total_amount)}
                </summary>
                <div className="mt-3 grid gap-3 border-t border-green-100 pt-3 text-sm">
                  <p><strong>Garçom:</strong> {order.waiter_name || "não informado"}</p>
                  <p><strong>Pago:</strong> {formatCurrency(paidAmountFromOrder(order))} · <strong>Pendente:</strong> {formatCurrency(pendingAmountFromOrder(order))}</p>
                  <div className="grid gap-2 md:grid-cols-2">
                    {order.items.map((item) => <div key={item.id} className="rounded-2xl bg-white p-3"><strong>{item.item_name}</strong><p>{Number(item.quantity)} × {formatCurrency(item.unit_price)} = {formatCurrency(item.total_price)}</p></div>)}
                  </div>
                </div>
              </details>
            ))}
          </div>
        </details>

        <details className="mt-8 rounded-[2rem] border border-red-100 bg-white p-6 shadow-sm">
          <summary className="cursor-pointer text-xl font-black text-red-900">5. Cancelamentos e divergências</summary>
          <div className="mt-4 grid gap-3">
            <div className="rounded-2xl bg-red-50 p-4"><strong>Pedidos cancelados:</strong> {cancelledOrders.length} · <strong>Valor:</strong> {formatCurrency(cancelledTotal)}</div>
            {cancelledOrders.map((order) => <p key={order.id} className="text-sm text-stone-700">Pedido {shortId(order.id)} · {order.customer_name || "sem responsável"} · {formatCurrency(order.total_amount)} · {order.cancellation_reason || "sem motivo"}</p>)}
          </div>
        </details>

        <div className="mt-8 rounded-[2rem] border border-green-100 bg-green-50 p-6">
          <div className="flex items-center gap-3"><FileSpreadsheet className="h-6 w-6 text-green-900" /><h2 className="text-xl font-black text-green-950">Plano B operacional</h2></div>
          <p className="mt-2 text-sm text-stone-700">Se houver instabilidade no sistema durante a festa, exporte o CSV para ter uma cópia completa dos pedidos, itens, pagamentos e pendências.</p>
          <Link href="/admin/festa-junina/prestacao-contas/exportar-pedidos" className="mt-4 inline-flex items-center gap-2 rounded-full bg-green-900 px-5 py-3 text-sm font-black text-white" prefetch={false}><ReceiptText className="h-4 w-4" /> Baixar CSV completo</Link>
        </div>
      </section>
    </AdminPageShell>
  );
}
