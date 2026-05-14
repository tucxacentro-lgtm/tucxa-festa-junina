import { AdminPageShell } from "@/components/admin-page-shell";
import { requireAdmin } from "@/lib/auth";
import { getCurrentEventForAdmin } from "@/lib/current-event";

export const dynamic = "force-dynamic";

function n(value: number | null | undefined, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

export default async function SimulacaoCapacidadePage() {
  await requireAdmin(["admin", "coordenador"], "/admin/festa-junina/simulacao/capacidade");
  const event = await getCurrentEventForAdmin();
  const hallCapacity = n(event.covered_hall_capacity, 80);
  const operationalCapacity = n(event.operational_capacity, hallCapacity);
  const safetyMargin = n(event.safety_margin_percent, 15);
  const targetWithMargin = Math.ceil(operationalCapacity * (1 + safetyMargin / 100));
  const tableCount = n(event.estimated_tables, Math.ceil(operationalCapacity / 4));
  const chairCount = n(event.estimated_chairs, operationalCapacity);
  const attendanceVolunteers = Math.max(2, Math.ceil(operationalCapacity / 30));
  const prepVolunteers = Math.max(2, Math.ceil(operationalCapacity / 35));
  const cashierVolunteers = Math.max(1, Math.ceil(operationalCapacity / 80));
  const checkinVolunteers = Math.max(1, Math.ceil(operationalCapacity / 80));
  const operationSupport = Math.max(1, Math.ceil(operationalCapacity / 50));

  return (
    <AdminPageShell>
      <section className="mx-auto max-w-7xl px-5 py-10">
        <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-black text-green-900">Simulação</span>
        <h1 className="mt-4 text-3xl font-black text-green-950">Simulação de capacidade e planejamento</h1>
        <p className="mt-3 max-w-4xl text-stone-700">
          Relatório inicial para decidir quantos convites vender, quais recursos do local considerar e quais funções preparar. As sugestões devem ser validadas pela coordenação e ajustadas quando o cardápio estiver definido.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-4">
          <div className="rounded-3xl border border-green-100 bg-white p-5 shadow-sm"><p className="text-sm text-stone-600">Capacidade salão</p><strong className="text-3xl text-green-950">{hallCapacity}</strong></div>
          <div className="rounded-3xl border border-green-100 bg-white p-5 shadow-sm"><p className="text-sm text-stone-600">Capacidade operacional</p><strong className="text-3xl text-green-950">{operationalCapacity}</strong></div>
          <div className="rounded-3xl border border-green-100 bg-white p-5 shadow-sm"><p className="text-sm text-stone-600">Com margem</p><strong className="text-3xl text-green-950">{targetWithMargin}</strong></div>
          <div className="rounded-3xl border border-green-100 bg-white p-5 shadow-sm"><p className="text-sm text-stone-600">Mesas/cadeiras</p><strong className="text-3xl text-green-950">{tableCount}/{chairCount}</strong></div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-[2rem] border border-green-100 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-black text-green-950">Recursos do Espaço Santa Fé</h2>
            <ul className="mt-4 grid gap-2 text-sm text-stone-700">
              <li>Área gourmet: {event.has_gourmet_area ? "sim" : "não informado"}</li>
              <li>Churrasqueira: {event.has_barbecue_grill ? "sim" : "não informado"}</li>
              <li>Freezer/Geladeira: {n(event.freezer_count, 0)} freezer(s), {n(event.refrigerator_count, 0)} geladeira(s)</li>
              <li>Bebedouro: {event.has_water_fountain ? "sim" : "não informado"}</li>
              <li>Fogão a gás/à lenha: {event.has_gas_stove ? "gás" : "gás não informado"} / {event.has_wood_stove ? "lenha" : "lenha não informado"}</li>
              <li>Piscina aquecida e área rasa infantil: {event.has_heated_pool ? "sim" : "não informado"}</li>
              <li>Som ambiente e ventilação: {event.has_sound_system ? "sim" : "não informado"} / {event.has_ventilation ? "sim" : "não informado"}</li>
            </ul>
            {event.venue_resources_notes ? <p className="mt-4 rounded-2xl bg-green-50 p-4 text-sm text-green-950">{event.venue_resources_notes}</p> : null}
          </div>

          <div className="rounded-[2rem] border border-green-100 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-black text-green-950">Funções sugeridas</h2>
            <div className="mt-4 grid gap-3 text-sm">
              <p><strong>Check-in/recepção:</strong> {checkinVolunteers} pessoa(s)</p>
              <p><strong>Atendimento/apoio aos participantes:</strong> {attendanceVolunteers} pessoa(s)</p>
              <p><strong>Preparo/cozinha:</strong> {prepVolunteers} pessoa(s), a confirmar pelo cardápio</p>
              <p><strong>Caixa/pagamento:</strong> {cashierVolunteers} pessoa(s)</p>
              <p><strong>Compras/estoque/apoio:</strong> {operationSupport} pessoa(s)</p>
            </div>
            <p className="mt-4 rounded-2xl bg-amber-50 p-4 text-sm font-bold text-amber-900">Quando o cardápio estiver disponível, este relatório poderá consolidar insumos, itens finais, necessidade de preparo e voluntários por função.</p>
          </div>
        </div>

        <div className="mt-8 rounded-[2rem] border border-green-100 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-black text-green-950">Pontos de atenção para execução</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-stone-700">
            <li>Usar a capacidade do salão coberto como referência inicial de conforto.</li>
            <li>Validar circulação, filas, acesso à área gourmet, presença de crianças e tempo médio de permanência.</li>
            <li>Confirmar local de armazenamento de bebidas, gelo, descartáveis e insumos de preparo.</li>
            <li>Simular check-in, aprovação de comprovantes, caixa e fluxo de retirada/entrega antes do evento.</li>
          </ul>
          {event.capacity_notes ? <p className="mt-4 rounded-2xl bg-stone-50 p-4 text-sm text-stone-700">{event.capacity_notes}</p> : null}
        </div>
      </section>
    </AdminPageShell>
  );
}
