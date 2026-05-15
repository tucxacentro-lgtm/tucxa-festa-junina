import { AdminPageShell } from "@/components/admin-page-shell";
import { ScenarioResultModal } from "@/components/scenario-result-modal";
import { requireAdmin } from "@/lib/auth";
import { getCurrentEventForAdmin } from "@/lib/current-event";
import { createSupabaseAdminClient } from "@/lib/supabaseServer";
import { suggestVolunteers } from "@/lib/volunteer-simulation";
import { getSuggestedUnitCost } from "@/lib/average-prices";
import { buildSupplierSuggestions } from "@/lib/supplier-suggestions";

export const dynamic = "force-dynamic";

type PageProps = { searchParams?: Promise<Record<string, string | string[] | undefined>> };

type Estimate = {
  id: string;
  item_name: string;
  category: string;
  consumption_per_adult: number | string;
  consumption_per_child: number | string;
  unit_label: string;
  sales_price?: number | string | null;
  active: boolean;
};

type SalesItem = { preparation_estimate_id: string | null; name: string; price: number | string; active: boolean };

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

type TicketType = { value: number | string; sale_mode: string | null; active: boolean; free: boolean | null };

function n(value: number | string | null | undefined, fallback = 0) {
  const parsed = Number(value ?? fallback);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function firstParam(params: Record<string, string | string[] | undefined> | undefined, key: string) {
  const value = params?.[key];
  return Array.isArray(value) ? value[0] : value;
}

function estimateQuantity(estimate: Estimate, adults: number, children: number, margin: number) {
  const adultBase = n(estimate.consumption_per_adult);
  const childBase = n(estimate.consumption_per_child);
  return Math.ceil((adults * adultBase + children * childBase) * (1 + margin / 100));
}

async function getData() {
  const event = await getCurrentEventForAdmin();
  const supabase = createSupabaseAdminClient();
  const [{ data: orders }, { data: manualSales }, { data: estimates }, { data: ingredients }, { data: ticketTypes }, { data: salesItems }] = await Promise.all([
    supabase.from("ticket_orders").select("adults_quantity, children_quantity, payment_status").eq("event_id", event.id),
    supabase.from("event_manual_sales").select("presale_paid_quantity, door_paid_quantity, children_free_quantity").eq("event_id", event.id).maybeSingle(),
    supabase.from("planning_menu_estimates").select("id, item_name, category, consumption_per_adult, consumption_per_child, unit_label, sales_price, active").eq("event_id", event.id).eq("active", true).order("sort_order"),
    supabase.from("planning_recipe_ingredients").select("id, estimate_id, ingredient_name, ingredient_category, amount_per_unit, unit_label, active").eq("event_id", event.id).eq("active", true).order("sort_order"),
    supabase.from("ticket_types").select("value, sale_mode, active, free").eq("event_id", event.id).eq("active", true),
    supabase.from("event_sales_menu_items").select("preparation_estimate_id, name, price, active").eq("event_id", event.id).eq("active", true),
  ]);

  const totals = ((orders ?? []) as Array<{ adults_quantity: number; children_quantity: number; payment_status: string }>).reduce(
    (acc, order) => {
      if (order.payment_status === "paid") {
        acc.confirmedAdults += Number(order.adults_quantity ?? 0);
        acc.confirmedChildren += Number(order.children_quantity ?? 0);
      }
      if (["pending", "proof_sent"].includes(order.payment_status)) {
        acc.pendingAdults += Number(order.adults_quantity ?? 0);
        acc.pendingChildren += Number(order.children_quantity ?? 0);
      }
      return acc;
    },
    { confirmedAdults: 0, confirmedChildren: 0, pendingAdults: 0, pendingChildren: 0 },
  );

  return {
    event,
    totals,
    manualSales: manualSales as ManualSales | null,
    estimates: (estimates ?? []) as Estimate[],
    ingredients: (ingredients ?? []) as Ingredient[],
    ticketTypes: (ticketTypes ?? []) as TicketType[],
    salesItems: (salesItems ?? []) as SalesItem[],
  };
}

function ticketAverage(ticketTypes: TicketType[]) {
  const paid = ticketTypes.filter((ticket) => ticket.active && !ticket.free).map((ticket) => n(ticket.value));
  if (paid.length === 0) return 20;
  return paid.reduce((sum, value) => sum + value, 0) / paid.length;
}

export default async function SimulacaoCapacidadePage({ searchParams }: PageProps) {
  await requireAdmin(["admin", "coordenador"], "/admin/festa-junina/simulacao/capacidade");
  const query = await searchParams;
  const { event, totals, manualSales, estimates, ingredients, ticketTypes, salesItems } = await getData();
  const hallCapacity = n(event.covered_hall_capacity, 80);
  const operationalCapacity = n(event.operational_capacity, hallCapacity);
  const safetyMargin = n(event.safety_margin_percent, 15);
  const tableCount = n(event.estimated_tables, Math.ceil(operationalCapacity / 4));
  const chairCount = n(event.estimated_chairs, operationalCapacity);

  const conservativeAdults = n(firstParam(query, "conservativeAdults"), totals.confirmedAdults);
  const conservativeChildren = n(firstParam(query, "conservativeChildren"), totals.confirmedChildren);
  const probableAdults = n(firstParam(query, "probableAdults"), totals.confirmedAdults + totals.pendingAdults + n(manualSales?.presale_paid_quantity) + n(manualSales?.door_paid_quantity));
  const probableChildren = n(firstParam(query, "probableChildren"), totals.confirmedChildren + totals.pendingChildren + n(manualSales?.children_free_quantity));
  const maximumAdults = n(firstParam(query, "maximumAdults"), Math.max(0, Math.round(operationalCapacity * 0.75)));
  const maximumChildren = n(firstParam(query, "maximumChildren"), Math.max(0, operationalCapacity - Math.round(operationalCapacity * 0.75)));
  const avgTicket = ticketAverage(ticketTypes);
  const salesPriceByEstimate = new Map<string, number>();
  for (const salesItem of salesItems) {
    if (salesItem.preparation_estimate_id) salesPriceByEstimate.set(salesItem.preparation_estimate_id, n(salesItem.price));
  }

  const ingredientsByEstimate = new Map<string, Ingredient[]>();
  for (const ingredient of ingredients) {
    const list = ingredientsByEstimate.get(ingredient.estimate_id) ?? [];
    list.push(ingredient);
    ingredientsByEstimate.set(ingredient.estimate_id, list);
  }

  const scenarioInputs = [
    { key: "conservative", label: "Conservador", adults: conservativeAdults, children: conservativeChildren, description: "Somente convites confirmados/pagos no sistema ou quantidade manual informada." },
    { key: "probable", label: "Provável", adults: probableAdults, children: probableChildren, description: "Confirmados + pendentes + estimativa manual da coordenação." },
    { key: "maximum", label: "Máximo", adults: maximumAdults, children: maximumChildren, description: "Capacidade operacional planejada para o evento." },
  ];

  const scenarioReports = scenarioInputs.map((scenario) => {
    const people = Math.ceil(scenario.adults + scenario.children);
    const itemLines = estimates.map((estimate) => {
      const quantity = estimateQuantity(estimate, scenario.adults, scenario.children, safetyMargin);
      const price = salesPriceByEstimate.get(estimate.id) ?? n(estimate.sales_price);
      const cost = getSuggestedUnitCost(estimate.item_name, price * 0.45) * quantity;
      return {
        name: estimate.item_name,
        category: estimate.category,
        quantity,
        unit: estimate.unit_label,
        revenue: quantity * price,
        cost,
      };
    });
    const ingredientLines = estimates.flatMap((estimate) => {
      const itemQuantity = estimateQuantity(estimate, scenario.adults, scenario.children, safetyMargin);
      return (ingredientsByEstimate.get(estimate.id) ?? []).map((ingredient) => ({
        name: ingredient.ingredient_name,
        itemName: estimate.item_name,
        quantity: Math.ceil(itemQuantity * n(ingredient.amount_per_unit)),
        unit: ingredient.unit_label,
      }));
    });
    const consumptionRevenue = itemLines.reduce((sum, line) => sum + line.revenue, 0);
    const estimatedCosts = itemLines.reduce((sum, line) => sum + line.cost, 0);
    const ticketRevenue = scenario.adults * avgTicket;
    return {
      ...scenario,
      eventName: event.name,
      eventDate: event.event_date,
      eventLocation: event.location_name,
      hallCapacity,
      operationalCapacity,
      safetyMargin,
      tableCount,
      chairCount,
      people,
      ticketRevenue,
      consumptionRevenue,
      estimatedCosts,
      estimatedBalance: ticketRevenue + consumptionRevenue - estimatedCosts,
      items: itemLines,
      ingredients: ingredientLines,
      suppliers: buildSupplierSuggestions(itemLines.map((line) => ({ name: line.name, category: line.category, quantity: line.quantity, unit: line.unit })), ingredientLines),
      volunteers: suggestVolunteers(people),
    };
  });

  return (
    <AdminPageShell>
      <section className="mx-auto max-w-7xl px-5 py-10">
        <div className="print:hidden">
        <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-black text-green-900">Simulações</span>
        <h1 className="mt-4 text-3xl font-black text-green-950">Simulação de compras, funções e voluntários</h1>
        <p className="mt-3 max-w-4xl text-stone-700">
          Informe adultos e crianças por cenário. O resultado combina capacidade do local, cardápio, fichas técnicas, voluntários e estimativa financeira.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-4">
          <div className="rounded-3xl border border-green-100 bg-white p-5 shadow-sm"><p className="text-sm text-stone-600">Capacidade salão</p><strong className="text-3xl text-green-950">{hallCapacity}</strong></div>
          <div className="rounded-3xl border border-green-100 bg-white p-5 shadow-sm"><p className="text-sm text-stone-600">Capacidade operacional</p><strong className="text-3xl text-green-950">{operationalCapacity}</strong></div>
          <div className="rounded-3xl border border-green-100 bg-white p-5 shadow-sm"><p className="text-sm text-stone-600">Margem segurança</p><strong className="text-3xl text-green-950">{safetyMargin}%</strong></div>
          <div className="rounded-3xl border border-green-100 bg-white p-5 shadow-sm"><p className="text-sm text-stone-600">Mesas/cadeiras</p><strong className="text-3xl text-green-950">{tableCount}/{chairCount}</strong></div>
        </div>

        <form className="mt-8 rounded-[2rem] border border-green-100 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-black text-green-950">Público por cenário</h2>
          <p className="mt-1 text-sm text-stone-600">Altere as quantidades e clique em atualizar para recalcular a simulação.</p>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {scenarioInputs.map((scenario) => (
              <div key={scenario.key} className="rounded-3xl bg-stone-50 p-4">
                <h3 className="font-black text-green-950">{scenario.label}</h3>
                <div className="mt-3 grid gap-3 sm:grid-cols-2 md:grid-cols-1 xl:grid-cols-2">
                  <label className="grid gap-1 text-sm font-bold">Adultos<input name={`${scenario.key}Adults`} defaultValue={scenario.adults} className="rounded-2xl border border-stone-200 p-3 font-normal" /></label>
                  <label className="grid gap-1 text-sm font-bold">Crianças<input name={`${scenario.key}Children`} defaultValue={scenario.children} className="rounded-2xl border border-stone-200 p-3 font-normal" /></label>
                </div>
              </div>
            ))}
          </div>
          <button className="mt-5 rounded-2xl bg-green-900 px-5 py-3 font-black text-white">Atualizar simulação</button>
        </form>

        </div>

        <ScenarioResultModal scenarios={scenarioReports} />
      </section>
    </AdminPageShell>
  );
}
