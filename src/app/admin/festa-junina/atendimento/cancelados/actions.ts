"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabaseServer";

function text(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

export async function reactivateConsumptionOrder(formData: FormData) {
  await requireAdmin(["admin", "coordenador"], "/admin/festa-junina/atendimento/cancelados");
  const orderId = text(formData, "order_id");
  if (!orderId) redirect("/admin/festa-junina/atendimento/cancelados");

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
  redirect("/admin/festa-junina/atendimento/cancelados?restaurado=1");
}
