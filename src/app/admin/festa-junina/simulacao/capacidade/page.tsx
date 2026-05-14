import { AdminPageShell } from "@/components/admin-page-shell";
import { requireAdmin } from "@/lib/auth";
import { getCurrentEventForAdmin } from "@/lib/current-event";
import { createSupabaseAdminClient } from "@/lib/supabaseServer";
import { buildEventScenarios } from "@/lib/event-scenarios";
import { suggestVolunteers } from "@/lib/volunteer-simulation";

export const dynamic = "force-dynamic";

type Estimate = {
  id: string;
  item_name: string;
  category: string;
  consumption_per_adult: number | string;
  consumption_per_child: number | string;
  unit_label: string;
  active: boolean;
};

type Ingredient = {
  id: string;
  estimate_id: string;
  ingredient_name: string;
  ingredient_category: string;
  amount_per_unit: number | string;
  unit_label: string;
  active: boolean;
};

type ManualSales = {
  presale_paid_quantity: number | string | null;
  door_paid_quantity: number | string | null;
  children_free_quantity: number | string | null;
};

function n(value: number | string | null | undefined, fallback = 0) {
  const parsed = Number(value ?? fallback);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function roundUp(value: number) {
  return Math.ceil(value);
}

async function getData() {
  const event = await getCurrentEventForAdmin();
  const supabase = createSupabaseAdminClient();
  const [{ data: orders }, { data: manualSales }, { data: estimates }, { data: ingredients }] = await Promise.all([
    supabase.from("ticket_orders").select("adults_quantity, children_quantity, payment_status").eq("event_id", event.id),
    supabase.from("event_manual_sales").select("presale_paid_quantity, door_paid_quantity, children_free_quantity").eq("event_id", event.id).maybeSingle(),
    supabase.from("planning_menu_estimates").select("id, item_name, category, consumption_per_adult, consumption_per_child, unit_label, active").eq("event_id", event.id).eq("active", true).order("sort_order"),
    supabase.from("planning_recipe_ingredients").select("id, estimate_id, ingredient_name, ingredient_category, amount_per_unit, unit_label, active").eq("event_id", event.id).eq("active", true).order("sort_order"),
  ]);

  const totals = ((orders ?? []) as Array<{ adults_quantity: number; children_quantity: number; payment_status: string }>).reduce(
    (acc, order) => {
      const people = Number(order.adults_quantity ?? 0) + Number(order.children_quantity ?? 0);
      if (order.payment_status === "paid") acc.confirmed += people;
      if (["pending", "proof_sent"].includes(order.payment_status)) acc.pending += people;
      return acc;
    },
    { confirmed: 0, pending: 0 },
  );

  const manual = manualSales as ManualSales | null;
  const manualPeople = n(manual?.presale_paid_quantity) + n(manual?.door_paid_quantity) + n(manual?.children_free_quantity);
  return { event, totals, manualPeople, estimates: (estimates ?? []) as Estimate[], ingredients: (ingredients ?? []) as Ingredient[] };
}

function estimateQuantity(estimate: Estimate, people: number, margin: number) {
  const adultBase = n(estimate.consumption_per_adult);
  const childBase = n(estimate.consumption_per_child);
  const average = childBase > 0 ? (adultBase * 0.75 + childBase * 0.25) : adultBase;
  return roundUp(people * average * (1 + margin / 100));
}

export default async function SimulacaoCapacidadePage() {
  await requireAdmin(["admin", "coordenador"], "/admin/festa-junina/simulacao/capacidade");
  const { event, totals, manualPeople, estimates, ingredients } = await getData();
  const hallCapacity = n(event.covered_hall_capacity, 80);
  const operationalCapacity = n(event.operational_capacity, hallCapacity);
  const safetyMargin = n(event.safety_margin_percent, 15);
  const tableCount = n(event.estimated_tables, Math.ceil(operationalCapacity / 4));
  const chairCount = n(event.estimated_chairs, operationalCapacity);
  const scenarios = buildEventScenarios({ confirmedPeople: totals.confirmed, pendingPeople: totals.pending, manualPeople, event });

  const ingredientsByEstimate = new Map<string, Ingredient[]>();
  for (const ingredient of ingredients) {
    const list = ingredientsByEstimate.get(ingredient.estimate_id) ?? [];
    list.push(ingredient);
    ingredientsByEstimate.set(ingredient.estimate_id, list);
  }

  return (
    <AdminPageShell>
      <section className="mx-auto max-w-7xl px-5 py-10">
        <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-black text-green-900">Simulações</span>
        <h1 className="mt-4 text-3xl font-black text-green-950">Simulação de compras, funções e voluntários</h1>
        <p className="mt-3 max-w-4xl text-stone-700">
          Cenários para planejamento do evento. Assim que o cardápio e as fichas técnicas forem validados, as sugestões de compra e equipe ficam mais próximas da operação real.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-4">
          <div className="rounded-3xl border border-green-100 bg-white p-5 shadow-sm"><p className="text-sm text-stone-600">Capacidade salão</p><strong className="text-3xl text-green-950">{hallCapacity}</strong></div>
          <div className="rounded-3xl border border-green-100 bg-white p-5 shadow-sm"><p className="text-sm text-stone-600">Capacidade operacional</p><strong className="text-3xl text-green-950">{operationalCapacity}</strong></div>
          <div className="rounded-3xl border border-green-100 bg-white p-5 shadow-sm"><p className="text-sm text-stone-600">Margem segurança</p><strong className="text-3xl text-green-950">{safetyMargin}%</strong></div>
          <div className="rounded-3xl border border-green-100 bg-white p-5 shadow-sm"><p className="text-sm text-stone-600">Mesas/cadeiras</p><strong className="text-3xl text-green-950">{tableCount}/{chairCount}</strong></div>
        </div>

        <div className="mt-8 grid gap-6">
          {scenarios.map((scenario) => {
            const volunteers = suggestVolunteers(scenario.people);
            return (
              <div key={scenario.key} className="rounded-[2rem] border border-green-100 bg-white p-6 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-2xl font-black text-green-950">{scenario.label}: {scenario.people} pessoas</h2>
                    <p className="mt-1 text-sm text-stone-600">{scenario.description}</p>
                  </div>
                  <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-black text-amber-900">validar com coordenação</span>
                </div>

                <div className="mt-6 grid gap-6 xl:grid-cols-2">
                  <div>
                    <h3 className="font-black text-green-950">Sugestão de itens do cardápio</h3>
                    <div className="mt-3 overflow-x-auto rounded-2xl border border-stone-100">
                      <table className="w-full min-w-[640px] text-left text-sm">
                        <thead className="bg-green-950 text-white"><tr><th className="p-3">Item</th><th className="p-3">Categoria</th><th className="p-3">Qtd.</th><th className="p-3">Un.</th></tr></thead>
                        <tbody>
                          {estimates.map((estimate) => {
                            const quantity = estimateQuantity(estimate, scenario.people, safetyMargin);
                            return <tr key={estimate.id} className="border-b border-stone-100 last:border-0"><td className="p-3 font-bold text-green-950">{estimate.item_name}</td><td className="p-3">{estimate.category}</td><td className="p-3 font-black">{quantity}</td><td className="p-3">{estimate.unit_label}</td></tr>;
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-black text-green-950">Voluntários sugeridos</h3>
                    <div className="mt-3 grid gap-2">
                      {volunteers.map((volunteer) => <div key={volunteer.role} className="rounded-2xl bg-stone-50 p-3 text-sm"><strong>{volunteer.role}:</strong> {volunteer.quantity} pessoa(s)<p className="text-xs text-stone-500">{volunteer.notes}</p></div>)}
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="font-black text-green-950">Insumos estimados</h3>
                  <div className="mt-3 overflow-x-auto rounded-2xl border border-stone-100">
                    <table className="w-full min-w-[760px] text-left text-sm">
                      <thead className="bg-green-950 text-white"><tr><th className="p-3">Insumo</th><th className="p-3">Item</th><th className="p-3">Qtd. estimada</th><th className="p-3">Un.</th></tr></thead>
                      <tbody>
                        {estimates.flatMap((estimate) => {
                          const itemQuantity = estimateQuantity(estimate, scenario.people, safetyMargin);
                          return (ingredientsByEstimate.get(estimate.id) ?? []).map((ingredient) => <tr key={`${scenario.key}-${ingredient.id}`} className="border-b border-stone-100 last:border-0"><td className="p-3 font-bold text-green-950">{ingredient.ingredient_name}</td><td className="p-3">{estimate.item_name}</td><td className="p-3 font-black">{Math.ceil(itemQuantity * n(ingredient.amount_per_unit))}</td><td className="p-3">{ingredient.unit_label}</td></tr>);
                        })}
                        {ingredients.length === 0 ? <tr><td colSpan={4} className="p-6 text-center text-stone-500">Cadastre fichas técnicas para estimar insumos.</td></tr> : null}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </AdminPageShell>
  );
}
