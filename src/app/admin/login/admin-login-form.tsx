import Link from "next/link";

export function AdminLoginForm({ next }: { next: string }) {
  return (
    <form action="/admin/login/submit" method="post" className="grid gap-4">
      <input type="hidden" name="next" value={next} />

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

      <button
        type="submit"
        className="rounded-2xl bg-green-900 px-6 py-4 font-black text-white shadow-lg transition hover:bg-green-800"
      >
        Entrar no admin
      </button>

      <div className="text-center text-sm">
        <Link href="/admin/esqueci-senha" className="font-bold text-green-900 underline decoration-green-300 underline-offset-4" prefetch={false}>
          Esqueci minha senha
        </Link>
      </div>
    </form>
  );
}
