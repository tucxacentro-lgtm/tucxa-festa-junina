export type HelpSection = {
  title: string;
  body: string;
  bullets?: string[];
};

export type HelpContent = {
  title: string;
  description: string;
  sections: HelpSection[];
};

const defaultHelp: HelpContent = {
  title: "Ajuda do sistema",
  description: "Use esta orientação para entender a tela atual e executar o próximo passo com segurança.",
  sections: [
    {
      title: "Como usar",
      body: "Navegue pelas opções, confira os dados antes de salvar e use o menu para voltar ao painel principal quando precisar.",
      bullets: ["Campos e mensagens podem ser ajustados pela organização.", "Em caso de dúvida, valide com a coordenação antes de confirmar."],
    },
  ],
};

const helpByKey: Record<string, HelpContent> = {
  "/festa-junina": {
    title: "Como comprar o convite",
    description: "Esta é a página pública para garantir convite, anexar comprovante, consultar compra e, quando disponíveis, usar combos e indicação.",
    sections: [
      {
        title: "Passo a passo",
        body: "Escolha o convite, confira o total, faça o pagamento conforme a opção escolhida e anexe o comprovante/registro. Combos e indicação podem aparecer quando estiverem disponíveis para o evento.",
        bullets: ["O WhatsApp é obrigatório para contato.", "O e-mail é opcional, mas ajuda a receber o código automaticamente.", "Guarde o código gerado ao final da compra.", "Comprar antecipadamente ajuda o Tucxa a planejar alimentos, bebidas, voluntários, mesas e atendimento com mais conforto, menos fila e mais organização."],
      },
      {
        title: "Indicação",
        body: "Depois da compra, você pode compartilhar seu link de indicação quando a organização habilitar esta opção. Compras confirmadas com seu código podem gerar brindes configurados pela organização.",
      },
    ],
  },
  "/minha-compra": {
    title: "Minha compra",
    description: "Consulte o código, QR Code, status do pagamento e link de indicação.",
    sections: [
      {
        title: "Entrada na festa",
        body: "Apresente o código ou QR Code na entrada quando solicitado. O status do pagamento também aparece nesta tela.",
      },
      {
        title: "Compartilhar indicação",
        body: "Use o link de indicação para convidar outras pessoas. Se elas comprarem e pagarem usando seu código, os brindes aparecerão nesta área.",
      },
    ],
  },
  "/admin/festa-junina": {
    title: "Painel de Gestão",
    description: "Ponto de partida do gestor. Use os cards ou o menu lateral para configurar e acompanhar a festa.",
    sections: [
      {
        title: "Ordem recomendada",
        body: "Comece por Eventos e Módulos. Depois configure Convites, Pagamentos, Planejamento, Cardápio/Ficha Técnica, Voluntários e Checklist conforme a decisão da coordenação.",
      },
      {
        title: "Validação com a equipe",
        body: "Use o sistema como ambiente de familiarização. Tudo foi feito para ser configurável e ajustável pela organização.",
      },
    ],
  },
  "/admin/festa-junina/eventos": {
    title: "Eventos",
    description: "Cadastre cada edição anual da Festa Junina do Tucxa e defina o evento ativo.",
    sections: [
      {
        title: "Multi-evento",
        body: "Cada ano terá seu próprio evento, com convites, planejamento, compras, voluntários, checklist e prestação de contas separados.",
      },
    ],
  },
  "/admin/festa-junina/modulos": {
    title: "Módulos do evento",
    description: "Defina quais funcionalidades serão usadas neste evento e o status de cada uma.",
    sections: [
      {
        title: "Módulos independentes",
        body: "Você pode usar uma funcionalidade mesmo que a anterior não seja usada. Exemplo: usar planejamento com vendas manuais mesmo sem registrar todos os convites no sistema.",
      },
      {
        title: "Status recomendado",
        body: "Use Não usado, Sugestão, Em configuração, Em uso e Concluído para guiar a coordenação e os voluntários.",
      },
    ],
  },

  "/admin/festa-junina/menu": {
    title: "Cadastro do menu",
    description: "Configure os itens do menu lateral, a hierarquia, a sequência, a página associada e o status de uso em cada evento.",
    sections: [
      {
        title: "Como organizar",
        body: "Todos os itens ativos do catálogo aparecem para todos os eventos. Use Editar para alterar nome, item pai/indentação, ordem, rota/página associada e template padrão. O ícone ☰ indica a estrutura visual e pode evoluir para arrastar e soltar futuramente.",
      },
      {
        title: "Novos itens",
        body: "Use o botão Novo item para criar novas opções no menu, ou Novo filho para criar uma opção dentro de outra. O formulário abre em janela/modal para manter a tela limpa. Se o item ainda não tiver rota própria, escolha um template padrão para abrir uma página inicial de configuração.",
      },
      {
        title: "Status por evento",
        body: "O status Não usado, Sugestão, Em configuração, Em uso ou Concluído orienta a operação, mas não esconde o item do menu. Assim a equipe consegue visualizar tudo que o sistema pode oferecer.",
      },
    ],
  },
  "/admin/festa-junina/pedidos": {
    title: "Compras e comprovantes",
    description: "Acompanhe as reservas, confira comprovantes e aprove ou reprove pagamentos.",
    sections: [
      {
        title: "Fluxo de validação",
        body: "Abra uma compra, veja o comprovante, confirme os dados e aprove ou reprove. O comprador e os e-mails operacionais recebem orientações conforme a ação.",
      },
      {
        title: "Atenção",
        body: "Compras sem e-mail continuam válidas. O Tucxa recebe uma cópia operacional com mensagem pronta para WhatsApp.",
      },
    ],
  },
  "/admin/festa-junina/configuracoes": {
    title: "Configurações do evento",
    description: "Edite data, horário, local, Pix, status e regras principais da página pública.",
    sections: [
      {
        title: "Impacto público",
        body: "O que for salvo aqui aparece para o comprador. Confira Pix, data, horário e status antes de divulgar o link.",
      },
    ],
  },
  "/admin/festa-junina/convites": {
    title: "Convites",
    description: "Cadastre tipos de convite, valores, gratuidade e disponibilidade.",
    sections: [
      {
        title: "Convite impresso continua válido",
        body: "Mesmo com convites impressos, registrar vendas no sistema ajuda a controlar compradores, comprovantes, planejamento de compras e prestação de contas.",
      },
    ],
  },
  "/admin/festa-junina/combos": {
    title: "Combos e ofertas",
    description: "Monte ofertas com convite, comida, bebida, cartelas de bingo ou brindes quando este módulo estiver disponível para o evento.",
    sections: [
      {
        title: "Por que usar combos",
        body: "Combos ajudam o comprador a ter mais praticidade e ajudam a organização a prever compras e operação. Neste evento de 2026, a organização optou por vender apenas ingressos individuais.",
      },
    ],
  },
  "/admin/festa-junina/pagamentos": {
    title: "Formas de pagamento",
    description: "Configure Pix, pagamento com responsável, cartão, dinheiro, cortesia e instruções.",
    sections: [
      {
        title: "Comprovante obrigatório",
        body: "Mesmo quando o pagamento for feito com responsável, peça foto do recibo ou registro para manter rastreabilidade.",
      },
    ],
  },
  "/admin/festa-junina/indicacoes": {
    title: "Indicações e brindes",
    description: "Configure regras para quem compartilha o link e gera novas compras pagas.",
    sections: [
      {
        title: "Critério recomendado",
        body: "Conte apenas compras com pagamento aprovado para liberar brindes. Isso evita conflito e facilita conferência.",
      },
    ],
  },
  "/admin/festa-junina/planejamento": {
    title: "Planejamento de compras e operação",
    description: "Veja sugestões por participantes confirmados, pendentes, cardápio, ficha técnica e insumos.",
    sections: [
      {
        title: "Como interpretar",
        body: "Use base aprovada para uma compra conservadora e base provável para considerar comprovantes enviados e reservas pendentes.",
      },
      {
        title: "Ajuste manual",
        body: "As quantidades são sugestões. A coordenação deve validar e ajustar conforme histórico, orçamento, estoque e doações.",
      },
    ],
  },
  "/admin/festa-junina/cardapio": {
    title: "Cardápio e ficha técnica",
    description: "Cadastre itens, categorias, preços, consumo por pessoa e insumos de preparo.",
    sections: [
      {
        title: "Ficha técnica",
        body: "Para itens que precisam de preparo, cadastre ingredientes, quantidades e modo de preparo. Esses dados alimentam o planejamento.",
      },
    ],
  },
  "/admin/festa-junina/voluntarios": {
    title: "Voluntários",
    description: "Cadastre pessoas, funções, WhatsApp e disponibilidade.",
    sections: [
      {
        title: "Papéis recomendados",
        body: "Organização/compras, preparo, atendimento, caixa, entrega/retirada, coordenação e apoio geral.",
      },
    ],
  },
  "/admin/festa-junina/checklist": {
    title: "Checklist operacional",
    description: "Acompanhe o que está pendente, sugerido, em andamento ou confirmado.",
    sections: [
      {
        title: "Uso no alinhamento",
        body: "Revise este checklist com a coordenação antes do evento e atualize o status de cada item.",
      },
    ],
  },

  "/admin/festa-junina/operacao/configuracao": {
    title: "Configuração Operacional",
    description: "Defina como a operação da festa funcionará antes e durante o evento, sem obrigar a coordenação a usar um fluxo único.",
    sections: [
      {
        title: "Flexibilidade por evento",
        body: "Use esta tela para escolher se as vendas serão registradas pelo sistema, por planilha, por quantidade manual ou de forma mista. Também defina QR Codes, mesas, pedidos, preparo, entrega, caixa e comprovantes.",
      },
      {
        title: "Pedidos e cardápio",
        body: "O cardápio pode ser acessado por QR Code único, por mesa ou por convidado. Os pedidos podem ser feitos pelo convidado, garçom, caixa ou lançados depois a partir de comanda em papel.",
      },
      {
        title: "Caixa e comprovantes",
        body: "Configure pagamento por pedido ou fechamento final por mesa/responsável. Quando necessário, permita dividir o total entre várias pessoas e exigir upload de comprovante ou recibo.",
      },
    ],
  },
  "/admin/festa-junina/operacao": {
    title: "Operação e simulação",
    description: "Registre locais de armazenamento, responsáveis e testes práticos antes da festa.",
    sections: [
      {
        title: "Simulações importantes",
        body: "Teste compra, comprovante, aprovação, QR Code de entrada, atendimento, caixa e pagamento antes do dia do evento.",
      },
    ],
  },
  "/admin/festa-junina/upsell": {
    title: "Upsell e mensagens",
    description: "Configure mensagens para complementar compra com combos, comida, bebida e bingo.",
    sections: [
      {
        title: "Mensagem recomendada",
        body: "A abordagem deve reforçar praticidade, menos fila, melhor experiência e ajuda no planejamento da festa, não apenas “comprar mais”.",
      },
    ],
  },
  "/admin/festa-junina/upsell/envios": {
    title: "Envios de upsell",
    description: "Gere mensagens prontas para WhatsApp ou e-mail conforme o histórico de compras.",
    sections: [
      {
        title: "WhatsApp sem custo",
        body: "O sistema gera a mensagem pronta. Um voluntário copia e envia manualmente pelo WhatsApp.",
      },
    ],
  },

  "/admin/festa-junina/relatorios": {
    title: "Relatórios e BI",
    description: "Área planejada para selecionar campos, montar visões e apoiar prestação de contas.",
    sections: [
      {
        title: "Uso esperado",
        body: "A ideia é permitir relatórios por vendas, pagamentos, convites, público, cardápio, operação e prestação de contas. Nesta etapa, a tela funciona como preparação do módulo.",
      },
    ],
  },
  "/admin/festa-junina/cliente-resumo": {
    title: "Versão resumida para clientes",
    description: "Área planejada para gerar uma versão simples do cardápio/comunicados para o público.",
    sections: [{ title: "Objetivo", body: "Facilitar a comunicação com clientes, com informações resumidas e objetivas sobre o evento." }],
  },
  "/admin/festa-junina/bingo": {
    title: "Cartelas de Bingo",
    description: "Área planejada para organizar cartelas, regras e relação com brindes do evento.",
    sections: [{ title: "2026", body: "Cada ingresso do evento concorre a uma linda Air Fryer por meio do bingo/sorteio definido pela organização." }],
  },
  "/admin/festa-junina/atendimento": {
    title: "Atendimento no dia do evento",
    description: "Agrupador das etapas de operação: check-in, pedidos, preparo, retirada, entrega e ocorrências.",
    sections: [{ title: "Como usar", body: "Use os itens internos do menu para abrir cada etapa da operação. Garçom e Caixa ficam fora do login, em Gestão do Evento." }],
  },
  "/admin/festa-junina/checkin": {
    title: "Check-in",
    description: "Conferência de código/QR Code, convite impresso ou lista manual na entrada.",
    sections: [{ title: "Entrada", body: "Busque por código, nome ou WhatsApp. Depois registre a entrada e observações quando necessário." }],
  },
  "/admin/festa-junina/atendimento/pedidos": {
    title: "Pedidos de consumo",
    description: "Visão geral dos pedidos do cardápio durante o evento.",
    sections: [{ title: "Acompanhamento", body: "Veja mesa, responsável, itens, total, status de preparo, entrega e pagamento." }],
  },
  "/admin/festa-junina/atendimento/cancelados": {
    title: "Cancelados",
    description: "Histórico logado de mesas, responsáveis e pedidos cancelados na operação.",
    sections: [
      { title: "Uso", body: "Quando uma mesa/responsável ou pedido for cancelado na operação, ele deixa de aparecer para Garçom/Atendimento e Caixa e fica disponível aqui para conferência." },
      { title: "Restauração", body: "Se o cancelamento foi feito por engano, a coordenação pode restaurar o pedido para que ele volte à operação." },
    ],
  },
  "/admin/festa-junina/preparo": {
    title: "Preparo",
    description: "Fila da cozinha/preparo para pedidos recebidos ou em preparo.",
    sections: [{ title: "Cozinha", body: "Marque o pedido como em preparo e depois como pronto para retirada ou entrega." }],
  },
  "/admin/festa-junina/retirada": {
    title: "Retirada",
    description: "Pedidos prontos aguardando retirada pelo cliente ou responsável.",
    sections: [{ title: "Balcão", body: "Confira número do pedido, cliente e mesa antes de confirmar a retirada." }],
  },
  "/admin/festa-junina/prestacao-contas": {
    title: "Prestação de contas",
    description: "Área planejada para consolidar vendas, pagamentos, compras, sobras e observações finais.",
    sections: [{ title: "Objetivo", body: "Apoiar transparência e melhorar o planejamento dos próximos eventos." }],
  },

  "/admin/festa-junina/simulacao/capacidade": {
    title: "Simulações",
    description: "Compare cenários conservador, provável e máximo para apoiar compras, equipe e operação.",
    sections: [{ title: "Cenários", body: "Use conservador para confirmados, provável para confirmados + estimativas e máximo para capacidade operacional planejada." }],
  },
  "/admin/festa-junina/compras": {
    title: "Compras",
    description: "Acompanhe itens finais, insumos, responsáveis, status e armazenamento.",
    sections: [{ title: "Validação", body: "As quantidades sugeridas devem ser confirmadas pela coordenação antes da compra." }],
  },
  "/admin/festa-junina/compras/insumos": {
    title: "Insumos",
    description: "Itens necessários para preparo das receitas e operação de cozinha.",
    sections: [{ title: "Ficha técnica", body: "Os insumos são calculados a partir do cardápio de preparo e dos cenários de público." }],
  },
  "/admin/festa-junina/compras/itens-finais": {
    title: "Itens finais",
    description: "Produtos comprados prontos para revenda ou consumo direto.",
    sections: [{ title: "Conferência", body: "Registre quantidade planejada, comprada, responsável e local de armazenamento." }],
  },
  "/admin/festa-junina/treinamento": {
    title: "Materiais de treinamento",
    description: "Gere roteiros curtos para clientes e voluntários, cadastre mensagens de WhatsApp e organize links da playlist de vídeos ou áudios.",
    sections: [
      {
        title: "Como usar",
        body: "Clique em Gerar roteiros padrão para criar a primeira lista de treinamentos. Depois edite cada roteiro, grave o vídeo ou áudio em uma ferramenta gratuita e cadastre o link do YouTube.",
        bullets: ["Use vídeos curtos, de 30 a 90 segundos.", "Separe os treinamentos por público: cliente, garçom, caixa, cozinha, entrega e coordenação.", "Para WhatsApp, use as mensagens prontas e copie/cole manualmente para não ter custo com API."],
      },
      {
        title: "Fluxo recomendado",
        body: "O sistema gera roteiro, texto para narração, descrição do YouTube, tags e mensagem de WhatsApp. A coordenação grava e publica manualmente, depois cadastra o link.",
      },
    ],
  },
  "/admin/festa-junina/treinamento/materiais": {
    title: "Roteiros de treinamento",
    description: "Cadastre e edite roteiros de vídeos ou áudios curtos para orientar clientes e voluntários.",
    sections: [
      {
        title: "Campos principais",
        body: "O roteiro tem título, público, objetivo, passo a passo, texto para narração, mensagem de WhatsApp, descrição do YouTube e link do vídeo publicado.",
      },
    ],
  },
  "/admin/festa-junina/treinamento/playlist": {
    title: "Playlist YouTube",
    description: "Organize a playlist oficial de treinamentos da Festa Junina do Tucxa.",
    sections: [
      {
        title: "Publicação",
        body: "Depois de gravar e publicar manualmente os vídeos ou áudios no YouTube, cadastre o link da playlist e os links individuais nos roteiros.",
      },
    ],
  },
  "/admin/festa-junina/caixa": {
    title: "Caixa",
    description: "Área de preparação para pagamentos e fechamento do caixa do evento.",
    sections: [{ title: "Pagamento", body: "Conferir Pix, cartão, dinheiro, comprovantes e totais por responsável/mesa." }],
  },
  "/admin/festa-junina/entrega": {
    title: "Entrega",
    description: "Área de preparação para retirada e entrega de pedidos ao cliente ou garçom.",
    sections: [{ title: "Confirmação", body: "Cada entrega deve ter confirmação para evitar divergências no caixa e na prestação de contas." }],
  },
  "/admin/festa-junina/ocorrencias": {
    title: "Ocorrências",
    description: "Registre problemas, ajustes e decisões durante a operação do evento.",
    sections: [{ title: "Uso", body: "Ajuda a melhorar a prestação de contas e o planejamento dos próximos anos." }],
  },
};

