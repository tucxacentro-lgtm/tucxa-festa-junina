import Link from "next/link";
import { Archive, Edit3, PackageCheck } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { AdminPageShell } from "@/components/admin-page-shell";
import { getCurrentEventForAdmin } from "@/lib/current-event";
import { formatCurrency } from "@/lib/format";
import { FINAL_ITEM_STATUS_LABELS, getFinalPurchaseItems, numberValue, type EventPurchaseFinalItem } from "@/lib/event-purchases";
import { deactivateFinalItem, saveFinalItem } from "./actions";

export const dynamic = "force-dynamic";

type PageProps = { searchParams?: Promise<Record<string, string | string[] | undefined>> };
function firstParam(value: string | string[] | undefined) { return Array.isArray(value) ? value[0] : value; }
function statusClass(value: string) { if (value === "ready" || value === "bought") return "bg-green-100 text-green-900"; if (value === "to_buy") return "bg-amber-100 text-amber-900"; if (value === "unavailable") return "bg-red-100 text-red-900"; return "bg-stone-100 text-stone-700"; }

function FinalItemForm({ item }: { item?: EventPurchaseFinalItem }) {
  return (
    <form action={saveFinalItem} className="rounded-[1.75rem] border border-green-100 bg-white p-6 shadow-sm">
      <input type="hidden" name="id" value={item?.id ?? ""} />
      <input type="hidden" name="sales_menu_item_id" value={item?.sales_menu_item_id ?? ""} />
      <div className="flex flex-wrap items-start justify-between gap-3"><div><span className="rounded-full bg-green-50 px-3 py-1 text-xs font-black text-green-900">{item ? "Editar item final" : "Novo item final"}</span><h2 className="mt-3 text-2xl font-black text-green-950">{item?.name ?? "Cadastrar item final"}</h2><p className="mt-2 text-sm text-stone-600">Controle produtos prontos para venda, itens que requerem preparo e itens do bingo.</p></div><Link href="/admin/festa-junina/compras/itens-finais" className="rounded-full bg-white px-4 py-2 text-sm font-black text-green-950 shadow-sm" prefetch={false}>Cancelar</Link></div>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-bold text-green-950">Nome<input name="name" required defaultValue={item?.name ?? ""} className="rounded-2xl border border-green-100 p-3 font-normal" /></label>
        <label className="grid gap-2 text-sm font-bold text-green-950">Categoria<input name="category" defaultValue={item?.category ?? ""} className="rounded-2xl border border-green-100 p-3 font-normal" placeholder="Bebidas, Comidas, Doces..." /></label>
        <label className="grid gap-2 text-sm font-bold text-green-950">Tipo<select name="item_type" defaultValue={item?.item_type ?? "ready_for_sale"} className="rounded-2xl border border-green-100 p-3 font-normal"><option value="ready_for_sale">Pronto para venda</option><option value="requires_preparation">Requer preparo</option><option value="bingo">Bingo</option><option value="support">Apoio</option></select></label>
        <label className="grid gap-2 text-sm font-bold text-green-950">Status<select name="status" defaultValue={item?.status ?? "planned"} className="rounded-2xl border border-green-100 p-3 font-normal"><option value="planned">Planejado</option><option value="to_buy">Comprar</option><option value="bought">Comprado</option><option value="preparing">Em preparo</option><option value="ready">Pronto</option><option value="unavailable">Indisponível</option></select></label>
        <label className="grid gap-2 text-sm font-bold text-green-950">Quantidade prevista<input name="planned_quantity" type="number" step="0.01" defaultValue={String(item?.planned_quantity ?? 0)} className="rounded-2xl border border-green-100 p-3 font-normal" /></label>
        <label className="grid gap-2 text-sm font-bold text-green-950">Quantidade comprada/produzida<input name="purchased_quantity" type="number" step="0.01" defaultValue={String(item?.purchased_quantity ?? 0)} className="rounded-2xl border border-green-100 p-3 font-normal" /></label>
        <label className="grid gap-2 text-sm font-bold text-green-950">Quantidade vendida/consumida<input name="consumed_quantity" type="number" step="0.01" defaultValue={String(item?.consumed_quantity ?? 0)} className="rounded-2xl border border-green-100 p-3 font-normal" /></label>
        <label className="grid gap-2 text-sm font-bold text-green-950">Unidade<input name="unit_label" defaultValue={item?.unit_label ?? "un"} className="rounded-2xl border border-green-100 p-3 font-normal" /></label>
        <label className="grid gap-2 text-sm font-bold text-green-950">Preço de venda<input name="sales_price" type="number" step="0.01" defaultValue={String(item?.sales_price ?? 0)} className="rounded-2xl border border-green-100 p-3 font-normal" /></label>
        <label className="grid gap-2 text-sm font-bold text-green-950">Custo estimado<input name="estimated_cost" type="number" step="0.01" defaultValue={String(item?.estimated_cost ?? 0)} className="rounded-2xl border border-green-100 p-3 font-normal" /></label>
        <label className="grid gap-2 text-sm font-bold text-green-950">Custo real<input name="actual_cost" type="number" step="0.01" defaultValue={String(item?.actual_cost ?? 0)} className="rounded-2xl border border-green-100 p-3 font-normal" /></label>
        <label className="grid gap-2 text-sm font-bold text-green-950">Local de armazenamento<input name="storage_location" defaultValue={item?.storage_location ?? ""} className="rounded-2xl border border-green-100 p-3 font-normal" /></label>
        <label className="grid gap-2 text-sm font-bold text-green-950">Ordem<input name="sort_order" type="number" defaultValue={item?.sort_order ?? 999} className="rounded-2xl border border-green-100 p-3 font-normal" /></label>
        <label className="grid gap-2 text-sm font-bold text-green-950 md:col-span-2">Observações<textarea name="notes" defaultValue={item?.notes ?? ""} className="min-h-20 rounded-2xl border border-green-100 p-3 font-normal" /></label>
      </div>
      <button className="mt-6 w-full rounded-2xl bg-green-900 px-5 py-3 font-black text-white">Salvar item final</button>
    </form>
  );
}

