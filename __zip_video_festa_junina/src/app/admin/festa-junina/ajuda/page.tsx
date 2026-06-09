import Link from "next/link";
import { AdminPageShell } from "@/components/admin-page-shell";
import { helpManualSections } from "@/lib/help-content";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AjudaAdminPage() {
  await requireAdmin(undefined, "/admin/festa-junina/ajuda");

  return (
    <AdminPageShell>
      <section className="mx-auto max-w-6xl px-5 py-12">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <Link href="/admin/festa-junina" className="rounded-full bg-white px-4 py-2 text-sm font-bold text-green-950 shadow-sm transition hover:bg-amber-100" prefetch={false}>
            ← Painel de Gestão
          </Link>
          <a href="/admin/logout" className="rounded-full bg-white px-4 py-2 text-sm font-bold text-green-950 shadow-sm transition hover:bg-amber-100">
            Sair da gestão
          </a>
        </div>

        <p className="text-sm font-black uppercase tracking-[0.18em] text-green-800">Manual rápido</p>
        <h1 className="mt-2 text-3xl font-black text-green-950">Como usar o sistema</h1>
        <p className="mt-3 max-w-3xl text-stone-700">
          Esta página reúne as principais orientações do sistema. Em cada tela, o botão <strong>Ajuda</strong> mostra uma orientação contextual resumida.
        </p>

        <div className="mt-8 grid gap-5">
          {helpManualSections.map((item) => (
            <article key={item.path} className="rounded-3xl bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-xs font-bold text-stone-500">{item.path}</p>
                  <h2 className="mt-1 text-xl font-black text-green-950">{item.title}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-stone-700">{item.description}</p>
                </div>
                <Link
                  href={item.path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-green-900 px-4 py-2 text-center text-sm font-black text-white transition hover:bg-green-800"
                 prefetch={false}>
                  Abrir tela
                </Link>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {item.sections.map((section) => (
                  <div key={section.title} className="rounded-2xl bg-amber-50 p-4">
                    <h3 className="font-black text-green-950">{section.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-stone-700">{section.body}</p>
                    {section.bullets?.length ? (
                      <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-stone-700">
                        {section.bullets.map((bullet) => (
                          <li key={bullet}>{bullet}</li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
    </AdminPageShell>
  );
}
