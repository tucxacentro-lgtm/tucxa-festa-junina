export function formatCurrency(value: number | string | null | undefined) {
  const numericValue = Number(value ?? 0);

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number.isFinite(numericValue) ? numericValue : 0);
}

export function formatDate(date: string | null | undefined) {
  if (!date) return "Data a confirmar";

  return new Date(`${date}T12:00:00`).toLocaleDateString("pt-BR");
}

export function formatTime(time: string | null | undefined) {
  if (!time) return "";
  return String(time).slice(0, 5);
}
