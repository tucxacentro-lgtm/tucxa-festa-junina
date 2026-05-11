"use client";

import { HelpCircle, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { getHelpContent } from "@/lib/help-content";

export function HelpButton({ compact = false }: { compact?: boolean }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const help = getHelpContent(pathname);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={
          compact
            ? "inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-black text-green-950 shadow-sm ring-1 ring-amber-200 transition hover:bg-amber-100"
            : "inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-black text-green-950 shadow-sm ring-1 ring-amber-200 transition hover:bg-amber-100"
        }
        title="Abrir ajuda desta tela"
      >
        <HelpCircle className="h-4 w-4" />
        <span className={compact ? "hidden sm:inline" : ""}>Ajuda</span>
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-[100] flex items-end bg-black/40 p-3 sm:items-center sm:justify-center" role="dialog" aria-modal="true">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-[2rem] bg-amber-50 p-5 shadow-2xl sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-green-800">Ajuda desta tela</p>
                <h2 className="mt-2 text-2xl font-black text-green-950">{help.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-stone-700">{help.description}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-full bg-white p-2 text-green-950 shadow-sm transition hover:bg-amber-100"
                aria-label="Fechar ajuda"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-6 grid gap-4">
              {help.sections.map((section) => (
                <article key={section.title} className="rounded-3xl bg-white p-4 shadow-sm">
                  <h3 className="font-black text-green-950">{section.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-stone-700">{section.body}</p>
                  {section.bullets?.length ? (
                    <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-stone-700">
                      {section.bullets.map((bullet) => (
                        <li key={bullet}>{bullet}</li>
                      ))}
                    </ul>
                  ) : null}
                </article>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
