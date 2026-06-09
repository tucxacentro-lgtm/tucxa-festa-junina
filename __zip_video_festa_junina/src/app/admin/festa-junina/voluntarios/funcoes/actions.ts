"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getCurrentEventForAdmin } from "@/lib/current-event";
import { createSupabaseAdminClient } from "@/lib/supabaseServer";
import { buildFunctionKey, DEFAULT_VOLUNTEER_FUNCTIONS, type VolunteerFunctionStatus } from "@/lib/volunteer-functions";

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

function normalizeStatus(value: string): VolunteerFunctionStatus {
  if (value === "suggested" || value === "confirmed" || value === "needs_people" || value === "inactive") return value;
  return "suggested";
}

function refresh() {
  revalidatePath("/admin/festa-junina/voluntarios/funcoes");
  revalidatePath("/admin/festa-junina/voluntarios");
  revalidatePath("/admin/festa-junina");
}

export async function seedVolunteerFunctions() {
  await requireAdmin(["admin", "coordenador"], "/admin/festa-junina/voluntarios/funcoes");
  const event = await getCurrentEventForAdmin();
  const supabase = createSupabaseAdminClient();
  const now = new Date().toISOString();

  for (const item of DEFAULT_VOLUNTEER_FUNCTIONS) {
    const { error } = await supabase.from("event_volunteer_functions").upsert(
      {
        event_id: event.id,
        ...item,
        status: "suggested",
        active: true,
        updated_at: now,
      },
      { onConflict: "event_id,function_key" },
    );
    if (error) throw new Error(error.message);
  }

  refresh();
  redirect("/admin/festa-junina/voluntarios/funcoes?saved=defaults");
}

export async function saveVolunteerFunction(formData: FormData) {
  await requireAdmin(["admin", "coordenador"], "/admin/festa-junina/voluntarios/funcoes");
  const event = await getCurrentEventForAdmin();
  const supabase = createSupabaseAdminClient();
  const id = text(formData, "id");
  const name = text(formData, "name");

  if (!name) redirect("/admin/festa-junina/voluntarios/funcoes?error=name");

  const payload = {
    event_id: event.id,
    function_key: text(formData, "function_key") || buildFunctionKey(name),
    name,
    area: nullableText(formData, "area"),
    description: nullableText(formData, "description"),
    suggested_quantity: integer(formData, "suggested_quantity", 1),
    confirmed_quantity: integer(formData, "confirmed_quantity", 0),
    shift_label: nullableText(formData, "shift_label"),
    responsibilities: nullableText(formData, "responsibilities"),
    notes: nullableText(formData, "notes"),
    status: normalizeStatus(text(formData, "status")),
    active: bool(formData, "active"),
    sort_order: integer(formData, "sort_order", 999),
    updated_at: new Date().toISOString(),
  };

  const { error } = id
    ? await supabase.from("event_volunteer_functions").update(payload).eq("id", id).eq("event_id", event.id)
    : await supabase.from("event_volunteer_functions").insert(payload);

  if (error) throw new Error(error.message);
  refresh();
  redirect("/admin/festa-junina/voluntarios/funcoes?saved=function");
}

export async function deactivateVolunteerFunction(formData: FormData) {
  await requireAdmin(["admin", "coordenador"], "/admin/festa-junina/voluntarios/funcoes");
  const event = await getCurrentEventForAdmin();
  const supabase = createSupabaseAdminClient();
  const id = text(formData, "id");

  if (id) {
    const { error } = await supabase
      .from("event_volunteer_functions")
      .update({ active: false, status: "inactive", updated_at: new Date().toISOString() })
      .eq("id", id)
      .eq("event_id", event.id);
    if (error) throw new Error(error.message);
  }

  refresh();
  redirect("/admin/festa-junina/voluntarios/funcoes?saved=inactive");
}
