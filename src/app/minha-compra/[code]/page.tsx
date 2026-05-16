import Link from "next/link";
import QRCode from "qrcode";
import { SiteHeader } from "@/components/site-header";
import { ShareReferralCard } from "@/components/share-referral-card";
import { getPaymentStatusLabel, PaymentStatusBadge } from "@/components/payment-status-badge";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { formatCurrency } from "@/lib/format";
import { deliveryStatusLabel, getConsumptionOrdersForEvent, paymentStatusLabel } from "@/lib/operation-dashboard";
import { getServerPublicSiteUrl } from "@/lib/site-url";
import type { TicketOrder } from "@/types/festa-junina";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ code: string }>;
};

type ReferralRule = {
  name: string;
  qualifying_paid_orders: number;
  reward_description: string;
  active: boolean;
};

async function getOrder(code: string) {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("ticket_orders")
    .select("*")
    .eq("buyer_code", code)
    .single();

  if (error || !data) return null;
  return data as TicketOrder;
}


function onlyDigits(value: string | null | undefined) {
  return (value ?? "").replace(/\D/g, "");
}

function samePhone(left: string | null | undefined, right: string | null | undefined) {
  const a = onlyDigits(left);
  const b = onlyDigits(right);
  if (!a || !b) return false;
  return a.endsWith(b) || b.endsWith(a);
}

async function getReferralInfo(code: string) {
  const supabase = createSupabaseServerClient();

  const { count: referredPaidCount } = await supabase
    .from("ticket_orders")
    .select("id", { count: "exact", head: true })
    .eq("referred_by_code", code)
    .eq("payment_status", "paid");

  const { data: rules } = await supabase
    .from("referral_reward_rules")
    .select("name, qualifying_paid_orders, reward_description, active")
    .eq("active", true)
    .order("qualifying_paid_orders", { ascending: true });

  const paidCount = referredPaidCount ?? 0;
  const earnedRewards = ((rules ?? []) as ReferralRule[])
    .filter((rule) => paidCount >= Number(rule.qualifying_paid_orders ?? 0))
    .map((rule) => rule.reward_description || rule.name);

  return { referredPaidCount: paidCount, earnedRewards };
}

