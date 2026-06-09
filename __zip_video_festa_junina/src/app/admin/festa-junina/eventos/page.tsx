import Link from "next/link";
import { MapPin } from "lucide-react";
import { AdminPageShell } from "@/components/admin-page-shell";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabaseServer";
import { openEvent } from "./actions";
import type { EventConfig } from "@/types/festa-junina";

export const dynamic = "force-dynamic";

type PageProps = { searchParams?: Promise<Record<string, string | string[] | undefined>> };

type EventRow = EventConfig & {
  year: number | null;
  active_for_sales: boolean | null;
  featured_prize_name: string | null;
};

async function getEvents() {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.from("events").select("*").order("event_date", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as EventRow[];
}

function formatDate(value: string | null) {
  if (!value) return "Data não informada";
  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
}

function formatTime(value: string | null) {
  return value ? value.slice(0, 5) : "--:--";
}

function statusLabel(status: EventConfig["status"]) {
  const labels = { draft: "Rascunho", published: "Publicado", closed: "Encerrado" };
  return labels[status] ?? status;
}

function statusClass(status: EventConfig["status"]) {
  if (status === "published") return "bg-green-50 text-green-800 ring-green-100";
  if (status === "closed") return "bg-stone-100 text-stone-700 ring-stone-200";
  return "bg-amber-50 text-amber-800 ring-amber-100";
}

function yesNo(value: boolean | null | undefined) {
  return value ? "Sim" : "Não";
}

function EventCard({ event }: { event: EventRow }) {
  return (
    <article className="rounded-[1.75rem] border border-green-100 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-green-950">{event.name}</h2>
          <p className="mt-1 text-sm text-stone-600">{formatDate(event.event_date)}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {event.active_for_sales ? <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-black text-green-900">Evento aberto</span> : null}
          <span className={`rounded-full px-3 py-1 text-xs font-black ring-1 ${statusClass(event.status)}`}>{statusLabel(event.status)}</span>
        </div>
      </div>

      <div className="mt-5 grid gap-2 text-sm text-stone-700">
        <p><strong>Horário:</strong> {formatTime(event.start_time)} às {formatTime(event.end_time)}</p>
        <p><strong>Local:</strong> {event.location_name || "Local não informado"}</p>
        {event.location_address ? <p className="flex gap-2"><MapPin className="mt-0.5 h-4 w-4 text-green-800" /> <span>{event.location_address}</span></p> : null}
        {event.featured_prize_name ? <p><strong>Brinde/sorteio:</strong> {event.featured_prize_name}</p> : null}
        <p><strong>Capacidade salão:</strong> {event.covered_hall_capacity ?? 80} pessoas</p>
        <p><strong>Capacidade operacional:</strong> {event.operational_capacity ?? 80} pessoas</p>
      </div>

      <details className="mt-5 rounded-3xl border border-green-100 bg-green-50/40 p-4 text-sm text-stone-700">
        <summary className="cursor-pointer font-black text-green-950">Ver todas as informações do evento</summary>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <p><strong>Slug:</strong> {event.slug}</p>
          <p><strong>Ano:</strong> {event.year ?? "Não informado"}</p>
          <p><strong>Subtítulo:</strong> {event.subtitle ?? "Não informado"}</p>
          <p><strong>Pix:</strong> {event.pix_key ?? "Não informado"}</p>
          <p><strong>Recebedor Pix:</strong> {event.pix_receiver_name ?? "Não informado"}</p>
          <p><strong>Vendas públicas:</strong> {yesNo(event.allow_public_sales)}</p>
          <p><strong>Combos:</strong> {yesNo(event.allow_combos)}</p>
          <p><strong>Crianças grátis:</strong> {yesNo(event.allow_children_free)} até {event.children_free_age_limit ?? 10} anos</p>
          <p><strong>Site do local:</strong> {event.venue_site_url ?? "Não informado"}</p>
          <p><strong>Contato do local:</strong> {event.venue_contact_phone ?? event.venue_contact_email ?? "Não informado"}</p>
          <p><strong>Mesas estimadas:</strong> {event.estimated_tables ?? "Não informado"}</p>
          <p><strong>Cadeiras estimadas:</strong> {event.estimated_chairs ?? "Não informado"}</p>
          <p><strong>Freezers:</strong> {event.freezer_count ?? "Não informado"}</p>
          <p><strong>Geladeiras:</strong> {event.refrigerator_count ?? "Não informado"}</p>
          <p><strong>Margem de segurança:</strong> {event.safety_margin_percent ?? 15}%</p>
          <p><strong>Permanência média:</strong> {event.average_stay_hours ?? "Não informado"}h</p>
          <p className="md:col-span-2"><strong>Descrição:</strong> {event.description ?? "Não informada"}</p>
          <p className="md:col-span-2"><strong>Recursos do local:</strong> {event.venue_resources_notes ?? "Não informado"}</p>
          <p className="md:col-span-2"><strong>Premissas de capacidade:</strong> {event.capacity_notes ?? "Não informado"}</p>
        </div>
      </details>

      <div className="mt-6 flex flex-wrap gap-3">
        <form action={openEvent}>
          <input type="hidden" name="event_id" value={event.id} />
          <button className="rounded-full bg-green-900 px-5 py-3 text-sm font-black text-white transition hover:bg-green-800">Abrir evento</button>
        </form>
        <Link href={`/admin/festa-junina/eventos/${event.id}`} className="rounded-full border border-green-100 bg-white px-5 py-3 text-sm font-black text-green-950 transition hover:bg-green-50">
          Configurar
        </Link>
      </div>
    </article>
  );
}

export default async function EventosPage({ searchParams }: PageProps) {
  await requireAdmin(["admin", "coordenador"], "/admin/festa-junina/eventos");
  const params = await searchParams;
  const events = await getEvents();

  return (
    <AdminPageShell>
      <section className="mx-auto max-w-7xl px-5 py-10">
        <div className="rounded-[2rem] border border-green-100 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-black text-green-900">Eventos</span>
              <h1 className="mt-4 text-3xl font-black text-green-950">Eventos da Festa Junina</h1>
              <p className="mt-3 max-w-3xl text-stone-700">
                Aqui aparecem as edições cadastradas da Festa Junina do Tucxa. Use esta tela para abrir o evento, configurar módulos e acessar as opções operacionais.
              </p>
            </div>
            <Link href="/admin/festa-junina/eventos/novo" className="rounded-full bg-green-900 px-6 py-3 text-sm font-black text-white shadow-sm transition hover:bg-green-800">
              Novo evento
            </Link>
          </div>

          {params?.saved ? <div className="mt-5 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm font-bold text-green-900">Evento salvo com sucesso.</div> : null}
          {params?.created ? <div className="mt-5 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm font-bold text-green-900">Evento criado com sucesso.</div> : null}
          {events.length === 0 ? (
            <div className="mt-8 rounded-3xl border border-dashed border-green-200 bg-green-50 p-6 text-sm text-stone-700">
              Nenhum evento cadastrado ainda. Clique em <strong>Novo evento</strong> para criar a primeira edição.
            </div>
          ) : (
            <div className="mt-8 grid gap-5 lg:grid-cols-2">
              {events.map((event) => <EventCard key={event.id} event={event} />)}
            </div>
          )}
        </div>
      </section>
    </AdminPageShell>
  );
}
