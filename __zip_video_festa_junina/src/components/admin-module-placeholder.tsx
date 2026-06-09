import Link from "next/link";
import { AdminPageShell } from "@/components/admin-page-shell";

export function AdminModulePlaceholder({
  eyebrow = "Módulo em preparação",
  title,
  description,
  bullets = [],
}: {
  eyebrow?: string;
  title: string;
  description: string;
  bullets?: string[];
}) {
  return (
    <AdminPageShell>
      <section className="mx-auto max-w-5xl px-5 py-12">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <Link href="/admin/festa-junina" className="rounded-full bg-white px-4 py-2 text-sm font-bold text-green-950 shadow-sm transition hover:bg-amber-100" prefetch={false}>
            ← Painel do evento
          </Link>
          <a href="/admin/logout" className="rounded-full bg-white px-4 py-2 text-sm font-bold text-green-950 shadow-sm transition hover:bg-amber-100">
            Sair da gestão
          </a>
        </div>

        <article className="rounded-[2rem] bg-white p-8 shadow-sm">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-green-800">{eyebrow}</p>
          <h1 className="mt-2 text-3xl font-black text-green-950">{title}</h1>
          <p className="mt-3 max-w-3xl text-stone-700">{description}</p>

          {bullets.length ? (
            <div className="mt-6 rounded-3xl bg-amber-50 p-5">
              <h2 className="font-black text-green-950">O que este módulo deve contemplar</h2>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-stone-700">
                {bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </article>
      </section>
    </AdminPageShell>
  );
}
