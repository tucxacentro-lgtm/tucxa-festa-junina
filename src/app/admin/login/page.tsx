"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState } from "react";
import { loginAdmin } from "./actions";

const initialState = {
  ok: false,
  message: "",
};

export default function AdminLoginPage() {
  const [state, formAction, isPending] = useActionState(loginAdmin, initialState);

  return (
    <main className="min-h-screen bg-gradient-to-br from-amber-400 via-orange-400 to-yellow-300 px-5 py-12 text-stone-900">
      <section className="mx-auto flex min-h-[calc(100vh-6rem)] max-w-md items-center justify-center">
        <div className="w-full rounded-[2rem] bg-white/95 p-7 shadow-2xl backdrop-blur">
          <div className="mb-6 flex flex-col items-center text-center">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white shadow">
              <Image
                src="/images/logo-tucxa.jpg"
                alt="Logo Tucxa"
                width={64}
                height={64}
                className="rounded-full object-contain"
                priority
              />
            </div>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-green-800">Admin</p>
            <h1 className="mt-2 text-3xl font-black text-green-950">Acesso administrativo</h1>
            <p className="mt-2 text-sm text-stone-600">
              Entre para acompanhar compras, comprovantes, combos e configurações do Arraiá do Tucxa.
            </p>
          </div>

          <form action={formAction} className="grid gap-4">
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

            {state.message ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
                {state.message}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isPending}
              className="rounded-2xl bg-green-900 px-6 py-4 font-black text-white shadow-lg transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending ? "Entrando..." : "Entrar no admin"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            <Link href="/festa-junina" className="font-bold text-green-900 underline decoration-green-300 underline-offset-4">
              Voltar para a página pública
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
