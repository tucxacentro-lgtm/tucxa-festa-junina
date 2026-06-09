import Link from "next/link";
import { CreditCard, LockKeyhole, UserRoundCheck } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { getCurrentEventForPublic } from "@/lib/current-event";

export const dynamic = "force-dynamic";

function AccessCard({ href, title, description, icon: Icon, primary = false }: { href: string; title: string; description: string; icon: typeof UserRoundCheck; primary?: boolean }) {
  return (
    <Link href={href} prefetch={false} className={`rounded-[2rem] border p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md ${primary ? "border-green-200 bg-green-900 text-white" : "border-green-100 bg-white text-green-950"}`}>
      <Icon className={`mb-4 h-8 w-8 ${primary ? "text-white" : "text-green-800"}`} />
      <h2 className="text-2xl font-black">{title}</h2>
      <p className={`mt-3 text-sm leading-relaxed ${primary ? "text-white/85" : "text-stone-600"}`}>{description}</p>
    </Link>
  );
}

export default async function GestaoEventoPage() {
  const event = await getCurrentEventForPublic();

  return (
    <main className="min-h-screen bg-amber-50 text-green-950">
      <SiteHeader />
      <section className="mx-auto max-w-6xl px-5 py-12">
        <div className="rounded-[2rem] border border-green-100 bg-white p-6 shadow-sm">
          <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-black text-green-900">Gestão do Evento</span>
          <h1 className="mt-4 text-3xl font-black">Acessos operacionais</h1>
          <p className="mt-3 max-w-3xl text-stone-700">
            Escolha o acesso conforme sua função no evento <strong>{event.name}</strong>. Garçom/Atendimento e Caixa são atalhos operacionais para o dia da festa. A área Gestão abre o login administrativo.
          </p>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          <AccessCard href="/admin/login?next=%2Fadmin%2Ffesta-junina" title="Gestão" description="Acesso administrativo para configurar evento, vendas, cardápio, voluntários, compras, treinamentos e relatórios." icon={LockKeyhole} primary />
          <AccessCard href="/gestao-evento/garcom" title="Garçom / Atendimento" description="Acompanhar pedidos do cardápio por mesa ou cliente, verificar itens, preparo e entrega/retirada." icon={UserRoundCheck} />
          <AccessCard href="/gestao-evento/caixa" title="Caixa" description="Conferir pedidos por mesa/responsável, itens consumidos, totais, pagamentos, comprovantes e pendências." icon={CreditCard} />
        </div>
      </section>
    </main>
  );
}
