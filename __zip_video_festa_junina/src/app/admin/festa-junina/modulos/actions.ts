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

export async function saveEventModule(formData: FormData) {
  await requireAdmin(["admin", "coordenador"], "/admin/festa-junina/modulos");
  const supabase = createSupabaseAdminClient();

  const id = text(formData, "id");
  const payload = {
    event_id: text(formData, "event_id"),
    module_key: text(formData, "module_key"),
    enabled: bool(formData, "enabled"),
    status: text(formData, "status") || "suggested",
    notes: text(formData, "notes") || null,
    updated_at: new Date().toISOString(),
  };

  const { error } = id
    ? await supabase.from("event_modules").update(payload).eq("id", id)
    : await supabase.from("event_modules").insert(payload);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/festa-junina/modulos");
  revalidatePath("/admin/festa-junina");
  redirect("/admin/festa-junina/modulos?saved=1");
}
