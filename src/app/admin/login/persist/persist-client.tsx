"use client";

import { useEffect, useState } from "react";

const ADMIN_SESSION_COOKIE = "tucxa_admin_session";

function setBrowserCookie(name: string, value: string, maxAge: number) {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAge}; SameSite=Lax${secure}`;
}

function hasCookie(name: string) {
  return document.cookie.split(";").some((part) => part.trim().startsWith(`${name}=`));
}

export function AdminCookiePersistClient({ session, next, maxAge }: { session: string; next: string; maxAge: number }) {
  const [status, setStatus] = useState(
    session ? "Preparando sessão administrativa..." : "Sessão não recebida. Faça login novamente.",
  );

  useEffect(() => {
    if (!session) {
      return;
    }

    let timeoutId: number | undefined;

    try {
      setBrowserCookie(ADMIN_SESSION_COOKIE, session, maxAge);
      window.localStorage.setItem(ADMIN_SESSION_COOKIE, session);

      timeoutId = window.setTimeout(() => {
        if (hasCookie(ADMIN_SESSION_COOKIE)) {
          setStatus("Sessão gravada. Redirecionando...");
          window.location.replace(next);
          return;
        }

        setStatus(
          "O navegador não aceitou o cookie. Verifique se cookies estão permitidos para este site e tente novamente.",
        );
      }, 250);
    } catch {
      timeoutId = window.setTimeout(() => {
        setStatus("Não foi possível gravar a sessão. Verifique as permissões de cookies do navegador.");
      }, 0);
    }

    return () => {
      if (typeof timeoutId === "number") {
        window.clearTimeout(timeoutId);
      }
    };
  }, [session, next, maxAge]);

  return <p className="mt-4 text-sm font-bold text-green-950">{status}</p>;
}
