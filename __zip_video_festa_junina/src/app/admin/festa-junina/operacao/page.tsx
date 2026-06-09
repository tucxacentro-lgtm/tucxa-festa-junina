import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabaseServer";
import { createSimulationRun, createStorageLocation, updateSimulationRun, updateStorageLocation } from "./actions";
import { AdminPageShell } from "@/components/admin-page-shell";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams?: Promise<{ saved?: string }>;
};

type StorageLocation = {
  id: string;
  name: string;
  responsible_name: string | null;
  item_group: string | null;
  status: string;
  notes: string | null;
  active: boolean;
};

type SimulationRun = {
  id: string;
  name: string;
  scenario: string | null;
  status: string;
  responsible_name: string | null;
  notes: string | null;
};

async function getData() {
  const supabase = createSupabaseAdminClient();
  const { data: event } = await supabase.from("events").select("id").eq("slug", "arraia-tucxa-2026").single();

  if (!event) {
    return { storageLocations: [] as StorageLocation[], simulations: [] as SimulationRun[] };
  }

  const [{ data: storageLocations }, { data: simulations }] = await Promise.all([
    supabase.from("event_storage_locations").select("*").eq("event_id", event.id).order("created_at"),
    supabase.from("event_simulation_runs").select("*").eq("event_id", event.id).order("created_at"),
  ]);

  return {
    storageLocations: (storageLocations ?? []) as StorageLocation[],
    simulations: (simulations ?? []) as SimulationRun[],
  };
}

function statusLabel(status: string) {
  const labels: Record<string, string> = {
    pending: "Pendente",
    partial: "Parcial",
    confirmed: "Confirmado",
    planned: "Planejado",
    running: "Em execução",
    done: "Realizado",
    issue: "Com pendência",
  };

  return labels[status] ?? status;
}

