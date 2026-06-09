import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminPageShell } from "@/components/admin-page-shell";
import { EventForm } from "@/components/admin-events/event-form";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabaseServer";
import type { EventConfig } from "@/types/festa-junina";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ eventId: string }> };

type EventRow = EventConfig & {
  year: number | null;
  active_for_sales: boolean | null;
  featured_prize_name: string | null;
  featured_prize_description: string | null;
};

async function getEvent(eventId: string) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.from("events").select("*").eq("id", eventId).maybeSingle();
  if (error) throw new Error(error.message);
  return data as EventRow | null;
}

export default async function EditarEventoPage({ params }: PageProps) {
  await requireAdmin(["admin", "coordenador"], "/admin/festa-junina/eventos");
  const { eventId } = await params;
  const event = await getEvent(eventId);
  if (!event) notFound();

  return (
    <AdminPageShell>
      <section className="mx-auto max-w-5xl px-5 py-10">
        <Link href="/admin/festa-junina/eventos" className="rounded-full bg-white px-4 py-2 text-sm font-black text-green-950 shadow-sm">
          ← Voltar para eventos
        </Link>
        <div className="mt-8">
          <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-black text-green-900">Configurar evento</span>
          <h1 className="mt-4 text-3xl font-black text-green-950">{event.name}</h1>
          <p className="mt-2 max-w-3xl text-stone-700">Edite data, horário, local, status e regras principais desta edição.</p>
        </div>
        <div className="mt-8">
          <EventForm event={event} />
        </div>
      </section>
    </AdminPageShell>
  );
}
