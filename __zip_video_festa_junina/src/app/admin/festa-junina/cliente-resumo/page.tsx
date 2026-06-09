import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { AdminPageShell } from "@/components/admin-page-shell";
import { createSupabaseAdminClient } from "@/lib/supabaseServer";
import { getCurrentEventForAdmin } from "@/lib/current-event";
import { formatCurrency } from "@/lib/format";
import { createConsumptionOrder } from "./actions";

export const dynamic = "force-dynamic";

type SalesItem = {
  id: string;
  name: string;
  category: string;
  description: string | null;
  price: number | string;
  unit_label: string;
  requires_preparation: boolean;
  active: boolean;
};

type OrderSummary = {
  id: string;
  customer_name: string | null;
  table_label: string | null;
  total_amount: number | string;
  status: string;
  payment_status: string;
  created_at: string;
};

async function getData() {
  const event = await getCurrentEventForAdmin();
  const supabase = createSupabaseAdminClient();
  const [{ data: items }, { data: orders }] = await Promise.all([
    supabase.from("event_sales_menu_items").select("*").eq("event_id", event.id).eq("active", true).order("category").order("sort_order"),
    supabase.from("event_consumption_orders").select("id, customer_name, table_label, total_amount, status, payment_status, created_at").eq("event_id", event.id).order("created_at", { ascending: false }).limit(10),
  ]);
  return { event, items: (items ?? []) as SalesItem[], orders: (orders ?? []) as OrderSummary[] };
}

function statusLabel(value: string) {
  const labels: Record<string, string> = { received: "Recebido", preparing: "Em preparo", ready: "Pronto", delivered: "Entregue", pending: "Pendente", proof_sent: "Comprovante enviado", paid: "Pago", registered: "Registrado" };
  return labels[value] ?? value;
}

export default async function ClienteResumoPage() {
  await requireAdmin(["admin", "coordenador", "caixa", "garcom"], "/admin/festa-junina/cliente-resumo");
  const { event, items, orders } = await getData();
  const categories = Array.from(new Set(items.map((item) => item.category)));

  return (
    <AdminPageShell>
      <section className="mx-auto max-w-7xl px-5 py-10">
        <div className="rounded-[2rem] border border-green-100 bg-white p-6 shadow-sm">
          <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-black text-green-900">Cardápio de vendas</span>
          <h1 className="mt-4 text-3xl font-black text-green-950">Consumo de cliente, grupo ou mesa</h1>
          <p className="mt-3 max-w-4xl text-stone-700">
            Use esta tela para registrar consumo individual, por família ou por mesa durante o evento. O pedido gera total para Pix, permite comprovante e confirmação de entrega.
          </p>
        </div>

        <form action={createConsumptionOrder} className="mt-8 rounded-[2rem] border border-green-100 bg-white p-6 shadow-sm">
          <input type="hidden" name="event_id" value={event.id} />
          <h2 className="text-2xl font-black text-green-950">Novo pedido de consumo</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-4">
            <label className="grid gap-1 text-sm font-bold text-green-950">Tipo
              <select name="order_mode" className="rounded-2xl border border-stone-200 p-3 font-normal">
                <option value="individual">Individual</option>
                <option value="group">Grupo/família</option>
                <option value="table">Mesa</option>
              </select>
            </label>
            <label className="grid gap-1 text-sm font-bold text-green-950">Cliente/responsável<input name="customer_name" className="rounded-2xl border border-stone-200 p-3 font-normal" placeholder="Nome" /></label>
            <label className="grid gap-1 text-sm font-bold text-green-950">WhatsApp<input name="customer_phone" className="rounded-2xl border border-stone-200 p-3 font-normal" placeholder="Opcional" /></label>
            <label className="grid gap-1 text-sm font-bold text-green-950">Mesa/grupo<input name="table_label" className="rounded-2xl border border-stone-200 p-3 font-normal" placeholder="Ex.: Mesa 4" /></label>
          </div>

          {items.length === 0 ? (
            <div className="mt-6 rounded-2xl bg-amber-50 p-4 text-sm font-bold text-amber-900">Nenhum item ativo no cardápio de vendas. Rode a migration 014 ou cadastre itens no cardápio.</div>
          ) : (
            <div className="mt-6 grid gap-6">
              {categories.map((category) => (
                <div key={category} className="rounded-3xl bg-stone-50 p-4">
                  <h3 className="text-lg font-black text-green-950">{category}</h3>
                  <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {items.filter((item) => item.category === category).map((item) => (
                      <label key={item.id} className="rounded-2xl border border-stone-100 bg-white p-4 text-sm text-stone-700">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-black text-green-950">{item.name}</p>
                            {item.description ? <p className="mt-1 text-xs text-stone-500">{item.description}</p> : null}
                            <p className="mt-2 font-black text-green-900">{formatCurrency(item.price)} / {item.unit_label}</p>
                          </div>
                          {item.requires_preparation ? <span className="rounded-full bg-amber-50 px-2 py-1 text-[0.65rem] font-black text-amber-900">preparo</span> : null}
                        </div>
                        <input name={`qty_${item.id}`} type="number" min="0" step="1" defaultValue="0" className="mt-3 w-full rounded-2xl border border-stone-200 p-3 font-normal" />
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          <label className="mt-5 grid gap-1 text-sm font-bold text-green-950">Observações do pedido<textarea name="notes" className="min-h-20 rounded-2xl border border-stone-200 p-3 font-normal" /></label>
          <button className="mt-5 rounded-2xl bg-green-900 px-5 py-3 font-black text-white">Criar pedido e calcular total</button>
        </form>

        <div className="mt-8 rounded-[2rem] border border-green-100 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-2xl font-black text-green-950">Últimos pedidos</h2>
            <Link href="/admin/festa-junina/atendimento" className="rounded-full border border-green-100 bg-white px-4 py-2 text-sm font-black text-green-950">Ver fluxo de atendimento</Link>
          </div>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-green-950 text-white"><tr><th className="p-3">Pedido</th><th className="p-3">Cliente/mesa</th><th className="p-3">Total</th><th className="p-3">Status</th><th className="p-3">Pagamento</th><th className="p-3">Ação</th></tr></thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-stone-100 last:border-0">
                    <td className="p-3 font-mono text-xs">{order.id.slice(0, 8)}</td>
                    <td className="p-3">{order.customer_name || order.table_label || "Sem identificação"}</td>
                    <td className="p-3 font-black text-green-950">{formatCurrency(order.total_amount)}</td>
                    <td className="p-3">{statusLabel(order.status)}</td>
                    <td className="p-3">{statusLabel(order.payment_status)}</td>
                    <td className="p-3"><Link href={`/admin/festa-junina/consumo/${order.id}`} className="font-black text-green-800 underline">Abrir</Link></td>
                  </tr>
                ))}
                {orders.length === 0 ? <tr><td colSpan={6} className="p-6 text-center text-stone-500">Nenhum pedido de consumo registrado.</td></tr> : null}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </AdminPageShell>
  );
}
