import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabaseServer";
import { savePlanningAssumptions, savePlanningEstimate } from "./actions";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams?: Promise<{ saved?: string }>;
};

type Assumptions = {
  id: string;
  guests_per_table: number | string;
  volunteers_per_50_guests: number | string;
  safety_margin_percent: number | string;
  notes: string | null;
};

type Estimate = {
  id: string;
  item_name: string;
  category: string;
  consumption_per_adult: number | string;
  consumption_per_child: number | string;
  unit_label: string;
  editable_quantity: number | string | null;
  active: boolean;
};

type OrderTotals = {
  paidAdults: number;
  paidChildren: number;
  pendingAdults: number;
  pendingChildren: number;
};

async function getData() {
  const supabase = createSupabaseAdminClient();
  const { data: event } = await supabase.from("events").select("id").eq("slug", "arraia-tucxa-2026").single();
  if (!event) {
    return { assumptions: null as Assumptions | null, estimates: [] as Estimate[], totals: { paidAdults: 0, paidChildren: 0, pendingAdults: 0, pendingChildren: 0 } };
  }

  const [{ data: assumptions }, { data: estimates }, { data: orders }] = await Promise.all([
    supabase.from("planning_assumptions").select("*").eq("event_id", event.id).maybeSingle(),
    supabase.from("planning_menu_estimates").select("*").eq("event_id", event.id).order("sort_order"),
    supabase.from("ticket_orders").select("adults_quantity, children_quantity, payment_status").eq("event_id", event.id),
  ]);

  const totals = ((orders ?? []) as Array<{ adults_quantity: number; children_quantity: number; payment_status: string }>).reduce<OrderTotals>((acc, order) => {
    if (order.payment_status === "paid") {
      acc.paidAdults += Number(order.adults_quantity ?? 0);
      acc.paidChildren += Number(order.children_quantity ?? 0);
    } else if (["pending", "proof_sent"].includes(order.payment_status)) {
      acc.pendingAdults += Number(order.adults_quantity ?? 0);
      acc.pendingChildren += Number(order.children_quantity ?? 0);
    }
    return acc;
  }, { paidAdults: 0, paidChildren: 0, pendingAdults: 0, pendingChildren: 0 });

  return { assumptions: assumptions as Assumptions | null, estimates: (estimates ?? []) as Estimate[], totals };
}

function roundUp(value: number) {
  return Math.ceil(value);
}

function savedMessage(saved?: string) {
  if (saved === "assumptions") return "Premissas de planejamento salvas com sucesso.";
  if (saved === "estimate") return "Item de planejamento salvo com sucesso.";
  return null;
}

