"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_ACCESS_TOKEN_COOKIE, ADMIN_REFRESH_TOKEN_COOKIE, ADMIN_SESSION_COOKIE, createAdminSessionToken } from "@/lib/admin-auth";
import { createSupabaseAdminClient, createSupabaseServerClient } from "@/lib/supabaseServer";

export type LoginState = {
  ok: boolean;
  message: string;
};

function normalize(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeNext(value: string) {
  if (!value || !value.startsWith("/admin") || value.startsWith("//")) {
    return "/admin/festa-junina";
  }

  if (value.startsWith("/admin/login") || value.startsWith("/admin/logout")) {
    return "/admin/festa-junina";
  }

  return value;
}

export async function loginAdmin(_previousState: LoginState | null, formData: FormData): Promise<LoginState> {
  const email = normalize(formData.get("email")).toLowerCase();
  const password = typeof formData.get("password") === "string" ? String(formData.get("password")) : "";
  const next = normalizeNext(normalize(formData.get("next")));

  if (!email || !password) {
    return { ok: false, message: "Informe e-mail e senha." };
  }

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.session || !data.user) {
    return { ok: false, message: "E-mail ou senha inválidos." };
  }

  const adminClient = createSupabaseAdminClient();
  const { data: profile, error: profileError } = await adminClient
    .from("admin_profiles")
    .select("id, role, active")
    .eq("id", data.user.id)
    .eq("active", true)
    .single();

  if (profileError || !profile) {
    return {
      ok: false,
      message: "Usuário autenticado, mas sem permissão administrativa ativa. Verifique o cadastro em admin_profiles.",
    };
  }

  const cookieStore = await cookies();
  const maxAge = data.session.expires_in ?? 60 * 60 * 8;
  const adminSessionMaxAge = 60 * 60 * 24 * 7;
  const adminSessionToken = createAdminSessionToken({
    userId: data.user.id,
    email: data.user.email ?? email,
    role: profile.role,
    expiresAt: Date.now() + adminSessionMaxAge * 1000,
  });

  cookieStore.set(ADMIN_SESSION_COOKIE, adminSessionToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: adminSessionMaxAge,
  });

  cookieStore.set(ADMIN_ACCESS_TOKEN_COOKIE, data.session.access_token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  });

  cookieStore.set(ADMIN_REFRESH_TOKEN_COOKIE, data.session.refresh_token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  redirect(next);
}
