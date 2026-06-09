import Link from "next/link";
import { AdminPageShell } from "@/components/admin-page-shell";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabaseServer";
import type { EventConfig, TicketType } from "@/types/festa-junina";
import { saveTicketType } from "./actions";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

type TicketWithDates = TicketType & {
  available_until?: string | null;
  available_from?: string | null;
};

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function moneyLabel(value: number | string | null | undefined) {
  const numberValue = typeof value === "number" ? value : Number(value ?? 0);
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number.isFinite(numberValue) ? numberValue : 0);
}

function saleModeLabel(value: string) {
  const labels: Record<string, string> = { online: "Online", door: "Na hora", manual: "Manual" };
  return labels[value] ?? value;
}

function StatusBadge({ active }: { active?: boolean }) {
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-black ${active ? "bg-green-100 text-green-900" : "bg-stone-100 text-stone-600"}`}>
      {active ? "Publicado" : "Inativo"}
    </span>
  );
}

async function getData() {
  const supabase = createSupabaseAdminClient();
  const { data: event, error: eventError } = await supabase.from("events").select("*").eq("slug", "arraia-tucxa-2026").single();
  if (eventError || !event) throw new Error(eventError?.message ?? "Evento não encontrado.");

  const { data: tickets, error } = await supabase
    .from("ticket_types")
    .select("*")
    .eq("event_id", event.id)
    .order("sort_order");

  if (error) throw new Error(error.message);
  return { event: event as EventConfig, tickets: (tickets ?? []) as TicketWithDates[] };
}

function FormStatusMessage({ message }: { message?: string }) {
  if (!message) return null;
  return <div className="rounded-2xl border border-green-200 bg-green-50 p-4 text-sm font-bold text-green-900">{message}</div>;
}

function TicketCard({ ticket }: { ticket: TicketWithDates }) {
  return (
    <article className="rounded-[1.75rem] border border-green-100 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-green-950">{ticket.name}</h2>
          <p className="mt-1 text-2xl font-black text-green-900">{ticket.is_free ? "Grátis" : moneyLabel(ticket.price)}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <StatusBadge active={ticket.active} />
          <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-black text-amber-800">{saleModeLabel(ticket.sale_mode)}</span>
        </div>
      </div>
      {ticket.description ? <p className="mt-4 text-sm text-stone-700">{ticket.description}</p> : null}
      <dl className="mt-5 grid gap-2 text-sm text-stone-700 md:grid-cols-2">
        <div><dt className="font-black text-green-950">Ordem</dt><dd>{ticket.sort_order ?? 0}</dd></div>
        <div><dt className="font-black text-green-950">Tipo</dt><dd>{ticket.is_free ? "Gratuidade" : "Pago"}</dd></div>
        {ticket.available_until ? <div><dt className="font-black text-green-950">Disponível até</dt><dd>{ticket.available_until}</dd></div> : null}
        {ticket.available_from ? <div><dt className="font-black text-green-950">Disponível a partir</dt><dd>{ticket.available_from}</dd></div> : null}
      </dl>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link href={`/admin/festa-junina/convites?edit=${ticket.id}`} className="rounded-full bg-green-900 px-5 py-3 text-sm font-black text-white" prefetch={false}>Editar</Link>
        <Link href="/admin/festa-junina/convites?new=1" className="rounded-full border border-green-100 bg-white px-5 py-3 text-sm font-black text-green-950" prefetch={false}>Criar novo</Link>
      </div>
    </article>
  );
}

function TicketForm({ eventId, ticket }: { eventId: string; ticket?: TicketWithDates }) {
  return (
    <form action={saveTicketType} className="rounded-[1.75rem] border border-green-100 bg-white p-6 shadow-sm">
      <input type="hidden" name="event_id" value={eventId} />
      <input type="hidden" name="id" value={ticket?.id ?? ""} />
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-black text-green-900">{ticket ? "Editar convite" : "Novo convite"}</span>
          <h2 className="mt-3 text-2xl font-black text-green-950">{ticket ? ticket.name : "Cadastrar convite individual"}</h2>
        </div>
        <Link href="/admin/festa-junina/convites" className="rounded-full bg-white px-4 py-2 text-sm font-black text-green-950 shadow-sm" prefetch={false}>Cancelar</Link>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="grid gap-1 text-sm font-bold text-green-950">Nome<input name="name" required defaultValue={ticket?.name ?? ""} className="rounded-2xl border border-stone-200 p-3 font-normal" /></label>
        <label className="grid gap-1 text-sm font-bold text-green-950">Valor<input name="price" type="text" inputMode="decimal" required defaultValue={ticket?.price ?? "0"} className="rounded-2xl border border-stone-200 p-3 font-normal" /></label>
      </div>
      <label className="mt-3 grid gap-1 text-sm font-bold text-green-950">Descrição<textarea name="description" defaultValue={ticket?.description ?? ""} className="min-h-20 rounded-2xl border border-stone-200 p-3 font-normal" /></label>
      <div className="mt-3 grid gap-3 md:grid-cols-3">
        <label className="grid gap-1 text-sm font-bold text-green-950">Modo de venda<select name="sale_mode" defaultValue={ticket?.sale_mode ?? "online"} className="rounded-2xl border border-stone-200 p-3 font-normal"><option value="online">Online</option><option value="door">Na hora</option><option value="manual">Manual</option></select></label>
        <label className="grid gap-1 text-sm font-bold text-green-950">Ordem<input name="sort_order" type="number" defaultValue={ticket?.sort_order ?? 0} className="rounded-2xl border border-stone-200 p-3 font-normal" /></label>
        <div className="flex flex-wrap items-center gap-4 pt-5 text-sm font-bold text-green-950">
          <label className="flex items-center gap-2"><input name="active" type="checkbox" defaultChecked={ticket?.active ?? true} /> Publicado</label>
          <label className="flex items-center gap-2"><input name="is_free" type="checkbox" defaultChecked={ticket?.is_free ?? false} /> Grátis</label>
        </div>
      </div>
      <button className="mt-5 w-full rounded-2xl bg-green-900 px-5 py-3 font-black text-white">{ticket ? "Salvar alterações" : "Criar convite"}</button>
    </form>
  );
}

export default async function ConvitesPage({ searchParams }: PageProps) {
  await requireAdmin(["admin", "coordenador"], "/admin/festa-junina/convites");
  const { event, tickets } = await getData();
  const params = await searchParams;
  const editId = firstParam(params?.edit);
  const showNew = firstParam(params?.new) === "1";
  const editingTicket = editId ? tickets.find((ticket) => ticket.id === editId) : undefined;
  const successMessage = params?.saved ? "Convite salvo com sucesso." : undefined;

  return (
    <AdminPageShell>
      <section className="mx-auto max-w-6xl px-5 py-10">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-black text-green-900">Vendas · Convites</span>
            <h1 className="mt-3 text-3xl font-black text-green-950">Convites individuais</h1>
            <p className="mt-2 max-w-3xl text-stone-600">Cadastre os tipos de convite que aparecem para o público e para a gestão. Em 2026, a venda principal será o ingresso individual com sorteio da Air Fryer.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/admin/festa-junina/convites?new=1" className="rounded-full bg-green-900 px-5 py-3 text-sm font-black text-white" prefetch={false}>Novo convite individual</Link>
            <Link href="/admin/festa-junina" className="rounded-full bg-white px-5 py-3 text-sm font-bold text-green-950 shadow-sm" prefetch={false}>Voltar à gestão</Link>
          </div>
        </div>

        <FormStatusMessage message={successMessage} />

        {editingTicket || showNew ? <div className="mt-6"><TicketForm eventId={event.id} ticket={editingTicket} /></div> : null}

        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          {tickets.map((ticket) => <TicketCard key={ticket.id} ticket={ticket} />)}
        </div>
      </section>
    </AdminPageShell>
  );
}
