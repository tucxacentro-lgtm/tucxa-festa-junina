import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Arraiá do Tucxa 2026",
  description: "Convites, combos, bingo e organização da Festa Junina do Tucxa.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="h-full antialiased">
      <body className="min-h-full bg-amber-50 text-stone-900">{children}</body>
    </html>
  );
}
