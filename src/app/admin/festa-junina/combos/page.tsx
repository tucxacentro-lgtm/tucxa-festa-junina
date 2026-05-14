import Link from "next/link";
import { AdminPageShell } from "@/components/admin-page-shell";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabaseServer";
import type { Combo, EventConfig } from "@/types/festa-junina";
import { saveCombo } from "./actions";

export const dynamic = "force-dynamic";

type PageProps = { searchParams?: Promise<Record<string, string | string[] | undefined>> };

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function moneyLabel(value: number | string | null | undefined) {
  const numberValue = typeof value === "number" ? value : Number(value ?? 0);
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number.isFinite(numberValue) ? numberValue : 0);
}

function StatusBadge({ active }: { active?: boolean }) {
  return <span className={`rounded-full px-3 py-1 text-xs font-black ${active ? "bg-green-100 text-green-900" : "bg-stone-100 text-stone-600"}`}>{active ? "Publicado" : "Inativo"}</span>;
}

async function getData() {
  const supabase = createSupabaseAdminClient();
  const { data: event, error: eventError } = await supabase.from("events").select("*").eq("slug", "arraia-tucxa-2026").single();
  if (eventError || !event) throw new Error(eventError?.message ?? "Evento não encontrado.");

  const { data: combos, error } = await supabase.from("offer_combos").select("*").eq("event_id", event.id).order("sort_order");
  if (error) throw new Error(error.message);
  return { event: event as EventConfig, combos: (combos ?? []) as Combo[] };
}

function FormStatusMessage({ message }: { message?: string }) {
  if (!message) return null;
  return <div className="rounded-2xl border border-green-200 bg-green-50 p-4 text-sm font-bold text-green-900">{message}</div>;
}

