import Link from "next/link";
import { notFound } from "next/navigation";
import { HeartHandshake, Search, Sparkles, Utensils } from "lucide-react";
import { createSupabaseAdminClient } from "@/lib/supabaseServer";
import {
  PublicSalesMenu,
  type PublicSalesMenuItem,
} from "@/components/public-sales-menu";
import { createPublicConsumptionOrder } from "./actions";
import { PublicMenuBrowser } from "@/components/public-menu-browser";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ eventSlug: string }>;
  searchParams?: Promise<{
    error?: string;
    sessao?: string;
    mesa?: string;
    table?: string;
    grupo?: string;
    responsavel?: string;
    customer?: string;
    garcom?: string;
    fechamento?: string;
  }>;
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
    .select(
      "id, name, category, description, price, unit_label, requires_preparation",
    )
    .eq("event_id", event.id)
    .eq("active", true)
    .order("category")
    .order("sort_order");

  return {
    event: event as EventRow,
    items: (items ?? []) as PublicSalesMenuItem[],
  };
}

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

function PublicPersuasiveMenu({
  event,
  items,
}: {
  event: EventRow;
  items: PublicSalesMenuItem[];
}) {
  return (
    <main className="min-h-screen bg-[#fff9e6] text-green-950">
      <section className="mx-auto max-w-6xl px-4 py-6 sm:px-5 sm:py-8">
        <div className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-amber-400 via-orange-300 to-yellow-300 shadow-sm">
          <div className="grid gap-6 p-6 md:grid-cols-[1.2fr_0.8fr] md:p-8">
            <div>
              <span className="rounded-full bg-white/85 px-3 py-1 text-xs font-black text-green-900">
                Cardápio do evento
              </span>
              <h1 className="mt-4 text-4xl font-black tracking-tight text-green-950 md:text-5xl">
                Sabores do {event.name}
              </h1>
              <p className="mt-4 max-w-2xl text-base font-semibold leading-relaxed text-green-950/85 md:text-lg">
                Escolha com calma o que você quer provar, combine com a família
                e, no dia da festa, faça seu pedido com um garçom.
              </p>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-stone-800 md:text-base">
                O garçom registra os itens no sistema e entrega as fichas em
                papel para retirada. Assim todo mundo aproveita mais: menos
                confusão, menos fila e mais tempo para curtir a Festa Junina do
                Tucxa.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <div className="inline-flex items-center justify-center rounded-2xl bg-green-900 px-6 py-4 text-center font-black text-white shadow-lg">
                  Chame um garçom para fazer seu pedido
                </div>
                <a
                  href="#itens"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-6 py-4 text-center font-black text-green-950 shadow-lg transition hover:bg-amber-50"
                >
                  Ver itens e valores
                </a>
              </div>
            </div>

            <div className="rounded-[1.5rem] bg-white/80 p-5 shadow-sm backdrop-blur">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-900 text-white">
                <HeartHandshake className="h-6 w-6" />
              </div>
              <h2 className="mt-4 text-2xl font-black">
                Por que pedir pelo garçom?
              </h2>
              <div className="mt-4 grid gap-3 text-sm leading-relaxed text-stone-700">
                <p>
                  <strong className="text-green-950">Mais simples:</strong> você
                  fala o pedido, o garçom registra e entrega a ficha.
                </p>
                <p>
                  <strong className="text-green-950">Mais organizado:</strong> a
                  coordenação acompanha pedidos, pagamentos e totais.
                </p>
                <p>
                  <strong className="text-green-950">
                    Mais tempo de festa:
                  </strong>{" "}
                  você escolhe rápido e volta para aproveitar a família, os
                  amigos e o bingo.
                </p>
              </div>
            </div>
          </div>
        </div>

        <section className="mt-6 grid gap-4 md:grid-cols-3">
          <article className="rounded-3xl bg-white p-5 shadow-sm">
            <Sparkles className="mb-3 h-6 w-6 text-green-800" />
            <h3 className="font-black">Escolha sem pressa</h3>
            <p className="mt-2 text-sm text-stone-600">
              Veja preços e opções antes de falar com o garçom.
            </p>
          </article>
          <article className="rounded-3xl bg-white p-5 shadow-sm">
            <Utensils className="mb-3 h-6 w-6 text-green-800" />
            <h3 className="font-black">Retirada com ficha</h3>
            <p className="mt-2 text-sm text-stone-600">
              Após o pedido, use a ficha para retirar os itens no ponto
              indicado.
            </p>
          </article>
          <article className="rounded-3xl bg-white p-5 shadow-sm">
            <Search className="mb-3 h-6 w-6 text-green-800" />
            <h3 className="font-black">Tudo em uma lista</h3>
            <p className="mt-2 text-sm text-stone-600">
              Comidas, doces e bebidas separados para facilitar a escolha.
            </p>
          </article>
        </section>

        {items.length === 0 ? (
          <section id="itens" className="mt-8 rounded-[2rem] bg-white p-6 text-sm text-stone-600 shadow-sm">
            O cardápio ainda não foi liberado para este evento. Aguarde
            orientação da coordenação.
          </section>
        ) : (
          <PublicMenuBrowser items={items} />
        )}
      </section>
    </main>
  );
}

