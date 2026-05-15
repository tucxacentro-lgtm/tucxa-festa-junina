import { createSupabaseAdminClient } from "@/lib/supabaseServer";
import type { TrainingAudience, TrainingStatus } from "@/lib/training-templates";
import { DEFAULT_TRAINING_MATERIALS } from "@/lib/training-templates";

export type TrainingMaterial = {
  id: string;
  event_id: string;
  training_key: string;
  audience: TrainingAudience;
  training_type: string;
  title: string;
  objective: string | null;
  script_text: string | null;
  voiceover_text: string | null;
  whatsapp_message: string | null;
  youtube_description: string | null;
  youtube_tags: string | null;
  youtube_url: string | null;
  status: TrainingStatus;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
};

export type TrainingPlaylist = {
  id: string;
  event_id: string;
  title: string;
  description: string | null;
  playlist_url: string | null;
  status: TrainingStatus;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
};

export function buildTrainingKey(title: string) {
  return title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 80) || `treinamento_${Date.now()}`;
}

export async function getTrainingMaterials(eventId: string) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("event_training_materials")
    .select("*")
    .eq("event_id", eventId)
    .order("sort_order", { ascending: true });

  if (error) return [] as TrainingMaterial[];
  return (data ?? []) as TrainingMaterial[];
}

export async function getTrainingMaterial(eventId: string, trainingId: string) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("event_training_materials")
    .select("*")
    .eq("event_id", eventId)
    .eq("id", trainingId)
    .maybeSingle();

  if (error || !data) return null;
  return data as TrainingMaterial;
}

export async function getTrainingPlaylists(eventId: string) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("event_training_playlists")
    .select("*")
    .eq("event_id", eventId)
    .order("sort_order", { ascending: true });

  if (error) return [] as TrainingPlaylist[];
  return (data ?? []) as TrainingPlaylist[];
}

export async function ensureDefaultTrainingMaterials(eventId: string) {
  const supabase = createSupabaseAdminClient();

  for (const item of DEFAULT_TRAINING_MATERIALS) {
    const payload = {
      event_id: eventId,
      training_key: item.training_key,
      audience: item.audience,
      training_type: item.training_type,
      title: item.title,
      objective: item.objective,
      script_text: item.script_text,
      voiceover_text: item.voiceover_text,
      whatsapp_message: item.whatsapp_message,
      youtube_description: item.youtube_description,
      youtube_tags: item.youtube_tags,
      status: "rascunho",
      sort_order: item.sort_order,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from("event_training_materials").upsert(payload, { onConflict: "event_id,training_key" });
    if (error) throw new Error(error.message);
  }

  const { error: playlistError } = await supabase.from("event_training_playlists").upsert(
    {
      event_id: eventId,
      title: "Playlist de treinamento — Festa Junina Tucxa",
      description: "Organize aqui os vídeos curtos para clientes, voluntários, caixa, cozinha, entrega e coordenação.",
      status: "rascunho",
      sort_order: 10,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "event_id,title" },
  );

  if (playlistError) throw new Error(playlistError.message);
}

export function trainingWhatsappShareText(material: Pick<TrainingMaterial, "title" | "whatsapp_message" | "youtube_url">) {
  const parts = [material.whatsapp_message || `Treinamento: ${material.title}`];
  if (material.youtube_url) parts.push(`Assista aqui: ${material.youtube_url}`);
  return parts.join("\n\n");
}
