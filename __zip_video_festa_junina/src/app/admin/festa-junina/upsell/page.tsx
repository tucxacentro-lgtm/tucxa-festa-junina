import Link from "next/link";
import { AdminPageShell } from "@/components/admin-page-shell";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabaseServer";
import { saveUpsellCampaign } from "./actions";

export const dynamic = "force-dynamic";

type PageProps = { searchParams?: Promise<Record<string, string | string[] | undefined>> };

type EventRow = { id: string };
type UpsellCampaign = { id: string; event_id: string; name: string; description: string | null; active: boolean; show_after_purchase: boolean; email_after_days: number; whatsapp_message: string | null };

function firstParam(value: string | string[] | undefined) { return Array.isArray(value) ? value[0] : value; }
function StatusBadge({ active }: { active?: boolean }) { return <span className={`rounded-full px-3 py-1 text-xs font-black ${active ? "bg-green-100 text-green-900" : "bg-stone-100 text-stone-600"}`}>{active ? "Ativo" : "Inativo"}</span>; }

async function getData() {
  const supabase = createSupabaseAdminClient();
  const { data: event } = await supabase.from("events").select("id").eq("slug", "arraia-tucxa-2026").single();
  if (!event) return { event: null as EventRow | null, campaigns: [] as UpsellCampaign[] };
  const { data } = await supabase.from("upsell_campaigns").select("*").eq("event_id", event.id).order("created_at", { ascending: true });
  return { event: event as EventRow, campaigns: (data ?? []) as UpsellCampaign[] };
}

function UpsellForm({ eventId, campaign }: { eventId: string; campaign?: UpsellCampaign }) {
  return (
    <form action={saveUpsellCampaign} className="rounded-[1.75rem] border border-green-100 bg-white p-6 shadow-sm">
      <input type="hidden" name="event_id" value={eventId} />
      <input type="hidden" name="id" value={campaign?.id ?? ""} />
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div><span className="rounded-full bg-green-50 px-3 py-1 text-xs font-black text-green-900">{campaign ? "Editar upsell" : "Novo upsell"}</span><h2 className="mt-3 text-2xl font-black text-green-950">{campaign?.name ?? "Cadastrar mensagem de complemento"}</h2></div>
        <Link href="/admin/festa-junina/upsell" className="rounded-full bg-white px-4 py-2 text-sm font-black text-green-950 shadow-sm" prefetch={false}>Cancelar</Link>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-bold text-green-950">Nome<input name="name" required defaultValue={campaign?.name ?? ""} className="rounded-2xl border p-3 font-normal" /></label>
        <label className="grid gap-2 text-sm font-bold text-green-950">E-mail depois de quantos dias<input name="email_after_days" type="number" defaultValue={campaign?.email_after_days ?? 3} className="rounded-2xl border p-3 font-normal" /></label>
        <label className="grid gap-2 text-sm font-bold text-green-950 md:col-span-2">Descrição<textarea name="description" defaultValue={campaign?.description ?? ""} className="min-h-24 rounded-2xl border p-3 font-normal" /></label>
        <label className="grid gap-2 text-sm font-bold text-green-950 md:col-span-2">Mensagem pronta para WhatsApp/e-mail<textarea name="whatsapp_message" defaultValue={campaign?.whatsapp_message ?? ""} className="min-h-36 rounded-2xl border p-3 font-normal" /></label>
        <label className="flex items-center gap-2 rounded-2xl bg-amber-50 p-3 text-sm font-bold text-green-950"><input type="checkbox" name="active" defaultChecked={campaign?.active ?? true} /> Campanha ativa</label>
        <label className="flex items-center gap-2 rounded-2xl bg-amber-50 p-3 text-sm font-bold text-green-950"><input type="checkbox" name="show_after_purchase" defaultChecked={campaign?.show_after_purchase ?? true} /> Mostrar após a compra</label>
      </div>
      <button className="mt-6 w-full rounded-2xl bg-green-900 px-5 py-3 font-black text-white">{campaign ? "Salvar upsell" : "Criar upsell"}</button>
    </form>
  );
}

