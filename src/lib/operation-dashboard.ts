import { createSupabaseAdminClient } from "@/lib/supabaseServer";

export type ConsumptionOrderRow = {
  id: string;
  event_id: string;
  service_session_id?: string | null;
  order_mode: string;
  customer_name: string | null;
  customer_phone: string | null;
  table_label: string | null;
  waiter_name: string | null;
  settlement_mode: string | null;
  status: string;
  payment_status: string;
  delivery_status: string;
  total_amount: number | string;
  notes: string | null;
  delivered_at: string | null;
  cancelled_at?: string | null;
  cancellation_reason?: string | null;
  created_at: string;
  updated_at: string;
};

export type ConsumptionOrderItemRow = {
  id: string;
  order_id: string;
  item_name: string;
  quantity: number | string;
  unit_price: number | string;
  total_price: number | string;
  status: string;
  created_at: string;
};

export type ConsumptionPaymentRow = {
  id: string;
  order_id: string;
  method: string;
  amount: number | string;
  status: string;
  proof_file_path: string | null;
  notes: string | null;
  created_at: string;
};

export type ConsumptionOrderWithDetails = ConsumptionOrderRow & {
  items: ConsumptionOrderItemRow[];
  payments: ConsumptionPaymentRow[];
};

export type ServiceResponsibleRow = {
  id: string;
  event_id: string;
  responsibleName: string;
  responsiblePhone: string | null;
  waiterName: string | null;
  tableLabel: string | null;
  settlementMode: string;
  status: string;
  createdAt: string;
  orders: ConsumptionOrderWithDetails[];
};

export type SalesSummaryItem = {
  itemName: string;
  quantity: number;
  total: number;
};

export type SalesSummary = {
  soldTotal: number;
  paidTotal: number;
  pendingTotal: number;
  itemDetails: SalesSummaryItem[];
};

