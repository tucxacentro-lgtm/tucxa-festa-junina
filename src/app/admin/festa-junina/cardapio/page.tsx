import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabaseServer";
import { AdminPageShell } from "@/components/admin-page-shell";

export const dynamic = "force-dynamic";

type MenuPlanningItem = {
  id: string;
  item_name: string;
  category: string;
  consumption_per_adult: number | string;
  consumption_per_child: number | string;
  unit_label: string;
  active: boolean;
};

async function getItems() {
  const supabase = createSupabaseAdminClient();
  const { data: event } = await supabase.from("events").select("id").eq("slug", "arraia-tucxa-2026").single();
  if (!event) return [] as MenuPlanningItem[];

  const { data } = await supabase
    .from("planning_menu_estimates")
    .select("id, item_name, category, consumption_per_adult, consumption_per_child, unit_label, active")
    .eq("event_id", event.id)
    .order("category")
    .order("sort_order");

  return (data ?? []) as MenuPlanningItem[];
}

export default async function AdminCardapioPage() {
  await requireAdmin(["admin", "coordenador"], "/admin/festa-junina/cardapio");
  const items = await getItems();

  return (
    <AdminPageShell>
      
      <section className="mx-auto max-w-6xl px-5 py-12">
        <div className="mb-6 flex flex-wrap justify-between gap-3">
          <Link href="/admin/festa-junina" className="rounded-2xl bg-white px-5 py-3 text-sm font-bold text-green-950 shadow-sm" prefetch={false}>← Voltar ao admin</Link>
          <Link href="/admin/festa-junina/cardapio/novo" className="rounded-2xl bg-green-900 px-5 py-3 text-sm font-black text-white shadow-sm" prefetch={false}>Novo item</Link>
        </div>

        <h1 className="text-3xl font-black text-green-950">Cardápio e ficha técnica</h1>
        <p className="mt-2 max-w-3xl text-stone-600">Cadastre itens do cardápio, consumo estimado e ficha técnica de insumos. O planejamento usa estes dados para sugerir compras.</p>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Link href="/admin/festa-junina/cliente-resumo" className="rounded-3xl border border-green-100 bg-white p-5 shadow-sm transition hover:bg-green-50" prefetch={false}>
            <p className="text-lg font-black text-green-950">Cardápio de vendas</p>
            <p className="mt-2 text-sm text-stone-600">Tela para cliente, garçom ou caixa registrar consumo individual, por grupo ou mesa.</p>
          </Link>
          <Link href="/admin/festa-junina/cardapio" className="rounded-3xl border border-green-100 bg-white p-5 shadow-sm transition hover:bg-green-50" prefetch={false}>
            <p className="text-lg font-black text-green-950">Cardápio de preparo</p>
            <p className="mt-2 text-sm text-stone-600">Ficha técnica, receita, insumos e consumo médio por pessoa.</p>
          </Link>
        </div>

        <div className="mt-8 overflow-x-auto rounded-3xl bg-white shadow-sm">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="bg-green-950 text-white"><tr><th className="p-3">Item</th><th className="p-3">Categoria</th><th className="p-3">Consumo adulto</th><th className="p-3">Consumo criança</th><th className="p-3">Status</th><th className="p-3">Ações</th></tr></thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-stone-100 last:border-0">
                  <td className="p-3 font-black text-green-950">{item.item_name}</td>
                  <td className="p-3">{item.category}</td>
                  <td className="p-3">{item.consumption_per_adult} {item.unit_label}</td>
                  <td className="p-3">{item.consumption_per_child} {item.unit_label}</td>
                  <td className="p-3">{item.active ? "Ativo" : "Inativo"}</td>
                  <td className="p-3"><Link href={`/admin/festa-junina/cardapio/${item.id}`} className="font-black text-green-800 underline" prefetch={false}>Editar ficha técnica</Link></td>
                </tr>
              ))}
              {items.length === 0 ? <tr><td colSpan={6} className="p-6 text-center text-stone-500">Nenhum item cadastrado.</td></tr> : null}
            </tbody>
          </table>
        </div>
      </section>
    </AdminPageShell>
  );
}