export function getHelpContent(pathname: string): HelpContent {
  const normalized = pathname.replace(/\/$/, "") || "/";

  if (helpByKey[normalized]) return helpByKey[normalized];

  if (normalized.startsWith("/minha-compra/")) return helpByKey["/minha-compra"];
  if (normalized.startsWith("/admin/festa-junina/eventos")) return helpByKey["/admin/festa-junina/eventos"];
  if (normalized.startsWith("/admin/festa-junina/modulos")) return helpByKey["/admin/festa-junina/modulos"];
  if (normalized.startsWith("/admin/festa-junina/menu")) return helpByKey["/admin/festa-junina/menu"];
  if (normalized.startsWith("/admin/festa-junina/pedidos/")) return helpByKey["/admin/festa-junina/pedidos"];
  if (normalized.startsWith("/admin/festa-junina/cardapio/")) return helpByKey["/admin/festa-junina/cardapio"];
  if (normalized.startsWith("/admin/festa-junina/treinamento/materiais")) return helpByKey["/admin/festa-junina/treinamento/materiais"];
  if (normalized.startsWith("/admin/festa-junina/treinamento/playlist")) return helpByKey["/admin/festa-junina/treinamento/playlist"];
  if (normalized.startsWith("/admin/festa-junina/treinamento")) return helpByKey["/admin/festa-junina/treinamento"];
  if (normalized.startsWith("/admin/festa-junina/upsell/envios")) return helpByKey["/admin/festa-junina/upsell/envios"];
  if (normalized.startsWith("/admin/festa-junina/upsell")) return helpByKey["/admin/festa-junina/upsell"];
  if (normalized.startsWith("/admin/festa-junina/relatorios")) return helpByKey["/admin/festa-junina/relatorios"];
  if (normalized.startsWith("/admin/festa-junina/cliente-resumo")) return helpByKey["/admin/festa-junina/cliente-resumo"];
  if (normalized.startsWith("/admin/festa-junina/bingo")) return helpByKey["/admin/festa-junina/bingo"];
  if (normalized.startsWith("/admin/festa-junina/checkin")) return helpByKey["/admin/festa-junina/checkin"];
  if (normalized.startsWith("/admin/festa-junina/atendimento/cancelados")) return helpByKey["/admin/festa-junina/atendimento/cancelados"];
  if (normalized.startsWith("/admin/festa-junina/atendimento/pedidos")) return helpByKey["/admin/festa-junina/atendimento/pedidos"];
  if (normalized.startsWith("/admin/festa-junina/preparo")) return helpByKey["/admin/festa-junina/preparo"];
  if (normalized.startsWith("/admin/festa-junina/retirada")) return helpByKey["/admin/festa-junina/retirada"];
  if (normalized.startsWith("/admin/festa-junina/entrega")) return helpByKey["/admin/festa-junina/entrega"];
  if (normalized.startsWith("/admin/festa-junina/ocorrencias")) return helpByKey["/admin/festa-junina/ocorrencias"];
  if (normalized.startsWith("/admin/festa-junina/atendimento")) return helpByKey["/admin/festa-junina/atendimento"];
  if (normalized.startsWith("/admin/festa-junina/prestacao-contas")) return helpByKey["/admin/festa-junina/prestacao-contas"];
  if (normalized.startsWith("/admin/festa-junina")) return helpByKey["/admin/festa-junina"];

  return defaultHelp;
}