export default async function AdminUpsellPage({ searchParams }: PageProps) {
  await requireAdmin(["admin", "coordenador"], "/admin/festa-junina/upsell");
  const params = await searchParams;
  const editId = firstParam(params?.edit);
  const showNew = firstParam(params?.new) === "1";
  const { event, campaigns } = await getData();
  const editingCampaign = editId ? campaigns.find((campaign) => campaign.id === editId) : undefined;

  return (
    <AdminPageShell>
      <section className="mx-auto max-w-6xl px-5 py-12">
        <div className="mb-6 flex flex-wrap justify-between gap-3">
          <div>
            <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-black text-green-900">Vendas · Upsell</span>
            <h1 className="mt-3 text-3xl font-black text-green-950">Upsell e mensagens de complemento</h1>
            <p className="mt-2 max-w-3xl text-stone-600">Configure convites para o comprador complementar a experiência com comidas, bebidas, bingo ou itens disponíveis. Sem custo com API do WhatsApp: o sistema prepara a mensagem e a coordenação copia e cola manualmente; quando houver e-mail, também pode enviar por e-mail.</p>
          </div>
          <div className="flex flex-wrap gap-3"><Link href="/admin/festa-junina/upsell?new=1" className="rounded-full bg-green-900 px-5 py-3 text-sm font-black text-white" prefetch={false}>Novo upsell</Link><Link href="/admin/festa-junina/upsell/envios" className="rounded-full border border-green-100 bg-white px-5 py-3 text-sm font-black text-green-950" prefetch={false}>Mensagens para WhatsApp</Link><Link href="/admin/festa-junina" className="rounded-full bg-white px-5 py-3 text-sm font-bold text-green-950 shadow-sm" prefetch={false}>Voltar à gestão</Link></div>
        </div>
        {params?.saved ? <div className="rounded-3xl border border-green-200 bg-green-50 p-5 text-sm font-bold text-green-900">Configuração de upsell salva com sucesso.</div> : null}
        <div className="mt-6 rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-950"><strong>Como funciona sem custo:</strong> o sistema identifica compradores e gera textos prontos. Para WhatsApp, o voluntário copia e cola a mensagem. Para compradores com e-mail, é possível usar o envio por e-mail configurado.</div>
        {event && (showNew || editingCampaign) ? <div className="mt-6"><UpsellForm eventId={event.id} campaign={editingCampaign} /></div> : null}
        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          {campaigns.map((campaign) => (
            <article key={campaign.id} className="rounded-[1.75rem] border border-green-100 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-xl font-black text-green-950">{campaign.name}</h2>{campaign.description ? <p className="mt-2 text-sm text-stone-700">{campaign.description}</p> : null}</div><StatusBadge active={campaign.active} /></div>
              <dl className="mt-5 grid gap-2 text-sm text-stone-700 md:grid-cols-2"><div><dt className="font-black text-green-950">E-mail após</dt><dd>{campaign.email_after_days} dia(s)</dd></div><div><dt className="font-black text-green-950">Após compra</dt><dd>{campaign.show_after_purchase ? "Sim" : "Não"}</dd></div></dl>
              {campaign.whatsapp_message ? <p className="mt-4 rounded-2xl bg-stone-50 p-4 text-sm text-stone-700"><strong>Mensagem:</strong> {campaign.whatsapp_message}</p> : null}
              <div className="mt-6 flex flex-wrap gap-3"><Link href={`/admin/festa-junina/upsell?edit=${campaign.id}`} className="rounded-full bg-green-900 px-5 py-3 text-sm font-black text-white" prefetch={false}>Editar</Link><Link href="/admin/festa-junina/upsell?new=1" className="rounded-full border border-green-100 bg-white px-5 py-3 text-sm font-black text-green-950" prefetch={false}>Criar novo</Link></div>
            </article>
          ))}
          {campaigns.length === 0 ? <div className="rounded-3xl border border-dashed border-green-200 bg-white p-6 text-sm text-stone-700">Nenhum upsell cadastrado ainda. Clique em <strong>Novo upsell</strong> para criar uma mensagem.</div> : null}
        </div>
      </section>
    </AdminPageShell>
  );
}
