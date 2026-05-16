import Link from "next/link";
import { Edit3, Plus, UserRoundCheck, UsersRound } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { AdminPageShell } from "@/components/admin-page-shell";
import { getCurrentEventForAdmin } from "@/lib/current-event";
import { getEventVolunteers, getVolunteerFunctions, volunteerMatchesFunction, type EventVolunteer, type VolunteerFunction } from "@/lib/volunteer-functions";
import { deactivateVolunteer, saveVolunteerAssignment } from "./actions";

export const dynamic = "force-dynamic";

type PageProps = { searchParams?: Promise<Record<string, string | string[] | undefined>> };

function firstParam(value: string | string[] | undefined) { return Array.isArray(value) ? value[0] : value; }

function phoneText(value: string | null) { return value || "WhatsApp não informado"; }

function VolunteerForm({ role, volunteer }: { role: string; volunteer?: EventVolunteer }) {
  return (
    <form action={saveVolunteerAssignment} className="rounded-[1.75rem] border border-green-100 bg-white p-6 shadow-sm">
      <input type="hidden" name="id" value={volunteer?.id ?? ""} />
      <input type="hidden" name="role" value={volunteer?.role ?? role} />
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-black text-green-900">{volunteer ? "Editar voluntário" : "Novo voluntário"}</span>
          <h2 className="mt-3 text-2xl font-black text-green-950">{volunteer?.name ?? role}</h2>
          <p className="mt-2 text-sm text-stone-600">Cadastre o voluntário nesta função. E-mail é opcional.</p>
        </div>
        <Link href="/admin/festa-junina/voluntarios/necessidade" className="rounded-full bg-white px-4 py-2 text-sm font-black text-green-950 shadow-sm" prefetch={false}>Cancelar</Link>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-bold text-green-950">Nome completo<input name="name" required defaultValue={volunteer?.name ?? ""} className="rounded-2xl border border-green-100 p-3 font-normal" placeholder="Nome do voluntário" /></label>
        <label className="grid gap-2 text-sm font-bold text-green-950">WhatsApp<input name="whatsapp" defaultValue={volunteer?.whatsapp ?? ""} className="rounded-2xl border border-green-100 p-3 font-normal" placeholder="(19) 99999-9999" /></label>
        <label className="grid gap-2 text-sm font-bold text-green-950">E-mail <span className="font-normal text-stone-500">opcional</span><input name="email" type="email" defaultValue={volunteer?.email ?? ""} className="rounded-2xl border border-green-100 p-3 font-normal" placeholder="email@exemplo.com" /></label>
        <label className="grid gap-2 text-sm font-bold text-green-950">Turno/período<input name="availability" defaultValue={volunteer?.availability ?? ""} className="rounded-2xl border border-green-100 p-3 font-normal" placeholder="Ex.: 12h às 17h" /></label>
        <label className="grid gap-2 text-sm font-bold text-green-950 md:col-span-2">Observações<textarea name="notes" defaultValue={volunteer?.notes ?? ""} className="min-h-20 rounded-2xl border border-green-100 p-3 font-normal" /></label>
      </div>
      <button className="mt-6 w-full rounded-2xl bg-green-900 px-5 py-3 font-black text-white">Salvar voluntário</button>
    </form>
  );
}

