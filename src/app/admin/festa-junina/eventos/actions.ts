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

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function revalidateAdminAndPublic() {
  revalidatePath("/admin/festa-junina");
  revalidatePath("/admin/festa-junina/eventos");
  revalidatePath("/festa-junina");
}

export async function saveEvent(formData: FormData) {
  await requireAdmin(["admin", "coordenador"], "/admin/festa-junina/eventos");
  const supabase = createSupabaseAdminClient();
  const id = text(formData, "id");
  const name = text(formData, "name");
  const year = integer(formData, "year", new Date().getFullYear());
  const slug = text(formData, "slug") || slugify(`${name}-${year}`);

  const payload = {
    slug,
    name,
    year,
    subtitle: nullableText(formData, "subtitle"),
    description: nullableText(formData, "description"),
    event_date: nullableText(formData, "event_date"),
    start_time: nullableText(formData, "start_time"),
    end_time: nullableText(formData, "end_time"),
    location_name: nullableText(formData, "location_name"),
    location_address: nullableText(formData, "location_address"),
    status: text(formData, "status") || "draft",
    active_for_sales: bool(formData, "active_for_sales"),
    allow_public_sales: bool(formData, "allow_public_sales"),
    allow_combos: bool(formData, "allow_combos"),
    allow_children_free: bool(formData, "allow_children_free"),
    children_free_age_limit: integer(formData, "children_free_age_limit", 10),
    featured_prize_name: nullableText(formData, "featured_prize_name"),
    featured_prize_description: nullableText(formData, "featured_prize_description"),
    updated_at: new Date().toISOString(),
  };

  const { error } = id ? await supabase.from("events").update(payload).eq("id", id) : await supabase.from("events").insert(payload);
  if (error) throw new Error(error.message);

  revalidateAdminAndPublic();
  redirect(id ? "/admin/festa-junina/eventos?saved=1" : "/admin/festa-junina/eventos?created=1");
}

export async function openEvent(formData: FormData) {
  await requireAdmin(["admin", "coordenador"], "/admin/festa-junina/eventos");
  const eventId = text(formData, "event_id");
  if (!eventId) redirect("/admin/festa-junina/eventos?error=missing-event");

  const supabase = createSupabaseAdminClient();

  const { error: clearError } = await supabase.from("events").update({ active_for_sales: false, updated_at: new Date().toISOString() }).neq("id", eventId);
  if (clearError) throw new Error(clearError.message);

  const { error } = await supabase.from("events").update({ active_for_sales: true, updated_at: new Date().toISOString() }).eq("id", eventId);
  if (error) throw new Error(error.message);

  revalidateAdminAndPublic();
  redirect("/admin/festa-junina");
}
