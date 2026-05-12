"use client";

import { useEffect, useState } from "react";

const ADMIN_SESSION_COOKIE = "tucxa_admin_session";

type BrowserDiagnostics = {
  browserCookie: boolean;
  localStorageSession: boolean;
};

function hasBrowserCookie(name: string) {
  return document.cookie.split(";").some((part) => part.trim().startsWith(`${name}=`));
}

export function SessionCheckClientDiagnostics() {
  const [diagnostics, setDiagnostics] = useState<BrowserDiagnostics | null>(null);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDiagnostics({
        browserCookie: hasBrowserCookie(ADMIN_SESSION_COOKIE),
        localStorageSession: Boolean(window.localStorage.getItem(ADMIN_SESSION_COOKIE)),
      });
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  return (
    <div className="mt-6 rounded-2xl border border-amber-100 bg-amber-50 p-4 text-sm text-stone-700">
      <p className="font-black text-green-950">Diagnóstico do navegador</p>
      <p className="mt-2">
        Cookie visível no navegador: <strong>{diagnostics === null ? "verificando..." : diagnostics.browserCookie ? "Sim" : "Não"}</strong>
      </p>
      <p>
        LocalStorage com sessão: <strong>{diagnostics === null ? "verificando..." : diagnostics.localStorageSession ? "Sim" : "Não"}</strong>
      </p>
      <p className="mt-2 text-xs leading-relaxed">
        Quando a sessão do servidor estiver válida, o cookie pode aparecer como “Não” aqui por estar protegido como HttpOnly. Isso é esperado e mais seguro. Use este bloco apenas como apoio ao diagnóstico.
      </p>
    </div>
  );
}
