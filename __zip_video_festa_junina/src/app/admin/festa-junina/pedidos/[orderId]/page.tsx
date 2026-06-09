import Link from "next/link";
import { PaymentStatusBadge } from "@/components/payment-status-badge";
import { requireAdmin } from "@/lib/auth";
import { formatCurrency } from "@/lib/format";
import { createSupabaseAdminClient } from "@/lib/supabaseServer";
import type { TicketOrder } from "@/types/festa-junina";
import { approvePayment, rejectPayment } from "../actions";
import { AdminPageShell } from "@/components/admin-page-shell";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ orderId: string }>;
};

async function getOrder(orderId: string) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("ticket_orders")
    .select("*")
    .eq("id", orderId)
    .single();

  if (error || !data) {
    return { order: null as TicketOrder | null, proofUrl: null as string | null, error: error?.message ?? "Compra não encontrada." };
  }

  const order = data as TicketOrder;
  let proofUrl: string | null = null;

  if (order.proof_file_path) {
    const { data: signedData } = await supabase.storage
      .from("payment-proofs")
      .createSignedUrl(order.proof_file_path, 60 * 10);

    proofUrl = signedData?.signedUrl ?? null;
  }

  return { order, proofUrl, error: null as string | null };
}

export default async function AdminPedidoDetalhePage({ params }: PageProps) {
  await requireAdmin(["admin", "coordenador", "caixa"], "/admin/festa-junina/pedidos");
  const { orderId } = await params;
  const { order, proofUrl, error } = await getOrder(orderId);

  return (
    <AdminPageShell>
      
      <section className="mx-auto max-w-5xl px-5 py-12">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <Link href="/admin/festa-junina/pedidos" className="rounded-2xl bg-white px-5 py-3 text-sm font-bold text-green-950 shadow-sm" prefetch={false}>
            ← Voltar para compras
          </Link>
          <a href="/admin/logout" className="rounded-full bg-white px-4 py-2 text-sm font-bold text-green-950 shadow-sm transition hover:bg-amber-100">
            Sair da gestão
          </a>
        </div>

        {error || !order ? (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">
            {error ?? "Compra não encontrada."}
          </div>
        ) : (
          <div className="rounded-[2rem] bg-white p-6 shadow-sm md:p-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <h1 className="text-3xl font-black text-green-950">Detalhe da compra</h1>
                <p className="mt-2 break-words text-xl font-black text-green-950">{order.buyer_code}</p>
              </div>
              <PaymentStatusBadge status={order.payment_status} />
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <div className="rounded-3xl bg-amber-50 p-5">
                <h2 className="font-black text-green-950">Comprador</h2>
                <div className="mt-4 space-y-2 text-sm text-stone-700">
                  <p><strong>Nome:</strong> {order.buyer_name}</p>
                  <p><strong>E-mail:</strong> {order.buyer_email || "Não informado"}</p>
                  <p><strong>WhatsApp:</strong> {order.buyer_whatsapp}</p>
                  <p><strong>Adultos:</strong> {order.adults_quantity}</p>
                  <p><strong>Crianças:</strong> {order.children_quantity}</p>
                </div>
              </div>

              <div className="rounded-3xl bg-amber-50 p-5">
                <h2 className="font-black text-green-950">Compra</h2>
                <div className="mt-4 space-y-2 text-sm text-stone-700">
                  <p><strong>Total:</strong> {formatCurrency(order.total_amount)}</p>
                  <p><strong>Bingo:</strong> {order.includes_bingo ? `${order.bingo_cards_quantity} cartela(s)` : "Não incluído"}</p>
                  <p><strong>Código de indicação usado:</strong> {order.referred_by_code || "Não informado"}</p>
                  <p><strong>Criado em:</strong> {new Date(order.created_at).toLocaleString("pt-BR")}</p>
                  <p><strong>Revisado em:</strong> {order.payment_reviewed_at ? new Date(order.payment_reviewed_at).toLocaleString("pt-BR") : "Ainda não revisado"}</p>
                  {order.payment_rejection_reason ? <p><strong>Motivo da reprovação:</strong> {order.payment_rejection_reason}</p> : null}
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-3xl border border-green-100 bg-white p-5 shadow-sm">
              <h2 className="font-black text-green-950">Comprovante/registro de pagamento</h2>
              {proofUrl ? (
                <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center">
                  <a href={proofUrl} target="_blank" rel="noreferrer" className="rounded-2xl bg-green-900 px-5 py-3 text-center text-sm font-black text-white transition hover:bg-green-800">
                    Abrir comprovante em nova aba
                  </a>
                  <p className="text-sm text-stone-500">O link é temporário e expira em alguns minutos por segurança.</p>
                </div>
              ) : (
                <p className="mt-3 text-sm text-stone-600">Nenhum comprovante encontrado para esta compra.</p>
              )}
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <form action={approvePayment} className="rounded-3xl border border-green-100 bg-green-50 p-5">
                <input type="hidden" name="order_id" value={order.id} />
                <h2 className="font-black text-green-950">Aprovar pagamento</h2>
                <p className="mt-2 text-sm text-stone-600">Ao aprovar, a compra será marcada como paga e o comprador receberá e-mail se o envio estiver habilitado.</p>
                <button type="submit" className="mt-4 w-full rounded-2xl bg-green-900 px-5 py-3 font-black text-white transition hover:bg-green-800">
                  Aprovar pagamento
                </button>
              </form>

              <form action={rejectPayment} className="rounded-3xl border border-red-100 bg-red-50 p-5">
                <input type="hidden" name="order_id" value={order.id} />
                <h2 className="font-black text-red-900">Reprovar comprovante</h2>
                <p className="mt-2 text-sm text-stone-600">Informe o motivo para orientar o comprador.</p>
                <textarea name="rejection_reason" required className="mt-4 min-h-24 w-full rounded-2xl border border-red-100 p-3 text-sm" placeholder="Ex.: valor divergente, comprovante ilegível, pagamento não localizado..." />
                <button type="submit" className="mt-4 w-full rounded-2xl bg-red-700 px-5 py-3 font-black text-white transition hover:bg-red-800">
                  Reprovar comprovante
                </button>
              </form>
            </div>
          </div>
        )}
      </section>
    </AdminPageShell>
  );
}
