import Image from "next/image";
import Link from "next/link";
import { AdminLoginForm } from "./admin-login-form";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminLoginPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const nextParam = params?.next;
  const next = Array.isArray(nextParam) ? nextParam[0] ?? "/admin/festa-junina" : nextParam ?? "/admin/festa-junina";
  const erroParam = params?.erro;
  const erro = Array.isArray(erroParam) ? erroParam[0] : erroParam;

  return (
    <main className="min-h-screen bg-gradient-to-br from-amber-400 via-orange-400 to-yellow-300 px-5 py-12 text-stone-900">
      <section className="mx-auto flex min-h-[calc(100vh-6rem)] max-w-md items-center justify-center">
        <div className="w-full rounded-[2rem] bg-white/95 p-7 shadow-2xl backdrop-blur">
          <div className="mb-6 flex flex-col items-center text-center">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white shadow">
              <Image
                src="/images/logo-tucxa.jpg"
                alt="Logo Tucxa"
                width={64}
                height={64}
                className="rounded-full object-contain"
                priority
              />
            </div>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-green-800">Gestão</p>
            <h1 className="mt-2 text-3xl font-black text-green-950">Acesso administrativo</h1>
            <p className="mt-2 text-sm text-stone-600">
              Entre com um usuário real do Supabase Auth autorizado em admin_profiles.
            </p>
          </div>

          {erro ? (
            <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
              {erro}
            </div>
          ) : null}

          <AdminLoginForm next={next} />

          <div className="mt-6 text-center text-sm">
            <Link href="/festa-junina" className="font-bold text-green-900 underline decoration-green-300 underline-offset-4" prefetch={false}>
              Voltar para a página pública
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
