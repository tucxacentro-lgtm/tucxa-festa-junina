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
  const parsed = Number.parseFloat(text(formData, name).replace(",", "."));
  return Number.isFinite(parsed) ? parsed : fallback;
}

function bool(formData: FormData, name: string) {
  return formData.get(name) === "on";
}


async function syncPlanningItemToSalesMenu(itemId: string) {
  const supabase = createSupabaseAdminClient();
  const { data: item, error } = await supabase
    .from("planning_menu_estimates")
    .select("id, event_id, item_name, category, unit_label, active, sales_price, requires_preparation, is_sales_item, sort_order")
    .eq("id", itemId)
    .maybeSingle();

  if (error || !item) return;

  if (!item.active || item.is_sales_item === false) {
    await supabase
      .from("event_sales_menu_items")
      .update({ active: false, updated_at: new Date().toISOString() })
      .eq("preparation_estimate_id", itemId);
    return;
  }

  const payload = {
    event_id: item.event_id,
    name: item.item_name,
    category: item.category || "Cardápio",
    description: "Item sincronizado a partir do cardápio de preparo/ficha técnica.",
    price: Number(item.sales_price ?? 0),
    unit_label: item.unit_label || "un",
    requires_preparation: Boolean(item.requires_preparation),
    preparation_estimate_id: item.id,
    active: true,
    sort_order: Number(item.sort_order ?? 100),
    updated_at: new Date().toISOString(),
  };

  const { data: existing } = await supabase
    .from("event_sales_menu_items")
    .select("id")
    .eq("preparation_estimate_id", itemId)
    .maybeSingle();

  if (existing?.id) {
    await supabase.from("event_sales_menu_items").update(payload).eq("id", existing.id);
  } else {
    await supabase.from("event_sales_menu_items").upsert(payload, { onConflict: "event_id,name" });
  }
}

async function getEventId() {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.from("events").select("id").eq("slug", "arraia-tucxa-2026").single();
  if (error || !data) throw new Error("Evento arraia-tucxa-2026 não encontrado.");
  return data.id as string;
}

export async function createMenuPlanningItem(formData: FormData) {
  await requireAdmin(["admin", "coordenador"], "/admin/festa-junina/cardapio");
  const supabase = createSupabaseAdminClient();
  const eventId = await getEventId();

  const { data, error } = await supabase
    .from("planning_menu_estimates")
    .insert({
      event_id: eventId,
      item_name: text(formData, "item_name"),
      category: text(formData, "category") || "Cardápio",
      consumption_per_adult: number(formData, "consumption_per_adult", 0),
      consumption_per_child: number(formData, "consumption_per_child", 0),
      unit_label: text(formData, "unit_label") || "un",
      editable_quantity: text(formData, "editable_quantity") ? number(formData, "editable_quantity", 0) : null,
      sales_price: number(formData, "sales_price", 0),
      requires_preparation: bool(formData, "requires_preparation"),
      is_sales_item: bool(formData, "is_sales_item"),
      active: bool(formData, "active"),
      sort_order: number(formData, "sort_order", 100),
    })
    .select("id")
    .single();

  if (error || !data) throw new Error(error?.message ?? "Não foi possível criar item.");
  await syncPlanningItemToSalesMenu(data.id as string);
  revalidatePath("/admin/festa-junina/cardapio");
  revalidatePath("/admin/festa-junina/cliente-resumo");
  redirect(`/admin/festa-junina/cardapio/${data.id}?saved=created`);
}

export async function updateMenuPlanningItem(formData: FormData) {
  await requireAdmin(["admin", "coordenador"], "/admin/festa-junina/cardapio");
  const supabase = createSupabaseAdminClient();
  const id = text(formData, "id");

  const { error } = await supabase
    .from("planning_menu_estimates")
    .update({
      item_name: text(formData, "item_name"),
      category: text(formData, "category") || "Cardápio",
      consumption_per_adult: number(formData, "consumption_per_adult", 0),
      consumption_per_child: number(formData, "consumption_per_child", 0),
      unit_label: text(formData, "unit_label") || "un",
      editable_quantity: text(formData, "editable_quantity") ? number(formData, "editable_quantity", 0) : null,
      sales_price: number(formData, "sales_price", 0),
      requires_preparation: bool(formData, "requires_preparation"),
      is_sales_item: bool(formData, "is_sales_item"),
      active: bool(formData, "active"),
      sort_order: number(formData, "sort_order", 100),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw new Error(error.message);
  await syncPlanningItemToSalesMenu(id);
  revalidatePath("/admin/festa-junina/cardapio");
  revalidatePath("/admin/festa-junina/cliente-resumo");
  revalidatePath(`/admin/festa-junina/cardapio/${id}`);
  redirect(`/admin/festa-junina/cardapio/${id}?saved=item`);
}

export async function addRecipeIngredient(formData: FormData) {
  await requireAdmin(["admin", "coordenador"], "/admin/festa-junina/cardapio");
  const supabase = createSupabaseAdminClient();
  const eventId = await getEventId();
  const estimateId = text(formData, "estimate_id");

  const { error } = await supabase
    .from("planning_recipe_ingredients")
    .insert({
      event_id: eventId,
      estimate_id: estimateId,
      ingredient_name: text(formData, "ingredient_name"),
      ingredient_category: text(formData, "ingredient_category") || "Insumos",
      amount_per_unit: number(formData, "amount_per_unit", 0),
      unit_label: text(formData, "unit_label") || "un",
      notes: text(formData, "notes") || null,
      active: true,
      sort_order: number(formData, "sort_order", 100),
    });

  if (error) throw new Error(error.message);
  revalidatePath(`/admin/festa-junina/cardapio/${estimateId}`);
  redirect(`/admin/festa-junina/cardapio/${estimateId}?saved=ingredient`);
}

export async function updateRecipeIngredient(formData: FormData) {
  await requireAdmin(["admin", "coordenador"], "/admin/festa-junina/cardapio");
  const supabase = createSupabaseAdminClient();
  const id = text(formData, "id");
  const estimateId = text(formData, "estimate_id");

  const { error } = await supabase
    .from("planning_recipe_ingredients")
    .update({
      ingredient_name: text(formData, "ingredient_name"),
      ingredient_category: text(formData, "ingredient_category") || "Insumos",
      amount_per_unit: number(formData, "amount_per_unit", 0),
      unit_label: text(formData, "unit_label") || "un",
      notes: text(formData, "notes") || null,
      active: bool(formData, "active"),
      sort_order: number(formData, "sort_order", 100),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath(`/admin/festa-junina/cardapio/${estimateId}`);
  redirect(`/admin/festa-junina/cardapio/${estimateId}?saved=ingredient`);
}
