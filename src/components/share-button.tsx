"use client";

import { useState } from "react";
import { Share2 } from "lucide-react";

type ShareButtonProps = {
  title: string;
  text: string;
  url: string;
  label?: string;
  className?: string;
};

type ShareCapableNavigator = Navigator & {
  share?: (data: ShareData) => Promise<void>;
  clipboard?: Clipboard;
};

export function ShareButton({ title, text, url, label = "Compartilhar", className = "" }: ShareButtonProps) {
  const [message, setMessage] = useState("");

  async function handleShare() {
    const shareData = { title, text, url } satisfies ShareData;
    const browserNavigator = typeof window !== "undefined" ? (window.navigator as ShareCapableNavigator) : null;

    try {
      if (browserNavigator?.share) {
        await browserNavigator.share(shareData);
        setMessage("Compartilhamento aberto.");
        return;
      }

      if (browserNavigator?.clipboard) {
        await browserNavigator.clipboard.writeText(`${text}\n${url}`);
        setMessage("Mensagem copiada.");
        return;
      }

      setMessage("Copie o link manualmente.");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setMessage("Não foi possível compartilhar. Copie o link abaixo.");
    }
  }

  return (
    <div className="grid gap-2">
      <button
        type="button"
        onClick={handleShare}
        className={className || "rounded-2xl bg-amber-300 px-5 py-4 text-center font-bold text-green-950 transition hover:bg-amber-200"}
      >
        <Share2 className="mr-2 inline h-4 w-4" /> {label}
      </button>
      {message ? <p className="text-xs font-bold text-green-900">{message}</p> : null}
    </div>
  );
}
