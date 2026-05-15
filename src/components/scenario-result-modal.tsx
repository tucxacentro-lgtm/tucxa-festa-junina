"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/format";

type ItemLine = { name: string; category: string; quantity: number; unit: string; revenue: number; cost: number };
type VolunteerLine = { role: string; quantity: number; notes: string };
type IngredientLine = { name: string; itemName: string; quantity: number; unit: string };

type ScenarioReport = {
  key: string;
  label: string;
  people: number;
  adults: number;
  children: number;
  description: string;
  ticketRevenue: number;
  consumptionRevenue: number;
  estimatedCosts: number;
  estimatedBalance: number;
  items: ItemLine[];
  ingredients: IngredientLine[];
  volunteers: VolunteerLine[];
};

type Props = { scenarios: ScenarioReport[] };

export function ScenarioResultModal({ scenarios }: Props) {
  const [activeKey, setActiveKey] = useState(scenarios[0]?.key ?? "");
  const active = scenarios.find((scenario) => scenario.key === activeKey) ?? scenarios[0];

  if (!active) return null;

  return (
    <div className="mt-8">
      <div className="sticky top-20 z-20 rounded-[2rem] border border-green-100 bg-white/95 p-3 shadow-sm backdrop-blur">
        <p className="px-2 text-xs font-black uppercase tracking-[0.16em] text-green-900">Escolha o cenário</p>
        <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
          {scenarios.map((scenario) => (
            <button
              key={scenario.key}
              type="button"
              onClick={() => setActiveKey(scenario.key)}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-black transition ${
                activeKey === scenario.key ? "bg-green-900 text-white" : "bg-stone-50 text-green-950 hover:bg-green-50"
              }`}
            >
              {scenario.label} · {scenario.people} pessoas
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 rounded-[2rem] border border-green-100 bg-white p-6 shadow-sm print:shadow-none">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-black text-green-900">Resultado da simulação</span>
            <h2 className="mt-4 text-3xl font-black text-green-950">{active.label}: {active.people} pessoas</h2>
            <p className="mt-2 text-sm text-stone-600">{active.description}</p>
            <p className="mt-1 text-xs font-bold text-stone-500">Base: {active.adults} adultos e {active.children} crianças.</p>
          </div>
          <button type="button" onClick={() => window.print()} className="rounded-2xl bg-green-900 px-5 py-3 text-sm font-black text-white print:hidden">
            Gerar PDF / imprimir
          </button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <div className="rounded-3xl bg-green-50 p-4"><p className="text-xs font-bold text-stone-600">Receita convites</p><strong className="text-xl text-green-950">{formatCurrency(active.ticketRevenue)}</strong></div>
          <div className="rounded-3xl bg-green-50 p-4"><p className="text-xs font-bold text-stone-600">Receita consumo</p><strong className="text-xl text-green-950">{formatCurrency(active.consumptionRevenue)}</strong></div>
          <div className="rounded-3xl bg-amber-50 p-4"><p className="text-xs font-bold text-stone-600">Custos estimados</p><strong className="text-xl text-green-950">{formatCurrency(active.estimatedCosts)}</strong></div>
          <div className="rounded-3xl bg-stone-50 p-4"><p className="text-xs font-bold text-stone-600">Saldo estimado</p><strong className="text-xl text-green-950">{formatCurrency(active.estimatedBalance)}</strong></div>
        </div>
        <p className="mt-3 rounded-2xl bg-amber-50 p-3 text-xs font-bold text-amber-900">
          Valores de custo são sugestões editáveis para planejamento. Validar com fornecedores e coordenadores antes da compra.
        </p>

        <div className="mt-6 grid gap-6 xl:grid-cols-2">
          <div>
            <h3 className="font-black text-green-950">Itens do cardápio</h3>
            <div className="mt-3 overflow-x-auto rounded-2xl border border-stone-100">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="bg-green-950 text-white"><tr><th className="p-3">Item</th><th className="p-3">Categoria</th><th className="p-3">Qtd.</th><th className="p-3">Receita</th><th className="p-3">Custo</th></tr></thead>
                <tbody>{active.items.map((item) => <tr key={`${item.name}-${item.category}`} className="border-b border-stone-100 last:border-0"><td className="p-3 font-bold text-green-950">{item.name}</td><td className="p-3">{item.category}</td><td className="p-3 font-black">{item.quantity} {item.unit}</td><td className="p-3">{formatCurrency(item.revenue)}</td><td className="p-3">{formatCurrency(item.cost)}</td></tr>)}</tbody>
              </table>
            </div>
          </div>

          <div>
            <h3 className="font-black text-green-950">Voluntários sugeridos</h3>
            <div className="mt-3 grid gap-2">{active.volunteers.map((volunteer) => <div key={volunteer.role} className="rounded-2xl bg-stone-50 p-3 text-sm"><strong>{volunteer.role}:</strong> {volunteer.quantity} pessoa(s)<p className="text-xs text-stone-500">{volunteer.notes}</p></div>)}</div>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="font-black text-green-950">Insumos estimados</h3>
          <div className="mt-3 overflow-x-auto rounded-2xl border border-stone-100">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-green-950 text-white"><tr><th className="p-3">Insumo</th><th className="p-3">Item</th><th className="p-3">Qtd.</th><th className="p-3">Un.</th></tr></thead>
              <tbody>
                {active.ingredients.map((ingredient) => <tr key={`${ingredient.name}-${ingredient.itemName}`} className="border-b border-stone-100 last:border-0"><td className="p-3 font-bold text-green-950">{ingredient.name}</td><td className="p-3">{ingredient.itemName}</td><td className="p-3 font-black">{ingredient.quantity}</td><td className="p-3">{ingredient.unit}</td></tr>)}
                {active.ingredients.length === 0 ? <tr><td colSpan={4} className="p-6 text-center text-stone-500">Cadastre fichas técnicas para estimar insumos.</td></tr> : null}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