export default async function AdminPlanejamentoPage({ searchParams }: PageProps) {
  await requireAdmin(["admin", "coordenador"], "/admin/festa-junina/planejamento");
  const params = await searchParams;
  const message = savedMessage(params?.saved);
  const { assumptions, estimates, totals } = await getData();

  const confirmedPeople = totals.paidAdults + totals.paidChildren;
  const possiblePeople = confirmedPeople + totals.pendingAdults + totals.pendingChildren;
  const guestsPerTable = Number(assumptions?.guests_per_table ?? 4) || 4;
  const volunteersPer50 = Number(assumptions?.volunteers_per_50_guests ?? 3) || 3;
  const margin = Number(assumptions?.safety_margin_percent ?? 15) || 0;
  const suggestedTables = roundUp(possiblePeople / guestsPerTable);
  const suggestedVolunteers = roundUp((possiblePeople / 50) * volunteersPer50);

  return (
    <main className="min-h-screen bg-amber-50 text-stone-900">
      <SiteHeader />
      <section className="mx-auto max-w-6xl px-5 py-12">
        <div className="mb-6 flex flex-wrap justify-between gap-3">
          <Link href="/admin/festa-junina" className="rounded-2xl bg-white px-5 py-3 text-sm font-bold text-green-950 shadow-sm">← Voltar ao admin</Link>
          <a href="/admin/logout" className="rounded-full bg-white px-4 py-2 text-sm font-bold text-green-950 shadow-sm">Sair do admin</a>
        </div>

        <h1 className="text-3xl font-black text-green-950">Planejamento de compras e operação</h1>
        <p className="mt-2 max-w-3xl text-stone-600">Sugestões iniciais com base nas compras confirmadas e pendentes. Tudo deve ser validado e ajustado pela organização.</p>

        {message ? <div className="mt-6 rounded-3xl border border-green-200 bg-green-50 p-5 text-sm font-bold text-green-900">{message}</div> : null}

        <div className="mt-8 grid gap-4 md:grid-cols-4">
          <div className="rounded-3xl bg-white p-5 shadow-sm"><p className="text-sm font-bold text-stone-500">Pessoas confirmadas</p><p className="mt-2 text-3xl font-black text-green-950">{confirmedPeople}</p></div>
          <div className="rounded-3xl bg-white p-5 shadow-sm"><p className="text-sm font-bold text-stone-500">Confirmadas + pendentes</p><p className="mt-2 text-3xl font-black text-green-950">{possiblePeople}</p></div>
          <div className="rounded-3xl bg-white p-5 shadow-sm"><p className="text-sm font-bold text-stone-500">Mesas sugeridas</p><p className="mt-2 text-3xl font-black text-green-950">{suggestedTables}</p></div>
          <div className="rounded-3xl bg-white p-5 shadow-sm"><p className="text-sm font-bold text-stone-500">Voluntários sugeridos</p><p className="mt-2 text-3xl font-black text-green-950">{suggestedVolunteers}</p></div>
        </div>

        {assumptions ? (
          <form action={savePlanningAssumptions} className="mt-8 rounded-3xl bg-white p-6 shadow-sm">
            <input type="hidden" name="id" value={assumptions.id} />
            <h2 className="text-xl font-black text-green-950">Premissas editáveis</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <label className="grid gap-2 text-sm font-bold text-green-950">Pessoas por mesa<input name="guests_per_table" defaultValue={assumptions.guests_per_table} className="rounded-2xl border p-3 font-normal" /></label>
              <label className="grid gap-2 text-sm font-bold text-green-950">Voluntários a cada 50 pessoas<input name="volunteers_per_50_guests" defaultValue={assumptions.volunteers_per_50_guests} className="rounded-2xl border p-3 font-normal" /></label>
              <label className="grid gap-2 text-sm font-bold text-green-950">Margem de segurança %<input name="safety_margin_percent" defaultValue={assumptions.safety_margin_percent} className="rounded-2xl border p-3 font-normal" /></label>
              <label className="grid gap-2 text-sm font-bold text-green-950 md:col-span-3">Observações<textarea name="notes" defaultValue={assumptions.notes ?? ""} className="min-h-20 rounded-2xl border p-3 font-normal" /></label>
            </div>
            <button className="mt-5 rounded-2xl bg-green-900 px-5 py-3 font-black text-white">Salvar premissas</button>
          </form>
        ) : <div className="mt-8 rounded-3xl bg-amber-100 p-5 text-amber-900">Rode a migration 004 para criar as premissas iniciais de planejamento.</div>}

        <div className="mt-8 rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-black text-green-950">Sugestão de compras por item</h2>
          <p className="mt-2 text-sm text-stone-600">A sugestão usa adultos/crianças confirmados + pendentes e aplica a margem de segurança. O campo “Qtd. final” permite ajuste manual.</p>

          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[1000px] text-left text-sm">
              <thead className="bg-green-950 text-white"><tr><th className="p-3">Item</th><th className="p-3">Categoria</th><th className="p-3">Adulto</th><th className="p-3">Criança</th><th className="p-3">Sugestão</th><th className="p-3">Qtd. final</th><th className="p-3">Ações</th></tr></thead>
              <tbody>
                {estimates.map((estimate) => {
                  const suggested = roundUp(((Number(estimate.consumption_per_adult) * (totals.paidAdults + totals.pendingAdults)) + (Number(estimate.consumption_per_child) * (totals.paidChildren + totals.pendingChildren))) * (1 + margin / 100));
                  return (
                    <tr key={estimate.id} className="border-b border-stone-100 align-top last:border-0">
                      <td className="p-3 font-bold text-green-950">{estimate.item_name}</td>
                      <td className="p-3">{estimate.category}</td>
                      <td className="p-3">{estimate.consumption_per_adult} {estimate.unit_label}</td>
                      <td className="p-3">{estimate.consumption_per_child} {estimate.unit_label}</td>
                      <td className="p-3 font-black">{suggested} {estimate.unit_label}</td>
                      <td className="p-3 font-black">{estimate.editable_quantity ?? suggested} {estimate.unit_label}</td>
                      <td className="p-3">
                        <form action={savePlanningEstimate} className="grid gap-2 md:grid-cols-2">
                          <input type="hidden" name="id" value={estimate.id} />
                          <input name="item_name" defaultValue={estimate.item_name} className="rounded-xl border p-2" />
                          <input name="category" defaultValue={estimate.category} className="rounded-xl border p-2" />
                          <input name="consumption_per_adult" defaultValue={estimate.consumption_per_adult} className="rounded-xl border p-2" />
                          <input name="consumption_per_child" defaultValue={estimate.consumption_per_child} className="rounded-xl border p-2" />
                          <input name="unit_label" defaultValue={estimate.unit_label} className="rounded-xl border p-2" />
                          <input name="editable_quantity" defaultValue={estimate.editable_quantity ?? ""} placeholder="Qtd. final" className="rounded-xl border p-2" />
                          <label className="flex items-center gap-2 text-xs font-bold text-green-950"><input type="checkbox" name="active" defaultChecked={estimate.active} /> Ativo</label>
                          <button className="rounded-xl bg-green-900 px-3 py-2 text-xs font-black text-white">Salvar</button>
                        </form>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
}
