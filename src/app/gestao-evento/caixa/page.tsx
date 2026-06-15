import Link from "next/link";
import { ChevronDown, QrCode, Search, ShoppingBag } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { PixPaymentBox } from "@/components/pix-payment-box";
import {
  registerCashierGroupPayment,
  registerCashierOrderPayment,
  updateCashierOrderItems,
} from "@/app/gestao-evento/actions";
import { getCurrentEventForPublic } from "@/lib/current-event";
import { formatCurrency } from "@/lib/format";
import { buildPixCopyPastePayload } from "@/lib/pix";
import {
  buildSalesSummary,
  filterServiceRows,
  getActiveSalesMenuItemsForEvent,
  getConsumptionOrdersForEvent,
  getServiceResponsiblesForEvent,
  getWaiterOptions,
  isOrderPaid,
  pendingAmountFromOrder,
  pendingFromOrders,
  totalFromOrders,
  type ConsumptionOrderWithDetails,
  type SalesMenuItemOption,
  type ServiceResponsibleRow,
} from "@/lib/operation-dashboard";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams?: Promise<{
    q?: string;
    garcom?: string;
    responsavel?: string;
    pago?: string;
    erro?: string;
    editado?: string;
  }>;
};

type GroupedServiceResponsibleRow = ServiceResponsibleRow & {
  groupedSessionIds?: string[];
  responsibleKey?: string;
};

function normalizeResponsibleKey(name: string) {
  return (
    name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .toLowerCase() || "responsavel"
  );
}

function uniqueText(values: Array<string | null | undefined>) {
  return Array.from(
    new Set(values.map((value) => value?.trim()).filter(Boolean) as string[]),
  );
}

function groupRowsByResponsible(
  rows: ServiceResponsibleRow[],
): GroupedServiceResponsibleRow[] {
  const groups = new Map<string, GroupedServiceResponsibleRow>();

  for (const row of rows) {
    const key = normalizeResponsibleKey(
      row.responsibleName || "Responsável não informado",
    );
    const existing = groups.get(key);

    if (!existing) {
      groups.set(key, {
        ...row,
        id: `responsible:${key}`,
        responsibleKey: key,
        groupedSessionIds: [row.id],
        orders: [...row.orders],
      });
      continue;
    }

    existing.orders = [...existing.orders, ...row.orders];
    existing.groupedSessionIds = Array.from(
      new Set([...(existing.groupedSessionIds ?? []), row.id]),
    );
    existing.waiterName =
      uniqueText([existing.waiterName, row.waiterName]).join(", ") || null;
  }

  return Array.from(groups.values()).sort((a, b) =>
    a.responsibleName.localeCompare(b.responsibleName, "pt-BR"),
  );
}

function selectedRow(rows: GroupedServiceResponsibleRow[], key?: string) {
  if (!key) return rows[0];
  return (
    rows.find(
      (row) =>
        row.id === key ||
        row.responsibleKey === key ||
        row.responsibleName === key,
    ) ?? rows[0]
  );
}

function paymentMethodButton(
  method: string,
  label: string,
  row: GroupedServiceResponsibleRow,
  eventId: string,
  amount: number,
) {
  return (
    <form action={registerCashierGroupPayment} key={method}>
      <input type="hidden" name="event_id" value={eventId} />
      <input type="hidden" name="service_session_id" value={row.id} />
      <input
        type="hidden"
        name="responsible_name"
        value={row.responsibleName}
      />
      <input
        type="hidden"
        name="order_ids"
        value={row.orders.map((order) => order.id).join(",")}
      />
      <input type="hidden" name="amount" value={String(amount)} />
      <input type="hidden" name="method" value={method} />
      <button className="w-full rounded-2xl border border-green-100 bg-white px-4 py-3 text-sm font-black text-green-950 shadow-sm hover:bg-green-50 sm:w-auto">
        Registrar {label}
      </button>
    </form>
  );
}

function individualPaymentButton(
  method: string,
  label: string,
  order: ConsumptionOrderWithDetails,
  eventId: string,
  responsibleKey: string,
) {
  const amount = pendingAmountFromOrder(order);
  return (
    <form action={registerCashierOrderPayment} key={method}>
      <input type="hidden" name="event_id" value={eventId} />
      <input type="hidden" name="order_id" value={order.id} />
      <input type="hidden" name="responsible_key" value={responsibleKey} />
      <input type="hidden" name="amount" value={String(amount)} />
      <input type="hidden" name="method" value={method} />
      <button className="w-full rounded-2xl border border-green-100 bg-white px-4 py-3 text-xs font-black text-green-950 shadow-sm hover:bg-green-50 sm:w-auto">
        {label}
      </button>
    </form>
  );
}

