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

export async function createVolunteer(formData: FormData) {
  await requireAdmin(["admin", "coordenador"], "/admin/festa-junina/voluntarios");
  const supabase = createSupabaseAdminClient();
  const eventId = await getEventId();

  const { error } = await supabase.from("event_volunteers").insert({
    event_id: eventId,
    name: text(formData, "name"),
    whatsapp: text(formData, "whatsapp") || null,
    email: text(formData, "email") || null,
    role: text(formData, "role") || "Apoio geral",
    availability: text(formData, "availability") || null,
    notes: text(formData, "notes") || null,
    active: true,
  });

  if (error) throw new Error(error.message);
  revalidatePath("/admin/festa-junina/voluntarios");
  redirect("/admin/festa-junina/voluntarios?saved=created");
}

export async function updateVolunteer(formData: FormData) {
  await requireAdmin(["admin", "coordenador"], "/admin/festa-junina/voluntarios");
  const supabase = createSupabaseAdminClient();
  const id = text(formData, "id");

  const { error } = await supabase.from("event_volunteers").update({
    name: text(formData, "name"),
    whatsapp: text(formData, "whatsapp") || null,
    email: text(formData, "email") || null,
    role: text(formData, "role") || "Apoio geral",
    availability: text(formData, "availability") || null,
    notes: text(formData, "notes") || null,
    active: bool(formData, "active"),
    updated_at: new Date().toISOString(),
  }).eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/festa-junina/voluntarios");
  redirect("/admin/festa-junina/voluntarios?saved=updated");
}
