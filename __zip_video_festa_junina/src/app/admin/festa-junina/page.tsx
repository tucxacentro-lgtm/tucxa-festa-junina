import Link from "next/link";
import { LayoutGrid, type LucideIcon } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { AdminFamiliarizationBox } from "@/components/admin-familiarization-box";
import { AdminPageShell } from "@/components/admin-page-shell";
import { getAdminSidebarSections, type AdminSidebarItem } from "@/lib/admin-menu";
import { getCurrentEventForAdmin } from "@/lib/current-event";

export const dynamic = "force-dynamic";

function displayRole(role: string) {
  return role === "admin" ? "gestão" : role;
}

function depthClass(depth: number) {
  if (depth <= 0) return "";
  if (depth === 1) return "ml-4";
  if (depth === 2) return "ml-8";
  return "ml-12";
}

function AdminCard({ href, icon: Icon, title, description, depth }: { href: string; icon: LucideIcon; title: string; description: string; depth: number }) {
  return (
    <Link href={href} prefetch={false} className={`rounded-3xl bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md ${depthClass(depth)}`}>
      <Icon className="mb-4 h-8 w-8 text-green-800" />
      <h3 className="text-xl font-black text-green-950">{title}</h3>
      <p className="mt-2 text-sm text-stone-600">{description}</p>
    </Link>
  );
}

function itemDescription(item: AdminSidebarItem) {
  if (item.isHeading) return "Agrupador do menu de gestão. Use os itens internos para abrir as páginas relacionadas.";
  if (item.hint) return item.hint;
  if (item.status === "not_used") return "Item visível para mostrar a possibilidade de uso neste evento. Pode ser configurado quando a coordenação decidir utilizar.";
  return "Abrir esta funcionalidade do sistema conforme a sequência do menu lateral.";
}

export default async function AdminFestaJuninaPage() {
  const admin = await requireAdmin(undefined, "/admin/festa-junina");
  const event = await getCurrentEventForAdmin();
  const sections = await getAdminSidebarSections(event.id);

  return (
    <AdminPageShell>
      <section className="mx-auto max-w-6xl px-5 py-12">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="rounded-2xl bg-white px-4 py-3 text-sm text-stone-600 shadow-sm">
            Logado como <strong className="text-green-950">{admin.user.email}</strong> · perfil <strong className="text-green-950">{displayRole(admin.profile.role)}</strong>
          </div>
          <a href="/admin/logout" className="rounded-full bg-white px-4 py-2 text-sm font-bold text-green-950 shadow-sm transition hover:bg-amber-100">
            Sair da gestão
          </a>
        </div>

        <h1 className="text-3xl font-black text-green-950">Painel de Gestão</h1>
        <p className="mt-3 max-w-3xl text-stone-600">
          Painel do evento <strong>{event.name}</strong>. Os cards abaixo seguem a mesma estrutura do menu lateral para facilitar a navegação e a validação página por página.
        </p>

        <AdminFamiliarizationBox />


        <div className="mt-8 grid gap-8">
          {sections.map((section) => (
            <section key={section.title} className="rounded-[2rem] border border-green-100 bg-green-50/30 p-5">
              <h2 className="text-2xl font-black text-green-950">{section.title}</h2>
              <p className="mt-2 text-sm text-stone-600">
                {section.title === "Gestão" ? "Cadastros e orientações gerais do sistema." : "Funcionalidades vinculadas ao evento aberto/selecionado."}
              </p>
              <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {section.items
                  .filter((item) => item.href)
                  .map((item) => (
                    <AdminCard key={item.key} href={item.href ?? "/admin/festa-junina"} icon={LayoutGrid} title={item.label} description={itemDescription(item)} depth={item.depth ?? 0} />
                  ))}
              </div>
            </section>
          ))}
        </div>
      </section>
    </AdminPageShell>
  );
}
