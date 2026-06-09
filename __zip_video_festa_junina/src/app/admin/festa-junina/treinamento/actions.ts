"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabaseServer";
import { getCurrentEventForAdmin } from "@/lib/current-event";
import { buildTrainingKey, ensureDefaultTrainingMaterials } from "@/lib/training-content";
import type { TrainingAudience, TrainingStatus } from "@/lib/training-templates";

function text(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function nullableText(formData: FormData, name: string) {
  const value = text(formData, name);
  return value || null;
}

function integer(formData: FormData, name: string, fallback = 0) {
  const parsed = Number.parseInt(text(formData, name), 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeAudience(value: string): TrainingAudience {
  if (
    value === "clientes" ||
    value === "garcons" ||
    value === "caixa" ||
    value === "cozinha" ||
    value === "separacao_entrega" ||
    value === "checkin" ||
    value === "coordenacao" ||
    value === "voluntarios"
  ) {
    return value;
  }
  return "voluntarios";
}

function normalizeStatus(value: string): TrainingStatus {
  if (value === "rascunho" || value === "revisar" || value === "aprovado" || value === "publicado" || value === "inativo") return value;
  return "rascunho";
}

function revalidateTraining() {
  revalidatePath("/admin/festa-junina/treinamento");
  revalidatePath("/admin/festa-junina/treinamento/materiais");
  revalidatePath("/admin/festa-junina/treinamento/playlist");
  revalidatePath("/admin/festa-junina");
}

export async function generateDefaultTrainingMaterials() {
  await requireAdmin(["admin", "coordenador"], "/admin/festa-junina/treinamento");
  const event = await getCurrentEventForAdmin();
  await ensureDefaultTrainingMaterials(event.id);
  revalidateTraining();
  redirect("/admin/festa-junina/treinamento?saved=defaults");
}

export async function saveTrainingMaterial(formData: FormData) {
  await requireAdmin(["admin", "coordenador"], "/admin/festa-junina/treinamento");
  const event = await getCurrentEventForAdmin();
  const supabase = createSupabaseAdminClient();
  const id = text(formData, "id");
  const title = text(formData, "title");

  if (!title) redirect("/admin/festa-junina/treinamento/materiais?error=title");

  const payload = {
    event_id: event.id,
    training_key: text(formData, "training_key") || buildTrainingKey(title),
    audience: normalizeAudience(text(formData, "audience")),
    training_type: text(formData, "training_type") || "video_curto",
    title,
    objective: nullableText(formData, "objective"),
    script_text: nullableText(formData, "script_text"),
    voiceover_text: nullableText(formData, "voiceover_text"),
    whatsapp_message: nullableText(formData, "whatsapp_message"),
    youtube_description: nullableText(formData, "youtube_description"),
    youtube_tags: nullableText(formData, "youtube_tags"),
    youtube_url: nullableText(formData, "youtube_url"),
    status: normalizeStatus(text(formData, "status")),
    sort_order: integer(formData, "sort_order", 999),
    updated_at: new Date().toISOString(),
  };

  const { error } = id
    ? await supabase.from("event_training_materials").update(payload).eq("id", id).eq("event_id", event.id)
    : await supabase.from("event_training_materials").insert(payload);

  if (error) throw new Error(error.message);
  revalidateTraining();
  redirect("/admin/festa-junina/treinamento/materiais?saved=material");
}

export async function saveTrainingPlaylist(formData: FormData) {
  await requireAdmin(["admin", "coordenador"], "/admin/festa-junina/treinamento/playlist");
  const event = await getCurrentEventForAdmin();
  const supabase = createSupabaseAdminClient();
  const id = text(formData, "id");
  const title = text(formData, "title") || "Playlist de treinamento — Festa Junina Tucxa";

  const payload = {
    event_id: event.id,
    title,
    description: nullableText(formData, "description"),
    playlist_url: nullableText(formData, "playlist_url"),
    status: normalizeStatus(text(formData, "status")),
    sort_order: integer(formData, "sort_order", 10),
    updated_at: new Date().toISOString(),
  };

  const { error } = id
    ? await supabase.from("event_training_playlists").update(payload).eq("id", id).eq("event_id", event.id)
    : await supabase.from("event_training_playlists").insert(payload);

  if (error) throw new Error(error.message);
  revalidateTraining();
  redirect("/admin/festa-junina/treinamento/playlist?saved=playlist");
}
