import Link from "next/link";
import { AdminCookiePersistClient } from "./persist-client";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function getStringParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function normalizeNext(value: string | undefined) {
  if (!value || !value.startsWith("/admin") || value.startsWith("//")) return "/admin/festa-junina";
  if (value.startsWith("/admin/login") || value.startsWith("/admin/logout")) return "/admin/festa-junina";
  return value;
}

export default async function AdminLoginPersistPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const session = getStringParam(params?.session) ?? "";
  const next = normalizeNext(getStringParam(params?.next));
  const maxAge = Number(getStringParam(params?.maxAge) ?? "604800");

  return (
    <main className="min-h-screen bg-amber-50 px-5 py-10 text-stone-900">
      <section className="mx-auto max-w-xl rounded-[2rem] bg-white p-6 shadow-sm">
        <p className="text-sm font-black uppercase tracking-[0.2em] text-green-700">Admin</p>
        <h1 className="mt-2 text-3xl font-black text-green-950">Concluindo login...</h1>
        <p className="mt-3 text-sm leading-relaxed text-stone-600">
          Estamos gravando a sessão administrativa neste navegador. Em alguns navegadores, este passo garante que o cookie fique disponível para todas as telas do admin.
        </p>

        <AdminCookiePersistClient session={session} next={next} maxAge={Number.isFinite(maxAge) ? maxAge : 604800} />

        <div className="mt-6 rounded-2xl bg-amber-50 p-4 text-sm text-stone-700">
          Se não avançar automaticamente em alguns segundos, clique no botão abaixo.
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <Link href={next} className="rounded-2xl bg-green-900 px-5 py-3 font-black text-white" prefetch={false}>
            Ir para o admin
          </Link>
          <Link href="/admin/session-check" className="rounded-2xl bg-white px-5 py-3 font-black text-green-950 shadow-sm ring-1 ring-amber-100" prefetch={false}>
            Ver diagnóstico
          </Link>
        </div>
      </section>
    </main>
  );
}
