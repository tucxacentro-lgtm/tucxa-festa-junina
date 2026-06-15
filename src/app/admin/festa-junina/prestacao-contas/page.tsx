import Link from "next/link";
import {
  ArrowDownUp,
  Download,
  FileText,
  FileSpreadsheet,
  ReceiptText,
  DollarSign,
  Trash2,
} from "lucide-react";
import { AdminPageShell } from "@/components/admin-page-shell";
import { requireAdmin } from "@/lib/auth";
import { getCurrentEventForAdmin } from "@/lib/current-event";
import { formatCurrency } from "@/lib/format";
import {
  buildCancelledDuplicateGroups,
  buildCategorySummary,
  buildPeriodCategorySummary,
  buildAccountingTotals,
  buildPaymentMethodSummary,
  buildSalesSummary,
  buildTicketConsumptionMetrics,
  getAccountingEntriesForEvent,
  getConsumptionOrdersForEvent,
  totalFromOrders,
} from "@/lib/operation-dashboard";
import { createAccountingEntry, deleteAccountingEntry, updateAccountingEntry } from "./actions";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams?: Promise<{
    ordenar?: "quantidade" | "valor";
  }>;
};


function sortLink(orderBy: "quantidade" | "valor") {
  return `/admin/festa-junina/prestacao-contas?ordenar=${orderBy}`;
}

