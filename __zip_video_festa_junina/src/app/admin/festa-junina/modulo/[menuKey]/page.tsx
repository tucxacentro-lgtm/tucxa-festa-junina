import Link from "next/link";
import { AdminPageShell } from "@/components/admin-page-shell";
import { requireAdmin } from "@/lib/auth";
import { getAdminMenuCatalog } from "@/lib/admin-menu";
import { getMenuTemplate } from "@/lib/menu-templates";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ menuKey: string }> };

function templateInstructions(templateKey: string) {
  switch (templateKey) {
    case "simple_registry":
      return "Este módulo pode evoluir para um cadastro simples com lista, botão de novo registro e edição dos itens.";
    case "module_config":
      return "Este módulo pode começar com uma tela de configuração inicial para definir regras, responsáveis e parâmetros do evento.";
    case "list_new":
      return "Este módulo pode abrir uma lista vazia e um botão para criar o primeiro cadastro do evento.";
    case "checklist":
      return "Este módulo pode ser tratado como checklist com status, responsável, prazo e observações.";
    case "report_bi":
      return "Este módulo pode evoluir para um relatório/BI com filtros e escolha de campos.";
    case "operation":
      return "Este módulo pode ser organizado como tela operacional do dia do evento, com ações rápidas e histórico.";
    case "help":
      return "Este módulo pode concentrar orientações, manuais, treinamento e materiais de apoio.";
    default:
      return "Este item ainda não tem uma tela específica. Use o cadastro do menu para associar uma rota pronta ou manter este template de preparação.";
  }
}

export default async function MenuTemplatePage({ params }: PageProps) {
  await requireAdmin(["admin", "coordenador", "caixa", "cozinha", "entrega", "garcom"], "/admin/festa-junina");
  const { menuKey } = await params;
  const catalog = await getAdminMenuCatalog();
  const item = catalog.find((entry) => entry.item_key === menuKey);
  const template = getMenuTemplate(item?.template_key);

  return (
    <AdminPageShell>
      <section className="mx-auto max-w-5xl px-5 py-10">
        <Link href="/admin/festa-junina/menu" className="rounded-full bg-white px-4 py-2 text-sm font-black text-green-950 shadow-sm">← Voltar ao cadastro do menu</Link>
        <div className="mt-8 rounded-[2rem] border border-green-100 bg-white p-6 shadow-sm">
          <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-black text-amber-900">Template padrão</span>
          <h1 className="mt-4 text-3xl font-black text-green-950">{item?.label ?? menuKey}</h1>
          <p className="mt-3 max-w-3xl text-stone-700">{item?.description ?? "Item cadastrado no menu configurável."}</p>
          <div className="mt-6 rounded-3xl border border-amber-100 bg-amber-50 p-5">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-amber-900">{template.label}</p>
            <p className="mt-2 text-sm leading-relaxed text-stone-700">{template.description}</p>
            <p className="mt-3 text-sm leading-relaxed text-stone-700">{templateInstructions(template.key)}</p>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/admin/festa-junina/menu" className="rounded-2xl bg-green-900 px-5 py-3 text-sm font-black text-white">Editar item do menu</Link>
            <Link href="/admin/festa-junina" className="rounded-2xl border border-green-100 bg-white px-5 py-3 text-sm font-black text-green-950">Voltar ao painel</Link>
          </div>
        </div>
      </section>
    </AdminPageShell>
  );
}
