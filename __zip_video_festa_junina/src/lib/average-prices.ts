export const AVERAGE_COST_SUGGESTIONS: Record<string, number> = {
  "pastel salgado": 5.5,
  "pastel doce": 4.8,
  "cachorro-quente": 4.5,
  "milho verde": 3.0,
  "pipoca": 1.8,
  "fatia de bolo": 5.5,
  "paçoca": 1.6,
  "pé de moleque": 2.2,
  "água": 2.2,
  "refrigerante lata": 4.2,
  "suco lata": 4.0,
  "cerveja": 4.5,
  "café": 1.2,
  "chocolate quente": 2.8,
  "cartela de bingo": 0.5,
};

export function getSuggestedUnitCost(itemName: string, fallback = 0) {
  const key = itemName.trim().toLowerCase();
  return AVERAGE_COST_SUGGESTIONS[key] ?? fallback;
}
