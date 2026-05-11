import { CopyButton } from "@/components/copy-button";
import { buildWhatsAppUrl } from "@/lib/mail";

type WhatsAppMessageCardProps = {
  title: string;
  phone?: string | null;
  message: string;
};

export function WhatsAppMessageCard({ title, phone, message }: WhatsAppMessageCardProps) {
  const whatsappUrl = phone ? buildWhatsAppUrl(phone, message) : null;

  return (
    <div className="rounded-3xl border border-green-100 bg-white p-5 shadow-sm">
      <h3 className="font-black text-green-950">{title}</h3>
      <pre className="mt-3 whitespace-pre-wrap rounded-2xl bg-amber-50 p-4 text-sm leading-relaxed text-stone-700">{message}</pre>
      <div className="mt-4 flex flex-wrap gap-3">
        <CopyButton value={message} label="Copiar mensagem" className="bg-green-900 text-white hover:bg-green-800" />
        {whatsappUrl ? (
          <a href={whatsappUrl} target="_blank" rel="noreferrer" className="rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-black text-white transition hover:bg-emerald-700">
            Abrir WhatsApp
          </a>
        ) : null}
      </div>
    </div>
  );
}
