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
  event_id?: string | null;
  order_id: string;
  sales_menu_item_id?: string | null;
  item_name: string;
  category?: string | null;
  quantity: number | string;
  unit_price: number | string;
  total_price: number | string;
  status: string;
  created_at: string;
};

export type SalesMenuItemOption = {
  id: string;
  name: string;
  category: string | null;
  description: string | null;
  price: number | string;
  unit_label: string | null;
  requires_preparation: boolean | null;
  active: boolean;
  sort_order: number | null;
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

const IN_QUERY_CHUNK_SIZE = 40;
const PAYMENT_STATUSES_WITH_METHOD = new Set(["paid", "registered", "proof_sent"]);

function chunkValues<T>(values: T[], size = IN_QUERY_CHUNK_SIZE) {
  const chunks: T[][] = [];
  for (let index = 0; index < values.length; index += size) {
    chunks.push(values.slice(index, index + size));
  }
  return chunks;
}

function isPaymentUsableForMethod(payment: Pick<ConsumptionPaymentRow, "status">) {
  return PAYMENT_STATUSES_WITH_METHOD.has(payment.status);
}

async function fetchOrderItemsInChunks(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  orderIds: string[],
): Promise<ConsumptionOrderItemRow[]> {
  const rows: ConsumptionOrderItemRow[] = [];

  for (const chunk of chunkValues(orderIds)) {
    const result = await supabase
      .from("event_consumption_order_items")
      .select(
        "id, event_id, order_id, sales_menu_item_id, item_name, quantity, unit_price, total_price, status, created_at",
      )
      .in("order_id", chunk)
      .order("created_at", { ascending: true });

    if (!result.error) {
      rows.push(...((result.data ?? []) as ConsumptionOrderItemRow[]));
      continue;
    }

    // Compatibilidade: algumas bases antigas podem não aceitar algum campo extra
    // no select acima. Neste caso, buscamos novamente com os campos mínimos.
    const fallback = await supabase
      .from("event_consumption_order_items")
      .select(
        "id, order_id, item_name, quantity, unit_price, total_price, status, created_at",
      )
      .in("order_id", chunk)
      .order("created_at", { ascending: true });

    if (!fallback.error) {
      rows.push(...((fallback.data ?? []) as ConsumptionOrderItemRow[]));
    }
  }

  return rows;
}

async function fetchPaymentsInChunks(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  orderIds: string[],
): Promise<ConsumptionPaymentRow[]> {
  const rows: ConsumptionPaymentRow[] = [];

  for (const chunk of chunkValues(orderIds)) {
    const result = await supabase
      .from("event_consumption_payments")
      .select(
        "id, order_id, method, amount, status, proof_file_path, notes, created_at",
      )
      .in("order_id", chunk)
      .order("created_at", { ascending: true });

    if (!result.error) {
      rows.push(...((result.data ?? []) as ConsumptionPaymentRow[]));
    }
  }

  return rows;
}

export async function getConsumptionOrdersForEvent(
  eventId: string,
  options: { includeCancelled?: boolean } = {},
): Promise<ConsumptionOrderWithDetails[]> {
  const supabase = createSupabaseAdminClient();

  let ordersQuery = supabase
    .from("event_consumption_orders")
    .select("*")
    .eq("event_id", eventId);

  if (!options.includeCancelled) {
    ordersQuery = ordersQuery.neq("status", "cancelled");
  }

  const { data: orders, error: ordersError } = await ordersQuery.order(
    "created_at",
    { ascending: false },
  );

  if (ordersError) return [];

  const typedOrders = (orders ?? []) as ConsumptionOrderRow[];
  const orderIds = typedOrders.map((order) => order.id);
  if (orderIds.length === 0) return [];

  const [items, payments, menuItemsResult] = await Promise.all([
    fetchOrderItemsInChunks(supabase, orderIds),
    fetchPaymentsInChunks(supabase, orderIds),
    supabase
      .from("event_sales_menu_items")
      .select("id, name, category")
      .eq("event_id", eventId),
  ]);

  const menuItems = menuItemsResult.data;

  const categoryByMenuId = new Map<string, string | null>();
  const categoryByName = new Map<string, string | null>();
  for (const item of (menuItems ?? []) as Array<{
    id: string;
    name: string;
    category: string | null;
  }>) {
    categoryByMenuId.set(item.id, item.category);
    categoryByName.set(normalize(item.name), item.category);
  }

  const itemsByOrder = new Map<string, ConsumptionOrderItemRow[]>();
  for (const item of items) {
    const category =
      (item.sales_menu_item_id
        ? categoryByMenuId.get(item.sales_menu_item_id)
        : null) ??
      categoryByName.get(normalize(item.item_name)) ??
      null;
    const current = itemsByOrder.get(item.order_id) ?? [];
    current.push({ ...item, category });
    itemsByOrder.set(item.order_id, current);
  }

  const paymentsByOrder = new Map<string, ConsumptionPaymentRow[]>();
  for (const payment of payments) {
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

export async function getServiceResponsiblesForEvent(
  eventId: string,
  options: { includeCancelled?: boolean } = {},
) {
  const supabase = createSupabaseAdminClient();
  const orders = await getConsumptionOrdersForEvent(eventId, options);
  const activeOrders = options.includeCancelled
    ? orders
    : orders.filter((order) => order.status !== "cancelled");

  const { data: sessions } = await supabase
    .from("event_table_service_sessions")
    .select(
      "id, event_id, table_label, responsible_name, responsible_phone, waiter_name, settlement_mode, status, created_at",
    )
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
    const responsibleName = firstNonEmpty(
      session.responsible_name,
      session.table_label,
      "Responsável sem nome",
    );
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
    const responsibleName = firstNonEmpty(
      order.customer_name,
      order.table_label,
      "Responsável não informado",
    );
    const sessionId = order.service_session_id ?? "";
    const matchingRow = sessionId ? rows.get(sessionId) : undefined;
    const fallbackKey = `order:${normalize(responsibleName) || order.id}`;
    const current =
      matchingRow ??
      rows.get(fallbackKey) ??
      ({
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
      } satisfies ServiceResponsibleRow);

    current.orders.push(order);
    if (!current.waiterName && order.waiter_name)
      current.waiterName = order.waiter_name;
    if (!current.responsiblePhone && order.customer_phone)
      current.responsiblePhone = order.customer_phone;
    if (!current.tableLabel && order.table_label)
      current.tableLabel = order.table_label;
    if (!current.settlementMode && order.settlement_mode)
      current.settlementMode = order.settlement_mode;
    rows.set(matchingRow ? matchingRow.id : fallbackKey, current);
  }

  return Array.from(rows.values()).sort((a, b) =>
    a.responsibleName.localeCompare(b.responsibleName, "pt-BR"),
  );
}

export function filterServiceRows(
  rows: ServiceResponsibleRow[],
  query?: string | null,
  waiter?: string | null,
) {
  const normalizedQuery = normalize(query);
  const normalizedWaiter = normalize(waiter);
  return rows.filter((row) => {
    const matchesQuery =
      !normalizedQuery ||
      normalize(
        `${row.responsibleName} ${row.tableLabel ?? ""} ${row.responsiblePhone ?? ""}`,
      ).includes(normalizedQuery);
    const rowWaiter = row.waiterName?.trim() ?? "";
    const matchesWaiter =
      !normalizedWaiter ||
      (normalizedWaiter === "__sem_garcom"
        ? !rowWaiter
        : normalize(rowWaiter).includes(normalizedWaiter));
    return matchesQuery && matchesWaiter;
  });
}

export function getWaiterOptions(rows: ServiceResponsibleRow[]) {
  return Array.from(
    new Set(
      rows.map((row) => row.waiterName?.trim()).filter(Boolean) as string[],
    ),
  ).sort((a, b) => a.localeCompare(b, "pt-BR"));
}

export function totalFromOrders(orders: ConsumptionOrderWithDetails[]) {
  return orders.reduce((sum, order) => sum + numeric(order.total_amount), 0);
}

export function paidAmountFromOrder(order: ConsumptionOrderWithDetails) {
  const total = numeric(order.total_amount);
  if (order.status === "cancelled") return 0;
  if (order.payment_status === "paid") return total;

  const paidByPayments = order.payments
    .filter((payment) => payment.status === "paid")
    .reduce((sum, payment) => sum + numeric(payment.amount), 0);

  return Math.min(total, paidByPayments);
}

export function pendingAmountFromOrder(order: ConsumptionOrderWithDetails) {
  if (order.status === "cancelled") return 0;
  return Math.max(0, numeric(order.total_amount) - paidAmountFromOrder(order));
}

export function isOrderPaid(order: ConsumptionOrderWithDetails) {
  return pendingAmountFromOrder(order) <= 0 && numeric(order.total_amount) > 0;
}

export function pendingFromOrders(orders: ConsumptionOrderWithDetails[]) {
  return orders.reduce((sum, order) => sum + pendingAmountFromOrder(order), 0);
}

export function paidFromOrders(orders: ConsumptionOrderWithDetails[]) {
  return orders.reduce((sum, order) => sum + paidAmountFromOrder(order), 0);
}

export function buildSalesSummary(
  orders: ConsumptionOrderWithDetails[],
): SalesSummary {
  const activeOrders = orders.filter((order) => order.status !== "cancelled");
  const itemMap = new Map<string, SalesSummaryItem>();
  for (const order of activeOrders) {
    for (const item of order.items.filter(
      (entry) => entry.status !== "cancelled",
    )) {
      const current = itemMap.get(item.item_name) ?? {
        itemName: item.item_name,
        quantity: 0,
        total: 0,
      };
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

export async function getActiveSalesMenuItemsForEvent(
  eventId: string,
): Promise<SalesMenuItemOption[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("event_sales_menu_items")
    .select(
      "id, name, category, description, price, unit_label, requires_preparation, active, sort_order",
    )
    .eq("event_id", eventId)
    .eq("active", true)
    .order("category", { ascending: true })
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) return [];
  return (data ?? []) as SalesMenuItemOption[];
}

export type PaymentMethodSummaryItem = {
  method: string;
  label: string;
  total: number;
};

export function buildPaymentMethodSummary(
  orders: ConsumptionOrderWithDetails[],
): PaymentMethodSummaryItem[] {
  const totals = new Map<string, number>();

  for (const order of orders.filter((entry) => entry.status !== "cancelled")) {
    const paidAmount = paidAmountFromOrder(order);
    if (paidAmount <= 0) continue;

    const paymentsWithMethod = order.payments.filter(isPaymentUsableForMethod);
    const totalWithMethod = paymentsWithMethod.reduce(
      (sum, payment) => sum + numeric(payment.amount),
      0,
    );

    if (paymentsWithMethod.length > 0 && totalWithMethod > 0) {
      for (const payment of paymentsWithMethod) {
        totals.set(
          payment.method,
          (totals.get(payment.method) ?? 0) + numeric(payment.amount),
        );
      }

      const residual = paidAmount - totalWithMethod;
      if (residual > 0.009) {
        totals.set("sem_forma", (totals.get("sem_forma") ?? 0) + residual);
      }
      continue;
    }

    if (order.payment_status === "paid") {
      totals.set(
        "sem_forma",
        (totals.get("sem_forma") ?? 0) + paidAmount,
      );
    }
  }

  return Array.from(totals.entries())
    .map(([method, total]) => ({
      method,
      label:
        method === "sem_forma"
          ? "Pago sem forma registrada"
          : paymentMethodLabel(method),
      total,
    }))
    .sort((a, b) => b.total - a.total);
}

export function paymentMethodsFromOrder(order: ConsumptionOrderWithDetails) {
  const methods = Array.from(
    new Set(
      order.payments
        .filter(isPaymentUsableForMethod)
        .map((payment) => paymentMethodLabel(payment.method)),
    ),
  );

  if (methods.length > 0) return methods.join(" + ");
  return order.payment_status === "paid" ? "Pago sem forma registrada" : "";
}

export type CategorySummaryItem = {
  category: string;
  quantity: number;
  total: number;
};

export function buildCategorySummary(
  orders: ConsumptionOrderWithDetails[],
): CategorySummaryItem[] {
  const totals = new Map<string, { quantity: number; total: number }>();

  for (const order of orders.filter((entry) => entry.status !== "cancelled")) {
    for (const item of order.items.filter(
      (entry) => entry.status !== "cancelled",
    )) {
      const category = item.category || "Cardápio";
      const current = totals.get(category) ?? { quantity: 0, total: 0 };
      current.quantity += numeric(item.quantity);
      current.total += numeric(item.total_price);
      totals.set(category, current);
    }
  }

  return Array.from(totals.entries())
    .map(([category, item]) => ({
      category,
      quantity: item.quantity,
      total: item.total,
    }))
    .sort((a, b) => b.total - a.total);
}

const REPORT_TIME_ZONE = "America/Sao_Paulo";
const EVENT_OPERATIONAL_START_HOUR = 12;
const EVENT_OPERATIONAL_END_HOUR = 17;

export type PeriodCategorySummary = {
  period: string;
  category: string;
  quantity: number;
  total: number;
  sortKey: number;
};

export type CancelledDuplicateGroup = {
  responsible: string;
  amount: number;
  quantity: number;
  total: number;
  orderCodes: string[];
  firstCreatedAt: string;
  lastCreatedAt: string;
  sampleReason: string;
  itemSignature: string;
};

function orderShortCode(order: Pick<ConsumptionOrderRow, "id">) {
  return String(order.id).slice(0, 8).toUpperCase();
}

function itemSignatureFromOrder(order: ConsumptionOrderWithDetails) {
  const parts = order.items
    .filter((item) => item.status !== "cancelled")
    .map((item) => `${normalize(item.item_name)}:${numeric(item.quantity)}:${numeric(item.total_price).toFixed(2)}`)
    .sort();
  return parts.join("|") || "sem-itens";
}

function sameDayKey(value: string | Date) {
  const date = value instanceof Date ? value : new Date(value);
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: REPORT_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function buildCancelledDuplicateGroups(
  orders: ConsumptionOrderWithDetails[],
): CancelledDuplicateGroup[] {
  const buckets = new Map<string, ConsumptionOrderWithDetails[]>();

  for (const order of orders.filter((entry) => entry.status === "cancelled")) {
    const responsible = firstNonEmpty(
      order.customer_name,
      order.table_label,
      "Responsável não informado",
    );
    const amount = numeric(order.total_amount);
    const signature = itemSignatureFromOrder(order);
    const key = [
      normalize(responsible),
      amount.toFixed(2),
      sameDayKey(order.created_at),
      signature,
    ].join("::");
    const current = buckets.get(key) ?? [];
    current.push(order);
    buckets.set(key, current);
  }

  return Array.from(buckets.values())
    .filter((group) => group.length >= 2)
    .map((group) => {
      const sorted = [...group].sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      );
      const first = sorted[0]!;
      const last = sorted[sorted.length - 1]!;
      const responsible = firstNonEmpty(
        first.customer_name,
        first.table_label,
        "Responsável não informado",
      );
      const amount = numeric(first.total_amount);
      return {
        responsible,
        amount,
        quantity: sorted.length,
        total: sorted.reduce((sum, order) => sum + numeric(order.total_amount), 0),
        orderCodes: sorted.map(orderShortCode),
        firstCreatedAt: first.created_at,
        lastCreatedAt: last.created_at,
        sampleReason: first.cancellation_reason || "sem motivo",
        itemSignature: itemSignatureFromOrder(first),
      };
    })
    .sort((a, b) => b.total - a.total || b.quantity - a.quantity);
}


function getZonedHour(value: string | Date, timeZone = REPORT_TIME_ZONE) {
  const date = value instanceof Date ? value : new Date(value);
  const parts = new Intl.DateTimeFormat("pt-BR", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);

  const hour = Number(parts.find((part) => part.type === "hour")?.value ?? 0);
  const minute = Number(parts.find((part) => part.type === "minute")?.value ?? 0);
  return { hour, minute };
}

function hourLabel(hour: number) {
  return `${String(hour).padStart(2, "0")}:00–${String(hour + 1).padStart(2, "0")}:00`;
}

function operationalPeriodFor(value: string | Date) {
  const { hour } = getZonedHour(value);

  if (hour < EVENT_OPERATIONAL_START_HOUR) {
    return { period: `Antes de ${String(EVENT_OPERATIONAL_START_HOUR).padStart(2, "0")}:00`, sortKey: EVENT_OPERATIONAL_START_HOUR - 1 };
  }

  if (hour >= EVENT_OPERATIONAL_END_HOUR) {
    return { period: `Após ${String(EVENT_OPERATIONAL_END_HOUR).padStart(2, "0")}:00`, sortKey: EVENT_OPERATIONAL_END_HOUR };
  }

  return { period: hourLabel(hour), sortKey: hour };
}

export function buildPeriodCategorySummary(
  orders: ConsumptionOrderWithDetails[],
): PeriodCategorySummary[] {
  const buckets = new Map<string, PeriodCategorySummary>();

  for (const order of orders.filter((entry) => entry.status !== "cancelled")) {
    const { period, sortKey } = operationalPeriodFor(order.created_at);

    for (const item of order.items.filter(
      (entry) => entry.status !== "cancelled",
    )) {
      const category = item.category || "Cardápio";
      const key = `${sortKey}:${period}:${category}`;
      const current = buckets.get(key) ?? {
        period,
        category,
        quantity: 0,
        total: 0,
        sortKey,
      };
      current.quantity += numeric(item.quantity);
      current.total += numeric(item.total_price);
      buckets.set(key, current);
    }
  }

  return Array.from(buckets.values()).sort((a, b) => {
    const periodDiff = a.sortKey - b.sortKey;
    if (periodDiff !== 0) return periodDiff;
    return b.total - a.total;
  });
}

// Mantido como alias para compatibilidade com imports antigos.
export const buildHourlyItemSummary = buildPeriodCategorySummary;
export type HourlyItemSummary = PeriodCategorySummary;

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
