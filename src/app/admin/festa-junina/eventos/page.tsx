import { CalendarDays } from "lucide-react";
import { AdminPageShell } from "@/components/admin-page-shell";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabaseServer";
import { saveEvent } from "./actions";
import type { EventConfig } from "@/types/festa-junina";

export const dynamic = "force-dynamic";

type PageProps = { searchParams?: Promise<Record<string, string | string[] | undefined>> };

type EventRow = EventConfig & {
  year: number | null;
  active_for_sales: boolean | null;
  featured_prize_name: string | null;
  featured_prize_description: string | null;
};

async function getEvents() {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.from("events").select("*").order("event_date", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as EventRow[];
}

function EventForm({ event }: { event?: EventRow }) {
  return (
    <form action={saveEvent} className="grid gap-4 rounded-3xl bg-white p-6 shadow-sm">
      <input type="hidden" name="id" value={event?.id ?? ""} />
      <div className="grid gap-4 md:grid-cols-3">
        <label className="grid gap-2 text-sm font-bold text-green-950 md:col-span-2">Nome do evento<input name="name" required defaultValue={event?.name ?? "Festa Junina Tucxa 2026"} className="rounded-2xl border border-stone-200 p-3 font-normal" /></label>
        <label className="grid gap-2 text-sm font-bold text-green-950">Ano<input name="year" type="number" required defaultValue={event?.year ?? 2026} className="rounded-2xl border border-stone-200 p-3 font-normal" /></label>
        <label className="grid gap-2 text-sm font-bold text-green-950 md:col-span-2">Slug<input name="slug" defaultValue={event?.slug ?? "arraia-tucxa-2026"} className="rounded-2xl border border-stone-200 p-3 font-normal" /></label>
        <label className="grid gap-2 text-sm font-bold text-green-950">Status<select name="status" defaultValue={event?.status ?? "published"} className="rounded-2xl border border-stone-200 p-3 font-normal"><option value="draft">Rascunho</option><option value="published">Publicado</option><option value="closed">Encerrado</option></select></label>
        <label className="grid gap-2 text-sm font-bold text-green-950 md:col-span-3">Subtítulo<input name="subtitle" defaultValue={event?.subtitle ?? "Comidas típicas, quadrilha, brincadeiras e muita alegria."} className="rounded-2xl border border-stone-200 p-3 font-normal" /></label>
        <label className="grid gap-2 text-sm font-bold text-green-950 md:col-span-3">Descrição<textarea name="description" defaultValue={event?.description ?? "Garanta seu convite antecipado, participe da festa e concorra a uma linda Air Fryer no bingo do evento."} className="min-h-20 rounded-2xl border border-stone-200 p-3 font-normal" /></label>
        <label className="grid gap-2 text-sm font-bold text-green-950">Data<input name="event_date" type="date" defaultValue={event?.event_date ?? "2026-06-14"} className="rounded-2xl border border-stone-200 p-3 font-normal" /></label>
        <label className="grid gap-2 text-sm font-bold text-green-950">Início<input name="start_time" type="time" defaultValue={event?.start_time?.slice(0, 5) ?? "12:00"} className="rounded-2xl border border-stone-200 p-3 font-normal" /></label>
        <label className="grid gap-2 text-sm font-bold text-green-950">Fim<input name="end_time" type="time" defaultValue={event?.end_time?.slice(0, 5) ?? "17:00"} className="rounded-2xl border border-stone-200 p-3 font-normal" /></label>
        <label className="grid gap-2 text-sm font-bold text-green-950">Local<input name="location_name" defaultValue={event?.location_name ?? "Espaço Santa Fé"} className="rounded-2xl border border-stone-200 p-3 font-normal" /></label>
        <label className="grid gap-2 text-sm font-bold text-green-950 md:col-span-2">Endereço<input name="location_address" defaultValue={event?.location_address ?? "Rua Antônio Maurício Ladeira, 474 - Jd Conceição - Campinas"} className="rounded-2xl border border-stone-200 p-3 font-normal" /></label>
        <label className="grid gap-2 text-sm font-bold text-green-950">Brinde/sorteio<input name="featured_prize_name" defaultValue={event?.featured_prize_name ?? "Linda Air Fryer"} className="rounded-2xl border border-stone-200 p-3 font-normal" /></label>
        <label className="grid gap-2 text-sm font-bold text-green-950 md:col-span-2">Descrição do brinde<input name="featured_prize_description" defaultValue={event?.featured_prize_description ?? "Cada ingresso concorre a uma linda Air Fryer através de um bingo realizado na festa."} className="rounded-2xl border border-stone-200 p-3 font-normal" /></label>
      </div>
      <div className="grid gap-3 rounded-3xl bg-amber-50 p-4 md:grid-cols-4">
        <label className="flex items-center gap-2 text-sm font-bold text-green-950"><input name="active_for_sales" type="checkbox" defaultChecked={event?.active_for_sales ?? true} /> Evento ativo</label>
        <label className="flex items-center gap-2 text-sm font-bold text-green-950"><input name="allow_public_sales" type="checkbox" defaultChecked={event?.allow_public_sales ?? true} /> Vendas públicas</label>
        <label className="flex items-center gap-2 text-sm font-bold text-green-950"><input name="allow_combos" type="checkbox" defaultChecked={event?.allow_combos ?? false} /> Combos</label>
        <label className="flex items-center gap-2 text-sm font-bold text-green-950"><input name="allow_children_free" type="checkbox" defaultChecked={event?.allow_children_free ?? true} /> Crianças grátis</label>
      </div>
      <input type="hidden" name="children_free_age_limit" value={event?.children_free_age_limit ?? 10} />
      <button className="rounded-2xl bg-green-900 px-5 py-3 font-black text-white">{event ? "Salvar evento" : "Criar evento"}</button>
    </form>
  );
}

export default async function EventosPage({ searchParams }: PageProps) {
  await requireAdmin(["admin", "coordenador"], "/admin/festa-junina/eventos");
  const params = await searchParams;
  const events = await getEvents();
  return (
    <AdminPageShell>
      <section className="mx-auto max-w-6xl px-5 py-10">
        <h1 className="text-3xl font-black text-green-950">Eventos da Festa Junina</h1>
        <p className="mt-2 max-w-3xl text-stone-600">Cadastre cada edição anual. Todas as opções do admin ficam associadas ao evento ativo, permitindo reaproveitar o sistema nos próximos anos.</p>
        {params?.saved ? <div className="mt-5 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm font-bold text-green-900">Evento salvo com sucesso.</div> : null}
        <div className="mt-8 grid gap-5">
          {events.map((event) => <div key={event.id} className="rounded-[2rem] border border-green-100 bg-white p-6 shadow-sm"><div className="mb-4 flex items-center gap-3"><CalendarDays className="h-6 w-6 text-green-800" /><div><h2 className="text-xl font-black text-green-950">{event.name}</h2><p className="text-sm text-stone-600">{event.event_date ?? "Sem data"} · {event.status} · {event.active_for_sales ? "ativo para vendas" : "não ativo"}</p></div></div><EventForm event={event} /></div>)}
          <div className="rounded-[2rem] border border-dashed border-green-200 bg-green-50 p-6"><h2 className="text-xl font-black text-green-950">Novo evento anual</h2><p className="mb-4 mt-2 text-sm text-stone-600">Use para cadastrar a próxima edição da Festa Junina do Tucxa.</p><EventForm /></div>
        </div>
      </section>
    </AdminPageShell>
  );
}
