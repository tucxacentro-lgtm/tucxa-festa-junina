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
  menuItem('menu_configuravel', 'Menu', 'Gestão', null, '/admin/festa-junina/menu', 10, 'Cadastro e configuração da estrutura do menu do sistema.', 'module_config'),
  menuItem('eventos', 'Eventos', 'Gestão', null, '/admin/festa-junina/eventos', 20, 'Cadastro e configuração das edições da Festa Junina.', 'list_new'),
  menuItem('manuais_ajuda', 'Manuais e Ajuda', 'Gestão', null, '/admin/festa-junina/ajuda', 30, 'Documentações, procedimentos e orientações de uso do sistema.', 'help'),
  menuItem('painel_geral', 'Painel de Gestão', 'Evento selecionado', null, '/admin/festa-junina', 100, 'Visão de gestão de todos os itens do menu e do evento aberto.', 'module_config'),
  menuItem('simulacoes', 'Simulações', 'Evento selecionado', null, '/admin/festa-junina/simulacao/capacidade', 150, 'Módulo Simulacoes da Festa Junina do Tucxa.', 'report_bi'),
  menuItem('vendas', 'Vendas', 'Evento selecionado', null, null, 200, 'Aquisição de receitas para realização do evento.', 'module_config'),
  menuItem('vendas_convites', 'Convites', 'Evento selecionado', 'vendas', '/admin/festa-junina/convites', 210, 'Acesso ao evento e controle dos convites.', 'list_new'),
  menuItem('vendas_convites_individuais', 'Individuais', 'Evento selecionado', 'vendas_convites', '/admin/festa-junina/convites', 211, 'Cadastro/configuração dos convites individuais.', 'list_new'),
  menuItem('vendas_convites_combos', 'Combos', 'Evento selecionado', 'vendas_convites', '/admin/festa-junina/combos', 212, 'Cadastro/configuração de combos, quando disponíveis.', 'list_new'),
  menuItem('vendas_convites_campanhas', 'Campanhas', 'Evento selecionado', 'vendas_convites', '/admin/festa-junina/indicacoes', 213, 'Cadastro/configuração de campanhas e programa de indicações.', 'module_config'),
  menuItem('vendas_convites_upsell', 'Upsell', 'Evento selecionado', 'vendas_convites', '/admin/festa-junina/upsell', 214, 'Receitas adicionais e mensagens para complementar a compra.', 'module_config'),
  menuItem('vendas_convites_pagamento', 'Pagamento', 'Evento selecionado', 'vendas_convites', '/admin/festa-junina/pagamentos', 215, 'Cadastro/configuração das formas de pagamento.', 'module_config'),
  menuItem('vendas_convites_aprovacoes', 'Aprovações', 'Evento selecionado', 'vendas_convites', '/admin/festa-junina/pedidos', 216, 'Confirmações de pagamentos e acompanhamento de comprovantes.', 'list_new'),
  menuItem('vendas_convites_relatorios', 'Relatórios', 'Evento selecionado', 'vendas_convites', '/admin/festa-junina/relatorios?modulo=vendas', 217, 'Base de dados para informações de vendas.', 'report_bi'),
  menuItem('vendas_conveniencias', 'Conveniências', 'Evento selecionado', 'vendas', null, 230, 'Experiências no dia do evento.', 'module_config'),
  menuItem('vendas_conveniencias_cardapio', 'Cardápio', 'Evento selecionado', 'vendas_conveniencias', '/admin/festa-junina/cardapio', 231, 'Comidas, bebidas e doces.', 'list_new'),
  menuItem('vendas_conveniencias_cardapio_vendas', 'Cardápio Vendas', 'Evento selecionado', 'vendas_conveniencias_cardapio', '/admin/festa-junina/cliente-resumo', 232, 'Descrição e preços do cardápio para clientes.', 'list_new'),
  menuItem('vendas_conveniencias_cardapio_preparo', 'Cardápio Preparo', 'Evento selecionado', 'vendas_conveniencias_cardapio', '/admin/festa-junina/cardapio', 233, 'Ficha técnica, receitas e preparo.', 'list_new'),
  menuItem('vendas_conveniencias_bingo', 'Bingo', 'Evento selecionado', 'vendas_conveniencias', '/admin/festa-junina/bingo', 234, 'Aquisição de cartelas e ações de bingo vinculadas ao evento.', 'module_config'),
  menuItem('vendas_conveniencias_relatorios', 'Relatórios', 'Evento selecionado', 'vendas_conveniencias', '/admin/festa-junina/relatorios?modulo=conveniencias', 235, 'Base de dados para informações das conveniências.', 'report_bi'),
  menuItem('operacao', 'Evento selecionado', 'Evento selecionado', null, null, 400, 'Ações para que o evento aconteça.', 'module_config'),
  menuItem('operacao_configuracao', 'Configuração Operacional', 'Evento selecionado', 'operacao', '/admin/festa-junina/operacao/configuracao', 401, 'Regras flexíveis para convites, mesas, pedidos, preparo, entrega, caixa e comprovantes.', 'module_config'),
  menuItem('operacao_voluntarios', 'Voluntários', 'Evento selecionado', 'operacao', '/admin/festa-junina/voluntarios', 410, 'Equipe mão na massa.', 'list_new'),
  menuItem('operacao_voluntarios_funcoes', 'Funções', 'Evento selecionado', 'operacao_voluntarios', '/admin/festa-junina/voluntarios/funcoes', 411, 'Cadastro de funções dos voluntários.', 'list_new'),
  menuItem('operacao_voluntarios_equipe', 'Equipe', 'Evento selecionado', 'operacao_voluntarios', '/admin/festa-junina/voluntarios/necessidade', 412, 'Necessidade por função conforme convites vendidos/estimativa.', 'module_config'),
  menuItem('operacao_voluntarios_relatorios', 'Relatórios', 'Evento selecionado', 'operacao_voluntarios', '/admin/festa-junina/relatorios?modulo=voluntarios', 413, 'Base de dados para informações dos voluntários.', 'report_bi'),
  menuItem('operacao_compras', 'Compras', 'Evento selecionado', 'operacao', '/admin/festa-junina/compras', 420, 'Necessidades de compra para o evento.', 'module_config'),
  menuItem('operacao_compras_insumos', 'Insumos', 'Evento selecionado', 'operacao_compras', '/admin/festa-junina/compras/insumos', 421, 'Itens para preparo das receitas.', 'list_new'),
  menuItem('operacao_compras_itens_finais', 'Itens finais', 'Evento selecionado', 'operacao_compras', '/admin/festa-junina/compras/itens-finais', 422, 'Produtos que serão apenas revendidos.', 'list_new'),
  menuItem('operacao_compras_relatorios', 'Relatórios', 'Evento selecionado', 'operacao_compras', '/admin/festa-junina/relatorios?modulo=compras', 423, 'Base de dados para informações de compras.', 'report_bi'),
  menuItem('operacao_treinamentos', 'Treinamentos', 'Evento selecionado', 'operacao', null, 430, 'Simulação do que cada função deve realizar.', 'checklist'),
  menuItem('operacao_treinamentos_materiais', 'Materiais de treinamento', 'Evento selecionado', 'operacao_treinamentos', '/admin/festa-junina/treinamento', 431, 'Roteiros curtos, textos para narração e mensagens para WhatsApp.', 'checklist'),
  menuItem('operacao_treinamentos_playlist', 'Playlist YouTube', 'Evento selecionado', 'operacao_treinamentos', '/admin/festa-junina/treinamento/playlist', 432, 'Cadastro da playlist e dos links de vídeos ou áudios publicados.', 'help'),
  menuItem('operacao_simulacao_capacidade', 'Simulação de capacidade', 'Evento selecionado', 'operacao_treinamentos', '/admin/festa-junina/simulacao/capacidade', 433, 'Simulação de convites, estrutura do local, voluntários e compras.', 'report_bi'),
  menuItem('operacao_atendimento', 'Atendimento', 'Evento selecionado', 'operacao', '/admin/festa-junina/atendimento', 440, 'Fluxo de atendimento no dia do evento.', 'operation'),
  menuItem('operacao_atendimento_checkin', 'Check-in', 'Evento selecionado', 'operacao_atendimento', '/admin/festa-junina/checkin', 441, 'Recepção e acomodação dos participantes.', 'operation'),
  menuItem('operacao_atendimento_pedidos', 'Pedidos', 'Evento selecionado', 'operacao_atendimento', '/admin/festa-junina/atendimento/pedidos', 443, 'Pedidos do cardápio no dia do evento.', 'operation'),
  menuItem('operacao_atendimento_cancelados', 'Cancelados', 'Evento selecionado', 'operacao_atendimento', '/admin/festa-junina/atendimento/cancelados', 4435, 'Mesas, responsáveis e pedidos cancelados ocultos da operação pública.', 'operation'),
  menuItem('operacao_atendimento_preparo', 'Preparo', 'Evento selecionado', 'operacao_atendimento', '/admin/festa-junina/preparo', 444, 'Produção conforme pedido e receita.', 'operation'),
  menuItem('operacao_atendimento_retirada', 'Retirada', 'Evento selecionado', 'operacao_atendimento', '/admin/festa-junina/retirada', 445, 'Retirada pelo cliente no balcão.', 'operation'),
  menuItem('operacao_atendimento_entrega', 'Entrega', 'Evento selecionado', 'operacao_atendimento', '/admin/festa-junina/entrega', 446, 'Entrega do garçom para o cliente.', 'operation'),
  menuItem('operacao_atendimento_ocorrencias', 'Ocorrências', 'Evento selecionado', 'operacao_atendimento', '/admin/festa-junina/ocorrencias', 448, 'Registro de problemas e ocorrências.', 'operation'),
  menuItem('operacao_prestacao_contas', 'Prestação de Contas', 'Evento selecionado', 'operacao', '/admin/festa-junina/prestacao-contas', 460, 'Prestação de contas financeira e operacional.', 'report_bi'),
  menuItem('operacao_prestacao_relatorios', 'Relatórios', 'Evento selecionado', 'operacao_prestacao_contas', '/admin/festa-junina/relatorios?modulo=prestacao', 461, 'Base de dados para informações da prestação de contas.', 'report_bi')
];

