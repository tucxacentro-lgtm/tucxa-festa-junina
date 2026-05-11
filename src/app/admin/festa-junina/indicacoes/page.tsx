import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabaseServer";
import { saveReferralCampaign, saveReferralRewardRule } from "./actions";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams?: Promise<{ saved?: string }>;
};

type Campaign = {
  id: string;
  event_id: string;
  name: string;
  description: string | null;
  active: boolean;
  count_only_paid_orders: boolean;
  share_message: string | null;
};

type RewardRule = {
  id: string;
  campaign_id: string;
  name: string;
  qualifying_paid_orders: number;
  reward_description: string;
  max_rewards_per_buyer: number | null;
  active: boolean;
  sort_order: number;
};

async function getData() {
  const supabase = createSupabaseAdminClient();
  const { data: event } = await supabase.from("events").select("id").eq("slug", "arraia-tucxa-2026").single();
  if (!event) return { campaign: null as Campaign | null, rules: [] as RewardRule[] };

  const { data: campaign } = await supabase
    .from("referral_campaigns")
    .select("*")
    .eq("event_id", event.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  const { data: rules } = campaign
    ? await supabase.from("referral_reward_rules").select("*").eq("campaign_id", campaign.id).order("sort_order")
    : { data: [] };

  return { campaign: campaign as Campaign | null, rules: (rules ?? []) as RewardRule[] };
}

function savedMessage(saved?: string) {
  if (saved === "campaign") return "Campanha de indicação salva com sucesso.";
  if (saved === "rule") return "Regra de brinde salva com sucesso.";
  return null;
}

export default async function AdminIndicacoesPage({ searchParams }: PageProps) {
  await requireAdmin(["admin", "coordenador"], "/admin/festa-junina/indicacoes");
  const params = await searchParams;
  const message = savedMessage(params?.saved);
  const { campaign, rules } = await getData();

  return (
    <main className="min-h-screen bg-amber-50 text-stone-900">
      <SiteHeader />
      <section className="mx-auto max-w-6xl px-5 py-12">
        <div className="mb-6 flex flex-wrap justify-between gap-3">
          <Link href="/admin/festa-junina" className="rounded-2xl bg-white px-5 py-3 text-sm font-bold text-green-950 shadow-sm">← Voltar ao admin</Link>
          <a href="/admin/logout" className="rounded-full bg-white px-4 py-2 text-sm font-bold text-green-950 shadow-sm">Sair do admin</a>
        </div>

        <h1 className="text-3xl font-black text-green-950">Indicações e brindes</h1>
        <p className="mt-2 max-w-3xl text-stone-600">Configure o código de indicação, quantas compras pagas são necessárias e quais brindes cada comprador pode conquistar.</p>

        {message ? <div className="mt-6 rounded-3xl border border-green-200 bg-green-50 p-5 text-sm font-bold text-green-900">{message}</div> : null}

        {!campaign ? (
          <div className="mt-8 rounded-3xl border border-amber-200 bg-amber-100 p-5 text-amber-900">
            Rode a migration 004 para criar a campanha inicial de indicações.
          </div>
        ) : (
          <>
            <form action={saveReferralCampaign} className="mt-8 rounded-3xl bg-white p-6 shadow-sm">
              <input type="hidden" name="id" value={campaign.id} />
              <h2 className="text-xl font-black text-green-950">Campanha</h2>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <label className="grid gap-2 text-sm font-bold text-green-950">Nome<input name="name" defaultValue={campaign.name} className="rounded-2xl border p-3 font-normal" /></label>
                <label className="grid gap-2 text-sm font-bold text-green-950">Mensagem de compartilhamento<input name="share_message" defaultValue={campaign.share_message ?? ""} className="rounded-2xl border p-3 font-normal" /></label>
                <label className="grid gap-2 text-sm font-bold text-green-950 md:col-span-2">Descrição<textarea name="description" defaultValue={campaign.description ?? ""} className="min-h-24 rounded-2xl border p-3 font-normal" /></label>
              </div>
              <div className="mt-5 flex flex-wrap gap-6 rounded-2xl bg-amber-50 p-4 text-sm font-bold text-green-950">
                <label className="flex items-center gap-2"><input type="checkbox" name="active" defaultChecked={campaign.active} /> Campanha ativa</label>
                <label className="flex items-center gap-2"><input type="checkbox" name="count_only_paid_orders" defaultChecked={campaign.count_only_paid_orders} /> Contar apenas compras pagas</label>
              </div>
              <button className="mt-5 rounded-2xl bg-green-900 px-5 py-3 font-black text-white">Salvar campanha</button>
            </form>

            <div className="mt-8 grid gap-4">
              {rules.map((rule) => (
                <form key={rule.id} action={saveReferralRewardRule} className="rounded-3xl bg-white p-6 shadow-sm">
                  <input type="hidden" name="id" value={rule.id} />
                  <input type="hidden" name="campaign_id" value={campaign.id} />
                  <div className="grid gap-4 md:grid-cols-5">
                    <label className="grid gap-2 text-sm font-bold text-green-950 md:col-span-2">Nome<input name="name" defaultValue={rule.name} className="rounded-2xl border p-3 font-normal" /></label>
                    <label className="grid gap-2 text-sm font-bold text-green-950">Compras pagas<input name="qualifying_paid_orders" type="number" defaultValue={rule.qualifying_paid_orders} className="rounded-2xl border p-3 font-normal" /></label>
                    <label className="grid gap-2 text-sm font-bold text-green-950">Limite por pessoa<input name="max_rewards_per_buyer" type="number" defaultValue={rule.max_rewards_per_buyer ?? 0} className="rounded-2xl border p-3 font-normal" /></label>
                    <label className="grid gap-2 text-sm font-bold text-green-950">Ordem<input name="sort_order" type="number" defaultValue={rule.sort_order} className="rounded-2xl border p-3 font-normal" /></label>
                    <label className="grid gap-2 text-sm font-bold text-green-950 md:col-span-5">Brinde<input name="reward_description" defaultValue={rule.reward_description} className="rounded-2xl border p-3 font-normal" /></label>
                  </div>
                  <label className="mt-4 flex items-center gap-2 text-sm font-bold text-green-950"><input type="checkbox" name="active" defaultChecked={rule.active} /> Regra ativa</label>
                  <button className="mt-5 rounded-2xl bg-green-900 px-5 py-3 font-black text-white">Salvar regra</button>
                </form>
              ))}

              <form action={saveReferralRewardRule} className="rounded-3xl border border-dashed border-green-300 bg-white p-6 shadow-sm">
                <input type="hidden" name="campaign_id" value={campaign.id} />
                <h2 className="text-xl font-black text-green-950">Nova regra de brinde</h2>
                <div className="mt-5 grid gap-4 md:grid-cols-4">
                  <input name="name" placeholder="Nome da regra" className="rounded-2xl border p-3" />
                  <input name="qualifying_paid_orders" type="number" defaultValue={1} className="rounded-2xl border p-3" />
                  <input name="sort_order" type="number" defaultValue={0} className="rounded-2xl border p-3" />
                  <label className="flex items-center gap-2 rounded-2xl bg-amber-50 p-3 text-sm font-bold text-green-950"><input type="checkbox" name="active" defaultChecked /> Ativa</label>
                  <input name="reward_description" placeholder="Descrição do brinde" className="rounded-2xl border p-3 md:col-span-4" />
                </div>
                <button className="mt-5 rounded-2xl bg-green-900 px-5 py-3 font-black text-white">Criar regra</button>
              </form>
            </div>
          </>
        )}
      </section>
    </main>
  );
}
