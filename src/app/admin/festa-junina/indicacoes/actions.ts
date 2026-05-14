"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabaseServer";

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

function refresh() {
  revalidatePath("/admin/festa-junina/indicacoes");
  revalidatePath("/festa-junina");
}

export async function saveReferralCampaign(formData: FormData) {
  await requireAdmin(["admin", "coordenador"], "/admin/festa-junina/indicacoes");
  const supabase = createSupabaseAdminClient();
  const id = text(formData, "id");
  const eventId = text(formData, "event_id");

  const payload = {
    event_id: eventId,
    name: text(formData, "name"),
    description: nullableText(formData, "description"),
    share_message: nullableText(formData, "share_message"),
    active: bool(formData, "active"),
    count_only_paid_orders: bool(formData, "count_only_paid_orders"),
    updated_at: new Date().toISOString(),
  };

  const { error } = id
    ? await supabase.from("referral_campaigns").update(payload).eq("id", id)
    : await supabase.from("referral_campaigns").insert(payload);

  if (error) throw new Error(error.message);
  refresh();
  redirect("/admin/festa-junina/indicacoes?saved=campaign");
}

export async function saveReferralRewardRule(formData: FormData) {
  await requireAdmin(["admin", "coordenador"], "/admin/festa-junina/indicacoes");
  const supabase = createSupabaseAdminClient();
  const id = text(formData, "id");
  const campaignId = text(formData, "campaign_id");

  const payload = {
    campaign_id: campaignId,
    name: text(formData, "name"),
    qualifying_paid_orders: integer(formData, "qualifying_paid_orders", 1),
    reward_description: text(formData, "reward_description"),
    max_rewards_per_buyer: integer(formData, "max_rewards_per_buyer", 0) || null,
    active: bool(formData, "active"),
    sort_order: integer(formData, "sort_order", 0),
    updated_at: new Date().toISOString(),
  };

  const { error } = id
    ? await supabase.from("referral_reward_rules").update(payload).eq("id", id)
    : await supabase.from("referral_reward_rules").insert(payload);

  if (error) throw new Error(error.message);
  refresh();
  redirect("/admin/festa-junina/indicacoes?saved=rule");
}
