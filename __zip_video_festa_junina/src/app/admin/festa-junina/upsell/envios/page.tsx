import Link from "next/link";
import { WhatsAppMessageCard } from "@/components/whatsapp-message-card";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabaseServer";
import { buildPublicUrl } from "@/lib/site-url";
import { sendUpsellSummary } from "./actions";
import { AdminPageShell } from "@/components/admin-page-shell";

export const dynamic = "force-dynamic";

type PageProps = { searchParams?: Promise<{ sent?: string; days?: string }> };

type Campaign = { whatsapp_message: string | null; email_after_days: number; active: boolean };
type Order = { buyer_name: string; buyer_email: string | null; buyer_whatsapp: string; buyer_code: string; payment_status: string; created_at: string };

function applyTemplate(template: string, input: { name: string; link: string }) {
  return template.replaceAll("{nome}", input.name).replaceAll("{link_compra_adicional}", input.link).replaceAll("{link}", input.link);
}

async function getData(days: number) {
  const supabase = createSupabaseAdminClient();
  const { data: event } = await supabase.from("events").select("id").eq("slug", "arraia-tucxa-2026").single();
  if (!event) return { campaign: null as Campaign | null, orders: [] as Order[] };

  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
  const [{ data: campaign }, { data: orders }] = await Promise.all([
    supabase.from("upsell_campaigns").select("whatsapp_message, email_after_days, active").eq("event_id", event.id).maybeSingle(),
    supabase.from("ticket_orders").select("buyer_name, buyer_email, buyer_whatsapp, buyer_code, payment_status, created_at").eq("event_id", event.id).gte("created_at", since).in("payment_status", ["paid", "proof_sent"]).order("created_at", { ascending: false }),
  ]);

  return { campaign: campaign as Campaign | null, orders: (orders ?? []) as Order[] };
}

export default async function UpsellEnviosPage({ searchParams }: PageProps) {
  await requireAdmin(["admin", "coordenador"], "/admin/festa-junina/upsell/envios");
  const params = await searchParams;
  const days = Number.parseInt(params?.days ?? "3", 10) || 3;
  const { campaign, orders } = await getData(days);
  const template = campaign?.whatsapp_message || "Oi, {nome}! Sua presença no Arraiá do Tucxa já está registrada 🎉\n\nPara deixar o dia da festa mais prático, você pode complementar sua compra com combo de comida, bebida ou cartela de bingo. Assim você evita fila e ajuda a organização a planejar melhor as compras.\n\nAcesse aqui: {link_compra_adicional}";

  return (
    <AdminPageShell>
      
      <section className="mx-auto max-w-5xl px-5 py-12">
        <div className="mb-6 flex flex-wrap justify-between gap-3"><Link href="/admin/festa-junina/upsell" className="rounded-2xl bg-white px-5 py-3 text-sm font-bold text-green-950 shadow-sm" prefetch={false}>← Voltar ao upsell</Link><a href="/admin/logout" className="rounded-full bg-white px-4 py-2 text-sm font-bold text-green-950 shadow-sm">Sair da gestão</a></div>
        <h1 className="text-3xl font-black text-green-950">Envios de upsell por WhatsApp</h1>
        <p className="mt-2 max-w-3xl text-stone-600">Lista de mensagens prontas para enviar manualmente pelo WhatsApp, sem custo de integração. Também é possível enviar um resumo para o e-mail operacional do Tucxa.</p>
        {params?.sent ? <div className="mt-5 rounded-3xl border border-green-200 bg-green-50 p-4 text-sm font-bold text-green-900">Resumo enviado para o e-mail operacional do Tucxa.</div> : null}

        <form action={sendUpsellSummary} className="mt-8 rounded-3xl bg-white p-5 shadow-sm">
          <div className="grid gap-4 md:grid-cols-[180px_1fr]">
            <label className="grid gap-2 text-sm font-bold text-green-950">Últimos dias<input name="days" defaultValue={days} className="rounded-2xl border p-3 font-normal" /></label>
            <label className="grid gap-2 text-sm font-bold text-green-950">Mensagem modelo<textarea name="message_template" defaultValue={template} className="min-h-32 rounded-2xl border p-3 font-normal" /></label>
          </div>
          <button className="mt-4 rounded-2xl bg-green-900 px-5 py-3 font-black text-white">Enviar resumo por e-mail para o Tucxa</button>
        </form>

        <div className="mt-8 grid gap-4">
          {orders.map((order) => {
            const link = buildPublicUrl(`/festa-junina?ref=${encodeURIComponent(order.buyer_code)}#combos`);
            const message = applyTemplate(template, { name: order.buyer_name, link });
            return <WhatsAppMessageCard key={order.buyer_code} title={`${order.buyer_name} · ${order.buyer_whatsapp}`} phone={order.buyer_whatsapp} message={message} />;
          })}
          {orders.length === 0 ? <div className="rounded-3xl bg-white p-6 text-center text-stone-500 shadow-sm">Nenhum comprador encontrado nos últimos {days} dias.</div> : null}
        </div>
      </section>
    </AdminPageShell>
  );
}
