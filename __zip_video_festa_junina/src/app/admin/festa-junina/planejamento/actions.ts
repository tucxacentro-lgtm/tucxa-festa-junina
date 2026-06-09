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
  const raw = text(formData, name).replace(",", ".");
  const parsed = Number.parseFloat(raw);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function bool(formData: FormData, name: string) {
  return formData.get(name) === "on";
}

export async function savePlanningAssumptions(formData: FormData) {
  await requireAdmin(["admin", "coordenador"], "/admin/festa-junina/planejamento");
  const supabase = createSupabaseAdminClient();
  const id = text(formData, "id");

  const { error } = await supabase
    .from("planning_assumptions")
    .update({
      guests_per_table: number(formData, "guests_per_table", 4),
      volunteers_per_50_guests: number(formData, "volunteers_per_50_guests", 3),
      safety_margin_percent: number(formData, "safety_margin_percent", 15),
      notes: text(formData, "notes") || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/festa-junina/planejamento");
  redirect("/admin/festa-junina/planejamento?saved=assumptions");
}

export async function savePlanningEstimate(formData: FormData) {
  await requireAdmin(["admin", "coordenador"], "/admin/festa-junina/planejamento");
  const supabase = createSupabaseAdminClient();
  const id = text(formData, "id");

  const { error } = await supabase
    .from("planning_menu_estimates")
    .update({
      item_name: text(formData, "item_name"),
      category: text(formData, "category"),
      consumption_per_adult: number(formData, "consumption_per_adult", 0),
      consumption_per_child: number(formData, "consumption_per_child", 0),
      unit_label: text(formData, "unit_label") || "un",
      editable_quantity: text(formData, "editable_quantity") ? number(formData, "editable_quantity", 0) : null,
      active: bool(formData, "active"),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/festa-junina/planejamento");
  redirect("/admin/festa-junina/planejamento?saved=estimate");
}

export async function savePlanningIngredient(formData: FormData) {
  await requireAdmin(["admin", "coordenador"], "/admin/festa-junina/planejamento");
  const supabase = createSupabaseAdminClient();
  const id = text(formData, "id");

  const { error } = await supabase
    .from("planning_recipe_ingredients")
    .update({
      ingredient_name: text(formData, "ingredient_name"),
      ingredient_category: text(formData, "ingredient_category") || "Insumos",
      amount_per_unit: number(formData, "amount_per_unit", 0),
      unit_label: text(formData, "unit_label") || "un",
      editable_quantity: text(formData, "editable_quantity") ? number(formData, "editable_quantity", 0) : null,
      purchase_status: text(formData, "purchase_status") || "pending",
      notes: text(formData, "notes") || null,
      active: bool(formData, "active"),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/festa-junina/planejamento");
  redirect("/admin/festa-junina/planejamento?saved=ingredient");
}

export async function saveManualSales(formData: FormData) {
  await requireAdmin(["admin", "coordenador"], "/admin/festa-junina/planejamento");
  const supabase = createSupabaseAdminClient();
  const id = text(formData, "id");
  const payload = {
    event_id: text(formData, "event_id"),
    presale_paid_quantity: number(formData, "presale_paid_quantity", 0),
    door_paid_quantity: number(formData, "door_paid_quantity", 0),
    children_free_quantity: number(formData, "children_free_quantity", 0),
    notes: text(formData, "notes") || null,
    updated_at: new Date().toISOString(),
  };

  const { error } = id
    ? await supabase.from("event_manual_sales").update(payload).eq("id", id)
    : await supabase.from("event_manual_sales").insert(payload);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/festa-junina/planejamento");
  redirect("/admin/festa-junina/planejamento?saved=manual-sales");
}
