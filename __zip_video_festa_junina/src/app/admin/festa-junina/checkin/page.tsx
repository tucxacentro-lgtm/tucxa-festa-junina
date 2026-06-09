import Link from "next/link";
import { CheckCircle2, Search, UsersRound } from "lucide-react";
import { AdminPageShell } from "@/components/admin-page-shell";
import { PaymentStatusBadge } from "@/components/payment-status-badge";
import { requireAdmin } from "@/lib/auth";
import { getCurrentEventForAdmin } from "@/lib/current-event";
import { createSupabaseAdminClient } from "@/lib/supabaseServer";
import type { TicketOrder } from "@/types/festa-junina";
import { markTicketCheckin } from "../atendimento/actions";

export const dynamic = "force-dynamic";

type CheckinRow = {
  ticket_order_id: string;
  status: string;
  checked_in_at: string | null;
  notes: string | null;
};

type PageProps = { searchParams?: Promise<{ q?: string }> };

async function getCheckinData(eventId: string, query?: string) {
  const supabase = createSupabaseAdminClient();
  let request = supabase.from("ticket_orders").select("*").eq("event_id", eventId).order("created_at", { ascending: false }).limit(120);
  if (query?.trim()) {
    const term = query.trim();
    request = request.or(`buyer_code.ilike.%${term}%,buyer_name.ilike.%${term}%,buyer_whatsapp.ilike.%${term}%`);
  }

  const [{ data: orders, error: orderError }, { data: checkins }] = await Promise.all([
    request,
    supabase.from("event_ticket_checkins").select("ticket_order_id, status, checked_in_at, notes").eq("event_id", eventId),
  ]);

  const checkinMap = new Map<string, CheckinRow>();
  for (const row of (checkins ?? []) as CheckinRow[]) checkinMap.set(row.ticket_order_id, row);

  return { orders: ((orders ?? []) as TicketOrder[]).map((order) => ({ ...order, checkin: checkinMap.get(order.id) })), error: orderError?.message ?? null };
}

export default async function CheckinPage({ searchParams }: PageProps) {
  await requireAdmin(["admin", "coordenador"], "/admin/festa-junina/checkin");
  const params = await searchParams;
  const event = await getCurrentEventForAdmin();
  const { orders, error } = await getCheckinData(event.id, params?.q);
  const checked = orders.filter((order) => order.checkin?.status === "checked_in").length;

  return (
    <AdminPageShell>
      <section className="mx-auto max-w-7xl px-5 py-10">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link href="/admin/festa-junina" className="rounded-full bg-white px-4 py-2 text-sm font-bold text-green-950 shadow-sm" prefetch={false}>← Painel do evento</Link>
          <a href="/admin/logout" className="rounded-full bg-white px-4 py-2 text-sm font-bold text-green-950 shadow-sm">Sair da gestão</a>
        </div>

        <div className="rounded-[2rem] border border-green-100 bg-white p-6 shadow-sm">
          <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-black text-green-900">Atendimento · Check-in</span>
          <h1 className="mt-4 text-3xl font-black text-green-950">Check-in de entrada</h1>
          <p className="mt-3 max-w-3xl text-stone-700">Conferência de código/QR Code, convite impresso ou lista manual. Use a busca para localizar por código, nome ou WhatsApp.</p>
          <form className="mt-5 flex max-w-2xl gap-2">
            <div className="flex flex-1 items-center gap-2 rounded-2xl border border-green-100 bg-stone-50 px-3 py-2">
              <Search className="h-4 w-4 text-stone-500" />
              <input name="q" defaultValue={params?.q ?? ""} placeholder="Buscar código, nome ou WhatsApp" className="min-w-0 flex-1 bg-transparent text-sm outline-none" />
            </div>
            <button className="rounded-2xl bg-green-900 px-5 py-3 text-sm font-black text-white">Buscar</button>
          </form>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl bg-white p-5 shadow-sm"><UsersRound className="h-6 w-6 text-green-800" /><p className="mt-2 text-3xl font-black text-green-950">{orders.length}</p><p className="text-sm text-stone-600">compras na lista</p></div>
          <div className="rounded-3xl bg-white p-5 shadow-sm"><CheckCircle2 className="h-6 w-6 text-green-800" /><p className="mt-2 text-3xl font-black text-green-950">{checked}</p><p className="text-sm text-stone-600">check-ins realizados</p></div>
          <div className="rounded-3xl bg-white p-5 shadow-sm"><p className="text-sm font-bold text-stone-500">Pendentes</p><p className="mt-2 text-3xl font-black text-green-950">{Math.max(orders.length - checked, 0)}</p></div>
        </div>

        {error ? <div className="mt-6 rounded-3xl bg-red-50 p-5 text-sm font-bold text-red-800">Erro ao carregar compras: {error}</div> : null}

        <div className="mt-6 overflow-hidden rounded-[2rem] bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] text-left text-sm">
              <thead className="bg-green-950 text-white"><tr><th className="p-4">Código</th><th className="p-4">Comprador</th><th className="p-4">WhatsApp</th><th className="p-4">Pessoas</th><th className="p-4">Pagamento</th><th className="p-4">Entrada</th><th className="p-4">Ação</th></tr></thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-stone-100 align-top last:border-0">
                    <td className="p-4 font-black text-green-950">{order.buyer_code}</td>
                    <td className="p-4">{order.buyer_name}</td>
                    <td className="p-4">{order.buyer_whatsapp}</td>
                    <td className="p-4">{order.adults_quantity} adulto(s) · {order.children_quantity} criança(s)</td>
                    <td className="p-4"><PaymentStatusBadge status={order.payment_status} /></td>
                    <td className="p-4">{order.checkin?.status === "checked_in" ? <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-black text-green-900">Entrada registrada</span> : <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-900">Pendente</span>}</td>
                    <td className="p-4">
                      <form action={markTicketCheckin} className="flex min-w-60 flex-col gap-2">
                        <input type="hidden" name="order_id" value={order.id} />
                        <input type="hidden" name="buyer_code" value={order.buyer_code} />
                        <input type="hidden" name="buyer_name" value={order.buyer_name} />
                        <input name="notes" placeholder="Observação opcional" className="rounded-xl border border-stone-200 px-3 py-2 text-xs" />
                        <button className="rounded-xl bg-green-900 px-3 py-2 text-xs font-black text-white">Registrar entrada</button>
                      </form>
                    </td>
                  </tr>
                ))}
                {orders.length === 0 ? <tr><td colSpan={7} className="p-8 text-center text-stone-500">Nenhuma compra encontrada.</td></tr> : null}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </AdminPageShell>
  );
}
