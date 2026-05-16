"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getCurrentEventForAdmin } from "@/lib/current-event";
import { createSupabaseAdminClient } from "@/lib/supabaseServer";
import type { IngredientStatus } from "@/lib/event-purchases";

function text(formData: FormData, name: string) { const value = formData.get(name); return typeof value === "string" ? value.trim() : ""; }
function nullableText(formData: FormData, name: string) { const value = text(formData, name); return value || null; }
function number(formData: FormData, name: string, fallback = 0) { const parsed = Number(text(formData, name).replace(",", ".")); return Number.isFinite(parsed) ? parsed : fallback; }
function integer(formData: FormData, name: string, fallback = 0) { const parsed = Number.parseInt(text(formData, name), 10); return Number.isFinite(parsed) ? parsed : fallback; }
function status(value: string): IngredientStatus { return value === "to_buy" || value === "bought" || value === "stored" || value === "checked" || value === "planned" ? value : "planned"; }
function refresh() { revalidatePath("/admin/festa-junina/compras/insumos"); revalidatePath("/admin/festa-junina/compras/itens-finais"); }

export async function saveIngredient(formData: FormData) {
  await requireAdmin(["admin", "coordenador"], "/admin/festa-junina/compras/insumos");
  const event = await getCurrentEventForAdmin();
  const supabase = createSupabaseAdminClient();
  const id = text(formData, "id");
  const name = text(formData, "name");
  if (!name) redirect("/admin/festa-junina/compras/insumos?error=name");
  const payload = {
    event_id: event.id,
    final_item_id: nullableText(formData, "final_item_id"),
    sales_menu_item_id: nullableText(formData, "sales_menu_item_id"),
    name,
    category: nullableText(formData, "category"),
    planned_quantity: number(formData, "planned_quantity"),
    purchased_quantity: number(formData, "purchased_quantity"),
    unit_label: text(formData, "unit_label") || "un",
    estimated_unit_cost: number(formData, "estimated_unit_cost"),
    actual_unit_cost: number(formData, "actual_unit_cost"),
    supplier_hint: nullableText(formData, "supplier_hint"),
    storage_location: nullableText(formData, "storage_location"),
    status: status(text(formData, "status")),
    notes: nullableText(formData, "notes"),
    active: formData.get("active") !== "off",
    sort_order: integer(formData, "sort_order", 999),
    updated_at: new Date().toISOString(),
  };
  const { error } = id ? await supabase.from("event_purchase_ingredients").update(payload).eq("id", id).eq("event_id", event.id) : await supabase.from("event_purchase_ingredients").insert(payload);
  if (error) throw new Error(error.message);
  refresh();
  redirect("/admin/festa-junina/compras/insumos?saved=1");
}

export async function deactivateIngredient(formData: FormData) {
  await requireAdmin(["admin", "coordenador"], "/admin/festa-junina/compras/insumos");
  const event = await getCurrentEventForAdmin();
  const supabase = createSupabaseAdminClient();
  const id = text(formData, "id");
  if (id) {
    const { error } = await supabase.from("event_purchase_ingredients").update({ active: false, updated_at: new Date().toISOString() }).eq("id", id).eq("event_id", event.id);
    if (error) throw new Error(error.message);
  }
  refresh();
  redirect("/admin/festa-junina/compras/insumos?saved=inactive");
}
