import { createSupabaseAdminClient } from "@/lib/supabaseServer";

export type AdminMenuStatus = "not_used" | "suggested" | "configuring" | "in_use" | "done";

export type AdminMenuCatalogItem = {
  id?: string;
  item_key: string;
  label: string;
  description: string | null;
  section: string;
  parent_key: string | null;
  route_path: string | null;
  icon_key: string | null;
  sort_order: number;
  default_enabled: boolean;
  implemented: boolean;
  active: boolean;
  not_implemented_message: string | null;
};

export type EventMenuConfig = {
  id?: string;
  event_id: string;
  menu_item_id?: string | null;
  item_key?: string | null;
  enabled: boolean;
  status: AdminMenuStatus;
  custom_label: string | null;
  sort_order: number | null;
  notes: string | null;
  responsible_name: string | null;
};

export type AdminSidebarItem = {
  key: string;
  href?: string;
  label: string;
  depth: number;
  enabled: boolean;
  status?: AdminMenuStatus;
  hint?: string;
  implemented: boolean;
  isHeading?: boolean;
};

export type AdminSidebarSection = {
  title: string;
  defaultOpen: boolean;
  locked?: boolean;
  items: AdminSidebarItem[];
};

export const MENU_STATUS_LABELS: Record<AdminMenuStatus, string> = {
  not_used: "Não usado neste evento",
  suggested: "Sugestão",
  configuring: "Em configuração",
  in_use: "Em uso",
  done: "Concluído",
};

export const MENU_STATUS_OPTIONS: Array<{ value: AdminMenuStatus; label: string }> = Object.entries(MENU_STATUS_LABELS).map(([value, label]) => ({
  value: value as AdminMenuStatus,
  label,
}));

