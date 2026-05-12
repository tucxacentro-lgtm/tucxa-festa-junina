import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabaseServer";
import type { EventConfig, TicketType } from "@/types/festa-junina";
import { saveTicketType } from "./actions";
import { AdminPageShell } from "@/components/admin-page-shell";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function FormStatusMessage({ message }: { message?: string }) {
  if (!message) return null;

  return (
    <div className="mb-5 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm font-bold text-green-900">
      {message}
    </div>
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
  return { event: event as EventConfig, tickets: (tickets ?? []) as TicketType[] };
}

function TicketForm({ eventId, ticket }: { eventId: string; ticket?: TicketType }) {
  return (
    <form action={saveTicketType} className="grid gap-3 rounded-3xl bg-white p-5 shadow-sm">
      <input type="hidden" name="event_id" value={eventId} />
      <input type="hidden" name="id" value={ticket?.id ?? ""} />

      <div className="grid gap-3 md:grid-cols-2">
        <label className="grid gap-1 text-sm font-bold text-green-950">
          Nome
          <input name="name" required defaultValue={ticket?.name ?? ""} className="rounded-2xl border border-stone-200 p-3 font-normal" />
        </label>
        <label className="grid gap-1 text-sm font-bold text-green-950">
          Valor
          <input name="price" type="text" inputMode="decimal" required defaultValue={ticket?.price ?? "0"} className="rounded-2xl border border-stone-200 p-3 font-normal" />
        </label>
      </div>

      <label className="grid gap-1 text-sm font-bold text-green-950">
        Descrição
        <textarea name="description" defaultValue={ticket?.description ?? ""} className="min-h-20 rounded-2xl border border-stone-200 p-3 font-normal" />
      </label>

      <div className="grid gap-3 md:grid-cols-3">
        <label className="grid gap-1 text-sm font-bold text-green-950">
          Modo de venda
          <select name="sale_mode" defaultValue={ticket?.sale_mode ?? "online"} className="rounded-2xl border border-stone-200 p-3 font-normal">
            <option value="online">Online</option>
            <option value="door">Na hora</option>
            <option value="manual">Manual</option>
          </select>
        </label>
        <label className="grid gap-1 text-sm font-bold text-green-950">
          Ordem
          <input name="sort_order" type="number" defaultValue={0} className="rounded-2xl border border-stone-200 p-3 font-normal" />
        </label>
        <div className="flex flex-wrap items-center gap-4 pt-5 text-sm font-bold text-green-950">
          <label className="flex items-center gap-2"><input name="active" type="checkbox" defaultChecked={ticket?.active ?? true} /> Ativo</label>
          <label className="flex items-center gap-2"><input name="is_free" type="checkbox" defaultChecked={ticket?.is_free ?? false} /> Grátis</label>
        </div>
      </div>

      <button className="rounded-2xl bg-green-900 px-5 py-3 font-black text-white">{ticket ? "Salvar convite" : "Criar convite"}</button>
    </form>
  );
}

export default async function ConvitesPage({ searchParams }: PageProps) {
  await requireAdmin(["admin", "coordenador"], "/admin/festa-junina/convites");
  const { event, tickets } = await getData();
  const params = await searchParams;
  const successMessage = params?.saved ? "Convite salvo com sucesso." : undefined;

  return (
    <AdminPageShell>
      
      <section className="mx-auto max-w-6xl px-5 py-10">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-black text-green-950">Convites e valores</h1>
            <p className="mt-2 text-stone-600">Cadastre e edite os tipos de convite exibidos na página pública.</p>
          </div>
          <Link href="/admin/festa-junina" className="rounded-2xl bg-white px-5 py-3 text-sm font-bold text-green-950 shadow-sm" prefetch={false}>Voltar ao admin</Link>
        </div>

        <FormStatusMessage message={successMessage} />

        <div className="grid gap-5">
          {tickets.map((ticket) => <TicketForm key={ticket.id} eventId={event.id} ticket={ticket} />)}
          <div>
            <h2 className="mb-3 text-xl font-black text-green-950">Novo convite</h2>
            <TicketForm eventId={event.id} />
          </div>
        </div>
      </section>
    </AdminPageShell>
  );
}
