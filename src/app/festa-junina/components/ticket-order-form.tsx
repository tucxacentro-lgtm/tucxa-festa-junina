"use client";

import { useMemo, useState, useActionState } from "react";
import { createTicketOrder } from "../actions";
import { formatCurrency } from "@/lib/format";
import type { Combo, EventConfig, PaymentOption, TicketType } from "@/types/festa-junina";

type Props = {
  event: EventConfig;
  ticketTypes: TicketType[];
  combos: Combo[];
  paymentOptions: PaymentOption[];
  initialReferralCode?: string;
};

const initialState = {
  ok: true,
  message: "",
};

export function TicketOrderForm({
  event,
  ticketTypes,
  combos,
  paymentOptions,
  initialReferralCode = "",
}: Props) {
  const [state, formAction, isPending] = useActionState(createTicketOrder, initialState);
  const [purchaseType, setPurchaseType] = useState<"ticket" | "combo">("ticket");
  const [selectedTicketTypeId, setSelectedTicketTypeId] = useState(ticketTypes[0]?.id ?? "");
  const [selectedComboId, setSelectedComboId] = useState(combos[0]?.id ?? "");
  const [adultsQuantity, setAdultsQuantity] = useState(1);
  const [comboQuantity, setComboQuantity] = useState(1);

  const selectedTicketType = ticketTypes.find((ticket) => ticket.id === selectedTicketTypeId);
  const selectedCombo = combos.find((combo) => combo.id === selectedComboId);

  const estimatedTotal = useMemo(() => {
    if (purchaseType === "combo") {
      return Number(selectedCombo?.price ?? 0) * Math.max(comboQuantity, 1);
    }

    if (selectedTicketType?.is_free) return 0;
    return Number(selectedTicketType?.price ?? 0) * Math.max(adultsQuantity, 1);
  }, [adultsQuantity, comboQuantity, purchaseType, selectedCombo, selectedTicketType]);

  return (
    <form action={formAction} className="mt-6 grid gap-5">
      <input type="hidden" name="event_id" value={event.id} />
      <input type="hidden" name="purchase_type" value={purchaseType} />

      {!state.ok ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          {state.message}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-3">
        <label className="rounded-3xl border border-green-100 bg-white p-4 shadow-sm">
          <span className="text-sm font-black text-green-950">Nome completo</span>
          <input
            required
            name="buyer_name"
            className="mt-2 w-full rounded-2xl border border-stone-200 p-3 outline-none focus:border-green-700"
            placeholder="Seu nome"
          />
        </label>

        <label className="rounded-3xl border border-green-100 bg-white p-4 shadow-sm">
          <span className="text-sm font-black text-green-950">E-mail</span>
          <input
            required
            type="email"
            name="buyer_email"
            className="mt-2 w-full rounded-2xl border border-stone-200 p-3 outline-none focus:border-green-700"
            placeholder="voce@email.com"
          />
          <span className="mt-1 block text-xs text-stone-500">Será o principal canal de comunicação.</span>
        </label>

        <label className="rounded-3xl border border-green-100 bg-white p-4 shadow-sm">
          <span className="text-sm font-black text-green-950">WhatsApp</span>
          <input
            required
            name="buyer_whatsapp"
            className="mt-2 w-full rounded-2xl border border-stone-200 p-3 outline-none focus:border-green-700"
            placeholder="(19) 99999-9999"
          />
        </label>
      </div>

      <div className="rounded-3xl border border-amber-200 bg-amber-50 p-4">
        <p className="font-black text-green-950">O que você quer reservar/comprar?</p>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <button
            type="button"
            onClick={() => setPurchaseType("ticket")}
            className={`rounded-2xl border p-4 text-left font-bold transition ${
              purchaseType === "ticket"
                ? "border-green-900 bg-green-900 text-white"
                : "border-stone-200 bg-white text-green-950"
            }`}
          >
            Convite simples
            <span className="mt-1 block text-sm font-medium opacity-80">Entrada para a festa</span>
          </button>

          <button
            type="button"
            onClick={() => setPurchaseType("combo")}
            className={`rounded-2xl border p-4 text-left font-bold transition ${
              purchaseType === "combo"
                ? "border-green-900 bg-green-900 text-white"
                : "border-stone-200 bg-white text-green-950"
            }`}
          >
            Combo configurável
            <span className="mt-1 block text-sm font-medium opacity-80">Pode incluir comida, bebida e bingo</span>
          </button>
        </div>
      </div>

      {purchaseType === "ticket" ? (
        <div className="grid gap-4 md:grid-cols-3">
          <label className="rounded-3xl border border-green-100 bg-white p-4 shadow-sm md:col-span-2">
            <span className="text-sm font-black text-green-950">Tipo de convite</span>
            <select
              required
              name="ticket_type_id"
              value={selectedTicketTypeId}
              onChange={(event) => setSelectedTicketTypeId(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-stone-200 p-3 outline-none focus:border-green-700"
            >
              {ticketTypes.map((ticket) => (
                <option key={ticket.id} value={ticket.id}>
                  {ticket.name} - {ticket.is_free ? "Grátis" : formatCurrency(ticket.price)}
                </option>
              ))}
            </select>
          </label>

          <label className="rounded-3xl border border-green-100 bg-white p-4 shadow-sm">
            <span className="text-sm font-black text-green-950">Quantidade de adultos</span>
            <input
              required
              min={1}
              type="number"
              name="adults_quantity"
              value={adultsQuantity}
              onChange={(event) => setAdultsQuantity(Number(event.target.value))}
              className="mt-2 w-full rounded-2xl border border-stone-200 p-3 outline-none focus:border-green-700"
            />
          </label>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          <label className="rounded-3xl border border-green-100 bg-white p-4 shadow-sm md:col-span-2">
            <span className="text-sm font-black text-green-950">Combo</span>
            <select
              required
              name="combo_id"
              value={selectedComboId}
              onChange={(event) => setSelectedComboId(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-stone-200 p-3 outline-none focus:border-green-700"
            >
              {combos.map((combo) => (
                <option key={combo.id} value={combo.id}>
                  {combo.name} - {formatCurrency(combo.price)}
                  {combo.includes_bingo ? " - inclui bingo" : ""}
                </option>
              ))}
            </select>
          </label>

          <label className="rounded-3xl border border-green-100 bg-white p-4 shadow-sm">
            <span className="text-sm font-black text-green-950">Quantidade de combos</span>
            <input
              required
              min={1}
              type="number"
              name="combo_quantity"
              value={comboQuantity}
              onChange={(event) => setComboQuantity(Number(event.target.value))}
              className="mt-2 w-full rounded-2xl border border-stone-200 p-3 outline-none focus:border-green-700"
            />
          </label>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <label className="rounded-3xl border border-green-100 bg-white p-4 shadow-sm">
          <span className="text-sm font-black text-green-950">Crianças até {event.children_free_age_limit} anos</span>
          <input
            min={0}
            type="number"
            name="children_quantity"
            defaultValue={0}
            className="mt-2 w-full rounded-2xl border border-stone-200 p-3 outline-none focus:border-green-700"
          />
        </label>

        <label className="rounded-3xl border border-green-100 bg-white p-4 shadow-sm">
          <span className="text-sm font-black text-green-950">Forma de pagamento</span>
          <select
            required
            name="payment_option_id"
            className="mt-2 w-full rounded-2xl border border-stone-200 p-3 outline-none focus:border-green-700"
          >
            <option value="">Escolha</option>
            {paymentOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>
        </label>

        <label className="rounded-3xl border border-green-100 bg-white p-4 shadow-sm">
          <span className="text-sm font-black text-green-950">Código de indicação</span>
          <input
            name="referred_by_code"
            defaultValue={initialReferralCode}
            className="mt-2 w-full rounded-2xl border border-stone-200 p-3 outline-none focus:border-green-700"
            placeholder="Opcional"
          />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="rounded-3xl border border-green-100 bg-white p-4 shadow-sm">
          <span className="text-sm font-black text-green-950">Horário estimado de chegada</span>
          <select name="expected_arrival" className="mt-2 w-full rounded-2xl border border-stone-200 p-3 outline-none focus:border-green-700">
            <option value="">Ainda não sei</option>
            <option value="inicio">Logo no início</option>
            <option value="meio">No meio da festa</option>
            <option value="final">Mais para o final</option>
          </select>
        </label>

        <label className="rounded-3xl border border-green-100 bg-white p-4 shadow-sm">
          <span className="text-sm font-black text-green-950">Interesse em consumir no local</span>
          <select name="food_interest" className="mt-2 w-full rounded-2xl border border-stone-200 p-3 outline-none focus:border-green-700">
            <option value="sim">Sim, pretendo consumir comidas/bebidas</option>
            <option value="talvez">Talvez</option>
            <option value="nao">Não pretendo</option>
          </select>
        </label>
      </div>

      <label className="rounded-3xl border border-green-100 bg-white p-4 shadow-sm">
        <span className="text-sm font-black text-green-950">Observações</span>
        <textarea
          name="notes"
          className="mt-2 min-h-28 w-full rounded-2xl border border-stone-200 p-3 outline-none focus:border-green-700"
          placeholder="Ex.: nome de quem vendeu, combinação feita, observação sobre crianças, etc."
        />
      </label>

      <div className="rounded-3xl bg-green-950 p-5 text-white shadow-lg">
        <p className="text-sm font-bold text-amber-200">Total estimado a pagar</p>
        <p className="text-4xl font-black">{formatCurrency(estimatedTotal)}</p>
        <p className="mt-2 text-sm text-white/75">
          Confira o valor acima antes de anexar o comprovante. Depois faça o pagamento conforme a opção escolhida e carregue o comprovante/registro abaixo.
        </p>
      </div>

      <label className="rounded-3xl border border-green-100 bg-white p-4 shadow-sm">
        <span className="text-sm font-black text-green-950">Comprovante/registro do pagamento</span>
        <input
          required
          type="file"
          name="proof_file"
          accept="image/*,.pdf"
          className="mt-2 w-full rounded-2xl border border-dashed border-stone-300 bg-stone-50 p-3 text-sm"
        />
        <span className="mt-2 block text-xs text-stone-500">
          Obrigatório para qualquer forma de pagamento. Pode ser comprovante Pix, recibo, comprovante da maquininha ou registro autorizado.
        </span>
      </label>

      <div className="rounded-3xl bg-white p-4 shadow-sm">
        <button
          disabled={isPending}
          className="w-full rounded-2xl bg-amber-300 px-6 py-4 font-black text-green-950 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Registrando..." : "Registrar compra e comprovante"}
        </button>
      </div>
    </form>
  );
}
