import { createSupabaseAdminClient } from "@/lib/supabaseServer";

export type ConsumptionOrderRow = {
  id: string;
  event_id: string;
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
    free: "Cortesia",
  };
  return labels[value] ?? value;
}
