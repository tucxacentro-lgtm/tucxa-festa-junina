import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseAdminClient } from "@/lib/supabaseServer";
import { formatCurrency } from "@/lib/format";
import { buildPixCopyPastePayload } from "@/lib/pix";
import { PublicConsumptionPaymentForm } from "@/components/public-consumption-payment-form";
import { registerPublicConsumptionPayment } from "../../actions";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ eventSlug: string; orderId: string }>; searchParams?: Promise<{ saved?: string }> };

type Order = {
  id: string;
  event_id: string;
  customer_name: string | null;
  customer_phone: string | null;
  table_label: string | null;
  waiter_name: string | null;
  settlement_mode: string | null;
  total_amount: number | string;
  payment_status: string;
  delivery_status: string;
  status: string;
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
  const labels: Record<string, string> = {
    pending: "Pendente",
    registered: "Registrado",
    proof_sent: "Comprovante enviado",
    paid: "Pago",
    delivered: "Entregue",
    received: "Recebido",
    preparing: "Em preparo",
    ready: "Pronto",
    cancelled: "Cancelado",
  };
  return labels[value] ?? value;
}

function settlementLabel(value?: string | null) {
  return value === "fechamento_final" ? "Pagamento somente no final" : "Pagamento pedido a pedido";
}

function cardapioBackUrl(eventSlug: string, order: Order) {
  const params = new URLSearchParams();
  if (order.table_label) params.set("mesa", order.table_label);
  if (order.customer_name) params.set("responsavel", order.customer_name);
  if (order.waiter_name) params.set("garcom", order.waiter_name);
  if (order.settlement_mode) params.set("fechamento", order.settlement_mode);
  const query = params.toString();
  return `/cardapio/${eventSlug}${query ? `?${query}` : ""}`;
}

export default async function PublicConsumptionOrderPage({ params, searchParams }: PageProps) {
  const { eventSlug, orderId } = await params;
  const query = await searchParams;
  const data = await getData(eventSlug, orderId);
  if (!data) notFound();
  const { order, items, event } = data;
  const isFinalSettlement = order.settlement_mode === "fechamento_final";
  const isTableService = Boolean(order.table_label || order.waiter_name || order.settlement_mode);
  const pixKey = event.pix_key ?? "58.392.598/0001-91";
  const pixReceiver = event.pix_receiver_name ?? "Tucxa";
  const pixCopyPaste = buildPixCopyPastePayload({
    pixKey,
    amount: order.total_amount,
    receiverName: pixReceiver,
    receiverCity: "CAMPINAS",
    txid: `PED${order.id.slice(0, 12)}`,
    description: `Pedido ${order.id.slice(0, 8)}`,
  });

  return (
    <main className="min-h-screen bg-[#fff9e6] text-green-950">
      <section className="mx-auto max-w-3xl px-4 py-6">
        <div className="mb-4 flex flex-wrap gap-3">
          {isTableService ? (
            <Link href="/gestao-evento/garcom" className="rounded-full bg-white px-5 py-3 text-sm font-black text-green-950 shadow-sm" prefetch={false}>
              ← Voltar para Garçom/Atendimento
            </Link>
          ) : (
            <Link href={`/cardapio/${eventSlug}`} className="rounded-full bg-white px-5 py-3 text-sm font-black text-green-950 shadow-sm" prefetch={false}>
              ← Voltar ao cardápio
            </Link>
          )}
          {isTableService ? (
            <Link href={cardapioBackUrl(eventSlug, order)} className="rounded-full bg-green-900 px-5 py-3 text-sm font-black text-white shadow-sm" prefetch={false}>
              Novo Pedido
            </Link>
          ) : null}
        </div>

        <div className="rounded-[2rem] bg-white p-5 shadow-sm">
          <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-black text-green-900">Pedido criado</span>
          <h1 className="mt-4 text-3xl font-black">Pedido {order.id.slice(0, 8)}</h1>
          <p className="mt-2 text-sm text-stone-600">{order.customer_name || "Cliente"}{order.table_label ? ` · ${order.table_label}` : ""}</p>
          {order.waiter_name ? <p className="mt-1 text-sm text-stone-600">Garçom: <strong>{order.waiter_name}</strong></p> : null}
          <p className="mt-1 text-sm text-stone-600">Fechamento: <strong>{settlementLabel(order.settlement_mode)}</strong></p>
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
          {isFinalSettlement ? (
            <div className="mt-5 rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-950">
              <p className="text-xs font-black uppercase tracking-wide">Fechamento final do cliente</p>
              <h2 className="mt-2 text-xl font-black text-green-950">Pagamento será feito no caixa ao final</h2>
              <p className="mt-2 leading-relaxed">
                Este pedido foi registrado para ser somado ao fechamento final do responsável. Por isso, não exibimos QR Code Pix ou Pix Copia e Cola neste pedido individual.
              </p>
              <p className="mt-3 rounded-2xl bg-white p-3 text-stone-700">
                Quando o responsável for fechar a conta, acesse <strong>Gestão do Evento &gt; Caixa</strong> para gerar o Pix com o total pendente.
              </p>
            </div>
          ) : (
            <PublicConsumptionPaymentForm
              eventSlug={eventSlug}
              orderId={order.id}
              eventId={order.event_id}
              amount={order.total_amount}
              pixCopyPaste={pixCopyPaste}
              pixKey={pixKey}
              pixReceiver={pixReceiver}
              action={registerPublicConsumptionPayment}
            />
          )}
        </div>

        <div className="mt-5 rounded-[2rem] bg-white p-5 shadow-sm">
          <h2 className="text-xl font-black">Status</h2>
          <p className="mt-2 text-sm">Pagamento: <strong>{statusLabel(order.payment_status)}</strong></p>
          <p className="text-sm">Entrega: <strong>{statusLabel(order.delivery_status)}</strong></p>
          <p className="mt-4 rounded-2xl bg-amber-50 p-3 text-sm text-amber-950">
            O recebimento será controlado pela equipe com as fichas em papel. O cliente não precisa confirmar a entrega no sistema.
          </p>
        </div>
      </section>
    </main>
  );
}