export const DEFAULT_ADMIN_MENU_ITEMS: AdminMenuCatalogItem[] = [
  {
    item_key: "eventos",
    label: "Eventos",
    description: "Lista de edições da Festa Junina. Abra o evento que será operado.",
    section: "Geral",
    parent_key: null,
    route_path: "/admin/festa-junina/eventos",
    icon_key: "calendar",
    sort_order: 10,
    default_enabled: true,
    implemented: true,
    active: true,
    not_implemented_message: null,
  },
  {
    item_key: "novo_evento",
    label: "Novo evento",
    description: "Cadastro de uma nova edição anual da Festa Junina.",
    section: "Geral",
    parent_key: null,
    route_path: "/admin/festa-junina/eventos/novo",
    icon_key: "plus",
    sort_order: 20,
    default_enabled: true,
    implemented: true,
    active: true,
    not_implemented_message: null,
  },
  {
    item_key: "menu_configuravel",
    label: "Cadastro do menu",
    description: "Configura a hierarquia, sequência e páginas associadas ao menu lateral.",
    section: "Geral",
    parent_key: null,
    route_path: "/admin/festa-junina/menu",
    icon_key: "menu",
    sort_order: 30,
    default_enabled: true,
    implemented: true,
    active: true,
    not_implemented_message: null,
  },
  {
    item_key: "manuais_ajuda",
    label: "Manuais e ajuda",
    description: "Manual de uso do sistema e ajuda contextual por tela.",
    section: "Geral",
    parent_key: null,
    route_path: "/admin/festa-junina/ajuda",
    icon_key: "help",
    sort_order: 40,
    default_enabled: true,
    implemented: true,
    active: true,
    not_implemented_message: null,
  },
  {
    item_key: "painel_evento",
    label: "Painel do evento",
    description: "Resumo do evento aberto e próximos passos.",
    section: "Evento selecionado",
    parent_key: null,
    route_path: "/admin/festa-junina",
    icon_key: "home",
    sort_order: 100,
    default_enabled: true,
    implemented: true,
    active: true,
    not_implemented_message: null,
  },
  sectionHeader("vendas", "Vendas", "Evento selecionado", 200),
  item("vendas_convites", "Convites", "Evento selecionado", "vendas", "/admin/festa-junina/convites", 210, "Tipos de ingresso, valores e regras de venda."),
  item("vendas_acesso", "Acesso ao evento", "Evento selecionado", "vendas", "/admin/festa-junina/acesso", 220, "Orientações para acesso/check-in e uso do código/QR Code."),
  sectionHeader("vendas_conveniencias", "Conveniências", "Evento selecionado", 230, "vendas"),
  item("vendas_individuais_combos", "Individuais/Combos", "Evento selecionado", "vendas_conveniencias", "/admin/festa-junina/combos", 231, "Configuração de compras individuais, combos e ofertas quando disponíveis."),
  item("vendas_indicacoes", "Programa indicações", "Evento selecionado", "vendas_conveniencias", "/admin/festa-junina/indicacoes", 232, "Regras de indicação e brindes."),
  item("vendas_upsell", "Upsell", "Evento selecionado", "vendas_conveniencias", "/admin/festa-junina/upsell", 233, "Mensagens e ofertas complementares."),
  item("vendas_pagamentos", "Pagamentos/Confirmações", "Evento selecionado", "vendas", "/admin/festa-junina/pagamentos", 240, "Formas de pagamento e confirmação de comprovantes."),
  item("vendas_relatorios", "Relatórios", "Evento selecionado", "vendas", "/admin/festa-junina/relatorios?modulo=vendas", 250, "Relatórios de vendas e pagamentos."),
  sectionHeader("conveniencias_cardapio", "Cardápio de comidas, bebidas e doces", "Conveniências", 300),
  item("conveniencias_resumo_clientes", "Versão resumida para clientes", "Conveniências", "conveniencias_cardapio", "/admin/festa-junina/cliente-resumo", 310, "Resumo do cardápio para comunicação com clientes."),
  item("conveniencias_ficha_tecnica", "Ficha Técnica/Receitas", "Conveniências", "conveniencias_cardapio", "/admin/festa-junina/cardapio", 320, "Itens do cardápio, modo de preparo e insumos."),
  sectionHeader("conveniencias_outros", "Outros", "Conveniências", 330),
  item("conveniencias_bingo", "Cartelas de Bingo", "Conveniências", "conveniencias_outros", "/admin/festa-junina/bingo", 331, "Configurações de cartelas de bingo quando disponíveis."),
  item("conveniencias_outros_item", "Outros", "Conveniências", "conveniencias_outros", "/admin/festa-junina/outros", 332, "Outras conveniências do evento."),
  item("conveniencias_relatorios", "Relatórios", "Conveniências", null, "/admin/festa-junina/relatorios?modulo=conveniencias", 340, "Relatórios das conveniências."),
  sectionHeader("operacao_voluntarios", "Voluntários", "Operação", 400),
  item("operacao_voluntarios_funcoes", "Cadastro por função", "Operação", "operacao_voluntarios", "/admin/festa-junina/voluntarios/funcoes", 410, "Cadastro e organização dos voluntários por função."),
  item("operacao_voluntarios_necessidade", "Necessidade conforme convites vendidos/estimativa", "Operação", "operacao_voluntarios", "/admin/festa-junina/voluntarios/necessidade", 420, "Sugestão de equipe conforme público confirmado/provável."),
  sectionHeader("operacao_compras", "Compras", "Operação", 430),
  item("operacao_compras_insumos", "Insumos", "Operação", "operacao_compras", "/admin/festa-junina/compras/insumos", 431, "Lista de ingredientes e materiais de preparo."),
  item("operacao_compras_itens_finais", "Itens finais", "Operação", "operacao_compras", "/admin/festa-junina/compras/itens-finais", 432, "Bebidas, descartáveis e itens finais para compra."),
  item("operacao_treinamento", "Treinamento/Simulação", "Operação", null, "/admin/festa-junina/treinamento", 440, "Treinamento da equipe e simulações antes do evento."),
  sectionHeader("operacao_atendimento", "Atendimento no dia do evento", "Operação", 450),
  item("operacao_checkin", "Check-in", "Operação", "operacao_atendimento", "/admin/festa-junina/atendimento?aba=checkin", 451, "Validação de entrada e QR Code."),
  item("operacao_pedidos", "Pedidos", "Operação", "operacao_atendimento", "/admin/festa-junina/pedidos", 452, "Pedidos e vendas durante o evento, quando usado."),
  item("operacao_entrega", "Entrega", "Operação", "operacao_atendimento", "/admin/festa-junina/entrega", 453, "Separação e entrega dos itens."),
  item("operacao_caixa", "Caixa", "Operação", "operacao_atendimento", "/admin/festa-junina/caixa", 454, "Pagamento e caixa no dia do evento."),
  item("operacao_ocorrencias", "Ocorrências", "Operação", "operacao_atendimento", "/admin/festa-junina/ocorrencias", 455, "Registro de ocorrências operacionais."),
  item("operacao_prestacao_contas", "Prestação de contas", "Operação", null, "/admin/festa-junina/prestacao-contas", 460, "Resumo final financeiro e operacional."),
  item("operacao_relatorios", "Relatórios", "Operação", null, "/admin/festa-junina/relatorios?modulo=operacao", 470, "Relatórios operacionais."),
];

function item(
  item_key: string,
  label: string,
  section: string,
  parent_key: string | null,
  route_path: string | null,
  sort_order: number,
  description: string,
): AdminMenuCatalogItem {
  return {
    item_key,
    label,
    description,
    section,
    parent_key,
    route_path,
    icon_key: null,
    sort_order,
    default_enabled: true,
    implemented: true,
    active: true,
    not_implemented_message: null,
  };
}

