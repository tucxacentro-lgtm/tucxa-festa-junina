import Image from "next/image";
import Link from "next/link";

const links = [
  { href: "/festa-junina", label: "Início" },
  { href: "/festa-junina#convites", label: "Convites" },
  { href: "/festa-junina#combos", label: "Combos" },
  { href: "/minha-compra", label: "Minha compra" },
  { href: "/admin/festa-junina", label: "Admin" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-amber-200/70 bg-amber-50/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3">
        <Link href="/festa-junina" className="flex items-center gap-3 font-black text-green-950">
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

        <nav className="flex items-center gap-1 overflow-x-auto text-sm font-bold text-green-950">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="whitespace-nowrap rounded-full px-3 py-2 transition hover:bg-white hover:shadow-sm"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
