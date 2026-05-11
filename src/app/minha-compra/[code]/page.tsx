import Link from "next/link";
import QRCode from "qrcode";
import { SiteHeader } from "@/components/site-header";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { formatCurrency } from "@/lib/format";
import type { TicketOrder } from "@/types/festa-junina";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ code: string }>;
};

function getBaseUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
}

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
            <Link href="/minha-compra" className="mt-6 inline-block rounded-2xl bg-green-900 px-5 py-3 font-bold text-white">
              Consultar outro código
            </Link>
          </div>
        </section>
      </main>
    );
  }

  const myPurchaseUrl = `${getBaseUrl()}/minha-compra/${order.buyer_code}`;
  const qrCode = await QRCode.toDataURL(myPurchaseUrl, { margin: 1, width: 240 });

  return (
    <main className="min-h-screen bg-amber-50 text-stone-900">
      <SiteHeader />
      <section className="mx-auto max-w-4xl px-5 py-12">
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
                <p><strong>E-mail:</strong> {order.buyer_email}</p>
                <p><strong>WhatsApp:</strong> {order.buyer_whatsapp}</p>
                <p><strong>Total:</strong> {formatCurrency(order.total_amount)}</p>
              </div>
            </div>

            <div className="rounded-3xl bg-amber-50 p-5">
              <h2 className="font-black text-green-950">Status</h2>
              <div className="mt-4 space-y-2 text-sm text-stone-700">
                <p><strong>Pagamento:</strong> {order.payment_status === "paid" ? "Pago" : "Aguardando validação"}</p>
                <p><strong>Adultos:</strong> {order.adults_quantity}</p>
                <p><strong>Crianças:</strong> {order.children_quantity}</p>
                <p><strong>Bingo:</strong> {order.includes_bingo ? `${order.bingo_cards_quantity} cartela(s)` : "Não incluído"}</p>
              </div>
            </div>
          </div>

          <div className="mt-8 rounded-3xl border border-dashed border-green-300 p-5">
            <h2 className="font-black text-green-950">Consumo durante a festa</h2>
            <p className="mt-2 text-sm text-stone-600">
              Área reservada para a próxima etapa: gestão de cardápio, pedidos por mesa, cozinha, entrega e caixa.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
