export type MenuRouteOption = {
  label: string;
  path: string;
  group: string;
  description?: string;
};

export const MENU_ROUTE_OPTIONS: MenuRouteOption[] = [
  { group: "Geral", label: "Menu", path: "/admin/festa-junina/menu", description: "Cadastro e configuração da estrutura do menu do sistema." },
  { group: "Geral", label: "Eventos", path: "/admin/festa-junina/eventos", description: "Cadastro e configuração das edições da Festa Junina." },
  { group: "Geral", label: "Manuais e Ajuda", path: "/admin/festa-junina/ajuda", description: "Documentações, procedimentos e orientações de uso." },
  { group: "Evento", label: "Painel Geral", path: "/admin/festa-junina", description: "Visão geral do evento aberto." },
  { group: "Evento", label: "Simulações", path: "/admin/festa-junina/simulacao/capacidade", description: "Cenários conservador, provável e máximo para compras e equipe." },
  { group: "Vendas", label: "Convites", path: "/admin/festa-junina/convites", description: "Controle de convites e acesso ao evento." },
  { group: "Vendas", label: "Combos", path: "/admin/festa-junina/combos", description: "Combos quando disponíveis." },
  { group: "Vendas", label: "Campanhas", path: "/admin/festa-junina/indicacoes", description: "Programa de indicações." },
  { group: "Vendas", label: "Upsell", path: "/admin/festa-junina/upsell", description: "Mensagens e complementos de compra." },
  { group: "Vendas", label: "Pagamento", path: "/admin/festa-junina/pagamentos", description: "Formas de pagamento." },
  { group: "Vendas", label: "Aprovações", path: "/admin/festa-junina/pedidos", description: "Comprovantes e confirmação de pagamentos." },
  { group: "Vendas", label: "Relatórios", path: "/admin/festa-junina/relatorios?modulo=vendas", description: "Relatórios de vendas." },
  { group: "Conveniências", label: "Cardápio", path: "/admin/festa-junina/cardapio", description: "Cadastro geral de itens do cardápio." },
  { group: "Conveniências", label: "Cardápio Vendas", path: "/admin/festa-junina/cliente-resumo", description: "Cardápio para cliente/garçom registrar consumo." },
  { group: "Conveniências", label: "Cardápio Preparo", path: "/admin/festa-junina/cardapio", description: "Ficha técnica, receitas e insumos." },
  { group: "Conveniências", label: "Bingo", path: "/admin/festa-junina/bingo", description: "Cartelas e ações de bingo." },
  { group: "Conveniências", label: "Relatórios", path: "/admin/festa-junina/relatorios?modulo=conveniencias", description: "Relatórios das conveniências." },
  { group: "Operação", label: "Voluntários", path: "/admin/festa-junina/voluntarios", description: "Cadastro de equipe voluntária." },
  { group: "Operação", label: "Funções", path: "/admin/festa-junina/voluntarios/funcoes", description: "Funções dos voluntários." },
  { group: "Operação", label: "Equipe", path: "/admin/festa-junina/voluntarios/necessidade", description: "Necessidade conforme cenários." },
  { group: "Operação", label: "Compras", path: "/admin/festa-junina/compras", description: "Lista de compras do evento." },
  { group: "Operação", label: "Insumos", path: "/admin/festa-junina/compras/insumos", description: "Insumos para preparo." },
  { group: "Operação", label: "Itens finais", path: "/admin/festa-junina/compras/itens-finais", description: "Produtos prontos para revenda." },
  { group: "Operação", label: "Treinamentos", path: "/admin/festa-junina/treinamento", description: "Treinamento e simulações." },
  { group: "Operação", label: "Atendimento", path: "/admin/festa-junina/atendimento", description: "Atendimento no dia do evento." },
  { group: "Operação", label: "Check-in", path: "/admin/festa-junina/atendimento?aba=checkin", description: "Recepção e entrada." },
  { group: "Operação", label: "Pedidos", path: "/admin/festa-junina/cliente-resumo", description: "Pedidos de consumo no dia." },
  { group: "Operação", label: "Preparo", path: "/admin/festa-junina/modulo/operacao_atendimento_preparo", description: "Fila e preparo." },
  { group: "Operação", label: "Retirada", path: "/admin/festa-junina/modulo/operacao_atendimento_retirada", description: "Retirada no balcão." },
  { group: "Operação", label: "Entrega", path: "/admin/festa-junina/entrega", description: "Entrega ao cliente." },
  { group: "Operação", label: "Caixa", path: "/admin/festa-junina/caixa", description: "Pagamento e caixa." },
  { group: "Operação", label: "Ocorrências", path: "/admin/festa-junina/ocorrencias", description: "Registro de ocorrências." },
  { group: "Operação", label: "Prestação de Contas", path: "/admin/festa-junina/prestacao-contas", description: "Fechamento e prestação de contas." },
  { group: "Operação", label: "Relatórios", path: "/admin/festa-junina/relatorios?modulo=prestacao", description: "Relatórios da prestação de contas." },
];

export const MENU_ROUTE_AUTO_VALUE = "__auto_template__";

export function getRouteLabel(path: string | null | undefined) {
  if (!path) return "Página automática pelo modelo";
  return MENU_ROUTE_OPTIONS.find((option) => option.path === path)?.label ?? path;
}
