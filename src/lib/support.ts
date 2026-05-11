export const SUPPORT_NAME = "Márcio Alexandre";
export const SUPPORT_PHONE_DISPLAY = "(19) 99236-0856";
export const SUPPORT_WHATSAPP_E164 = "5519992360856";

export function getSupportWhatsAppUrl(message?: string) {
  const text =
    message ??
    "Olá, Márcio! Estou com uma dúvida sobre o sistema da Festa Junina do Tucxa.";

  return `https://wa.me/${SUPPORT_WHATSAPP_E164}?text=${encodeURIComponent(text)}`;
}
