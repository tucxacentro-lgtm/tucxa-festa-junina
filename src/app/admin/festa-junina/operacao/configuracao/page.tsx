import Link from "next/link";
import { Monitor, QrCode, UsersRound, Utensils, type LucideIcon } from "lucide-react";
import { AdminPageShell } from "@/components/admin-page-shell";
import { requireAdmin } from "@/lib/auth";
import { getCurrentEventForAdmin } from "@/lib/current-event";
import { getOperationSettings, OPERATION_LABELS, optionLabel } from "@/lib/operation-rules";
import { saveOperationSettings } from "./actions";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams?: Promise<{ saved?: string }>;
};

function SelectField({ label, name, value, options, hint }: { label: string; name: string; value: string; options: Record<string, string>; hint?: string }) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-black text-green-950">{label}</span>
      <select name={name} defaultValue={value} className="rounded-2xl border border-green-900/15 bg-white px-4 py-3 text-sm font-bold text-stone-800 shadow-sm outline-none focus:border-green-800">
        {Object.entries(options).map(([optionValue, optionLabelText]) => (
          <option key={optionValue} value={optionValue}>{optionLabelText}</option>
        ))}
      </select>
      {hint ? <span className="text-xs text-stone-500">{hint}</span> : null}
    </label>
  );
}

function ToggleField({ name, label, defaultChecked, hint }: { name: string; label: string; defaultChecked: boolean; hint?: string }) {
  return (
    <label className="flex gap-3 rounded-2xl border border-amber-100 bg-amber-50/60 p-4 text-sm font-bold text-green-950">
      <input name={name} type="checkbox" defaultChecked={defaultChecked} className="mt-1 h-4 w-4" />
      <span>
        {label}
        {hint ? <span className="mt-1 block text-xs font-medium text-stone-500">{hint}</span> : null}
      </span>
    </label>
  );
}

function SummaryCard({ title, value, description }: { title: string; value: string; description: string }) {
  return (
    <div className="rounded-3xl border border-green-900/10 bg-white p-5 shadow-sm">
      <p className="text-xs font-black uppercase tracking-[0.14em] text-green-700">{title}</p>
      <p className="mt-2 text-lg font-black text-green-950">{value}</p>
      <p className="mt-2 text-sm text-stone-600">{description}</p>
    </div>
  );
}

function FlowStep({ icon: Icon, title, body }: { icon: LucideIcon; title: string; body: string }) {
  return (
    <div className="rounded-3xl border border-green-900/10 bg-white p-5 shadow-sm">
      <Icon className="h-6 w-6 text-green-800" />
      <h3 className="mt-3 text-base font-black text-green-950">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-stone-600">{body}</p>
    </div>
  );
}

