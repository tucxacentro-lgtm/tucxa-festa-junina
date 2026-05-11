import Image from "next/image";
import { CalendarDays, Gift, MapPin, PartyPopper, QrCode, Ticket, Utensils, Users } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { formatCurrency, formatDate, formatTime } from "@/lib/format";
import type { Combo, EventConfig, PaymentOption, TicketType } from "@/types/festa-junina";
import { TicketOrderForm } from "./components/ticket-order-form";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

async function getEventData() {
  const supabase = createSupabaseServerClient();

  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("*")
    .eq("slug", "arraia-tucxa-2026")
    .single();

  if (eventError || !event) {
    throw new Error(eventError?.message ?? "Evento não encontrado.");
  }

  const [{ data: ticketTypes }, { data: combos }, { data: paymentOptions }] = await Promise.all([
    supabase
      .from("ticket_types")
      .select("*")
      .eq("event_id", event.id)
      .eq("active", true)
      .order("sort_order"),

    supabase
      .from("offer_combos")
      .select("*")
      .eq("event_id", event.id)
      .eq("active", true)
      .order("sort_order"),

    supabase
      .from("payment_options")
      .select("*")
      .eq("event_id", event.id)
      .eq("active", true)
      .order("sort_order"),
  ]);

  const eventConfig = {
    ...event,
    pix_key:
      event.pix_key ||
      process.env.TUCXA_PIX_KEY ||
      process.env.NEXT_PUBLIC_TUCXA_PIX_KEY ||
      process.env.PIX_KEY ||
      null,
    pix_receiver_name:
      event.pix_receiver_name ||
      process.env.TUCXA_PIX_RECEIVER_NAME ||
      process.env.NEXT_PUBLIC_TUCXA_PIX_RECEIVER_NAME ||
      "Tucxa",
  } as EventConfig;

  return {
    event: eventConfig,
    ticketTypes: (ticketTypes ?? []) as TicketType[],
    combos: (combos ?? []) as Combo[],
    paymentOptions: (paymentOptions ?? []) as PaymentOption[],
  };
}

