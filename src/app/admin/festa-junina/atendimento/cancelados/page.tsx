import Link from "next/link";
import { Ban, CalendarDays, Filter, RotateCcw, Trash2, Utensils } from "lucide-react";
import { AdminPageShell } from "@/components/admin-page-shell";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import { requireAdmin } from "@/lib/auth";
import { getCurrentEventForAdmin } from "@/lib/current-event";
import { formatCurrency } from "@/lib/format";
import { deliveryStatusLabel, getConsumptionOrdersForEvent, orderStatusLabel, paymentStatusLabel } from "@/lib/operation-dashboard";
import { permanentlyDeleteConsumptionOrder, reactivateConsumptionOrder } from "./actions";

export const dynamic = "force-dynamic";

type CanceladosSearchParams = {
  data_inicio?: string;
  data_fim?: string;
  periodo?: string;
  restaurado?: string;
  excluido?: string;
  erro?: string;
};

type PageProps = {
  searchParams?: Promise<CanceladosSearchParams>;
};

function shortId(id: string) {
  return id.slice(0, 8).toUpperCase();
}

function isoDate(value: string | null | undefined) {
  return value ? value.slice(0, 10) : "";
}

function cancelledHour(value: string | null | undefined) {
  if (!value) return -1;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? -1 : date.getHours();
}

function matchesPeriod(cancelledAt: string | null | undefined, period: string) {
  if (!period) return true;
  const hour = cancelledHour(cancelledAt);
  if (hour < 0) return false;
  if (period === "madrugada") return hour >= 0 && hour < 6;
  if (period === "manha") return hour >= 6 && hour < 12;
  if (period === "tarde") return hour >= 12 && hour < 18;
  if (period === "noite") return hour >= 18 && hour < 24;
  return true;
}

function matchesDateRange(cancelledAt: string | null | undefined, startDate: string, endDate: string) {
  const date = isoDate(cancelledAt);
  if (!date && (startDate || endDate)) return false;
  if (startDate && date < startDate) return false;
  if (endDate && date > endDate) return false;
  return true;
}

function buildReturnPath(params: CanceladosSearchParams | undefined) {
  const query = new URLSearchParams();
  if (params?.data_inicio) query.set("data_inicio", params.data_inicio);
  if (params?.data_fim) query.set("data_fim", params.data_fim);
  if (params?.periodo) query.set("periodo", params.periodo);
  const queryString = query.toString();
  return `/admin/festa-junina/atendimento/cancelados${queryString ? `?${queryString}` : ""}`;
}

