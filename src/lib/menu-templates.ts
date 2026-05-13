export type MenuTemplateKey =
  | "preparation"
  | "simple_registry"
  | "module_config"
  | "list_new"
  | "checklist"
  | "report_bi"
  | "operation"
  | "help";

export type MenuTemplate = {
  key: MenuTemplateKey;
  label: string;
  description: string;
};

export const MENU_TEMPLATES: MenuTemplate[] = [
  {
    key: "preparation",
    label: "Página em preparação",
    description: "Mostra objetivo, próximos passos e indica que o módulo ainda será detalhado.",
  },
  {
    key: "simple_registry",
    label: "Cadastro simples",
    description: "Indicado para listas de itens, responsáveis ou informações básicas.",
  },
  {
    key: "module_config",
    label: "Configuração do módulo",
    description: "Indicado para módulos que precisam de parâmetros antes de entrar em uso.",
  },
  {
    key: "list_new",
    label: "Lista + novo cadastro",
    description: "Mostra uma lista e orienta a criação do primeiro registro quando não houver dados.",
  },
  {
    key: "checklist",
    label: "Checklist",
    description: "Indicado para etapas, pendências e confirmações operacionais.",
  },
  {
    key: "report_bi",
    label: "Relatório/BI",
    description: "Indicado para relatórios configuráveis e seleção de campos.",
  },
  {
    key: "operation",
    label: "Atendimento/operacional",
    description: "Indicado para telas do dia do evento: check-in, pedidos, entrega, caixa e ocorrências.",
  },
  {
    key: "help",
    label: "Manual/ajuda",
    description: "Indicado para orientações, materiais de apoio e treinamento.",
  },
];

export function getMenuTemplate(key: string | null | undefined) {
  return MENU_TEMPLATES.find((template) => template.key === key) ?? MENU_TEMPLATES[0];
}
