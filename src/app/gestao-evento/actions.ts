"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseAdminClient } from "@/lib/supabaseServer";

function text(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function numeric(formData: FormData, name: string, fallback = 0) {
  const parsed = Number.parseFloat(text(formData, name).replace(",", "."));
  return Number.isFinite(parsed) ? parsed : fallback;
}

function buildReturnPath(formData: FormData, fallback: string) {
  const returnTo = text(formData, "return_to");
  return returnTo.startsWith("/") ? returnTo : fallback;
}

function withParams(path: string, params: Record<string, string>) {
  const urlParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) urlParams.set(key, value);
  }
  const query = urlParams.toString();
  return `${path}${query ? `?${query}` : ""}`;
}

async function cancelOrders(orderIds: string[], reason: string | null) {
  if (orderIds.length === 0) return;
  const supabase = createSupabaseAdminClient();
  const now = new Date().toISOString();
  const { error } = await supabase
    .from("event_consumption_orders")
    .update({
      status: "cancelled",
      payment_status: "cancelled",
      delivery_status: "cancelled",
      cancellation_reason: reason,
      cancelled_at: now,
      updated_at: now,
    })
    .in("id", orderIds);

  if (error) throw new Error(error.message);

  await supabase
    .from("event_consumption_order_items")
    .update({ status: "cancelled" })
    .in("order_id", orderIds);
}

export async function createServiceResponsible(formData: FormData) {
  const eventId = text(formData, "event_id");
  const eventSlug = text(formData, "event_slug") || "arraia-tucxa-2026";
  const waiterName = text(formData, "waiter_name");
  const responsibleName = text(formData, "responsible_name");
  const responsiblePhone = text(formData, "responsible_phone");
  const settlementMode = text(formData, "settlement_mode") || "fechamento_final";

  if (!eventId || !responsibleName) {
    redirect(withParams("/gestao-evento/garcom", { erro: "campos-obrigatorios" }));
  }

  const supabase = createSupabaseAdminClient();
  const { data: existingSessions, error: sessionError } = await supabase
    .from("event_table_service_sessions")
    .select("id, responsible_name")
    .eq("event_id", eventId)
    .neq("status", "cancelled")
    .ilike("responsible_name", responsibleName);

  if (sessionError) throw new Error(sessionError.message);

  const { data: existingOrders, error: orderError } = await supabase
    .from("event_consumption_orders")
    .select("id, customer_name")
    .eq("event_id", eventId)
    .neq("status", "cancelled")
    .ilike("customer_name", responsibleName);

  if (orderError) throw new Error(orderError.message);

  if ((existingSessions?.length ?? 0) > 0 || (existingOrders?.length ?? 0) > 0) {
    redirect(withParams("/gestao-evento/garcom", { erro: "responsavel-existe", nome: responsibleName }));
  }

  const { data: session, error } = await supabase
    .from("event_table_service_sessions")
    .insert({
      event_id: eventId,
      table_label: responsibleName,
      responsible_name: responsibleName,
      responsible_phone: responsiblePhone || null,
      waiter_name: waiterName || null,
      settlement_mode: settlementMode === "por_pedido" ? "por_pedido" : "fechamento_final",
      status: "open",
    })
    .select("id")
    .single();

  if (error || !session) throw new Error(error?.message ?? "Não foi possível cadastrar o responsável.");

  revalidatePath("/gestao-evento/garcom");
  redirect(withParams(`/cardapio/${eventSlug}`, {
    sessao: String(session.id),
    responsavel: responsibleName,
    garcom: waiterName,
    fechamento: settlementMode === "por_pedido" ? "por_pedido" : "fechamento_final",
  }));
}

export async function registerCashierGroupPayment(formData: FormData) {
  const eventId = text(formData, "event_id");
  const serviceSessionId = text(formData, "service_session_id");
  const responsibleName = text(formData, "responsible_name");
  const method = text(formData, "method") || "pix";
  const amount = numeric(formData, "amount", 0);

  if (!eventId || amount <= 0 || (!serviceSessionId && !responsibleName)) {
    redirect("/gestao-evento/caixa?erro=pagamento-invalido");
  }

  const supabase = createSupabaseAdminClient();
  let query = supabase
    .from("event_consumption_orders")
    .select("id, total_amount")
    .eq("event_id", eventId)
    .neq("status", "cancelled")
    .neq("payment_status", "paid");

  if (serviceSessionId && !serviceSessionId.startsWith("order:")) {
    query = query.eq("service_session_id", serviceSessionId);
  } else {
    query = query.ilike("customer_name", responsibleName);
  }

  const { data: orders, error: ordersError } = await query;
  if (ordersError) throw new Error(ordersError.message);

  const orderRows = (orders ?? []) as Array<{ id: string; total_amount: number | string }>;
  if (orderRows.length === 0) redirect(withParams("/gestao-evento/caixa", { responsavel: serviceSessionId || responsibleName, erro: "sem-pendencias" }));

  const payments = orderRows.map((order) => ({
    event_id: eventId,
    order_id: order.id,
    method,
    amount: Number(order.total_amount ?? 0),
    status: "paid",
    notes: `Pagamento registrado no caixa: ${method}.`,
  }));

  const { error: paymentsError } = await supabase.from("event_consumption_payments").insert(payments);
  if (paymentsError) throw new Error(paymentsError.message);

  const { error: updateError } = await supabase
    .from("event_consumption_orders")
    .update({ payment_status: "paid", updated_at: new Date().toISOString() })
    .in("id", orderRows.map((order) => order.id));

  if (updateError) throw new Error(updateError.message);

  revalidatePath("/gestao-evento/caixa");
  revalidatePath("/gestao-evento/garcom");
  redirect(withParams("/gestao-evento/caixa", { responsavel: serviceSessionId || responsibleName, pago: "1" }));
}


