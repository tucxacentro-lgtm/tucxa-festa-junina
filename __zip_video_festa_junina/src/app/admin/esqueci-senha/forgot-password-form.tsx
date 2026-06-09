"use client";

import { useActionState } from "react";
import { sendPasswordReset } from "./actions";

const initialState = {
  ok: false,
  message: "",
};

export function ForgotPasswordForm() {
  const [state, formAction, isPending] = useActionState(sendPasswordReset, initialState);

  return (
    <form action={formAction} className="mt-6 grid gap-4">
      <label className="grid gap-2 text-sm font-bold text-green-950">
        E-mail administrativo
        <input
          name="email"
          type="email"
          autoComplete="username"
          required
          className="rounded-2xl border border-amber-200 px-4 py-3 font-normal outline-none transition focus:border-green-700 focus:ring-2 focus:ring-green-100"
          placeholder="admin@tucxa.com.br"
        />
      </label>

      {state.message ? (
        <div className={`rounded-2xl border p-4 text-sm font-semibold ${state.ok ? "border-green-200 bg-green-50 text-green-800" : "border-red-200 bg-red-50 text-red-700"}`}>
          {state.message}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-2xl bg-green-900 px-6 py-4 font-black text-white shadow-lg transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Enviando..." : "Enviar link de recuperação"}
      </button>
    </form>
  );
}
