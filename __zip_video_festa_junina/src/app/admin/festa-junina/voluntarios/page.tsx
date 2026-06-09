import Link from "next/link";
import { VolunteerRoleSummary } from "@/components/volunteer-role-summary";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabaseServer";
import { createVolunteer, updateVolunteer } from "./actions";
import { AdminPageShell } from "@/components/admin-page-shell";

export const dynamic = "force-dynamic";

type PageProps = { searchParams?: Promise<{ saved?: string }> };

type Volunteer = {
  id: string;
  name: string;
  whatsapp: string | null;
  email: string | null;
  role: string;
  availability: string | null;
  notes: string | null;
  active: boolean;
};

async function getData() {
  const supabase = createSupabaseAdminClient();
  const { data: event } = await supabase.from("events").select("id").eq("slug", "arraia-tucxa-2026").single();
  if (!event) return { volunteers: [] as Volunteer[], confirmedPeople: 0, possiblePeople: 0 };

  const [{ data: volunteers }, { data: orders }] = await Promise.all([
    supabase.from("event_volunteers").select("*").eq("event_id", event.id).order("role").order("name"),
    supabase.from("ticket_orders").select("adults_quantity, children_quantity, payment_status").eq("event_id", event.id),
  ]);

  let confirmedPeople = 0;
  let possiblePeople = 0;
  for (const order of (orders ?? []) as Array<{ adults_quantity: number; children_quantity: number; payment_status: string }>) {
    const people = Number(order.adults_quantity ?? 0) + Number(order.children_quantity ?? 0);
    if (order.payment_status === "paid") confirmedPeople += people;
    if (["paid", "proof_sent", "pending"].includes(order.payment_status)) possiblePeople += people;
  }

  return { volunteers: (volunteers ?? []) as Volunteer[], confirmedPeople, possiblePeople };
}

const roles = ["Organização/compras", "Preparo/cozinha", "Atendimento/garçom", "Caixa", "Entrega/retirada", "Coordenação", "Apoio geral"];

export default async function VoluntariosPage({ searchParams }: PageProps) {
  await requireAdmin(["admin", "coordenador"], "/admin/festa-junina/voluntarios");
  const params = await searchParams;
  const { volunteers, confirmedPeople, possiblePeople } = await getData();

  return (
    <AdminPageShell>
      
      <section className="mx-auto max-w-6xl px-5 py-12">
        <Link href="/admin/festa-junina" className="rounded-2xl bg-white px-5 py-3 text-sm font-bold text-green-950 shadow-sm" prefetch={false}>← Voltar ao admin</Link>
        <h1 className="mt-8 text-3xl font-black text-green-950">Voluntários e papéis</h1>
        <p className="mt-2 max-w-3xl text-stone-600">Cadastre os voluntários e use a sugestão por quantidade de participantes como referência editável para a escala.</p>
        {params?.saved ? <div className="mt-5 rounded-3xl border border-green-200 bg-green-50 p-4 text-sm font-bold text-green-900">Voluntário salvo com sucesso.</div> : null}

        <div className="mt-8"><VolunteerRoleSummary confirmedPeople={confirmedPeople} possiblePeople={possiblePeople} /></div>

        <form action={createVolunteer} className="mt-8 rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-black text-green-950">Novo voluntário</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <input required name="name" placeholder="Nome" className="rounded-2xl border p-3" />
            <input name="whatsapp" placeholder="WhatsApp" className="rounded-2xl border p-3" />
            <input name="email" placeholder="E-mail opcional" className="rounded-2xl border p-3" />
            <select name="role" className="rounded-2xl border p-3">{roles.map((role) => <option key={role} value={role}>{role}</option>)}</select>
            <input name="availability" placeholder="Disponibilidade" className="rounded-2xl border p-3" />
            <input name="notes" placeholder="Observações" className="rounded-2xl border p-3" />
          </div>
          <button className="mt-4 rounded-2xl bg-green-900 px-5 py-3 font-black text-white">Adicionar voluntário</button>
        </form>

        <div className="mt-8 grid gap-4">
          {volunteers.map((volunteer) => (
            <form key={volunteer.id} action={updateVolunteer} className="rounded-3xl bg-white p-5 shadow-sm">
              <input type="hidden" name="id" value={volunteer.id} />
              <div className="grid gap-3 md:grid-cols-4">
                <input name="name" defaultValue={volunteer.name} className="rounded-2xl border p-3" />
                <input name="whatsapp" defaultValue={volunteer.whatsapp ?? ""} className="rounded-2xl border p-3" />
                <input name="email" defaultValue={volunteer.email ?? ""} className="rounded-2xl border p-3" />
                <select name="role" defaultValue={volunteer.role} className="rounded-2xl border p-3">{roles.map((role) => <option key={role} value={role}>{role}</option>)}</select>
                <input name="availability" defaultValue={volunteer.availability ?? ""} className="rounded-2xl border p-3 md:col-span-2" />
                <input name="notes" defaultValue={volunteer.notes ?? ""} className="rounded-2xl border p-3 md:col-span-2" />
                <label className="flex items-center gap-2 rounded-2xl bg-amber-50 p-3 text-sm font-bold text-green-950"><input type="checkbox" name="active" defaultChecked={volunteer.active} /> Ativo</label>
              </div>
              <button className="mt-3 rounded-2xl bg-green-900 px-5 py-2 text-sm font-black text-white">Salvar</button>
            </form>
          ))}
        </div>
      </section>
    </AdminPageShell>
  );
}
