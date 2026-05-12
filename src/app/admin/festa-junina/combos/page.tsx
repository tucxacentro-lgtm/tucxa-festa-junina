import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabaseServer";
import type { Combo, EventConfig } from "@/types/festa-junina";
import { saveCombo } from "./actions";
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

  const { data: combos, error } = await supabase
    .from("offer_combos")
    .select("*")
    .eq("event_id", event.id)
    .order("sort_order");

  if (error) throw new Error(error.message);
  return { event: event as EventConfig, combos: (combos ?? []) as Combo[] };
}

function ComboForm({ eventId, combo }: { eventId: string; combo?: Combo }) {
  return (
    <form action={saveCombo} className="grid gap-3 rounded-3xl bg-white p-5 shadow-sm">
      <input type="hidden" name="event_id" value={eventId} />
      <input type="hidden" name="id" value={combo?.id ?? ""} />

      <div className="grid gap-3 md:grid-cols-2">
        <label className="grid gap-1 text-sm font-bold text-green-950">
          Nome
          <input name="name" required defaultValue={combo?.name ?? ""} className="rounded-2xl border border-stone-200 p-3 font-normal" />
        </label>
        <label className="grid gap-1 text-sm font-bold text-green-950">
          Subtítulo
          <input name="subtitle" defaultValue={combo?.subtitle ?? ""} className="rounded-2xl border border-stone-200 p-3 font-normal" />
        </label>
      </div>

      <label className="grid gap-1 text-sm font-bold text-green-950">
        Descrição
        <textarea name="description" defaultValue={combo?.description ?? ""} className="min-h-20 rounded-2xl border border-stone-200 p-3 font-normal" />
      </label>

      <div className="grid gap-3 md:grid-cols-4">
        <label className="grid gap-1 text-sm font-bold text-green-950">
          Valor
          <input name="price" type="text" inputMode="decimal" required defaultValue={combo?.price ?? "0"} className="rounded-2xl border border-stone-200 p-3 font-normal" />
        </label>
        <label className="grid gap-1 text-sm font-bold text-green-950">
          Valor comparativo
          <input name="compare_at_price" type="text" inputMode="decimal" defaultValue={combo?.compare_at_price ?? ""} className="rounded-2xl border border-stone-200 p-3 font-normal" />
        </label>
        <label className="grid gap-1 text-sm font-bold text-green-950">
          Selo
          <input name="badge" defaultValue={combo?.badge ?? ""} className="rounded-2xl border border-stone-200 p-3 font-normal" />
        </label>
        <label className="grid gap-1 text-sm font-bold text-green-950">
          Ordem
          <input name="sort_order" type="number" defaultValue={combo?.sort_order ?? 0} className="rounded-2xl border border-stone-200 p-3 font-normal" />
        </label>
      </div>

      <div className="grid gap-3 md:grid-cols-[1fr_180px]">
        <div className="flex flex-wrap items-center gap-4 rounded-2xl bg-amber-50 p-3 text-sm font-bold text-green-950">
          <label className="flex items-center gap-2"><input name="active" type="checkbox" defaultChecked={combo?.active ?? true} /> Ativo</label>
          <label className="flex items-center gap-2"><input name="highlighted" type="checkbox" defaultChecked={combo?.highlighted ?? false} /> Destacar</label>
          <label className="flex items-center gap-2"><input name="includes_bingo" type="checkbox" defaultChecked={Boolean(combo?.includes_bingo)} /> Inclui bingo</label>
        </div>
        <label className="grid gap-1 text-sm font-bold text-green-950">
          Cartelas de bingo
          <input name="bingo_cards_quantity" type="number" min={0} defaultValue={combo?.bingo_cards_quantity ?? 0} className="rounded-2xl border border-stone-200 p-3 font-normal" />
        </label>
      </div>

      <button className="rounded-2xl bg-green-900 px-5 py-3 font-black text-white">{combo ? "Salvar combo" : "Criar combo"}</button>
    </form>
  );
}

export default async function CombosPage({ searchParams }: PageProps) {
  await requireAdmin(["admin", "coordenador"], "/admin/festa-junina/combos");
  const { event, combos } = await getData();
  const params = await searchParams;
  const successMessage = params?.saved ? "Combo salvo com sucesso." : undefined;

  return (
    <AdminPageShell>
      
      <section className="mx-auto max-w-6xl px-5 py-10">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-black text-green-950">Combos e ofertas</h1>
            <p className="mt-2 text-stone-600">Configure combos com convites, comida, bebida e cartelas de bingo.</p>
          </div>
          <Link href="/admin/festa-junina" className="rounded-2xl bg-white px-5 py-3 text-sm font-bold text-green-950 shadow-sm" prefetch={false}>Voltar ao admin</Link>
        </div>

        <FormStatusMessage message={successMessage} />

        <div className="grid gap-5">
          {combos.map((combo) => <ComboForm key={combo.id} eventId={event.id} combo={combo} />)}
          <div>
            <h2 className="mb-3 text-xl font-black text-green-950">Novo combo</h2>
            <ComboForm eventId={event.id} />
          </div>
        </div>
      </section>
    </AdminPageShell>
  );
}
