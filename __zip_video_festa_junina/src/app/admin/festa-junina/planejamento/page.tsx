import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabaseServer";
import { savePlanningAssumptions } from "./actions";
import { ManualSalesForm } from "@/components/manual-sales-form";
import { AdminPageShell } from "@/components/admin-page-shell";

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

type RecipeIngredient = {
  id: string;
  estimate_id: string;
  ingredient_name: string;
  ingredient_category: string;
  amount_per_unit: number | string;
  unit_label: string;
  editable_quantity: number | string | null;
  purchase_status: string;
  notes: string | null;
  active: boolean;
};

type OrderTotals = {
  paidAdults: number;
  paidChildren: number;
  pendingAdults: number;
  pendingChildren: number;
};

type ManualSales = {
  id: string;
  event_id: string;
  presale_paid_quantity: number | string | null;
  door_paid_quantity: number | string | null;
  children_free_quantity: number | string | null;
  notes: string | null;
};

async function getData() {
  const supabase = createSupabaseAdminClient();
  const { data: event } = await supabase.from("events").select("id").eq("slug", "arraia-tucxa-2026").single();
  if (!event) {
    return {
      eventId: "",
      assumptions: null as Assumptions | null,
      estimates: [] as Estimate[],
      ingredients: [] as RecipeIngredient[],
      manualSales: null as ManualSales | null,
      totals: { paidAdults: 0, paidChildren: 0, pendingAdults: 0, pendingChildren: 0 },
    };
  }

  const [{ data: assumptions }, { data: estimates }, { data: orders }, { data: ingredients }, { data: manualSales }] = await Promise.all([
    supabase.from("planning_assumptions").select("*").eq("event_id", event.id).maybeSingle(),
    supabase.from("planning_menu_estimates").select("*").eq("event_id", event.id).order("sort_order"),
    supabase.from("ticket_orders").select("adults_quantity, children_quantity, payment_status").eq("event_id", event.id),
    supabase.from("planning_recipe_ingredients").select("*").eq("event_id", event.id).order("sort_order"),
    supabase.from("event_manual_sales").select("*").eq("event_id", event.id).maybeSingle(),
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

  return {
    eventId: event.id,
    assumptions: assumptions as Assumptions | null,
    estimates: (estimates ?? []) as Estimate[],
    ingredients: (ingredients ?? []) as RecipeIngredient[],
    manualSales: manualSales as ManualSales | null,
    totals,
  };
}

function roundUp(value: number) {
  return Math.ceil(value);
}

function savedMessage(saved?: string) {
  if (saved === "assumptions") return "Premissas de planejamento salvas com sucesso.";
  if (saved === "estimate") return "Item de planejamento salvo com sucesso.";
  if (saved === "ingredient") return "Insumo de preparo salvo com sucesso.";
  if (saved === "manual-sales") return "Vendas manuais salvas com sucesso.";
  return null;
}

function calculateItemSuggestion(estimate: Estimate, adults: number, children: number, margin = 0) {
  return roundUp(((Number(estimate.consumption_per_adult) * adults) + (Number(estimate.consumption_per_child) * children)) * (1 + margin / 100));
}

function statusLabel(status: string) {
  const labels: Record<string, string> = {
    pending: "Pendente",
    partial: "Parcial",
    purchased: "Comprado",
  };

  return labels[status] ?? status;
}

export default async function AdminPlanejamentoPage({ searchParams }: PageProps) {
  await requireAdmin(["admin", "coordenador"], "/admin/festa-junina/planejamento");
  const params = await searchParams;
  const message = savedMessage(params?.saved);
  const { eventId, assumptions, estimates, ingredients, manualSales, totals } = await getData();

  const manualAdults = Number(manualSales?.presale_paid_quantity ?? 0) + Number(manualSales?.door_paid_quantity ?? 0);
  const manualChildren = Number(manualSales?.children_free_quantity ?? 0);
  const confirmedPeople = totals.paidAdults + totals.paidChildren + manualAdults + manualChildren;
  const possiblePeople = confirmedPeople + totals.pendingAdults + totals.pendingChildren;
  const guestsPerTable = Number(assumptions?.guests_per_table ?? 4) || 4;
  const volunteersPer50 = Number(assumptions?.volunteers_per_50_guests ?? 3) || 3;
  const margin = Number(assumptions?.safety_margin_percent ?? 15) || 0;
  const suggestedTables = roundUp(possiblePeople / guestsPerTable);
  const suggestedVolunteers = roundUp((possiblePeople / 50) * volunteersPer50);

  const estimateById = new Map(estimates.map((estimate) => [estimate.id, estimate]));
  const activeIngredients = ingredients.filter((ingredient) => ingredient.active);
  const conservativeIngredientTotals = activeIngredients.map((ingredient) => {
    const estimate = estimateById.get(ingredient.estimate_id);
    const itemQuantity = estimate ? calculateItemSuggestion(estimate, totals.paidAdults, totals.paidChildren, margin) : 0;
    const suggested = roundUp(itemQuantity * Number(ingredient.amount_per_unit ?? 0));
    return { ingredient, suggested, itemName: estimate?.item_name ?? "Item não encontrado" };
  });

  return (
    <AdminPageShell>
      
      <section className="mx-auto max-w-6xl px-5 py-12">
        <div className="mb-6 flex flex-wrap justify-between gap-3">
          <Link href="/admin/festa-junina" className="rounded-2xl bg-white px-5 py-3 text-sm font-bold text-green-950 shadow-sm" prefetch={false}>← Voltar ao admin</Link>
          <a href="/admin/logout" className="rounded-full bg-white px-4 py-2 text-sm font-bold text-green-950 shadow-sm">Sair da gestão</a>
        </div>

        <h1 className="text-3xl font-black text-green-950">Planejamento de compras e operação</h1>
        <div className="mt-4 flex flex-wrap gap-3">
          <a href="#sugestao-compras" className="rounded-2xl bg-green-900 px-5 py-3 text-sm font-black text-white shadow-sm">Sugestão de compras por item</a>
          <a href="#insumos-preparo" className="rounded-2xl bg-green-900 px-5 py-3 text-sm font-black text-white shadow-sm">Insumos para preparo</a>
          <Link href="/admin/festa-junina/cardapio" className="rounded-2xl bg-white px-5 py-3 text-sm font-black text-green-950 shadow-sm" prefetch={false}>Editar cardápio/ficha técnica</Link>
          <Link href="/admin/festa-junina/voluntarios" className="rounded-2xl bg-white px-5 py-3 text-sm font-black text-green-950 shadow-sm" prefetch={false}>Cadastrar voluntários</Link>
        </div>
        <p className="mt-4 max-w-3xl text-stone-600">
          Sugestões iniciais com base nas compras confirmadas e pendentes. Tudo deve ser validado e ajustado pela organização.
        </p>

        {message ? <div className="mt-6 rounded-3xl border border-green-200 bg-green-50 p-5 text-sm font-bold text-green-900">{message}</div> : null}

        <ManualSalesForm data={manualSales} eventId={eventId} />

        <div className="mt-8 grid gap-4 md:grid-cols-4">
          <div className="rounded-3xl bg-white p-5 shadow-sm"><p className="text-sm font-bold text-stone-500">Pessoas confirmadas</p><p className="mt-2 text-3xl font-black text-green-950">{confirmedPeople}</p><p className="mt-1 text-xs text-stone-500">Pagamentos aprovados + vendas manuais</p></div>
          <div className="rounded-3xl bg-white p-5 shadow-sm"><p className="text-sm font-bold text-stone-500">Confirmadas + pendentes</p><p className="mt-2 text-3xl font-black text-green-950">{possiblePeople}</p><p className="mt-1 text-xs text-stone-500">Aprovados + comprovantes/reservas</p></div>
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

        <div id="sugestao-compras" className="mt-8 scroll-mt-24 rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-black text-green-950">Sugestão de compras por item</h2>
          <p className="mt-2 text-sm text-stone-600">
            A sugestão mostra duas bases: conservadora, usando apenas pagamentos aprovados; e provável, usando aprovados + pendentes. O campo “Qtd. final” permite ajuste manual.
          </p>

          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[1100px] text-left text-sm">
              <thead className="bg-green-950 text-white"><tr><th className="p-3">Item</th><th className="p-3">Categoria</th><th className="p-3">Adulto</th><th className="p-3">Criança</th><th className="p-3">Base aprovada</th><th className="p-3">Base provável</th><th className="p-3">Qtd. final</th><th className="p-3">Observação</th></tr></thead>
              <tbody>
                {estimates.map((estimate) => {
                  const paidSuggested = calculateItemSuggestion(estimate, totals.paidAdults, totals.paidChildren, margin);
                  const possibleSuggested = calculateItemSuggestion(estimate, totals.paidAdults + totals.pendingAdults, totals.paidChildren + totals.pendingChildren, margin);
                  return (
                    <tr key={estimate.id} className="border-b border-stone-100 align-top last:border-0">
                      <td className="p-3 font-bold text-green-950">{estimate.item_name}</td>
                      <td className="p-3">{estimate.category}</td>
                      <td className="p-3">{estimate.consumption_per_adult} {estimate.unit_label}</td>
                      <td className="p-3">{estimate.consumption_per_child} {estimate.unit_label}</td>
                      <td className="p-3 font-black">{paidSuggested} {estimate.unit_label}</td>
                      <td className="p-3 font-black">{possibleSuggested} {estimate.unit_label}</td>
                      <td className="p-3 font-black">{estimate.editable_quantity ?? possibleSuggested} {estimate.unit_label}</td>
                      <td className="p-3 text-xs text-stone-500">
                        Edite consumo, categoria, preparo e ficha técnica em <Link href="/admin/festa-junina/cardapio" className="font-black text-green-900 underline" prefetch={false}>Cardápio/Ficha técnica</Link>.
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div id="insumos-preparo" className="mt-8 scroll-mt-24 rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-black text-green-950">Insumos para preparo</h2>
          <p className="mt-2 text-sm text-stone-600">
            Lista de ingredientes e materiais necessários para preparar os itens do cardápio. A sugestão abaixo usa apenas pagamentos aprovados como base conservadora; ajuste a quantidade final conforme decisão da coordenação.
          </p>

          {ingredients.length === 0 ? (
            <div className="mt-5 rounded-2xl bg-amber-50 p-4 text-sm font-bold text-amber-900">
              Rode a migration 005 para carregar os insumos iniciais de preparo.
            </div>
          ) : (
            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[1100px] text-left text-sm">
                <thead className="bg-green-950 text-white"><tr><th className="p-3">Insumo</th><th className="p-3">Item relacionado</th><th className="p-3">Por unidade</th><th className="p-3">Sugestão aprovada</th><th className="p-3">Qtd. final</th><th className="p-3">Status</th><th className="p-3">Observação</th></tr></thead>
                <tbody>
                  {conservativeIngredientTotals.map(({ ingredient, suggested, itemName }) => (
                    <tr key={ingredient.id} className="border-b border-stone-100 align-top last:border-0">
                      <td className="p-3 font-bold text-green-950">{ingredient.ingredient_name}<p className="text-xs font-normal text-stone-500">{ingredient.ingredient_category}</p></td>
                      <td className="p-3">{itemName}</td>
                      <td className="p-3">{ingredient.amount_per_unit} {ingredient.unit_label}</td>
                      <td className="p-3 font-black">{suggested} {ingredient.unit_label}</td>
                      <td className="p-3 font-black">{ingredient.editable_quantity ?? suggested} {ingredient.unit_label}</td>
                      <td className="p-3">{statusLabel(ingredient.purchase_status)}</td>
                      <td className="p-3 text-xs text-stone-500">
                        Ajuste insumo, quantidade por unidade e status em <Link href="/admin/festa-junina/cardapio" className="font-black text-green-900 underline" prefetch={false}>Cardápio/Ficha técnica</Link>.
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </AdminPageShell>
  );
}