function FunctionVolunteerCard({ item, volunteers }: { item: VolunteerFunction; volunteers: EventVolunteer[] }) {
  const activeVolunteers = volunteers.filter((volunteer) => volunteer.active && volunteerMatchesFunction(volunteer, item.name, item.area));
  const missing = Math.max(0, item.suggested_quantity - activeVolunteers.length);
  return (
    <article className="rounded-[1.75rem] border border-green-100 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-green-800">{item.area ?? "Função"}</p>
          <h2 className="mt-1 text-xl font-black text-green-950">{item.name}</h2>
          <p className="mt-2 text-sm text-stone-600">{item.shift_label ?? "Período a definir"}</p>
        </div>
        <Link href={`/admin/festa-junina/voluntarios/necessidade?role=${encodeURIComponent(item.name)}`} className="inline-flex items-center gap-2 rounded-full bg-green-900 px-4 py-2 text-sm font-black text-white" prefetch={false}><Plus className="h-4 w-4" /> Voluntário</Link>
      </div>
      <div className="mt-5 grid grid-cols-3 gap-3 text-center">
        <div className="rounded-2xl bg-green-50 p-3"><p className="text-xs font-bold text-stone-500">Sugeridos</p><p className="text-2xl font-black text-green-950">{item.suggested_quantity}</p></div>
        <div className="rounded-2xl bg-green-50 p-3"><p className="text-xs font-bold text-stone-500">Cadastrados</p><p className="text-2xl font-black text-green-950">{activeVolunteers.length}</p></div>
        <div className={`rounded-2xl p-3 ${missing > 0 ? "bg-amber-50" : "bg-green-50"}`}><p className="text-xs font-bold text-stone-500">Faltam</p><p className="text-2xl font-black text-green-950">{missing}</p></div>
      </div>
      <div className="mt-5 grid gap-3">
        {activeVolunteers.map((volunteer) => (
          <div key={volunteer.id} className="rounded-2xl bg-stone-50 p-4 text-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div><p className="font-black text-green-950">{volunteer.name}</p><p className="text-stone-600">{phoneText(volunteer.whatsapp)}{volunteer.email ? ` · ${volunteer.email}` : ""}</p>{volunteer.availability ? <p className="text-stone-600">{volunteer.availability}</p> : null}</div>
              <div className="flex flex-wrap gap-2"><Link href={`/admin/festa-junina/voluntarios/necessidade?edit=${volunteer.id}`} className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-2 text-xs font-black text-green-950 shadow-sm" prefetch={false}><Edit3 className="h-3 w-3" /> Editar</Link><form action={deactivateVolunteer}><input type="hidden" name="id" value={volunteer.id} /><button className="rounded-full bg-red-50 px-3 py-2 text-xs font-black text-red-700">Desativar</button></form></div>
            </div>
          </div>
        ))}
        {activeVolunteers.length === 0 ? <p className="rounded-2xl bg-amber-50 p-4 text-sm text-amber-900">Nenhum voluntário cadastrado nesta função.</p> : null}
      </div>
    </article>
  );
}

export default async function Page({ searchParams }: PageProps) {
  await requireAdmin(["admin", "coordenador"], "/admin/festa-junina/voluntarios/necessidade");
  const params = await searchParams;
  const event = await getCurrentEventForAdmin();
  const [functions, volunteers] = await Promise.all([getVolunteerFunctions(event.id), getEventVolunteers(event.id)]);
  const role = firstParam(params?.role);
  const editId = firstParam(params?.edit);
  const editing = editId ? volunteers.find((volunteer) => volunteer.id === editId) : undefined;
  const totalSuggested = functions.filter((item) => item.active).reduce((sum, item) => sum + item.suggested_quantity, 0);
  const totalActive = volunteers.filter((volunteer) => volunteer.active).length;

  return (
    <AdminPageShell>
      <section className="mx-auto max-w-7xl px-5 py-10">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3"><Link href="/admin/festa-junina" className="rounded-full bg-white px-5 py-3 text-sm font-black text-green-950 shadow-sm" prefetch={false}>← Painel do evento</Link><Link href="/admin/festa-junina/voluntarios/funcoes" className="rounded-full bg-white px-5 py-3 text-sm font-black text-green-950 shadow-sm" prefetch={false}>Funções</Link></div>
        <div className="rounded-[2rem] border border-green-100 bg-white p-6 shadow-sm">
          <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-black text-green-900">Voluntários · Equipe</span>
          <h1 className="mt-4 text-3xl font-black text-green-950">Necessidade e cadastro de voluntários</h1>
          <p className="mt-3 max-w-4xl text-stone-700">Cadastre voluntários por função com nome completo, WhatsApp e e-mail opcional. A tela compara a quantidade sugerida com a quantidade cadastrada.</p>
          <div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-3xl bg-amber-50 p-5"><UsersRound className="h-6 w-6 text-green-900" /><p className="mt-3 text-3xl font-black">{functions.length}</p><p className="text-sm font-bold text-stone-700">funções</p></div><div className="rounded-3xl bg-amber-50 p-5"><UserRoundCheck className="h-6 w-6 text-green-900" /><p className="mt-3 text-3xl font-black">{totalSuggested}</p><p className="text-sm font-bold text-stone-700">sugeridos</p></div><div className="rounded-3xl bg-amber-50 p-5"><UsersRound className="h-6 w-6 text-green-900" /><p className="mt-3 text-3xl font-black">{totalActive}</p><p className="text-sm font-bold text-stone-700">cadastrados</p></div></div>
        </div>
        {(role || editing) ? <div className="mt-8"><VolunteerForm role={editing?.role ?? role ?? "Apoio geral"} volunteer={editing} /></div> : null}
        <div className="mt-8 grid gap-5 lg:grid-cols-2">{functions.filter((item) => item.active).map((item) => <FunctionVolunteerCard key={item.id} item={item} volunteers={volunteers} />)}{functions.length === 0 ? <div className="rounded-[2rem] border border-dashed border-green-200 bg-green-50 p-8 text-sm text-stone-700 lg:col-span-2">Cadastre primeiro as funções em Voluntários &gt; Funções.</div> : null}</div>
      </section>
    </AdminPageShell>
  );
}