export default async function CancelledConsumptionOrdersPage({ searchParams }: PageProps) {
  await requireAdmin(["admin", "coordenador"], "/admin/festa-junina/atendimento/cancelados");
  const params = await searchParams;
  const event = await getCurrentEventForAdmin();
  const startDate = params?.data_inicio ?? "";
  const endDate = params?.data_fim ?? "";
  const period = params?.periodo ?? "";
  const returnTo = buildReturnPath(params);

  const allCancelledOrders = (await getConsumptionOrdersForEvent(event.id, { includeCancelled: true })).filter((order) => order.status === "cancelled");
  const orders = allCancelledOrders.filter((order) => matchesDateRange(order.cancelled_at, startDate, endDate) && matchesPeriod(order.cancelled_at, period));
  const totalCancelled = orders.reduce((sum, order) => sum + Number(order.total_amount ?? 0), 0);
  const hasActiveFilter = Boolean(startDate || endDate || period);

  return (
    <AdminPageShell>
      <section className="mx-auto max-w-7xl px-5 py-10">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link href="/admin/festa-junina/atendimento" className="rounded-full bg-white px-5 py-3 text-sm font-black text-green-950 shadow-sm" prefetch={false}>← Atendimento</Link>
          <Link href="/gestao-evento/garcom" className="rounded-full bg-green-900 px-5 py-3 text-sm font-black text-white shadow-sm" prefetch={false}>Ir para Garçom/Atendimento</Link>
        </div>

        <div className="rounded-[2rem] border border-green-100 bg-white p-6 shadow-sm">
          <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-black text-red-900">Atendimento · Cancelados</span>
          <h1 className="mt-4 text-3xl font-black text-green-950">Pedidos cancelados</h1>
          <p className="mt-3 max-w-4xl text-stone-700">
            Consulte cancelamentos por data e período para revisar testes, restaurar pedidos válidos ou excluir definitivamente registros que não devem permanecer na base. A exclusão definitiva exige confirmação e não pode ser desfeita.
          </p>

          <form className="mt-6 grid gap-3 rounded-3xl border border-green-100 bg-green-50 p-4 md:grid-cols-[1fr_1fr_1fr_auto]" method="get">
            <label className="grid gap-1 text-sm font-bold text-green-950">
              Data inicial
              <input type="date" name="data_inicio" defaultValue={startDate} className="rounded-2xl border border-green-100 bg-white px-4 py-3 text-sm" />
            </label>
            <label className="grid gap-1 text-sm font-bold text-green-950">
              Data final
              <input type="date" name="data_fim" defaultValue={endDate} className="rounded-2xl border border-green-100 bg-white px-4 py-3 text-sm" />
            </label>
            <label className="grid gap-1 text-sm font-bold text-green-950">
              Período
              <select name="periodo" defaultValue={period} className="rounded-2xl border border-green-100 bg-white px-4 py-3 text-sm">
                <option value="">Dia inteiro</option>
                <option value="madrugada">Madrugada</option>
                <option value="manha">Manhã</option>
                <option value="tarde">Tarde</option>
                <option value="noite">Noite</option>
              </select>
            </label>
            <div className="flex items-end">
              <button className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-green-900 px-5 py-3 text-sm font-black text-white"><Filter className="h-4 w-4" /> Filtrar</button>
            </div>
          </form>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-3xl bg-red-50 p-5"><p className="text-sm font-bold text-stone-600">Pedidos filtrados</p><p className="mt-2 text-3xl font-black text-red-900">{orders.length}</p></div>
            <div className="rounded-3xl bg-amber-50 p-5"><p className="text-sm font-bold text-stone-600">Valor cancelado filtrado</p><p className="mt-2 text-3xl font-black text-green-950">{formatCurrency(totalCancelled)}</p></div>
            <div className="rounded-3xl bg-stone-50 p-5"><p className="text-sm font-bold text-stone-600">Total cancelado na base</p><p className="mt-2 text-3xl font-black text-green-950">{allCancelledOrders.length}</p></div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3 text-sm font-bold text-stone-700">
            <CalendarDays className="h-4 w-4 text-green-800" />
            {hasActiveFilter ? "Mostrando somente os cancelamentos que batem com o filtro acima." : "Sem filtro aplicado: mostrando todos os pedidos cancelados do evento, inclusive testes."}
            {hasActiveFilter ? <Link href="/admin/festa-junina/atendimento/cancelados" className="rounded-full bg-white px-4 py-2 text-green-950 shadow-sm" prefetch={false}>Limpar filtro</Link> : null}
          </div>
        </div>

        {params?.restaurado ? <div className="mt-5 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm font-bold text-green-900">Pedido restaurado para a operação.</div> : null}
        {params?.excluido ? <div className="mt-5 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm font-bold text-green-900">Pedido excluído definitivamente.</div> : null}
        {params?.erro ? <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-800">Não foi possível executar a ação. Confira se o pedido está cancelado.</div> : null}

        <div className="mt-8 grid gap-4">
          {orders.map((order) => (
            <article key={order.id} className="rounded-[2rem] border border-red-100 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-red-800"><Ban className="mr-1 inline h-4 w-4" /> Pedido {shortId(order.id)}</p>
                  <h2 className="mt-1 text-2xl font-black text-green-950">{order.table_label || "Sem mesa"} · {order.customer_name || "Responsável não informado"}</h2>
                  <p className="mt-1 text-sm text-stone-600">Garçom: {order.waiter_name || "não informado"} · WhatsApp: {order.customer_phone || "não informado"}</p>
                  <p className="mt-1 text-sm text-stone-600">Cancelado em: {order.cancelled_at ? new Date(order.cancelled_at).toLocaleString("pt-BR") : "não informado"}</p>
                  <p className="mt-1 text-sm text-stone-600">Motivo: {order.cancellation_reason || "não informado"}</p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-xs font-bold text-stone-500">Total cancelado</p>
                  <p className="text-2xl font-black text-green-950">{formatCurrency(order.total_amount)}</p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2 text-xs font-black">
                <span className="rounded-full bg-red-100 px-3 py-1 text-red-900">{orderStatusLabel(order.status)}</span>
                <span className="rounded-full bg-red-100 px-3 py-1 text-red-900">Entrega: {deliveryStatusLabel(order.delivery_status)}</span>
                <span className="rounded-full bg-red-100 px-3 py-1 text-red-900">Pagamento: {paymentStatusLabel(order.payment_status)}</span>
              </div>

              <div className="mt-4 grid gap-2 md:grid-cols-2">
                {order.items.map((item) => (
                  <div key={item.id} className="rounded-2xl bg-stone-50 p-3 text-sm">
                    <div className="flex items-start gap-2"><Utensils className="mt-0.5 h-4 w-4 text-green-800" /><div><strong>{item.item_name}</strong><p className="text-stone-600">{Number(item.quantity)} × {formatCurrency(item.unit_price)} = {formatCurrency(item.total_price)}</p></div></div>
                  </div>
                ))}
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <Link href={`/cardapio/${event.slug}/pedido/${order.id}`} className="rounded-full bg-white px-5 py-3 text-sm font-black text-green-950 shadow-sm" prefetch={false}>Abrir pedido</Link>
                <form action={reactivateConsumptionOrder}>
                  <input type="hidden" name="order_id" value={order.id} />
                  <input type="hidden" name="return_to" value={returnTo} />
                  <button className="inline-flex items-center gap-2 rounded-full bg-green-900 px-5 py-3 text-sm font-black text-white"><RotateCcw className="h-4 w-4" /> Restaurar pedido</button>
                </form>
                <form action={permanentlyDeleteConsumptionOrder}>
                  <input type="hidden" name="order_id" value={order.id} />
                  <input type="hidden" name="return_to" value={returnTo} />
                  <ConfirmSubmitButton message={`Excluir definitivamente o pedido ${shortId(order.id)}? Esta ação é irreversível e remove pedido, itens e pagamentos vinculados.`} className="inline-flex items-center gap-2 rounded-full bg-red-800 px-5 py-3 text-sm font-black text-white hover:bg-red-900">
                    <Trash2 className="h-4 w-4" /> Excluir definitivamente
                  </ConfirmSubmitButton>
                </form>
              </div>
            </article>
          ))}
          {orders.length === 0 ? <div className="rounded-[2rem] border border-dashed border-green-200 bg-green-50 p-8 text-center text-sm text-stone-700">Nenhum pedido cancelado encontrado para o filtro selecionado.</div> : null}
        </div>
      </section>
    </AdminPageShell>
  );
}