export default async function FestaJuninaPage({ searchParams }: PageProps) {
  const { event, ticketTypes, combos, paymentOptions } = await getEventData();
  const params = await searchParams;
  const refParam = params?.ref;
  const initialReferralCode = Array.isArray(refParam) ? refParam[0] ?? "" : refParam ?? "";

  return (
    <main className="min-h-screen bg-amber-50 text-stone-900">
      <SiteHeader />

      <section className="relative overflow-hidden bg-gradient-to-br from-amber-400 via-orange-400 to-yellow-300">
        <div className="absolute inset-x-0 top-0 h-12 bg-[repeating-linear-gradient(45deg,#166534_0_12px,#fef3c7_12px_24px,#dc2626_24px_36px,#2563eb_36px_48px)] opacity-40" />

        <div className="mx-auto grid max-w-6xl gap-8 px-5 pb-14 pt-20 md:grid-cols-[1.1fr_0.9fr] md:items-center">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm font-semibold text-green-900 shadow-sm">
              <PartyPopper className="h-4 w-4" />
              Festa Junina beneficente
            </div>

            <h1 className="text-4xl font-black tracking-tight text-white drop-shadow-sm md:text-6xl">
              {event.name}
            </h1>

            <p className="mt-5 max-w-2xl text-lg font-medium text-green-950 md:text-xl">
              {event.subtitle}
            </p>

            <p className="mt-4 max-w-2xl text-base leading-relaxed text-stone-800">
              {event.description}
            </p>

            <div className="mt-7 grid gap-3 text-sm font-semibold text-green-950 sm:grid-cols-2">
              <div className="flex items-center gap-2 rounded-2xl bg-white/80 p-4 shadow-sm">
                <CalendarDays className="h-5 w-5" />
                <span>
                  {formatDate(event.event_date)} {event.start_time ? `• ${formatTime(event.start_time)}` : ""}
                  {event.end_time ? ` às ${formatTime(event.end_time)}` : ""}
                </span>
              </div>

              <div className="flex items-center gap-2 rounded-2xl bg-white/80 p-4 shadow-sm">
                <MapPin className="h-5 w-5" />
                <span>{event.location_name ?? "Local a confirmar"}</span>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="#reserva"
                className="rounded-2xl bg-green-900 px-6 py-4 text-center font-bold text-white shadow-lg transition hover:bg-green-800"
              >
                Garantir meu convite
              </a>
              <a
                href="#combos"
                className="rounded-2xl bg-white px-6 py-4 text-center font-bold text-green-900 shadow-lg transition hover:bg-amber-50"
              >
                Ver combos
              </a>
            </div>
          </div>

          <div className="rounded-[2rem] bg-white/85 p-6 shadow-2xl backdrop-blur">
            <div className="mx-auto mb-5 flex h-28 w-28 items-center justify-center rounded-full bg-white shadow">
              <Image
                src="/images/logo-tucxa.jpg"
                alt="Logo Tucxa"
                width={90}
                height={90}
                className="rounded-full object-contain"
                priority
              />
            </div>

            <div className="rounded-3xl bg-amber-100 p-5">
              <h2 className="text-2xl font-black text-green-950">Comprar antes ajuda todo mundo</h2>
              <p className="mt-3 text-sm leading-relaxed text-stone-700">
                Sua reserva antecipada ajuda a estimar comida, bebida, mesas, voluntários e atendimento.
                Assim, a festa fica mais organizada, confortável e gostosa para todos.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-12">
        <div className="grid gap-5 md:grid-cols-3">
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <Users className="mb-4 h-8 w-8 text-green-800" />
            <h3 className="font-black">Comunidade reunida</h3>
            <p className="mt-2 text-sm text-stone-600">
              Um momento para família, amigos, crianças e voluntários celebrarem juntos.
            </p>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <Utensils className="mb-4 h-8 w-8 text-green-800" />
            <h3 className="font-black">Planejamento de compras</h3>
            <p className="mt-2 text-sm text-stone-600">
              Convites e combos antecipados ajudam a prever alimentos, bebidas e insumos.
            </p>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <QrCode className="mb-4 h-8 w-8 text-green-800" />
            <h3 className="font-black">Código do comprador</h3>
            <p className="mt-2 text-sm text-stone-600">
              Cada compra gera um código para consultar ingressos, bingo e, futuramente, consumo da mesa.
            </p>
          </div>
        </div>
      </section>

      <section id="convites" className="mx-auto max-w-6xl px-5 py-10">
        <div className="flex items-center gap-3">
          <Ticket className="h-8 w-8 text-green-800" />
          <div>
            <h2 className="text-3xl font-black text-green-950">Opções de convite</h2>
            <p className="mt-1 text-stone-600">Valores configuráveis pela organização.</p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {ticketTypes.map((ticket) => (
            <div key={ticket.id} className="rounded-3xl bg-white p-6 shadow-sm">
              <h3 className="text-xl font-black">{ticket.name}</h3>
              <p className="mt-2 min-h-12 text-sm text-stone-600">{ticket.description}</p>
              <p className="mt-5 text-3xl font-black text-green-900">
                {ticket.is_free ? "Grátis" : formatCurrency(ticket.price)}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section id="combos" className="mx-auto max-w-6xl px-5 py-10">
        <div className="flex items-center gap-3">
          <Gift className="h-8 w-8 text-green-800" />
          <div>
            <h2 className="text-3xl font-black text-green-950">Combos antecipados</h2>
            <p className="mt-1 text-stone-600">
              Os combos podem incluir convites, comidas, bebidas e cartelas de bingo.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {combos.map((combo) => (
            <div
              key={combo.id}
              className={`rounded-3xl p-6 shadow-sm ${
                combo.highlighted ? "bg-green-900 text-white" : "bg-white text-stone-900"
              }`}
            >
              <div className="flex flex-wrap gap-2">
                {combo.badge ? (
                  <span
                    className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${
                      combo.highlighted ? "bg-amber-300 text-green-950" : "bg-amber-100 text-green-900"
                    }`}
                  >
                    {combo.badge}
                  </span>
                ) : null}
                {combo.includes_bingo ? (
                  <span className="inline-block rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-800">
                    Inclui bingo
                  </span>
                ) : null}
              </div>

              <h3 className="mt-4 text-2xl font-black">{combo.name}</h3>
              <p className={`mt-1 font-semibold ${combo.highlighted ? "text-amber-100" : "text-green-900"}`}>
                {combo.subtitle}
              </p>
              <p className={`mt-3 text-sm leading-relaxed ${combo.highlighted ? "text-white/85" : "text-stone-600"}`}>
                {combo.description}
              </p>

              <div className="mt-5 flex items-end gap-3">
                <p className="text-3xl font-black">{formatCurrency(combo.price)}</p>
                {combo.compare_at_price ? (
                  <p className={`pb-1 text-sm line-through ${combo.highlighted ? "text-white/60" : "text-stone-400"}`}>
                    {formatCurrency(combo.compare_at_price)}
                  </p>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="reserva" className="mx-auto max-w-6xl px-5 py-10">
        <div className="rounded-[2rem] bg-white p-6 shadow-sm md:p-8">
          <h2 className="text-3xl font-black text-green-950">Reserve seu convite</h2>
          <p className="mt-2 text-stone-600">
            Informe seus dados, escolha convite ou combo e carregue o comprovante/registro do pagamento.
            O WhatsApp é obrigatório. O e-mail pode ser informado quando houver.
          </p>

          <TicketOrderForm
            event={event}
            ticketTypes={ticketTypes}
            combos={combos}
            paymentOptions={paymentOptions}
            initialReferralCode={initialReferralCode}
          />
        </div>
      </section>
    </main>
  );
}
