import Link from "next/link";
import {
  ArrowDownUp,
  Download,
  FileText,
  FileSpreadsheet,
  ReceiptText,
} from "lucide-react";
import { AdminPageShell } from "@/components/admin-page-shell";
import { requireAdmin } from "@/lib/auth";
import { getCurrentEventForAdmin } from "@/lib/current-event";
import { formatCurrency } from "@/lib/format";
import {
  buildCategorySummary,
  buildPeriodCategorySummary,
  buildPaymentMethodSummary,
  buildSalesSummary,
  getConsumptionOrdersForEvent,
  totalFromOrders,
} from "@/lib/operation-dashboard";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams?: Promise<{
    ordenar?: "quantidade" | "valor";
  }>;
};


function sortLink(orderBy: "quantidade" | "valor") {
  return `/admin/festa-junina/prestacao-contas?ordenar=${orderBy}`;
}

export default async function PrestacaoContasPage({ searchParams }: PageProps) {
  await requireAdmin(
    ["admin", "coordenador", "caixa"],
    "/admin/festa-junina/prestacao-contas",
  );
  const params = await searchParams;
  const orderBy = params?.ordenar === "quantidade" ? "quantidade" : "valor";
  const event = await getCurrentEventForAdmin();
  const orders = await getConsumptionOrdersForEvent(event.id, {
    includeCancelled: true,
  });
  const activeOrders = orders.filter((order) => order.status !== "cancelled");
  const cancelledOrders = orders.filter(
    (order) => order.status === "cancelled",
  );
  const summary = buildSalesSummary(activeOrders);
  const paymentTotals = buildPaymentMethodSummary(activeOrders);
  const categoryTotals = buildCategorySummary(activeOrders);
  const cancelledTotal = totalFromOrders(cancelledOrders);
  const sortedItems = [...summary.itemDetails].sort((a, b) =>
    orderBy === "quantidade" ? b.quantity - a.quantity : b.total - a.total,
  );
  const periodCategoryTotals = buildPeriodCategorySummary(activeOrders);

  return (
    <AdminPageShell>
      <section className="mx-auto max-w-7xl px-5 py-10">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/admin/festa-junina"
            className="rounded-full bg-white px-5 py-3 text-sm font-black text-green-950 shadow-sm"
            prefetch={false}
          >
            ← Gestão
          </Link>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/admin/festa-junina/prestacao-contas/gerar-pdf"
              target="_blank"
              className="inline-flex items-center gap-2 rounded-full bg-amber-500 px-5 py-3 text-sm font-black text-amber-950 shadow-sm"
              prefetch={false}
            >
              <FileText className="h-4 w-4" /> Gerar PDF do relatório
            </Link>
            <Link
              href="/admin/festa-junina/prestacao-contas/exportar-pedidos"
              className="inline-flex items-center gap-2 rounded-full bg-green-900 px-5 py-3 text-sm font-black text-white shadow-sm"
              prefetch={false}
            >
              <Download className="h-4 w-4" /> Exportar pedidos CSV
            </Link>
          </div>
        </div>

        <div className="rounded-[2rem] border border-green-100 bg-white p-6 shadow-sm">
          <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-black text-green-900">
            Prestação de contas
          </span>
          <h1 className="mt-4 text-3xl font-black text-green-950">
            Relatório final do evento
          </h1>
          <p className="mt-3 max-w-4xl text-stone-700">
            Relatório em drill-down: começa no resumo geral e abre por forma de
            pagamento, categorias, itens vendidos, ranking por quantidade/valor
            e vendas por períodos de 60 minutos.
          </p>
        </div>

        <section className="mt-8 grid gap-4 md:grid-cols-4">
          <div className="rounded-3xl bg-white p-5 shadow-sm">
            <p className="text-sm font-bold text-stone-600">Total vendido</p>
            <p className="mt-2 text-3xl font-black text-green-950">
              {formatCurrency(summary.soldTotal)}
            </p>
          </div>
          <div className="rounded-3xl bg-white p-5 shadow-sm">
            <p className="text-sm font-bold text-stone-600">Total pago</p>
            <p className="mt-2 text-3xl font-black text-green-950">
              {formatCurrency(summary.paidTotal)}
            </p>
          </div>
          <div className="rounded-3xl bg-white p-5 shadow-sm">
            <p className="text-sm font-bold text-stone-600">Total pendente</p>
            <p className="mt-2 text-3xl font-black text-red-900">
              {formatCurrency(summary.pendingTotal)}
            </p>
          </div>
          <div className="rounded-3xl bg-white p-5 shadow-sm">
            <p className="text-sm font-bold text-stone-600">Cancelado</p>
            <p className="mt-2 text-3xl font-black text-stone-700">
              {formatCurrency(cancelledTotal)}
            </p>
          </div>
        </section>

        <section className="mt-8 grid gap-4 lg:grid-cols-2">
          <details
            open
            className="rounded-[2rem] border border-green-100 bg-white p-6 shadow-sm"
          >
            <summary className="cursor-pointer text-xl font-black text-green-950">
              1. Totais por forma de pagamento
            </summary>
            <div className="mt-4 grid gap-3">
              {paymentTotals.map((item) => (
                <div
                  key={item.method}
                  className="flex items-center justify-between rounded-2xl bg-green-50 p-4"
                >
                  <span className="font-bold">{item.label}</span>
                  <strong>{formatCurrency(item.total)}</strong>
                </div>
              ))}
              {paymentTotals.length === 0 ? (
                <p className="text-sm text-stone-600">
                  Nenhum pagamento registrado com forma identificada. Confira se
                  os pagamentos foram registrados no caixa.
                </p>
              ) : null}
            </div>
          </details>

          <details
            open
            className="rounded-[2rem] border border-green-100 bg-white p-6 shadow-sm"
          >
            <summary className="cursor-pointer text-xl font-black text-green-950">
              2. Totais por categoria/resumo
            </summary>
            <div className="mt-4 grid gap-3">
              {categoryTotals.map((item) => (
                <div
                  key={item.category}
                  className="flex items-center justify-between rounded-2xl bg-amber-50 p-4"
                >
                  <span className="font-bold">
                    {item.category} · {item.quantity} un.
                  </span>
                  <strong>{formatCurrency(item.total)}</strong>
                </div>
              ))}
              {categoryTotals.length === 0 ? (
                <p className="text-sm text-stone-600">
                  Nenhum item registrado nos pedidos de consumo.
                </p>
              ) : null}
            </div>
          </details>
        </section>

        <details
          open
          className="mt-8 rounded-[2rem] border border-green-100 bg-white p-6 shadow-sm"
        >
          <summary className="cursor-pointer text-xl font-black text-green-950">
            3. Itens vendidos por item do cardápio
          </summary>
          <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
            <span className="inline-flex items-center gap-2 font-bold text-stone-600">
              <ArrowDownUp className="h-4 w-4" /> Ordenar por:
            </span>
            <Link
              href={sortLink("valor")}
              className={`rounded-full px-4 py-2 font-black ${orderBy === "valor" ? "bg-green-900 text-white" : "bg-green-50 text-green-950"}`}
              prefetch={false}
            >
              Valor
            </Link>
            <Link
              href={sortLink("quantidade")}
              className={`rounded-full px-4 py-2 font-black ${orderBy === "quantidade" ? "bg-green-900 text-white" : "bg-green-50 text-green-950"}`}
              prefetch={false}
            >
              Quantidade
            </Link>
          </div>
          <div className="mt-4 overflow-x-auto rounded-2xl border border-stone-100">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-green-950 text-white">
                <tr>
                  <th className="p-3">Item</th>
                  <th className="p-3">Quantidade</th>
                  <th className="p-3">Valor total</th>
                  <th className="p-3">Ticket médio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {sortedItems.map((item) => (
                  <tr key={item.itemName}>
                    <td className="p-3 font-bold">{item.itemName}</td>
                    <td className="p-3">{item.quantity}</td>
                    <td className="p-3 font-black">
                      {formatCurrency(item.total)}
                    </td>
                    <td className="p-3">
                      {formatCurrency(
                        item.quantity > 0 ? item.total / item.quantity : 0,
                      )}
                    </td>
                  </tr>
                ))}
                {sortedItems.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-4 text-sm text-stone-600">
                      Nenhum item encontrado.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </details>

        <details className="mt-8 rounded-[2rem] border border-green-100 bg-white p-6 shadow-sm">
          <summary className="cursor-pointer text-xl font-black text-green-950">
            4. Totais por período de 60 minutos
          </summary>
          <p className="mt-3 text-sm text-stone-700">
            Visão igual ao resumo por categoria, agrupada por períodos operacionais
            de 60 minutos no fuso de São Paulo. Período principal considerado:
            12:00–17:00. Registros fora desta janela aparecem como
            “Antes de 12:00” ou “Após 17:00”.
          </p>
          <div className="mt-4 overflow-x-auto rounded-2xl border border-stone-100">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-green-950 text-white">
                <tr>
                  <th className="p-3">Período</th>
                  <th className="p-3">Categoria</th>
                  <th className="p-3">Quantidade</th>
                  <th className="p-3">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {periodCategoryTotals.map((item) => (
                  <tr key={`${item.period}-${item.category}`}>
                    <td className="p-3 font-bold">{item.period}</td>
                    <td className="p-3 font-bold">{item.category}</td>
                    <td className="p-3">{item.quantity}</td>
                    <td className="p-3 font-black">
                      {formatCurrency(item.total)}
                    </td>
                  </tr>
                ))}
                {periodCategoryTotals.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-4 text-sm text-stone-600">
                      Nenhum total encontrado por período.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </details>

        <details className="mt-8 rounded-[2rem] border border-red-100 bg-white p-6 shadow-sm">
          <summary className="cursor-pointer text-xl font-black text-red-900">
            5. Cancelamentos e divergências
          </summary>
          <div className="mt-4 grid gap-3">
            <div className="rounded-2xl bg-red-50 p-4">
              <strong>Pedidos cancelados:</strong> {cancelledOrders.length} ·{" "}
              <strong>Valor:</strong> {formatCurrency(cancelledTotal)}
            </div>
            {cancelledOrders.map((order) => (
              <p key={order.id} className="text-sm text-stone-700">
                Pedido {order.id.slice(0, 8).toUpperCase()} ·{" "}
                {order.customer_name || "sem responsável"} ·{" "}
                {formatCurrency(order.total_amount)} ·{" "}
                {order.cancellation_reason || "sem motivo"}
              </p>
            ))}
          </div>
        </details>

        <div className="mt-8 rounded-[2rem] border border-green-100 bg-green-50 p-6">
          <div className="flex items-center gap-3">
            <FileSpreadsheet className="h-6 w-6 text-green-900" />
            <h2 className="text-xl font-black text-green-950">
              Plano B operacional
            </h2>
          </div>
          <p className="mt-2 text-sm text-stone-700">
            Se houver instabilidade no sistema durante a festa, exporte o CSV
            para ter uma cópia completa dos pedidos, itens, pagamentos e
            pendências.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href="/admin/festa-junina/prestacao-contas/gerar-pdf"
              target="_blank"
              className="inline-flex items-center gap-2 rounded-full bg-amber-500 px-5 py-3 text-sm font-black text-amber-950"
              prefetch={false}
            >
              <FileText className="h-4 w-4" /> Gerar PDF do relatório
            </Link>
            <Link
              href="/admin/festa-junina/prestacao-contas/exportar-pedidos"
              className="inline-flex items-center gap-2 rounded-full bg-green-900 px-5 py-3 text-sm font-black text-white"
              prefetch={false}
            >
              <ReceiptText className="h-4 w-4" /> Baixar CSV completo
            </Link>
          </div>
        </div>
      </section>
    </AdminPageShell>
  );
}
