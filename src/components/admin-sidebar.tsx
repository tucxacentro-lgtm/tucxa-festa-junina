"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, HelpCircle, Home, Menu, X } from "lucide-react";
import { useState } from "react";
import { HelpButton } from "@/components/help-button";

type AdminLink = {
  href: string;
  label: string;
};

type AdminGroup = {
  title: string;
  links: AdminLink[];
};

const groups: AdminGroup[] = [
  {
    title: "Geral",
    links: [
      { href: "/admin/festa-junina", label: "Painel principal" },
      { href: "/admin/festa-junina/pedidos", label: "Compras e comprovantes" },
      { href: "/admin/festa-junina/configuracoes", label: "Configurações" },
      { href: "/admin/festa-junina/convites", label: "Convites" },
      { href: "/admin/festa-junina/combos", label: "Combos e ofertas" },
      { href: "/admin/festa-junina/pagamentos", label: "Pagamentos" },
    ],
  },
  {
    title: "Planejamento",
    links: [
      { href: "/admin/festa-junina/planejamento", label: "Planejamento" },
      { href: "/admin/festa-junina/cardapio", label: "Cardápio e ficha técnica" },
      { href: "/admin/festa-junina/voluntarios", label: "Voluntários" },
      { href: "/admin/festa-junina/checklist", label: "Checklist operacional" },
      { href: "/admin/festa-junina/operacao", label: "Operação e simulação" },
    ],
  },
  {
    title: "Comunicação",
    links: [
      { href: "/admin/festa-junina/indicacoes", label: "Indicações e brindes" },
      { href: "/admin/festa-junina/upsell", label: "Upsell e mensagens" },
      { href: "/admin/festa-junina/upsell/envios", label: "Envios WhatsApp" },
    ],
  },
  {
    title: "Ajuda",
    links: [{ href: "/admin/festa-junina/ajuda", label: "Como usar o sistema" }],
  },
];

function isActive(pathname: string, href: string) {
  if (href === "/admin/festa-junina") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col bg-green-950 text-white">
      <div className="border-b border-white/10 p-5">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white font-black text-green-900">T</span>
          <div>
            <p className="text-sm font-black">Festa Junina Tucxa</p>
            <p className="text-xs text-white/70">Administração</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-3 overflow-y-auto p-3">
        {groups.map((group) => (
          <section key={group.title} className="rounded-2xl bg-white/5 p-2">
            <div className="mb-2 flex items-center justify-between px-2 text-[0.7rem] font-black uppercase tracking-[0.15em] text-white/70">
              {group.title}
              <ChevronDown className="h-3 w-3" />
            </div>
            <div className="grid gap-1">
              {group.links.map((link) => {
                const active = isActive(pathname, link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={onNavigate}
                    className={`rounded-xl px-3 py-2 text-sm font-bold transition ${
                      active ? "bg-white text-green-950 shadow-sm" : "text-white/80 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </section>
        ))}
      </nav>

      <div className="border-t border-white/10 p-3">
        <HelpButton compact />
        <Link href="/admin/logout" className="mt-3 block rounded-xl bg-white/10 px-3 py-2 text-center text-sm font-black text-white transition hover:bg-white/20">
          Sair do admin
        </Link>
      </div>
    </div>
  );
}

export function AdminSidebar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <aside className="fixed bottom-0 left-0 top-[4.1rem] z-40 hidden w-72 overflow-hidden border-r border-green-900/20 shadow-xl lg:block">
        <SidebarContent />
      </aside>

      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 left-4 z-50 inline-flex items-center gap-2 rounded-full bg-green-950 px-4 py-3 text-sm font-black text-white shadow-xl lg:hidden"
      >
        <Menu className="h-4 w-4" />
        Menu admin
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-[90] bg-black/40 lg:hidden">
          <div className="h-full w-[85vw] max-w-xs shadow-2xl">
            <div className="absolute left-[calc(min(85vw,20rem)-3.25rem)] top-3">
              <button type="button" onClick={() => setIsOpen(false)} className="rounded-full bg-white p-2 text-green-950 shadow" aria-label="Fechar menu admin">
                <X className="h-5 w-5" />
              </button>
            </div>
            <SidebarContent onNavigate={() => setIsOpen(false)} />
          </div>
        </div>
      ) : null}
    </>
  );
}
