import Link from "next/link";
import { AdminPageShell } from "@/components/admin-page-shell";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabaseServer";
import { saveReferralCampaign, saveReferralRewardRule } from "./actions";

export const dynamic = "force-dynamic";

type PageProps = { searchParams?: Promise<Record<string, string | string[] | undefined>> };

type EventRow = { id: string };
type Campaign = { id: string; event_id: string; name: string; description: string | null; active: boolean; count_only_paid_orders: boolean; share_message: string | null };
type RewardRule = { id: string; campaign_id: string; name: string; qualifying_paid_orders: number; reward_description: string; max_rewards_per_buyer: number | null; active: boolean; sort_order: number };

function firstParam(value: string | string[] | undefined) { return Array.isArray(value) ? value[0] : value; }
function StatusBadge({ active }: { active?: boolean }) { return <span className={`rounded-full px-3 py-1 text-xs font-black ${active ? "bg-green-100 text-green-900" : "bg-stone-100 text-stone-600"}`}>{active ? "Ativa" : "Inativa"}</span>; }
function savedMessage(saved?: string | string[]) { const value = firstParam(saved); if (value === "campaign") return "Campanha salva com sucesso."; if (value === "rule") return "Regra de brinde salva com sucesso."; return null; }

async function getData() {
  const supabase = createSupabaseAdminClient();
  const { data: event } = await supabase.from("events").select("id").eq("slug", "arraia-tucxa-2026").single();
  if (!event) return { event: null as EventRow | null, campaigns: [] as Campaign[], rules: [] as RewardRule[] };
  const { data: campaigns } = await supabase.from("referral_campaigns").select("*").eq("event_id", event.id).order("created_at", { ascending: true });
  const campaignIds = (campaigns ?? []).map((campaign) => campaign.id);
  const { data: rules } = campaignIds.length
    ? await supabase.from("referral_reward_rules").select("*").in("campaign_id", campaignIds).order("sort_order")
    : { data: [] };
  return { event: event as EventRow, campaigns: (campaigns ?? []) as Campaign[], rules: (rules ?? []) as RewardRule[] };
}

function CampaignForm({ eventId, campaign }: { eventId: string; campaign?: Campaign }) {
  return (
    <form action={saveReferralCampaign} className="rounded-[1.75rem] border border-green-100 bg-white p-6 shadow-sm">
      <input type="hidden" name="event_id" value={eventId} />
      <input type="hidden" name="id" value={campaign?.id ?? ""} />
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div><span className="rounded-full bg-green-50 px-3 py-1 text-xs font-black text-green-900">{campaign ? "Editar campanha" : "Nova campanha"}</span><h2 className="mt-3 text-2xl font-black text-green-950">{campaign?.name ?? "Cadastrar campanha"}</h2></div>
        <Link href="/admin/festa-junina/indicacoes" className="rounded-full bg-white px-4 py-2 text-sm font-black text-green-950 shadow-sm" prefetch={false}>Cancelar</Link>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-bold text-green-950">Nome<input name="name" required defaultValue={campaign?.name ?? ""} className="rounded-2xl border p-3 font-normal" /></label>
        <label className="grid gap-2 text-sm font-bold text-green-950">Mensagem de compartilhamento<input name="share_message" defaultValue={campaign?.share_message ?? ""} className="rounded-2xl border p-3 font-normal" /></label>
        <label className="grid gap-2 text-sm font-bold text-green-950 md:col-span-2">Descrição<textarea name="description" defaultValue={campaign?.description ?? ""} className="min-h-24 rounded-2xl border p-3 font-normal" /></label>
      </div>
      <div className="mt-5 flex flex-wrap gap-6 rounded-2xl bg-amber-50 p-4 text-sm font-bold text-green-950">
        <label className="flex items-center gap-2"><input type="checkbox" name="active" defaultChecked={campaign?.active ?? true} /> Campanha ativa</label>
        <label className="flex items-center gap-2"><input type="checkbox" name="count_only_paid_orders" defaultChecked={campaign?.count_only_paid_orders ?? true} /> Contar apenas compras pagas</label>
      </div>
      <button className="mt-5 w-full rounded-2xl bg-green-900 px-5 py-3 font-black text-white">{campaign ? "Salvar campanha" : "Criar campanha"}</button>
    </form>
  );
}

function RuleForm({ campaignId, rule }: { campaignId: string; rule?: RewardRule }) {
  return (
    <form action={saveReferralRewardRule} className="rounded-[1.75rem] border border-green-100 bg-white p-6 shadow-sm">
      <input type="hidden" name="campaign_id" value={campaignId} />
      <input type="hidden" name="id" value={rule?.id ?? ""} />
      <h2 className="text-xl font-black text-green-950">{rule ? "Editar regra de brinde" : "Nova regra de brinde"}</h2>
      <div className="mt-5 grid gap-4 md:grid-cols-4">
        <label className="grid gap-2 text-sm font-bold text-green-950 md:col-span-2">Nome<input name="name" required defaultValue={rule?.name ?? ""} className="rounded-2xl border p-3 font-normal" /></label>
        <label className="grid gap-2 text-sm font-bold text-green-950">Compras pagas<input name="qualifying_paid_orders" type="number" defaultValue={rule?.qualifying_paid_orders ?? 1} className="rounded-2xl border p-3 font-normal" /></label>
        <label className="grid gap-2 text-sm font-bold text-green-950">Ordem<input name="sort_order" type="number" defaultValue={rule?.sort_order ?? 0} className="rounded-2xl border p-3 font-normal" /></label>
        <label className="grid gap-2 text-sm font-bold text-green-950 md:col-span-4">Brinde<input name="reward_description" required defaultValue={rule?.reward_description ?? ""} className="rounded-2xl border p-3 font-normal" /></label>
        <label className="grid gap-2 text-sm font-bold text-green-950">Limite por pessoa<input name="max_rewards_per_buyer" type="number" defaultValue={rule?.max_rewards_per_buyer ?? 0} className="rounded-2xl border p-3 font-normal" /></label>
        <label className="flex items-center gap-2 rounded-2xl bg-amber-50 p-3 text-sm font-bold text-green-950"><input type="checkbox" name="active" defaultChecked={rule?.active ?? true} /> Ativa</label>
      </div>
      <button className="mt-5 rounded-2xl bg-green-900 px-5 py-3 font-black text-white">{rule ? "Salvar regra" : "Criar regra"}</button>
    </form>
  );
}

