"use client";

import { useEffect, useState } from "react";
import { CopyButton } from "@/components/copy-button";
import { formatCurrency } from "@/lib/format";

type PixPaymentBoxProps = {
  pixCopyPaste: string;
  amount: number | string;
  pixKey?: string | null;
  receiverName?: string | null;
  title?: string;
};

export function PixPaymentBox({ pixCopyPaste, amount, pixKey, receiverName, title = "Pix com valor preenchido" }: PixPaymentBoxProps) {
  const [qrCode, setQrCode] = useState("");

  useEffect(() => {
    let active = true;
    import("qrcode")
      .then((QRCode) => QRCode.toDataURL(pixCopyPaste, { margin: 1, width: 220 }))
      .then((dataUrl) => {
        if (active) setQrCode(dataUrl);
      })
      .catch(() => {
        if (active) setQrCode("");
      });
    return () => {
      active = false;
    };
  }, [pixCopyPaste]);

  return (
    <div className="mt-4 rounded-3xl border border-green-100 bg-white p-4 shadow-sm">
      <div className="grid gap-4 md:grid-cols-[auto_1fr] md:items-center">
        <div className="rounded-2xl bg-green-50 p-3 text-center">
          {qrCode ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={qrCode} alt="QR Code Pix com valor total" className="mx-auto h-44 w-44 rounded-xl bg-white p-2" />
          ) : (
            <div className="flex h-44 w-44 items-center justify-center rounded-xl bg-white p-4 text-xs font-bold text-stone-500">QR Code Pix</div>
          )}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-wide text-green-800">{title}</p>
          <p className="mt-1 text-3xl font-black text-green-950">{formatCurrency(amount)}</p>
          <p className="mt-2 text-sm text-stone-600">
            O QR Code e o Pix Copia e Cola já levam o valor total. Confira no app do banco antes de confirmar.
          </p>
          {pixKey ? <p className="mt-2 break-all text-xs text-stone-500">Chave: <strong>{pixKey}</strong>{receiverName ? ` · ${receiverName}` : ""}</p> : null}
          <div className="mt-3 flex flex-wrap gap-2">
            <CopyButton value={pixCopyPaste} label="Copiar Pix Copia e Cola" className="bg-green-900 text-white hover:bg-green-800" />
            {pixKey ? <CopyButton value={pixKey} label="Copiar chave" className="bg-stone-100 text-green-950 hover:bg-stone-200" /> : null}
          </div>
          <textarea readOnly value={pixCopyPaste} className="mt-3 h-24 w-full rounded-2xl border border-stone-200 bg-stone-50 p-3 text-xs text-stone-600" />
        </div>
      </div>
    </div>
  );
}
