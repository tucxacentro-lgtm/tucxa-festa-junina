import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getCurrentEventForAdmin } from "@/lib/current-event";
import {
  paidAmountFromOrder,
  pendingAmountFromOrder,
  paymentMethodLabel,
  getConsumptionOrdersForEvent,
} from "@/lib/operation-dashboard";

export const dynamic = "force-dynamic";

function csvCell(value: unknown) {
  const text = String(value ?? "");
  return `"${text.replace(/"/g, '""')}"`;
}

function formatNumber(value: number | string | null | undefined) {
  const parsed = Number(String(value ?? 0).replace(",", "."));
  return Number.isFinite(parsed) ? parsed.toFixed(2).replace(".", ",") : "0,00";
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

  const headers = [
    "evento",
    "pedido_id",
    "pedido_codigo",
    "data_hora",
    "responsavel",
    "whatsapp",
    "mesa",
    "garcom",
    "status_pedido",
    "status_entrega",
    "status_pagamento",
    "forma_pagamento",
    "categoria",
    "total_pedido",
    "total_pago",
    "total_pendente",
    "item",
    "quantidade",
    "preco_unitario",
    "total_item",
    "observacoes",
    "motivo_cancelamento",
  ];

  const lines = [headers.map(csvCell).join(";")];

  for (const order of orders) {
    const paid = paidAmountFromOrder(order);
    const pending = pendingAmountFromOrder(order);
    const paidPayments = order.payments.filter(
      (payment) => payment.status === "paid",
    );
    const methods =
      paidPayments.length > 0
        ? Array.from(
            new Set(
              paidPayments.map((payment) => paymentMethodLabel(payment.method)),
            ),
          ).join(" + ")
        : order.payment_status === "paid"
          ? "Pago sem forma registrada"
          : "";
    const items = order.items.length > 0 ? order.items : [null];

    for (const item of items) {
      lines.push(
        [
          event.name,
          order.id,
          order.id.slice(0, 8).toUpperCase(),
          order.created_at,
          order.customer_name || "",
          order.customer_phone || "",
          order.table_label || "",
          order.waiter_name || "",
          order.status,
          order.delivery_status,
          order.payment_status,
          methods,
          item?.category || "",
          formatNumber(order.total_amount),
          formatNumber(paid),
          formatNumber(pending),
          item?.item_name || "",
          item ? String(Number(item.quantity)) : "",
          item ? formatNumber(item.unit_price) : "",
          item ? formatNumber(item.total_price) : "",
          order.notes || "",
          order.cancellation_reason || "",
        ]
          .map(csvCell)
          .join(";"),
      );
    }
  }

  const csv = `\uFEFF${lines.join("\n")}`;
  const fileDate = new Date().toISOString().slice(0, 10);

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="prestacao-contas-pedidos-${fileDate}.csv"`,
      "cache-control": "no-store",
    },
  });
}
