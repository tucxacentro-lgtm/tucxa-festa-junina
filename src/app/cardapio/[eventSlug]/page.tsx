import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseAdminClient } from "@/lib/supabaseServer";
import { PublicSalesMenu, type PublicSalesMenuItem } from "@/components/public-sales-menu";
import { createPublicConsumptionOrder } from "./actions";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ eventSlug: string }>;
  searchParams?: Promise<{ error?: string; mesa?: string; table?: string; grupo?: string; responsavel?: string; customer?: string; garcom?: string; fechamento?: string }>;
};

type EventRow = {
  id: string;
  slug: string;
  name: string;
  event_date: string | null;
  pix_key: string | null;
  pix_receiver_name: string | null;
};

async function getData(eventSlug: string) {
  const supabase = createSupabaseAdminClient();
  const { data: event } = await supabase
    .from("events")
    .select("id, slug, name, event_date, pix_key, pix_receiver_name")
    .eq("slug", eventSlug)
    .maybeSingle();

  if (!event) return null;

  const { data: items } = await supabase
    .from("event_sales_menu_items")
    .select("id, name, category, description, price, unit_label, requires_preparation")
    .eq("event_id", event.id)
    .eq("active", true)
    .order("category")
    .order("sort_order");

  return { event: event as EventRow, items: (items ?? []) as PublicSalesMenuItem[] };
}

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export default async function PublicCardapioPage({ params, searchParams }: PageProps) {
  const { eventSlug } = await params;
  const query = await searchParams;
  const data = await getData(eventSlug);
  if (!data) notFound();

  const { event, items } = data;
  const tableLabel = firstParam(query?.mesa) || firstParam(query?.table) || firstParam(query?.grupo);
  const responsibleName = firstParam(query?.responsavel) || firstParam(query?.customer);
  const waiterName = firstParam(query?.garcom);
  const settlementMode = firstParam(query?.fechamento);
  const isTableService = Boolean(tableLabel || responsibleName || waiterName || settlementMode);
  const backHref = isTableService ? "/gestao-evento/garcom" : "/";
  const backLabel = isTableService ? "← Voltar para Garçom/Atendimento" : "← Voltar para a página inicial";

  return (
    <main className="min-h-screen bg-[#fff9e6] text-green-950">
      <section className="mx-auto max-w-3xl px-4 py-6">
        <div className="mb-4 flex flex-wrap items-center justify-start gap-3">
          <Link href={backHref} className="rounded-full bg-white px-5 py-3 text-sm font-black text-green-950 shadow-sm" prefetch={false}>
            {backLabel}
          </Link>
        </div>

        <div className="rounded-[2rem] bg-gradient-to-br from-amber-400 to-yellow-300 p-6 shadow-sm">
          <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-black text-green-900">Cardápio público</span>
          <h1 className="mt-4 text-3xl font-black">{event.name}</h1>
          <p className="mt-2 text-sm text-green-950/80">
            Escolha os itens, use a busca ou as categorias e gere o pedido com total para pagamento. Se você estiver usando QR Code da mesa, a mesa já pode vir preenchida.
          </p>
        </div>

        {items.length === 0 ? (
          <div className="mt-5 rounded-[2rem] bg-white p-5 text-sm text-stone-600 shadow-sm">
            O cardápio de vendas ainda não foi liberado para este evento. Aguarde orientação da coordenação.
          </div>
        ) : (
          <PublicSalesMenu eventSlug={event.slug} items={items} defaultTableLabel={tableLabel} defaultCustomerName={responsibleName} defaultWaiterName={waiterName} defaultSettlementMode={settlementMode} error={query?.error} action={createPublicConsumptionOrder.bind(null, event.slug)} />
        )}
      </section>
    </main>
  );
}
