"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabaseServer";
import type { AdminMenuStatus } from "@/lib/admin-menu";

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

function sanitizeStatus(value: string): AdminMenuStatus {
  if (value === "not_used" || value === "suggested" || value === "configuring" || value === "in_use" || value === "done") return value;
  return "suggested";
}

function safeKey(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9_\-]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 80);
}

function revalidateMenu() {
  revalidatePath("/admin/festa-junina");
  revalidatePath("/admin/festa-junina/menu");
  revalidatePath("/admin/festa-junina/eventos");
}

function buildRoutePath(itemKey: string, routePath: string | null, templateKey: string | null) {
  if (routePath) return routePath;
  if (templateKey) return `/admin/festa-junina/modulo/${itemKey}`;
  return null;
}

export async function saveMenuItemComplete(formData: FormData) {
  await requireAdmin(["admin", "coordenador"], "/admin/festa-junina/menu");

  const supabase = createSupabaseAdminClient();
  const rawKey = text(formData, "item_key");
  const label = text(formData, "label");
  const itemKey = safeKey(rawKey || label);
  const eventId = text(formData, "event_id");
  const templateKey = nullableText(formData, "template_key");

  if (!itemKey || !label) redirect("/admin/festa-junina/menu?error=missing-menu-item");

  const catalogPayload = {
    item_key: itemKey,
    label,
    description: nullableText(formData, "description"),
    section: text(formData, "section") || "Geral",
    parent_key: nullableText(formData, "parent_key"),
    route_path: buildRoutePath(itemKey, nullableText(formData, "route_path"), templateKey),
    icon_key: nullableText(formData, "icon_key"),
    sort_order: integer(formData, "sort_order", 0),
    default_enabled: bool(formData, "default_enabled"),
    implemented: bool(formData, "implemented"),
    active: bool(formData, "active"),
    not_implemented_message: nullableText(formData, "not_implemented_message"),
    template_key: templateKey,
    is_deletable: bool(formData, "is_deletable"),
    opens_in_new_tab: bool(formData, "opens_in_new_tab"),
    deleted_at: null,
    updated_at: new Date().toISOString(),
  };

  const { data: catalogItem, error } = await supabase
    .from("admin_menu_items")
    .upsert(catalogPayload, { onConflict: "item_key" })
    .select("id,item_key,sort_order")
    .single();

  if (error) throw new Error(error.message);

  if (eventId) {
    const eventPayload = {
      event_id: eventId,
      menu_item_id: catalogItem?.id ?? null,
      item_key: itemKey,
      enabled: true,
      status: sanitizeStatus(text(formData, "status")),
      custom_label: nullableText(formData, "custom_label"),
      sort_order: integer(formData, "event_sort_order", integer(formData, "sort_order", 0)),
      notes: nullableText(formData, "notes"),
      responsible_name: nullableText(formData, "responsible_name"),
      updated_at: new Date().toISOString(),
    };

    const { error: eventError } = await supabase.from("event_menu_items").upsert(eventPayload, { onConflict: "event_id,item_key" });
    if (eventError) throw new Error(eventError.message);
  }

  revalidateMenu();
  redirect("/admin/festa-junina/menu?saved=item");
}

export async function saveGlobalMenuItem(formData: FormData) {
  return saveMenuItemComplete(formData);
}

export async function saveEventMenuItem(formData: FormData) {
  await requireAdmin(["admin", "coordenador"], "/admin/festa-junina/menu");

  const supabase = createSupabaseAdminClient();
  const eventId = text(formData, "event_id");
  const menuItemId = text(formData, "menu_item_id");
  const itemKey = text(formData, "item_key");

  if (!eventId || !itemKey) redirect("/admin/festa-junina/menu?error=missing-event-menu");

  const payload = {
    event_id: eventId,
    menu_item_id: menuItemId || null,
    item_key: itemKey,
    enabled: true,
    status: sanitizeStatus(text(formData, "status")),
    custom_label: nullableText(formData, "custom_label"),
    sort_order: integer(formData, "sort_order", 0),
    notes: nullableText(formData, "notes"),
    responsible_name: nullableText(formData, "responsible_name"),
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase.from("event_menu_items").upsert(payload, { onConflict: "event_id,item_key" });
  if (error) throw new Error(error.message);

  revalidateMenu();
  redirect("/admin/festa-junina/menu?saved=evento");
}

export async function deactivateMenuItem(formData: FormData) {
  await requireAdmin(["admin", "coordenador"], "/admin/festa-junina/menu");

  const itemKey = text(formData, "item_key");
  if (!itemKey) redirect("/admin/festa-junina/menu?error=missing-key");

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("admin_menu_items")
    .update({ active: false, deleted_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq("item_key", itemKey);

  if (error) throw new Error(error.message);

  revalidateMenu();
  redirect("/admin/festa-junina/menu?saved=removed");
}

export async function createEventMenuDefaults(formData: FormData) {
  await requireAdmin(["admin", "coordenador"], "/admin/festa-junina/menu");
  const eventId = text(formData, "event_id");
  if (!eventId) redirect("/admin/festa-junina/menu?error=missing-event");

  const supabase = createSupabaseAdminClient();
  const { data: catalog, error: catalogError } = await supabase
    .from("admin_menu_items")
    .select("id,item_key,default_enabled,sort_order")
    .eq("active", true);
  if (catalogError) throw new Error(catalogError.message);

  const rows = (catalog ?? []).map((item) => ({
    event_id: eventId,
    menu_item_id: item.id,
    item_key: item.item_key,
    enabled: true,
    status: item.default_enabled ? "suggested" : "not_used",
    sort_order: item.sort_order,
    updated_at: new Date().toISOString(),
  }));

  if (rows.length) {
    const { error } = await supabase.from("event_menu_items").upsert(rows, { onConflict: "event_id,item_key" });
    if (error) throw new Error(error.message);
  }

  revalidateMenu();
  redirect("/admin/festa-junina/menu?saved=defaults");
}
