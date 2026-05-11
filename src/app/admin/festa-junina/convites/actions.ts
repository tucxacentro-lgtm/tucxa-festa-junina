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
  if (!raw) return 0;
  const normalized = raw.includes(",") ? raw.replace(/\./g, "").replace(",", ".") : raw;
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
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
  revalidatePath("/admin/festa-junina/convites");
}

export async function saveTicketType(formData: FormData) {
  await requireAdmin(["admin", "coordenador"], "/admin/festa-junina/convites");

  const supabase = createSupabaseAdminClient();
  const id = text(formData, "id");
  const eventId = text(formData, "event_id");

  const payload = {
    event_id: eventId,
    name: text(formData, "name"),
    description: nullableText(formData, "description"),
    price: money(formData, "price"),
    sale_mode: text(formData, "sale_mode") || "online",
    is_free: bool(formData, "is_free"),
    active: bool(formData, "active"),
    sort_order: integer(formData, "sort_order", 0),
  };

  const { error } = id
    ? await supabase.from("ticket_types").update(payload).eq("id", id)
    : await supabase.from("ticket_types").insert(payload);

  if (error) throw new Error(error.message);
  refresh();
  redirect("/admin/festa-junina/convites?saved=1");
}
