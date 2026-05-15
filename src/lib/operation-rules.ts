import { createSupabaseAdminClient } from "@/lib/supabaseServer";
import type { EventConfig } from "@/types/festa-junina";

export type OperationSettings = {
  event_id: string;
  sales_source_mode: string;
  invite_manual_upload_enabled: boolean;
  menu_access_mode: string;
  table_assignment_mode: string;
  order_entry_mode: string;
  paper_ticket_enabled: boolean;
  kitchen_start_required: boolean;
  kitchen_finish_required: boolean;
  separation_required: boolean;
  delivery_mode: string;
  delivery_confirmation_mode: string;
  payment_mode: string;
  split_payment_enabled: boolean;
  proof_upload_required: boolean;
  proof_upload_actor: string;
  tv_pickup_enabled: boolean;
  notes: string | null;
  created_at?: string;
  updated_at?: string;
};

export const OPERATION_DEFAULTS: Omit<OperationSettings, "event_id"> = {
  sales_source_mode: "mixed",
  invite_manual_upload_enabled: true,
  menu_access_mode: "event_and_table_qr",
  table_assignment_mode: "optional",
  order_entry_mode: "waiter_and_guest",
  paper_ticket_enabled: true,
  kitchen_start_required: false,
  kitchen_finish_required: true,
  separation_required: true,
  delivery_mode: "waiter_or_pickup",
  delivery_confirmation_mode: "optional_any_actor",
  payment_mode: "per_order_or_closing",
  split_payment_enabled: true,
  proof_upload_required: true,
  proof_upload_actor: "client_waiter_cashier",
  tv_pickup_enabled: true,
  notes: "Configuração inicial flexível: a coordenação pode usar venda pelo sistema, venda manual, planilha, pedidos por garçom, comanda em papel e fechamento por pedido ou por mesa/responsável.",
};

export const OPERATION_LABELS = {
  sales_source_mode: {
    system_only: "Somente vendas registradas no sistema",
    manual_only: "Somente quantidade manual/planilha",
    mixed: "Misto: sistema + manual + planilha",
  },
  menu_access_mode: {
    event_qr: "QR Code único do evento",
    table_qr: "QR Code por mesa",
    guest_qr: "QR Code por convidado/responsável",
    event_and_table_qr: "QR Code do evento + QR Code por mesa",
  },
  table_assignment_mode: {
    none: "Não associar convidados a mesas",
    optional: "Associação opcional de convidados às mesas",
    required_for_orders: "Obrigatório associar mesa para registrar pedidos",
  },
  order_entry_mode: {
    guest_only: "Somente convidados fazem pedidos",
    waiter_only: "Somente garçons/atendimento fazem pedidos",
    cashier_only: "Somente caixa/coordenação faz pedidos",
    waiter_and_guest: "Garçons e convidados podem fazer pedidos",
    all_modes: "Todos os modos permitidos",
  },
  delivery_mode: {
    waiter: "Entrega por garçom",
    pickup: "Retirada pelo convidado",
    waiter_or_pickup: "Garçom ou retirada pelo convidado",
    by_item_type: "Definir por tipo de item/pedido",
  },
  delivery_confirmation_mode: {
    none: "Não confirmar entrega no sistema",
    requester: "Solicitante confirma",
    waiter: "Garçom confirma",
    separation: "Separação confirma",
    optional_any_actor: "Opcional: solicitante, garçom, separação ou caixa",
  },
  payment_mode: {
    per_order: "Pagamento a cada pedido",
    closing_by_table: "Fechamento final por mesa",
    closing_by_responsible: "Fechamento final por responsável",
    per_order_or_closing: "Permitir pedido avulso ou fechamento final",
  },
  proof_upload_actor: {
    client: "Cliente/convidado",
    waiter: "Garçom",
    cashier: "Caixa",
    client_waiter_cashier: "Cliente, garçom ou caixa",
    not_required: "Não exigir comprovante",
  },
} as const;

export function buildDefaultOperationSettings(event: Pick<EventConfig, "id">): OperationSettings {
  return {
    event_id: event.id,
    ...OPERATION_DEFAULTS,
  };
}

export async function getOperationSettings(event: Pick<EventConfig, "id">): Promise<OperationSettings> {
  const fallback = buildDefaultOperationSettings(event);
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("event_operation_settings")
    .select("*")
    .eq("event_id", event.id)
    .maybeSingle();

  if (error || !data) return fallback;

  return {
    ...fallback,
    ...(data as Partial<OperationSettings>),
    event_id: event.id,
  };
}

export function optionLabel(group: keyof typeof OPERATION_LABELS, value: string) {
  const labels = OPERATION_LABELS[group] as Record<string, string>;
  return labels[value] ?? value;
}
