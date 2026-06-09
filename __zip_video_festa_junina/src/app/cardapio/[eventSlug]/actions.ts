"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabaseServer";

function text(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function number(formData: FormData, name: string, fallback = 0) {
  const parsed = Number.parseFloat(text(formData, name).replace(",", "."));
  return Number.isFinite(parsed) ? parsed : fallback;
}

async function getEventBySlug(eventSlug: string) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.from("events").select("id, slug").eq("slug", eventSlug).maybeSingle();
  if (error || !data) throw new Error("Evento não encontrado.");
  return data as { id: string; slug: string };
}

export async function createPublicConsumptionOrder(eventSlug: string, formData: FormData) {
  const event = await getEventBySlug(eventSlug);
  const supabase = createSupabaseAdminClient();

  const { data: items, error: itemsError } = await supabase
    .from("event_sales_menu_items")
    .select("id, name, price")
    .eq("event_id", event.id)
    .eq("active", true);

  if (itemsError) throw new Error(itemsError.message);

  const selected = (items ?? [])
    .map((item) => {
      const quantity = number(formData, `qty_${item.id}`, 0);
      const unitPrice = Number(item.price ?? 0);
      return { item, quantity, unitPrice, total: quantity * unitPrice };
    })
    .filter((entry) => entry.quantity > 0);

  if (selected.length === 0) redirect(`/cardapio/${event.slug}?error=no-items`);

  const totalAmount = selected.reduce((sum, entry) => sum + entry.total, 0);

  const { data: order, error: orderError } = await supabase
    .from("event_consumption_orders")
    .insert({
      event_id: event.id,
      service_session_id: text(formData, "service_session_id") || null,
      order_mode: text(formData, "order_mode") || "individual",
      customer_name: text(formData, "customer_name") || null,
      customer_phone: text(formData, "customer_phone") || null,
      table_label: text(formData, "table_label") || null,
      waiter_name: text(formData, "waiter_name") || null,
      settlement_mode: text(formData, "settlement_mode") || "por_pedido",
      total_amount: totalAmount,
      status: "received",
      payment_status: "pending",
      delivery_status: "pending",
      notes: [
        text(formData, "notes"),
        text(formData, "waiter_name") ? `Garçom: ${text(formData, "waiter_name")}` : "",
        text(formData, "settlement_mode") ? `Fechamento: ${text(formData, "settlement_mode") === "fechamento_final" ? "somente no final" : "pedido a pedido"}` : "",
      ].filter(Boolean).join(" | ") || null,
    })
    .select("id")
    .single();

  if (orderError || !order) throw new Error(orderError?.message ?? "Não foi possível criar pedido.");

  const rows = selected.map((entry) => ({
    event_id: event.id,
    order_id: order.id,
    sales_menu_item_id: entry.item.id,
    item_name: entry.item.name,
    quantity: entry.quantity,
    unit_price: entry.unitPrice,
    total_price: entry.total,
    status: "received",
  }));

  const { error: itemsInsertError } = await supabase.from("event_consumption_order_items").insert(rows);
  if (itemsInsertError) throw new Error(itemsInsertError.message);

  revalidatePath(`/cardapio/${event.slug}`);
  redirect(`/cardapio/${event.slug}/pedido/${order.id}`);
}

export async function registerPublicConsumptionPayment(eventSlug: string, formData: FormData) {
  const supabase = createSupabaseAdminClient();
  const orderId = text(formData, "order_id");
  const eventId = text(formData, "event_id");
  const amount = number(formData, "amount", 0);
  const proof = formData.get("proof_file");
  let proofFilePath: string | null = null;

  if (proof instanceof File && proof.size > 0) {
    const fileExtension = proof.name.split(".").pop()?.toLowerCase() || "bin";
    proofFilePath = `${eventId}/consumo-publico/${orderId}-${Date.now()}.${fileExtension}`;
    const { error: uploadError } = await supabase.storage.from("payment-proofs").upload(proofFilePath, proof, {
      contentType: proof.type || "application/octet-stream",
      upsert: true,
    });
    if (uploadError) throw new Error(uploadError.message);
  }

  const { error } = await supabase.from("event_consumption_payments").insert({
    event_id: eventId,
    order_id: orderId,
    method: text(formData, "method") || "pix",
    amount,
    proof_file_path: proofFilePath,
    notes: text(formData, "notes") || null,
    status: proofFilePath ? "proof_sent" : "registered",
  });
  if (error) throw new Error(error.message);

  await supabase.from("event_consumption_orders").update({ payment_status: proofFilePath ? "proof_sent" : "registered", updated_at: new Date().toISOString() }).eq("id", orderId);
  revalidatePath(`/cardapio/${eventSlug}/pedido/${orderId}`);
  redirect(`/cardapio/${eventSlug}/pedido/${orderId}?saved=payment`);
}

export async function confirmPublicConsumptionDelivery(eventSlug: string, formData: FormData) {
  const supabase = createSupabaseAdminClient();
  const orderId = text(formData, "order_id");
  const { error } = await supabase
    .from("event_consumption_orders")
    .update({ delivery_status: "delivered", status: "delivered", delivered_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq("id", orderId);
  if (error) throw new Error(error.message);
  revalidatePath(`/cardapio/${eventSlug}/pedido/${orderId}`);
  redirect(`/cardapio/${eventSlug}/pedido/${orderId}?saved=delivered`);
}
