import Link from "next/link";
import { CreditCard, ReceiptText, Search } from "lucide-react";
import { AdminPageShell } from "@/components/admin-page-shell";
import { requireAdmin } from "@/lib/auth";
import { getCurrentEventForAdmin } from "@/lib/current-event";
import { formatCurrency } from "@/lib/format";
import { deliveryStatusLabel, getConsumptionOrdersForEvent, orderStatusLabel, paymentMethodLabel, paymentStatusLabel } from "@/lib/operation-dashboard";

export const dynamic = "force-dynamic";

function shortId(id: string) {
  return id.slice(0, 8).toUpperCase();
}

function statusClass(value: string) {
  if (value === "delivered" || value === "paid") return "bg-green-100 text-green-900";
  if (value === "ready" || value === "proof_sent" || value === "registered") return "bg-blue-100 text-blue-900";
  if (value === "pending" || value === "preparing") return "bg-amber-100 text-amber-900";
  if (value === "cancelled") return "bg-red-100 text-red-900";
  return "bg-stone-100 text-stone-700";
}

export default async function CaixaPage() {
  await requireAdmin(["admin", "coordenador"], "/admin/festa-junina/caixa");
  const event = await getCurrentEventForAdmin();
  const orders = await getConsumptionOrdersForEvent(event.id);
  const totalOrders = orders.reduce((sum, order) => sum + Number(order.total_amount ?? 0), 0);
  const paidOrders = orders.filter((order) => order.payment_status === "paid");
  const pendingOrders = orders.filter((order) => order.payment_status !== "paid" && order.status !== "cancelled");
  const paidAmount = paidOrders.reduce((sum, order) => sum + Number(order.total_amount ?? 0), 0);
  const pendingAmount = pendingOrders.reduce((sum, order) => sum + Number(order.total_amount ?? 0), 0);

  const groupedByTable = orders.reduce<Record<string, typeof orders>>((acc, order) => {
    const key = order.table_label || order.customer_name || "Sem mesa/responsável";
    acc[key] = acc[key] ?? [];
    acc[key].push(order);
    return acc;
  }, {});

  return (
    <AdminPageShell>
      <section className="mx-auto max-w-7xl px-5 py-10">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link href="/admin/festa-junina" className="rounded-full bg-white px-5 py-3 text-sm font-black text-green-950 shadow-sm" prefetch={false}>← Painel de Gestão</Link>
          <Link href="/admin/festa-junina/garcom" className="rounded-full bg-white px-5 py-3 text-sm font-black text-green-950 shadow-sm" prefetch={false}>Ver visão do garçom</Link>
        </div>

        <div className="rounded-[2rem] border border-green-100 bg-white p-6 shadow-sm">
          <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-black text-green-900">Operação · Caixa</span>
          <h1 className="mt-4 text-3xl font-black text-green-950">Fechamento de pedidos, mesas e pagamentos</h1>
          <p className="mt-3 max-w-4xl text-stone-700">
            Acompanhe pedidos por mesa/responsável, itens consumidos, entrega, status de pagamento e comprovantes registrados.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-4">
            <div className="rounded-3xl bg-amber-50 p-5"><p className="text-sm font-bold text-stone-600">Total pedidos</p><p className="mt-2 text-2xl font-black text-green-950">{formatCurrency(totalOrders)}</p></div>
            <div className="rounded-3xl bg-green-50 p-5"><p className="text-sm font-bold text-stone-600">Pago</p><p className="mt-2 text-2xl font-black text-green-950">{formatCurrency(paidAmount)}</p></div>
            <div className="rounded-3xl bg-red-50 p-5"><p className="text-sm font-bold text-stone-600">Pendente</p><p className="mt-2 text-2xl font-black text-green-950">{formatCurrency(pendingAmount)}</p></div>
            <div className="rounded-3xl bg-stone-50 p-5"><p className="text-sm font-bold text-stone-600">Pedidos</p><p className="mt-2 text-2xl font-black text-green-950">{orders.length}</p></div>
          </div>
        </div>

        <div className="mt-8 rounded-[2rem] border border-green-100 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-black text-green-950">Clientes, mesas e pedidos</h2>
              <p className="mt-1 text-sm text-stone-600">Agrupamento por mesa ou responsável para facilitar conferência no caixa.</p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-stone-50 px-4 py-2 text-sm font-bold text-stone-600"><Search className="h-4 w-4" /> Use Ctrl+F para buscar</div>
          </div>

          <div className="mt-5 grid gap-5">
            {Object.entries(groupedByTable).map(([groupName, groupOrders]) => {
              const groupTotal = groupOrders.reduce((sum, order) => sum + Number(order.total_amount ?? 0), 0);
              const groupPending = groupOrders.filter((order) => order.payment_status !== "paid" && order.status !== "cancelled").reduce((sum, order) => sum + Number(order.total_amount ?? 0), 0);
              return (
                <section key={groupName} className="rounded-3xl border border-green-100 bg-stone-50 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.16em] text-green-800">Mesa/responsável</p>
                      <h3 className="mt-1 text-xl font-black text-green-950">{groupName}</h3>
                      <p className="mt-1 text-sm text-stone-600">{groupOrders.length} pedido(s)</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-stone-500">Total</p>
                      <p className="text-2xl font-black text-green-950">{formatCurrency(groupTotal)}</p>
                      <p className="text-xs font-bold text-red-800">Pendente: {formatCurrency(groupPending)}</p>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3">
                    {groupOrders.map((order) => (
                      <article key={order.id} className="rounded-2xl bg-white p-4">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <p className="font-black text-green-950">Pedido {shortId(order.id)} · {order.customer_name || "Cliente"}</p>
                            <p className="text-sm text-stone-600">WhatsApp: {order.customer_phone || "não informado"}</p>
                          </div>
                          <div className="flex flex-wrap gap-2 text-xs font-black">
                            <span className={`rounded-full px-3 py-1 ${statusClass(order.status)}`}>{orderStatusLabel(order.status)}</span>
                            <span className={`rounded-full px-3 py-1 ${statusClass(order.delivery_status)}`}>Entrega: {deliveryStatusLabel(order.delivery_status)}</span>
                            <span className={`rounded-full px-3 py-1 ${statusClass(order.payment_status)}`}>Pagamento: {paymentStatusLabel(order.payment_status)}</span>
                          </div>
                        </div>

                        <div className="mt-4 overflow-x-auto rounded-2xl border border-stone-100">
                          <table className="w-full min-w-[640px] text-left text-sm">
                            <thead className="bg-green-950 text-white">
                              <tr><th className="p-3">Item</th><th className="p-3">Qtd.</th><th className="p-3">Unitário</th><th className="p-3">Total</th><th className="p-3">Status</th></tr>
                            </thead>
                            <tbody>
                              {order.items.map((item) => (
                                <tr key={item.id} className="border-b border-stone-100 last:border-0">
                                  <td className="p-3 font-bold text-green-950">{item.item_name}</td>
                                  <td className="p-3">{Number(item.quantity)}</td>
                                  <td className="p-3">{formatCurrency(item.unit_price)}</td>
                                  <td className="p-3 font-black">{formatCurrency(item.total_price)}</td>
                                  <td className="p-3">{orderStatusLabel(item.status)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
                          <div className="rounded-2xl bg-stone-50 p-3 text-sm">
                            <p className="font-black text-green-950"><CreditCard className="mr-1 inline h-4 w-4" /> Pagamentos registrados</p>
                            {order.payments.length > 0 ? (
                              <ul className="mt-2 space-y-1 text-stone-700">
                                {order.payments.map((payment) => <li key={payment.id}>{paymentMethodLabel(payment.method)} · {formatCurrency(payment.amount)} · {paymentStatusLabel(payment.status)}{payment.proof_file_path ? " · comprovante anexado" : ""}</li>)}
                              </ul>
                            ) : <p className="mt-2 text-stone-600">Nenhum pagamento registrado.</p>}
                          </div>
                          <Link href={`/cardapio/arraia-tucxa-2026/pedido/${order.id}`} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-green-900 px-5 py-3 text-sm font-black text-white" prefetch={false}>
                            <ReceiptText className="h-4 w-4" /> Abrir pedido
                          </Link>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              );
            })}

            {orders.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-green-200 bg-green-50 p-8 text-center text-sm text-stone-700">
                Nenhum pedido de consumo foi registrado ainda.
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </AdminPageShell>
  );
}
