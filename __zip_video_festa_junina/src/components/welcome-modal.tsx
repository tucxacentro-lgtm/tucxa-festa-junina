"use client";

import Link from "next/link";
import { X } from "lucide-react";
import { useState } from "react";
import { WhatsAppSupportButton } from "@/components/whatsapp-support-button";

const STORAGE_KEY = "tucxa_festa_junina_welcome_hidden_v1";

export function WelcomeModal() {
  const [isOpen, setIsOpen] = useState(() => {
    if (typeof window === "undefined") return false;

    try {
      return window.localStorage.getItem(STORAGE_KEY) !== "1";
    } catch {
      return true;
    }
  });

  function close() {
    setIsOpen(false);
  }

  function closeAndDontShowAgain() {
    try {
      window.localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // localStorage pode estar indisponível em alguns navegadores; nesse caso apenas fecha.
    }

    close();
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-end bg-green-950/35 p-3 backdrop-blur-sm sm:items-center sm:justify-center">
      <div className="relative max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-[2rem] bg-white shadow-2xl">
        <button
          type="button"
          onClick={close}
          className="absolute right-5 top-5 rounded-full bg-amber-50 p-3 text-green-950 shadow-sm transition hover:bg-amber-100"
          aria-label="Fechar boas-vindas"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="p-6 pr-16 sm:p-8 sm:pr-20">
          <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-black text-green-900">
            Primeira visita
          </span>
          <h2 className="mt-5 text-3xl font-black text-green-950">
            Bem-vindo ao sistema da Festa Junina do Tucxa
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-stone-700 sm:text-base">
            Aqui você pode garantir seu convite, escolher combos*, anexar o
            comprovante, acompanhar sua compra pelo código/QR Code e
            compartilhar seu link de indicação*.
          </p>
          <p className="mt-2 max-w-2xl text-xs font-bold text-green-900 sm:text-sm">
            *quando disponíveis
          </p>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-stone-700 sm:text-base">
            Comprar antecipadamente não é só reservar a entrada: ajuda o Tucxa a
            planejar melhor alimentos, bebidas, voluntários, mesas e atendimento
            para receber todos com mais conforto, menos fila e mais organização.
          </p>

          <div className="mt-6 grid gap-3 md:grid-cols-3">
            <article className="rounded-2xl border border-green-100 bg-amber-50 p-4">
              <h3 className="font-black text-green-950">Antes da festa</h3>
              <p className="mt-2 text-sm leading-relaxed text-stone-700">
                Conheça nosso delicioso{" "}
                <Link
                  href="/cardapio/arraia-tucxa-2026"
                  className="font-black text-green-900 underline"
                  onClick={close}
                  prefetch={false}
                >
                  cardápio
                </Link>{" "}
                e, caso seja orientado pela coordenação do evento, registre seu
                convite, envie o comprovante e guarde o código da compra.
              </p>
            </article>
            <article className="rounded-2xl border border-green-100 bg-amber-50 p-4">
              <h3 className="font-black text-green-950">No dia do evento</h3>
              <p className="mt-2 text-sm leading-relaxed text-stone-700">
                Apresente o código/QR Code ou convite na entrada e acompanhe as
                próximas etapas conforme orientação. Faça seu pedido com um{" "}
                <Link
                  href="/gestao-evento/garcom"
                  className="font-black text-green-900 underline"
                  onClick={close}
                  prefetch={false}
                >
                  garçom
                </Link>
                .
              </p>
            </article>
            <article className="rounded-2xl border border-green-100 bg-amber-50 p-4">
              <h3 className="font-black text-green-950">Suporte</h3>
              <p className="mt-2 text-sm leading-relaxed text-stone-700">
                Em caso de dúvida, toque no botão abaixo para falar com o
                suporte pelo WhatsApp.
              </p>
            </article>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-amber-100 bg-amber-50 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/festa-junina#reserva"
              onClick={close}
              className="rounded-2xl bg-green-900 px-5 py-3 text-center text-sm font-black text-white transition hover:bg-green-800"
              prefetch={false}
            >
              Garantir meu convite
            </Link>
            <button
              type="button"
              onClick={close}
              className="rounded-2xl bg-white px-5 py-3 text-sm font-black text-green-950 shadow-sm transition hover:bg-amber-100"
            >
              Ver depois
            </button>
            <WhatsAppSupportButton />
          </div>
          <button
            type="button"
            onClick={closeAndDontShowAgain}
            className="text-sm font-black text-green-800 underline-offset-4 hover:underline"
          >
            Não mostrar novamente neste navegador
          </button>
        </div>
      </div>
    </div>
  );
}
