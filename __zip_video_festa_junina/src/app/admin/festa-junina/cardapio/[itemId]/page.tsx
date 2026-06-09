import Link from "next/link";
import { MenuItemTechnicalSheet } from "@/components/menu-item-technical-sheet";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabaseServer";
import { addRecipeIngredient, updateMenuPlanningItem, updateRecipeIngredient } from "../actions";
import { AdminPageShell } from "@/components/admin-page-shell";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ itemId: string }>;
  searchParams?: Promise<{ saved?: string }>;
};

type MenuPlanningItem = {
  id: string;
  item_name: string;
  category: string;
  consumption_per_adult: number | string;
  consumption_per_child: number | string;
  unit_label: string;
  editable_quantity: number | string | null;
  sales_price?: number | string | null;
  requires_preparation?: boolean | null;
  is_sales_item?: boolean | null;
  active: boolean;
  sort_order: number;
};

type Ingredient = {
  id: string;
  ingredient_name: string;
  ingredient_category: string;
  amount_per_unit: number | string;
  unit_label: string;
  notes: string | null;
  active: boolean;
  sort_order: number;
};

async function getItem(itemId: string) {
  const supabase = createSupabaseAdminClient();
  const [{ data: item }, { data: ingredients }] = await Promise.all([
    supabase.from("planning_menu_estimates").select("*").eq("id", itemId).single(),
    supabase.from("planning_recipe_ingredients").select("*").eq("estimate_id", itemId).order("sort_order"),
  ]);

  return { item: item as MenuPlanningItem | null, ingredients: (ingredients ?? []) as Ingredient[] };
}

