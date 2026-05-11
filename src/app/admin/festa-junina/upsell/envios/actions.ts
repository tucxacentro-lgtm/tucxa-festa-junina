"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { buildWhatsAppUrl, getTucxaOperationsEmail, sendMail } from "@/lib/mail";
import { createSupabaseAdminClient } from "@/lib/supabaseServer";
import { buildPublicUrl } from "@/lib/site-url";

function text(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function number(formData: FormData, name: string, fallback = 3) {
  const parsed = Number.parseInt(text(formData, name), 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function applyTemplate(template: string, input: { name: string; link: string }) {
  return template
    .replaceAll("{nome}", input.name)
    .replaceAll("{link_compra_adicional}", input.link)
    .replaceAll("{link}", input.link);
}

export async function sendUpsellSummary(formData: FormData) {
  await requireAdmin(["admin", "coordenador"], "/admin/festa-junina/upsell/envios");
  const supabase = createSupabaseAdminClient();
  const days = number(formData, "days", 3);
  const template = text(formData, "message_template");

  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
  const { data: orders, error } = await supabase
    .from("ticket_orders")
    .select("buyer_name, buyer_email, buyer_whatsapp, buyer_code, payment_status, created_at")
    .gte("created_at", since)
    .in("payment_status", ["paid", "proof_sent"])
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  const rows = ((orders ?? []) as Array<{ buyer_name: string; buyer_email: string | null; buyer_whatsapp: string; buyer_code: string; payment_status: string; created_at: string }>).map((order) => {
    const link = buildPublicUrl(`/festa-junina?ref=${encodeURIComponent(order.buyer_code)}#combos`);
    const message = applyTemplate(template, { name: order.buyer_name, link });
    return { ...order, link, message, whatsappUrl: buildWhatsAppUrl(order.buyer_whatsapp, message) };
  });

  const html = `
    <div style="font-family:Arial,sans-serif;color:#1c1917;line-height:1.5;">
      <h1 style="color:#064e3b;">Mensagens de upsell - Arraiá do Tucxa</h1>
      <p>Compradores dos últimos ${days} dia(s) com pagamento aprovado ou comprovante enviado.</p>
      ${rows.map((row) => `
        <div style="border:1px solid #e7e5e4;border-radius:16px;padding:16px;margin:16px 0;">
          <p><strong>${row.buyer_name}</strong> · ${row.buyer_whatsapp} · ${row.buyer_email || "sem e-mail"}</p>
          <pre style="white-space:pre-wrap;background:#fff7ed;border-radius:12px;padding:12px;">${row.message}</pre>
          <p><a href="${row.whatsappUrl}" style="color:#047857;font-weight:bold;">Abrir WhatsApp</a></p>
        </div>
      `).join("")}
      ${rows.length === 0 ? "<p>Nenhum comprador encontrado para o período.</p>" : ""}
    </div>
  `;

  await sendMail({
    to: [getTucxaOperationsEmail()],
    subject: `Mensagens de upsell para WhatsApp - últimos ${days} dias`,
    html,
  });

  revalidatePath("/admin/festa-junina/upsell/envios");
  redirect("/admin/festa-junina/upsell/envios?sent=1");
}
