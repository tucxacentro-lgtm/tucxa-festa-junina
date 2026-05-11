"use server";

import { redirect } from "next/navigation";
import { createSupabaseAdminClient } from "@/lib/supabaseServer";
import { getEventAdminRecipients, sendMail } from "@/lib/mail";
import { formatCurrency } from "@/lib/format";

type CreateOrderResult = {
  ok: boolean;
  message: string;
};

function normalizeText(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeInteger(value: FormDataEntryValue | null, fallback = 0) {
  const parsed = Number.parseInt(normalizeText(value), 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

function generateBuyerCode() {
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  const time = Date.now().toString(36).slice(-4).toUpperCase();
  return `TUCXA-2026-${random}${time}`;
}

function getBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL && `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` ||
    "http://localhost:3000"
  );
}

function buildOrderEmailHtml(input: {
  buyerName: string;
  buyerCode: string;
  totalAmount: number;
  includesBingo: boolean;
  confirmationUrl: string;
}) {
  return `
    <div style="font-family: Arial, sans-serif; color: #1c1917; line-height: 1.5;">
      <h1 style="color:#064e3b;">Reserva registrada - Arraiá do Tucxa 2026</h1>
      <p>Olá, <strong>${input.buyerName}</strong>.</p>
      <p>Sua reserva/compra foi registrada com sucesso.</p>
      <p><strong>Código do comprador:</strong> ${input.buyerCode}</p>
      <p><strong>Total registrado:</strong> ${formatCurrency(input.totalAmount)}</p>
      ${input.includesBingo ? "<p><strong>Esta compra envolve cartela(s) de bingo.</strong></p>" : ""}
      <p>Guarde este código. Ele será usado para comprovar sua compra e acessar sua área exclusiva.</p>
      <p><a href="${input.confirmationUrl}" style="color:#047857;font-weight:bold;">Acessar minha compra</a></p>
      <p>O pagamento/comprovante será validado pela organização.</p>
    </div>
  `;
}

export async function createTicketOrder(
  _previousState: CreateOrderResult | null,
  formData: FormData,
): Promise<CreateOrderResult> {
  const supabase = createSupabaseAdminClient();

  const eventId = normalizeText(formData.get("event_id"));
  const buyerName = normalizeText(formData.get("buyer_name"));
  const buyerEmail = normalizeText(formData.get("buyer_email")).toLowerCase();
  const buyerWhatsapp = normalizeText(formData.get("buyer_whatsapp"));
  const purchaseType = normalizeText(formData.get("purchase_type"));
  const ticketTypeId = normalizeText(formData.get("ticket_type_id"));
  const comboId = normalizeText(formData.get("combo_id"));
  const paymentOptionId = normalizeText(formData.get("payment_option_id"));
  const adultsQuantity = normalizeInteger(formData.get("adults_quantity"), 1);
  const childrenQuantity = normalizeInteger(formData.get("children_quantity"), 0);
  const comboQuantity = normalizeInteger(formData.get("combo_quantity"), 1);
  const referredByCode = normalizeText(formData.get("referred_by_code"));
  const notes = normalizeText(formData.get("notes"));
  const expectedArrival = normalizeText(formData.get("expected_arrival"));
  const foodInterest = normalizeText(formData.get("food_interest"));
  const proof = formData.get("proof_file");

  if (!eventId) return { ok: false, message: "Evento não encontrado." };
  if (!buyerName) return { ok: false, message: "Informe o nome completo." };
  if (!buyerEmail || !buyerEmail.includes("@")) return { ok: false, message: "Informe um e-mail válido." };
  if (!buyerWhatsapp) return { ok: false, message: "Informe o WhatsApp." };
  if (!paymentOptionId) return { ok: false, message: "Escolha a forma de pagamento." };

  if (!(proof instanceof File) || proof.size === 0) {
    return { ok: false, message: "Carregue o comprovante/registro do pagamento." };
  }

  if (proof.size > 8 * 1024 * 1024) {
    return { ok: false, message: "O comprovante deve ter até 8 MB." };
  }

  const buyerCode = generateBuyerCode();
  let totalAmount = 0;
  let selectedTicketTypeId: string | null = null;
  let selectedComboId: string | null = null;
  let includesBingo = false;
  let bingoCardsQuantity = 0;

  if (purchaseType === "combo") {
    if (!comboId) return { ok: false, message: "Escolha um combo." };

    const { data: combo, error } = await supabase
      .from("offer_combos")
      .select("id, price, includes_bingo, bingo_cards_quantity")
      .eq("id", comboId)
      .eq("event_id", eventId)
      .single();

    if (error || !combo) return { ok: false, message: "Combo não encontrado." };

    selectedComboId = combo.id;
    totalAmount = Number(combo.price) * Math.max(comboQuantity, 1);
    includesBingo = Boolean(combo.includes_bingo);
    bingoCardsQuantity = Number(combo.bingo_cards_quantity ?? 0) * Math.max(comboQuantity, 1);
  } else {
    if (!ticketTypeId) return { ok: false, message: "Escolha o tipo de convite." };

    const { data: ticketType, error } = await supabase
      .from("ticket_types")
      .select("id, price, is_free")
      .eq("id", ticketTypeId)
      .eq("event_id", eventId)
      .single();

    if (error || !ticketType) return { ok: false, message: "Tipo de convite não encontrado." };

    selectedTicketTypeId = ticketType.id;
    totalAmount = ticketType.is_free ? 0 : Number(ticketType.price) * Math.max(adultsQuantity, 1);
  }

  const fileExtension = proof.name.split(".").pop()?.toLowerCase() || "bin";
  const proofFilePath = `${eventId}/${buyerCode}.${fileExtension}`;

  const { error: uploadError } = await supabase.storage
    .from("payment-proofs")
    .upload(proofFilePath, proof, {
      contentType: proof.type || "application/octet-stream",
      upsert: false,
    });

  if (uploadError) {
    return {
      ok: false,
      message: `Não foi possível salvar o comprovante. Verifique se o bucket payment-proofs existe. Detalhe: ${uploadError.message}`,
    };
  }

  const { data: order, error: orderError } = await supabase
    .from("ticket_orders")
    .insert({
      event_id: eventId,
      buyer_code: buyerCode,
      buyer_name: buyerName,
      buyer_email: buyerEmail,
      buyer_whatsapp: buyerWhatsapp,
      adults_quantity: adultsQuantity,
      children_quantity: childrenQuantity,
      selected_ticket_type_id: selectedTicketTypeId,
      selected_combo_id: selectedComboId,
      combo_quantity: purchaseType === "combo" ? Math.max(comboQuantity, 1) : 0,
      payment_option_id: paymentOptionId,
      total_amount: totalAmount,
      payment_status: "proof_sent",
      order_status: "created",
      notes,
      proof_file_path: proofFilePath,
      proof_uploaded_at: new Date().toISOString(),
      includes_bingo: includesBingo,
      bingo_cards_quantity: bingoCardsQuantity,
      referral_code: buyerCode,
      referred_by_code: referredByCode || null,
      planning_answers: {
        expected_arrival: expectedArrival,
        food_interest: foodInterest,
      },
    })
    .select("id")
    .single();

  if (orderError || !order) {
    return { ok: false, message: `Não foi possível registrar a compra. ${orderError?.message ?? ""}` };
  }

  const confirmationUrl = `${getBaseUrl()}/minha-compra/${buyerCode}`;
  const recipients = Array.from(new Set([buyerEmail, ...getEventAdminRecipients(includesBingo)]));

  try {
    await sendMail({
      to: recipients,
      subject: `Arraiá do Tucxa 2026 - Reserva ${buyerCode}`,
      html: buildOrderEmailHtml({
        buyerName,
        buyerCode,
        totalAmount,
        includesBingo,
        confirmationUrl,
      }),
    });

    await supabase
      .from("ticket_orders")
      .update({
        email_sent_at: new Date().toISOString(),
        admin_copy_sent_at: new Date().toISOString(),
        bingo_copy_sent_at: includesBingo ? new Date().toISOString() : null,
      })
      .eq("id", order.id);
  } catch (error) {
    console.error("Falha ao enviar e-mail da reserva", error);
  }

  redirect(`/festa-junina/confirmacao/${buyerCode}`);
}
