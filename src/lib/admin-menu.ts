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
  template_key?: string | null;
  is_deletable?: boolean | null;
  deleted_at?: string | null;
  opens_in_new_tab?: boolean | null;
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
  item('menu_configuravel', 'Menu', 'Geral', null, '/admin/festa-junina/menu', 10, 'Cadastro e configuração da estrutura do menu do sistema.', 'module_config'),
  item('eventos', 'Eventos', 'Geral', null, '/admin/festa-junina/eventos', 20, 'Cadastro e configuração das edições da Festa Junina.', 'list_new'),
  item('manuais_ajuda', 'Manuais e Ajuda', 'Geral', null, '/admin/festa-junina/ajuda', 30, 'Documentações, procedimentos e orientações de uso do sistema.', 'help'),
  item('painel_geral', 'Painel Geral', 'Evento selecionado', null, '/admin/festa-junina', 100, 'Visão geral de todos os itens do menu e do evento aberto.', 'module_config'),
  sectionHeader('vendas', 'Vendas', 'Evento selecionado', 200, null, 'Aquisição de receitas para realização do evento.', 'module_config'),
  item('vendas_convites', 'Convites', 'Evento selecionado', 'vendas', '/admin/festa-junina/convites', 210, 'Acesso ao evento e controle dos convites.', 'list_new'),
  item('vendas_convites_individuais', 'Individuais', 'Evento selecionado', 'vendas_convites', '/admin/festa-junina/convites', 211, 'Cadastro/configuração dos convites individuais.', 'list_new'),
  item('vendas_convites_combos', 'Combos', 'Evento selecionado', 'vendas_convites', '/admin/festa-junina/combos', 212, 'Cadastro/configuração de combos, quando disponíveis.', 'list_new'),
  item('vendas_convites_campanhas', 'Campanhas', 'Evento selecionado', 'vendas_convites', '/admin/festa-junina/indicacoes', 213, 'Cadastro/configuração de campanhas e programa de indicações.', 'module_config'),
  item('vendas_convites_upsell', 'Upsell', 'Evento selecionado', 'vendas_convites', '/admin/festa-junina/upsell', 214, 'Receitas adicionais e mensagens para complementar a compra.', 'module_config'),
  item('vendas_convites_pagamento', 'Pagamento', 'Evento selecionado', 'vendas_convites', '/admin/festa-junina/pagamentos', 215, 'Cadastro/configuração das formas de pagamento.', 'module_config'),
  item('vendas_convites_aprovacoes', 'Aprovações', 'Evento selecionado', 'vendas_convites', '/admin/festa-junina/pedidos', 216, 'Confirmações de pagamentos e acompanhamento de comprovantes.', 'list_new'),
  item('vendas_convites_relatorios', 'Relatórios', 'Evento selecionado', 'vendas_convites', '/admin/festa-junina/relatorios?modulo=vendas', 217, 'Base de dados para informações de vendas.', 'report_bi'),
  sectionHeader('vendas_conveniencias', 'Conveniências', 'Evento selecionado', 230, 'vendas', 'Experiências no dia do evento.', 'module_config'),
  item('vendas_conveniencias_cardapio', 'Cardápio', 'Evento selecionado', 'vendas_conveniencias', '/admin/festa-junina/cardapio', 231, 'Comidas, bebidas e doces.', 'list_new'),
  item('vendas_conveniencias_cardapio_vendas', 'Cardápio Vendas', 'Evento selecionado', 'vendas_conveniencias_cardapio', '/admin/festa-junina/cliente-resumo', 232, 'Descrição e preços do cardápio para clientes.', 'list_new'),
  item('vendas_conveniencias_cardapio_preparo', 'Cardápio Preparo', 'Evento selecionado', 'vendas_conveniencias_cardapio', '/admin/festa-junina/cardapio', 233, 'Ficha técnica, receitas e preparo.', 'list_new'),
  item('vendas_conveniencias_bingo', 'Bingo', 'Evento selecionado', 'vendas_conveniencias', '/admin/festa-junina/bingo', 234, 'Aquisição de cartelas e ações de bingo vinculadas ao evento.', 'module_config'),
  item('vendas_conveniencias_relatorios', 'Relatórios', 'Evento selecionado', 'vendas_conveniencias', '/admin/festa-junina/relatorios?modulo=conveniencias', 235, 'Base de dados para informações das conveniências.', 'report_bi'),
  sectionHeader('operacao', 'Operação', 'Operação', 400, null, 'Ações para que o evento aconteça.', 'module_config'),
  item('operacao_voluntarios', 'Voluntários', 'Operação', 'operacao', '/admin/festa-junina/voluntarios', 410, 'Equipe mão na massa.', 'list_new'),
  item('operacao_voluntarios_funcoes', 'Funções', 'Operação', 'operacao_voluntarios', '/admin/festa-junina/voluntarios/funcoes', 411, 'Cadastro de funções dos voluntários.', 'list_new'),
  item('operacao_voluntarios_equipe', 'Equipe', 'Operação', 'operacao_voluntarios', '/admin/festa-junina/voluntarios/necessidade', 412, 'Necessidade por função conforme convites vendidos/estimativa.', 'module_config'),
  item('operacao_voluntarios_relatorios', 'Relatórios', 'Operação', 'operacao_voluntarios', '/admin/festa-junina/relatorios?modulo=voluntarios', 413, 'Base de dados para informações dos voluntários.', 'report_bi'),
  item('operacao_compras', 'Compras', 'Operação', 'operacao', '/admin/festa-junina/compras', 420, 'Necessidades de compra para o evento.', 'module_config'),
  item('operacao_compras_insumos', 'Insumos', 'Operação', 'operacao_compras', '/admin/festa-junina/compras/insumos', 421, 'Itens para preparo das receitas.', 'list_new'),
  item('operacao_compras_itens_finais', 'Itens finais', 'Operação', 'operacao_compras', '/admin/festa-junina/compras/itens-finais', 422, 'Produtos que serão apenas revendidos.', 'list_new'),
  item('operacao_compras_relatorios', 'Relatórios', 'Operação', 'operacao_compras', '/admin/festa-junina/relatorios?modulo=compras', 423, 'Base de dados para informações de compras.', 'report_bi'),
  item('operacao_treinamentos', 'Treinamentos', 'Operação', 'operacao', '/admin/festa-junina/treinamento', 430, 'Simulação do que cada função deve realizar.', 'checklist'),
  item('operacao_simulacao_capacidade', 'Simulação de capacidade', 'Operação', 'operacao_treinamentos', '/admin/festa-junina/simulacao/capacidade', 431, 'Simulação de convites, estrutura do local, voluntários e compras.', 'report_bi'),
  item('operacao_atendimento', 'Atendimento', 'Operação', 'operacao', '/admin/festa-junina/atendimento', 440, 'Fluxo de atendimento no dia do evento.', 'operation'),
  item('operacao_atendimento_checkin', 'Check-in', 'Operação', 'operacao_atendimento', '/admin/festa-junina/atendimento?aba=checkin', 441, 'Recepção e acomodação dos participantes.', 'operation'),
  item('operacao_atendimento_pedidos', 'Pedidos', 'Operação', 'operacao_atendimento', '/admin/festa-junina/pedidos', 442, 'Vendas de itens do cardápio no dia do evento.', 'operation'),
  item('operacao_atendimento_preparo', 'Preparo', 'Operação', 'operacao_atendimento', '/admin/festa-junina/modulo/operacao_atendimento_preparo', 443, 'Produção conforme pedido e receita.', 'operation'),
  item('operacao_atendimento_retirada', 'Retirada', 'Operação', 'operacao_atendimento', '/admin/festa-junina/modulo/operacao_atendimento_retirada', 444, 'Retirada pelo garçom ou diretamente pelo cliente.', 'operation'),
  item('operacao_atendimento_entrega', 'Entrega', 'Operação', 'operacao_atendimento', '/admin/festa-junina/entrega', 445, 'Entrega do garçom para o cliente.', 'operation'),
  item('operacao_atendimento_caixa', 'Caixa', 'Operação', 'operacao_atendimento', '/admin/festa-junina/caixa', 446, 'Pagamentos e fechamento de caixa.', 'operation'),
  item('operacao_atendimento_ocorrencias', 'Ocorrências', 'Operação', 'operacao_atendimento', '/admin/festa-junina/ocorrencias', 447, 'Registro de problemas e ocorrências.', 'operation'),
  item('operacao_prestacao_contas', 'Prestação de Contas', 'Operação', 'operacao', '/admin/festa-junina/prestacao-contas', 460, 'Prestação de contas financeira e operacional.', 'report_bi'),
  item('operacao_prestacao_relatorios', 'Relatórios', 'Operação', 'operacao_prestacao_contas', '/admin/festa-junina/relatorios?modulo=prestacao', 461, 'Base de dados para informações da prestação de contas.', 'report_bi'),
];

