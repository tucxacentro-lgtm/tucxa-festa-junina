"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabaseServer";

function text(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

export async function updateChecklistItem(formData: FormData) {
  await requireAdmin(["admin", "coordenador"], "/admin/festa-junina/checklist");

  const id = text(formData, "id");
  const status = text(formData, "status") || "pending";
  const notes = text(formData, "notes") || null;

  if (!id) {
    throw new Error("Item do checklist não encontrado.");
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("event_operational_checklist")
    .update({ status, notes, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/festa-junina");
  revalidatePath("/admin/festa-junina/checklist");
  redirect("/admin/festa-junina/checklist?saved=1");
}
