import Link from "next/link";
import { ClipboardList, CreditCard, Settings, Ticket, Utensils, Gift, Share2, ClipboardCheck, Megaphone } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { requireAdmin } from "@/lib/auth";

export default async function AdminFestaJuninaPage() {
  const admin = await requireAdmin(undefined, "/admin/festa-junina");

  return (
    <main className="min-h-screen bg-amber-50 text-stone-900">
      <SiteHeader />
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

          <div className="rounded-3xl bg-white p-6 shadow-sm opacity-80">
            <Utensils className="mb-4 h-8 w-8 text-green-800" />
            <h2 className="text-xl font-black text-green-950">Cardápio e caixa</h2>
            <p className="mt-2 text-sm text-stone-600">Próxima etapa: cardápio, mesas, pedidos, cozinha, entrega e fechamento.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
