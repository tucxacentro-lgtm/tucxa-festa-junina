"use client";

import { useMemo, useState, useActionState } from "react";
import { createTicketOrder } from "@/actions";
import { PixPaymentBox } from "@/components/pix-payment-box";
import { formatCurrency } from "@/lib/format";
import { buildPixCopyPastePayload, getPaymentInstruction } from "@/lib/pix";
import type {
  Combo,
  EventConfig,
  PaymentOption,
  TicketType,
} from "@/types/festa-junina";

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

function clampQuantity(value: number, min: number) {
  if (!Number.isFinite(value)) return min;
  return Math.max(min, Math.floor(value));
}

function quantityFromText(value: string, min: number) {
  const parsed = Number.parseInt(value, 10);
  return clampQuantity(parsed, min);
}

type QuantityFieldProps = {
  label: string;
  name: string;
  value: number;
  min?: number;
  onChange: (value: number) => void;
};

function QuantityField({
  label,
  name,
  value,
  min = 0,
  onChange,
}: QuantityFieldProps) {
  const [draft, setDraft] = useState(String(value));

  function commit(nextDraft: string) {
    const normalized = quantityFromText(nextDraft, min);
    setDraft(String(normalized));
    onChange(normalized);
  }

  function changeBy(delta: number) {
    const nextValue = clampQuantity(value + delta, min);
    setDraft(String(nextValue));
    onChange(nextValue);
  }

  return (
    <div className="rounded-3xl border border-green-100 bg-white p-4 shadow-sm">
      <span className="text-sm font-black text-green-950">{label}</span>
      <input type="hidden" name={name} value={String(value)} />
      <div className="mt-3 grid grid-cols-[3rem_1fr_3rem] items-center gap-2">
        <button
          type="button"
          onClick={() => changeBy(-1)}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-stone-100 text-2xl font-black text-green-950 disabled:opacity-40"
          disabled={value <= min}
          aria-label={`Diminuir ${label}`}
        >
          −
        </button>
        <input
          inputMode="numeric"
          pattern="[0-9]*"
          value={draft}
          onFocus={(event) => event.currentTarget.select()}
          onChange={(event) => {
            const onlyNumbers = event.target.value.replace(/\D/g, "");
            setDraft(onlyNumbers);
            if (onlyNumbers !== "")
              onChange(quantityFromText(onlyNumbers, min));
          }}
          onBlur={() => commit(draft)}
          className="h-12 w-full rounded-2xl border border-stone-200 text-center text-xl font-black outline-none focus:border-green-700"
          aria-label={label}
        />
        <button
          type="button"
          onClick={() => changeBy(1)}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-green-900 text-2xl font-black text-white"
          aria-label={`Adicionar ${label}`}
        >
          +
        </button>
      </div>
    </div>
  );
}