const HELP_MANUAL_ORDER = [
  "/festa-junina",
  "/minha-compra",
  "/admin/festa-junina",
  "/admin/festa-junina/menu",
  "/admin/festa-junina/eventos",
  "/admin/festa-junina/ajuda",
  "/admin/festa-junina/simulacao/capacidade",
  "/admin/festa-junina/convites",
  "/admin/festa-junina/combos",
  "/admin/festa-junina/indicacoes",
  "/admin/festa-junina/upsell",
  "/admin/festa-junina/pagamentos",
  "/admin/festa-junina/pedidos",
  "/admin/festa-junina/relatorios",
  "/admin/festa-junina/cardapio",
  "/admin/festa-junina/cliente-resumo",
  "/admin/festa-junina/bingo",
  "/admin/festa-junina/voluntarios",
  "/admin/festa-junina/compras",
  "/admin/festa-junina/compras/insumos",
  "/admin/festa-junina/compras/itens-finais",
  "/admin/festa-junina/treinamento",
  "/admin/festa-junina/treinamento/materiais",
  "/admin/festa-junina/treinamento/playlist",
  "/admin/festa-junina/atendimento",
  "/admin/festa-junina/checkin",
  "/admin/festa-junina/atendimento/pedidos",
  "/admin/festa-junina/atendimento/cancelados",
  "/admin/festa-junina/preparo",
  "/admin/festa-junina/retirada",
  "/admin/festa-junina/entrega",
  "/admin/festa-junina/ocorrencias",
  "/admin/festa-junina/prestacao-contas",
];

export const helpManualSections = HELP_MANUAL_ORDER
  .filter((path) => helpByKey[path])
  .map((path) => ({ path, ...helpByKey[path] }));


// Nota: o cadastro do evento agora inclui estrutura do local, capacidade e recursos do Espaço Santa Fé. O cadastro do menu é configurável: título, hierarquia, ordem, página vinculada e template automático.

// Atualização: o cardápio agora separa vendas/consumo e preparo/ficha técnica. A simulação usa cenários conservador, provável e máximo.