function item(
  item_key: string,
  label: string,
  section: string,
  parent_key: string | null,
  route_path: string | null,
  sort_order: number,
  description: string,
  template_key: string | null = null,
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
    template_key,
    is_deletable: true,
    deleted_at: null,
    opens_in_new_tab: false,
  };
}

function sectionHeader(
  item_key: string,
  label: string,
  section: string,
  sort_order: number,
  parent_key: string | null = null,
  description: string | null = null,
  template_key: string | null = null,
): AdminMenuCatalogItem {
  return {
    item_key,
    label,
    description,
    section,
    parent_key,
    route_path: null,
    icon_key: null,
    sort_order,
    default_enabled: true,
    implemented: true,
    active: true,
    not_implemented_message: null,
    template_key,
    is_deletable: true,
    deleted_at: null,
    opens_in_new_tab: false,
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

  const rows = (data?.length ? data : getDefaultMenuCatalog()) as AdminMenuCatalogItem[];
  return rows;
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
  const enabled = !locked;
  const implemented = item.implemented;

  const fallbackRoute = !hasChildren ? `/admin/festa-junina/modulo/${item.item_key}` : undefined;

  result.push({
    key: item.item_key,
    href: item.route_path ?? fallbackRoute,
    label,
    depth,
    enabled,
    status,
    implemented,
    isHeading: hasChildren && !item.route_path,
    hint: locked
      ? "Abra ou selecione um evento para usar esta opção."
      : !implemented
        ? item.not_implemented_message ?? "Funcionalidade em preparação."
        : status === "not_used"
          ? "Este item está visível para demonstrar todas as possibilidades, mas foi marcado como não usado neste evento."
          : undefined,
  });

  const children = childrenByParent.get(item.item_key) ?? [];
  for (const child of children) {
    if (!itemByKey.has(child.item_key)) continue;
    appendItem(child, depth + 1, result, itemByKey, childrenByParent, configs, locked || !enabled);
  }
}