function ComboCard({ combo }: { combo: Combo }) {
  return (
    <article className="rounded-[1.75rem] border border-green-100 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-green-950">{combo.name}</h2>
          {combo.subtitle ? <p className="mt-1 text-sm font-bold text-stone-600">{combo.subtitle}</p> : null}
          <p className="mt-2 text-2xl font-black text-green-900">{moneyLabel(combo.price)}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <StatusBadge active={combo.active} />
          {combo.highlighted ? <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-black text-yellow-900">Destaque</span> : null}
          {combo.includes_bingo ? <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-black text-amber-800">Inclui bingo</span> : null}
        </div>
      </div>
      {combo.description ? <p className="mt-4 text-sm text-stone-700">{combo.description}</p> : null}
      <dl className="mt-5 grid gap-2 text-sm text-stone-700 md:grid-cols-2">
        <div><dt className="font-black text-green-950">Ordem</dt><dd>{combo.sort_order ?? 0}</dd></div>
        <div><dt className="font-black text-green-950">Cartelas de bingo</dt><dd>{combo.bingo_cards_quantity ?? 0}</dd></div>
        {combo.compare_at_price ? <div><dt className="font-black text-green-950">Valor comparativo</dt><dd>{moneyLabel(combo.compare_at_price)}</dd></div> : null}
        {combo.badge ? <div><dt className="font-black text-green-950">Selo</dt><dd>{combo.badge}</dd></div> : null}
      </dl>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link href={`/admin/festa-junina/combos?edit=${combo.id}`} className="rounded-full bg-green-900 px-5 py-3 text-sm font-black text-white" prefetch={false}>Editar</Link>
        <Link href="/admin/festa-junina/combos?new=1" className="rounded-full border border-green-100 bg-white px-5 py-3 text-sm font-black text-green-950" prefetch={false}>Criar novo</Link>
      </div>
    </article>
  );
}

function ComboForm({ eventId, combo }: { eventId: string; combo?: Combo }) {
  return (
    <form action={saveCombo} className="rounded-[1.75rem] border border-green-100 bg-white p-6 shadow-sm">
      <input type="hidden" name="event_id" value={eventId} />
      <input type="hidden" name="id" value={combo?.id ?? ""} />
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-black text-green-900">{combo ? "Editar combo" : "Novo combo"}</span>
          <h2 className="mt-3 text-2xl font-black text-green-950">{combo ? combo.name : "Cadastrar combo"}</h2>
        </div>
        <Link href="/admin/festa-junina/combos" className="rounded-full bg-white px-4 py-2 text-sm font-black text-green-950 shadow-sm" prefetch={false}>Cancelar</Link>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <label className="grid gap-1 text-sm font-bold text-green-950">Nome<input name="name" required defaultValue={combo?.name ?? ""} className="rounded-2xl border border-stone-200 p-3 font-normal" /></label>
        <label className="grid gap-1 text-sm font-bold text-green-950">Subtítulo<input name="subtitle" defaultValue={combo?.subtitle ?? ""} className="rounded-2xl border border-stone-200 p-3 font-normal" /></label>
      </div>
      <label className="mt-3 grid gap-1 text-sm font-bold text-green-950">Descrição<textarea name="description" defaultValue={combo?.description ?? ""} className="min-h-20 rounded-2xl border border-stone-200 p-3 font-normal" /></label>
      <div className="mt-3 grid gap-3 md:grid-cols-4">
        <label className="grid gap-1 text-sm font-bold text-green-950">Valor<input name="price" type="text" inputMode="decimal" required defaultValue={combo?.price ?? "0"} className="rounded-2xl border border-stone-200 p-3 font-normal" /></label>
        <label className="grid gap-1 text-sm font-bold text-green-950">Valor comparativo<input name="compare_at_price" type="text" inputMode="decimal" defaultValue={combo?.compare_at_price ?? ""} className="rounded-2xl border border-stone-200 p-3 font-normal" /></label>
        <label className="grid gap-1 text-sm font-bold text-green-950">Selo<input name="badge" defaultValue={combo?.badge ?? ""} className="rounded-2xl border border-stone-200 p-3 font-normal" /></label>
        <label className="grid gap-1 text-sm font-bold text-green-950">Ordem<input name="sort_order" type="number" defaultValue={combo?.sort_order ?? 0} className="rounded-2xl border border-stone-200 p-3 font-normal" /></label>
      </div>
      <div className="mt-3 grid gap-3 md:grid-cols-[1fr_180px]">
        <div className="flex flex-wrap items-center gap-4 rounded-2xl bg-amber-50 p-3 text-sm font-bold text-green-950">
          <label className="flex items-center gap-2"><input name="active" type="checkbox" defaultChecked={combo?.active ?? true} /> Publicado</label>
          <label className="flex items-center gap-2"><input name="highlighted" type="checkbox" defaultChecked={combo?.highlighted ?? false} /> Destacar</label>
          <label className="flex items-center gap-2"><input name="includes_bingo" type="checkbox" defaultChecked={Boolean(combo?.includes_bingo)} /> Inclui bingo</label>
        </div>
        <label className="grid gap-1 text-sm font-bold text-green-950">Cartelas de bingo<input name="bingo_cards_quantity" type="number" min={0} defaultValue={combo?.bingo_cards_quantity ?? 0} className="rounded-2xl border border-stone-200 p-3 font-normal" /></label>
      </div>
      <button className="mt-5 w-full rounded-2xl bg-green-900 px-5 py-3 font-black text-white">{combo ? "Salvar alterações" : "Criar combo"}</button>
    </form>
  );
}

export default async function CombosPage({ searchParams }: PageProps) {
  await requireAdmin(["admin", "coordenador"], "/admin/festa-junina/combos");
  const { event, combos } = await getData();
  const params = await searchParams;
  const editId = firstParam(params?.edit);
  const showNew = firstParam(params?.new) === "1";
  const editingCombo = editId ? combos.find((combo) => combo.id === editId) : undefined;
  const successMessage = params?.saved ? "Combo salvo com sucesso." : undefined;

  return (
    <AdminPageShell>
      <section className="mx-auto max-w-6xl px-5 py-10">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-black text-green-900">Vendas · Combos</span>
            <h1 className="mt-3 text-3xl font-black text-green-950">Combos</h1>
            <p className="mt-2 max-w-3xl text-stone-600">Neste evento, a organização optou inicialmente por vender apenas os ingressos individuais. A estrutura de combos permanece pronta para anos futuros ou decisões posteriores.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/admin/festa-junina/combos?new=1" className="rounded-full bg-green-900 px-5 py-3 text-sm font-black text-white" prefetch={false}>Novo combo</Link>
            <Link href="/admin/festa-junina" className="rounded-full bg-white px-5 py-3 text-sm font-bold text-green-950 shadow-sm" prefetch={false}>Voltar à gestão</Link>
          </div>
        </div>
        <FormStatusMessage message={successMessage} />
        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-950">
          <strong>Uso opcional:</strong> combos podem juntar convite, comida, bebida ou cartelas de bingo. Ative somente se a coordenação decidir ofertar pacotes antecipados.
        </div>
        {editingCombo || showNew ? <div className="mt-6"><ComboForm eventId={event.id} combo={editingCombo} /></div> : null}
        {combos.length === 0 ? <div className="mt-6 rounded-3xl border border-dashed border-green-200 bg-white p-6 text-sm text-stone-700">Nenhum combo cadastrado para este evento.</div> : null}
        <div className="mt-6 grid gap-5 lg:grid-cols-2">{combos.map((combo) => <ComboCard key={combo.id} combo={combo} />)}</div>
      </section>
    </AdminPageShell>
  );
}
