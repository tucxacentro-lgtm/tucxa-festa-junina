import { ClipboardList, CreditCard, Settings, Ticket, Utensils, Gift, Share2, ClipboardCheck, Megaphone, UsersRound, ListChecks, Warehouse, type LucideIcon } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { AdminFamiliarizationBox } from "@/components/admin-familiarization-box";
import { AdminPageShell } from "@/components/admin-page-shell";

export const dynamic = "force-dynamic";

function AdminCard({ href, icon: Icon, title, description }: { href: string; icon: LucideIcon; title: string; description: string }) {
  return (
    <a href={href} className="rounded-3xl bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <Icon className="mb-4 h-8 w-8 text-green-800" />
      <h2 className="text-xl font-black text-green-950">{title}</h2>
      <p className="mt-2 text-sm text-stone-600">{description}</p>
    </a>
  );
}


export default async function AdminFestaJuninaPage() {
  const admin = await requireAdmin(undefined, "/admin/festa-junina");
  return (
    <AdminPageShell>
      
      <section className="mx-auto max-w-6xl px-5 py-12">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="rounded-2xl bg-white px-4 py-3 text-sm text-stone-600 shadow-sm">
            Logado como <strong className="text-green-950">{admin.user.email}</strong> · perfil <strong className="text-green-950">{admin.profile.role}</strong>
          </div>
          <a href="/admin/logout" className="rounded-full bg-white px-4 py-2 text-sm font-bold text-green-950 shadow-sm transition hover:bg-amber-100">
            Sair do admin
          </a>
        </div>

        <h1 className="text-3xl font-black text-green-950">Administração da Festa Junina</h1>
        <p className="mt-3 max-w-3xl text-stone-600">
          Painel inicial para acompanhar reservas, comprovantes, combos com bingo e configurar a página pública.
        </p>

        <AdminFamiliarizationBox />

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <AdminCard href="/admin/festa-junina/pedidos" icon={ClipboardList} title="Compras e comprovantes" description="Ver reservas, status de pagamento e compras que incluem bingo." />
          <AdminCard href="/admin/festa-junina/configuracoes" icon={Settings} title="Configurações" description="Editar evento, data, local, Pix, status e regras de venda." />
          <AdminCard href="/admin/festa-junina/convites" icon={Ticket} title="Convites" description="Editar tipos de convite, valores, gratuidade e disponibilidade." />
          <AdminCard href="/admin/festa-junina/combos" icon={Gift} title="Combos e ofertas" description="Criar combos com convites, itens e cartelas de bingo." />
          <AdminCard href="/admin/festa-junina/pagamentos" icon={CreditCard} title="Pagamentos" description="Configurar Pix, dinheiro, cartão, cortesia e instruções." />
          <AdminCard href="/admin/festa-junina/indicacoes" icon={Share2} title="Indicações e brindes" description="Configurar código de indicação, compras necessárias e brindes." />
          <AdminCard href="/admin/festa-junina/planejamento" icon={ClipboardCheck} title="Planejamento" description="Sugestão de mesas, voluntários, compras e itens do cardápio." />
          <AdminCard href="/admin/festa-junina/upsell" icon={Megaphone} title="Upsell e mensagens" description="Configurar mensagens para complementar compra com combos, comida, bebida e bingo." />
          <AdminCard href="/admin/festa-junina/cardapio" icon={Utensils} title="Cardápio e ficha técnica" description="Cadastrar itens, consumo por pessoa, insumos e preparo." />
          <AdminCard href="/admin/festa-junina/voluntarios" icon={UsersRound} title="Voluntários" description="Cadastrar equipe e comparar com a sugestão por participantes." />
          <AdminCard href="/admin/festa-junina/checklist" icon={ListChecks} title="Checklist operacional" description="Acompanhar o que está pendente, sugerido, em andamento e confirmado." />
          <AdminCard href="/admin/festa-junina/operacao" icon={Warehouse} title="Operação e simulação" description="Confirmar compras, armazenamento, responsáveis e testes de atendimento/caixa." />
        </div>
      </section>
    </AdminPageShell>
  );
}
