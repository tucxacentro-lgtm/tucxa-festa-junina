import Link from "next/link";
import { ClipboardList, CreditCard, Settings, Ticket, Utensils, Gift, Share2, ClipboardCheck, Megaphone, UsersRound, ListChecks, Warehouse } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { AdminFamiliarizationBox } from "@/components/admin-familiarization-box";
import { AdminPageShell } from "@/components/admin-page-shell";

export const dynamic = "force-dynamic";

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
          <Link href="/admin/festa-junina/pedidos" className="rounded-3xl bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
            <ClipboardList className="mb-4 h-8 w-8 text-green-800" />
            <h2 className="text-xl font-black text-green-950">Compras e comprovantes</h2>
            <p className="mt-2 text-sm text-stone-600">Ver reservas, status de pagamento e compras que incluem bingo.</p>
          </Link>

          <Link href="/admin/festa-junina/configuracoes" className="rounded-3xl bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
            <Settings className="mb-4 h-8 w-8 text-green-800" />
            <h2 className="text-xl font-black text-green-950">Configurações</h2>
            <p className="mt-2 text-sm text-stone-600">Editar evento, data, local, Pix, status e regras de venda.</p>
          </Link>

          <Link href="/admin/festa-junina/convites" className="rounded-3xl bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
            <Ticket className="mb-4 h-8 w-8 text-green-800" />
            <h2 className="text-xl font-black text-green-950">Convites</h2>
            <p className="mt-2 text-sm text-stone-600">Editar tipos de convite, valores, gratuidade e disponibilidade.</p>
          </Link>

          <Link href="/admin/festa-junina/combos" className="rounded-3xl bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
            <Gift className="mb-4 h-8 w-8 text-green-800" />
            <h2 className="text-xl font-black text-green-950">Combos e ofertas</h2>
            <p className="mt-2 text-sm text-stone-600">Criar combos com convites, itens e cartelas de bingo.</p>
          </Link>

          <Link href="/admin/festa-junina/pagamentos" className="rounded-3xl bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
            <CreditCard className="mb-4 h-8 w-8 text-green-800" />
            <h2 className="text-xl font-black text-green-950">Pagamentos</h2>
            <p className="mt-2 text-sm text-stone-600">Configurar Pix, dinheiro, cartão, cortesia e instruções.</p>
          </Link>

          <Link href="/admin/festa-junina/indicacoes" className="rounded-3xl bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
            <Share2 className="mb-4 h-8 w-8 text-green-800" />
            <h2 className="text-xl font-black text-green-950">Indicações e brindes</h2>
            <p className="mt-2 text-sm text-stone-600">Configurar código de indicação, compras necessárias e brindes.</p>
          </Link>

          <Link href="/admin/festa-junina/planejamento" className="rounded-3xl bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
            <ClipboardCheck className="mb-4 h-8 w-8 text-green-800" />
            <h2 className="text-xl font-black text-green-950">Planejamento</h2>
            <p className="mt-2 text-sm text-stone-600">Sugestão de mesas, voluntários, compras e itens do cardápio.</p>
          </Link>



          <Link href="/admin/festa-junina/upsell" className="rounded-3xl bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
            <Megaphone className="mb-4 h-8 w-8 text-green-800" />
            <h2 className="text-xl font-black text-green-950">Upsell e mensagens</h2>
            <p className="mt-2 text-sm text-stone-600">Configurar mensagens para complementar compra com combos, comida, bebida e bingo.</p>
          </Link>

          <Link href="/admin/festa-junina/cardapio" className="rounded-3xl bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
            <Utensils className="mb-4 h-8 w-8 text-green-800" />
            <h2 className="text-xl font-black text-green-950">Cardápio e ficha técnica</h2>
            <p className="mt-2 text-sm text-stone-600">Cadastrar itens, consumo por pessoa, insumos e preparo.</p>
          </Link>

          <Link href="/admin/festa-junina/voluntarios" className="rounded-3xl bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
            <UsersRound className="mb-4 h-8 w-8 text-green-800" />
            <h2 className="text-xl font-black text-green-950">Voluntários</h2>
            <p className="mt-2 text-sm text-stone-600">Cadastrar equipe e comparar com a sugestão por participantes.</p>
          </Link>

          <Link href="/admin/festa-junina/checklist" className="rounded-3xl bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
            <ListChecks className="mb-4 h-8 w-8 text-green-800" />
            <h2 className="text-xl font-black text-green-950">Checklist operacional</h2>
            <p className="mt-2 text-sm text-stone-600">Acompanhar o que está pendente, sugerido, em andamento e confirmado.</p>
          </Link>

          <Link href="/admin/festa-junina/operacao" className="rounded-3xl bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
            <Warehouse className="mb-4 h-8 w-8 text-green-800" />
            <h2 className="text-xl font-black text-green-950">Operação e simulação</h2>
            <p className="mt-2 text-sm text-stone-600">Confirmar compras, armazenamento, responsáveis e testes de atendimento/caixa.</p>
          </Link>
        </div>
      </section>
    </AdminPageShell>
  );
}