export default async function OperacaoPage({ searchParams }: PageProps) {
  await requireAdmin(["admin", "coordenador"], "/admin/festa-junina/operacao");
  const params = await searchParams;
  const { storageLocations, simulations } = await getData();

  return (
    <AdminPageShell>
      
      <section className="mx-auto max-w-6xl px-5 py-12">
        <div className="mb-6 flex flex-wrap justify-between gap-3">
          <Link href="/admin/festa-junina" className="rounded-2xl bg-white px-5 py-3 text-sm font-bold text-green-950 shadow-sm" prefetch={false}>← Voltar ao admin</Link>
          <a href="/admin/logout" className="rounded-full bg-white px-4 py-2 text-sm font-bold text-green-950 shadow-sm">Sair da gestão</a>
        </div>

        <h1 className="text-3xl font-black text-green-950">Operação, armazenamento e simulação</h1>
        <p className="mt-3 max-w-3xl text-stone-600">
          Use esta tela para confirmar compras, definir onde os itens ficarão guardados e registrar simulações de atendimento, entrada por QR Code, comprovante, caixa e pagamento.
        </p>

        {params?.saved ? (
          <div className="mt-6 rounded-3xl border border-green-200 bg-green-50 p-5 text-sm font-bold text-green-900">Informações operacionais salvas com sucesso.</div>
        ) : null}

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl bg-white p-5 shadow-sm">
            <p className="text-sm font-bold text-stone-500">Locais cadastrados</p>
            <p className="mt-2 text-3xl font-black text-green-950">{storageLocations.length}</p>
          </div>
          <div className="rounded-3xl bg-white p-5 shadow-sm">
            <p className="text-sm font-bold text-stone-500">Simulações registradas</p>
            <p className="mt-2 text-3xl font-black text-green-950">{simulations.length}</p>
          </div>
          <div className="rounded-3xl bg-white p-5 shadow-sm">
            <p className="text-sm font-bold text-stone-500">Pontos críticos</p>
            <p className="mt-2 text-sm font-bold text-stone-600">compras, armazenamento, internet, entrada por QR Code, atendimento e caixa</p>
          </div>
        </div>

        <section className="mt-8 rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-black text-green-950">Compras e locais de armazenamento</h2>
          <p className="mt-2 text-sm text-stone-600">Cadastre onde ficarão bebidas, gelo, descartáveis, ingredientes, itens preparados e materiais de limpeza.</p>

          <form action={createStorageLocation} className="mt-5 grid gap-3 md:grid-cols-2">
            <input name="name" placeholder="Local/área. Ex.: Freezer cozinha, mesa de bebidas" className="rounded-2xl border p-3" required />
            <input name="item_group" placeholder="Grupo de itens. Ex.: bebidas, gelo, pastéis, descartáveis" className="rounded-2xl border p-3" />
            <input name="responsible_name" placeholder="Responsável" className="rounded-2xl border p-3" />
            <select name="status" className="rounded-2xl border p-3" defaultValue="pending">
              <option value="pending">Pendente</option>
              <option value="partial">Parcial</option>
              <option value="confirmed">Confirmado</option>
            </select>
            <input name="notes" placeholder="Observações" className="rounded-2xl border p-3 md:col-span-2" />
            <button className="rounded-2xl bg-green-900 px-5 py-3 font-black text-white md:col-span-2">Adicionar local</button>
          </form>

          <div className="mt-6 grid gap-4">
            {storageLocations.map((location) => (
              <form key={location.id} action={updateStorageLocation} className="grid gap-3 rounded-2xl border border-amber-100 bg-amber-50/50 p-4 md:grid-cols-2">
                <input type="hidden" name="id" value={location.id} />
                <input name="name" defaultValue={location.name} className="rounded-xl border p-3" />
                <input name="item_group" defaultValue={location.item_group ?? ""} className="rounded-xl border p-3" />
                <input name="responsible_name" defaultValue={location.responsible_name ?? ""} className="rounded-xl border p-3" />
                <select name="status" defaultValue={location.status} className="rounded-xl border p-3">
                  <option value="pending">Pendente</option>
                  <option value="partial">Parcial</option>
                  <option value="confirmed">Confirmado</option>
                </select>
                <input name="notes" defaultValue={location.notes ?? ""} className="rounded-xl border p-3 md:col-span-2" />
                <label className="flex items-center gap-2 text-sm font-bold text-green-950"><input type="checkbox" name="active" defaultChecked={location.active} /> Ativo</label>
                <div className="text-sm font-bold text-stone-600">Status atual: {statusLabel(location.status)}</div>
                <button className="rounded-xl bg-green-900 px-4 py-3 text-sm font-black text-white md:col-span-2">Salvar local</button>
              </form>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-black text-green-950">Simulações de operação</h2>
          <p className="mt-2 text-sm text-stone-600">Registre testes de compra, aprovação de comprovante, entrada por QR Code, atendimento e caixa.</p>

          <form action={createSimulationRun} className="mt-5 grid gap-3 md:grid-cols-2">
            <input name="name" placeholder="Nome do teste. Ex.: compra + comprovante + entrada QR" className="rounded-2xl border p-3" required />
            <input name="responsible_name" placeholder="Responsável" className="rounded-2xl border p-3" />
            <select name="status" className="rounded-2xl border p-3" defaultValue="planned">
              <option value="planned">Planejado</option>
              <option value="running">Em execução</option>
              <option value="done">Realizado</option>
              <option value="issue">Com pendência</option>
            </select>
            <input name="scenario" placeholder="Cenário. Ex.: celular do cliente, caixa, garçom, internet" className="rounded-2xl border p-3" />
            <input name="notes" placeholder="Resultado/observações" className="rounded-2xl border p-3 md:col-span-2" />
            <button className="rounded-2xl bg-green-900 px-5 py-3 font-black text-white md:col-span-2">Adicionar simulação</button>
          </form>

          <div className="mt-6 grid gap-4">
            {simulations.map((simulation) => (
              <form key={simulation.id} action={updateSimulationRun} className="grid gap-3 rounded-2xl border border-amber-100 bg-amber-50/50 p-4 md:grid-cols-2">
                <input type="hidden" name="id" value={simulation.id} />
                <input name="name" defaultValue={simulation.name} className="rounded-xl border p-3" />
                <input name="responsible_name" defaultValue={simulation.responsible_name ?? ""} className="rounded-xl border p-3" />
                <select name="status" defaultValue={simulation.status} className="rounded-xl border p-3">
                  <option value="planned">Planejado</option>
                  <option value="running">Em execução</option>
                  <option value="done">Realizado</option>
                  <option value="issue">Com pendência</option>
                </select>
                <input name="scenario" defaultValue={simulation.scenario ?? ""} className="rounded-xl border p-3" />
                <input name="notes" defaultValue={simulation.notes ?? ""} className="rounded-xl border p-3 md:col-span-2" />
                <button className="rounded-xl bg-green-900 px-4 py-3 text-sm font-black text-white md:col-span-2">Salvar simulação</button>
              </form>
            ))}
          </div>
        </section>
      </section>
    </AdminPageShell>
  );
}
