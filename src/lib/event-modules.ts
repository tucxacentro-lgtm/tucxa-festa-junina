import type { LucideIcon } from "lucide-react";
import { ClipboardCheck, CreditCard, GraduationCap, HandCoins, ListChecks, Settings, ShoppingCart, Ticket, UsersRound, Utensils, Warehouse } from "lucide-react";

export type EventModuleKey =
  | "configuracao"
  | "vendas_ingressos"
  | "planejamento"
  | "compras"
  | "treinamento"
  | "simulacao"
  | "operacao_execucao"
  | "prestacao_contas"
  | "cardapio_ficha_tecnica"
  | "voluntarios"
  | "atendimento_caixa";

export type EventModuleStatus = "not_used" | "suggested" | "configuring" | "in_use" | "done";

export type EventModuleDefinition = {
  key: EventModuleKey;
  title: string;
  group: string;
  description: string;
  href: string;
  icon: LucideIcon;
  sortOrder: number;
};

export const EVENT_MODULES: EventModuleDefinition[] = [
  {
    key: "configuracao",
    title: "Configuração",
    group: "Base do evento",
    description: "Evento, data, horário, local, Pix, regras gerais e módulos habilitados.",
    href: "/admin/festa-junina/configuracoes",
    icon: Settings,
    sortOrder: 10,
  },
  {
    key: "vendas_ingressos",
    title: "Vendas de ingressos",
    group: "Base do evento",
    description: "Tipos de ingresso, compradores, comprovantes, QR Code e bingo da Air Fryer.",
    href: "/admin/festa-junina/convites",
    icon: Ticket,
    sortOrder: 20,
  },
  {
    key: "planejamento",
    title: "Planejamento",
    group: "Preparação",
    description: "Público estimado, equipe, funções, cardápio, atendimento, compras e margem de segurança.",
    href: "/admin/festa-junina/planejamento",
    icon: ClipboardCheck,
    sortOrder: 30,
  },
  {
    key: "compras",
    title: "Compras",
    group: "Preparação",
    description: "Lista do que comprar, responsáveis, status, local de armazenamento e conferência.",
    href: "/admin/festa-junina/operacao",
    icon: ShoppingCart,
    sortOrder: 40,
  },
  {
    key: "treinamento",
    title: "Treinamento",
    group: "Preparação",
    description: "Orientações para coordenadores, voluntários, atendimento, caixa e operação.",
    href: "/admin/festa-junina/checklist",
    icon: GraduationCap,
    sortOrder: 50,
  },
  {
    key: "simulacao",
    title: "Simulação",
    group: "Preparação",
    description: "Testes antes da festa: venda, QR Code, comprovante, atendimento, caixa e relatórios.",
    href: "/admin/festa-junina/operacao",
    icon: ListChecks,
    sortOrder: 60,
  },
  {
    key: "operacao_execucao",
    title: "Operação/Execução",
    group: "Dia do evento",
    description: "Check-in, atendimento, pedidos, entrega, pagamento, caixa e ocorrências no dia.",
    href: "/admin/festa-junina/operacao",
    icon: Warehouse,
    sortOrder: 70,
  },
  {
    key: "prestacao_contas",
    title: "Prestação de contas",
    group: "Pós-evento",
    description: "Resumo financeiro, vendas por forma de pagamento, sobras e relatório final.",
    href: "/admin/festa-junina/pedidos",
    icon: HandCoins,
    sortOrder: 80,
  },
  {
    key: "cardapio_ficha_tecnica",
    title: "Cardápio e ficha técnica",
    group: "Preparação",
    description: "Itens, preços, consumo por pessoa, modo de preparo e insumos.",
    href: "/admin/festa-junina/cardapio",
    icon: Utensils,
    sortOrder: 90,
  },
  {
    key: "voluntarios",
    title: "Voluntários",
    group: "Preparação",
    description: "Equipe, funções, disponibilidade e sugestão por público confirmado/provável.",
    href: "/admin/festa-junina/voluntarios",
    icon: UsersRound,
    sortOrder: 100,
  },
  {
    key: "atendimento_caixa",
    title: "Atendimento e caixa",
    group: "Dia do evento",
    description: "Módulo futuro para mesas, pedidos, entrega, pagamento por mesa e fechamento.",
    href: "/admin/festa-junina/operacao",
    icon: CreditCard,
    sortOrder: 110,
  },
];

export const MODULE_STATUS_LABELS: Record<EventModuleStatus, string> = {
  not_used: "Não usado neste evento",
  suggested: "Sugestão",
  configuring: "Em configuração",
  in_use: "Em uso",
  done: "Concluído",
};

export function getEventModuleDefinition(key: string) {
  return EVENT_MODULES.find((module) => module.key === key);
}
