"use client";

import { usePathname } from "next/navigation";
import { ChevronDown, Menu, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { HelpButton } from "@/components/help-button";
import type { AdminSidebarSection } from "@/lib/admin-menu";

type AdminSidebarProps = {
  sections: AdminSidebarSection[];
  eventName: string | null;
  hasSelectedEvent: boolean;
};

function isActive(pathname: string, href?: string) {
  if (!href) return false;
  const cleanHref = href.split("?")[0] ?? href;
  if (cleanHref === "/admin/festa-junina") return pathname === cleanHref;
  return pathname === cleanHref || pathname.startsWith(`${cleanHref}/`);
}

function sectionHasActive(section: AdminSidebarSection, pathname: string) {
  return section.items.some((item) => isActive(pathname, item.href));
}

function itemPadding(depth = 0) {
  if (depth <= 0) return "pl-3";
  if (depth === 1) return "pl-7";
  if (depth === 2) return "pl-11";
  return "pl-14";
}

function SidebarContent({ sections, eventName, hasSelectedEvent, onNavigate }: AdminSidebarProps & { onNavigate?: () => void }) {
  const pathname = usePathname();
  const navRef = useRef<HTMLElement | null>(null);
  const activeItemRef = useRef<HTMLAnchorElement | null>(null);

  const initialState = useMemo(
    () => Object.fromEntries(sections.map((section) => [section.title, Boolean(section.defaultOpen) || sectionHasActive(section, pathname)])),
    [sections, pathname],
  );
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(initialState);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setOpenSections((current) => {
        const next = { ...current };
        for (const section of sections) {
          if (sectionHasActive(section, pathname)) next[section.title] = true;
        }
        return next;
      });
    }, 0);
    return () => window.clearTimeout(timer);
  }, [pathname, sections]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      activeItemRef.current?.scrollIntoView({ block: "center", inline: "nearest", behavior: "smooth" });
    }, 80);
    return () => window.clearTimeout(timer);
  }, [pathname, openSections]);

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
            <p className="text-xs text-white/70">{hasSelectedEvent && eventName ? eventName : "Selecione um evento"}</p>
          </div>
        </div>
      </div>

      <nav ref={navRef} className="flex-1 space-y-3 overflow-y-auto p-3">
        {sections.map((section) => {
          const isOpen = openSections[section.title] ?? false;
          return (
            <section key={section.title} className={`rounded-2xl p-2 ${section.locked ? "bg-white/[0.03]" : "bg-white/5"}`}>
              <button
                type="button"
                onClick={() => toggleSection(section.title)}
                className="flex w-full items-center justify-between rounded-xl px-2 py-2 text-left text-[0.68rem] font-black uppercase tracking-[0.15em] text-white/70 transition hover:bg-white/5 hover:text-white"
              >
                <span>{section.title}</span>
                <ChevronDown className={`h-3 w-3 transition ${isOpen ? "rotate-0" : "-rotate-90"}`} />
              </button>

              {isOpen ? (
                <div className="mt-1 grid gap-1">
                  {section.items.map((item) => {
                    const active = isActive(pathname, item.href);
                    const depth = item.depth ?? 0;

                    if (!item.href || item.isHeading) {
                      return (
                        <div
                          key={item.key}
                          title={item.hint}
                          className={`block rounded-xl py-1.5 pr-2 text-xs font-black uppercase tracking-[0.08em] ${
                            item.enabled ? "text-white/60" : "text-white/30"
                          } ${itemPadding(depth)}`}
                        >
                          {item.label}
                        </div>
                      );
                    }

                    if (!item.enabled || !item.implemented) {
                      return (
                        <span key={item.key} title={item.hint ?? "Abra ou selecione um evento para usar esta opção."} className={`cursor-not-allowed rounded-xl py-2 pr-3 text-sm font-bold text-white/35 ${itemPadding(depth)}`}>
                          {item.label}
                        </span>
                      );
                    }

                    return (
                      <a
                        key={item.key}
                        ref={active ? activeItemRef : undefined}
                        href={item.href}
                        onClick={onNavigate}
                        className={`rounded-xl py-2 pr-3 text-sm font-bold transition ${itemPadding(depth)} ${
                          active ? "bg-white text-green-950 shadow-sm" : "text-white/80 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        {item.label}
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
          Sair da gestão
        </a>
      </div>
    </div>
  );
}

export function AdminSidebar(props: AdminSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <aside className="fixed bottom-0 left-0 top-[4.1rem] z-40 hidden w-72 overflow-hidden border-r border-green-900/20 shadow-xl lg:block">
        <SidebarContent {...props} />
      </aside>

      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 left-4 z-50 inline-flex items-center gap-2 rounded-full bg-green-950 px-4 py-3 text-sm font-black text-white shadow-xl lg:hidden"
      >
        <Menu className="h-4 w-4" />
        Menu gestão
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-[90] bg-black/40 lg:hidden">
          <div className="h-full w-[85vw] max-w-xs shadow-2xl">
            <div className="absolute left-[calc(min(85vw,20rem)-3.25rem)] top-3">
              <button type="button" onClick={() => setIsOpen(false)} className="rounded-full bg-white p-2 text-green-950 shadow" aria-label="Fechar menu gestão">
                <X className="h-5 w-5" />
              </button>
            </div>
            <SidebarContent {...props} onNavigate={() => setIsOpen(false)} />
          </div>
        </div>
      ) : null}
    </>
  );
}
