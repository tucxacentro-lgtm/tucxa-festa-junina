"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseAdminClient } from "@/lib/supabaseServer";

function text(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function buildReturnPath(formData: FormData, fallback: string) {
  const returnTo = text(formData, "return_to");
  return returnTo.startsWith("/") ? returnTo : fallback;
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
  const eventSlug = text(formData, "event_slug") || "arraia-tucxa-2026";
  const tableLabel = text(formData, "table_label");
  const responsible = text(formData, "responsible");
  const reason = text(formData, "reason") || "Mesa/responsável cancelado pela operação.";
  const fallback = buildReturnPath(formData, "/gestao-evento/garcom");

  if (!eventId || (!tableLabel && !responsible)) redirect(fallback);

  const supabase = createSupabaseAdminClient();
  let query = supabase
    .from("event_consumption_orders")
    .select("id")
    .eq("event_id", eventId)
    .neq("status", "cancelled");

  if (tableLabel) query = query.eq("table_label", tableLabel);
  if (responsible) query = query.eq("customer_name", responsible);

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  const orderIds = (data ?? []).map((row) => String(row.id));
  await cancelOrders(orderIds, reason);

  revalidatePath("/gestao-evento/garcom");
  revalidatePath("/gestao-evento/caixa");
  revalidatePath(`/cardapio/${eventSlug}`);
  revalidatePath("/admin/festa-junina/atendimento/cancelados");
  redirect(`${fallback}${fallback.includes("?") ? "&" : "?"}cancelado=grupo`);
}
