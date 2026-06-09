import { createSupabaseAdminClient } from "@/lib/supabaseServer";

export type VolunteerFunctionStatus = "suggested" | "confirmed" | "needs_people" | "inactive";

export type VolunteerFunction = {
  id: string;
  event_id: string;
  function_key: string;
  name: string;
  description: string | null;
  area: string | null;
  suggested_quantity: number;
  confirmed_quantity: number;
  shift_label: string | null;
  responsibilities: string | null;
  notes: string | null;
  status: VolunteerFunctionStatus;
  active: boolean;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
};

export const DEFAULT_VOLUNTEER_FUNCTIONS = [
  {
    function_key: "coordenacao_geral",
    name: "Coordenação geral",
    area: "Coordenação",
    suggested_quantity: 2,
    shift_label: "Antes e durante a festa",
    description: "Organiza decisões, responsáveis, prioridades, comunicação e resolução de dúvidas.",
    responsibilities: "Validar fluxo operacional; acompanhar vendas; alinhar voluntários; resolver exceções; apoiar prestação de contas.",
    sort_order: 10,
  },
  {
    function_key: "checkin_entrada",
    name: "Check-in/entrada",
    area: "Entrada",
    suggested_quantity: 2,
    shift_label: "Início do evento",
    description: "Confere convite, código ou QR Code na entrada e orienta participantes.",
    responsibilities: "Conferir convites; orientar sobre cardápio; direcionar mesas; acionar coordenação em divergências.",
    sort_order: 20,
  },
  {
    function_key: "caixa_pagamento",
    name: "Caixa/pagamento",
    area: "Caixa",
    suggested_quantity: 2,
    shift_label: "Durante a festa",
    description: "Confere pagamentos, comprovantes, Pix, cartão, dinheiro e fechamento.",
    responsibilities: "Registrar pagamento; conferir comprovantes; apoiar divisão de pagamento; controlar pendências e fechamento.",
    sort_order: 30,
  },
  {
    function_key: "atendimento_garcom",
    name: "Atendimento/garçom",
    area: "Atendimento",
    suggested_quantity: 4,
    shift_label: "Durante a festa",
    description: "Apoia convidados, registra ou confere pedidos e faz atendimento nas mesas.",
    responsibilities: "Orientar cardápio; lançar pedidos; acompanhar mesas; apoiar entrega quando necessário.",
    sort_order: 40,
  },
  {
    function_key: "cozinha_preparo",
    name: "Cozinha/preparo",
    area: "Cozinha",
    suggested_quantity: 4,
    shift_label: "Durante a festa",
    description: "Prepara comidas e bebidas que exigem produção ou montagem.",
    responsibilities: "Seguir ficha técnica; controlar estoque; sinalizar preparo/pronto quando usado; avisar falta de insumos.",
    sort_order: 50,
  },
  {
    function_key: "separacao_entrega",
    name: "Separação/entrega",
    area: "Entrega",
    suggested_quantity: 3,
    shift_label: "Durante a festa",
    description: "Separa pedidos prontos e organiza entrega ou retirada pelo cliente.",
    responsibilities: "Conferir pedido, nome e mesa; separar itens; confirmar entrega; apoiar TV de retirada quando usada.",
    sort_order: 60,
  },
  {
    function_key: "compras_armazenamento",
    name: "Compras/armazenamento",
    area: "Compras",
    suggested_quantity: 2,
    shift_label: "Antes da festa",
    description: "Organiza compras, recebimento, armazenamento e distribuição dos itens.",
    responsibilities: "Conferir lista de compras; cotar fornecedores; armazenar itens; separar insumos por área.",
    sort_order: 70,
  },
  {
    function_key: "apoio_limpeza",
    name: "Apoio/limpeza",
    area: "Apoio",
    suggested_quantity: 2,
    shift_label: "Durante e após a festa",
    description: "Apoia organização, limpeza, reposição, filas e necessidades emergenciais.",
    responsibilities: "Repor descartáveis; apoiar filas; manter áreas organizadas; acionar coordenação quando necessário.",
    sort_order: 80,
  },
];

export const VOLUNTEER_FUNCTION_STATUS_LABELS: Record<VolunteerFunctionStatus, string> = {
  suggested: "Sugerida",
  confirmed: "Confirmada",
  needs_people: "Precisa de pessoas",
  inactive: "Inativa",
};

export function buildFunctionKey(name: string) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 80) || `funcao_${Date.now()}`;
}

export async function getVolunteerFunctions(eventId: string) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("event_volunteer_functions")
    .select("*")
    .eq("event_id", eventId)
    .order("sort_order", { ascending: true });

  if (error) return [] as VolunteerFunction[];
  return (data ?? []) as VolunteerFunction[];
}

export async function getVolunteerCountsByRole(eventId: string) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.from("event_volunteers").select("role, active").eq("event_id", eventId).eq("active", true);

  if (error) return new Map<string, number>();

  return (data ?? []).reduce((acc, volunteer) => {
    const role = String(volunteer.role ?? "").toLowerCase();
    acc.set(role, (acc.get(role) ?? 0) + 1);
    return acc;
  }, new Map<string, number>());
}

export function countVolunteersForFunction(roleCounts: Map<string, number>, functionName: string, area?: string | null) {
  const normalizedName = functionName.toLowerCase();
  const normalizedArea = (area ?? "").toLowerCase();
  let total = 0;
  for (const [role, count] of roleCounts) {
    if (role.includes(normalizedName) || normalizedName.includes(role) || (normalizedArea && role.includes(normalizedArea))) total += count;
  }
  return total;
}

export type EventVolunteer = {
  id: string;
  event_id: string;
  name: string;
  whatsapp: string | null;
  email: string | null;
  role: string;
  availability: string | null;
  notes: string | null;
  active: boolean;
  created_at?: string;
  updated_at?: string;
};

export async function getEventVolunteers(eventId: string) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("event_volunteers")
    .select("*")
    .eq("event_id", eventId)
    .order("role", { ascending: true })
    .order("name", { ascending: true });

  if (error) return [] as EventVolunteer[];
  return (data ?? []) as EventVolunteer[];
}

export function volunteerMatchesFunction(volunteer: EventVolunteer, functionName: string, area?: string | null) {
  const role = volunteer.role.toLowerCase();
  const normalizedName = functionName.toLowerCase();
  const normalizedArea = (area ?? "").toLowerCase();
  return role.includes(normalizedName) || normalizedName.includes(role) || Boolean(normalizedArea && role.includes(normalizedArea));
}
