import Link from "next/link";
import { CheckCircle2, Copy, Mail, Ticket } from "lucide-react";
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

export default async function ConfirmacaoCompraPage({ params }: PageProps) {
  const { code } = await params;
  const order = await getOrder(code);

  if (!order) {
    return (
      <main className="min-h-screen bg-amber-50 text-stone-900">
        <SiteHeader />
        <section className="mx-auto max-w-3xl px-5 py-16">
          <div className="rounded-3xl bg-white p-8 shadow-sm">
            <h1 className="text-3xl font-black text-green-950">Compra não encontrada</h1>
            <p className="mt-3 text-stone-600">Confira se o código informado está correto.</p>
            <Link href="/festa-junina" className="mt-6 inline-block rounded-2xl bg-green-900 px-5 py-3 font-bold text-white">
              Voltar para a festa
            </Link>
          </div>
        </section>
      </main>
    );
  }

  const myPurchaseUrl = `${getBaseUrl()}/minha-compra/${order.buyer_code}`;
  const referralUrl = `${getBaseUrl()}/festa-junina?ref=${order.referral_code ?? order.buyer_code}`;
  const qrCode = await QRCode.toDataURL(myPurchaseUrl, { margin: 1, width: 220 });

  return (
    <main className="min-h-screen bg-amber-50 text-stone-900">
      <SiteHeader />

      <section className="mx-auto max-w-4xl px-5 py-12">
        <div className="rounded-[2rem] bg-white p-6 shadow-sm md:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-green-100 px-4 py-2 text-sm font-black text-green-900">
                <CheckCircle2 className="h-4 w-4" />
                Reserva registrada
              </div>
              <h1 className="text-3xl font-black text-green-950 md:text-4xl">Compra recebida com sucesso</h1>
              <p className="mt-3 max-w-2xl text-stone-600">
                Guarde seu código. Ele servirá como comprovação para entrada, consulta da compra e futura consulta de consumo durante a festa.
              </p>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrCode} alt="QR Code da compra" className="h-44 w-44 rounded-3xl bg-white p-3 shadow-sm" />
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-3xl bg-amber-50 p-5">
              <p className="text-sm font-bold text-stone-500">Código</p>
              <p className="mt-2 break-words text-2xl font-black text-green-950">{order.buyer_code}</p>
            </div>
            <div className="rounded-3xl bg-amber-50 p-5">
              <p className="text-sm font-bold text-stone-500">Total</p>
              <p className="mt-2 text-2xl font-black text-green-950">{formatCurrency(order.total_amount)}</p>
            </div>
            <div className="rounded-3xl bg-amber-50 p-5">
              <p className="text-sm font-bold text-stone-500">Status</p>
              <p className="mt-2 text-2xl font-black text-green-950">Comprovante enviado</p>
            </div>
          </div>

          <div className="mt-8 rounded-3xl border border-green-100 p-5">
            <h2 className="flex items-center gap-2 text-xl font-black text-green-950">
              <Ticket className="h-5 w-5" />
              Resumo
            </h2>
            <div className="mt-4 grid gap-3 text-sm text-stone-700 md:grid-cols-2">
              <p><strong>Comprador:</strong> {order.buyer_name}</p>
              <p><strong>E-mail:</strong> {order.buyer_email}</p>
              <p><strong>Adultos:</strong> {order.adults_quantity}</p>
              <p><strong>Crianças:</strong> {order.children_quantity}</p>
              <p><strong>Inclui bingo:</strong> {order.includes_bingo ? `Sim (${order.bingo_cards_quantity} cartela(s))` : "Não"}</p>
              <p><strong>Pagamento:</strong> aguardando validação da organização</p>
            </div>
          </div>

          <div className="mt-8 grid gap-3 md:grid-cols-3">
            <Link href={`/minha-compra/${order.buyer_code}`} className="rounded-2xl bg-green-900 px-5 py-4 text-center font-bold text-white">
              Acessar minha compra
            </Link>
            <a href={`mailto:?subject=Arraiá do Tucxa 2026&body=${encodeURIComponent(referralUrl)}`} className="rounded-2xl bg-amber-300 px-5 py-4 text-center font-bold text-green-950">
              <Mail className="mr-2 inline h-4 w-4" /> Compartilhar por e-mail
            </a>
            <div className="rounded-2xl bg-stone-100 px-5 py-4 text-center text-sm font-bold text-stone-700">
              <Copy className="mr-2 inline h-4 w-4" /> Link de indicação: {order.referral_code ?? order.buyer_code}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
