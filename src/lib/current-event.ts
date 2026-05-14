import { createSupabaseAdminClient, createSupabaseServerClient } from "@/lib/supabaseServer";
import type { EventConfig } from "@/types/festa-junina";

export const DEFAULT_EVENT_SLUG = "arraia-tucxa-2026";

export function getCurrentEventSlug() {
  return process.env.NEXT_PUBLIC_FESTA_JUNINA_EVENT_SLUG || DEFAULT_EVENT_SLUG;
}


export async function getOpenEventForAdmin() {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("active_for_sales", true)
    .order("event_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;
  return data as EventConfig;
}

export async function getCurrentEventForAdmin() {
  const supabase = createSupabaseAdminClient();

  const { data: activeData, error: activeError } = await supabase
    .from("events")
    .select("*")
    .eq("active_for_sales", true)
    .order("event_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!activeError && activeData) return activeData as EventConfig;

  const { data, error } = await supabase.from("events").select("*").eq("slug", getCurrentEventSlug()).maybeSingle();
  if (error || !data) {
    throw new Error(error?.message ?? "Evento ativo não encontrado.");
  }

  return data as EventConfig;
}

export async function getCurrentEventForPublic() {
  const supabase = createSupabaseServerClient();

  const { data: activeData, error: activeError } = await supabase
    .from("events")
    .select("*")
    .eq("active_for_sales", true)
    .eq("status", "published")
    .order("event_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!activeError && activeData) return activeData as EventConfig;

  const { data, error } = await supabase.from("events").select("*").eq("slug", getCurrentEventSlug()).maybeSingle();
  if (error || !data) {
    throw new Error(error?.message ?? "Evento ativo não encontrado.");
  }

  return data as EventConfig;
}
