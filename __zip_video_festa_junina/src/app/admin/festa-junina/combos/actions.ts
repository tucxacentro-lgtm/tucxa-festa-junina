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

function money(formData: FormData, name: string) {
  const raw = text(formData, name);
  if (!raw) return null;
  const normalized = raw.includes(",") ? raw.replace(/\./g, "").replace(",", ".") : raw;
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function integer(formData: FormData, name: string, fallback = 0) {
  const parsed = Number.parseInt(text(formData, name), 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function bool(formData: FormData, name: string) {
  return formData.get(name) === "on";
}

function refresh() {
  revalidatePath("/festa-junina");
  revalidatePath("/admin/festa-junina");
  revalidatePath("/admin/festa-junina/combos");
}

export async function saveCombo(formData: FormData) {
  await requireAdmin(["admin", "coordenador"], "/admin/festa-junina/combos");

  const supabase = createSupabaseAdminClient();
  const id = text(formData, "id");
  const eventId = text(formData, "event_id");

  const payload = {
    event_id: eventId,
    name: text(formData, "name"),
    subtitle: nullableText(formData, "subtitle"),
    description: nullableText(formData, "description"),
    price: money(formData, "price") ?? 0,
    compare_at_price: money(formData, "compare_at_price"),
    badge: nullableText(formData, "badge"),
    active: bool(formData, "active"),
    highlighted: bool(formData, "highlighted"),
    includes_bingo: bool(formData, "includes_bingo"),
    bingo_cards_quantity: integer(formData, "bingo_cards_quantity", 0),
    sort_order: integer(formData, "sort_order", 0),
  };

  const { error } = id
    ? await supabase.from("offer_combos").update(payload).eq("id", id)
    : await supabase.from("offer_combos").insert(payload);

  if (error) throw new Error(error.message);
  refresh();
  redirect("/admin/festa-junina/combos?saved=1");
}
