export type TrainingAudience =
  | "clientes"
  | "garcons"
  | "caixa"
  | "cozinha"
  | "separacao_entrega"
  | "checkin"
  | "coordenacao"
  | "voluntarios";

export type TrainingStatus = "rascunho" | "revisar" | "aprovado" | "publicado" | "inativo";

export type TrainingMaterialTemplate = {
  training_key: string;
  audience: TrainingAudience;
  training_type: string;
  title: string;
  objective: string;
  script_text: string;
  voiceover_text: string;
  whatsapp_message: string;
  youtube_description: string;
  youtube_tags: string;
  sort_order: number;
};

export const TRAINING_AUDIENCE_LABELS: Record<TrainingAudience, string> = {
  clientes: "Clientes/convidados",
  garcons: "Garçons/atendimento",
  caixa: "Caixa",
  cozinha: "Cozinha/preparo",
  separacao_entrega: "Separação/entrega",
  checkin: "Check-in/entrada",
  coordenacao: "Coordenação",
  voluntarios: "Voluntários gerais",
};

export const TRAINING_STATUS_LABELS: Record<TrainingStatus, string> = {
  rascunho: "Rascunho",
  revisar: "Revisar",
  aprovado: "Aprovado",
  publicado: "Publicado",
  inativo: "Inativo",
};

export const TRAINING_STATUS_OPTIONS: Array<{ value: TrainingStatus; label: string }> = Object.entries(TRAINING_STATUS_LABELS).map(([value, label]) => ({
  value: value as TrainingStatus,
  label,
}));

export const TRAINING_AUDIENCE_OPTIONS: Array<{ value: TrainingAudience; label: string }> = Object.entries(TRAINING_AUDIENCE_LABELS).map(([value, label]) => ({
  value: value as TrainingAudience,
  label,
}));

