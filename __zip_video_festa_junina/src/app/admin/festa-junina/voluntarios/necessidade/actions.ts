"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getCurrentEventForAdmin } from "@/lib/current-event";
import { createSupabaseAdminClient } from "@/lib/supabaseServer";

function text(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function nullableText(formData: FormData, name: string) {
  const value = text(formData, name);
  return value || null;
}

function refresh() {
  revalidatePath("/admin/festa-junina/voluntarios/necessidade");
  revalidatePath("/admin/festa-junina/voluntarios/funcoes");
  revalidatePath("/admin/festa-junina/voluntarios");
  revalidatePath("/admin/festa-junina");
}

export async function saveVolunteerAssignment(formData: FormData) {
  await requireAdmin(["admin", "coordenador"], "/admin/festa-junina/voluntarios/necessidade");
  const event = await getCurrentEventForAdmin();
  const supabase = createSupabaseAdminClient();
  const id = text(formData, "id");
  const name = text(formData, "name");
  const role = text(formData, "role") || "Apoio geral";

  if (!name) redirect(`/admin/festa-junina/voluntarios/necessidade?error=name&role=${encodeURIComponent(role)}`);

  const payload = {
    event_id: event.id,
    name,
    whatsapp: nullableText(formData, "whatsapp"),
    email: nullableText(formData, "email"),
    role,
    availability: nullableText(formData, "availability"),
    notes: nullableText(formData, "notes"),
    active: formData.get("active") !== "off",
    updated_at: new Date().toISOString(),
  };

  const { error } = id
    ? await supabase.from("event_volunteers").update(payload).eq("id", id).eq("event_id", event.id)
    : await supabase.from("event_volunteers").insert(payload);

  if (error) throw new Error(error.message);
  refresh();
  redirect("/admin/festa-junina/voluntarios/necessidade?saved=volunteer");
}

export async function deactivateVolunteer(formData: FormData) {
  await requireAdmin(["admin", "coordenador"], "/admin/festa-junina/voluntarios/necessidade");
  const event = await getCurrentEventForAdmin();
  const supabase = createSupabaseAdminClient();
  const id = text(formData, "id");

  if (id) {
    const { error } = await supabase.from("event_volunteers").update({ active: false, updated_at: new Date().toISOString() }).eq("id", id).eq("event_id", event.id);
    if (error) throw new Error(error.message);
  }

  refresh();
  redirect("/admin/festa-junina/voluntarios/necessidade?saved=inactive");
}
