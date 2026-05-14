"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { getCurrentEventForAdmin } from "@/lib/current-event";
import { createSupabaseAdminClient } from "@/lib/supabaseServer";

function text(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function number(formData: FormData, name: string, fallback = 0) {
  const parsed = Number.parseFloat(text(formData, name).replace(",", "."));
  return Number.isFinite(parsed) ? parsed : fallback;
}

export async function createConsumptionOrder(formData: FormData) {
  await requireAdmin(["admin", "coordenador", "caixa", "garcom"], "/admin/festa-junina/cliente-resumo");
  const event = await getCurrentEventForAdmin();
  const supabase = createSupabaseAdminClient();

  const customerName = text(formData, "customer_name") || null;
  const customerPhone = text(formData, "customer_phone") || null;
  const tableLabel = text(formData, "table_label") || null;
  const orderMode = text(formData, "order_mode") || "individual";
  const notes = text(formData, "notes") || null;

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

  if (selected.length === 0) redirect("/admin/festa-junina/cliente-resumo?error=no-items");

  const totalAmount = selected.reduce((sum, entry) => sum + entry.total, 0);

  const { data: order, error: orderError } = await supabase
    .from("event_consumption_orders")
    .insert({
      event_id: event.id,
      customer_name: customerName,
      customer_phone: customerPhone,
      table_label: tableLabel,
      order_mode: orderMode,
      total_amount: totalAmount,
      status: "received",
      payment_status: "pending",
      delivery_status: "pending",
      notes,
    })
    .select("id")
    .single();

  if (orderError || !order) throw new Error(orderError?.message ?? "Não foi possível criar pedido.");

  const rows = selected.map((entry) => ({
    order_id: order.id,
    event_id: event.id,
    sales_menu_item_id: entry.item.id,
    item_name: entry.item.name,
    quantity: entry.quantity,
    unit_price: entry.unitPrice,
    total_price: entry.total,
    status: "received",
  }));

  const { error: orderItemsError } = await supabase.from("event_consumption_order_items").insert(rows);
  if (orderItemsError) throw new Error(orderItemsError.message);

  revalidatePath("/admin/festa-junina/cliente-resumo");
  redirect(`/admin/festa-junina/consumo/${order.id}`);
}

export async function registerConsumptionPayment(formData: FormData) {
  await requireAdmin(["admin", "coordenador", "caixa", "garcom"], "/admin/festa-junina/cliente-resumo");
  const supabase = createSupabaseAdminClient();
  const orderId = text(formData, "order_id");
  const eventId = text(formData, "event_id");
  const method = text(formData, "method") || "pix";
  const amount = number(formData, "amount", 0);
  const notes = text(formData, "notes") || null;
  const proof = formData.get("proof_file");
  let proofFilePath: string | null = null;

  if (proof instanceof File && proof.size > 0) {
    const fileExtension = proof.name.split(".").pop()?.toLowerCase() || "bin";
    proofFilePath = `${eventId}/consumo/${orderId}-${Date.now()}.${fileExtension}`;
    const { error: uploadError } = await supabase.storage.from("payment-proofs").upload(proofFilePath, proof, {
      contentType: proof.type || "application/octet-stream",
      upsert: true,
    });
    if (uploadError) throw new Error(uploadError.message);
  }

  const { error } = await supabase.from("event_consumption_payments").insert({
    event_id: eventId,
    order_id: orderId,
    method,
    amount,
    proof_file_path: proofFilePath,
    notes,
    status: proofFilePath ? "proof_sent" : "registered",
  });
  if (error) throw new Error(error.message);

  await supabase.from("event_consumption_orders").update({ payment_status: proofFilePath ? "proof_sent" : "registered", updated_at: new Date().toISOString() }).eq("id", orderId);
  revalidatePath(`/admin/festa-junina/consumo/${orderId}`);
  redirect(`/admin/festa-junina/consumo/${orderId}?saved=payment`);
}

export async function confirmConsumptionDelivery(formData: FormData) {
  await requireAdmin(["admin", "coordenador", "garcom"], "/admin/festa-junina/cliente-resumo");
  const supabase = createSupabaseAdminClient();
  const orderId = text(formData, "order_id");
  const { error } = await supabase
    .from("event_consumption_orders")
    .update({ delivery_status: "delivered", status: "delivered", delivered_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq("id", orderId);
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/festa-junina/consumo/${orderId}`);
  redirect(`/admin/festa-junina/consumo/${orderId}?saved=delivered`);
}