const campaignTypes = [
  "Indicação: comprador compartilha o link e ganha brinde quando amigos compram e pagam.",
  "Brinde por compra antecipada: incentivo para comprar antes da data limite.",
  "Campanha por grupo/família: benefício manual para famílias ou grupos maiores.",
  "Campanha bingo/Air Fryer: comunicação ligada ao sorteio ou rodada especial.",
  "Campanha WhatsApp manual: mensagem pronta para voluntários copiarem e colarem sem custo de API.",
];

export default async function AdminIndicacoesPage({ searchParams }: PageProps) {
  await requireAdmin(["admin", "coordenador"], "/admin/festa-junina/indicacoes");
  const params = await searchParams;
  const message = savedMessage(params?.saved);
  const editId = firstParam(params?.edit);
  const showNew = firstParam(params?.new) === "1";
  const newRuleCampaignId = firstParam(params?.newRule);
  const { event, campaigns, rules } = await getData();
  const editingCampaign = editId ? campaigns.find((campaign) => campaign.id === editId) : undefined;

  return (
    <AdminPageShell>
      <section className="mx-auto max-w-6xl px-5 py-12">
        <div className="mb-6 flex flex-wrap justify-between gap-3">
          <div>
            <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-black text-green-900">Vendas · Campanhas</span>
            <h1 className="mt-3 text-3xl font-black text-green-950">Campanhas, indicações e brindes</h1>
            <p className="mt-2 max-w-3xl text-stone-600">Configure campanhas opcionais para incentivar compras antecipadas, indicações e ações manuais de WhatsApp.</p>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-3"><Link href="/admin/festa-junina/indicacoes?new=1" className="inline-flex h-12 items-center justify-center rounded-2xl bg-green-900 px-5 text-sm font-black text-white shadow-sm transition hover:bg-green-800" prefetch={false}>Nova campanha</Link><Link href="/admin/festa-junina" className="inline-flex h-12 items-center justify-center rounded-2xl border border-green-100 bg-white px-5 text-sm font-black text-green-950 shadow-sm transition hover:bg-green-50" prefetch={false}>Voltar à gestão</Link></div>
        </div>
        {message ? <div className="rounded-3xl border border-green-200 bg-green-50 p-5 text-sm font-bold text-green-900">{message}</div> : null}
        <div className="mt-6 rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-950"><strong>Tipos sugeridos:</strong><ul className="mt-2 list-disc space-y-1 pl-5">{campaignTypes.map((item) => <li key={item}>{item}</li>)}</ul></div>
        {event && (showNew || editingCampaign) ? <div className="mt-6"><CampaignForm eventId={event.id} campaign={editingCampaign} /></div> : null}
        {!event ? <div className="mt-8 rounded-3xl border border-amber-200 bg-amber-100 p-5 text-amber-900">Abra um evento para configurar campanhas.</div> : null}
        <div className="mt-8 grid gap-5">
          {campaigns.map((campaign) => {
            const campaignRules = rules.filter((rule) => rule.campaign_id === campaign.id);
            return (
              <article key={campaign.id} className="rounded-[1.75rem] border border-green-100 bg-white p-6 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-xl font-black text-green-950">{campaign.name}</h2>{campaign.description ? <p className="mt-2 text-sm text-stone-700">{campaign.description}</p> : null}</div><StatusBadge active={campaign.active} /></div>
                {campaign.share_message ? <p className="mt-4 rounded-2xl bg-stone-50 p-4 text-sm text-stone-700"><strong>Mensagem:</strong> {campaign.share_message}</p> : null}
                <div className="mt-5 flex flex-wrap gap-3"><Link href={`/admin/festa-junina/indicacoes?edit=${campaign.id}`} className="rounded-full bg-green-900 px-5 py-3 text-sm font-black text-white" prefetch={false}>Editar</Link><Link href={`/admin/festa-junina/indicacoes?newRule=${campaign.id}`} className="rounded-full border border-green-100 bg-white px-5 py-3 text-sm font-black text-green-950" prefetch={false}>Nova regra de brinde</Link></div>
                {newRuleCampaignId === campaign.id ? <div className="mt-5"><RuleForm campaignId={campaign.id} /></div> : null}
                {campaignRules.length ? <div className="mt-5 grid gap-3">{campaignRules.map((rule) => <div key={rule.id} className="rounded-2xl border border-green-100 bg-green-50 p-4 text-sm"><strong>{rule.name}</strong> — {rule.qualifying_paid_orders} compra(s) paga(s): {rule.reward_description}</div>)}</div> : null}
              </article>
            );
          })}
        </div>
      </section>
    </AdminPageShell>
  );
}
