"use server";

import { createSupabaseServerClient } from "@/lib/supabaseServer";

export type ForgotPasswordState = {
  ok: boolean;
  message: string;
};

function normalize(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function getBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : undefined) ||
    "http://localhost:3000"
  );
}

export async function sendPasswordReset(
  _previousState: ForgotPasswordState | null,
  formData: FormData,
): Promise<ForgotPasswordState> {
  const email = normalize(formData.get("email")).toLowerCase();

  if (!email || !email.includes("@")) {
    return { ok: false, message: "Informe um e-mail válido." };
  }

  const supabase = createSupabaseServerClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${getBaseUrl()}/admin/redefinir-senha`,
  });

  if (error) {
    return { ok: false, message: `Não foi possível enviar o e-mail de recuperação: ${error.message}` };
  }

  return {
    ok: true,
    message: "Se este e-mail estiver cadastrado e autorizado, você receberá um link para redefinir a senha.",
  };
}
