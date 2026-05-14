import Link from "next/link";
import { ForgotPasswordForm } from "./forgot-password-form";

export default function EsqueciSenhaPage() {
  return (
    <main className="min-h-screen bg-amber-50 px-5 py-12 text-stone-900">
      <section className="mx-auto max-w-md rounded-[2rem] bg-white p-7 shadow-sm">
        <p className="text-sm font-black uppercase tracking-[0.2em] text-green-800">Gestão</p>
        <h1 className="mt-2 text-3xl font-black text-green-950">Recuperar senha</h1>
        <p className="mt-3 text-sm leading-relaxed text-stone-600">
          Informe o e-mail cadastrado no Supabase Auth. O link de recuperação precisa estar liberado nas URLs do Supabase.
        </p>

        <ForgotPasswordForm />

        <div className="mt-6 text-center text-sm">
          <Link href="/admin/login" className="font-bold text-green-900 underline decoration-green-300 underline-offset-4" prefetch={false}>
            Voltar para o login
          </Link>
        </div>
      </section>
    </main>
  );
}
