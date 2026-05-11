"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { formatCurrency } from "@/lib/format";
import { getEventAdminRecipients, sendMail } from "@/lib/mail";
import { createSupabaseAdminClient } from "@/lib/supabaseServer";
import type { TicketOrder } from "@/types/festa-junina";

function text(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function getBaseUrl() {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  const vercelUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "";

  if (explicit && !explicit.includes("localhost")) return explicit.replace(/\/$/, "");
  if (vercelUrl) return vercelUrl.replace(/\/$/, "");
  return (explicit || "http://localhost:3000").replace(/\/$/, "");
}

function buildPaymentReviewEmail(input: {
  buyerName: string;
  buyerCode: string;
  status: "paid" | "rejected";
  totalAmount: number;
  rejectionReason?: string | null;
}) {
  const purchaseUrl = `${getBaseUrl()}/minha-compra/${input.buyerCode}`;
  const isPaid = input.status === "paid";

  return `
    <div style="font-family: Arial, sans-serif; color: #1c1917; line-height: 1.5;">
      <h1 style="color:#064e3b;">Arraiá do Tucxa 2026</h1>
      <p>Olá, <strong>${input.buyerName}</strong>.</p>
      <p>${isPaid ? "Seu pagamento foi aprovado pela organização." : "Seu comprovante foi reprovado pela organização."}</p>
      <p><strong>Código do comprador:</strong> ${input.buyerCode}</p>
      <p><strong>Total:</strong> ${formatCurrency(input.totalAmount)}</p>
      ${!isPaid && input.rejectionReason ? `<p><strong>Motivo:</strong> ${input.rejectionReason}</p>` : ""}
      <p>${isPaid ? "Apresente seu código ou QR Code na entrada da festa." : "Acesse sua compra e procure a organização para regularizar o pagamento."}</p>
      <p><a href="${purchaseUrl}" style="color:#047857;font-weight:bold;">Acessar minha compra</a></p>
    </div>
  `;
}

async function reviewPayment(formData: FormData, status: "paid" | "rejected") {
  const admin = await requireAdmin(["admin", "coordenador", "caixa"], "/admin/festa-junina/pedidos");
  const orderId = text(formData, "order_id");
  const rejectionReason = text(formData, "rejection_reason");

  if (!orderId) throw new Error("Compra não encontrada.");
  if (status === "rejected" && !rejectionReason) throw new Error("Informe o motivo da reprovação.");

  const supabase = createSupabaseAdminClient();
  const { data: orderData, error: orderError } = await supabase
    .from("ticket_orders")
    .select("*")
    .eq("id", orderId)
    .single();

  if (orderError || !orderData) {
    throw new Error(orderError?.message ?? "Compra não encontrada.");
  }

  const order = orderData as TicketOrder;

  const { error: updateError } = await supabase
    .from("ticket_orders")
    .update({
      payment_status: status,
      order_status: status === "paid" ? "confirmed" : "created",
      payment_reviewed_at: new Date().toISOString(),
      payment_reviewed_by: admin.user.id,
      payment_rejection_reason: status === "rejected" ? rejectionReason : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId);

  if (updateError) throw new Error(updateError.message);

  try {
    const recipients = Array.from(new Set([order.buyer_email, ...getEventAdminRecipients(order.includes_bingo)]));

    await sendMail({
      to: recipients,
      subject: status === "paid"
        ? `Pagamento aprovado - ${order.buyer_code}`
        : `Comprovante reprovado - ${order.buyer_code}`,
      html: buildPaymentReviewEmail({
        buyerName: order.buyer_name,
        buyerCode: order.buyer_code,
        status,
        totalAmount: Number(order.total_amount ?? 0),
        rejectionReason,
      }),
    });
  } catch (error) {
    console.error("Falha ao enviar e-mail de revisão de pagamento", error);
  }

  revalidatePath("/admin/festa-junina/pedidos");
  revalidatePath(`/admin/festa-junina/pedidos/${orderId}`);
  revalidatePath(`/minha-compra/${order.buyer_code}`);
  redirect(`/admin/festa-junina/pedidos?saved=${status}`);
}

export async function approvePayment(formData: FormData) {
  await reviewPayment(formData, "paid");
}

export async function rejectPayment(formData: FormData) {
  await reviewPayment(formData, "rejected");
}
