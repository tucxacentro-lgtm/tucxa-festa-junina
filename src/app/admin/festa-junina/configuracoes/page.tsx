import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabaseServer";
import type { EventConfig } from "@/types/festa-junina";
import { updateEventSettings } from "./actions";
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

async function getEvent() {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.from("events").select("*").eq("slug", "arraia-tucxa-2026").single();

  if (error || !data) {
    throw new Error(error?.message ?? "Evento não encontrado.");
  }

  return data as EventConfig;
}

export default async function ConfiguracoesPage({ searchParams }: PageProps) {
  await requireAdmin(["admin", "coordenador"], "/admin/festa-junina/configuracoes");
  const event = await getEvent();
  const params = await searchParams;
  const successMessage = params?.saved ? "Configurações salvas com sucesso." : undefined;

  return (
    <AdminPageShell>
      
      <section className="mx-auto max-w-5xl px-5 py-10">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-black text-green-950">Configurações do evento</h1>
            <p className="mt-2 text-stone-600">Edite dados gerais, Pix e regras públicas da página de venda.</p>
          </div>
          <Link href="/admin/festa-junina" className="rounded-2xl bg-white px-5 py-3 text-sm font-bold text-green-950 shadow-sm" prefetch={false}>
            Voltar ao admin
          </Link>
        </div>

        <FormStatusMessage message={successMessage} />

        <form action={updateEventSettings} className="grid gap-5 rounded-[2rem] bg-white p-6 shadow-sm">
          <input type="hidden" name="event_id" value={event.id} />

          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm font-bold text-green-950 md:col-span-2">
              Nome do evento
              <input name="name" defaultValue={event.name} required className="rounded-2xl border border-stone-200 p-3 font-normal" />
            </label>

            <label className="grid gap-2 text-sm font-bold text-green-950">
              Ano
              <input name="year" type="number" defaultValue={event.year ?? 2026} className="rounded-2xl border border-stone-200 p-3 font-normal" />
            </label>

            <label className="flex items-center gap-3 rounded-2xl bg-amber-50 p-4 text-sm font-bold text-green-950">
              <input name="active_for_sales" type="checkbox" defaultChecked={event.active_for_sales !== false} className="h-5 w-5" />
              Evento ativo para venda
            </label>

            <label className="grid gap-2 text-sm font-bold text-green-950 md:col-span-2">
              Subtítulo
              <input name="subtitle" defaultValue={event.subtitle ?? ""} className="rounded-2xl border border-stone-200 p-3 font-normal" />
            </label>

            <label className="grid gap-2 text-sm font-bold text-green-950 md:col-span-2">
              Descrição
              <textarea name="description" defaultValue={event.description ?? ""} className="min-h-28 rounded-2xl border border-stone-200 p-3 font-normal" />
            </label>

            <label className="grid gap-2 text-sm font-bold text-green-950">
              Data
              <input name="event_date" type="date" defaultValue={event.event_date ?? ""} className="rounded-2xl border border-stone-200 p-3 font-normal" />
            </label>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm font-bold text-green-950">
                Início
                <input name="start_time" type="time" defaultValue={event.start_time?.slice(0, 5) ?? ""} className="rounded-2xl border border-stone-200 p-3 font-normal" />
              </label>
              <label className="grid gap-2 text-sm font-bold text-green-950">
                Fim
                <input name="end_time" type="time" defaultValue={event.end_time?.slice(0, 5) ?? ""} className="rounded-2xl border border-stone-200 p-3 font-normal" />
              </label>
            </div>

            <label className="grid gap-2 text-sm font-bold text-green-950">
              Local
              <input name="location_name" defaultValue={event.location_name ?? ""} className="rounded-2xl border border-stone-200 p-3 font-normal" />
            </label>

            <label className="grid gap-2 text-sm font-bold text-green-950">
              Endereço
              <input name="location_address" defaultValue={event.location_address ?? ""} className="rounded-2xl border border-stone-200 p-3 font-normal" />
            </label>

            <label className="grid gap-2 text-sm font-bold text-green-950">
              Chave Pix
              <input name="pix_key" defaultValue={event.pix_key ?? ""} className="rounded-2xl border border-stone-200 p-3 font-normal" />
            </label>

            <label className="grid gap-2 text-sm font-bold text-green-950">
              Nome do recebedor Pix
              <input name="pix_receiver_name" defaultValue={event.pix_receiver_name ?? ""} className="rounded-2xl border border-stone-200 p-3 font-normal" />
            </label>

            <label className="grid gap-2 text-sm font-bold text-green-950">
              Brinde/sorteio
              <input name="featured_prize_name" defaultValue={event.featured_prize_name ?? "Linda Air Fryer"} className="rounded-2xl border border-stone-200 p-3 font-normal" />
            </label>

            <label className="grid gap-2 text-sm font-bold text-green-950 md:col-span-2">
              Descrição do brinde/sorteio
              <input name="featured_prize_description" defaultValue={event.featured_prize_description ?? "Cada ingresso concorre a uma linda Air Fryer através de um bingo realizado na festa."} className="rounded-2xl border border-stone-200 p-3 font-normal" />
            </label>

            <label className="grid gap-2 text-sm font-bold text-green-950">
              Status
              <select name="status" defaultValue={event.status} className="rounded-2xl border border-stone-200 p-3 font-normal">
                <option value="draft">Rascunho</option>
                <option value="published">Publicado</option>
                <option value="closed">Encerrado</option>
              </select>
            </label>

            <label className="grid gap-2 text-sm font-bold text-green-950">
              Crianças grátis até idade
              <input name="children_free_age_limit" type="number" min={0} defaultValue={event.children_free_age_limit} className="rounded-2xl border border-stone-200 p-3 font-normal" />
            </label>
          </div>

          <div className="grid gap-3 rounded-3xl bg-amber-50 p-4 md:grid-cols-3">
            <label className="flex items-center gap-3 text-sm font-bold text-green-950">
              <input name="allow_public_sales" type="checkbox" defaultChecked={event.allow_public_sales} className="h-5 w-5" />
              Permitir vendas públicas
            </label>
            <label className="flex items-center gap-3 text-sm font-bold text-green-950">
              <input name="allow_combos" type="checkbox" defaultChecked={event.allow_combos} className="h-5 w-5" />
              Permitir combos
            </label>
            <label className="flex items-center gap-3 text-sm font-bold text-green-950">
              <input name="allow_children_free" type="checkbox" defaultChecked={event.allow_children_free} className="h-5 w-5" />
              Crianças grátis
            </label>
          </div>

          <button className="rounded-2xl bg-green-900 px-6 py-4 font-black text-white shadow-sm transition hover:bg-green-800">
            Salvar configurações
          </button>
        </form>
      </section>
    </AdminPageShell>
  );
}
