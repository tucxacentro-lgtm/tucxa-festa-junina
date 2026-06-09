"use client";

import { useEffect } from "react";

const ADMIN_SESSION_COOKIE = "tucxa_admin_session";

function setBrowserCookie(name: string, value: string, maxAge: number) {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAge}; SameSite=Lax${secure}`;
}

export function AdminCookiePersistClient({
  session,
  next,
  maxAge,
}: {
  session: string;
  next: string;
  maxAge: number;
}) {
  useEffect(() => {
    if (!session) {
      window.location.replace("/admin/login");
      return;
    }

    try {
      setBrowserCookie(ADMIN_SESSION_COOKIE, session, maxAge);
      window.localStorage.setItem(ADMIN_SESSION_COOKIE, session);
    } catch {
      // Mesmo que o navegador bloqueie o fallback em JS, a sessão HttpOnly gravada
      // pelo servidor continua sendo a fonte principal de autenticação.
    }

    const timeoutId = window.setTimeout(() => {
      window.location.replace(next);
    }, 50);

    return () => window.clearTimeout(timeoutId);
  }, [session, next, maxAge]);

  return null;
}
