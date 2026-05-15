import Link from "next/link";
import { CheckCircle2, Edit3, Plus, UsersRound } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { AdminPageShell } from "@/components/admin-page-shell";
import { getCurrentEventForAdmin } from "@/lib/current-event";
import {
  countVolunteersForFunction,
  getVolunteerCountsByRole,
  getVolunteerFunctions,
  VOLUNTEER_FUNCTION_STATUS_LABELS,
  type VolunteerFunction,
} from "@/lib/volunteer-functions";
import { deactivateVolunteerFunction, saveVolunteerFunction, seedVolunteerFunctions } from "./actions";

export const dynamic = "force-dynamic";

type PageProps = { searchParams?: Promise<Record<string, string | string[] | undefined>> };

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function savedMessage(saved?: string | string[]) {
  const value = firstParam(saved);
  if (value === "defaults") return "Funções padrão criadas/atualizadas com sucesso.";
  if (value === "function") return "Função salva com sucesso.";
  if (value === "inactive") return "Função desativada com sucesso.";
  return null;
}

function StatusBadge({ status, active }: { status: VolunteerFunction["status"]; active: boolean }) {
  const label = active ? VOLUNTEER_FUNCTION_STATUS_LABELS[status] : "Inativa";
  const color = !active || status === "inactive"
    ? "bg-stone-100 text-stone-600"
    : status === "confirmed"
      ? "bg-green-100 text-green-900"
      : status === "needs_people"
        ? "bg-amber-100 text-amber-900"
        : "bg-blue-50 text-blue-900";

  return <span className={`rounded-full px-3 py-1 text-xs font-black ${color}`}>{label}</span>;
}

function FunctionForm({ item }: { item?: VolunteerFunction }) {
  return (
    <form action={saveVolunteerFunction} className="rounded-[1.75rem] border border-green-100 bg-white p-6 shadow-sm">
      <input type="hidden" name="id" value={item?.id ?? ""} />
      <input type="hidden" name="function_key" value={item?.function_key ?? ""} />
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-black text-green-900">{item ? "Editar função" : "Nova função"}</span>
          <h2 className="mt-3 text-2xl font-black text-green-950">{item?.name ?? "Cadastrar função"}</h2>
          <p className="mt-2 text-sm text-stone-600">A chave da função é criada automaticamente para novos cadastros.</p>
        </div>
        <Link href="/admin/festa-junina/voluntarios/funcoes" className="rounded-full bg-white px-4 py-2 text-sm font-black text-green-950 shadow-sm" prefetch={false}>Cancelar</Link>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-bold text-green-950">Nome da função<input name="name" required defaultValue={item?.name ?? ""} className="rounded-2xl border border-green-100 p-3 font-normal" placeholder="Ex.: Atendimento/garçom" /></label>
        <label className="grid gap-2 text-sm font-bold text-green-950">Área<input name="area" defaultValue={item?.area ?? ""} className="rounded-2xl border border-green-100 p-3 font-normal" placeholder="Ex.: Atendimento" /></label>
        <label className="grid gap-2 text-sm font-bold text-green-950">Quantidade sugerida<input name="suggested_quantity" type="number" min="0" defaultValue={item?.suggested_quantity ?? 1} className="rounded-2xl border border-green-100 p-3 font-normal" /></label>
        <label className="grid gap-2 text-sm font-bold text-green-950">Quantidade cadastrada/confirmada<input name="confirmed_quantity" type="number" min="0" defaultValue={item?.confirmed_quantity ?? 0} className="rounded-2xl border border-green-100 p-3 font-normal" /></label>
        <label className="grid gap-2 text-sm font-bold text-green-950">Período/turno<input name="shift_label" defaultValue={item?.shift_label ?? ""} className="rounded-2xl border border-green-100 p-3 font-normal" placeholder="Ex.: Durante a festa" /></label>
        <label className="grid gap-2 text-sm font-bold text-green-950">Status<select name="status" defaultValue={item?.status ?? "suggested"} className="rounded-2xl border border-green-100 p-3 font-normal"><option value="suggested">Sugerida</option><option value="needs_people">Precisa de pessoas</option><option value="confirmed">Confirmada</option><option value="inactive">Inativa</option></select></label>
        <label className="grid gap-2 text-sm font-bold text-green-950">Ordem<input name="sort_order" type="number" defaultValue={item?.sort_order ?? 999} className="rounded-2xl border border-green-100 p-3 font-normal" /></label>
        <label className="flex items-center gap-2 rounded-2xl bg-amber-50 p-4 text-sm font-bold text-green-950"><input type="checkbox" name="active" defaultChecked={item?.active ?? true} /> Ativa</label>
        <label className="grid gap-2 text-sm font-bold text-green-950 md:col-span-2">Descrição<textarea name="description" defaultValue={item?.description ?? ""} className="min-h-20 rounded-2xl border border-green-100 p-3 font-normal" /></label>
        <label className="grid gap-2 text-sm font-bold text-green-950 md:col-span-2">Responsabilidades<textarea name="responsibilities" defaultValue={item?.responsibilities ?? ""} className="min-h-28 rounded-2xl border border-green-100 p-3 font-normal" /></label>
        <label className="grid gap-2 text-sm font-bold text-green-950 md:col-span-2">Observações<textarea name="notes" defaultValue={item?.notes ?? ""} className="min-h-20 rounded-2xl border border-green-100 p-3 font-normal" /></label>
      </div>
      <button className="mt-6 w-full rounded-2xl bg-green-900 px-5 py-3 font-black text-white">Salvar função</button>
    </form>
  );
}