export default async function Page({ searchParams }: PageProps) {
  await requireAdmin(["admin", "coordenador"], "/admin/festa-junina/compras/itens-finais");
  const params = await searchParams;
  const event = await getCurrentEventForAdmin();
  const items = await getFinalPurchaseItems(event.id);
  const editId = firstParam(params?.edit);
  const showNew = firstParam(params?.new) === "1";
  const editing = editId ? items.find((item) => item.id === editId) : undefined;
  const plannedTotal = items.reduce((sum, item) => sum + numberValue(item.planned_quantity), 0);
  const purchasedTotal = items.reduce((sum, item) => sum + numberValue(item.purchased_quantity), 0);
  const estimatedCost = items.reduce((sum, item) => sum + numberValue(item.planned_quantity) * numberValue(item.estimated_cost), 0);

  return (
    <AdminPageShell>
      <section className="mx-auto max-w-7xl px-5 py-10">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3"><Link href="/admin/festa-junina" className="rounded-full bg-white px-5 py-3 text-sm font-black text-green-950 shadow-sm" prefetch={false}>← Painel do evento</Link><Link href="/admin/festa-junina/compras/insumos" className="rounded-full bg-white px-5 py-3 text-sm font-black text-green-950 shadow-sm" prefetch={false}>Ver insumos</Link></div>
        <div className="rounded-[2rem] border border-green-100 bg-white p-6 shadow-sm"><div className="flex flex-wrap items-start justify-between gap-4"><div><span className="rounded-full bg-green-50 px-3 py-1 text-xs font-black text-green-900">Compras · Itens finais</span><h1 className="mt-4 text-3xl font-black text-green-950">Itens finais</h1><p className="mt-3 max-w-4xl text-stone-700">Controle itens prontos para venda ou entrega, como bebidas, doces, cartelas e produtos que serão preparados para o evento.</p></div><Link href="/admin/festa-junina/compras/itens-finais?new=1" className="rounded-full bg-green-900 px-5 py-3 text-sm font-black text-white" prefetch={false}>Novo item</Link></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-3xl bg-amber-50 p-5"><PackageCheck className="h-6 w-6 text-green-900" /><p className="mt-3 text-3xl font-black">{plannedTotal}</p><p className="text-sm font-bold text-stone-700">previstos</p></div><div className="rounded-3xl bg-amber-50 p-5"><Archive className="h-6 w-6 text-green-900" /><p className="mt-3 text-3xl font-black">{purchasedTotal}</p><p className="text-sm font-bold text-stone-700">comprados/produzidos</p></div><div className="rounded-3xl bg-amber-50 p-5"><p className="text-sm font-bold text-stone-700">Custo estimado</p><p className="mt-3 text-3xl font-black">{formatCurrency(estimatedCost)}</p></div></div></div>
        {(showNew || editing) ? <div className="mt-8"><FinalItemForm item={editing} /></div> : null}
        <div className="mt-8 grid gap-5 lg:grid-cols-2">{items.map((item) => <article key={item.id} className="rounded-[1.75rem] border border-green-100 bg-white p-6 shadow-sm"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[0.16em] text-green-800">{item.category ?? "Item"}</p><h2 className="mt-1 text-xl font-black text-green-950">{item.name}</h2></div><span className={`rounded-full px-3 py-1 text-xs font-black ${statusClass(item.status)}`}>{FINAL_ITEM_STATUS_LABELS[item.status]}</span></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-green-50 p-3"><p className="text-xs font-bold text-stone-500">Prevista</p><p className="text-2xl font-black">{numberValue(item.planned_quantity)}</p></div><div className="rounded-2xl bg-green-50 p-3"><p className="text-xs font-bold text-stone-500">Comprada</p><p className="text-2xl font-black">{numberValue(item.purchased_quantity)}</p></div><div className="rounded-2xl bg-green-50 p-3"><p className="text-xs font-bold text-stone-500">Vendida</p><p className="text-2xl font-black">{numberValue(item.consumed_quantity)}</p></div></div><p className="mt-4 text-sm text-stone-600">Venda: {formatCurrency(item.sales_price)} · Custo est.: {formatCurrency(item.estimated_cost)} · Custo real: {formatCurrency(item.actual_cost)}</p>{item.storage_location ? <p className="mt-2 text-sm text-stone-600"><strong>Armazenamento:</strong> {item.storage_location}</p> : null}<div className="mt-5 flex flex-wrap gap-3"><Link href={`/admin/festa-junina/compras/itens-finais?edit=${item.id}`} className="inline-flex items-center gap-2 rounded-full bg-green-900 px-5 py-3 text-sm font-black text-white" prefetch={false}><Edit3 className="h-4 w-4" /> Editar</Link><form action={deactivateFinalItem}><input type="hidden" name="id" value={item.id} /><button className="rounded-full bg-red-50 px-5 py-3 text-sm font-black text-red-700">Desativar</button></form></div></article>)}{items.length === 0 ? <div className="rounded-[2rem] border border-dashed border-green-200 bg-green-50 p-8 text-sm text-stone-700 lg:col-span-2">Nenhum item final cadastrado ainda. Rode a migration 023 para trazer os itens do cardápio como base, ou clique em Novo item.</div> : null}</div>
      </section>
    </AdminPageShell>
  );
}
