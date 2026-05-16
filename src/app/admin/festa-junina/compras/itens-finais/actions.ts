"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getCurrentEventForAdmin } from "@/lib/current-event";
import { createSupabaseAdminClient } from "@/lib/supabaseServer";
import type { FinalItemStatus } from "@/lib/event-purchases";

function text(formData: FormData, name: string) { const value = formData.get(name); return typeof value === "string" ? value.trim() : ""; }
function nullableText(formData: FormData, name: string) { const value = text(formData, name); return value || null; }
function number(formData: FormData, name: string, fallback = 0) { const parsed = Number(text(formData, name).replace(",", ".")); return Number.isFinite(parsed) ? parsed : fallback; }
function integer(formData: FormData, name: string, fallback = 0) { const parsed = Number.parseInt(text(formData, name), 10); return Number.isFinite(parsed) ? parsed : fallback; }
function status(value: string): FinalItemStatus { return value === "to_buy" || value === "bought" || value === "preparing" || value === "ready" || value === "unavailable" || value === "planned" ? value : "planned"; }
function refresh() { revalidatePath("/admin/festa-junina/compras/itens-finais"); revalidatePath("/admin/festa-junina/compras/insumos"); }

export async function saveFinalItem(formData: FormData) {
  await requireAdmin(["admin", "coordenador"], "/admin/festa-junina/compras/itens-finais");
  const event = await getCurrentEventForAdmin();
  const supabase = createSupabaseAdminClient();
  const id = text(formData, "id");
  const name = text(formData, "name");
  if (!name) redirect("/admin/festa-junina/compras/itens-finais?error=name");
  const payload = {
    event_id: event.id,
    sales_menu_item_id: nullableText(formData, "sales_menu_item_id"),
    name,
    category: nullableText(formData, "category"),
    item_type: text(formData, "item_type") || "ready_for_sale",
    planned_quantity: number(formData, "planned_quantity"),
    purchased_quantity: number(formData, "purchased_quantity"),
    consumed_quantity: number(formData, "consumed_quantity"),
    unit_label: text(formData, "unit_label") || "un",
    sales_price: number(formData, "sales_price"),
    estimated_cost: number(formData, "estimated_cost"),
    actual_cost: number(formData, "actual_cost"),
    storage_location: nullableText(formData, "storage_location"),
    status: status(text(formData, "status")),
    notes: nullableText(formData, "notes"),
    active: formData.get("active") !== "off",
    sort_order: integer(formData, "sort_order", 999),
    updated_at: new Date().toISOString(),
  };
  const { error } = id ? await supabase.from("event_purchase_final_items").update(payload).eq("id", id).eq("event_id", event.id) : await supabase.from("event_purchase_final_items").insert(payload);
  if (error) throw new Error(error.message);
  refresh();
  redirect("/admin/festa-junina/compras/itens-finais?saved=1");
}

export async function deactivateFinalItem(formData: FormData) {
  await requireAdmin(["admin", "coordenador"], "/admin/festa-junina/compras/itens-finais");
  const event = await getCurrentEventForAdmin();
  const supabase = createSupabaseAdminClient();
  const id = text(formData, "id");
  if (id) {
    const { error } = await supabase.from("event_purchase_final_items").update({ active: false, updated_at: new Date().toISOString() }).eq("id", id).eq("event_id", event.id);
    if (error) throw new Error(error.message);
  }
  refresh();
  redirect("/admin/festa-junina/compras/itens-finais?saved=inactive");
}