function FunctionCard({ item, registeredQuantity }: { item: VolunteerFunction; registeredQuantity: number }) {
  const confirmed = Math.max(item.confirmed_quantity ?? 0, registeredQuantity);
  const missing = Math.max(0, (item.suggested_quantity ?? 0) - confirmed);

  return (
    <article className="rounded-[1.75rem] border border-green-100 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-green-800">{item.area ?? "Função"}</p>
          <h2 className="mt-1 text-xl font-black text-green-950">{item.name}</h2>
        </div>
        <StatusBadge status={item.status} active={item.active} />
      </div>

      {item.description ? <p className="mt-3 text-sm leading-relaxed text-stone-700">{item.description}</p> : null}

      <div className="mt-5 grid grid-cols-3 gap-3 text-center">
        <div className="rounded-2xl bg-green-50 p-3"><p className="text-xs font-bold text-stone-500">Sugerida</p><p className="text-2xl font-black text-green-950">{item.suggested_quantity}</p></div>
        <div className="rounded-2xl bg-green-50 p-3"><p className="text-xs font-bold text-stone-500">Cadastrada</p><p className="text-2xl font-black text-green-950">{confirmed}</p></div>
        <div className={`rounded-2xl p-3 ${missing > 0 ? "bg-amber-50" : "bg-green-50"}`}><p className="text-xs font-bold text-stone-500">Faltam</p><p className="text-2xl font-black text-green-950">{missing}</p></div>
      </div>

      {item.shift_label ? <p className="mt-4 rounded-2xl bg-stone-50 p-3 text-sm text-stone-700"><strong>Período:</strong> {item.shift_label}</p> : null}
      {item.responsibilities ? <p className="mt-3 text-sm leading-relaxed text-stone-700"><strong>Responsabilidades:</strong> {item.responsibilities}</p> : null}

      <div className="mt-5 flex flex-wrap gap-3">
        <Link href={`/admin/festa-junina/voluntarios/funcoes?edit=${item.id}`} className="inline-flex items-center gap-2 rounded-full bg-green-900 px-5 py-3 text-sm font-black text-white" prefetch={false}><Edit3 className="h-4 w-4" /> Editar</Link>
        <Link href="/admin/festa-junina/voluntarios/funcoes?new=1" className="inline-flex items-center gap-2 rounded-full border border-green-100 bg-white px-5 py-3 text-sm font-black text-green-950" prefetch={false}><Plus className="h-4 w-4" /> Criar novo</Link>
        <form action={deactivateVolunteerFunction}>
          <input type="hidden" name="id" value={item.id} />
          <button className="rounded-full bg-red-50 px-5 py-3 text-sm font-black text-red-700">Desativar</button>
        </form>
      </div>
    </article>
  );
}

