"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabaseServer";

function text(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function bool(formData: FormData, name: string) {
  return formData.get(name) === "on";
}

async function getEventId() {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.from("events").select("id").eq("slug", "arraia-tucxa-2026").single();
  if (error || !data) throw new Error("Evento não encontrado.");
  return data.id as string;
}

export async function createStorageLocation(formData: FormData) {
  await requireAdmin(["admin", "coordenador"], "/admin/festa-junina/operacao");
  const supabase = createSupabaseAdminClient();
  const eventId = await getEventId();

  const { error } = await supabase.from("event_storage_locations").insert({
    event_id: eventId,
    name: text(formData, "name"),
    responsible_name: text(formData, "responsible_name") || null,
    item_group: text(formData, "item_group") || null,
    status: text(formData, "status") || "pending",
    notes: text(formData, "notes") || null,
  });

  if (error) throw new Error(error.message);
  revalidatePath("/admin/festa-junina/operacao");
  redirect("/admin/festa-junina/operacao?saved=storage");
}

export async function updateStorageLocation(formData: FormData) {
  await requireAdmin(["admin", "coordenador"], "/admin/festa-junina/operacao");
  const supabase = createSupabaseAdminClient();
  const id = text(formData, "id");

  const { error } = await supabase.from("event_storage_locations").update({
    name: text(formData, "name"),
    responsible_name: text(formData, "responsible_name") || null,
    item_group: text(formData, "item_group") || null,
    status: text(formData, "status") || "pending",
    notes: text(formData, "notes") || null,
    active: bool(formData, "active"),
    updated_at: new Date().toISOString(),
  }).eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/festa-junina/operacao");
  redirect("/admin/festa-junina/operacao?saved=storage");
}

export async function createSimulationRun(formData: FormData) {
  await requireAdmin(["admin", "coordenador"], "/admin/festa-junina/operacao");
  const supabase = createSupabaseAdminClient();
  const eventId = await getEventId();

  const { error } = await supabase.from("event_simulation_runs").insert({
    event_id: eventId,
    name: text(formData, "name"),
    scenario: text(formData, "scenario") || null,
    status: text(formData, "status") || "planned",
    responsible_name: text(formData, "responsible_name") || null,
    notes: text(formData, "notes") || null,
  });

  if (error) throw new Error(error.message);
  revalidatePath("/admin/festa-junina/operacao");
  redirect("/admin/festa-junina/operacao?saved=simulation");
}

export async function updateSimulationRun(formData: FormData) {
  await requireAdmin(["admin", "coordenador"], "/admin/festa-junina/operacao");
  const supabase = createSupabaseAdminClient();
  const id = text(formData, "id");

  const { error } = await supabase.from("event_simulation_runs").update({
    name: text(formData, "name"),
    scenario: text(formData, "scenario") || null,
    status: text(formData, "status") || "planned",
    responsible_name: text(formData, "responsible_name") || null,
    notes: text(formData, "notes") || null,
    updated_at: new Date().toISOString(),
  }).eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/festa-junina/operacao");
  redirect("/admin/festa-junina/operacao?saved=simulation");
}
