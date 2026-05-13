export type MenuRouteOption = {
  label: string;
  path: string;
  group: string;
  description?: string;
};

export const MENU_ROUTE_OPTIONS: MenuRouteOption[] = [
  { group: "Geral", label: "Eventos", path: "/admin/festa-junina/eventos" },
  { group: "Geral", label: "Novo evento", path: "/admin/festa-junina/eventos/novo" },
  { group: "Geral", label: "Cadastro do menu", path: "/admin/festa-junina/menu" },
  { group: "Geral", label: "Manuais e ajuda", path: "/admin/festa-junina/ajuda" },
  { group: "Evento", label: "Painel do evento", path: "/admin/festa-junina" },
  { group: "Vendas", label: "Convites", path: "/admin/festa-junina/convites" },
  { group: "Vendas", label: "Acesso ao evento", path: "/admin/festa-junina/acesso" },
  { group: "Vendas", label: "Individuais/Combos", path: "/admin/festa-junina/combos" },
  { group: "Vendas", label: "Programa de indicações", path: "/admin/festa-junina/indicacoes" },
  { group: "Vendas", label: "Upsell", path: "/admin/festa-junina/upsell" },
  { group: "Vendas", label: "Envios WhatsApp", path: "/admin/festa-junina/upsell/envios" },
  { group: "Vendas", label: "Pagamentos/Confirmações", path: "/admin/festa-junina/pagamentos" },
  { group: "Vendas", label: "Compras e comprovantes", path: "/admin/festa-junina/pedidos" },
  { group: "Conveniências", label: "Versão resumida para clientes", path: "/admin/festa-junina/cliente-resumo" },
  { group: "Conveniências", label: "Cardápio de comidas, bebidas e doces", path: "/admin/festa-junina/cardapio" },
  { group: "Conveniências", label: "Novo item do cardápio", path: "/admin/festa-junina/cardapio/novo" },
  { group: "Conveniências", label: "Cartelas de Bingo", path: "/admin/festa-junina/bingo" },
  { group: "Conveniências", label: "Outros", path: "/admin/festa-junina/outros" },
  { group: "Operação", label: "Voluntários", path: "/admin/festa-junina/voluntarios" },
  { group: "Operação", label: "Cadastro por função", path: "/admin/festa-junina/voluntarios/funcoes" },
  { group: "Operação", label: "Necessidade de voluntários", path: "/admin/festa-junina/voluntarios/necessidade" },
  { group: "Operação", label: "Planejamento", path: "/admin/festa-junina/planejamento" },
  { group: "Operação", label: "Compras", path: "/admin/festa-junina/compras" },
  { group: "Operação", label: "Insumos", path: "/admin/festa-junina/compras/insumos" },
  { group: "Operação", label: "Itens finais", path: "/admin/festa-junina/compras/itens-finais" },
  { group: "Operação", label: "Treinamento/Simulação", path: "/admin/festa-junina/treinamento" },
  { group: "Operação", label: "Operação e simulação", path: "/admin/festa-junina/operacao" },
  { group: "Operação", label: "Atendimento no dia", path: "/admin/festa-junina/atendimento" },
  { group: "Operação", label: "Check-in", path: "/admin/festa-junina/atendimento?aba=checkin" },
  { group: "Operação", label: "Pedidos", path: "/admin/festa-junina/pedidos" },
  { group: "Operação", label: "Entrega", path: "/admin/festa-junina/entrega" },
  { group: "Operação", label: "Caixa", path: "/admin/festa-junina/caixa" },
  { group: "Operação", label: "Ocorrências", path: "/admin/festa-junina/ocorrencias" },
  { group: "Operação", label: "Prestação de contas", path: "/admin/festa-junina/prestacao-contas" },
  { group: "Relatórios", label: "Relatórios gerais", path: "/admin/festa-junina/relatorios" },
  { group: "Relatórios", label: "Relatórios de vendas", path: "/admin/festa-junina/relatorios?modulo=vendas" },
  { group: "Relatórios", label: "Relatórios de conveniências", path: "/admin/festa-junina/relatorios?modulo=conveniencias" },
  { group: "Relatórios", label: "Relatórios de operação", path: "/admin/festa-junina/relatorios?modulo=operacao" },
];

export const MENU_ROUTE_AUTO_VALUE = "__auto_template__";

export function getRouteLabel(path: string | null | undefined) {
  if (!path) return "Página automática pelo modelo";
  return MENU_ROUTE_OPTIONS.find((option) => option.path === path)?.label ?? path;
}