function sectionHeader(item_key: string, label: string, section: string, sort_order: number, parent_key: string | null = null): AdminMenuCatalogItem {
  return {
    item_key,
    label,
    description: null,
    section,
    parent_key,
    route_path: null,
    icon_key: null,
    sort_order,
    default_enabled: true,
    implemented: true,
    active: true,
    not_implemented_message: null,
  };
}

function safeAdminMenuStatus(value: unknown): AdminMenuStatus {
  if (value === "not_used" || value === "suggested" || value === "configuring" || value === "in_use" || value === "done") {
    return value;
  }
  return "suggested";
}

export function getDefaultMenuCatalog() {
  return [...DEFAULT_ADMIN_MENU_ITEMS].sort((a, b) => a.sort_order - b.sort_order);
}

export async function getAdminMenuCatalog() {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.from("admin_menu_items").select("*").eq("active", true).order("sort_order", { ascending: true });

  if (error) {
    return getDefaultMenuCatalog();
  }

  return (data?.length ? data : getDefaultMenuCatalog()) as AdminMenuCatalogItem[];
}

export async function getEventMenuConfigurations(eventId: string) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.from("event_menu_items").select("*").eq("event_id", eventId);
  if (error) return new Map<string, EventMenuConfig>();

  const map = new Map<string, EventMenuConfig>();
  for (const row of data ?? []) {
    const key = typeof row.item_key === "string" ? row.item_key : "";
    if (key) map.set(key, row as EventMenuConfig);
  }
  return map;
}

export async function getAdminSidebarSections(eventId?: string | null): Promise<AdminSidebarSection[]> {
  const catalog = await getAdminMenuCatalog();
  const configs = eventId ? await getEventMenuConfigurations(eventId) : new Map<string, EventMenuConfig>();

  const itemByKey = new Map(catalog.map((item) => [item.item_key, item]));
  const childrenByParent = new Map<string, AdminMenuCatalogItem[]>();

  for (const item of catalog) {
    if (item.parent_key) {
      const list = childrenByParent.get(item.parent_key) ?? [];
      list.push(item);
      childrenByParent.set(item.parent_key, list);
    }
  }

  for (const list of childrenByParent.values()) {
    list.sort((a, b) => getSortOrder(a, configs) - getSortOrder(b, configs));
  }

  const sectionOrder = ["Geral", "Evento selecionado", "Conveniências", "Operação"];
  const sections = sectionOrder.map((sectionTitle) => {
    const roots = catalog
      .filter((item) => item.section === sectionTitle && !item.parent_key)
      .sort((a, b) => getSortOrder(a, configs) - getSortOrder(b, configs));

    const locked = sectionTitle !== "Geral" && !eventId;
    const items: AdminSidebarItem[] = [];

    for (const root of roots) {
      appendItem(root, 0, items, itemByKey, childrenByParent, configs, locked);
    }

    return {
      title: sectionTitle,
      defaultOpen: sectionTitle !== "Conveniências" || Boolean(eventId),
      locked,
      items,
    } satisfies AdminSidebarSection;
  });

  return sections.filter((section) => section.items.length > 0);
}

function getSortOrder(item: AdminMenuCatalogItem, configs: Map<string, EventMenuConfig>) {
  const config = configs.get(item.item_key);
  return config?.sort_order ?? item.sort_order;
}

function appendItem(
  item: AdminMenuCatalogItem,
  depth: number,
  result: AdminSidebarItem[],
  itemByKey: Map<string, AdminMenuCatalogItem>,
  childrenByParent: Map<string, AdminMenuCatalogItem[]>,
  configs: Map<string, EventMenuConfig>,
  locked: boolean,
) {
  const config = configs.get(item.item_key);
  const hasChildren = (childrenByParent.get(item.item_key) ?? []).length > 0;
  const label = config?.custom_label?.trim() || item.label;
  const status = safeAdminMenuStatus(config?.status);
  const defaultEnabled = item.section === "Geral" ? true : item.default_enabled;
  const enabled = !locked && (config?.enabled ?? defaultEnabled) && status !== "not_used";
  const implemented = item.implemented;

  result.push({
    key: item.item_key,
    href: item.route_path ?? undefined,
    label,
    depth,
    enabled,
    status,
    implemented,
    isHeading: hasChildren || !item.route_path,
    hint: locked
      ? "Abra ou selecione um evento para usar esta opção."
      : !implemented
        ? item.not_implemented_message ?? "Funcionalidade em preparação."
        : status === "not_used"
          ? "Este item está marcado como não usado neste evento."
          : undefined,
  });

  const children = childrenByParent.get(item.item_key) ?? [];
  for (const child of children) {
    if (!itemByKey.has(child.item_key)) continue;
    appendItem(child, depth + 1, result, itemByKey, childrenByParent, configs, locked || !enabled);
  }
}