export default async function CardapioDetalhePage({ params, searchParams }: PageProps) {
  await requireAdmin(["admin", "coordenador"], "/admin/festa-junina/cardapio");
  const { itemId } = await params;
  const query = await searchParams;
  const { item, ingredients } = await getItem(itemId);

  if (!item) {
    return (
      <AdminPageShell><section className="mx-auto max-w-3xl px-5 py-16"><div className="rounded-3xl bg-white p-8 shadow-sm"><h1 className="text-3xl font-black text-green-950">Item não encontrado</h1><Link href="/admin/festa-junina/cardapio" className="mt-5 inline-block rounded-2xl bg-green-900 px-5 py-3 font-bold text-white" prefetch={false}>Voltar</Link></div></section></AdminPageShell>
    );
  }

  return (
    <AdminPageShell>
      
      <section className="mx-auto max-w-6xl px-5 py-12">
        <div className="mb-6 flex flex-wrap justify-between gap-3">
          <Link href="/admin/festa-junina/cardapio" className="rounded-2xl bg-white px-5 py-3 text-sm font-bold text-green-950 shadow-sm" prefetch={false}>← Voltar ao cardápio</Link>
          <Link href="/admin/festa-junina/planejamento" className="rounded-2xl bg-white px-5 py-3 text-sm font-bold text-green-950 shadow-sm" prefetch={false}>Ver planejamento</Link>
        </div>

        <h1 className="text-3xl font-black text-green-950">Ficha técnica: {item.item_name}</h1>
        {query?.saved ? <div className="mt-5 rounded-3xl border border-green-200 bg-green-50 p-4 text-sm font-bold text-green-900">Alterações salvas com sucesso.</div> : null}

        <form action={updateMenuPlanningItem} className="mt-8 rounded-3xl bg-white p-6 shadow-sm">
          <input type="hidden" name="id" value={item.id} />
          <div className="grid gap-4 md:grid-cols-3">
            <label className="grid gap-2 text-sm font-bold text-green-950">Nome<input name="item_name" defaultValue={item.item_name} className="rounded-2xl border p-3 font-normal" /></label>
            <label className="grid gap-2 text-sm font-bold text-green-950">Categoria<input name="category" defaultValue={item.category} className="rounded-2xl border p-3 font-normal" /></label>
            <label className="grid gap-2 text-sm font-bold text-green-950">Unidade<input name="unit_label" defaultValue={item.unit_label} className="rounded-2xl border p-3 font-normal" /></label>
            <label className="grid gap-2 text-sm font-bold text-green-950">Consumo adulto<input name="consumption_per_adult" defaultValue={item.consumption_per_adult} className="rounded-2xl border p-3 font-normal" /></label>
            <label className="grid gap-2 text-sm font-bold text-green-950">Consumo criança<input name="consumption_per_child" defaultValue={item.consumption_per_child} className="rounded-2xl border p-3 font-normal" /></label>
            <label className="grid gap-2 text-sm font-bold text-green-950">Qtd. ajustada<input name="editable_quantity" defaultValue={item.editable_quantity ?? ""} className="rounded-2xl border p-3 font-normal" /></label>
            <label className="grid gap-2 text-sm font-bold text-green-950">Preço de venda<input name="sales_price" defaultValue={item.sales_price ?? "0"} className="rounded-2xl border p-3 font-normal" /></label>
            <label className="grid gap-2 text-sm font-bold text-green-950">Ordem<input name="sort_order" defaultValue={item.sort_order} className="rounded-2xl border p-3 font-normal" /></label>
            <label className="flex items-center gap-2 rounded-2xl bg-amber-50 p-3 text-sm font-bold text-green-950"><input type="checkbox" name="active" defaultChecked={item.active} /> Ativo</label>
            <label className="flex items-center gap-2 rounded-2xl bg-green-50 p-3 text-sm font-bold text-green-950"><input type="checkbox" name="is_sales_item" defaultChecked={item.is_sales_item !== false} /> Aparece no cardápio de vendas</label>
            <label className="flex items-center gap-2 rounded-2xl bg-amber-50 p-3 text-sm font-bold text-green-950"><input type="checkbox" name="requires_preparation" defaultChecked={Boolean(item.requires_preparation)} /> Requer preparo</label>
          </div>
          <button className="mt-6 w-full rounded-2xl bg-green-900 px-5 py-3 font-black text-white">Salvar item</button>
        </form>

        <div className="mt-8 rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-black text-green-950">Ficha técnica atual</h2>
          <div className="mt-4"><MenuItemTechnicalSheet ingredients={ingredients} /></div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1fr]">
          <form action={addRecipeIngredient} className="rounded-3xl bg-white p-6 shadow-sm">
            <input type="hidden" name="estimate_id" value={item.id} />
            <h2 className="text-xl font-black text-green-950">Adicionar insumo</h2>
            <div className="mt-4 grid gap-3">
              <input required name="ingredient_name" placeholder="Nome do insumo" className="rounded-2xl border p-3" />
              <input name="ingredient_category" placeholder="Categoria" defaultValue="Insumos" className="rounded-2xl border p-3" />
              <input name="amount_per_unit" placeholder="Qtd. por unidade" defaultValue="1" className="rounded-2xl border p-3" />
              <input name="unit_label" placeholder="Unidade" defaultValue="un" className="rounded-2xl border p-3" />
              <input name="sort_order" placeholder="Ordem" defaultValue="100" className="rounded-2xl border p-3" />
              <textarea name="notes" placeholder="Observações / modo de preparo" className="min-h-24 rounded-2xl border p-3" />
            </div>
            <button className="mt-4 w-full rounded-2xl bg-green-900 px-5 py-3 font-black text-white">Adicionar</button>
          </form>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-black text-green-950">Editar insumos</h2>
            <div className="mt-4 grid gap-4">
              {ingredients.map((ingredient) => (
                <form key={ingredient.id} action={updateRecipeIngredient} className="rounded-2xl border border-stone-100 p-4">
                  <input type="hidden" name="id" value={ingredient.id} />
                  <input type="hidden" name="estimate_id" value={item.id} />
                  <div className="grid gap-2 md:grid-cols-2">
                    <input name="ingredient_name" defaultValue={ingredient.ingredient_name} className="rounded-xl border p-2" />
                    <input name="ingredient_category" defaultValue={ingredient.ingredient_category} className="rounded-xl border p-2" />
                    <input name="amount_per_unit" defaultValue={ingredient.amount_per_unit} className="rounded-xl border p-2" />
                    <input name="unit_label" defaultValue={ingredient.unit_label} className="rounded-xl border p-2" />
                    <input name="sort_order" defaultValue={ingredient.sort_order} className="rounded-xl border p-2" />
                    <label className="flex items-center gap-2 text-xs font-bold text-green-950"><input type="checkbox" name="active" defaultChecked={ingredient.active} /> Ativo</label>
                    <input name="notes" defaultValue={ingredient.notes ?? ""} className="rounded-xl border p-2 md:col-span-2" />
                  </div>
                  <button className="mt-3 rounded-xl bg-green-900 px-4 py-2 text-xs font-black text-white">Salvar insumo</button>
                </form>
              ))}
            </div>
          </div>
        </div>
      </section>
    </AdminPageShell>
  );
}
