"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";

function setBrowserCookie(name: string, value: string, maxAge: number) {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAge}; SameSite=Lax${secure}`;
}

export function AdminLoginForm({ next }: { next: string }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const form = event.currentTarget;
      const formData = new FormData(form);

      const response = await fetch("/admin/login/submit", {
        method: "POST",
        body: formData,
        headers: {
          "x-admin-login-fetch": "1",
        },
        credentials: "same-origin",
      });

      const payload = (await response.json()) as {
        ok?: boolean;
        error?: string;
        next?: string;
        cookies?: Array<{ name: string; value: string; maxAge: number }>;
      };

      if (!response.ok || !payload.ok) {
        setError(payload.error ?? "Não foi possível entrar. Verifique os dados e tente novamente.");
        return;
      }

      // Fallback intencional: além do Set-Cookie server-side, grava a sessão assinada no navegador.
      // Isso evita perder login em ambientes onde o redirect/Set-Cookie é bloqueado ou não persistido.
      for (const cookie of payload.cookies ?? []) {
        setBrowserCookie(cookie.name, cookie.value, cookie.maxAge);
      }

      window.location.assign(payload.next ?? next ?? "/admin/festa-junina");
    } catch {
      setError("Não foi possível entrar. Verifique sua conexão e tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form action="/admin/login/submit" method="post" className="grid gap-4" onSubmit={handleSubmit}>
      <input type="hidden" name="next" value={next} />

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          {error}
        </div>
      ) : null}

      <label className="grid gap-2 text-sm font-bold text-green-950">
        E-mail
        <input
          name="email"
          type="email"
          autoComplete="username"
          required
          className="rounded-2xl border border-amber-200 px-4 py-3 font-normal outline-none transition focus:border-green-700 focus:ring-2 focus:ring-green-100"
          placeholder="admin@tucxa.com.br"
        />
      </label>

      <label className="grid gap-2 text-sm font-bold text-green-950">
        Senha
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="rounded-2xl border border-amber-200 px-4 py-3 font-normal outline-none transition focus:border-green-700 focus:ring-2 focus:ring-green-100"
          placeholder="Digite a senha"
        />
      </label>

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-2xl bg-green-900 px-6 py-4 font-black text-white shadow-lg transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Entrando..." : "Entrar no admin"}
      </button>

      <div className="text-center text-sm">
        <Link href="/admin/esqueci-senha" className="font-bold text-green-900 underline decoration-green-300 underline-offset-4">
          Esqueci minha senha
        </Link>
      </div>
    </form>
  );
}
