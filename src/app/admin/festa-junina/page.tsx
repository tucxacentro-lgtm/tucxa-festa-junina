import Link from "next/link";
import { ClipboardList, Settings, Utensils } from "lucide-react";
import { SiteHeader } from "@/components/site-header";

export default function AdminFestaJuninaPage() {
  return (
    <main className="min-h-screen bg-amber-50 text-stone-900">
      <SiteHeader />
      <section className="mx-auto max-w-6xl px-5 py-12">
        <div className="mb-6 flex justify-end">
          <a href="/admin/logout" className="rounded-full bg-white px-4 py-2 text-sm font-bold text-green-950 shadow-sm transition hover:bg-amber-100">
            Sair do admin
          </a>
        </div>
        <h1 className="text-3xl font-black text-green-950">Administração da Festa Junina</h1>
        <p className="mt-3 max-w-3xl text-stone-600">
          Painel inicial para acompanhar reservas, comprovantes, combos com bingo e preparação para a próxima etapa de cardápio, pedidos e caixa.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <Link href="/admin/festa-junina/pedidos" className="rounded-3xl bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
            <ClipboardList className="mb-4 h-8 w-8 text-green-800" />
            <h2 className="text-xl font-black text-green-950">Compras e comprovantes</h2>
            <p className="mt-2 text-sm text-stone-600">Ver reservas, status de pagamento e compras que incluem bingo.</p>
          </Link>

          <div className="rounded-3xl bg-white p-6 shadow-sm opacity-80">
            <Settings className="mb-4 h-8 w-8 text-green-800" />
            <h2 className="text-xl font-black text-green-950">Configurações</h2>
            <p className="mt-2 text-sm text-stone-600">Próxima etapa: editar evento, valores, Pix, combos e ofertas.</p>
          </div>

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
