import { AdminPageShell } from "@/components/admin-page-shell";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabaseServer";
import { getCurrentEventForAdmin } from "@/lib/current-event";
import { EVENT_MODULES, MODULE_STATUS_LABELS, type EventModuleStatus } from "@/lib/event-modules";
import { saveEventModule } from "./actions";

export const dynamic = "force-dynamic";

type PageProps = { searchParams?: Promise<Record<string, string | string[] | undefined>> };

type ModuleRow = {
  id: string;
  event_id: string;
  module_key: string;
  enabled: boolean;
  status: EventModuleStatus;
  notes: string | null;
};

async function getData() {
  const event = await getCurrentEventForAdmin();
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.from("event_modules").select("*").eq("event_id", event.id);
  if (error && !error.message.includes("does not exist")) throw new Error(error.message);
  const rows = new Map((data ?? []).map((row) => [row.module_key, row as ModuleRow]));
  return { event, rows };
}

export default async function ModulosPage({ searchParams }: PageProps) {
  await requireAdmin(["admin", "coordenador"], "/admin/festa-junina/modulos");
  const params = await searchParams;
  const { event, rows } = await getData();

  return (
    <AdminPageShell>
      <section className="mx-auto max-w-6xl px-5 py-10">
        <h1 className="text-3xl font-black text-green-950">Módulos do evento</h1>
        <p className="mt-2 max-w-3xl text-stone-600">
          Defina quais funcionalidades serão usadas neste evento. Cada módulo é independente: você pode usar planejamento mesmo sem registrar todas as vendas, ou usar compras/treinamento sem usar atendimento.
        </p>
        <p className="mt-3 rounded-2xl bg-amber-50 p-4 text-sm font-bold text-amber-900">Evento atual: {event.name}</p>
        {params?.saved ? <div className="mt-5 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm font-bold text-green-900">Módulo salvo com sucesso.</div> : null}

        <div className="mt-8 grid gap-5">
          {EVENT_MODULES.map((definition) => {
            const row = rows.get(definition.key);
            return (
              <form key={definition.key} action={saveEventModule} className="rounded-3xl bg-white p-5 shadow-sm">
                <input type="hidden" name="id" value={row?.id ?? ""} />
                <input type="hidden" name="event_id" value={event.id} />
                <input type="hidden" name="module_key" value={definition.key} />
                <div className="grid gap-4 md:grid-cols-[1fr_14rem] md:items-start">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-green-700">{definition.group}</p>
                    <h2 className="mt-1 text-xl font-black text-green-950">{definition.title}</h2>
                    <p className="mt-2 text-sm leading-relaxed text-stone-600">{definition.description}</p>
                    <a href={definition.href} className="mt-3 inline-block text-sm font-black text-green-900 underline">Abrir tela do módulo</a>
                  </div>
                  <div className="grid gap-3">
                    <label className="flex items-center gap-2 rounded-2xl bg-amber-50 p-3 text-sm font-bold text-green-950">
                      <input name="enabled" type="checkbox" defaultChecked={row?.enabled ?? true} /> Usar neste evento
                    </label>
                    <label className="grid gap-1 text-sm font-bold text-green-950">
                      Status
                      <select name="status" defaultValue={row?.status ?? "suggested"} className="rounded-2xl border border-stone-200 p-3 font-normal">
                        {Object.entries(MODULE_STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                      </select>
                    </label>
                  </div>
                </div>
                <label className="mt-4 grid gap-1 text-sm font-bold text-green-950">
                  Observações
                  <textarea name="notes" defaultValue={row?.notes ?? ""} className="min-h-16 rounded-2xl border border-stone-200 p-3 font-normal" placeholder="Ex.: este ano será usado só como sugestão; responsável; pendências." />
                </label>
                <button className="mt-4 rounded-2xl bg-green-900 px-5 py-3 font-black text-white">Salvar módulo</button>
              </form>
            );
          })}
        </div>
      </section>
    </AdminPageShell>
  );
}
