"use client";

import { useState } from "react";
import { FileText, Printer, Store } from "lucide-react";
import { formatCurrency } from "@/lib/format";

export type ItemLine = { name: string; category: string; quantity: number; unit: string; revenue: number; cost: number };
export type VolunteerLine = { role: string; quantity: number; notes: string };
export type IngredientLine = { name: string; itemName: string; quantity: number; unit: string };
export type SupplierLine = { category: string; whatToBuy: string; suggestedPlaces: string; notes: string };

type ScenarioReport = {
  key: string;
  label: string;
  eventName?: string | null;
  eventDate?: string | null;
  eventLocation?: string | null;
  hallCapacity?: number;
  operationalCapacity?: number;
  safetyMargin?: number;
  tableCount?: number;
  chairCount?: number;
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
  suppliers?: SupplierLine[];
};

type Props = { scenarios: ScenarioReport[] };

type PrintMode = "portrait" | "landscape" | "suppliers";

function formatDate(value?: string | null) {
  if (!value) return "Data não informada";
  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
}

export function ScenarioResultModal({ scenarios }: Props) {
  const [activeKey, setActiveKey] = useState(scenarios[0]?.key ?? "");
  const [printMode, setPrintMode] = useState<PrintMode>("landscape");
  const active = scenarios.find((scenario) => scenario.key === activeKey) ?? scenarios[0];

  if (!active) return null;

  function printAs(mode: PrintMode) {
    setPrintMode(mode);
    window.setTimeout(() => window.print(), 80);
  }

  return (
    <div className="mt-8">
      <style>{`
        @media print {
          @page { size: A4 ${printMode === "portrait" ? "portrait" : "landscape"}; margin: 10mm; }
          body { background: white !important; }
          .print\\:hidden { display: none !important; }
          .scenario-print-card { box-shadow: none !important; border: 0 !important; }
          .supplier-print-only { display: ${printMode === "suppliers" ? "block" : "none"} !important; }
          .supplier-hide-on-suppliers { display: ${printMode === "suppliers" ? "none" : "block"} !important; }
        }
        @media screen { .supplier-print-only { display: none; } }
      `}</style>

      <div className="sticky top-20 z-20 rounded-[2rem] border border-green-100 bg-white/95 p-3 shadow-sm backdrop-blur print:hidden">
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

      <div className="scenario-print-card mt-5 rounded-[2rem] border border-green-100 bg-white p-6 shadow-sm print:shadow-none">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-black text-green-900">Resultado da simulação</span>
            <h2 className="mt-4 text-3xl font-black text-green-950">{active.label}: {active.people} pessoas</h2>
            <p className="mt-2 text-sm text-stone-600">{active.description}</p>
            <p className="mt-1 text-xs font-bold text-stone-500">Base: {active.adults} adultos e {active.children} crianças.</p>
          </div>
          <div className="flex flex-wrap gap-2 print:hidden">
            <button type="button" onClick={() => printAs("portrait")} className="inline-flex items-center gap-2 rounded-2xl bg-stone-100 px-4 py-3 text-sm font-black text-green-950">
              <Printer className="h-4 w-4" /> PDF retrato
            </button>
            <button type="button" onClick={() => printAs("landscape")} className="inline-flex items-center gap-2 rounded-2xl bg-green-900 px-4 py-3 text-sm font-black text-white">
              <FileText className="h-4 w-4" /> PDF paisagem
            </button>
            <button type="button" onClick={() => printAs("suppliers")} className="inline-flex items-center gap-2 rounded-2xl bg-amber-200 px-4 py-3 text-sm font-black text-green-950">
              <Store className="h-4 w-4" /> PDF compras/fornecedores
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <div className="rounded-3xl bg-stone-50 p-4"><p className="text-xs font-bold text-stone-600">Evento</p><strong className="text-sm text-green-950">{active.eventName ?? "Festa Junina Tucxa"}</strong><p className="mt-1 text-xs text-stone-500">{formatDate(active.eventDate)} · {active.eventLocation ?? "Local a confirmar"}</p></div>
          <div className="rounded-3xl bg-stone-50 p-4"><p className="text-xs font-bold text-stone-600">Capacidade</p><strong className="text-xl text-green-950">{active.operationalCapacity ?? active.people}</strong><p className="text-xs text-stone-500">salão {active.hallCapacity ?? "--"} · margem {active.safetyMargin ?? "--"}%</p></div>
          <div className="rounded-3xl bg-stone-50 p-4"><p className="text-xs font-bold text-stone-600">Mesas/cadeiras</p><strong className="text-xl text-green-950">{active.tableCount ?? "--"}/{active.chairCount ?? "--"}</strong></div>
          <div className="rounded-3xl bg-stone-50 p-4"><p className="text-xs font-bold text-stone-600">Público</p><strong className="text-xl text-green-950">{active.adults} adultos</strong><p className="text-xs text-stone-500">{active.children} crianças</p></div>
        </div>

        <div className="supplier-hide-on-suppliers">
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

        <div className="mt-6 supplier-print-only rounded-[2rem] border border-amber-100 bg-amber-50 p-5">
          <h3 className="text-xl font-black text-green-950">Sugestões de compras e fornecedores</h3>
          <p className="mt-2 text-sm text-stone-700">Sugestões por tipo de compra. Validar preço, disponibilidade e responsáveis antes de comprar.</p>
          <div className="mt-4 grid gap-3">
            {(active.suppliers ?? []).map((supplier) => (
              <div key={supplier.category} className="rounded-2xl bg-white p-4 text-sm">
                <p className="font-black text-green-950">{supplier.category}</p>
                <p className="mt-1"><strong>Comprar:</strong> {supplier.whatToBuy}</p>
                <p className="mt-1"><strong>Onde procurar:</strong> {supplier.suggestedPlaces}</p>
                <p className="mt-1 text-xs text-stone-600">{supplier.notes}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 rounded-[2rem] border border-amber-100 bg-amber-50 p-5 print:hidden">
          <h3 className="font-black text-green-950">Sugestões de fornecedores e locais de compra</h3>
          <p className="mt-2 text-sm text-stone-700">Use o botão “PDF compras/fornecedores” para imprimir uma visão focada em compras. As sugestões indicam tipos de fornecedor em Campinas/SP; os nomes e preços finais devem ser validados pela coordenação.</p>
        </div>
      </div>
    </div>
  );
}
