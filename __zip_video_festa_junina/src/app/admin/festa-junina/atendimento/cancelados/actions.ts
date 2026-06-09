"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabaseServer";

function text(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function safeReturnTo(formData: FormData) {
  const returnTo = text(formData, "return_to");
  return returnTo.startsWith("/admin/festa-junina/atendimento/cancelados") ? returnTo : "/admin/festa-junina/atendimento/cancelados";
}

function appendStatus(path: string, key: string, value: string) {
  return `${path}${path.includes("?") ? "&" : "?"}${key}=${value}`;
}

export async function reactivateConsumptionOrder(formData: FormData) {
  await requireAdmin(["admin", "coordenador"], "/admin/festa-junina/atendimento/cancelados");
  const orderId = text(formData, "order_id");
  const returnTo = safeReturnTo(formData);
  if (!orderId) redirect(returnTo);

  const supabase = createSupabaseAdminClient();
  const now = new Date().toISOString();
  const { error } = await supabase
    .from("event_consumption_orders")
    .update({
      status: "received",
      payment_status: "pending",
      delivery_status: "pending",
      cancellation_reason: null,
      cancelled_at: null,
      updated_at: now,
    })
    .eq("id", orderId);

  if (error) throw new Error(error.message);

  await supabase.from("event_consumption_order_items").update({ status: "received" }).eq("order_id", orderId);
  revalidatePath("/admin/festa-junina/atendimento/cancelados");
  revalidatePath("/gestao-evento/garcom");
  revalidatePath("/gestao-evento/caixa");
  redirect(appendStatus(returnTo, "restaurado", "1"));
}


export async function permanentlyDeleteConsumptionOrder(formData: FormData) {
  await requireAdmin(["admin", "coordenador"], "/admin/festa-junina/atendimento/cancelados");
  const orderId = text(formData, "order_id");
  const returnTo = safeReturnTo(formData);
  if (!orderId) redirect(returnTo);

  const supabase = createSupabaseAdminClient();

  const { data: order, error: readError } = await supabase
    .from("event_consumption_orders")
    .select("id, status")
    .eq("id", orderId)
    .maybeSingle();

  if (readError) throw new Error(readError.message);
  if (!order || order.status !== "cancelled") {
    redirect(appendStatus(returnTo, "erro", "nao-cancelado"));
  }

  const { error: paymentsError } = await supabase.from("event_consumption_payments").delete().eq("order_id", orderId);
  if (paymentsError) throw new Error(paymentsError.message);

  const { error: itemsError } = await supabase.from("event_consumption_order_items").delete().eq("order_id", orderId);
  if (itemsError) throw new Error(itemsError.message);

  const { error: orderError } = await supabase.from("event_consumption_orders").delete().eq("id", orderId);
  if (orderError) throw new Error(orderError.message);

  revalidatePath("/admin/festa-junina/atendimento/cancelados");
  revalidatePath("/gestao-evento/garcom");
  revalidatePath("/gestao-evento/caixa");
  redirect(appendStatus(returnTo, "excluido", "1"));
}
