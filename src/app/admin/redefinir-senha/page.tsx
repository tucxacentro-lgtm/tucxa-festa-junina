import { ResetPasswordForm } from "./reset-password-form";

export default function RedefinirSenhaPage() {
  return (
    <main className="min-h-screen bg-amber-50 px-5 py-12 text-stone-900">
      <section className="mx-auto max-w-md rounded-[2rem] bg-white p-7 shadow-sm">
        <p className="text-sm font-black uppercase tracking-[0.2em] text-green-800">Gestão</p>
        <h1 className="mt-2 text-3xl font-black text-green-950">Redefinir senha</h1>
        <p className="mt-3 text-sm leading-relaxed text-stone-600">
          Abra esta página pelo link enviado pelo Supabase e cadastre uma nova senha.
        </p>

        <ResetPasswordForm />
      </section>
    </main>
  );
}