export default async function Page({ searchParams }: PageProps) {
  await requireAdmin(["admin", "coordenador"], "/admin/festa-junina/voluntarios/funcoes");
  const params = await searchParams;
  const event = await getCurrentEventForAdmin();
  const [functions, roleCounts] = await Promise.all([getVolunteerFunctions(event.id), getVolunteerCountsByRole(event.id)]);
  const editId = firstParam(params?.edit);
  const showNew = firstParam(params?.new) === "1";
  const editing = editId ? functions.find((item) => item.id === editId) : undefined;
  const message = savedMessage(params?.saved);
  const totalSuggested = functions.filter((item) => item.active).reduce((sum, item) => sum + (item.suggested_quantity ?? 0), 0);
  const totalRegistered = functions.filter((item) => item.active).reduce((sum, item) => sum + Math.max(item.confirmed_quantity ?? 0, countVolunteersForFunction(roleCounts, item.name, item.area)), 0);

  return (
    <AdminPageShell>
      <section className="mx-auto max-w-7xl px-5 py-10">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link href="/admin/festa-junina" className="rounded-full bg-white px-5 py-3 text-sm font-black text-green-950 shadow-sm" prefetch={false}>← Painel do evento</Link>
          <Link href="/admin/festa-junina/voluntarios" className="rounded-full bg-white px-5 py-3 text-sm font-black text-green-950 shadow-sm" prefetch={false}>Voltar a voluntários</Link>
        </div>

        <div className="rounded-[2rem] border border-green-100 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-black text-green-900">Voluntários · Funções</span>
              <h1 className="mt-4 text-3xl font-black text-green-950">Cadastro por função</h1>
              <p className="mt-3 max-w-4xl text-stone-700">Organize funções de voluntários para compras, preparo, atendimento, caixa, entrega, coordenação e apoio. A coordenação pode ajustar quantidades e responsabilidades conforme a operação escolhida.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <form action={seedVolunteerFunctions}><button className="rounded-full bg-green-900 px-5 py-3 text-sm font-black text-white">Criar funções padrão</button></form>
              <Link href="/admin/festa-junina/voluntarios/funcoes?new=1" className="rounded-full border border-green-100 bg-white px-5 py-3 text-sm font-black text-green-950" prefetch={false}>Nova função</Link>
            </div>
          </div>

          {message ? <div className="mt-5 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm font-bold text-green-900">{message}</div> : null}

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-3xl bg-amber-50 p-5"><UsersRound className="h-6 w-6 text-green-900" /><p className="mt-3 text-3xl font-black text-green-950">{functions.length}</p><p className="text-sm font-bold text-stone-700">funções cadastradas</p></div>
            <div className="rounded-3xl bg-amber-50 p-5"><CheckCircle2 className="h-6 w-6 text-green-900" /><p className="mt-3 text-3xl font-black text-green-950">{totalSuggested}</p><p className="text-sm font-bold text-stone-700">voluntários sugeridos</p></div>
            <div className="rounded-3xl bg-amber-50 p-5"><UsersRound className="h-6 w-6 text-green-900" /><p className="mt-3 text-3xl font-black text-green-950">{totalRegistered}</p><p className="text-sm font-bold text-stone-700">confirmados/cadastrados</p></div>
          </div>
        </div>

        {(showNew || editing) ? <div className="mt-8"><FunctionForm item={editing} /></div> : null}

        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          {functions.map((item) => <FunctionCard key={item.id} item={item} registeredQuantity={countVolunteersForFunction(roleCounts, item.name, item.area)} />)}
          {functions.length === 0 ? (
            <div className="rounded-[2rem] border border-dashed border-green-200 bg-green-50 p-8 text-sm text-stone-700 lg:col-span-2">
              Nenhuma função cadastrada ainda. Clique em <strong>Criar funções padrão</strong> para gerar os cards iniciais de coordenação, check-in, caixa, atendimento, cozinha, entrega, compras e apoio.
            </div>
          ) : null}
        </div>
      </section>
    </AdminPageShell>
  );
}
