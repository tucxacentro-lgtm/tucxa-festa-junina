"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

function getHashTokens() {
  if (typeof window === "undefined") return { accessToken: "", refreshToken: "" };

  const hash = window.location.hash.startsWith("#") ? window.location.hash.slice(1) : window.location.hash;
  const params = new URLSearchParams(hash);

  return {
    accessToken: params.get("access_token") ?? "",
    refreshToken: params.get("refresh_token") ?? "",
  };
}

export function ResetPasswordForm() {
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [ok, setOk] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const tokens = useMemo(() => getHashTokens(), []);

  useEffect(() => {
    async function setRecoverySession() {
      if (!tokens.accessToken || !tokens.refreshToken) {
        setMessage("Link de recuperação inválido ou expirado. Solicite um novo link.");
        setReady(false);
        return;
      }

      const { error } = await supabase.auth.setSession({
        access_token: tokens.accessToken,
        refresh_token: tokens.refreshToken,
      });

      if (error) {
        setMessage(`Não foi possível validar o link: ${error.message}`);
        setReady(false);
        return;
      }

      setReady(true);
      setMessage("");
    }

    void setRecoverySession();
  }, [tokens.accessToken, tokens.refreshToken]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setOk(false);

    if (password.length < 8) {
      setMessage("A senha deve ter pelo menos 8 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("As senhas não conferem.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      setMessage(`Não foi possível atualizar a senha: ${error.message}`);
      return;
    }

    setOk(true);
    setMessage("Senha atualizada com sucesso. Agora você já pode entrar no admin.");
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
      <label className="grid gap-2 text-sm font-bold text-green-950">
        Nova senha
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          disabled={!ready || loading || ok}
          required
          minLength={8}
          className="rounded-2xl border border-amber-200 px-4 py-3 font-normal outline-none transition focus:border-green-700 focus:ring-2 focus:ring-green-100 disabled:bg-stone-100"
        />
      </label>

      <label className="grid gap-2 text-sm font-bold text-green-950">
        Confirmar nova senha
        <input
          type="password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          disabled={!ready || loading || ok}
          required
          minLength={8}
          className="rounded-2xl border border-amber-200 px-4 py-3 font-normal outline-none transition focus:border-green-700 focus:ring-2 focus:ring-green-100 disabled:bg-stone-100"
        />
      </label>

      {message ? (
        <div className={`rounded-2xl border p-4 text-sm font-semibold ${ok ? "border-green-200 bg-green-50 text-green-800" : "border-red-200 bg-red-50 text-red-700"}`}>
          {message}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={!ready || loading || ok}
        className="rounded-2xl bg-green-900 px-6 py-4 font-black text-white shadow-lg transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Atualizando..." : "Atualizar senha"}
      </button>

      <Link href="/admin/login" className="text-center text-sm font-bold text-green-900 underline decoration-green-300 underline-offset-4" prefetch={false}>
        Ir para o login
      </Link>
    </form>
  );
}
