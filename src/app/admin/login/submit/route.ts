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

function getCookieOptions(maxAge: number, httpOnly = true) {
  return {
    httpOnly,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  };
}

function wantsJson(request: NextRequest) {
  return request.headers.get("x-admin-login-fetch") === "1";
}

function redirectWithError(request: NextRequest, message: string, next: string) {
  const url = new URL("/admin/login", request.url);
  url.searchParams.set("next", next);
  url.searchParams.set("erro", message);
  return NextResponse.redirect(url, { status: 303 });
}

function jsonWithError(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

function applyAdminCookies(
  response: NextResponse,
  values: {
    adminSessionToken: string;
    accessToken?: string;
    refreshToken?: string;
    adminSessionMaxAge: number;
    accessTokenMaxAge: number;
    refreshTokenMaxAge: number;
  },
) {
  response.cookies.set(ADMIN_SESSION_COOKIE, values.adminSessionToken, getCookieOptions(values.adminSessionMaxAge));

  if (values.accessToken) {
    response.cookies.set(ADMIN_ACCESS_TOKEN_COOKIE, values.accessToken, getCookieOptions(values.accessTokenMaxAge));
  }

  if (values.refreshToken) {
    response.cookies.set(ADMIN_REFRESH_TOKEN_COOKIE, values.refreshToken, getCookieOptions(values.refreshTokenMaxAge));
  }
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const email = normalize(formData.get("email")).toLowerCase();
  const password = typeof formData.get("password") === "string" ? String(formData.get("password")) : "";
  const next = normalizeNext(normalize(formData.get("next")));
  const jsonMode = wantsJson(request);

  if (!email || !password) {
    return jsonMode ? jsonWithError("Informe e-mail e senha.") : redirectWithError(request, "Informe e-mail e senha.", next);
  }

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.session || !data.user) {
    return jsonMode ? jsonWithError("E-mail ou senha inválidos.", 401) : redirectWithError(request, "E-mail ou senha inválidos.", next);
  }

  const adminClient = createSupabaseAdminClient();
  const { data: profile, error: profileError } = await adminClient
    .from("admin_profiles")
    .select("id, role, active")
    .eq("id", data.user.id)
    .eq("active", true)
    .single();

  if (profileError || !profile) {
    const message = "Usuário autenticado, mas sem permissão administrativa ativa. Verifique o cadastro em admin_profiles.";
    return jsonMode ? jsonWithError(message, 403) : redirectWithError(request, message, next);
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

  if (jsonMode) {
    const response = NextResponse.json({
      ok: true,
      next,
      cookies: [
        {
          name: ADMIN_SESSION_COOKIE,
          value: adminSessionToken,
          maxAge: adminSessionMaxAge,
        },
      ],
    });

    applyAdminCookies(response, {
      adminSessionToken,
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      adminSessionMaxAge,
      accessTokenMaxAge,
      refreshTokenMaxAge,
    });

    return response;
  }

  const response = NextResponse.redirect(new URL(next, request.url), { status: 303 });
  applyAdminCookies(response, {
    adminSessionToken,
    accessToken: data.session.access_token,
    refreshToken: data.session.refresh_token,
    adminSessionMaxAge,
    accessTokenMaxAge,
    refreshTokenMaxAge,
  });

  return response;
}
