export type PixPayloadInput = {
  pixKey?: string | null;
  amount?: number | string | null;
  receiverName?: string | null;
  receiverCity?: string | null;
  txid?: string | null;
  description?: string | null;
};

export type PaymentInstructionInput = {
  method?: string | null;
  instructions?: string | null;
  pixCopyPaste?: string | null;
};

function onlyAscii(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\x20-\x7E]/g, "")
    .trim();
}

function limit(value: string, size: number) {
  return onlyAscii(value).slice(0, size);
}

function numericAmount(value: number | string | null | undefined) {
  const parsed = Number(String(value ?? 0).replace(",", "."));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

function field(id: string, value: string) {
  const size = String(value.length).padStart(2, "0");
  return `${id}${size}${value}`;
}

function crc16Ccitt(payload: string) {
  let crc = 0xffff;
  for (let index = 0; index < payload.length; index += 1) {
    crc ^= payload.charCodeAt(index) << 8;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
      crc &= 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

export function buildPixCopyPastePayload(input: PixPayloadInput) {
  const pixKey = input.pixKey?.trim() || "58.392.598/0001-91";
  const amount = numericAmount(input.amount);
  const receiverName = limit(input.receiverName || "TUCXA", 25) || "TUCXA";
  const receiverCity = limit(input.receiverCity || "CAMPINAS", 15) || "CAMPINAS";
  const txid = limit(input.txid || "TUCXA", 25).replace(/\s+/g, "") || "TUCXA";
  const description = limit(input.description || "", 60);

  const merchantAccountInfo = field("00", "br.gov.bcb.pix") + field("01", pixKey) + (description ? field("02", description) : "");
  const txidInfo = field("05", txid);

  const payloadWithoutCrc = [
    field("00", "01"),
    field("26", merchantAccountInfo),
    field("52", "0000"),
    field("53", "986"),
    amount > 0 ? field("54", amount.toFixed(2)) : "",
    field("58", "BR"),
    field("59", receiverName),
    field("60", receiverCity),
    field("62", txidInfo),
  ].join("") + "6304";

  return `${payloadWithoutCrc}${crc16Ccitt(payloadWithoutCrc)}`;
}

export function buildStaticPixPayload(pixKey: string | null | undefined, amount?: number | null) {
  return buildPixCopyPastePayload({ pixKey, amount, receiverName: "TUCXA", receiverCity: "CAMPINAS", txid: "TUCXA" });
}

function normalizePaymentMethod(method: string | null | undefined) {
  return method?.trim().toLowerCase() || "";
}

export function paymentMethodLabel(method: string | null | undefined) {
  const normalizedMethod = normalizePaymentMethod(method);
  const labels: Record<string, string> = {
    pix: "Pix",
    credit: "Cartão de crédito",
    debit: "Débito",
    cash: "Dinheiro",
    manual: "Pagamento com responsável",
    free: "Cortesia",
  };
  return labels[normalizedMethod] ?? method ?? "Pagamento";
}

function normalizePaymentInstructionText(value: string) {
  return value
    .replace(/equipe do caixa/gi, "equipe da coordenação")
    .replace(/presencialmente no caixa/gi, "presencialmente com a coordenação")
    .replace(/no caixa/gi, "com a coordenação");
}

function paymentBody(method: string | null | undefined, instructions: string | null | undefined, fallback: string) {
  const configured = instructions?.trim();
  if (!configured) return normalizePaymentInstructionText(fallback);
  const normalized = configured.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const looksLikePix = normalized.includes("pix") || normalized.includes("chave");
  if (method !== "pix" && looksLikePix) return normalizePaymentInstructionText(fallback);
  return normalizePaymentInstructionText(configured);
}

export function getPaymentInstruction({ method, instructions, pixCopyPaste }: PaymentInstructionInput) {
  const normalizedMethod = normalizePaymentMethod(method);

  if (normalizedMethod === "pix") {
    return {
      title: "Pagamento via Pix",
      subtitle: "Use o QR Code ou Pix Copia e Cola com o valor total já preenchido.",
      body:
        paymentBody(normalizedMethod, instructions, "Faça o pagamento via Pix pelo valor total informado, usando o QR Code ou Pix Copia e Cola. Depois anexe o comprovante na tela da compra/pedido para conferência da equipe."),
      helper: pixCopyPaste
        ? "O código Pix abaixo já inclui a chave do Tucxa e o valor total. Se o app do banco permitir alteração, não altere o valor antes de pagar."
        : "Confira o valor total antes de pagar e anexe o comprovante depois.",
    };
  }

  if (normalizedMethod === "credit") {
    return {
      title: "Pagamento com cartão de crédito",
      subtitle: "Pagamento presencial com a equipe da coordenação.",
      body:
        paymentBody(normalizedMethod, instructions, "O pagamento por cartão de crédito será realizado presencialmente com a equipe da coordenação. Apresente o código/QR Code da compra ou pedido e guarde o comprovante da maquininha até a confirmação pela equipe."),
      helper: "O status será atualizado pela equipe após conferência do pagamento.",
    };
  }

  if (normalizedMethod === "debit") {
    return {
      title: "Pagamento com débito",
      subtitle: "Pagamento presencial com a equipe da coordenação.",
      body:
        paymentBody(normalizedMethod, instructions, "O pagamento por débito será realizado presencialmente com a equipe da coordenação. Após aprovação na maquininha, a equipe confirmará o pagamento no sistema. Apresente o código/QR Code quando solicitado."),
      helper: "Guarde o comprovante até a confirmação pela equipe.",
    };
  }

  if (normalizedMethod === "cash") {
    return {
      title: "Pagamento em dinheiro",
      subtitle: "Pagamento presencial com a coordenação.",
      body:
        paymentBody(normalizedMethod, instructions, "O pagamento em dinheiro será realizado presencialmente com a coordenação. Se possível, leve o valor aproximado para facilitar o troco e agilizar o atendimento. Apresente o código/QR Code quando solicitado."),
      helper: "A equipe registrará a quitação no sistema após receber o valor.",
    };
  }

  if (normalizedMethod === "manual") {
    return {
      title: "Pagamento com responsável",
      subtitle: "Anexe o registro do pagamento combinado.",
      body:
        paymentBody(normalizedMethod, instructions, "Anexe uma foto do recibo do cartão, comprovante de pagamento em dinheiro ou outro registro autorizado. Nas observações, informe o nome e o celular de quem pagou e, se possível, o nome de quem recebeu o pagamento."),
      helper: "Use esta opção somente quando a coordenação orientar o pagamento com um responsável.",
    };
  }

  if (normalizedMethod === "free") {
    return {
      title: "Cortesia",
      subtitle: "Sem pagamento financeiro.",
      body: paymentBody(normalizedMethod, instructions, "Esta opção não exige pagamento. Siga as orientações da coordenação para registrar a cortesia."),
      helper: "A equipe poderá conferir a cortesia no dia do evento.",
    };
  }

  return {
    title: "Orientações de pagamento",
    subtitle: "Siga as orientações da coordenação.",
    body: paymentBody(normalizedMethod, instructions, "Confira o valor total, siga a forma de pagamento escolhida e anexe o comprovante/registro quando solicitado."),
    helper: "Guarde seu código/QR Code para acompanhamento em Minha compra.",
  };
}
