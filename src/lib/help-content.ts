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
    description: "Esta é a página pública para registrar convite, combo, forma de pagamento e comprovante.",
    sections: [
      {
        title: "Passo a passo",
        body: "Escolha convite ou combo, confira o total, faça o pagamento conforme a opção escolhida e anexe o comprovante/registro.",
        bullets: ["O WhatsApp é obrigatório para contato.", "O e-mail é opcional, mas ajuda a receber o código automaticamente.", "Guarde o código gerado ao final da compra."],
      },
      {
        title: "Indicação",
        body: "Depois da compra, você pode compartilhar seu link de indicação. Compras confirmadas com seu código podem gerar brindes configurados pela organização.",
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
    title: "Painel principal",
    description: "Ponto de partida do administrador. Use os cards ou o menu lateral para configurar e acompanhar a festa.",
    sections: [
      {
        title: "Ordem recomendada",
        body: "Comece por Configurações, Convites, Combos, Pagamentos, Cardápio/Ficha Técnica, Planejamento, Voluntários e Checklist.",
      },
      {
        title: "Validação com a equipe",
        body: "Use o sistema como ambiente de familiarização. Tudo foi feito para ser configurável e ajustável pela organização.",
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
    description: "Monte ofertas com convite, comida, bebida, cartelas de bingo ou brindes.",
    sections: [
      {
        title: "Por que usar combos",
        body: "Combos ajudam o comprador a ter mais praticidade e ajudam a organização a prever compras e operação.",
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
};

export function getHelpContent(pathname: string): HelpContent {
  const normalized = pathname.replace(/\/$/, "") || "/";

  if (helpByKey[normalized]) return helpByKey[normalized];

  if (normalized.startsWith("/minha-compra/")) return helpByKey["/minha-compra"];
  if (normalized.startsWith("/admin/festa-junina/pedidos/")) return helpByKey["/admin/festa-junina/pedidos"];
  if (normalized.startsWith("/admin/festa-junina/cardapio/")) return helpByKey["/admin/festa-junina/cardapio"];
  if (normalized.startsWith("/admin/festa-junina/upsell/envios")) return helpByKey["/admin/festa-junina/upsell/envios"];
  if (normalized.startsWith("/admin/festa-junina/upsell")) return helpByKey["/admin/festa-junina/upsell"];
  if (normalized.startsWith("/admin/festa-junina")) return helpByKey["/admin/festa-junina"];

  return defaultHelp;
}

export const helpManualSections = Object.entries(helpByKey).map(([path, content]) => ({ path, ...content }));
