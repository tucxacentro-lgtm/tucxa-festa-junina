"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabaseServer";

function text(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function nullableText(formData: FormData, name: string) {
  const value = text(formData, name);
  return value || null;
}

function bool(formData: FormData, name: string) {
  return formData.get(name) === "on";
}

function integer(formData: FormData, name: string, fallback = 0) {
  const parsed = Number.parseInt(text(formData, name), 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export async function updateEventSettings(formData: FormData) {
  await requireAdmin(["admin", "coordenador"], "/admin/festa-junina/configuracoes");

  const eventId = text(formData, "event_id");

  if (!eventId) {
    throw new Error("Evento não encontrado.");
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("events")
    .update({
      name: text(formData, "name"),
      subtitle: nullableText(formData, "subtitle"),
      description: nullableText(formData, "description"),
      event_date: nullableText(formData, "event_date"),
      start_time: nullableText(formData, "start_time"),
      end_time: nullableText(formData, "end_time"),
      location_name: nullableText(formData, "location_name"),
      location_address: nullableText(formData, "location_address"),
      pix_key: nullableText(formData, "pix_key"),
      pix_receiver_name: nullableText(formData, "pix_receiver_name"),
      year: integer(formData, "year", 2026),
      active_for_sales: bool(formData, "active_for_sales"),
      featured_prize_name: nullableText(formData, "featured_prize_name"),
      featured_prize_description: nullableText(formData, "featured_prize_description"),
      allow_public_sales: bool(formData, "allow_public_sales"),
      allow_combos: bool(formData, "allow_combos"),
      allow_children_free: bool(formData, "allow_children_free"),
      children_free_age_limit: integer(formData, "children_free_age_limit", 10),
      status: text(formData, "status") || "draft",
      updated_at: new Date().toISOString(),
    })
    .eq("id", eventId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/festa-junina");
  revalidatePath("/admin/festa-junina/configuracoes");
  revalidatePath("/admin/festa-junina");

  redirect("/admin/festa-junina/configuracoes?saved=1");
}
