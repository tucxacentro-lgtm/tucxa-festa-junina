import Link from "next/link";
import { Edit3, PackagePlus, ShoppingBasket } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { AdminPageShell } from "@/components/admin-page-shell";
import { getCurrentEventForAdmin } from "@/lib/current-event";
import { formatCurrency } from "@/lib/format";
import { getFinalPurchaseItems, getPurchaseIngredients, INGREDIENT_STATUS_LABELS, numberValue, type EventPurchaseIngredient } from "@/lib/event-purchases";
import { deactivateIngredient, saveIngredient } from "./actions";

export const dynamic = "force-dynamic";

type PageProps = { searchParams?: Promise<Record<string, string | string[] | undefined>> };
function firstParam(value: string | string[] | undefined) { return Array.isArray(value) ? value[0] : value; }
function statusClass(value: string) { if (value === "checked" || value === "stored") return "bg-green-100 text-green-900"; if (value === "bought") return "bg-blue-100 text-blue-900"; if (value === "to_buy") return "bg-amber-100 text-amber-900"; return "bg-stone-100 text-stone-700"; }

function IngredientForm({ item, finalItems }: { item?: EventPurchaseIngredient; finalItems: Awaited<ReturnType<typeof getFinalPurchaseItems>> }) {
  return (
    <form action={saveIngredient} className="rounded-[1.75rem] border border-green-100 bg-white p-6 shadow-sm">
      <input type="hidden" name="id" value={item?.id ?? ""} />
      <input type="hidden" name="sales_menu_item_id" value={item?.sales_menu_item_id ?? ""} />
      <div className="flex flex-wrap items-start justify-between gap-3"><div><span className="rounded-full bg-green-50 px-3 py-1 text-xs font-black text-green-900">{item ? "Editar insumo" : "Novo insumo"}</span><h2 className="mt-3 text-2xl font-black text-green-950">{item?.name ?? "Cadastrar insumo"}</h2><p className="mt-2 text-sm text-stone-600">Insumos podem estar associados a um item final/preparo ou serem gerais do evento.</p></div><Link href="/admin/festa-junina/compras/insumos" className="rounded-full bg-white px-4 py-2 text-sm font-black text-green-950 shadow-sm" prefetch={false}>Cancelar</Link></div>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-bold text-green-950">Nome do insumo<input name="name" required defaultValue={item?.name ?? ""} className="rounded-2xl border border-green-100 p-3 font-normal" /></label>
        <label className="grid gap-2 text-sm font-bold text-green-950">Categoria<input name="category" defaultValue={item?.category ?? ""} className="rounded-2xl border border-green-100 p-3 font-normal" placeholder="Ingredientes, descartáveis, limpeza..." /></label>
        <label className="grid gap-2 text-sm font-bold text-green-950 md:col-span-2">Item final/preparo associado<select name="final_item_id" defaultValue={item?.final_item_id ?? ""} className="rounded-2xl border border-green-100 p-3 font-normal"><option value="">Insumo geral do evento</option>{finalItems.map((finalItem) => <option key={finalItem.id} value={finalItem.id}>{finalItem.name}</option>)}</select></label>
        <label className="grid gap-2 text-sm font-bold text-green-950">Quantidade estimada<input name="planned_quantity" type="number" step="0.01" defaultValue={String(item?.planned_quantity ?? 0)} className="rounded-2xl border border-green-100 p-3 font-normal" /></label>
        <label className="grid gap-2 text-sm font-bold text-green-950">Quantidade comprada<input name="purchased_quantity" type="number" step="0.01" defaultValue={String(item?.purchased_quantity ?? 0)} className="rounded-2xl border border-green-100 p-3 font-normal" /></label>
        <label className="grid gap-2 text-sm font-bold text-green-950">Unidade<input name="unit_label" defaultValue={item?.unit_label ?? "un"} className="rounded-2xl border border-green-100 p-3 font-normal" /></label>
        <label className="grid gap-2 text-sm font-bold text-green-950">Status<select name="status" defaultValue={item?.status ?? "planned"} className="rounded-2xl border border-green-100 p-3 font-normal"><option value="planned">Previsto</option><option value="to_buy">Comprar</option><option value="bought">Comprado</option><option value="stored">Armazenado</option><option value="checked">Conferido</option></select></label>
        <label className="grid gap-2 text-sm font-bold text-green-950">Custo unitário estimado<input name="estimated_unit_cost" type="number" step="0.01" defaultValue={String(item?.estimated_unit_cost ?? 0)} className="rounded-2xl border border-green-100 p-3 font-normal" /></label>
        <label className="grid gap-2 text-sm font-bold text-green-950">Custo unitário real<input name="actual_unit_cost" type="number" step="0.01" defaultValue={String(item?.actual_unit_cost ?? 0)} className="rounded-2xl border border-green-100 p-3 font-normal" /></label>
        <label className="grid gap-2 text-sm font-bold text-green-950">Fornecedor/local sugerido<input name="supplier_hint" defaultValue={item?.supplier_hint ?? ""} className="rounded-2xl border border-green-100 p-3 font-normal" /></label>
        <label className="grid gap-2 text-sm font-bold text-green-950">Local de armazenamento<input name="storage_location" defaultValue={item?.storage_location ?? ""} className="rounded-2xl border border-green-100 p-3 font-normal" /></label>
        <label className="grid gap-2 text-sm font-bold text-green-950">Ordem<input name="sort_order" type="number" defaultValue={item?.sort_order ?? 999} className="rounded-2xl border border-green-100 p-3 font-normal" /></label>
        <label className="grid gap-2 text-sm font-bold text-green-950 md:col-span-2">Observações<textarea name="notes" defaultValue={item?.notes ?? ""} className="min-h-20 rounded-2xl border border-green-100 p-3 font-normal" /></label>
      </div>
      <button className="mt-6 w-full rounded-2xl bg-green-900 px-5 py-3 font-black text-white">Salvar insumo</button>
    </form>
  );
}

