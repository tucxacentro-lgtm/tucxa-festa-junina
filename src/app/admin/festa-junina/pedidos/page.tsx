import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { createSupabaseAdminClient, hasSupabaseServiceRoleKey } from "@/lib/supabaseServer";
import { formatCurrency } from "@/lib/format";
import type { TicketOrder } from "@/types/festa-junina";

export const dynamic = "force-dynamic";

async function getOrders() {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("ticket_orders")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    return { orders: [] as TicketOrder[], error: error.message };
  }

  return { orders: (data ?? []) as TicketOrder[], error: null };
}

export default async function AdminPedidosPage() {
  const { orders, error } = await getOrders();
  const total = orders.reduce((sum, order) => sum + Number(order.total_amount ?? 0), 0);
  const bingoOrders = orders.filter((order) => order.includes_bingo).length;

  return (
    <main className="min-h-screen bg-amber-50 text-stone-900">
      <SiteHeader />
      <section className="mx-auto max-w-6xl px-5 py-12">
        <div className="mb-6 flex justify-end">
          <a href="/admin/logout" className="rounded-full bg-white px-4 py-2 text-sm font-bold text-green-950 shadow-sm transition hover:bg-amber-100">
            Sair do admin
          </a>
        </div>
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-black text-green-950">Compras e comprovantes</h1>
            <p className="mt-2 text-stone-600">Lista inicial para acompanhamento administrativo.</p>
          </div>
          <Link href="/admin/festa-junina" className="rounded-2xl bg-white px-5 py-3 text-sm font-bold text-green-950 shadow-sm">
            Voltar ao admin
          </Link>
        </div>

        {!hasSupabaseServiceRoleKey() ? (
          <div className="mt-6 rounded-3xl border border-amber-300 bg-amber-100 p-5 text-sm text-amber-900">
            Defina SUPABASE_SERVICE_ROLE_KEY no .env.local e na Vercel para o admin conseguir ler todas as compras com segurança.
          </div>
        ) : null}

        {error ? (
          <div className="mt-6 rounded-3xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
            Erro ao carregar compras: {error}
          </div>
        ) : null}

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl bg-white p-5 shadow-sm">
            <p className="text-sm font-bold text-stone-500">Compras registradas</p>
            <p className="mt-2 text-3xl font-black text-green-950">{orders.length}</p>
          </div>
          <div className="rounded-3xl bg-white p-5 shadow-sm">
            <p className="text-sm font-bold text-stone-500">Total registrado</p>
            <p className="mt-2 text-3xl font-black text-green-950">{formatCurrency(total)}</p>
          </div>
          <div className="rounded-3xl bg-white p-5 shadow-sm">
            <p className="text-sm font-bold text-stone-500">Compras com bingo</p>
            <p className="mt-2 text-3xl font-black text-green-950">{bingoOrders}</p>
          </div>
        </div>

        <div className="mt-8 overflow-hidden rounded-3xl bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-green-950 text-white">
                <tr>
                  <th className="p-4">Código</th>
                  <th className="p-4">Comprador</th>
                  <th className="p-4">E-mail</th>
                  <th className="p-4">Total</th>
                  <th className="p-4">Pagamento</th>
                  <th className="p-4">Bingo</th>
                  <th className="p-4">Criado em</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-stone-100 last:border-0">
                    <td className="p-4 font-bold text-green-950">
                      <Link href={`/minha-compra/${order.buyer_code}`} className="underline decoration-green-300 underline-offset-4">
                        {order.buyer_code}
                      </Link>
                    </td>
                    <td className="p-4">{order.buyer_name}</td>
                    <td className="p-4">{order.buyer_email}</td>
                    <td className="p-4 font-bold">{formatCurrency(order.total_amount)}</td>
                    <td className="p-4">{order.payment_status}</td>
                    <td className="p-4">{order.includes_bingo ? `${order.bingo_cards_quantity} cartela(s)` : "Não"}</td>
                    <td className="p-4">{new Date(order.created_at).toLocaleString("pt-BR")}</td>
                  </tr>
                ))}
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-stone-500">Nenhuma compra registrada ainda.</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
}
