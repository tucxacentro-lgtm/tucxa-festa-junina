import Link from "next/link";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { AdminPageShell } from "@/components/admin-page-shell";
import { requireAdmin } from "@/lib/auth";
import { getCurrentEventForAdmin } from "@/lib/current-event";
import { createSupabaseAdminClient } from "@/lib/supabaseServer";
import { createOccurrence, updateOccurrenceStatus } from "./actions";

export const dynamic = "force-dynamic";

type OccurrenceRow = {
  id: string;
  title: string;
  description: string | null;
  area: string;
  responsible_name: string | null;
  status: string;
  resolution_notes: string | null;
  created_at: string;
};

async function getOccurrences(eventId: string) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.from("event_operation_occurrences").select("*").eq("event_id", eventId).order("created_at", { ascending: false });
  return { occurrences: (data ?? []) as OccurrenceRow[], error: error?.message ?? null };
}

function statusLabel(status: string) {
  const labels: Record<string, string> = { open: "Aberta", in_progress: "Em andamento", resolved: "Resolvida", cancelled: "Cancelada" };
  return labels[status] ?? status;
}

export default async function OcorrenciasPage() {
  await requireAdmin(["admin", "coordenador"], "/admin/festa-junina/ocorrencias");
  const event = await getCurrentEventForAdmin();
  const { occurrences, error } = await getOccurrences(event.id);
  const open = occurrences.filter((item) => item.status !== "resolved" && item.status !== "cancelled").length;

  return (
    <AdminPageShell>
      <section className="mx-auto max-w-6xl px-5 py-10">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3"><Link href="/admin/festa-junina" className="rounded-full bg-white px-4 py-2 text-sm font-bold text-green-950 shadow-sm" prefetch={false}>← Painel do evento</Link><a href="/admin/logout" className="rounded-full bg-white px-4 py-2 text-sm font-bold text-green-950 shadow-sm">Sair da gestão</a></div>
        <article className="rounded-[2rem] border border-green-100 bg-white p-6 shadow-sm">
          <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-black text-green-900">Atendimento · Ocorrências</span>
          <h1 className="mt-4 text-3xl font-black text-green-950">Ocorrências do evento</h1>
          <p className="mt-3 max-w-3xl text-stone-700">Registre problemas, ajustes manuais e decisões tomadas durante a operação para facilitar a prestação de contas e melhorias futuras.</p>
          {error ? <div className="mt-5 rounded-2xl bg-amber-50 p-4 text-sm font-bold text-amber-900">Rode a migration 024 para habilitar o cadastro de ocorrências. Detalhe: {error}</div> : null}
          <div className="mt-5 grid gap-4 md:grid-cols-2"><div className="rounded-3xl bg-amber-50 p-5"><AlertTriangle className="h-6 w-6 text-green-800" /><p className="mt-2 text-3xl font-black text-green-950">{open}</p><p className="text-sm text-stone-600">ocorrências abertas</p></div><div className="rounded-3xl bg-green-50 p-5"><CheckCircle2 className="h-6 w-6 text-green-800" /><p className="mt-2 text-3xl font-black text-green-950">{occurrences.length - open}</p><p className="text-sm text-stone-600">resolvidas/canceladas</p></div></div>
        </article>

        <form action={createOccurrence} className="mt-6 rounded-[2rem] bg-white p-6 shadow-sm">
          <h2 className="text-xl font-black text-green-950">Nova ocorrência</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm font-bold">Título<input name="title" required className="rounded-2xl border border-green-100 p-3 font-normal" placeholder="Ex.: Pedido duplicado, falta de troco..." /></label>
            <label className="grid gap-2 text-sm font-bold">Área<select name="area" className="rounded-2xl border border-green-100 p-3 font-normal"><option value="entrada">Entrada/check-in</option><option value="caixa">Caixa/pagamento</option><option value="cozinha">Cozinha/preparo</option><option value="entrega">Entrega/retirada</option><option value="mesa">Mesa/cliente</option><option value="geral">Geral</option></select></label>
            <label className="grid gap-2 text-sm font-bold">Responsável<input name="responsible_name" className="rounded-2xl border border-green-100 p-3 font-normal" /></label>
            <label className="grid gap-2 text-sm font-bold">Status<select name="status" className="rounded-2xl border border-green-100 p-3 font-normal"><option value="open">Aberta</option><option value="in_progress">Em andamento</option><option value="resolved">Resolvida</option></select></label>
            <label className="grid gap-2 text-sm font-bold md:col-span-2">Descrição<textarea name="description" className="min-h-24 rounded-2xl border border-green-100 p-3 font-normal" /></label>
            <label className="grid gap-2 text-sm font-bold md:col-span-2">Resolução/observações<textarea name="resolution_notes" className="min-h-20 rounded-2xl border border-green-100 p-3 font-normal" /></label>
          </div>
          <button className="mt-5 rounded-2xl bg-green-900 px-5 py-3 text-sm font-black text-white">Registrar ocorrência</button>
        </form>

        <div className="mt-6 grid gap-4">
          {occurrences.map((item) => <article key={item.id} className="rounded-[2rem] bg-white p-5 shadow-sm"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[0.16em] text-green-800">{item.area}</p><h2 className="mt-1 text-xl font-black text-green-950">{item.title}</h2></div><span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-black text-stone-700">{statusLabel(item.status)}</span></div>{item.description ? <p className="mt-3 text-sm text-stone-700">{item.description}</p> : null}<p className="mt-3 text-xs text-stone-500">Responsável: {item.responsible_name || "não informado"} · {new Date(item.created_at).toLocaleString("pt-BR")}</p>{item.status !== "resolved" ? <form action={updateOccurrenceStatus} className="mt-4"><input type="hidden" name="id" value={item.id} /><input type="hidden" name="status" value="resolved" /><button className="rounded-full bg-green-900 px-4 py-2 text-xs font-black text-white">Marcar como resolvida</button></form> : null}</article>)}
          {occurrences.length === 0 ? <div className="rounded-[2rem] bg-white p-8 text-center text-stone-500 shadow-sm">Nenhuma ocorrência registrada ainda.</div> : null}
        </div>
      </section>
    </AdminPageShell>
  );
}
