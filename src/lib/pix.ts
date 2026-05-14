export function buildStaticPixPayload(pixKey: string | null | undefined, amount?: number | null) {
  const key = pixKey?.trim() || "58.392.598/0001-91";
  if (amount && amount > 0) return `${key} | Valor: ${amount.toFixed(2).replace(".", ",")}`;
  return key;
}
