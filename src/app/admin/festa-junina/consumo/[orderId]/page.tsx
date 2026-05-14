import QRCode from "qrcode";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { AdminPageShell } from "@/components/admin-page-shell";
import { createSupabaseAdminClient } from "@/lib/supabaseServer";
import { formatCurrency } from "@/lib/format";
import { buildStaticPixPayload } from "@/lib/pix";
import { confirmConsumptionDelivery, registerConsumptionPayment } from "../../cliente-resumo/actions";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ orderId: string }>; searchParams?: Promise<{ saved?: string }> };

type Order = {
  id: string;
  event_id: string;
  customer_name: string | null;
  customer_phone: string | null;
  table_label: string | null;
  order_mode: string;
  total_amount: number | string;
  status: string;
  payment_status: string;
  delivery_status: string;
  notes: string | null;
};

type OrderItem = { id: string; item_name: string; quantity: number | string; unit_price: number | string; total_price: number | string; status: string };

type Payment = { id: string; method: string; amount: number | string; status: string; proof_file_path: string | null; created_at: string };

async function getData(orderId: string) {
  const supabase = createSupabaseAdminClient();
  const { data: order } = await supabase.from("event_consumption_orders").select("*").eq("id", orderId).maybeSingle();
  if (!order) return null;
  const [{ data: items }, { data: payments }, { data: event }] = await Promise.all([
    supabase.from("event_consumption_order_items").select("*").eq("order_id", orderId).order("created_at"),
    supabase.from("event_consumption_payments").select("*").eq("order_id", orderId).order("created_at", { ascending: false }),
    supabase.from("events").select("pix_key, pix_receiver_name").eq("id", (order as Order).event_id).maybeSingle(),
  ]);
  return { order: order as Order, items: (items ?? []) as OrderItem[], payments: (payments ?? []) as Payment[], pixKey: event?.pix_key ?? "58.392.598/0001-91", pixReceiver: event?.pix_receiver_name ?? "Tucxa" };
}

function methodLabel(value: string) {
  const labels: Record<string, string> = { pix: "Pix", credit: "Cartão de crédito", debit: "Cartão de débito", cash: "Dinheiro", free: "Cortesia" };
  return labels[value] ?? value;
}

export default async function ConsumptionOrderPage({ params, searchParams }: PageProps) {
  await requireAdmin(["admin", "coordenador", "caixa", "garcom"], "/admin/festa-junina/cliente-resumo");
  const { orderId } = await params;
  const paramsQuery = await searchParams;
  const data = await getData(orderId);
  if (!data) notFound();
  const { order, items, payments, pixKey, pixReceiver } = data;
  const qrCode = await QRCode.toDataURL(buildStaticPixPayload(pixKey, Number(order.total_amount ?? 0)), { margin: 1, width: 220 });

  return (
    <AdminPageShell>
      <section className="mx-auto max-w-6xl px-5 py-10">
        <div className="rounded-[2rem] border border-green-100 bg-white p-6 shadow-sm">
          <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-black text-green-900">Pedido de consumo</span>
          <h1 className="mt-4 text-3xl font-black text-green-950">Pedido {order.id.slice(0, 8)}</h1>
          <p className="mt-2 text-stone-700">{order.customer_name || "Cliente não identificado"} {order.table_label ? `· ${order.table_label}` : ""}</p>
          {paramsQuery?.saved ? <div className="mt-4 rounded-2xl bg-green-50 p-4 text-sm font-bold text-green-900">Informação salva com sucesso.</div> : null}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[2rem] border border-green-100 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-black text-green-950">Itens do pedido</h2>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-green-950 text-white"><tr><th className="p-3">Item</th><th className="p-3">Qtd.</th><th className="p-3">Unit.</th><th className="p-3">Total</th></tr></thead>
                <tbody>
                  {items.map((item) => <tr key={item.id} className="border-b border-stone-100 last:border-0"><td className="p-3 font-bold text-green-950">{item.item_name}</td><td className="p-3">{item.quantity}</td><td className="p-3">{formatCurrency(item.unit_price)}</td><td className="p-3 font-black">{formatCurrency(item.total_price)}</td></tr>)}
                </tbody>
              </table>
            </div>
            <form action={confirmConsumptionDelivery} className="mt-5">
              <input type="hidden" name="order_id" value={order.id} />
              <button className="rounded-2xl bg-green-900 px-5 py-3 font-black text-white">Cliente confirmou recebimento</button>
            </form>
          </div>

          <div className="rounded-[2rem] border border-green-100 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-black text-green-950">Pagamento</h2>
            <p className="mt-2 text-sm text-stone-600">Total do pedido</p>
            <p className="text-4xl font-black text-green-950">{formatCurrency(order.total_amount)}</p>
            <div className="mt-4 rounded-3xl bg-green-50 p-4 text-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrCode} alt="QR Code Pix" className="mx-auto rounded-2xl bg-white p-2" />
              <p className="mt-2 text-xs font-bold text-green-950">Pix: {pixKey} · {pixReceiver}</p>
            </div>
            <form action={registerConsumptionPayment} className="mt-5 grid gap-3" encType="multipart/form-data">
              <input type="hidden" name="order_id" value={order.id} />
              <input type="hidden" name="event_id" value={order.event_id} />
              <input type="hidden" name="amount" value={String(order.total_amount)} />
              <label className="grid gap-1 text-sm font-bold text-green-950">Forma de pagamento
                <select name="method" className="rounded-2xl border border-stone-200 p-3 font-normal">
                  <option value="pix">Pix</option>
                  <option value="credit">Cartão de crédito</option>
                  <option value="debit">Cartão de débito</option>
                  <option value="cash">Dinheiro</option>
                </select>
              </label>
              <label className="grid gap-1 text-sm font-bold text-green-950">Upload do comprovante/recibo
                <input name="proof_file" type="file" className="rounded-2xl border border-stone-200 p-3 font-normal" />
              </label>
              <label className="grid gap-1 text-sm font-bold text-green-950">Observações
                <textarea name="notes" className="min-h-20 rounded-2xl border border-stone-200 p-3 font-normal" placeholder="Para dinheiro/cartão, informe quem recebeu e referência do comprovante." />
              </label>
              <button className="rounded-2xl bg-green-900 px-5 py-3 font-black text-white">Registrar pagamento/comprovante</button>
            </form>
          </div>
        </div>

        <div className="mt-8 rounded-[2rem] border border-green-100 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-black text-green-950">Pagamentos registrados</h2>
          <div className="mt-4 grid gap-3">
            {payments.map((payment) => <div key={payment.id} className="rounded-2xl bg-stone-50 p-4 text-sm"><strong>{methodLabel(payment.method)}</strong> · {formatCurrency(payment.amount)} · {payment.status}{payment.proof_file_path ? <p className="mt-1 font-mono text-xs text-stone-500">{payment.proof_file_path}</p> : null}</div>)}
            {payments.length === 0 ? <p className="text-sm text-stone-500">Nenhum pagamento registrado ainda.</p> : null}
          </div>
        </div>
      </section>
    </AdminPageShell>
  );
}
