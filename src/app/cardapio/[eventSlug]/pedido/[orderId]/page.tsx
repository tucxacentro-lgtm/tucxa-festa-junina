import QRCode from "qrcode";
import { notFound } from "next/navigation";
import { createSupabaseAdminClient } from "@/lib/supabaseServer";
import { formatCurrency } from "@/lib/format";
import { buildStaticPixPayload } from "@/lib/pix";
import { confirmPublicConsumptionDelivery, registerPublicConsumptionPayment } from "../../actions";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ eventSlug: string; orderId: string }>; searchParams?: Promise<{ saved?: string }> };

type Order = {
  id: string;
  event_id: string;
  customer_name: string | null;
  table_label: string | null;
  total_amount: number | string;
  payment_status: string;
  delivery_status: string;
};

type OrderItem = { id: string; item_name: string; quantity: number | string; unit_price: number | string; total_price: number | string };

type EventRow = { slug: string; pix_key: string | null; pix_receiver_name: string | null };

async function getData(eventSlug: string, orderId: string) {
  const supabase = createSupabaseAdminClient();
  const { data: order } = await supabase.from("event_consumption_orders").select("*").eq("id", orderId).maybeSingle();
  if (!order) return null;
  const [{ data: items }, { data: event }] = await Promise.all([
    supabase.from("event_consumption_order_items").select("id, item_name, quantity, unit_price, total_price").eq("order_id", orderId).order("created_at"),
    supabase.from("events").select("slug, pix_key, pix_receiver_name").eq("id", (order as Order).event_id).maybeSingle(),
  ]);
  if (!event || event.slug !== eventSlug) return null;
  return { order: order as Order, items: (items ?? []) as OrderItem[], event: event as EventRow };
}

function statusLabel(value: string) {
  const labels: Record<string, string> = { pending: "Pendente", registered: "Registrado", proof_sent: "Comprovante enviado", paid: "Pago", delivered: "Entregue" };
  return labels[value] ?? value;
}

export default async function PublicConsumptionOrderPage({ params, searchParams }: PageProps) {
  const { eventSlug, orderId } = await params;
  const query = await searchParams;
  const data = await getData(eventSlug, orderId);
  if (!data) notFound();
  const { order, items, event } = data;
  const pixKey = event.pix_key ?? "58.392.598/0001-91";
  const pixReceiver = event.pix_receiver_name ?? "Tucxa";
  const qrCode = await QRCode.toDataURL(buildStaticPixPayload(pixKey, Number(order.total_amount ?? 0)), { margin: 1, width: 240 });

  return (
    <main className="min-h-screen bg-[#fff9e6] text-green-950">
      <section className="mx-auto max-w-3xl px-4 py-6">
        <div className="rounded-[2rem] bg-white p-5 shadow-sm">
          <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-black text-green-900">Pedido criado</span>
          <h1 className="mt-4 text-3xl font-black">Pedido {order.id.slice(0, 8)}</h1>
          <p className="mt-2 text-sm text-stone-600">{order.customer_name || "Cliente"}{order.table_label ? ` · ${order.table_label}` : ""}</p>
          {query?.saved ? <div className="mt-4 rounded-2xl bg-green-50 p-4 text-sm font-bold text-green-900">Informação salva com sucesso.</div> : null}
        </div>

        <div className="mt-5 rounded-[2rem] bg-white p-5 shadow-sm">
          <h2 className="text-xl font-black">Itens</h2>
          <div className="mt-4 grid gap-2">
            {items.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-2xl bg-stone-50 p-3 text-sm">
                <div><strong>{item.item_name}</strong><p>{item.quantity} × {formatCurrency(item.unit_price)}</p></div>
                <strong>{formatCurrency(item.total_price)}</strong>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 rounded-[2rem] bg-white p-5 shadow-sm">
          <p className="text-sm font-bold text-stone-600">Total</p>
          <p className="text-4xl font-black">{formatCurrency(order.total_amount)}</p>
          <div className="mt-4 rounded-3xl bg-green-50 p-4 text-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrCode} alt="QR Code Pix" className="mx-auto rounded-2xl bg-white p-2" />
            <p className="mt-2 text-xs font-bold">Pix: {pixKey} · {pixReceiver}</p>
          </div>
          <form action={registerPublicConsumptionPayment.bind(null, eventSlug)} className="mt-5 grid gap-3" encType="multipart/form-data">
            <input type="hidden" name="order_id" value={order.id} />
            <input type="hidden" name="event_id" value={order.event_id} />
            <input type="hidden" name="amount" value={String(order.total_amount)} />
            <label className="grid gap-1 text-sm font-bold">Forma de pagamento
              <select name="method" className="rounded-2xl border border-stone-200 p-3 font-normal">
                <option value="pix">Pix</option>
                <option value="credit">Cartão de crédito</option>
                <option value="debit">Cartão de débito</option>
                <option value="cash">Dinheiro</option>
              </select>
            </label>
            <label className="grid gap-1 text-sm font-bold">Enviar comprovante/recibo
              <input name="proof_file" type="file" className="rounded-2xl border border-stone-200 p-3 font-normal" />
            </label>
            <textarea name="notes" className="min-h-20 rounded-2xl border border-stone-200 p-3" placeholder="Observação do pagamento, se necessário." />
            <button className="rounded-2xl bg-green-900 px-5 py-4 font-black text-white">Registrar comprovante</button>
          </form>
        </div>

        <div className="mt-5 rounded-[2rem] bg-white p-5 shadow-sm">
          <h2 className="text-xl font-black">Status</h2>
          <p className="mt-2 text-sm">Pagamento: <strong>{statusLabel(order.payment_status)}</strong></p>
          <p className="text-sm">Entrega: <strong>{statusLabel(order.delivery_status)}</strong></p>
          <form action={confirmPublicConsumptionDelivery.bind(null, eventSlug)} className="mt-4">
            <input type="hidden" name="order_id" value={order.id} />
            <button className="w-full rounded-2xl bg-green-900 px-5 py-4 font-black text-white">Confirmo que recebi meu pedido</button>
          </form>
        </div>
      </section>
    </main>
  );
}
