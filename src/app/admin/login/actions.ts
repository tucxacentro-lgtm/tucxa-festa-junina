"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ADMIN_SESSION_COOKIE,
  getAdminSessionSecret,
  isAdminAuthConfigured,
  isValidAdminCredentials,
} from "@/lib/admin-auth";

type LoginState = {
  ok: boolean;
  message: string;
};

function normalize(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

export async function loginAdmin(
  _previousState: LoginState | null,
  formData: FormData,
): Promise<LoginState> {
  const email = normalize(formData.get("email"));
  const password = typeof formData.get("password") === "string" ? String(formData.get("password")) : "";

  if (!isAdminAuthConfigured()) {
    return {
      ok: false,
      message:
        "Login administrativo não configurado. Defina ADMIN_USER_EMAIL, ADMIN_PASSWORD e ADMIN_SESSION_SECRET no .env.local.",
    };
  }

  if (!isValidAdminCredentials(email, password)) {
    return { ok: false, message: "E-mail ou senha inválidos." };
  }

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, getAdminSessionSecret(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });

  redirect("/admin/festa-junina");
}
