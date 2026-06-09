"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabaseServer";
import { getCurrentEventForAdmin } from "@/lib/current-event";

function text(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function revalidateOperationPages() {
  revalidatePath("/admin/festa-junina");
  revalidatePath("/admin/festa-junina/atendimento/pedidos");
  revalidatePath("/admin/festa-junina/preparo");
  revalidatePath("/admin/festa-junina/retirada");
  revalidatePath("/admin/festa-junina/entrega");
  revalidatePath("/gestao-evento/garcom");
  revalidatePath("/gestao-evento/caixa");
}

export async function updateConsumptionOrderStatus(formData: FormData) {
  await requireAdmin(["admin", "coordenador", "caixa"], "/admin/festa-junina/atendimento/pedidos");
  const event = await getCurrentEventForAdmin();
  const orderId = text(formData, "order_id");
  const status = text(formData, "status");
  const deliveryStatus = text(formData, "delivery_status");
  const paymentStatus = text(formData, "payment_status");

  if (!orderId) return;

  const allowedStatus = new Set(["received", "preparing", "ready", "delivered", "cancelled"]);
  const allowedDelivery = new Set(["pending", "delivered"]);
  const allowedPayment = new Set(["pending", "registered", "proof_sent", "paid", "cancelled"]);

  const payload: Record<string, string> = { updated_at: new Date().toISOString() };
  if (allowedStatus.has(status)) payload.status = status;
  if (allowedDelivery.has(deliveryStatus)) payload.delivery_status = deliveryStatus;
  if (allowedPayment.has(paymentStatus)) payload.payment_status = paymentStatus;
  if (payload.status === "delivered" || payload.delivery_status === "delivered") payload.delivered_at = new Date().toISOString();

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("event_consumption_orders").update(payload).eq("id", orderId).eq("event_id", event.id);
  if (error) throw new Error(error.message);

  revalidateOperationPages();
}

export async function markTicketCheckin(formData: FormData) {
  await requireAdmin(["admin", "coordenador"], "/admin/festa-junina/checkin");
  const event = await getCurrentEventForAdmin();
  const orderId = text(formData, "order_id");
  const buyerCode = text(formData, "buyer_code");
  const buyerName = text(formData, "buyer_name");
  const notes = text(formData, "notes");
  if (!orderId) return;

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("event_ticket_checkins").upsert(
    {
      event_id: event.id,
      ticket_order_id: orderId,
      buyer_code: buyerCode,
      buyer_name: buyerName,
      notes: notes || null,
      status: "checked_in",
      checked_in_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "event_id,ticket_order_id" },
  );
  if (error) throw new Error(error.message);

  revalidatePath("/admin/festa-junina/checkin");
}
