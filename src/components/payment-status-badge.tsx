import clsx from "clsx";

export type PaymentStatus = "pending" | "proof_sent" | "paid" | "rejected" | "cancelled" | string | null | undefined;

const STATUS_LABELS: Record<string, string> = {
  pending: "Aguardando comprovante",
  proof_sent: "Comprovante enviado",
  paid: "Pago",
  rejected: "Reprovado",
  cancelled: "Cancelado",
};

export function getPaymentStatusLabel(status: PaymentStatus) {
  if (!status) return "Não informado";
  return STATUS_LABELS[status] ?? status;
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const normalized = status ?? "";

  return (
    <span
      className={clsx(
        "inline-flex rounded-full px-3 py-1 text-xs font-black",
        normalized === "paid" && "bg-green-100 text-green-900",
        normalized === "proof_sent" && "bg-amber-100 text-amber-900",
        normalized === "pending" && "bg-stone-100 text-stone-700",
        normalized === "rejected" && "bg-red-100 text-red-800",
        normalized === "cancelled" && "bg-zinc-200 text-zinc-700",
        !["paid", "proof_sent", "pending", "rejected", "cancelled"].includes(normalized) && "bg-stone-100 text-stone-700",
      )}
    >
      {getPaymentStatusLabel(status)}
    </span>
  );
}