export const DEFAULT_TRAINING_MATERIALS: TrainingMaterialTemplate[] = [
  {
    training_key: "cliente_guardar_codigo",
    audience: "clientes",
    training_type: "video_curto",
    title: "Cliente: como guardar o código da compra",
    objective: "Explicar como encontrar e guardar o código/QR Code para entrada e acompanhamento.",
    script_text:
      "1. Abra o link da Festa Junina. 2. Registre seu convite quando orientado pela coordenação. 3. Após enviar o comprovante, guarde o código da compra. 4. No dia da festa, apresente o código, QR Code ou convite impresso na entrada.",
    voiceover_text:
      "Oi! Para participar da Festa Junina do Tucxa com mais tranquilidade, guarde o código da sua compra. Ele ajuda na entrada, na conferência do pagamento e no acompanhamento das próximas etapas conforme a orientação da coordenação.",
    whatsapp_message:
      "Oi! Para facilitar sua entrada na Festa Junina do Tucxa, guarde o código/QR Code da compra. No dia, apresente o código, QR Code ou convite impresso conforme orientação da coordenação.",
    youtube_description:
      "Treinamento rápido para clientes da Festa Junina do Tucxa: como guardar o código da compra e usar no dia do evento.",
    youtube_tags: "Festa Junina Tucxa, convite, QR Code, cliente, treinamento",
    sort_order: 10,
  },
  {
    training_key: "cliente_cardapio_pedido",
    audience: "clientes",
    training_type: "video_curto",
    title: "Cliente: como usar o cardápio pelo celular",
    objective: "Mostrar como abrir o cardápio, buscar itens, montar pedido e acompanhar pagamento/retirada.",
    script_text:
      "1. Acesse o cardápio pelo QR Code da mesa ou link informado. 2. Busque por bebidas, comidas, doces ou bingo. 3. Adicione itens ao pedido. 4. Confira o total. 5. Pague conforme orientação e envie o comprovante quando solicitado.",
    voiceover_text:
      "No dia da festa, você pode consultar o cardápio pelo celular. Escolha os itens, confira o total e siga a forma de pagamento orientada pela equipe. Isso ajuda a reduzir filas e organizar melhor o atendimento.",
    whatsapp_message:
      "No dia da festa, use o cardápio pelo celular para escolher comidas, bebidas e itens disponíveis. Confira o total e envie o comprovante quando solicitado pela equipe.",
    youtube_description:
      "Treinamento rápido para usar o cardápio da Festa Junina do Tucxa pelo celular.",
    youtube_tags: "Festa Junina Tucxa, cardápio, pedido, celular, atendimento",
    sort_order: 20,
  },
  {
    training_key: "garcom_lancar_pedido",
    audience: "garcons",
    training_type: "video_curto",
    title: "Garçom: como lançar pedido por mesa ou cliente",
    objective: "Orientar o voluntário de atendimento a registrar pedidos no sistema quando essa operação for escolhida.",
    script_text:
      "1. Acesse a tela de cardápio de vendas. 2. Informe mesa, responsável ou cliente. 3. Adicione os itens pedidos. 4. Confirme o total. 5. Oriente sobre pagamento ou fechamento conforme a configuração operacional.",
    voiceover_text:
      "Garçom, antes de registrar o pedido, confirme a mesa ou o responsável. Depois selecione os itens, confira o total e siga a regra definida pela coordenação: pagamento por pedido ou fechamento no final.",
    whatsapp_message:
      "Treinamento do garçom: confirme mesa/responsável, lance os itens do pedido e siga a orientação de pagamento definida para o evento.",
    youtube_description:
      "Treinamento para garçons e atendimento da Festa Junina do Tucxa: como registrar pedidos no sistema.",
    youtube_tags: "Festa Junina Tucxa, garçom, pedido, mesa, atendimento",
    sort_order: 30,
  },
  {
    training_key: "caixa_registrar_pagamento",
    audience: "caixa",
    training_type: "video_curto",
    title: "Caixa: como conferir pagamento e comprovante",
    objective: "Orientar o caixa a registrar Pix, cartão, dinheiro, divisão de pagamento e comprovantes.",
    script_text:
      "1. Abra o pedido ou fechamento. 2. Confira o total. 3. Selecione a forma de pagamento. 4. Registre valores pagos por cada pessoa, se houver divisão. 5. Anexe comprovante ou recibo quando obrigatório. 6. Confirme o pagamento.",
    voiceover_text:
      "No caixa, confira o valor total antes de confirmar. O pagamento pode ser por Pix, cartão, dinheiro ou dividido entre pessoas, conforme a regra do evento. Anexe o comprovante quando for obrigatório.",
    whatsapp_message:
      "Treinamento do caixa: confira total, forma de pagamento, comprovante/recibo e só depois confirme o pagamento no sistema.",
    youtube_description:
      "Treinamento para caixa da Festa Junina do Tucxa: pagamentos, comprovantes e divisão de valores.",
    youtube_tags: "Festa Junina Tucxa, caixa, Pix, comprovante, pagamento",
    sort_order: 40,
  },
  {
    training_key: "cozinha_preparo_status",
    audience: "cozinha",
    training_type: "video_curto",
    title: "Cozinha: como sinalizar preparo",
    objective: "Orientar cozinha/preparo a sinalizar início e término quando essa regra for usada.",
    script_text:
      "1. Abra a fila de preparo. 2. Verifique o pedido e os itens. 3. Sinalize início do preparo se a coordenação exigir. 4. Ao terminar, marque como pronto para separação ou retirada.",
    voiceover_text:
      "Na cozinha, acompanhe a fila de pedidos. Quando a operação exigir, marque o início do preparo e, ao finalizar, sinalize que o pedido está pronto. Isso ajuda entrega, retirada e caixa a trabalharem com mais organização.",
    whatsapp_message:
      "Treinamento da cozinha: acompanhe a fila, sinalize início quando necessário e marque o pedido como pronto ao finalizar.",
    youtube_description:
      "Treinamento para cozinha e preparo da Festa Junina do Tucxa.",
    youtube_tags: "Festa Junina Tucxa, cozinha, preparo, pedido, voluntários",
    sort_order: 50,
  },
  {
    training_key: "entrega_retirada_confirmacao",
    audience: "separacao_entrega",
    training_type: "video_curto",
    title: "Entrega/retirada: como confirmar pedido entregue",
    objective: "Orientar separação/entrega a marcar pedidos prontos e entregues conforme o fluxo escolhido.",
    script_text:
      "1. Abra a tela de entrega ou retirada. 2. Confira número do pedido, nome e mesa. 3. Entregue ao garçom ou ao cliente. 4. Registre a entrega quando a coordenação definir essa confirmação como necessária.",
    voiceover_text:
      "Na entrega ou retirada, confira sempre número do pedido, nome e mesa. Depois confirme no sistema quando essa etapa estiver habilitada. Isso evita duplicidade e ajuda a prestação de contas.",
    whatsapp_message:
      "Treinamento de entrega/retirada: confira pedido, nome e mesa antes de entregar e confirme no sistema quando solicitado.",
    youtube_description:
      "Treinamento para separação, entrega e retirada de pedidos da Festa Junina do Tucxa.",
    youtube_tags: "Festa Junina Tucxa, entrega, retirada, pedido pronto, voluntários",
    sort_order: 60,
  },
  {
    training_key: "coordenacao_config_operacional",
    audience: "coordenacao",
    training_type: "video_curto",
    title: "Coordenação: como configurar a operação do evento",
    objective: "Mostrar que a coordenação pode escolher como convites, pedidos, mesas, preparo, entrega e pagamentos funcionarão.",
    script_text:
      "1. Abra Configuração Operacional. 2. Defina se vendas serão pelo sistema, manual ou planilha. 3. Escolha QR Code por evento, mesa ou convidado. 4. Defina quem lança pedidos. 5. Configure preparo, separação, entrega, caixa e comprovantes.",
    voiceover_text:
      "A Configuração Operacional permite escolher como a Festa Junina vai funcionar na prática. O sistema não obriga um fluxo único: a coordenação decide o que usar em cada evento.",
    whatsapp_message:
      "Treinamento da coordenação: use Configuração Operacional para definir vendas, QR Codes, mesas, pedidos, preparo, entrega, caixa e comprovantes.",
    youtube_description:
      "Treinamento para coordenação: configuração operacional flexível do sistema da Festa Junina do Tucxa.",
    youtube_tags: "Festa Junina Tucxa, coordenação, operação, configuração, sistema",
    sort_order: 70,
  },
];
