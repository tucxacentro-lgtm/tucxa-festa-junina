"use client";

import { HelpCircle, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { getHelpContent } from "@/lib/help-content";

export function HelpButton({ compact = false }: { compact?: boolean }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const help = getHelpContent(pathname);


  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    window.setTimeout(() => closeButtonRef.current?.focus(), 0);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  const modal =
    isOpen && typeof document !== "undefined"
      ? createPortal(
          <div
            className="fixed inset-0 z-[9999] flex min-h-dvh items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="help-dialog-title"
            onClick={() => setIsOpen(false)}
          >
            <div
              className="relative flex max-h-[88dvh] w-full max-w-2xl flex-col overflow-hidden rounded-[1.5rem] bg-amber-50 shadow-2xl ring-1 ring-black/10 sm:rounded-[2rem]"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex shrink-0 items-start justify-between gap-4 border-b border-amber-100 bg-amber-50 p-5 sm:p-7">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-green-800">Ajuda desta tela</p>
                  <h2 id="help-dialog-title" className="mt-2 text-2xl font-black text-green-950">
                    {help.title}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-stone-700">{help.description}</p>
                </div>
                <button
                  ref={closeButtonRef}
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="sticky top-0 shrink-0 rounded-full bg-white p-2 text-green-950 shadow-sm transition hover:bg-amber-100 focus:outline-none focus:ring-2 focus:ring-green-800"
                  aria-label="Fechar ajuda"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-5 sm:p-7">
                <div className="grid gap-4">
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
          </div>,
          document.body,
        )
      : null;

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

      {modal}
    </>
  );
}
