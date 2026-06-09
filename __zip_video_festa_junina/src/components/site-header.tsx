import Image from "next/image";
import Link from "next/link";
import { MobileMenu } from "@/components/mobile-menu";
import { HelpButton } from "@/components/help-button";

const links = [
  { href: "/festa-junina", label: "Início" },
  { href: "/festa-junina#convites", label: "Convites" },
  { href: "/festa-junina#combos", label: "Combos" },
  { href: "/cardapio/arraia-tucxa-2026", label: "Cardápio" },
  { href: "/minha-compra", label: "Minha compra" },
  { href: "/gestao-evento", label: "Gestão do Evento" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-amber-200/70 bg-amber-50/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3">
        <Link href="/festa-junina" className="flex items-center gap-3 font-black text-green-950" prefetch={false}>
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm">
            <Image
              src="/images/logo-tucxa.jpg"
              alt="Logo Tucxa"
              width={32}
              height={32}
              className="rounded-full object-contain"
            />
          </span>
          <span className="hidden sm:inline">Arraiá do Tucxa</span>
        </Link>

        <nav className="hidden items-center gap-1 text-sm font-bold text-green-950 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="whitespace-nowrap rounded-full px-3 py-2 transition hover:bg-white hover:shadow-sm"
             prefetch={false}>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <HelpButton compact />
          <MobileMenu links={links} />
        </div>
      </div>
    </header>
  );
}
