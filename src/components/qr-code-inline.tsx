"use client";

import { useEffect, useState } from "react";

type QrCodeInlineProps = {
  value: string;
  size?: number;
};

export function QrCodeInline({ value, size = 160 }: QrCodeInlineProps) {
  const [qrCode, setQrCode] = useState("");

  useEffect(() => {
    let active = true;
    const absoluteValue = value.startsWith("http") ? value : `${window.location.origin}${value}`;
    import("qrcode")
      .then((QRCode) => QRCode.toDataURL(absoluteValue, { margin: 1, width: size }))
      .then((dataUrl) => {
        if (active) setQrCode(dataUrl);
      })
      .catch(() => {
        if (active) setQrCode("");
      });
    return () => {
      active = false;
    };
  }, [size, value]);

  if (!qrCode) {
    return <div className="flex items-center justify-center rounded-xl bg-white p-4 text-xs font-bold text-stone-500" style={{ height: size, width: size }}>QR Code</div>;
  }

  // eslint-disable-next-line @next/next/no-img-element
  return <img src={qrCode} alt="QR Code de acompanhamento" className="rounded-xl bg-white p-2" style={{ height: size, width: size }} />;
}