function shortId(id: string) {
  return id.slice(0, 8).toUpperCase();
}

function currentQuantityForMenuItem(
  order: ConsumptionOrderWithDetails,
  menuItem: SalesMenuItemOption,
) {
  const direct = order.items.find(
    (item) => item.sales_menu_item_id === menuItem.id,
  );
  if (direct) return Number(direct.quantity);

  const byName = order.items.find((item) => item.item_name === menuItem.name);
  return byName ? Number(byName.quantity) : 0;
}

export default async function CaixaPublicPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const event = await getCurrentEventForPublic();
  const [rows, orders, menuItems] = await Promise.all([
    getServiceResponsiblesForEvent(event.id),
    getConsumptionOrdersForEvent(event.id),
    getActiveSalesMenuItemsForEvent(event.id),
  ]);
  const filteredRows = filterServiceRows(rows, params?.q, params?.garcom);
  const groupedRows = groupRowsByResponsible(filteredRows);
  const waiters = getWaiterOptions(rows);
  const current = selectedRow(groupedRows, params?.responsavel);
  const summary = buildSalesSummary(orders);
  const pending = current ? pendingFromOrders(current.orders) : 0;
  const currentTotal = current ? totalFromOrders(current.orders) : 0;
  const pixPayload =
    current && pending > 0
      ? buildPixCopyPastePayload({
          pixKey: event.pix_key || "58.392.598/0001-91",
          amount: pending,
          receiverName: event.pix_receiver_name || "TUCXA",
          receiverCity: "CAMPINAS",
          txid: current.id.replace(/[^a-zA-Z0-9]/g, "").slice(0, 25) || "TUCXA",
          description: `Fechamento ${current.responsibleName}`,
        })
      : "";

  return (
    <main className="min-h-screen bg-amber-50 text-green-950">
      <SiteHeader />
      <section className="mx-auto max-w-7xl px-5 py-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/gestao-evento"
            className="rounded-full bg-white px-5 py-3 text-sm font-black text-green-950 shadow-sm"
            prefetch={false}
          >
            ← Gestão do Evento
          </Link>
          <Link
            href="/gestao-evento/garcom"
            className="rounded-full bg-green-900 px-5 py-3 text-sm font-black text-white shadow-sm"
            prefetch={false}
          >
            Ir para Garçom/Atendimento
          </Link>
        </div>

        <div className="rounded-[2rem] border border-green-100 bg-white p-6 shadow-sm">
          <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-black text-green-900">
            Operação · Caixa
          </span>
          <h1 className="mt-4 text-3xl font-black">
            Fechamento por responsável
          </h1>
          <p className="mt-3 max-w-4xl text-stone-700">
            Busque o responsável, confira todos os pedidos agrupados e registre
            o pagamento consolidado. Caso seja necessário, abra os pedidos
            individuais para pagar separadamente.
          </p>
        </div>

        {params?.pago ? (
          <div className="mt-5 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm font-bold text-green-900">
            Pagamento registrado com sucesso.
          </div>
        ) : null}
        {params?.editado ? (
          <div className="mt-5 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm font-bold text-green-900">
            Pedido editado com sucesso. Confira o novo total antes de fechar.
          </div>
        ) : null}
        {params?.erro ? (
          <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-800">
            Não foi possível registrar o pagamento. Confira se há pendências
            para o responsável ou pedido.
          </div>
        ) : null}

        <section className="mt-8 rounded-[2rem] border border-green-100 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <ShoppingBag className="h-6 w-6 text-green-800" />
            <div>
              <h2 className="text-2xl font-black">Acompanhamento de vendas</h2>
              <p className="mt-1 text-sm text-stone-600">
                Resumo geral dos pedidos registrados no cardápio.
              </p>
            </div>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <div className="rounded-3xl bg-amber-50 p-5">
              <p className="text-sm font-bold text-stone-600">Total vendido</p>
              <p className="mt-2 text-3xl font-black">
                {formatCurrency(summary.soldTotal)}
              </p>
            </div>
            <div className="rounded-3xl bg-green-50 p-5">
              <p className="text-sm font-bold text-stone-600">Total pago</p>
              <p className="mt-2 text-3xl font-black">
                {formatCurrency(summary.paidTotal)}
              </p>
            </div>
            <div className="rounded-3xl bg-red-50 p-5">
              <p className="text-sm font-bold text-stone-600">Total pendente</p>
              <p className="mt-2 text-3xl font-black">
                {formatCurrency(summary.pendingTotal)}
              </p>
            </div>
          </div>
          <details className="mt-5 rounded-3xl border border-green-100 bg-stone-50 p-4">
            <summary className="cursor-pointer text-lg font-black">
              Detalhamento por item
            </summary>
            <div className="mt-4 overflow-x-auto rounded-2xl border border-stone-100 bg-white">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead className="bg-green-950 text-white">
                  <tr>
                    <th className="p-3">Item</th>
                    <th className="p-3">Qtd.</th>
                    <th className="p-3">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.itemDetails.map((item) => (
                    <tr
                      key={item.itemName}
                      className="border-b border-stone-100 last:border-0"
                    >
                      <td className="p-3 font-bold">{item.itemName}</td>
                      <td className="p-3">{item.quantity}</td>
                      <td className="p-3 font-black">
                        {formatCurrency(item.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        </section>

        <section className="mt-8 grid gap-5 lg:grid-cols-[360px_1fr]">
          <div className="rounded-[2rem] border border-green-100 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <Search className="h-5 w-5 text-green-800" />
              <h2 className="text-xl font-black">Responsáveis</h2>
            </div>
            <form className="mt-4 grid gap-2">
              <input
                name="q"
                defaultValue={params?.q ?? ""}
                className="rounded-full border border-green-100 bg-white px-4 py-3 text-sm"
                placeholder="Buscar por nome"
              />
              <select
                name="garcom"
                defaultValue={params?.garcom ?? ""}
                className="rounded-full border border-green-100 bg-white px-4 py-3 text-sm font-bold text-green-950"
              >
                <option value="">Todos os garçons</option>
                <option value="__sem_garcom">Sem garçom informado</option>
                {waiters.map((waiter) => (
                  <option key={waiter} value={waiter}>
                    {waiter}
                  </option>
                ))}
              </select>
              <button className="rounded-full bg-green-900 px-5 py-3 text-sm font-black text-white">
                Filtrar
              </button>
            </form>
            <div className="mt-5 divide-y divide-green-100 rounded-2xl border border-green-100 bg-white">
              {groupedRows.map((row) => {
                const rowPending = pendingFromOrders(row.orders);
                const rowIsPaid = row.orders.length > 0 && rowPending <= 0;
                return (
                  <Link
                    key={row.id}
                    href={`/gestao-evento/caixa${buildQuery({ responsavel: row.id, q: params?.q, garcom: params?.garcom })}#fechamento-responsavel`}
                    className={`block p-4 hover:bg-green-50 ${current?.id === row.id ? "bg-green-50" : ""}`}
                    prefetch={false}
                  >
                    <p className="font-black text-green-950">
                      {row.responsibleName}
                    </p>
                    <p className="mt-1 text-xs text-stone-600">
                      Garçom: {row.waiterName || "—"} · {row.orders.length}{" "}
                      pedido(s)
                    </p>
                    <p
                      className={`mt-1 text-sm font-black ${rowIsPaid ? "text-green-800" : "text-red-800"}`}
                    >
                      {rowIsPaid
                        ? "Pago / sem pendências"
                        : `Pendente: ${formatCurrency(rowPending)}`}
                    </p>
                    <p className="mt-2 inline-flex rounded-full bg-green-900 px-3 py-1 text-xs font-black text-white">
                      Ver fechamento
                    </p>
                  </Link>
                );
              })}
              {groupedRows.length === 0 ? (
                <p className="p-4 text-sm text-stone-600">
                  Nenhum responsável encontrado.
                </p>
              ) : null}
            </div>
          </div>

          <div
            id="fechamento-responsavel"
            className="scroll-mt-24 rounded-[2rem] border border-green-100 bg-white p-5 shadow-sm"
          >
            {current ? (
              <>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-black text-green-900">
                      Fechamento agrupado
                    </span>
                    <h2 className="mt-3 text-3xl font-black">
                      {current.responsibleName}
                    </h2>
                    <p className="mt-1 text-sm text-stone-600">
                      Garçom: {current.waiterName || "não informado"} · Pedidos:{" "}
                      {current.orders.length}
                    </p>
                  </div>
                  <div className="rounded-3xl bg-stone-50 p-5 text-left sm:text-right">
                    <p className="text-sm font-bold text-stone-600">
                      Total agrupado
                    </p>
                    <p className="text-3xl font-black">
                      {formatCurrency(currentTotal)}
                    </p>
                    <p
                      className={`text-sm font-black ${pending <= 0 ? "text-green-800" : "text-red-800"}`}
                    >
                      {pending <= 0
                        ? "Pago / sem pendências"
                        : `Pendente: ${formatCurrency(pending)}`}
                    </p>
                  </div>
                </div>

                {pending > 0 ? (
                  <div className="mt-5 rounded-3xl border border-green-100 bg-green-50 p-4">
                    <div className="flex items-center gap-2">
                      <QrCode className="h-5 w-5 text-green-800" />
                      <h3 className="text-xl font-black">
                        Pix para fechamento agrupado
                      </h3>
                    </div>
                    <p className="mt-1 text-sm text-stone-700">
                      Ao escanear, o aplicativo do banco deve preencher a chave
                      Pix do Tucxa e o valor total pendente de todos os pedidos
                      deste responsável.
                    </p>
                    <PixPaymentBox
                      pixCopyPaste={pixPayload}
                      amount={pending}
                      pixKey={event.pix_key || "58.392.598/0001-91"}
                      receiverName={event.pix_receiver_name || "TUCXA"}
                      title="Pix do fechamento"
                    />
                    <div className="mt-4 grid gap-2 sm:flex sm:flex-wrap">
                      {paymentMethodButton(
                        "pix",
                        "Pix",
                        current,
                        event.id,
                        pending,
                      )}
                      {paymentMethodButton(
                        "credit",
                        "Crédito",
                        current,
                        event.id,
                        pending,
                      )}
                      {paymentMethodButton(
                        "debit",
                        "Débito",
                        current,
                        event.id,
                        pending,
                      )}
                      {paymentMethodButton(
                        "cash",
                        "Dinheiro",
                        current,
                        event.id,
                        pending,
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="mt-5 rounded-3xl border border-green-100 bg-green-50 p-5 text-sm font-bold text-green-900">
                    Não há pendência de pagamento para este responsável.
                  </div>
                )}

                <div className="mt-6">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <h3 className="text-xl font-black">Pedidos individuais</h3>
                    <span className="text-xs font-bold text-stone-500">
                      Toque em um pedido para abrir/recolher
                    </span>
                  </div>
                  <div className="grid gap-3">
                    {current.orders.map((order) => {
                      const paid = isOrderPaid(order);
                      const orderPending = pendingAmountFromOrder(order);
                      const orderPixPayload =
                        orderPending > 0
                          ? buildPixCopyPastePayload({
                              pixKey: event.pix_key || "58.392.598/0001-91",
                              amount: orderPending,
                              receiverName: event.pix_receiver_name || "TUCXA",
                              receiverCity: "CAMPINAS",
                              txid:
                                order.id
                                  .replace(/[^a-zA-Z0-9]/g, "")
                                  .slice(0, 25) || "TUCXA",
                              description: `Pedido ${shortId(order.id)}`,
                            })
                          : "";
                      return (
                        <details
                          key={order.id}
                          className="rounded-3xl border border-green-100 bg-white p-4 open:bg-green-50/40"
                        >
                          <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-3">
                            <div>
                              <p className="text-sm font-black text-green-950">
                                Pedido {shortId(order.id)}
                              </p>
                              <p className="mt-1 text-xs text-stone-600">
                                {order.items
                                  .map(
                                    (item) =>
                                      `${Number(item.quantity)} ${item.item_name}`,
                                  )
                                  .join(" · ") || "Sem itens"}
                              </p>
                            </div>
                            <div className="flex items-center gap-3 text-right">
                              <div>
                                <p className="text-sm font-black">
                                  {formatCurrency(order.total_amount)}
                                </p>
                                <p
                                  className={`text-xs font-black ${paid ? "text-green-800" : "text-red-800"}`}
                                >
                                  {paid
                                    ? "Pago"
                                    : `Pendente ${formatCurrency(orderPending)}`}
                                </p>
                              </div>
                              <ChevronDown className="h-5 w-5 text-green-800" />
                            </div>
                          </summary>
                          <div className="mt-4 grid gap-3 border-t border-green-100 pt-4">
                            <div className="grid gap-2 md:grid-cols-2">
                              {order.items.map((item) => (
                                <div
                                  key={item.id}
                                  className="rounded-2xl bg-white p-3 text-sm shadow-sm"
                                >
                                  <strong>{item.item_name}</strong>
                                  <p className="text-stone-600">
                                    {Number(item.quantity)} ×{" "}
                                    {formatCurrency(item.unit_price)} ={" "}
                                    {formatCurrency(item.total_price)}
                                  </p>
                                </div>
                              ))}
                            </div>

                            {!paid ? (
                              <details className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                                <summary className="cursor-pointer text-sm font-black text-amber-950">
                                  Editar pedido: incluir, excluir ou trocar itens
                                </summary>
                                <form
                                  action={updateCashierOrderItems}
                                  className="mt-4 grid gap-4"
                                >
                                <input
                                  type="hidden"
                                  name="event_id"
                                  value={event.id}
                                />
                                <input
                                  type="hidden"
                                  name="order_id"
                                  value={order.id}
                                />
                                <input
                                  type="hidden"
                                  name="responsible_key"
                                  value={current.id}
                                />
                                <input
                                  type="hidden"
                                  name="existing_note"
                                  value={order.notes ?? ""}
                                />
                                  <p className="text-xs font-bold text-amber-950">
                                    Altere as quantidades abaixo. Para excluir um
                                    item, deixe quantidade 0. Para trocar, zere o
                                    item atual e informe quantidade no novo item.
                                    Esta opção fica disponível somente para pedidos
                                    ainda não pagos.
                                  </p>
                                <div className="grid max-h-[420px] gap-2 overflow-y-auto pr-1 md:grid-cols-2">
                                  {menuItems.map((menuItem) => (
                                    <label
                                      key={menuItem.id}
                                      className="grid grid-cols-[1fr_92px] items-center gap-3 rounded-2xl bg-white p-3 text-sm shadow-sm"
                                    >
                                      <span>
                                        <strong className="block text-green-950">
                                          {menuItem.name}
                                        </strong>
                                        <span className="text-xs text-stone-600">
                                          {menuItem.category || "Cardápio"} ·{" "}
                                          {formatCurrency(menuItem.price)}
                                        </span>
                                      </span>
                                      <input
                                        type="number"
                                        min="0"
                                        step="1"
                                        name={`qty_${menuItem.id}`}
                                        defaultValue={currentQuantityForMenuItem(
                                          order,
                                          menuItem,
                                        )}
                                        className="rounded-xl border border-amber-200 px-3 py-2 text-center font-black text-green-950"
                                      />
                                    </label>
                                  ))}
                                </div>
                                <label className="grid gap-1 text-sm font-bold text-green-950">
                                  Observação do ajuste
                                  <input
                                    name="edit_note"
                                    className="rounded-2xl border border-amber-200 px-4 py-3 text-sm"
                                    placeholder="Ex.: trocou Refrigerante por Água"
                                  />
                                </label>
                                <button className="rounded-full bg-amber-500 px-5 py-3 text-sm font-black text-amber-950 shadow-sm hover:bg-amber-400">
                                  Salvar alteração do pedido
                                </button>
                                </form>
                              </details>
                            ) : (
                              <p className="rounded-2xl border border-green-200 bg-green-50 p-3 text-sm font-bold text-green-900">
                                Pedido pago. Edição bloqueada para preservar a prestação de contas.
                              </p>
                            )}

                            {orderPending > 0 ? (
                              <div className="rounded-2xl border border-green-100 bg-green-50 p-4">
                                <p className="text-sm font-black text-green-950">
                                  Pagamento individual deste pedido
                                </p>
                                <PixPaymentBox
                                  pixCopyPaste={orderPixPayload}
                                  amount={orderPending}
                                  pixKey={event.pix_key || "58.392.598/0001-91"}
                                  receiverName={
                                    event.pix_receiver_name || "TUCXA"
                                  }
                                  title="Pix do pedido"
                                />
                                <div className="mt-3 grid gap-2 sm:flex sm:flex-wrap">
                                  {individualPaymentButton(
                                    "pix",
                                    "Pix",
                                    order,
                                    event.id,
                                    current.id,
                                  )}
                                  {individualPaymentButton(
                                    "credit",
                                    "Crédito",
                                    order,
                                    event.id,
                                    current.id,
                                  )}
                                  {individualPaymentButton(
                                    "debit",
                                    "Débito",
                                    order,
                                    event.id,
                                    current.id,
                                  )}
                                  {individualPaymentButton(
                                    "cash",
                                    "Dinheiro",
                                    order,
                                    event.id,
                                    current.id,
                                  )}
                                </div>
                              </div>
                            ) : (
                              <p className="rounded-2xl bg-green-100 p-3 text-sm font-bold text-green-900">
                                Pedido sem pendência de pagamento.
                              </p>
                            )}
                          </div>
                        </details>
                      );
                    })}
                  </div>
                </div>
              </>
            ) : (
              <p className="text-sm text-stone-600">
                Cadastre ou selecione um responsável para fechar a conta.
              </p>
            )}
          </div>
        </section>
      </section>
    </main>
  );
}

function buildQuery(params: Record<string, string | undefined>) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) query.set(key, value);
  }
  const queryString = query.toString();
  return queryString ? `?${queryString}` : "";
}
