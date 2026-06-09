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

function decimal(formData: FormData, name: string, fallback = 0) {
  const parsed = Number.parseFloat(text(formData, name).replace(",", "."));
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
    venue_site_url: nullableText(formData, "venue_site_url"),
    venue_contact_email: nullableText(formData, "venue_contact_email"),
    venue_contact_phone: nullableText(formData, "venue_contact_phone"),
    venue_rating_label: nullableText(formData, "venue_rating_label"),
    venue_description: nullableText(formData, "venue_description"),
    covered_hall_capacity: integer(formData, "covered_hall_capacity", 80),
    operational_capacity: integer(formData, "operational_capacity", 80),
    event_duration_hours: decimal(formData, "event_duration_hours", 5),
    average_stay_hours: decimal(formData, "average_stay_hours", 4),
    safety_margin_percent: decimal(formData, "safety_margin_percent", 15),
    estimated_tables: integer(formData, "estimated_tables", 20),
    estimated_chairs: integer(formData, "estimated_chairs", 80),
    has_gourmet_area: bool(formData, "has_gourmet_area"),
    has_barbecue_grill: bool(formData, "has_barbecue_grill"),
    has_freezer: bool(formData, "has_freezer"),
    freezer_count: integer(formData, "freezer_count", 1),
    has_refrigerator: bool(formData, "has_refrigerator"),
    refrigerator_count: integer(formData, "refrigerator_count", 1),
    has_water_fountain: bool(formData, "has_water_fountain"),
    has_gas_stove: bool(formData, "has_gas_stove"),
    has_wood_stove: bool(formData, "has_wood_stove"),
    has_heated_pool: bool(formData, "has_heated_pool"),
    has_kids_pool_area: bool(formData, "has_kids_pool_area"),
    has_covered_hall: bool(formData, "has_covered_hall"),
    has_tables: bool(formData, "has_tables"),
    has_chairs: bool(formData, "has_chairs"),
    has_ventilation: bool(formData, "has_ventilation"),
    has_sound_system: bool(formData, "has_sound_system"),
    venue_resources_notes: nullableText(formData, "venue_resources_notes"),
    capacity_notes: nullableText(formData, "capacity_notes"),
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
