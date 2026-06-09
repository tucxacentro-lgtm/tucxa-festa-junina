"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getCurrentEventForAdmin } from "@/lib/current-event";
import { OPERATION_DEFAULTS } from "@/lib/operation-rules";
import { createSupabaseAdminClient } from "@/lib/supabaseServer";

function text(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function bool(formData: FormData, name: string) {
  return formData.get(name) === "on";
}

function valueOrDefault(formData: FormData, name: keyof typeof OPERATION_DEFAULTS) {
  return text(formData, name) || String(OPERATION_DEFAULTS[name]);
}

export async function saveOperationSettings(formData: FormData) {
  await requireAdmin(["admin", "coordenador"], "/admin/festa-junina/operacao/configuracao");
  const event = await getCurrentEventForAdmin();
  const supabase = createSupabaseAdminClient();

  const payload = {
    event_id: event.id,
    sales_source_mode: valueOrDefault(formData, "sales_source_mode"),
    invite_manual_upload_enabled: bool(formData, "invite_manual_upload_enabled"),
    menu_access_mode: valueOrDefault(formData, "menu_access_mode"),
    table_assignment_mode: valueOrDefault(formData, "table_assignment_mode"),
    order_entry_mode: valueOrDefault(formData, "order_entry_mode"),
    paper_ticket_enabled: bool(formData, "paper_ticket_enabled"),
    kitchen_start_required: bool(formData, "kitchen_start_required"),
    kitchen_finish_required: bool(formData, "kitchen_finish_required"),
    separation_required: bool(formData, "separation_required"),
    delivery_mode: valueOrDefault(formData, "delivery_mode"),
    delivery_confirmation_mode: valueOrDefault(formData, "delivery_confirmation_mode"),
    payment_mode: valueOrDefault(formData, "payment_mode"),
    split_payment_enabled: bool(formData, "split_payment_enabled"),
    proof_upload_required: bool(formData, "proof_upload_required"),
    proof_upload_actor: valueOrDefault(formData, "proof_upload_actor"),
    tv_pickup_enabled: bool(formData, "tv_pickup_enabled"),
    notes: text(formData, "notes") || null,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from("event_operation_settings")
    .upsert(payload, { onConflict: "event_id" });

  if (error) throw new Error(error.message);

  revalidatePath("/admin/festa-junina/operacao/configuracao");
  revalidatePath("/admin/festa-junina");
  redirect("/admin/festa-junina/operacao/configuracao?saved=1");
}