export function TicketOrderForm({
  event,
  ticketTypes,
  combos,
  paymentOptions,
  initialReferralCode = "",
}: Props) {
  const [state, formAction, isPending] = useActionState(
    createTicketOrder,
    initialState,
  );
  const [purchaseType, setPurchaseType] = useState<"ticket" | "combo">(
    "ticket",
  );
  const [selectedTicketTypeId, setSelectedTicketTypeId] = useState(
    ticketTypes[0]?.id ?? "",
  );
  const [selectedComboId, setSelectedComboId] = useState(combos[0]?.id ?? "");
  const [adultsQuantity, setAdultsQuantity] = useState(1);
  const [comboQuantity, setComboQuantity] = useState(1);
  const [childrenQuantity, setChildrenQuantity] = useState(0);
  const [selectedPaymentOptionId, setSelectedPaymentOptionId] = useState(
    paymentOptions.find((option) => option.method?.toLowerCase() === "pix")
      ?.id ??
      paymentOptions[0]?.id ??
      "",
  );

  const selectedTicketType = ticketTypes.find(
    (ticket) => ticket.id === selectedTicketTypeId,
  );
  const selectedCombo = combos.find((combo) => combo.id === selectedComboId);
  const selectedPaymentOption = paymentOptions.find(
    (option) => option.id === selectedPaymentOptionId,
  );
  const isPixPayment = selectedPaymentOption?.method?.toLowerCase() === "pix";
  const pixKey = event.pix_key?.trim();
  const pixReceiverName = event.pix_receiver_name?.trim() || "Tucxa";

  const estimatedTotal = useMemo(() => {
    if (purchaseType === "combo") {
      return Number(selectedCombo?.price ?? 0) * Math.max(comboQuantity, 1);
    }

    if (selectedTicketType?.is_free) return 0;
    return Number(selectedTicketType?.price ?? 0) * Math.max(adultsQuantity, 1);
  }, [
    adultsQuantity,
    comboQuantity,
    purchaseType,
    selectedCombo,
    selectedTicketType,
  ]);

  const pixCopyPaste = useMemo(
    () =>
      buildPixCopyPastePayload({
        pixKey,
        amount: estimatedTotal,
        receiverName: pixReceiverName,
        receiverCity: "CAMPINAS",
        txid: "TUCXA2026",
        description: "Arraia Tucxa 2026",
      }),
    [estimatedTotal, pixKey, pixReceiverName],
  );

  const selectedPaymentInstruction = getPaymentInstruction({
    method: selectedPaymentOption?.method,
    instructions: selectedPaymentOption?.instructions,
    pixCopyPaste: isPixPayment ? pixCopyPaste : null,
  });

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
          <span className="text-sm font-black text-green-950">
            Nome completo
          </span>
          <input
            required
            name="buyer_name"
            className="mt-2 w-full rounded-2xl border border-stone-200 p-3 outline-none focus:border-green-700"
            placeholder="Seu nome"
          />
        </label>

        <label className="rounded-3xl border border-green-100 bg-white p-4 shadow-sm">
          <span className="text-sm font-black text-green-950">
            E-mail opcional
          </span>
          <input
            type="email"
            name="buyer_email"
            className="mt-2 w-full rounded-2xl border border-stone-200 p-3 outline-none focus:border-green-700"
            placeholder="voce@email.com"
          />
          <span className="mt-1 block text-xs text-stone-500">
            Informe se tiver. Sem e-mail, usaremos o WhatsApp como contato
            principal.
          </span>
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
        <p className="font-black text-green-950">
          O que você quer reservar/comprar?
        </p>
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
            <span className="mt-1 block text-sm font-medium opacity-80">
              Entrada para a festa
            </span>
          </button>

          {combos.length > 0 && event.allow_combos ? (
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
              <span className="mt-1 block text-sm font-medium opacity-80">
                Se a organização liberar combos neste evento
              </span>
            </button>
          ) : null}
        </div>
      </div>

      {purchaseType === "ticket" ? (
        <div className="grid gap-4 md:grid-cols-3">
          <label className="rounded-3xl border border-green-100 bg-white p-4 shadow-sm md:col-span-2">
            <span className="text-sm font-black text-green-950">
              Tipo de convite
            </span>
            <select
              required
              name="ticket_type_id"
              value={selectedTicketTypeId}
              onChange={(event) => setSelectedTicketTypeId(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-stone-200 p-3 outline-none focus:border-green-700"
            >
              {ticketTypes.map((ticket) => (
                <option key={ticket.id} value={ticket.id}>
                  {ticket.name} -{" "}
                  {ticket.is_free ? "Grátis" : formatCurrency(ticket.price)}
                </option>
              ))}
            </select>
          </label>

          <QuantityField
            label="Quantidade de adultos"
            name="adults_quantity"
            value={adultsQuantity}
            min={1}
            onChange={setAdultsQuantity}
          />
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

          <QuantityField
            label="Quantidade de combos"
            name="combo_quantity"
            value={comboQuantity}
            min={1}
            onChange={setComboQuantity}
          />
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <QuantityField
          label={`Crianças até ${event.children_free_age_limit} anos`}
          name="children_quantity"
          value={childrenQuantity}
          min={0}
          onChange={setChildrenQuantity}
        />

        <label className="rounded-3xl border border-green-100 bg-white p-4 shadow-sm">
          <span className="text-sm font-black text-green-950">
            Forma de pagamento
          </span>
          <select
            required
            name="payment_option_id"
            value={selectedPaymentOptionId}
            onChange={(event) => setSelectedPaymentOptionId(event.target.value)}
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
          <span className="text-sm font-black text-green-950">
            Código de indicação
          </span>
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
          <span className="text-sm font-black text-green-950">
            Horário estimado de chegada
          </span>
          <select
            name="expected_arrival"
            className="mt-2 w-full rounded-2xl border border-stone-200 p-3 outline-none focus:border-green-700"
          >
            <option value="">Ainda não sei</option>
            <option value="inicio">Logo no início</option>
            <option value="meio">No meio da festa</option>
            <option value="final">Mais para o final</option>
          </select>
        </label>

        <label className="rounded-3xl border border-green-100 bg-white p-4 shadow-sm">
          <span className="text-sm font-black text-green-950">
            Interesse em consumir no local
          </span>
          <select
            name="food_interest"
            className="mt-2 w-full rounded-2xl border border-stone-200 p-3 outline-none focus:border-green-700"
          >
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
        <p className="text-sm font-bold text-amber-200">
          Total estimado a pagar
        </p>
        <p className="text-4xl font-black">{formatCurrency(estimatedTotal)}</p>
        <p className="mt-2 text-sm text-white/75">
          Confira o valor acima antes de anexar o comprovante. Depois faça o
          pagamento conforme a opção escolhida e carregue o comprovante/registro
          abaixo.
        </p>
      </div>

      <div
        className={`rounded-3xl border p-5 shadow-sm ${isPixPayment ? "border-green-200 bg-green-50" : "border-amber-200 bg-amber-50"}`}
      >
        <p className="text-sm font-black uppercase tracking-wide text-green-900">
          {selectedPaymentInstruction.subtitle}
        </p>
        <h3 className="mt-1 text-2xl font-black text-green-950">
          {selectedPaymentInstruction.title}
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-stone-700">
          {selectedPaymentInstruction.body}
        </p>
        <p className="mt-3 rounded-2xl bg-white p-3 text-sm text-stone-700">
          {selectedPaymentInstruction.helper}
        </p>

        {isPixPayment && pixKey ? (
          <PixPaymentBox
            pixCopyPaste={pixCopyPaste}
            amount={estimatedTotal}
            pixKey={pixKey}
            receiverName={pixReceiverName}
          />
        ) : null}

        {isPixPayment && !pixKey ? (
          <div className="mt-4 rounded-2xl border border-amber-200 bg-white p-4 text-sm font-semibold text-amber-900">
            A chave Pix ainda não foi configurada pela organização. Escolha
            outra forma de pagamento ou fale com um responsável.
          </div>
        ) : null}
      </div>

      <label className="rounded-3xl border border-green-100 bg-white p-4 shadow-sm">
        <span className="text-sm font-black text-green-950">
          Comprovante/registro do pagamento
        </span>
        <input
          required
          type="file"
          name="proof_file"
          accept="image/*,.pdf"
          className="mt-2 w-full rounded-2xl border border-dashed border-stone-300 bg-stone-50 p-3 text-sm"
        />
        <span className="mt-2 block text-xs text-stone-500">
          Obrigatório para qualquer forma de pagamento. Pode ser comprovante
          Pix, recibo, comprovante da maquininha ou registro autorizado.
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
