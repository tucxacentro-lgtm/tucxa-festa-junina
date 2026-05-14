import Link from "next/link";
import { AdminChecklistStatusBadge } from "@/components/admin-checklist-status-badge";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabaseServer";
import { updateChecklistItem } from "./actions";
import { AdminPageShell } from "@/components/admin-page-shell";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams?: Promise<{ saved?: string }>;
};

type ChecklistItem = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  notes: string | null;
  href: string | null;
  sort_order: number;
};

async function getChecklist() {
  const supabase = createSupabaseAdminClient();
  const { data: event } = await supabase.from("events").select("id").eq("slug", "arraia-tucxa-2026").single();

  if (!event) return [] as ChecklistItem[];

  const { data, error } = await supabase
    .from("event_operational_checklist")
    .select("*")
    .eq("event_id", event.id)
    .order("sort_order");

  if (error) return [] as ChecklistItem[];
  return (data ?? []) as ChecklistItem[];
}

export default async function AdminChecklistPage({ searchParams }: PageProps) {
  await requireAdmin(["admin", "coordenador"], "/admin/festa-junina/checklist");
  const params = await searchParams;
  const items = await getChecklist();

  return (
    <AdminPageShell>
      
      <section className="mx-auto max-w-6xl px-5 py-12">
        <div className="mb-6 flex flex-wrap justify-between gap-3">
          <Link href="/admin/festa-junina" className="rounded-2xl bg-white px-5 py-3 text-sm font-bold text-green-950 shadow-sm" prefetch={false}>← Voltar ao admin</Link>
          <a href="/admin/logout" className="rounded-full bg-white px-4 py-2 text-sm font-bold text-green-950 shadow-sm">Sair da gestão</a>
        </div>

        <h1 className="text-3xl font-black text-green-950">Checklist operacional</h1>
        <p className="mt-3 max-w-3xl text-stone-600">
          Ordem prática para preparar o evento. Use os status para separar o que ainda é sugestão, o que está em andamento e o que já foi confirmado.
        </p>

        {params?.saved ? (
          <div className="mt-6 rounded-3xl border border-green-200 bg-green-50 p-5 text-sm font-bold text-green-900">Checklist atualizado com sucesso.</div>
        ) : null}

        {items.length === 0 ? (
          <div className="mt-8 rounded-3xl bg-amber-100 p-6 text-amber-900">
            Rode a migration 007 para criar o checklist inicial.
          </div>
        ) : (
          <div className="mt-8 grid gap-4">
            {items.map((item) => (
              <div key={item.id} className="rounded-3xl bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-sm font-black text-amber-700">Item {item.sort_order}</p>
                    <h2 className="mt-1 text-xl font-black text-green-950">{item.title}</h2>
                    {item.description ? <p className="mt-2 text-sm text-stone-600">{item.description}</p> : null}
                    {item.href ? <Link href={item.href} className="mt-3 inline-block text-sm font-black text-green-900 underline" prefetch={false}>Abrir área relacionada</Link> : null}
                  </div>
                  <AdminChecklistStatusBadge status={item.status} />
                </div>

                <form action={updateChecklistItem} className="mt-5 grid gap-3 md:grid-cols-[220px_1fr_auto] md:items-end">
                  <input type="hidden" name="id" value={item.id} />
                  <label className="grid gap-2 text-sm font-bold text-green-950">
                    Status
                    <select name="status" defaultValue={item.status} className="rounded-2xl border p-3 font-normal">
                      <option value="pending">Pendente</option>
                      <option value="suggested">Sugestão</option>
                      <option value="in_progress">Em andamento</option>
                      <option value="confirmed">Confirmado</option>
                    </select>
                  </label>
                  <label className="grid gap-2 text-sm font-bold text-green-950">
                    Observações
                    <input name="notes" defaultValue={item.notes ?? ""} className="rounded-2xl border p-3 font-normal" placeholder="Ex.: responsável, data, pendência, validação" />
                  </label>
                  <button className="rounded-2xl bg-green-900 px-5 py-3 text-sm font-black text-white">Salvar</button>
                </form>
              </div>
            ))}
          </div>
        )}
      </section>
    </AdminPageShell>
  );
}