export default async function PublicCardapioPage({
  params,
  searchParams,
}: PageProps) {
  const { eventSlug } = await params;
  const query = await searchParams;
  const data = await getData(eventSlug);
  if (!data) notFound();

  const { event, items } = data;
  const serviceSessionId = firstParam(query?.sessao);
  const tableLabel =
    firstParam(query?.mesa) ||
    firstParam(query?.table) ||
    firstParam(query?.grupo);
  const responsibleName =
    firstParam(query?.responsavel) || firstParam(query?.customer);
  const waiterName = firstParam(query?.garcom);
  const settlementMode = firstParam(query?.fechamento);
  const isTableService = Boolean(
    serviceSessionId ||
    tableLabel ||
    responsibleName ||
    waiterName ||
    settlementMode,
  );

  if (!isTableService) {
    return <PublicPersuasiveMenu event={event} items={items} />;
  }

  return (
    <main className="min-h-screen bg-[#fff9e6] text-green-950">
      <section className="mx-auto max-w-3xl px-4 py-6">
        <div className="mb-4 flex flex-wrap items-center justify-start gap-3">
          <Link
            href="/gestao-evento/garcom"
            className="rounded-full bg-white px-5 py-3 text-sm font-black text-green-950 shadow-sm"
            prefetch={false}
          >
            ← Voltar para Garçom/Atendimento
          </Link>
        </div>

        <div className="rounded-[2rem] bg-gradient-to-br from-amber-400 to-yellow-300 p-6 shadow-sm">
          <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-black text-green-900">
            Pedido pelo garçom
          </span>
          <h1 className="mt-4 text-3xl font-black">{event.name}</h1>
          <p className="mt-2 text-sm text-green-950/80">
            Registre os itens solicitados pelo responsável. O pedido fica
            vinculado ao atendimento e pode ser acompanhado no caixa.
          </p>
        </div>

        {items.length === 0 ? (
          <div className="mt-5 rounded-[2rem] bg-white p-5 text-sm text-stone-600 shadow-sm">
            O cardápio de vendas ainda não foi liberado para este evento.
            Aguarde orientação da coordenação.
          </div>
        ) : (
          <PublicSalesMenu
            eventSlug={event.slug}
            items={items}
            defaultServiceSessionId={serviceSessionId}
            defaultTableLabel={tableLabel}
            defaultCustomerName={responsibleName}
            defaultWaiterName={waiterName}
            defaultSettlementMode={settlementMode}
            error={query?.error}
            action={createPublicConsumptionOrder.bind(null, event.slug)}
          />
        )}
      </section>
    </main>
  );
}