export default async function OperationalConfigurationPage({ searchParams }: PageProps) {
  await requireAdmin(["admin", "coordenador"], "/admin/festa-junina/operacao/configuracao");
  const params = await searchParams;
  const event = await getCurrentEventForAdmin();
  const settings = await getOperationSettings(event);

  return (
    <AdminPageShell>
      <section className="mx-auto max-w-6xl px-5 py-10">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link href="/admin/festa-junina" className="rounded-2xl bg-white px-5 py-3 text-sm font-bold text-green-950 shadow-sm" prefetch={false}>← Voltar à gestão</Link>
          <Link href="/admin/festa-junina/ajuda" className="rounded-2xl bg-white px-5 py-3 text-sm font-bold text-green-950 shadow-sm" prefetch={false}>Ver manual</Link>
        </div>

        <div className="rounded-[2rem] border border-green-900/10 bg-white p-6 shadow-sm">
          <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-black text-green-800">Operação • Configuração</span>
          <h1 className="mt-4 text-3xl font-black text-green-950">Configuração Operacional do Evento</h1>
          <p className="mt-3 max-w-4xl text-stone-700">
            Defina como a Festa Junina vai funcionar na prática. O objetivo é permitir uso total, parcial ou manual do sistema: venda no sistema, planilha, QR Code por mesa, pedidos por garçom, comanda em papel, retirada pelo cliente, fechamento por pedido ou por mesa/responsável.
          </p>
          <div className="mt-4 rounded-2xl bg-amber-50 p-4 text-sm font-bold text-amber-950">
            Evento aberto: {event.name}. Estas regras valem somente para este evento e podem ser ajustadas pela coordenação antes da operação.
          </div>
        </div>

        {params?.saved ? (
          <div className="mt-6 rounded-3xl border border-green-200 bg-green-50 p-5 text-sm font-black text-green-900">Configuração operacional salva com sucesso.</div>
        ) : null}

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <SummaryCard title="Convites" value={optionLabel("sales_source_mode", settings.sales_source_mode)} description="Permite operar com vendas registradas, quantidade manual e planilha de apoio." />
          <SummaryCard title="Pedidos" value={optionLabel("order_entry_mode", settings.order_entry_mode)} description="Define se o pedido será feito pelo convidado, garçom, caixa ou todos." />
          <SummaryCard title="Pagamento" value={optionLabel("payment_mode", settings.payment_mode)} description="Define pagamento por pedido, fechamento da mesa/responsável ou modo misto." />
        </div>

        <section className="mt-8 grid gap-4 md:grid-cols-4">
          <FlowStep icon={QrCode} title="Acesso ao cardápio" body="Escolha se o QR Code será único do evento, por mesa, por convidado ou combinado." />
          <FlowStep icon={UsersRound} title="Mesas e convidados" body="A associação à mesa pode ser opcional, obrigatória para pedidos ou não utilizada." />
          <FlowStep icon={Utensils} title="Preparo e separação" body="Defina se cozinha e separação precisam sinalizar início, término e pedido pronto." />
          <FlowStep icon={Monitor} title="TV de retirada" body="Quando houver retirada pelo cliente, o sistema pode exibir pedidos prontos em TV/monitor." />
        </section>

        <form action={saveOperationSettings} className="mt-8 space-y-6">
          <section className="rounded-[2rem] border border-green-900/10 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-black text-green-950">1. Convites, base de convidados e planejamento</h2>
            <p className="mt-2 text-sm text-stone-600">Escolha se os convites serão registrados no sistema, informados manualmente, importados por planilha ou usados de forma mista.</p>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <SelectField label="Como considerar vendas de convites" name="sales_source_mode" value={settings.sales_source_mode} options={OPERATION_LABELS.sales_source_mode} />
              <ToggleField name="invite_manual_upload_enabled" label="Permitir inclusão manual e upload/planilha de convidados" defaultChecked={settings.invite_manual_upload_enabled} hint="Útil quando poucas ou nenhuma venda foi feita pelo sistema." />
            </div>
          </section>

          <section className="rounded-[2rem] border border-green-900/10 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-black text-green-950">2. Cardápio, QR Code, mesas e pedidos</h2>
            <p className="mt-2 text-sm text-stone-600">Configure como convidados, mesas, garçons e caixa acessarão o cardápio e registrarão consumo.</p>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <SelectField label="Acesso ao cardápio" name="menu_access_mode" value={settings.menu_access_mode} options={OPERATION_LABELS.menu_access_mode} />
              <SelectField label="Associação de convidados às mesas" name="table_assignment_mode" value={settings.table_assignment_mode} options={OPERATION_LABELS.table_assignment_mode} />
              <SelectField label="Quem registra pedidos" name="order_entry_mode" value={settings.order_entry_mode} options={OPERATION_LABELS.order_entry_mode} />
              <ToggleField name="paper_ticket_enabled" label="Permitir comanda de papel com lançamento posterior" defaultChecked={settings.paper_ticket_enabled} hint="Permite registrar número da comanda, mesa, responsável e observações depois." />
            </div>
          </section>

          <section className="rounded-[2rem] border border-green-900/10 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-black text-green-950">3. Preparo, separação e entrega</h2>
            <p className="mt-2 text-sm text-stone-600">Defina o quanto o fluxo da cozinha e entrega será controlado no sistema.</p>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <ToggleField name="kitchen_start_required" label="Cozinha sinaliza início do preparo" defaultChecked={settings.kitchen_start_required} />
              <ToggleField name="kitchen_finish_required" label="Cozinha sinaliza término do preparo" defaultChecked={settings.kitchen_finish_required} />
              <ToggleField name="separation_required" label="Separação informa quando o pedido está pronto" defaultChecked={settings.separation_required} />
              <SelectField label="Entrega ou retirada" name="delivery_mode" value={settings.delivery_mode} options={OPERATION_LABELS.delivery_mode} />
              <SelectField label="Confirmação de entrega" name="delivery_confirmation_mode" value={settings.delivery_confirmation_mode} options={OPERATION_LABELS.delivery_confirmation_mode} />
              <ToggleField name="tv_pickup_enabled" label="Habilitar TV/monitor de pedidos prontos para retirada" defaultChecked={settings.tv_pickup_enabled} hint="Mostra número do pedido, nome e mesa do solicitante." />
            </div>
          </section>

          <section className="rounded-[2rem] border border-green-900/10 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-black text-green-950">4. Caixa, pagamentos e comprovantes</h2>
            <p className="mt-2 text-sm text-stone-600">Configure se o pagamento será feito a cada pedido ou no fechamento final, e se comprovantes serão obrigatórios.</p>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <SelectField label="Modo de pagamento" name="payment_mode" value={settings.payment_mode} options={OPERATION_LABELS.payment_mode} />
              <ToggleField name="split_payment_enabled" label="Permitir dividir pagamento entre várias pessoas" defaultChecked={settings.split_payment_enabled} hint="Ex.: parte no Pix, parte no cartão e parte em dinheiro." />
              <SelectField label="Quem pode anexar comprovante/recibo" name="proof_upload_actor" value={settings.proof_upload_actor} options={OPERATION_LABELS.proof_upload_actor} />
              <ToggleField name="proof_upload_required" label="Exigir upload de comprovante/recibo quando configurado" defaultChecked={settings.proof_upload_required} hint="Pode ser comprovante Pix, foto de recibo de cartão, dinheiro ou registro autorizado." />
            </div>
          </section>

          <section className="rounded-[2rem] border border-green-900/10 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-black text-green-950">5. Observações da coordenação</h2>
            <textarea name="notes" defaultValue={settings.notes ?? ""} rows={5} className="mt-4 w-full rounded-2xl border border-green-900/15 bg-white p-4 text-sm outline-none focus:border-green-800" placeholder="Ex.: em 2026 vamos usar venda manual + sistema, pedidos por garçom, retirada pelo cliente para bebidas e entrega por garçom para comidas." />
          </section>

          <div className="sticky bottom-4 z-20 rounded-[2rem] border border-green-900/10 bg-green-950 p-4 shadow-2xl md:flex md:items-center md:justify-between">
            <div>
              <p className="font-black text-white">Salvar regras da operação</p>
              <p className="text-sm text-white/70">Essas escolhas orientam cardápio, pedidos, preparo, entrega, caixa e prestação de contas.</p>
            </div>
            <button className="mt-4 w-full rounded-2xl bg-amber-300 px-6 py-3 font-black text-green-950 md:mt-0 md:w-auto">Salvar configuração operacional</button>
          </div>
        </form>
      </section>
    </AdminPageShell>
  );
}
