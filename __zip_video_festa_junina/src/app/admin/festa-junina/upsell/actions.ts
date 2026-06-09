"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabaseServer";

function text(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function number(formData: FormData, name: string, fallback = 0) {
  const parsed = Number.parseInt(text(formData, name), 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function bool(formData: FormData, name: string) {
  return formData.get(name) === "on";
}

export async function saveUpsellCampaign(formData: FormData) {
  await requireAdmin(["admin", "coordenador"], "/admin/festa-junina/upsell");
  const id = text(formData, "id");
  const eventId = text(formData, "event_id");
  const supabase = createSupabaseAdminClient();

  const payload = {
    event_id: eventId,
    name: text(formData, "name"),
    description: text(formData, "description") || null,
    active: bool(formData, "active"),
    show_after_purchase: bool(formData, "show_after_purchase"),
    email_after_days: number(formData, "email_after_days", 3),
    whatsapp_message: text(formData, "whatsapp_message") || null,
    updated_at: new Date().toISOString(),
  };

  const { error } = id
    ? await supabase.from("upsell_campaigns").update(payload).eq("id", id)
    : await supabase.from("upsell_campaigns").insert(payload);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/festa-junina/upsell");
  redirect("/admin/festa-junina/upsell?saved=1");
}
