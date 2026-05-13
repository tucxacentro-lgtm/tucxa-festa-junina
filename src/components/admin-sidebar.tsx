"use client";

import { usePathname } from "next/navigation";
import { ChevronDown, Menu, X } from "lucide-react";
import { useMemo, useState } from "react";
import { HelpButton } from "@/components/help-button";

type AdminLink = {
  href: string;
  label: string;
  enabled?: boolean;
  hint?: string;
};

type AdminSection = {
  title: string;
  links: AdminLink[];
  defaultOpen?: boolean;
  locked?: boolean;
};

const EVENT_SELECTED = true;

const sections: AdminSection[] = [
  {
    title: "Geral",
    defaultOpen: true,
    links: [
      { href: "/admin/festa-junina/eventos", label: "Eventos" },
      { href: "/admin/festa-junina/eventos/novo", label: "Novo evento" },
      { href: "/admin/festa-junina/ajuda", label: "Manuais e ajuda" },
    ],
  },
  {
    title: "Evento selecionado",
    defaultOpen: true,
    locked: !EVENT_SELECTED,
    links: [
      { href: "/admin/festa-junina", label: "Painel do evento" },
      { href: "/admin/festa-junina/pedidos", label: "Vendas" },
      { href: "/admin/festa-junina/convites", label: "Convites" },
      { href: "/admin/festa-junina/combos", label: "Individuais/Combos" },
      { href: "/admin/festa-junina/indicacoes", label: "Programa indicações" },
      { href: "/admin/festa-junina/upsell", label: "Upsell" },
      { href: "/admin/festa-junina/pagamentos", label: "Pagamentos/Confirmações" },
      { href: "/admin/festa-junina/relatorios", label: "Relatórios" },
    ],
  },
  {
    title: "Conveniências",
    defaultOpen: true,
    locked: !EVENT_SELECTED,
    links: [
      { href: "/admin/festa-junina/cardapio", label: "Cardápio de comidas, bebidas e doces" },
      { href: "/admin/festa-junina/cliente-resumo", label: "Versão resumida para clientes" },
      { href: "/admin/festa-junina/cardapio", label: "Ficha técnica/receitas" },
      { href: "/admin/festa-junina/bingo", label: "Cartelas de Bingo" },
      { href: "/admin/festa-junina/outros", label: "Outros" },
      { href: "/admin/festa-junina/relatorios?modulo=conveniencias", label: "Relatórios" },
    ],
  },
  {
    title: "Operação",
    defaultOpen: true,
    locked: !EVENT_SELECTED,
    links: [
      { href: "/admin/festa-junina/voluntarios", label: "Voluntários" },
      { href: "/admin/festa-junina/voluntarios/funcoes", label: "Cadastro por função" },
      { href: "/admin/festa-junina/voluntarios/necessidade", label: "Necessidade conforme convites vendidos/estimativa" },
      { href: "/admin/festa-junina/compras", label: "Compras" },
      { href: "/admin/festa-junina/compras/insumos", label: "Insumos" },
      { href: "/admin/festa-junina/compras/itens-finais", label: "Itens finais" },
      { href: "/admin/festa-junina/treinamento", label: "Treinamentos/Simulação" },
      { href: "/admin/festa-junina/atendimento", label: "Atendimento no dia do evento" },
      { href: "/admin/festa-junina/prestacao-contas", label: "Prestação de contas" },
      { href: "/admin/festa-junina/relatorios?modulo=operacao", label: "Relatórios" },
    ],
  },
];

function isActive(pathname: string, href: string) {
  const cleanHref = href.split("?")[0] ?? href;
  if (cleanHref === "/admin/festa-junina") return pathname === cleanHref;
  return pathname === cleanHref || pathname.startsWith(`${cleanHref}/`);
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const initialState = useMemo(() => Object.fromEntries(sections.map((section) => [section.title, Boolean(section.defaultOpen)])), []);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(initialState);

  function toggleSection(title: string) {
    setOpenSections((current) => ({ ...current, [title]: !current[title] }));
  }

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
        {sections.map((section) => {
          const isOpen = openSections[section.title] ?? false;
          return (
            <section key={section.title} className={`rounded-2xl p-2 ${section.locked ? "bg-white/[0.03]" : "bg-white/5"}`}>
              <button
                type="button"
                onClick={() => toggleSection(section.title)}
                className="flex w-full items-center justify-between rounded-xl px-2 py-2 text-left text-[0.7rem] font-black uppercase tracking-[0.15em] text-white/70 transition hover:bg-white/5 hover:text-white"
              >
                <span>{section.title}</span>
                <ChevronDown className={`h-3 w-3 transition ${isOpen ? "rotate-0" : "-rotate-90"}`} />
              </button>

              {isOpen ? (
                <div className="mt-1 grid gap-1">
                  {section.links.map((link) => {
                    const enabled = !section.locked && link.enabled !== false;
                    const active = isActive(pathname, link.href);

                    if (!enabled) {
                      return (
                        <span
                          key={`${section.title}-${link.href}-${link.label}`}
                          title={link.hint ?? "Abra ou selecione um evento para usar esta opção."}
                          className="cursor-not-allowed rounded-xl px-3 py-2 text-sm font-bold text-white/35"
                        >
                          {link.label}
                        </span>
                      );
                    }

                    return (
                      <a
                        key={`${section.title}-${link.href}-${link.label}`}
                        href={link.href}
                        onClick={onNavigate}
                        className={`rounded-xl px-3 py-2 text-sm font-bold transition ${
                          active ? "bg-white text-green-950 shadow-sm" : "text-white/80 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        {link.label}
                      </a>
                    );
                  })}
                </div>
              ) : null}
            </section>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-3">
        <HelpButton compact />
        <a href="/admin/logout" className="mt-3 block rounded-xl bg-white/10 px-3 py-2 text-center text-sm font-black text-white transition hover:bg-white/20">
          Sair do admin
        </a>
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
