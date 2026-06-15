import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getCurrentEventForAdmin } from "@/lib/current-event";
import { formatCurrency } from "@/lib/format";
import {
  buildCategorySummary,
  buildHourlyItemSummary,
  buildPaymentMethodSummary,
  buildSalesSummary,
  getConsumptionOrdersForEvent,
  totalFromOrders,
} from "@/lib/operation-dashboard";

export const dynamic = "force-dynamic";

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function shortDateTime(value: string | Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function shortTime(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function rows<T>(items: T[], render: (item: T) => string, empty: string) {
  if (items.length === 0) {
    return `<tr><td colspan="99" class="empty">${escapeHtml(empty)}</td></tr>`;
  }
  return items.map(render).join("");
}

export async function GET() {
  await requireAdmin(
    ["admin", "coordenador", "caixa"],
    "/admin/festa-junina/prestacao-contas",
  );

  const event = await getCurrentEventForAdmin();
  const orders = await getConsumptionOrdersForEvent(event.id, {
    includeCancelled: true,
  });
  const activeOrders = orders.filter((order) => order.status !== "cancelled");
  const cancelledOrders = orders.filter((order) => order.status === "cancelled");
  const summary = buildSalesSummary(activeOrders);
  const paymentTotals = buildPaymentMethodSummary(activeOrders);
  const categoryTotals = buildCategorySummary(activeOrders);
  const itemTotals = [...summary.itemDetails].sort((a, b) => b.total - a.total);
  const hourlyItems = buildHourlyItemSummary(activeOrders);
  const cancelledTotal = totalFromOrders(cancelledOrders);
  const generatedAt = new Date();

  const html = `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <title>Relatório final do evento - ${escapeHtml(event.name)}</title>
  <style>
    @page { size: A4; margin: 14mm; }
    * { box-sizing: border-box; }
    body { margin: 0; font-family: Arial, Helvetica, sans-serif; color: #063f25; background: #fffaf0; }
    .toolbar { position: sticky; top: 0; z-index: 2; display: flex; justify-content: space-between; gap: 12px; padding: 12px 18px; background: #063f25; color: #fff; }
    .toolbar button { border: 0; border-radius: 999px; padding: 10px 16px; font-weight: 800; cursor: pointer; background: #f59e0b; color: #3b2100; }
    main { max-width: 1100px; margin: 0 auto; padding: 28px 20px 48px; }
    .hero { border: 1px solid #ccebd8; background: #ffffff; border-radius: 22px; padding: 24px; }
    h1 { margin: 0; font-size: 30px; }
    h2 { margin: 26px 0 10px; font-size: 20px; border-bottom: 2px solid #063f25; padding-bottom: 8px; }
    p { color: #374151; }
    .cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin: 18px 0; }
    .card { border: 1px solid #e5e7eb; border-radius: 18px; background: #fff; padding: 14px; }
    .label { font-size: 12px; color: #4b5563; font-weight: 700; }
    .value { margin-top: 6px; font-size: 23px; font-weight: 900; }
    table { width: 100%; border-collapse: collapse; margin: 10px 0 18px; background: #fff; font-size: 12px; }
    th { background: #063f25; color: #fff; text-align: left; }
    th, td { padding: 8px; border: 1px solid #d1d5db; vertical-align: top; }
    tr:nth-child(even) td { background: #f9fafb; }
    .empty { color: #6b7280; font-style: italic; }
    .small { font-size: 12px; color: #4b5563; }
    @media print {
      body { background: #fff; }
      .toolbar { display: none; }
      main { padding: 0; max-width: none; }
      .hero, .card { border-color: #d1d5db; }
      h2 { page-break-after: avoid; }
      table { page-break-inside: auto; }
      tr { page-break-inside: avoid; page-break-after: auto; }
    }
  </style>
</head>
<body>
  <div class="toolbar">
    <strong>Relatório final do evento</strong>
    <button onclick="window.print()">Imprimir / salvar em PDF</button>
  </div>
  <main>
    <section class="hero">
      <h1>Relatório final do evento</h1>
      <p><strong>${escapeHtml(event.name)}</strong></p>
      <p class="small">Gerado em ${shortDateTime(generatedAt)}. Use o botão “Imprimir / salvar em PDF” e escolha “Salvar como PDF”.</p>
    </section>

    <section class="cards">
      <div class="card"><div class="label">Total vendido</div><div class="value">${formatCurrency(summary.soldTotal)}</div></div>
      <div class="card"><div class="label">Total pago</div><div class="value">${formatCurrency(summary.paidTotal)}</div></div>
      <div class="card"><div class="label">Total pendente</div><div class="value">${formatCurrency(summary.pendingTotal)}</div></div>
      <div class="card"><div class="label">Cancelado</div><div class="value">${formatCurrency(cancelledTotal)}</div></div>
    </section>

    <h2>1. Totais por forma de pagamento</h2>
    <table><thead><tr><th>Forma</th><th>Total</th></tr></thead><tbody>
      ${rows(
        paymentTotals,
        (item) => `<tr><td>${escapeHtml(item.label)}</td><td>${formatCurrency(item.total)}</td></tr>`,
        "Nenhum pagamento registrado.",
      )}
    </tbody></table>

    <h2>2. Totais por categoria/resumo</h2>
    <table><thead><tr><th>Categoria</th><th>Quantidade</th><th>Total</th></tr></thead><tbody>
      ${rows(
        categoryTotals,
        (item) => `<tr><td>${escapeHtml(item.category)}</td><td>${item.quantity}</td><td>${formatCurrency(item.total)}</td></tr>`,
        "Nenhum item registrado nos pedidos de consumo.",
      )}
    </tbody></table>

    <h2>3. Itens vendidos por item do cardápio</h2>
    <table><thead><tr><th>Item</th><th>Quantidade</th><th>Valor total</th><th>Ticket médio</th></tr></thead><tbody>
      ${rows(
        itemTotals,
        (item) => `<tr><td>${escapeHtml(item.itemName)}</td><td>${item.quantity}</td><td>${formatCurrency(item.total)}</td><td>${formatCurrency(item.quantity > 0 ? item.total / item.quantity : 0)}</td></tr>`,
        "Nenhum item encontrado.",
      )}
    </tbody></table>

    <h2>4. Itens vendidos por períodos de 60 minutos</h2>
    <table><thead><tr><th>Período</th><th>Categoria</th><th>Item</th><th>Quantidade</th><th>Valor</th></tr></thead><tbody>
      ${rows(
        hourlyItems,
        (item) => `<tr><td>${shortTime(item.bucketStart)}–${shortTime(item.bucketEnd)}</td><td>${escapeHtml(item.category)}</td><td>${escapeHtml(item.itemName)}</td><td>${item.quantity}</td><td>${formatCurrency(item.total)}</td></tr>`,
        "Nenhum item encontrado por período.",
      )}
    </tbody></table>

    <h2>5. Cancelamentos e divergências</h2>
    <p><strong>Pedidos cancelados:</strong> ${cancelledOrders.length} · <strong>Valor cancelado:</strong> ${formatCurrency(cancelledTotal)}</p>
    <table><thead><tr><th>Pedido</th><th>Responsável</th><th>Valor</th><th>Motivo</th></tr></thead><tbody>
      ${rows(
        cancelledOrders,
        (order) => `<tr><td>${order.id.slice(0, 8).toUpperCase()}</td><td>${escapeHtml(order.customer_name || "sem responsável")}</td><td>${formatCurrency(order.total_amount)}</td><td>${escapeHtml(order.cancellation_reason || "sem motivo")}</td></tr>`,
        "Nenhum pedido cancelado.",
      )}
    </tbody></table>
  </main>
  <script>setTimeout(() => window.print(), 600);</script>
</body>
</html>`;

  return new NextResponse(html, {
    status: 200,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}
