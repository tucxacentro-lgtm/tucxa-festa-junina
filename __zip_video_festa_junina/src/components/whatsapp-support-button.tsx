import { MessageCircle } from "lucide-react";
import { getSupportWhatsAppUrl } from "@/lib/support";

type WhatsAppSupportButtonProps = {
  className?: string;
  label?: string;
  message?: string;
};

export function WhatsAppSupportButton({
  className,
  label = "Falar no WhatsApp",
  message,
}: WhatsAppSupportButtonProps) {
  return (
    <a
      href={getSupportWhatsAppUrl(message)}
      target="_blank"
      rel="noopener noreferrer"
      className={
        className ??
        "inline-flex items-center justify-center gap-2 rounded-2xl bg-green-900 px-4 py-3 text-sm font-black text-white shadow-sm transition hover:bg-green-800"
      }
    >
      <MessageCircle className="h-4 w-4" />
      {label}
    </a>
  );
}
