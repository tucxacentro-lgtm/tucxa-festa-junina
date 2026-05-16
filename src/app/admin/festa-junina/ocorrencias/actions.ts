"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabaseServer";
import { getCurrentEventForAdmin } from "@/lib/current-event";

function text(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

export async function createOccurrence(formData: FormData) {
  await requireAdmin(["admin", "coordenador"], "/admin/festa-junina/ocorrencias");
  const event = await getCurrentEventForAdmin();
  const title = text(formData, "title");
  const description = text(formData, "description");
  if (!title) return;

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("event_operation_occurrences").insert({
    event_id: event.id,
    title,
    description: description || null,
    area: text(formData, "area") || "geral",
    responsible_name: text(formData, "responsible_name") || null,
    status: text(formData, "status") || "open",
    resolution_notes: text(formData, "resolution_notes") || null,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/admin/festa-junina/ocorrencias");
}

export async function updateOccurrenceStatus(formData: FormData) {
  await requireAdmin(["admin", "coordenador"], "/admin/festa-junina/ocorrencias");
  const event = await getCurrentEventForAdmin();
  const id = text(formData, "id");
  const status = text(formData, "status") || "resolved";
  if (!id) return;
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("event_operation_occurrences").update({ status, updated_at: new Date().toISOString() }).eq("id", id).eq("event_id", event.id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/festa-junina/ocorrencias");
}