export default async function MinhaCompraCodigoPage({ params }: PageProps) {
  const { code } = await params;
  const order = await getOrder(code);

  if (!order) {
    return (
      <main className="min-h-screen bg-amber-50 text-stone-900">
        <SiteHeader />
        <section className="mx-auto max-w-3xl px-5 py-16">
          <div className="rounded-3xl bg-white p-8 shadow-sm">
            <h1 className="text-3xl font-black text-green-950">Compra não encontrada</h1>
            <p className="mt-3 text-stone-600">Confira o código e tente novamente.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/minha-compra" className="rounded-2xl bg-green-900 px-5 py-3 font-bold text-white">
                Consultar outro código
              </Link>
              <Link href="/festa-junina" className="rounded-2xl bg-white px-5 py-3 font-bold text-green-950 shadow-sm">
                Voltar para a festa
              </Link>
            </div>
          </div>
        </section>
      </main>
    );
  }

  const baseUrl = await getServerPublicSiteUrl();
  const consumptionOrders = (await getConsumptionOrdersForEvent(order.event_id)).filter((consumptionOrder) => {
    if (samePhone(consumptionOrder.customer_phone, order.buyer_whatsapp)) return true;
    if (!consumptionOrder.customer_phone && consumptionOrder.customer_name && order.buyer_name) {
      return consumptionOrder.customer_name.trim().toLowerCase() === order.buyer_name.trim().toLowerCase();
    }
    return false;
  });
  const myPurchaseUrl = `${baseUrl}/minha-compra/${order.buyer_code}`;
  const referralUrl = `${baseUrl}/festa-junina?ref=${encodeURIComponent(order.buyer_code)}#reserva`;
  const qrCode = await QRCode.toDataURL(myPurchaseUrl, { margin: 1, width: 240 });
  const referralInfo = await getReferralInfo(order.buyer_code);

  return (
    <main className="min-h-screen bg-amber-50 text-stone-900">
      <SiteHeader />
      <section className="mx-auto max-w-4xl px-5 py-12">
        <div className="mb-5 flex flex-wrap gap-3">
          <Link href="/festa-junina" className="rounded-2xl bg-white px-5 py-3 text-sm font-black text-green-950 shadow-sm">
            ← Voltar para a festa
          </Link>
          <Link href="/minha-compra" className="rounded-2xl bg-white px-5 py-3 text-sm font-black text-green-950 shadow-sm">
            Consultar outro código
          </Link>
        </div>

        <div className="rounded-[2rem] bg-white p-6 shadow-sm md:p-8">
          <div className="grid gap-8 md:grid-cols-[1fr_260px] md:items-start">
            <div>
              <h1 className="text-3xl font-black text-green-950">Minha compra</h1>
              <p className="mt-3 text-stone-600">
                Apresente este código/QR Code na entrada. Após a próxima etapa, esta área também mostrará seu consumo durante a festa.
              </p>
              <div className="mt-6 rounded-3xl bg-green-950 p-5 text-white">
                <p className="text-sm font-bold text-amber-200">Código do comprador</p>
                <p className="mt-2 break-words text-3xl font-black">{order.buyer_code}</p>
              </div>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrCode} alt="QR Code da compra" className="rounded-3xl bg-white p-3 shadow-sm" />
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl bg-amber-50 p-5">
              <h2 className="font-black text-green-950">Dados da compra</h2>
              <div className="mt-4 space-y-2 text-sm text-stone-700">
                <p><strong>Comprador:</strong> {order.buyer_name}</p>
                <p><strong>E-mail:</strong> {order.buyer_email || "Não informado"}</p>
                <p><strong>WhatsApp:</strong> {order.buyer_whatsapp}</p>
                <p><strong>Total:</strong> {formatCurrency(order.total_amount)}</p>
              </div>
            </div>

            <div className="rounded-3xl bg-amber-50 p-5">
              <h2 className="font-black text-green-950">Status</h2>
              <div className="mt-4 space-y-2 text-sm text-stone-700">
                <p className="flex items-center gap-2"><strong>Pagamento:</strong> <PaymentStatusBadge status={order.payment_status} /></p>
                <p className="text-xs text-stone-500">{getPaymentStatusLabel(order.payment_status)}</p>
                {order.payment_rejection_reason ? <p><strong>Motivo:</strong> {order.payment_rejection_reason}</p> : null}
                <p><strong>Adultos:</strong> {order.adults_quantity}</p>
                <p><strong>Crianças:</strong> {order.children_quantity}</p>
                <p><strong>Bingo:</strong> {order.includes_bingo ? `${order.bingo_cards_quantity} cartela(s)` : "Não incluído"}</p>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <ShareReferralCard
              buyerCode={order.buyer_code}
              referralUrl={referralUrl}
              referredPaidCount={referralInfo.referredPaidCount}
              earnedRewards={referralInfo.earnedRewards}
            />
          </div>

          <div className="mt-8 rounded-3xl border border-dashed border-green-300 p-5">
            <h2 className="font-black text-green-950">Consumo durante a festa</h2>
            <p className="mt-2 text-sm text-stone-600">
              Quando houver pedidos feitos pelo cardápio com o mesmo WhatsApp desta compra, eles aparecerão aqui com status de entrega e pagamento.
            </p>
            <div className="mt-4 grid gap-3">
              {consumptionOrders.map((consumptionOrder) => (
                <div key={consumptionOrder.id} className="rounded-2xl bg-amber-50 p-4 text-sm">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-black text-green-950">Pedido {consumptionOrder.id.slice(0, 8).toUpperCase()}{consumptionOrder.table_label ? ` · ${consumptionOrder.table_label}` : ""}</p>
                      <p className="mt-1 text-stone-600">{consumptionOrder.items.map((item) => `${Number(item.quantity)} ${item.item_name}`).join(", ")}</p>
                    </div>
                    <p className="text-lg font-black text-green-950">{formatCurrency(consumptionOrder.total_amount)}</p>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs font-black">
                    <span className="rounded-full bg-white px-3 py-1 text-green-950">Entrega: {deliveryStatusLabel(consumptionOrder.delivery_status)}</span>
                    <span className="rounded-full bg-white px-3 py-1 text-green-950">Pagamento: {paymentStatusLabel(consumptionOrder.payment_status)}</span>
                    <Link href={`/cardapio/arraia-tucxa-2026/pedido/${consumptionOrder.id}`} className="rounded-full bg-green-900 px-3 py-1 text-white" prefetch={false}>Abrir pedido</Link>
                  </div>
                </div>
              ))}
              {consumptionOrders.length === 0 ? (
                <p className="rounded-2xl bg-amber-50 p-4 text-sm text-stone-600">Ainda não há pedidos de consumo vinculados ao WhatsApp desta compra.</p>
              ) : null}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