function periodRowClass(period: string) {
  if (period.startsWith("Antes")) return "bg-stone-50";
  if (period.startsWith("Após")) return "bg-red-50";
  const hour = Number(period.slice(0, 2));
  const classes = [
    "bg-green-50",
    "bg-amber-50",
    "bg-sky-50",
    "bg-orange-50",
    "bg-lime-50",
  ];
  return classes[Math.max(0, hour - 12) % classes.length] ?? "bg-white";
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
  const duplicateCancelledGroups = buildCancelledDuplicateGroups(cancelledOrders);
  const accountingEntries = await getAccountingEntriesForEvent(event.id);
  const accountingTotals = buildAccountingTotals(accountingEntries, summary.soldTotal);
  const ticketMetrics = await buildTicketConsumptionMetrics(
    event.id,
    accountingEntries,
    summary.soldTotal,
  );

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

        <section className="mt-4 grid gap-4 md:grid-cols-4">
          <div className="rounded-3xl bg-green-50 p-5 shadow-sm">
            <p className="text-sm font-bold text-stone-600">Receitas manuais</p>
            <p className="mt-2 text-2xl font-black text-green-950">
              {formatCurrency(accountingTotals.manualRevenueTotal)}
            </p>
          </div>
          <div className="rounded-3xl bg-red-50 p-5 shadow-sm">
            <p className="text-sm font-bold text-stone-600">Despesas confirmadas</p>
            <p className="mt-2 text-2xl font-black text-red-900">
              {formatCurrency(accountingTotals.expenseTotal)}
            </p>
          </div>
          <div className="rounded-3xl bg-white p-5 shadow-sm">
            <p className="text-sm font-bold text-stone-600">Resultado estimado</p>
            <p className="mt-2 text-2xl font-black text-green-950">
              {formatCurrency(accountingTotals.resultTotal)}
            </p>
          </div>
          <div className="rounded-3xl bg-amber-50 p-5 shadow-sm">
            <p className="text-sm font-bold text-stone-600">Ticket médio consumo</p>
            <p className="mt-2 text-2xl font-black text-amber-900">
              {formatCurrency(ticketMetrics.consumptionAveragePerTicket)}
            </p>
            <p className="mt-1 text-xs font-bold text-stone-600">
              {Math.round(ticketMetrics.totalTicketQuantity)} convites considerados · {formatCurrency(ticketMetrics.ticketPrice)} por convite
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
                  <tr
                    key={`${item.period}-${item.category}`}
                    className={periodRowClass(item.period)}
                  >
                    <td className="p-3 font-black text-green-950">{item.period}</td>
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
            {duplicateCancelledGroups.length > 0 ? (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <h3 className="font-black text-amber-950">
                  Possíveis duplicidades canceladas
                </h3>
                <p className="mt-1 text-sm text-amber-900">
                  Grupos com mesmo responsável, valor, dia e composição de itens.
                  Use esta visão para auditoria e para entender cancelamentos em
                  sequência causados por toque duplo ou reenvio do formulário.
                </p>
                <div className="mt-3 grid gap-3">
                  {duplicateCancelledGroups.map((group) => (
                    <div
                      key={`${group.responsible}-${group.amount}-${group.orderCodes.join("-")}`}
                      className="rounded-2xl bg-white p-4 text-sm text-stone-800"
                    >
                      <p className="font-black text-green-950">
                        {group.responsible} · {group.quantity} pedidos semelhantes ·
                        {" "}{formatCurrency(group.amount)} cada · total cancelado {formatCurrency(group.total)}
                      </p>
                      <p className="mt-1 text-xs text-stone-600">
                        Códigos: {group.orderCodes.join(", ")}
                      </p>
                      <p className="mt-1 text-xs text-stone-500">
                        Motivo base: {group.sampleReason}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="grid gap-1">
              {cancelledOrders.map((order) => (
                <p key={order.id} className="text-sm text-stone-700">
                  Pedido {order.id.slice(0, 8).toUpperCase()} ·{" "}
                  {order.customer_name || "sem responsável"} ·{" "}
                  {formatCurrency(order.total_amount)} ·{" "}
                  {order.cancellation_reason || "sem motivo"}
                </p>
              ))}
            </div>
          </div>
        </details>

        <details open className="mt-8 rounded-[2rem] border border-green-100 bg-white p-6 shadow-sm">
          <summary className="cursor-pointer text-xl font-black text-green-950">
            6. Receitas manuais, despesas e resultado
          </summary>

          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            <div className="rounded-2xl bg-green-50 p-4">
              <p className="text-sm font-bold text-stone-600">Receita do sistema</p>
              <p className="mt-1 text-2xl font-black text-green-950">{formatCurrency(summary.soldTotal)}</p>
            </div>
            <div className="rounded-2xl bg-green-50 p-4">
              <p className="text-sm font-bold text-stone-600">Receitas manuais</p>
              <p className="mt-1 text-2xl font-black text-green-950">{formatCurrency(accountingTotals.manualRevenueTotal)}</p>
            </div>
            <div className="rounded-2xl bg-red-50 p-4">
              <p className="text-sm font-bold text-stone-600">Despesas confirmadas</p>
              <p className="mt-1 text-2xl font-black text-red-900">{formatCurrency(accountingTotals.expenseTotal)}</p>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <p className="font-black text-amber-950">Ticket médio de consumo</p>
            <p className="mt-1 text-sm text-stone-700">
              Considera {Math.round(ticketMetrics.totalTicketQuantity)} convite(s) a {formatCurrency(ticketMetrics.ticketPrice)} cada, somando convites registrados no sistema e receitas manuais de convites.
            </p>
            <div className="mt-3 grid gap-3 md:grid-cols-3">
              <div><span className="text-xs font-bold text-stone-600">Consumo por pessoa</span><p className="text-xl font-black text-green-950">{formatCurrency(ticketMetrics.consumptionAveragePerTicket)}</p></div>
              <div><span className="text-xs font-bold text-stone-600">Receita de convites</span><p className="text-xl font-black text-green-950">{formatCurrency(ticketMetrics.totalTicketRevenue)}</p></div>
              <div><span className="text-xs font-bold text-stone-600">Receita total por pessoa</span><p className="text-xl font-black text-green-950">{formatCurrency(ticketMetrics.totalRevenueAveragePerTicket)}</p></div>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-stone-100 p-4">
            <h3 className="flex items-center gap-2 font-black text-green-950"><DollarSign className="h-4 w-4" /> Novo lançamento</h3>
            <form action={createAccountingEntry} className="mt-3 grid gap-3 md:grid-cols-6">
              <select name="entry_type" className="rounded-2xl border border-stone-200 p-3 text-sm font-bold md:col-span-1" defaultValue="expense">
                <option value="expense">Despesa</option>
                <option value="manual_revenue">Receita manual</option>
              </select>
              <input name="category" className="rounded-2xl border border-stone-200 p-3 text-sm md:col-span-1" placeholder="Categoria" />
              <input name="description" className="rounded-2xl border border-stone-200 p-3 text-sm md:col-span-2" placeholder="Descrição" />
              <input name="amount" className="rounded-2xl border border-stone-200 p-3 text-sm" placeholder="Valor" inputMode="decimal" />
              <select name="status" className="rounded-2xl border border-stone-200 p-3 text-sm font-bold" defaultValue="confirmed">
                <option value="confirmed">Confirmado</option>
                <option value="pending_value">Aguardando valor</option>
                <option value="cancelled">Cancelado</option>
              </select>
              <input name="quantity" className="rounded-2xl border border-stone-200 p-3 text-sm" placeholder="Qtde" inputMode="decimal" />
              <input name="unit_amount" className="rounded-2xl border border-stone-200 p-3 text-sm" placeholder="Valor unit." inputMode="decimal" />
              <input name="occurred_on" type="date" className="rounded-2xl border border-stone-200 p-3 text-sm" />
              <input name="notes" className="rounded-2xl border border-stone-200 p-3 text-sm md:col-span-2" placeholder="Observações" />
              <button className="rounded-2xl bg-green-900 px-5 py-3 text-sm font-black text-white md:col-span-1">Salvar</button>
            </form>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-red-100 p-4">
              <h3 className="font-black text-red-900">Despesas</h3>
              <div className="mt-3 grid gap-3">
                {accountingTotals.expenses.map((entry) => (
                  <details key={entry.id} className="rounded-2xl bg-red-50 p-3">
                    <summary className="cursor-pointer font-bold text-red-950">
                      {entry.description} · {entry.status === "pending_value" ? "Aguardando valor" : formatCurrency(entry.amount ?? 0)}
                    </summary>
                    <form action={updateAccountingEntry} className="mt-3 grid gap-2 md:grid-cols-2">
                      <input type="hidden" name="id" value={entry.id} />
                      <input type="hidden" name="entry_type" value="expense" />
                      <input name="category" defaultValue={entry.category} className="rounded-xl border border-stone-200 p-2 text-sm" />
                      <input name="description" defaultValue={entry.description} className="rounded-xl border border-stone-200 p-2 text-sm" />
                      <input name="amount" defaultValue={entry.amount ?? ""} className="rounded-xl border border-stone-200 p-2 text-sm" inputMode="decimal" />
                      <select name="status" defaultValue={entry.status} className="rounded-xl border border-stone-200 p-2 text-sm">
                        <option value="confirmed">Confirmado</option>
                        <option value="pending_value">Aguardando valor</option>
                        <option value="cancelled">Cancelado</option>
                      </select>
                      <input name="occurred_on" type="date" defaultValue={entry.occurred_on ?? ""} className="rounded-xl border border-stone-200 p-2 text-sm" />
                      <input name="notes" defaultValue={entry.notes ?? ""} className="rounded-xl border border-stone-200 p-2 text-sm" />
                      <button className="rounded-xl bg-green-900 px-4 py-2 text-sm font-black text-white">Atualizar</button>
                    </form>
                    <form action={deleteAccountingEntry} className="mt-2">
                      <input type="hidden" name="id" value={entry.id} />
                      <button className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-black text-red-900" type="submit">
                        <Trash2 className="h-4 w-4" /> Excluir definitivamente
                      </button>
                    </form>
                  </details>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-green-100 p-4">
              <h3 className="font-black text-green-950">Receitas manuais</h3>
              <div className="mt-3 grid gap-3">
                {accountingTotals.revenues.map((entry) => (
                  <details key={entry.id} className="rounded-2xl bg-green-50 p-3">
                    <summary className="cursor-pointer font-bold text-green-950">
                      {entry.description} · {formatCurrency(entry.amount ?? 0)}
                    </summary>
                    <form action={updateAccountingEntry} className="mt-3 grid gap-2 md:grid-cols-2">
                      <input type="hidden" name="id" value={entry.id} />
                      <input type="hidden" name="entry_type" value="manual_revenue" />
                      <input name="category" defaultValue={entry.category} className="rounded-xl border border-stone-200 p-2 text-sm" />
                      <input name="description" defaultValue={entry.description} className="rounded-xl border border-stone-200 p-2 text-sm" />
                      <input name="amount" defaultValue={entry.amount ?? ""} className="rounded-xl border border-stone-200 p-2 text-sm" inputMode="decimal" />
                      <select name="status" defaultValue={entry.status} className="rounded-xl border border-stone-200 p-2 text-sm">
                        <option value="confirmed">Confirmado</option>
                        <option value="pending_value">Aguardando valor</option>
                        <option value="cancelled">Cancelado</option>
                      </select>
                      <input name="quantity" defaultValue={entry.quantity ?? ""} className="rounded-xl border border-stone-200 p-2 text-sm" placeholder="Qtde" />
                      <input name="unit_amount" defaultValue={entry.unit_amount ?? ""} className="rounded-xl border border-stone-200 p-2 text-sm" placeholder="Valor unit." />
                      <input name="occurred_on" type="date" defaultValue={entry.occurred_on ?? ""} className="rounded-xl border border-stone-200 p-2 text-sm" />
                      <input name="notes" defaultValue={entry.notes ?? ""} className="rounded-xl border border-stone-200 p-2 text-sm" />
                      <button className="rounded-xl bg-green-900 px-4 py-2 text-sm font-black text-white">Atualizar</button>
                    </form>
                    <form action={deleteAccountingEntry} className="mt-2">
                      <input type="hidden" name="id" value={entry.id} />
                      <button className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-black text-red-900" type="submit">
                        <Trash2 className="h-4 w-4" /> Excluir definitivamente
                      </button>
                    </form>
                  </details>
                ))}
              </div>
            </div>
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
