import Link from "next/link";
import { AdminChecklistStatusBadge } from "@/components/admin-checklist-status-badge";

export type OperationalChecklistItem = {
  title: string;
  description: string;
  status: string;
  href?: string;
};

export function AdminOperationalChecklist({ items }: { items: OperationalChecklistItem[] }) {
  const visibleItems = items.slice(0, 6);
  const confirmed = items.filter((item) => item.status === "confirmed").length;

  return (
    <section className="mt-8 rounded-3xl bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-2xl font-black text-green-950">Checklist operacional do evento</h2>
          <p className="mt-2 max-w-3xl text-sm text-stone-600">
            Ordem sugerida para preparar a festa. Cada item pode ficar como pendente, sugestão, em andamento ou confirmado.
          </p>
        </div>
        <Link href="/admin/festa-junina/checklist" className="rounded-2xl bg-green-900 px-5 py-3 text-center text-sm font-black text-white shadow-sm" prefetch={false}>
          Ver checklist completo
        </Link>
      </div>

      <div className="mt-4 rounded-2xl bg-amber-50 p-4 text-sm font-bold text-green-950">
        {confirmed} de {items.length} itens confirmados
      </div>

      <div className="mt-5 grid gap-3">
        {visibleItems.map((item, index) => (
          <div key={`${item.title}-${index}`} className="rounded-2xl border border-amber-100 bg-amber-50/50 p-4">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-black text-green-950">{index + 1}. {item.title}</p>
                <p className="mt-1 text-xs text-stone-600">{item.description}</p>
              </div>
              <AdminChecklistStatusBadge status={item.status} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