export default async function Page({ searchParams }: PageProps) {
  await requireAdmin(["admin", "coordenador"], "/admin/festa-junina/compras/insumos");
  const params = await searchParams;
  const event = await getCurrentEventForAdmin();
  const [ingredients, finalItems] = await Promise.all([getPurchaseIngredients(event.id), getFinalPurchaseItems(event.id)]);
  const editId = firstParam(params?.edit);
  const showNew = firstParam(params?.new) === "1";
  const editing = editId ? ingredients.find((item) => item.id === editId) : undefined;
  const estimatedTotal = ingredients.reduce((sum, item) => sum + numberValue(item.planned_quantity) * numberValue(item.estimated_unit_cost), 0);
  const realTotal = ingredients.reduce((sum, item) => sum + numberValue(item.purchased_quantity) * numberValue(item.actual_unit_cost), 0);

  return (
    <AdminPageShell>
      <section className="mx-auto max-w-7xl px-5 py-10">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3"><Link href="/admin/festa-junina" className="rounded-full bg-white px-5 py-3 text-sm font-black text-green-950 shadow-sm" prefetch={false}>← Painel do evento</Link><Link href="/admin/festa-junina/compras/itens-finais" className="rounded-full bg-white px-5 py-3 text-sm font-black text-green-950 shadow-sm" prefetch={false}>Ver itens finais</Link></div>
        <div className="rounded-[2rem] border border-green-100 bg-white p-6 shadow-sm"><div className="flex flex-wrap items-start justify-between gap-4"><div><span className="rounded-full bg-green-50 px-3 py-1 text-xs font-black text-green-900">Compras · Insumos</span><h1 className="mt-4 text-3xl font-black text-green-950">Insumos para preparo e operação</h1><p className="mt-3 max-w-4xl text-stone-700">Liste ingredientes, descartáveis e materiais de apoio. Quando aplicável, associe o insumo a um item final/preparo.</p></div><Link href="/admin/festa-junina/compras/insumos?new=1" className="rounded-full bg-green-900 px-5 py-3 text-sm font-black text-white" prefetch={false}>Novo insumo</Link></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-3xl bg-amber-50 p-5"><PackagePlus className="h-6 w-6 text-green-900" /><p className="mt-3 text-3xl font-black">{ingredients.length}</p><p className="text-sm font-bold text-stone-700">insumos</p></div><div className="rounded-3xl bg-amber-50 p-5"><ShoppingBasket className="h-6 w-6 text-green-900" /><p className="mt-3 text-3xl font-black">{formatCurrency(estimatedTotal)}</p><p className="text-sm font-bold text-stone-700">custo estimado</p></div><div className="rounded-3xl bg-amber-50 p-5"><p className="text-sm font-bold text-stone-700">Custo real</p><p className="mt-3 text-3xl font-black">{formatCurrency(realTotal)}</p></div></div></div>
        {(showNew || editing) ? <div className="mt-8"><IngredientForm item={editing} finalItems={finalItems} /></div> : null}
        <div className="mt-8 grid gap-5 lg:grid-cols-2">{ingredients.map((item) => <article key={item.id} className="rounded-[1.75rem] border border-green-100 bg-white p-6 shadow-sm"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[0.16em] text-green-800">{item.category ?? "Insumo"}</p><h2 className="mt-1 text-xl font-black text-green-950">{item.name}</h2>{item.final_item?.name ? <p className="mt-1 text-sm text-stone-600">Associado a: {item.final_item.name}</p> : <p className="mt-1 text-sm text-stone-600">Insumo geral do evento</p>}</div><span className={`rounded-full px-3 py-1 text-xs font-black ${statusClass(item.status)}`}>{INGREDIENT_STATUS_LABELS[item.status]}</span></div><div className="mt-5 grid grid-cols-2 gap-3 text-center"><div className="rounded-2xl bg-green-50 p-3"><p className="text-xs font-bold text-stone-500">Estimado</p><p className="text-2xl font-black">{numberValue(item.planned_quantity)} {item.unit_label}</p></div><div className="rounded-2xl bg-green-50 p-3"><p className="text-xs font-bold text-stone-500">Comprado</p><p className="text-2xl font-black">{numberValue(item.purchased_quantity)} {item.unit_label}</p></div></div><p className="mt-4 text-sm text-stone-600">Custo est.: {formatCurrency(item.estimated_unit_cost)} · Custo real: {formatCurrency(item.actual_unit_cost)}</p>{item.supplier_hint ? <p className="mt-2 text-sm text-stone-600"><strong>Fornecedor/local:</strong> {item.supplier_hint}</p> : null}{item.storage_location ? <p className="mt-2 text-sm text-stone-600"><strong>Armazenamento:</strong> {item.storage_location}</p> : null}<div className="mt-5 flex flex-wrap gap-3"><Link href={`/admin/festa-junina/compras/insumos?edit=${item.id}`} className="inline-flex items-center gap-2 rounded-full bg-green-900 px-5 py-3 text-sm font-black text-white" prefetch={false}><Edit3 className="h-4 w-4" /> Editar</Link><form action={deactivateIngredient}><input type="hidden" name="id" value={item.id} /><button className="rounded-full bg-red-50 px-5 py-3 text-sm font-black text-red-700">Desativar</button></form></div></article>)}{ingredients.length === 0 ? <div className="rounded-[2rem] border border-dashed border-green-200 bg-green-50 p-8 text-sm text-stone-700 lg:col-span-2">Nenhum insumo cadastrado ainda. Rode a migration 023 para gerar uma base inicial ou clique em Novo insumo.</div> : null}</div>
      </section>
    </AdminPageShell>
  );
}