function menuItem(
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

function safeAdminMenuStatus(value: unknown): AdminMenuStatus {
  if (value === "not_used" || value === "suggested" || value === "configuring" || value === "in_use" || value === "done") {
    return value;
  }
  return "suggested";
}

export function getDefaultMenuCatalog() {
  return [...DEFAULT_ADMIN_MENU_ITEMS].sort((a, b) => a.sort_order - b.sort_order);
}

export function getDefaultSectionOrder() {
  return ['Gestão', 'Evento selecionado'];
}


function normalizeMenuCatalogItem(item: AdminMenuCatalogItem): AdminMenuCatalogItem {
  const section = item.section === "Gestão" || item.section === "Admin" ? "Gestão" : item.section === "Operação" ? "Evento selecionado" : item.section;
  const label = item.label === "Painel Geral" ? "Painel de Gestão" : item.label === "Admin" ? "Gestão" : item.label === "Geral" ? "Gestão" : item.label;
  return { ...item, section, label };
}

export async function getAdminMenuCatalog() {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("admin_menu_items")
    .select("*")
    .eq("active", true)
    .order("sort_order", { ascending: true });

  if (error) return getDefaultMenuCatalog();
  const rows = (data?.length ? data : getDefaultMenuCatalog()) as AdminMenuCatalogItem[];
  return rows.map(normalizeMenuCatalogItem);
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

  const sectionOrder = Array.from(new Set([...getDefaultSectionOrder(), ...catalog.map((item) => item.section)]));
  const visibleSections = eventId ? sectionOrder : sectionOrder.filter((section) => section === "Gestão");

  const sections = visibleSections.map((sectionTitle) => {
    const roots = catalog
      .filter((item) => item.section === sectionTitle && !item.parent_key)
      .sort((a, b) => getSortOrder(a, configs) - getSortOrder(b, configs));

    const items: AdminSidebarItem[] = [];
    for (const root of roots) {
      appendItem(root, 0, items, itemByKey, childrenByParent, configs, false);
    }

    return {
      title: sectionTitle,
      defaultOpen: sectionTitle === "Gestão" || Boolean(eventId),
      locked: false,
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
  const implemented = item.implemented;
  const fallbackRoute = !hasChildren ? `/admin/festa-junina/modulo/${item.item_key}` : undefined;
  const href = hasChildren ? undefined : (item.route_path ?? fallbackRoute);

  result.push({
    key: item.item_key,
    href,
    label,
    depth,
    enabled: !locked,
    status,
    implemented,
    isHeading: hasChildren,
    hint: !implemented
      ? item.not_implemented_message ?? "Funcionalidade em preparação."
      : status === "not_used"
        ? "Este item está visível para demonstrar todas as possibilidades, mas foi marcado como não usado neste evento."
        : undefined,
  });

  const children = childrenByParent.get(item.item_key) ?? [];
  for (const child of children) {
    if (!itemByKey.has(child.item_key)) continue;
    appendItem(child, depth + 1, result, itemByKey, childrenByParent, configs, locked);
  }
}
