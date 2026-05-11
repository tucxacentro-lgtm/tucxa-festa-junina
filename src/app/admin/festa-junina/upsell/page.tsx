import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabaseServer";
import { saveUpsellCampaign } from "./actions";
import { AdminPageShell } from "@/components/admin-page-shell";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams?: Promise<{ saved?: string }>;
};

type UpsellCampaign = {
  id: string;
  name: string;
  description: string | null;
  active: boolean;
  show_after_purchase: boolean;
  email_after_days: number;
  whatsapp_message: string | null;
};

async function getCampaign() {
  const supabase = createSupabaseAdminClient();
  const { data: event } = await supabase.from("events").select("id").eq("slug", "arraia-tucxa-2026").single();
  if (!event) return null;

  const { data } = await supabase
    .from("upsell_campaigns")
    .select("*")
    .eq("event_id", event.id)
    .maybeSingle();

  return data as UpsellCampaign | null;
}

export default async function AdminUpsellPage({ searchParams }: PageProps) {
  await requireAdmin(["admin", "coordenador"], "/admin/festa-junina/upsell");
  const params = await searchParams;
  const campaign = await getCampaign();

  return (
    <AdminPageShell>
      
      <section className="mx-auto max-w-5xl px-5 py-12">
        <div className="mb-6 flex flex-wrap justify-between gap-3">
          <Link href="/admin/festa-junina" className="rounded-2xl bg-white px-5 py-3 text-sm font-bold text-green-950 shadow-sm">← Voltar ao admin</Link>
          <div className="flex flex-wrap gap-3">
            <Link href="/admin/festa-junina/upsell/envios" className="rounded-2xl bg-green-900 px-5 py-3 text-sm font-black text-white shadow-sm">Mensagens para WhatsApp</Link>
            <a href="/admin/logout" className="rounded-full bg-white px-4 py-2 text-sm font-bold text-green-950 shadow-sm">Sair do admin</a>
          </div>
        </div>

        <h1 className="text-3xl font-black text-green-950">Upsell e mensagens de complemento</h1>
        <p className="mt-2 max-w-3xl text-stone-600">
          Configure a mensagem para convidar compradores a complementar a experiência com combos, comidas, bebidas ou bingo. Para WhatsApp sem custo, use a página de mensagens prontas para copiar e colar manualmente ou enviar um resumo ao e-mail operacional.
        </p>

        {params?.saved ? <div className="mt-6 rounded-3xl border border-green-200 bg-green-50 p-5 text-sm font-bold text-green-900">Configuração de upsell salva com sucesso.</div> : null}

        {!campaign ? (
          <div className="mt-8 rounded-3xl bg-amber-100 p-5 text-amber-900">Rode a migration 005 para criar a campanha de upsell inicial.</div>
        ) : (
          <form action={saveUpsellCampaign} className="mt-8 rounded-3xl bg-white p-6 shadow-sm">
            <input type="hidden" name="id" value={campaign.id} />
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm font-bold text-green-950">Nome<input name="name" defaultValue={campaign.name} className="rounded-2xl border p-3 font-normal" /></label>
              <label className="grid gap-2 text-sm font-bold text-green-950">Enviar e-mail depois de quantos dias<input name="email_after_days" defaultValue={campaign.email_after_days} className="rounded-2xl border p-3 font-normal" /></label>
              <label className="grid gap-2 text-sm font-bold text-green-950 md:col-span-2">Descrição<textarea name="description" defaultValue={campaign.description ?? ""} className="min-h-24 rounded-2xl border p-3 font-normal" /></label>
              <label className="grid gap-2 text-sm font-bold text-green-950 md:col-span-2">Mensagem pronta para WhatsApp/e-mail<textarea name="whatsapp_message" defaultValue={campaign.whatsapp_message ?? ""} className="min-h-36 rounded-2xl border p-3 font-normal" /></label>
              <label className="flex items-center gap-2 rounded-2xl bg-amber-50 p-3 text-sm font-bold text-green-950"><input type="checkbox" name="active" defaultChecked={campaign.active} /> Campanha ativa</label>
              <label className="flex items-center gap-2 rounded-2xl bg-amber-50 p-3 text-sm font-bold text-green-950"><input type="checkbox" name="show_after_purchase" defaultChecked={campaign.show_after_purchase} /> Mostrar após a compra</label>
            </div>
            <button className="mt-6 w-full rounded-2xl bg-green-900 px-5 py-3 font-black text-white">Salvar upsell</button>
          </form>
        )}
      </section>
    </AdminPageShell>
  );
}
