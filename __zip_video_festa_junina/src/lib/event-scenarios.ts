import type { EventConfig } from "@/types/festa-junina";

export type ScenarioKey = "conservative" | "probable" | "maximum";

export type Scenario = {
  key: ScenarioKey;
  label: string;
  people: number;
  description: string;
};

export function buildEventScenarios(input: {
  confirmedPeople: number;
  pendingPeople: number;
  manualPeople: number;
  event: EventConfig;
}): Scenario[] {
  const conservative = Math.max(0, Math.ceil(input.confirmedPeople));
  const probable = Math.max(conservative, Math.ceil(input.confirmedPeople + input.pendingPeople + input.manualPeople));
  const maximum = Math.max(probable, Number(input.event.operational_capacity ?? input.event.covered_hall_capacity ?? probable ?? 80));

  return [
    {
      key: "conservative",
      label: "Conservador",
      people: conservative,
      description: "Somente convites confirmados/pagos no sistema.",
    },
    {
      key: "probable",
      label: "Provável",
      people: probable,
      description: "Confirmados + pendentes + estimativa manual informada pela coordenação.",
    },
    {
      key: "maximum",
      label: "Máximo",
      people: maximum,
      description: "Capacidade operacional planejada para o evento.",
    },
  ];
}
