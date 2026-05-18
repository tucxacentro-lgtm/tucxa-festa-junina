"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, ShoppingCart, RotateCcw, UserRound, Plus, Minus } from "lucide-react";
import { formatCurrency } from "@/lib/format";

export type PublicSalesMenuItem = {
  id: string;
  name: string;
  category: string;
  description: string | null;
  price: number | string;
  unit_label: string;
  requires_preparation: boolean;
};

type CustomerSession = {
  orderMode: string;
  customerName: string;
  customerPhone: string;
  tableLabel: string;
  waiterName: string;
  settlementMode: string;
};

type LastOrderDraft = {
  items: Record<string, number>;
  notes: string;
  createdAt: string;
  itemSummary: string;
};

type Props = {
  eventSlug: string;
  items: PublicSalesMenuItem[];
  defaultServiceSessionId?: string;
  defaultTableLabel?: string;
  defaultCustomerName?: string;
  defaultWaiterName?: string;
  defaultSettlementMode?: string;
  error?: string;
  action: (formData: FormData) => void | Promise<void>;
};

const SESSION_KEY_PREFIX = "tucxa_cardapio_cliente";
const LAST_ORDER_KEY_PREFIX = "tucxa_cardapio_ultimo_pedido";

function numberValue(value: number | string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalize(text: string) {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function getSessionKey(eventSlug: string) {
  return `${SESSION_KEY_PREFIX}:${eventSlug}`;
}

function getLastOrderKey(eventSlug: string) {
  return `${LAST_ORDER_KEY_PREFIX}:${eventSlug}`;
}

function totalFromQuantities(items: PublicSalesMenuItem[], quantities: Record<string, number>) {
  return items.reduce((sum, item) => sum + (quantities[item.id] ?? 0) * numberValue(item.price), 0);
}

function countFromQuantities(quantities: Record<string, number>) {
  return Object.values(quantities).reduce((sum, quantity) => sum + quantity, 0);
}

export function PublicSalesMenu({ eventSlug, items, defaultServiceSessionId = "", defaultTableLabel = "", defaultCustomerName = "", defaultWaiterName = "", defaultSettlementMode = "", error, action }: Props) {
  const categories = useMemo(() => Array.from(new Set(items.map((item) => item.category || "Outros"))), [items]);
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [search, setSearch] = useState("");
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [session, setSession] = useState<CustomerSession>({ orderMode: defaultTableLabel ? "table" : "individual", customerName: defaultCustomerName, customerPhone: "", tableLabel: defaultTableLabel, waiterName: defaultWaiterName, settlementMode: defaultSettlementMode || "por_pedido" });
  const [lastOrder, setLastOrder] = useState<LastOrderDraft | null>(null);
  const [notes, setNotes] = useState("");
  const [sessionLoaded, setSessionLoaded] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const savedSession = window.localStorage.getItem(getSessionKey(eventSlug));
        if (savedSession) {
          const parsed = JSON.parse(savedSession) as CustomerSession;
          setSession({
            orderMode: defaultTableLabel ? "table" : parsed.orderMode || "individual",
            customerName: defaultCustomerName || parsed.customerName || "",
            customerPhone: parsed.customerPhone || "",
            tableLabel: defaultTableLabel || parsed.tableLabel || "",
            waiterName: defaultWaiterName || parsed.waiterName || "",
            settlementMode: defaultSettlementMode || parsed.settlementMode || "por_pedido",
          });
        }
        const savedLastOrder = window.localStorage.getItem(getLastOrderKey(eventSlug));
        if (savedLastOrder) setLastOrder(JSON.parse(savedLastOrder) as LastOrderDraft);
      } catch {
        // Mantém os campos em branco se o navegador não permitir localStorage.
      } finally {
        setSessionLoaded(true);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, [eventSlug, defaultTableLabel, defaultCustomerName, defaultWaiterName, defaultSettlementMode]);

  const visibleItems = useMemo(() => {
    const query = normalize(search.trim());
    return items.filter((item) => {
      const matchesCategory = activeCategory === "Todos" || item.category === activeCategory;
      const searchable = normalize(`${item.name} ${item.description ?? ""} ${item.category}`);
      const matchesSearch = !query || searchable.includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [items, activeCategory, search]);

  const total = totalFromQuantities(items, quantities);
  const itemCount = countFromQuantities(quantities);
  const isWaiterFlow = Boolean(defaultServiceSessionId || defaultWaiterName || defaultCustomerName);

  function setQuantity(itemId: string, quantity: number) {
    setQuantities((current) => ({ ...current, [itemId]: Math.max(0, quantity) }));
  }

  function applyLastOrder() {
    if (!lastOrder) return;
    setQuantities(lastOrder.items);
    setNotes(lastOrder.notes || "");
  }

  function storeBeforeSubmit() {
    try {
      window.localStorage.setItem(getSessionKey(eventSlug), JSON.stringify(session));
      const selectedSummary = items
        .filter((item) => (quantities[item.id] ?? 0) > 0)
        .map((item) => `${quantities[item.id]} ${item.name}`)
        .join(", ");
      window.localStorage.setItem(
        getLastOrderKey(eventSlug),
        JSON.stringify({ items: quantities, notes, createdAt: new Date().toISOString(), itemSummary: selectedSummary } satisfies LastOrderDraft),
      );
    } catch {
      // O pedido segue normalmente mesmo sem salvar dados no navegador.
    }
  }

  return (
    <form action={action} onSubmit={storeBeforeSubmit} className="mt-5 rounded-[2rem] bg-white p-4 shadow-sm">
      <input type="hidden" name="service_session_id" value={defaultServiceSessionId} />
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-black">Novo pedido</h2>
          <p className="mt-1 text-sm text-stone-600">Selecione os itens solicitados. Quando aberto pelo garçom, o responsável já vem preenchido.</p>
        </div>
        {sessionLoaded && lastOrder ? (
          <button type="button" onClick={applyLastOrder} className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-2 text-sm font-black text-green-950">
            <RotateCcw className="h-4 w-4" /> Repetir último pedido
          </button>
        ) : null}
      </div>

      {error === "no-items" ? <div className="mt-4 rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-800">Selecione pelo menos um item para criar o pedido.</div> : null}

      {(session.waiterName || session.tableLabel || session.customerName) ? (
        <div className="mt-4 rounded-3xl border border-amber-100 bg-amber-50 p-4 text-sm text-stone-700">
          <p className="font-black text-green-950">Atendimento iniciado pelo garçom</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <label className="grid gap-1 font-bold">Garçom
              <input name="waiter_name" value={session.waiterName} onChange={(event) => setSession((current) => ({ ...current, waiterName: event.target.value }))} className="rounded-2xl border border-amber-100 bg-white p-3 font-normal" placeholder="Nome do garçom" />
            </label>
            <label className="grid gap-1 font-bold">Fechamento
              <select name="settlement_mode" value={session.settlementMode} onChange={(event) => setSession((current) => ({ ...current, settlementMode: event.target.value }))} className="rounded-2xl border border-amber-100 bg-white p-3 font-normal">
                <option value="por_pedido">Pedido a pedido</option>
                <option value="fechamento_final">Somente no final</option>
              </select>
            </label>
            <div className="rounded-2xl bg-white p-3">
              <p className="text-xs font-bold text-stone-500">Mesa/responsável</p>
              <p className="font-black text-green-950">{session.tableLabel || "Mesa não informada"} · {session.customerName || "Responsável a definir"}</p>
            </div>
          </div>
        </div>
      ) : (
        <>
          <input type="hidden" name="waiter_name" value={session.waiterName} />
          <input type="hidden" name="settlement_mode" value={session.settlementMode} />
        </>
      )}

      {isWaiterFlow ? (
        <div className="mt-4 rounded-3xl border border-green-100 bg-green-50 p-4 text-sm text-green-950">
          <input type="hidden" name="order_mode" value="group" />
          <input type="hidden" name="customer_name" value={session.customerName} />
          <input type="hidden" name="customer_phone" value={session.customerPhone} />
          <input type="hidden" name="table_label" value={session.tableLabel || session.customerName} />
          <p className="font-black">Pedido para {session.customerName || "responsável"}</p>
          <p className="mt-1 text-stone-700">Garçom: {session.waiterName || "não informado"} · Fechamento no caixa ao final.</p>
        </div>
      ) : (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1 text-sm font-bold">Tipo
            <select name="order_mode" value={session.orderMode} onChange={(event) => setSession((current) => ({ ...current, orderMode: event.target.value }))} className="rounded-2xl border border-stone-200 p-3 font-normal">
              <option value="individual">Individual</option>
              <option value="group">Grupo/família</option>
              <option value="table">Mesa</option>
            </select>
          </label>
          <label className="grid gap-1 text-sm font-bold">Nome/responsável
            <input required name="customer_name" value={session.customerName} onChange={(event) => setSession((current) => ({ ...current, customerName: event.target.value }))} className="rounded-2xl border border-stone-200 p-3 font-normal" placeholder="Seu nome" />
          </label>
          <label className="grid gap-1 text-sm font-bold">WhatsApp
            <input name="customer_phone" value={session.customerPhone} onChange={(event) => setSession((current) => ({ ...current, customerPhone: event.target.value }))} className="rounded-2xl border border-stone-200 p-3 font-normal" placeholder="Opcional" />
          </label>
          <label className="grid gap-1 text-sm font-bold">Mesa/grupo
            <input name="table_label" value={session.tableLabel} onChange={(event) => setSession((current) => ({ ...current, tableLabel: event.target.value }))} className="rounded-2xl border border-stone-200 p-3 font-normal" placeholder="Ex.: Mesa 4" />
          </label>
        </div>
      )}

      <div className="sticky top-2 z-20 mt-5 rounded-[1.5rem] border border-amber-100 bg-white/95 p-3 shadow-sm backdrop-blur">
        <div className="flex items-center gap-2 rounded-2xl border border-stone-200 bg-stone-50 px-3 py-2">
          <Search className="h-4 w-4 text-stone-500" />
          <input value={search} onChange={(event) => setSearch(event.target.value)} className="min-w-0 flex-1 bg-transparent text-sm outline-none" placeholder="Buscar cachorro-quente, batata, cerveja..." />
        </div>
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {["Todos", ...categories].map((category) => (
            <button key={category} type="button" onClick={() => setActiveCategory(category)} className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-black ${activeCategory === category ? "bg-green-900 text-white" : "bg-amber-50 text-green-950"}`}>
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 grid gap-5">
        {categories.map((category) => {
          const categoryItems = visibleItems.filter((item) => item.category === category);
          if (categoryItems.length === 0) return null;
          return (
            <section key={category} id={`categoria-${category}`} className="scroll-mt-40 rounded-3xl bg-stone-50 p-3">
              <h3 className="px-1 text-lg font-black">{category}</h3>
              <div className="mt-3 grid gap-3">
                {categoryItems.map((item) => {
                  const quantity = quantities[item.id] ?? 0;
                  return (
                    <div key={item.id} className="rounded-2xl bg-white p-4 shadow-sm">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-black">{item.name}</p>
                          {item.description ? <p className="mt-1 text-xs text-stone-500">{item.description}</p> : null}
                          <p className="mt-2 font-black text-green-800">{formatCurrency(item.price)} / {item.unit_label}</p>
                        </div>
                        {item.requires_preparation ? <span className="rounded-full bg-amber-50 px-2 py-1 text-[0.65rem] font-black text-amber-900">preparo</span> : null}
                      </div>
                      <input type="hidden" name={`qty_${item.id}`} value={String(quantity)} />
                      <div className="mt-4 flex items-center justify-between gap-3">
                        <button type="button" onClick={() => setQuantity(item.id, quantity - 1)} className="flex h-12 w-12 items-center justify-center rounded-full bg-stone-100 text-green-950" aria-label={`Diminuir ${item.name}`}><Minus className="h-5 w-5" /></button>
                        <span className="min-w-12 text-center text-2xl font-black">{quantity}</span>
                        <button type="button" onClick={() => setQuantity(item.id, quantity + 1)} className="flex h-12 w-12 items-center justify-center rounded-full bg-green-900 text-white" aria-label={`Adicionar ${item.name}`}><Plus className="h-5 w-5" /></button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
        {visibleItems.length === 0 ? <div className="rounded-3xl bg-amber-50 p-5 text-sm font-bold text-amber-900">Nenhum item encontrado para a busca atual.</div> : null}
      </div>

      <label className="mt-4 grid gap-1 text-sm font-bold">Observações
        <textarea name="notes" value={notes} onChange={(event) => setNotes(event.target.value)} className="min-h-20 rounded-2xl border border-stone-200 p-3 font-normal" placeholder="Ex.: sem cebola, entregar na mesa, retirar no balcão..." />
      </label>

      <div className="sticky bottom-3 z-20 mt-5 rounded-[1.5rem] border border-green-100 bg-white p-4 shadow-2xl">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold text-stone-500">Resumo</p>
            <p className="text-lg font-black"><ShoppingCart className="mr-1 inline h-4 w-4" />{itemCount} item(ns) · {formatCurrency(total)}</p>
          </div>
          <button className="rounded-2xl bg-green-900 px-5 py-3 text-sm font-black text-white">Criar pedido</button>
        </div>
        <p className="mt-2 flex items-center gap-1 text-xs text-stone-500"><UserRound className="h-3 w-3" /> Pedido registrado para conferência do garçom/caixa.</p>
      </div>
    </form>
  );
}
