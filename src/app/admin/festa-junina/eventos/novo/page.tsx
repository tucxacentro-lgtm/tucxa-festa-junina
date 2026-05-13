import Link from "next/link";
import { AdminPageShell } from "@/components/admin-page-shell";
import { EventForm } from "@/components/admin-events/event-form";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function NovoEventoPage() {
  await requireAdmin(["admin", "coordenador"], "/admin/festa-junina/eventos/novo");

  return (
    <AdminPageShell>
      <section className="mx-auto max-w-5xl px-5 py-10">
        <Link href="/admin/festa-junina/eventos" className="rounded-full bg-white px-4 py-2 text-sm font-black text-green-950 shadow-sm">
          ← Voltar para eventos
        </Link>
        <div className="mt-8">
          <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-black text-green-900">Novo evento</span>
          <h1 className="mt-4 text-3xl font-black text-green-950">Cadastrar edição da Festa Junina</h1>
          <p className="mt-2 max-w-3xl text-stone-700">
            Crie uma nova edição anual. Depois de criada, use <strong>Abrir evento</strong> para habilitar as opções operacionais no menu lateral.
          </p>
        </div>
        <div className="mt-8">
          <EventForm />
        </div>
      </section>
    </AdminPageShell>
  );
}