function numeric(value: number | string | null | undefined) {
  const parsed = Number(String(value ?? 0).replace(",", "."));
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalize(value: string | null | undefined) {
  return (value ?? "").trim().toLocaleLowerCase("pt-BR");
}

function firstNonEmpty(...values: Array<string | null | undefined>) {
  return values.find((value) => value && value.trim())?.trim() ?? "";
}

export async function getConsumptionOrdersForEvent(eventId: string, options: { includeCancelled?: boolean } = {}): Promise<ConsumptionOrderWithDetails[]> {
  const supabase = createSupabaseAdminClient();

  let ordersQuery = supabase
    .from("event_consumption_orders")
    .select("*")
    .eq("event_id", eventId);

  if (!options.includeCancelled) {
    ordersQuery = ordersQuery.neq("status", "cancelled");
  }

  const { data: orders, error: ordersError } = await ordersQuery.order("created_at", { ascending: false });

  if (ordersError) return [];

  const typedOrders = (orders ?? []) as ConsumptionOrderRow[];
  const orderIds = typedOrders.map((order) => order.id);
  if (orderIds.length === 0) return [];

  const [{ data: items }, { data: payments }] = await Promise.all([
    supabase
      .from("event_consumption_order_items")
      .select("id, order_id, item_name, quantity, unit_price, total_price, status, created_at")
      .in("order_id", orderIds)
      .order("created_at", { ascending: true }),
    supabase
      .from("event_consumption_payments")
      .select("id, order_id, method, amount, status, proof_file_path, notes, created_at")
      .in("order_id", orderIds)
      .order("created_at", { ascending: true }),
  ]);

  const itemsByOrder = new Map<string, ConsumptionOrderItemRow[]>();
  for (const item of ((items ?? []) as ConsumptionOrderItemRow[])) {
    const current = itemsByOrder.get(item.order_id) ?? [];
    current.push(item);
    itemsByOrder.set(item.order_id, current);
  }

  const paymentsByOrder = new Map<string, ConsumptionPaymentRow[]>();
  for (const payment of ((payments ?? []) as ConsumptionPaymentRow[])) {
    const current = paymentsByOrder.get(payment.order_id) ?? [];
    current.push(payment);
    paymentsByOrder.set(payment.order_id, current);
  }

  return typedOrders.map((order) => ({
    ...order,
    items: itemsByOrder.get(order.id) ?? [],
    payments: paymentsByOrder.get(order.id) ?? [],
  }));
}

export async function getServiceResponsiblesForEvent(eventId: string, options: { includeCancelled?: boolean } = {}) {
  const supabase = createSupabaseAdminClient();
  const orders = await getConsumptionOrdersForEvent(eventId, options);
  const activeOrders = options.includeCancelled ? orders : orders.filter((order) => order.status !== "cancelled");

  const { data: sessions } = await supabase
    .from("event_table_service_sessions")
    .select("id, event_id, table_label, responsible_name, responsible_phone, waiter_name, settlement_mode, status, created_at")
    .eq("event_id", eventId)
    .neq("status", options.includeCancelled ? "__never__" : "cancelled")
    .order("responsible_name", { ascending: true });

  const rows = new Map<string, ServiceResponsibleRow>();

  for (const session of (sessions ?? []) as Array<{
    id: string;
    event_id: string;
    table_label: string | null;
    responsible_name: string | null;
    responsible_phone: string | null;
    waiter_name: string | null;
    settlement_mode: string | null;
    status: string;
    created_at: string;
  }>) {
    const responsibleName = firstNonEmpty(session.responsible_name, session.table_label, "Responsável sem nome");
    rows.set(session.id, {
      id: session.id,
      event_id: session.event_id,
      responsibleName,
      responsiblePhone: session.responsible_phone,
      waiterName: session.waiter_name,
      tableLabel: session.table_label,
      settlementMode: session.settlement_mode || "fechamento_final",
      status: session.status,
      createdAt: session.created_at,
      orders: [],
    });
  }

  for (const order of activeOrders) {
    const responsibleName = firstNonEmpty(order.customer_name, order.table_label, "Responsável não informado");
    const sessionId = order.service_session_id ?? "";
    const matchingRow = sessionId ? rows.get(sessionId) : undefined;
    const fallbackKey = `order:${normalize(responsibleName) || order.id}`;
    const current = matchingRow ?? rows.get(fallbackKey) ?? {
      id: fallbackKey,
      event_id: order.event_id,
      responsibleName,
      responsiblePhone: order.customer_phone,
      waiterName: order.waiter_name,
      tableLabel: order.table_label,
      settlementMode: order.settlement_mode || "fechamento_final",
      status: "open",
      createdAt: order.created_at,
      orders: [],
    } satisfies ServiceResponsibleRow;

    current.orders.push(order);
    if (!current.waiterName && order.waiter_name) current.waiterName = order.waiter_name;
    if (!current.responsiblePhone && order.customer_phone) current.responsiblePhone = order.customer_phone;
    if (!current.tableLabel && order.table_label) current.tableLabel = order.table_label;
    if (!current.settlementMode && order.settlement_mode) current.settlementMode = order.settlement_mode;
    rows.set(matchingRow ? matchingRow.id : fallbackKey, current);
  }

  return Array.from(rows.values()).sort((a, b) => a.responsibleName.localeCompare(b.responsibleName, "pt-BR"));
}

export function filterServiceRows(rows: ServiceResponsibleRow[], query?: string | null, waiter?: string | null) {
  const normalizedQuery = normalize(query);
  const normalizedWaiter = normalize(waiter);
  return rows.filter((row) => {
    const matchesQuery = !normalizedQuery || normalize(`${row.responsibleName} ${row.tableLabel ?? ""} ${row.responsiblePhone ?? ""}`).includes(normalizedQuery);
    const rowWaiter = row.waiterName?.trim() ?? "";
    const matchesWaiter =
      !normalizedWaiter ||
      (normalizedWaiter === "__sem_garcom" ? !rowWaiter : normalize(rowWaiter).includes(normalizedWaiter));
    return matchesQuery && matchesWaiter;
  });
}

export function getWaiterOptions(rows: ServiceResponsibleRow[]) {
  return Array.from(new Set(rows.map((row) => row.waiterName?.trim()).filter(Boolean) as string[])).sort((a, b) => a.localeCompare(b, "pt-BR"));
}

export function totalFromOrders(orders: ConsumptionOrderWithDetails[]) {
  return orders.reduce((sum, order) => sum + numeric(order.total_amount), 0);
}

export function pendingFromOrders(orders: ConsumptionOrderWithDetails[]) {
  return orders
    .filter((order) => order.payment_status !== "paid" && order.status !== "cancelled")
    .reduce((sum, order) => sum + numeric(order.total_amount), 0);
}

export function paidFromOrders(orders: ConsumptionOrderWithDetails[]) {
  return orders
    .filter((order) => order.payment_status === "paid")
    .reduce((sum, order) => sum + numeric(order.total_amount), 0);
}

export function buildSalesSummary(orders: ConsumptionOrderWithDetails[]): SalesSummary {
  const activeOrders = orders.filter((order) => order.status !== "cancelled");
  const itemMap = new Map<string, SalesSummaryItem>();
  for (const order of activeOrders) {
    for (const item of order.items) {
      const current = itemMap.get(item.item_name) ?? { itemName: item.item_name, quantity: 0, total: 0 };
      current.quantity += numeric(item.quantity);
      current.total += numeric(item.total_price);
      itemMap.set(item.item_name, current);
    }
  }
  const soldTotal = totalFromOrders(activeOrders);
  const paidTotal = paidFromOrders(activeOrders);
  return {
    soldTotal,
    paidTotal,
    pendingTotal: Math.max(0, soldTotal - paidTotal),
    itemDetails: Array.from(itemMap.values()).sort((a, b) => b.total - a.total),
  };
}

export function orderStatusLabel(value: string) {
  const labels: Record<string, string> = {
    received: "Recebido",
    preparing: "Em preparo",
    ready: "Pronto",
    delivered: "Entregue",
    cancelled: "Cancelado",
  };
  return labels[value] ?? value;
}

export function paymentStatusLabel(value: string) {
  const labels: Record<string, string> = {
    pending: "Pendente",
    registered: "Registrado",
    proof_sent: "Comprovante enviado",
    paid: "Pago",
    cancelled: "Cancelado",
  };
  return labels[value] ?? value;
}

export function deliveryStatusLabel(value: string) {
  const labels: Record<string, string> = {
    pending: "Pendente",
    delivered: "Entregue",
    cancelled: "Cancelado",
  };
  return labels[value] ?? value;
}

export function paymentMethodLabel(value: string) {
  const labels: Record<string, string> = {
    pix: "Pix",
    credit: "Crédito",
    debit: "Débito",
    cash: "Dinheiro",
    manual: "Responsável",
    free: "Cortesia",
  };
  return labels[value] ?? value;
}