export async function registerCashierOrderPayment(formData: FormData) {
  const eventId = text(formData, "event_id");
  const orderId = text(formData, "order_id");
  const responsibleKey = text(formData, "responsible_key");
  const method = text(formData, "method") || "pix";
  const amount = numeric(formData, "amount", 0);

  if (!eventId || !orderId || amount <= 0) {
    redirect("/gestao-evento/caixa?erro=pagamento-invalido");
  }

  const supabase = createSupabaseAdminClient();
  const { data: order, error: orderError } = await supabase
    .from("event_consumption_orders")
    .select("id, total_amount, status, payment_status")
    .eq("event_id", eventId)
    .eq("id", orderId)
    .maybeSingle();

  if (orderError) throw new Error(orderError.message);
  if (!order || order.status === "cancelled") {
    redirect(withParams("/gestao-evento/caixa", { responsavel: responsibleKey, erro: "pedido-invalido" }));
  }

  if (order.payment_status === "paid") {
    redirect(withParams("/gestao-evento/caixa", { responsavel: responsibleKey, erro: "sem-pendencias" }));
  }

  const { data: previousPayments, error: paymentsReadError } = await supabase
    .from("event_consumption_payments")
    .select("amount, status")
    .eq("order_id", orderId);

  if (paymentsReadError) throw new Error(paymentsReadError.message);

  const total = Number(order.total_amount ?? 0);
  const alreadyPaid = (previousPayments ?? [])
    .filter((payment) => payment.status === "paid")
    .reduce((sum, payment) => sum + Number(payment.amount ?? 0), 0);
  const pending = Math.max(0, total - alreadyPaid);
  const paymentAmount = Math.min(amount, pending || total);

  if (paymentAmount <= 0) {
    redirect(withParams("/gestao-evento/caixa", { responsavel: responsibleKey, erro: "sem-pendencias" }));
  }

  const { error: paymentError } = await supabase.from("event_consumption_payments").insert({
    event_id: eventId,
    order_id: orderId,
    method,
    amount: paymentAmount,
    status: "paid",
    notes: `Pagamento individual registrado no caixa: ${method}.`,
  });

  if (paymentError) throw new Error(paymentError.message);

  const newPending = Math.max(0, pending - paymentAmount);
  const { error: updateError } = await supabase
    .from("event_consumption_orders")
    .update({ payment_status: newPending <= 0 ? "paid" : "registered", updated_at: new Date().toISOString() })
    .eq("id", orderId);

  if (updateError) throw new Error(updateError.message);

  revalidatePath("/gestao-evento/caixa");
  revalidatePath("/gestao-evento/garcom");
  redirect(withParams("/gestao-evento/caixa", { responsavel: responsibleKey, pago: "1" }));
}

export async function cancelConsumptionOrder(formData: FormData) {
  const orderId = text(formData, "order_id");
  const eventSlug = text(formData, "event_slug") || "arraia-tucxa-2026";
  const reason = text(formData, "reason") || "Cancelado pela operação.";
  const fallback = buildReturnPath(formData, "/gestao-evento/garcom");

  if (!orderId) redirect(fallback);

  await cancelOrders([orderId], reason);
  revalidatePath("/gestao-evento/garcom");
  revalidatePath("/gestao-evento/caixa");
  revalidatePath(`/cardapio/${eventSlug}/pedido/${orderId}`);
  revalidatePath("/admin/festa-junina/atendimento/cancelados");
  redirect(`${fallback}${fallback.includes("?") ? "&" : "?"}cancelado=pedido`);
}

export async function cancelConsumptionGroup(formData: FormData) {
  const eventId = text(formData, "event_id");
  const serviceSessionId = text(formData, "service_session_id");
  const responsible = text(formData, "responsible");
  const reason = text(formData, "reason") || "Responsável/pedidos cancelados pela operação.";
  const fallback = buildReturnPath(formData, "/gestao-evento/garcom");

  if (!eventId || (!serviceSessionId && !responsible)) redirect(fallback);

  const supabase = createSupabaseAdminClient();
  let query = supabase
    .from("event_consumption_orders")
    .select("id")
    .eq("event_id", eventId)
    .neq("status", "cancelled");

  if (serviceSessionId && !serviceSessionId.startsWith("order:")) query = query.eq("service_session_id", serviceSessionId);
  else if (responsible) query = query.ilike("customer_name", responsible);

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  const orderIds = ((data ?? []) as Array<{ id: string }>).map((row) => String(row.id));
  await cancelOrders(orderIds, reason);

  if (serviceSessionId && !serviceSessionId.startsWith("order:")) {
    await supabase
      .from("event_table_service_sessions")
      .update({ status: "cancelled", updated_at: new Date().toISOString() })
      .eq("id", serviceSessionId);
  } else if (responsible) {
    await supabase
      .from("event_table_service_sessions")
      .update({ status: "cancelled", updated_at: new Date().toISOString() })
      .eq("event_id", eventId)
      .ilike("responsible_name", responsible);
  }

  revalidatePath("/gestao-evento/garcom");
  revalidatePath("/gestao-evento/caixa");
  revalidatePath("/admin/festa-junina/atendimento/cancelados");
  redirect(`${fallback}${fallback.includes("?") ? "&" : "?"}cancelado=grupo`);
}
