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
    <main className="min-h-screen bg-amber-50">
      <AdminCookiePersistClient session={session} next={next} maxAge={Number.isFinite(maxAge) ? maxAge : 604800} />
      <div className="sr-only" aria-live="polite">
        Redirecionando para o painel administrativo.
      </div>
    </main>
  );
}
