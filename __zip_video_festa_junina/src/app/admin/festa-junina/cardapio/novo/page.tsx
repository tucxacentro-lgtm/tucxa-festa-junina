import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { createMenuPlanningItem } from "../actions";
import { AdminPageShell } from "@/components/admin-page-shell";

export default async function NovoCardapioPage() {
  await requireAdmin(["admin", "coordenador"], "/admin/festa-junina/cardapio/novo");

  return (
    <AdminPageShell>
      
      <section className="mx-auto max-w-4xl px-5 py-12">
        <Link href="/admin/festa-junina/cardapio" className="rounded-2xl bg-white px-5 py-3 text-sm font-bold text-green-950 shadow-sm" prefetch={false}>← Voltar ao cardápio</Link>
        <h1 className="mt-8 text-3xl font-black text-green-950">Novo item do cardápio</h1>
        <form action={createMenuPlanningItem} className="mt-8 rounded-3xl bg-white p-6 shadow-sm">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm font-bold text-green-950">Nome<input required name="item_name" className="rounded-2xl border p-3 font-normal" /></label>
            <label className="grid gap-2 text-sm font-bold text-green-950">Categoria<input name="category" defaultValue="Comidas típicas" className="rounded-2xl border p-3 font-normal" /></label>
            <label className="grid gap-2 text-sm font-bold text-green-950">Consumo por adulto<input name="consumption_per_adult" defaultValue="0.5" className="rounded-2xl border p-3 font-normal" /></label>
            <label className="grid gap-2 text-sm font-bold text-green-950">Consumo por criança<input name="consumption_per_child" defaultValue="0.3" className="rounded-2xl border p-3 font-normal" /></label>
            <label className="grid gap-2 text-sm font-bold text-green-950">Unidade<input name="unit_label" defaultValue="un" className="rounded-2xl border p-3 font-normal" /></label>
            <label className="grid gap-2 text-sm font-bold text-green-950">Preço de venda<input name="sales_price" defaultValue="0" className="rounded-2xl border p-3 font-normal" /></label>
            <label className="grid gap-2 text-sm font-bold text-green-950">Ordem<input name="sort_order" defaultValue="100" className="rounded-2xl border p-3 font-normal" /></label>
            <label className="flex items-center gap-2 rounded-2xl bg-amber-50 p-3 text-sm font-bold text-green-950"><input type="checkbox" name="active" defaultChecked /> Ativo</label>
            <label className="flex items-center gap-2 rounded-2xl bg-green-50 p-3 text-sm font-bold text-green-950"><input type="checkbox" name="is_sales_item" defaultChecked /> Aparece no cardápio de vendas</label>
            <label className="flex items-center gap-2 rounded-2xl bg-amber-50 p-3 text-sm font-bold text-green-950"><input type="checkbox" name="requires_preparation" defaultChecked /> Requer preparo</label>
          </div>
          <button className="mt-6 w-full rounded-2xl bg-green-900 px-5 py-3 font-black text-white">Criar item</button>
        </form>
      </section>
    </AdminPageShell>
  );
}
