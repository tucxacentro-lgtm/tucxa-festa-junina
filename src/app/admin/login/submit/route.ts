import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_ACCESS_TOKEN_COOKIE,
  ADMIN_REFRESH_TOKEN_COOKIE,
  ADMIN_SESSION_COOKIE,
  createAdminSessionToken,
} from "@/lib/admin-auth";
import { createSupabaseAdminClient, createSupabaseServerClient } from "@/lib/supabaseServer";

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

function getCookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  };
}

function redirectWithError(request: NextRequest, message: string, next: string) {
  const url = new URL("/admin/login", request.url);
  url.searchParams.set("next", next);
  url.searchParams.set("erro", message);
  return NextResponse.redirect(url, { status: 303 });
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const email = normalize(formData.get("email")).toLowerCase();
  const password = typeof formData.get("password") === "string" ? String(formData.get("password")) : "";
  const next = normalizeNext(normalize(formData.get("next")));

  if (!email || !password) {
    return redirectWithError(request, "Informe e-mail e senha.", next);
  }

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.session || !data.user) {
    return redirectWithError(request, "E-mail ou senha inválidos.", next);
  }

  const adminClient = createSupabaseAdminClient();
  const { data: profile, error: profileError } = await adminClient
    .from("admin_profiles")
    .select("id, role, active")
    .eq("id", data.user.id)
    .eq("active", true)
    .single();

  if (profileError || !profile) {
    return redirectWithError(
      request,
      "Usuário autenticado, mas sem permissão administrativa ativa. Verifique o cadastro em admin_profiles.",
      next,
    );
  }

  const adminSessionMaxAge = 60 * 60 * 24 * 7;
  const accessTokenMaxAge = data.session.expires_in ?? 60 * 60 * 8;
  const refreshTokenMaxAge = 60 * 60 * 24 * 30;

  const adminSessionToken = createAdminSessionToken({
    userId: data.user.id,
    email: data.user.email ?? email,
    role: profile.role,
    expiresAt: Date.now() + adminSessionMaxAge * 1000,
  });

  const response = NextResponse.redirect(new URL(next, request.url), { status: 303 });

  // Definido diretamente no NextResponse para garantir que o Set-Cookie seja enviado no redirect.
  response.cookies.set(ADMIN_SESSION_COOKIE, adminSessionToken, getCookieOptions(adminSessionMaxAge));
  response.cookies.set(ADMIN_ACCESS_TOKEN_COOKIE, data.session.access_token, getCookieOptions(accessTokenMaxAge));
  response.cookies.set(ADMIN_REFRESH_TOKEN_COOKIE, data.session.refresh_token, getCookieOptions(refreshTokenMaxAge));

  return response;
}
