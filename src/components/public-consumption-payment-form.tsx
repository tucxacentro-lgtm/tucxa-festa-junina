"use client";

import { useState } from "react";
import { PixPaymentBox } from "@/components/pix-payment-box";
import { getPaymentInstruction, paymentMethodLabel } from "@/lib/pix";

type PaymentMethod = "pix" | "credit" | "debit" | "cash" | "manual";

type Props = {
  eventSlug: string;
  orderId: string;
  eventId: string;
  amount: number | string;
  pixCopyPaste: string;
  pixKey: string;
  pixReceiver: string;
  action: (eventSlug: string, formData: FormData) => void | Promise<void>;
};

const paymentMethods: Array<{ value: PaymentMethod; label: string }> = [
  { value: "pix", label: "Pix" },
  { value: "credit", label: "Cartão de crédito" },
  { value: "debit", label: "Cartão de débito" },
  { value: "cash", label: "Dinheiro" },
  { value: "manual", label: "Pagamento com responsável" },
];

export function PublicConsumptionPaymentForm({ eventSlug, orderId, eventId, amount, pixCopyPaste, pixKey, pixReceiver, action }: Props) {
  const [method, setMethod] = useState<PaymentMethod>("pix");
  const instruction = getPaymentInstruction({ method, pixCopyPaste: method === "pix" ? pixCopyPaste : null });

  return (
    <form action={action.bind(null, eventSlug)} className="mt-5 grid gap-3" encType="multipart/form-data">
      <input type="hidden" name="order_id" value={orderId} />
      <input type="hidden" name="event_id" value={eventId} />
      <input type="hidden" name="amount" value={String(amount)} />
      <label className="grid gap-1 text-sm font-bold">Forma de pagamento
        <select name="method" value={method} onChange={(event) => setMethod(event.target.value as PaymentMethod)} className="rounded-2xl border border-stone-200 p-3 font-normal">
          {paymentMethods.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
      </label>

      <div className={`rounded-3xl border p-4 ${method === "pix" ? "border-green-100 bg-green-50" : "border-amber-100 bg-amber-50"}`}>
        <p className="text-xs font-black uppercase tracking-wide text-green-900">{paymentMethodLabel(method)}</p>
        <h3 className="mt-1 text-xl font-black text-green-950">{instruction.title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-stone-700">{instruction.body}</p>
        <p className="mt-3 rounded-2xl bg-white p-3 text-sm text-stone-700">{instruction.helper}</p>
        {method === "pix" ? (
          <PixPaymentBox pixCopyPaste={pixCopyPaste} amount={amount} pixKey={pixKey} receiverName={pixReceiver} />
        ) : null}
      </div>

      <label className="grid gap-1 text-sm font-bold">Enviar comprovante/recibo
        <input name="proof_file" type="file" className="rounded-2xl border border-stone-200 p-3 font-normal" />
      </label>
      <textarea name="notes" className="min-h-20 rounded-2xl border border-stone-200 p-3" placeholder="Observação do pagamento, se necessário." />
      <button className="rounded-2xl bg-green-900 px-5 py-4 font-black text-white">Registrar comprovante</button>
    </form>
  );
}
