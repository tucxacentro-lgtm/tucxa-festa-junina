export type MenuRouteOption = {
  label: string;
  path: string;
  group: string;
  description?: string;
};

export const MENU_ROUTE_OPTIONS: MenuRouteOption[] = [
  { group: "Gestão", label: "Menu", path: "/admin/festa-junina/menu", description: "Cadastro e configuração da estrutura do menu do sistema." },
  { group: "Gestão", label: "Eventos", path: "/admin/festa-junina/eventos", description: "Cadastro e configuração das edições da Festa Junina." },
  { group: "Gestão", label: "Manuais e Ajuda", path: "/admin/festa-junina/ajuda", description: "Documentações, procedimentos e orientações de uso." },
  { group: "Evento", label: "Painel de Gestão", path: "/admin/festa-junina", description: "Visão de gestão do evento aberto." },
  { group: "Evento", label: "Simulações", path: "/admin/festa-junina/simulacao/capacidade", description: "Cenários conservador, provável e máximo para compras e equipe." },
  { group: "Operação", label: "Configuração Operacional", path: "/admin/festa-junina/operacao/configuracao", description: "Regras flexíveis de convites, mesas, pedidos, preparo, entrega, caixa e comprovantes." },
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
  { group: "Evento selecionado", label: "Voluntários", path: "/admin/festa-junina/voluntarios", description: "Cadastro de equipe voluntária." },
  { group: "Evento selecionado", label: "Funções", path: "/admin/festa-junina/voluntarios/funcoes", description: "Funções dos voluntários." },
  { group: "Evento selecionado", label: "Equipe", path: "/admin/festa-junina/voluntarios/necessidade", description: "Necessidade conforme cenários." },
  { group: "Evento selecionado", label: "Compras", path: "/admin/festa-junina/compras", description: "Lista de compras do evento." },
  { group: "Evento selecionado", label: "Insumos", path: "/admin/festa-junina/compras/insumos", description: "Insumos para preparo." },
  { group: "Evento selecionado", label: "Itens finais", path: "/admin/festa-junina/compras/itens-finais", description: "Produtos prontos para revenda." },
  { group: "Evento selecionado", label: "Treinamentos", path: "/admin/festa-junina/treinamento", description: "Treinamento e simulações." },
  { group: "Evento selecionado", label: "Materiais de treinamento", path: "/admin/festa-junina/treinamento/materiais", description: "Roteiros, textos de narração e mensagens de WhatsApp para clientes e voluntários." },
  { group: "Evento selecionado", label: "Playlist YouTube", path: "/admin/festa-junina/treinamento/playlist", description: "Cadastro da playlist e links dos vídeos/áudios publicados." },
  { group: "Evento selecionado", label: "Atendimento", path: "/admin/festa-junina/atendimento", description: "Atendimento no dia do evento." },
  { group: "Evento selecionado", label: "Check-in", path: "/admin/festa-junina/checkin", description: "Recepção e entrada." },
  { group: "Evento selecionado", label: "Pedidos", path: "/admin/festa-junina/atendimento/pedidos", description: "Pedidos de consumo no dia." },
  { group: "Evento selecionado", label: "Cancelados", path: "/admin/festa-junina/atendimento/cancelados", description: "Histórico de mesas/responsáveis e pedidos cancelados." },
  { group: "Evento selecionado", label: "Preparo", path: "/admin/festa-junina/preparo", description: "Fila e preparo." },
  { group: "Evento selecionado", label: "Retirada", path: "/admin/festa-junina/retirada", description: "Retirada no balcão." },
  { group: "Evento selecionado", label: "Entrega", path: "/admin/festa-junina/entrega", description: "Entrega ao cliente." },
  { group: "Evento selecionado", label: "Ocorrências", path: "/admin/festa-junina/ocorrencias", description: "Registro de ocorrências." },
  { group: "Evento selecionado", label: "Prestação de Contas", path: "/admin/festa-junina/prestacao-contas", description: "Fechamento e prestação de contas." },
  { group: "Evento selecionado", label: "Relatórios", path: "/admin/festa-junina/relatorios?modulo=prestacao", description: "Relatórios da prestação de contas." },
];

export const MENU_ROUTE_AUTO_VALUE = "__auto_template__";

export function getRouteLabel(path: string | null | undefined) {
  if (!path) return "Página automática pelo modelo";
  return MENU_ROUTE_OPTIONS.find((option) => option.path === path)?.label ?? path;
}
