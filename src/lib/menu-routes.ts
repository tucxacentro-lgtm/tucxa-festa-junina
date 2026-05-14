export type MenuRouteOption = {
  label: string;
  path: string;
  group: string;
  description?: string;
};

export const MENU_ROUTE_OPTIONS: MenuRouteOption[] = [
  { group: 'Geral', label: 'Menu', path: '/admin/festa-junina/menu', description: 'Cadastro e configuração da estrutura do menu do sistema.' },
  { group: 'Geral', label: 'Eventos', path: '/admin/festa-junina/eventos', description: 'Cadastro e configuração das edições da Festa Junina.' },
  { group: 'Geral', label: 'Manuais e Ajuda', path: '/admin/festa-junina/ajuda', description: 'Documentações, procedimentos e orientações de uso do sistema.' },
  { group: 'Evento', label: 'Painel Geral', path: '/admin/festa-junina', description: 'Visão geral de todos os itens do menu e do evento aberto.' },
  { group: 'Vendas', label: 'Convites', path: '/admin/festa-junina/convites', description: 'Acesso ao evento e controle dos convites.' },
  { group: 'Vendas', label: 'Combos', path: '/admin/festa-junina/combos', description: 'Cadastro/configuração de combos, quando disponíveis.' },
  { group: 'Vendas', label: 'Campanhas', path: '/admin/festa-junina/indicacoes', description: 'Cadastro/configuração de campanhas e programa de indicações.' },
  { group: 'Vendas', label: 'Upsell', path: '/admin/festa-junina/upsell', description: 'Receitas adicionais e mensagens para complementar a compra.' },
  { group: 'Vendas', label: 'Pagamento', path: '/admin/festa-junina/pagamentos', description: 'Cadastro/configuração das formas de pagamento.' },
  { group: 'Vendas', label: 'Aprovações', path: '/admin/festa-junina/pedidos', description: 'Confirmações de pagamentos e acompanhamento de comprovantes.' },
  { group: 'Vendas', label: 'Relatórios', path: '/admin/festa-junina/relatorios?modulo=vendas', description: 'Base de dados para informações de vendas.' },
  { group: 'Vendas', label: 'Cardápio', path: '/admin/festa-junina/cardapio', description: 'Comidas, bebidas e doces.' },
  { group: 'Vendas', label: 'Cardápio Vendas', path: '/admin/festa-junina/cliente-resumo', description: 'Descrição e preços do cardápio para clientes.' },
  { group: 'Vendas', label: 'Bingo', path: '/admin/festa-junina/bingo', description: 'Aquisição de cartelas e ações de bingo vinculadas ao evento.' },
  { group: 'Vendas', label: 'Relatórios', path: '/admin/festa-junina/relatorios?modulo=conveniencias', description: 'Base de dados para informações das conveniências.' },
  { group: 'Operação', label: 'Voluntários', path: '/admin/festa-junina/voluntarios', description: 'Equipe mão na massa.' },
  { group: 'Operação', label: 'Funções', path: '/admin/festa-junina/voluntarios/funcoes', description: 'Cadastro de funções dos voluntários.' },
  { group: 'Operação', label: 'Equipe', path: '/admin/festa-junina/voluntarios/necessidade', description: 'Necessidade por função conforme convites vendidos/estimativa.' },
  { group: 'Operação', label: 'Relatórios', path: '/admin/festa-junina/relatorios?modulo=voluntarios', description: 'Base de dados para informações dos voluntários.' },
  { group: 'Operação', label: 'Compras', path: '/admin/festa-junina/compras', description: 'Necessidades de compra para o evento.' },
  { group: 'Operação', label: 'Insumos', path: '/admin/festa-junina/compras/insumos', description: 'Itens para preparo das receitas.' },
  { group: 'Operação', label: 'Itens finais', path: '/admin/festa-junina/compras/itens-finais', description: 'Produtos que serão apenas revendidos.' },
  { group: 'Operação', label: 'Relatórios', path: '/admin/festa-junina/relatorios?modulo=compras', description: 'Base de dados para informações de compras.' },
  { group: 'Operação', label: 'Treinamentos', path: '/admin/festa-junina/treinamento', description: 'Simulação do que cada função deve realizar.' },
  { group: 'Operação', label: 'Simulação de capacidade', path: '/admin/festa-junina/simulacao/capacidade', description: 'Simulação de convites, estrutura do local, voluntários e compras.' },
  { group: 'Operação', label: 'Atendimento', path: '/admin/festa-junina/atendimento', description: 'Fluxo de atendimento no dia do evento.' },
  { group: 'Operação', label: 'Check-in', path: '/admin/festa-junina/atendimento?aba=checkin', description: 'Recepção e acomodação dos participantes.' },
  { group: 'Operação', label: 'Preparo', path: '/admin/festa-junina/modulo/operacao_atendimento_preparo', description: 'Produção conforme pedido e receita.' },
  { group: 'Operação', label: 'Retirada', path: '/admin/festa-junina/modulo/operacao_atendimento_retirada', description: 'Retirada pelo garçom ou diretamente pelo cliente.' },
  { group: 'Operação', label: 'Entrega', path: '/admin/festa-junina/entrega', description: 'Entrega do garçom para o cliente.' },
  { group: 'Operação', label: 'Caixa', path: '/admin/festa-junina/caixa', description: 'Pagamentos e fechamento de caixa.' },
  { group: 'Operação', label: 'Ocorrências', path: '/admin/festa-junina/ocorrencias', description: 'Registro de problemas e ocorrências.' },
  { group: 'Operação', label: 'Prestação de Contas', path: '/admin/festa-junina/prestacao-contas', description: 'Prestação de contas financeira e operacional.' },
  { group: 'Operação', label: 'Relatórios', path: '/admin/festa-junina/relatorios?modulo=prestacao', description: 'Base de dados para informações da prestação de contas.' },
];

export const MENU_ROUTE_AUTO_VALUE = "__auto_template__";

export function getRouteLabel(path: string | null | undefined) {
  if (!path) return "Página automática pelo modelo";
  return MENU_ROUTE_OPTIONS.find((option) => option.path === path)?.label ?? path;
}
