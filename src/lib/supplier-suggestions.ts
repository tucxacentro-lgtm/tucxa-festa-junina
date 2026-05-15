export type SupplierSuggestion = {
  category: string;
  whatToBuy: string;
  suggestedPlaces: string;
  notes: string;
};

type ItemLine = { name: string; category: string; quantity: number; unit: string };
type IngredientLine = { name: string; itemName: string; quantity: number; unit: string };

function hasAny(values: string[], needles: string[]) {
  const text = values.join(" ").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  return needles.some((needle) => text.includes(needle));
}

export function buildSupplierSuggestions(items: ItemLine[], ingredients: IngredientLine[]): SupplierSuggestion[] {
  const itemNames = items.map((item) => `${item.name} ${item.category}`);
  const ingredientNames = ingredients.map((ingredient) => `${ingredient.name} ${ingredient.itemName}`);
  const suggestions: SupplierSuggestion[] = [];

  if (hasAny(itemNames, ["agua", "refrigerante", "suco", "cerveja"])) {
    suggestions.push({
      category: "Bebidas",
      whatToBuy: "Água, refrigerantes, sucos, gelo e bebidas autorizadas pela coordenação.",
      suggestedPlaces: "Atacados, supermercados de maior porte e distribuidores de bebidas em Campinas/SP.",
      notes: "Validar consignação, prazo de retirada, refrigeração e devolução de itens fechados quando possível.",
    });
  }

  if (hasAny(itemNames.concat(ingredientNames), ["pastel", "cachorro", "milho", "bolo", "canjica", "pipoca", "chocolate quente", "cafe"])) {
    suggestions.push({
      category: "Comidas e preparo",
      whatToBuy: "Massas, recheios, milho, pães, bolos, ingredientes de preparo, óleo e temperos.",
      suggestedPlaces: "Atacados, mercados de bairro, padarias parceiras e fornecedores já conhecidos pelos voluntários.",
      notes: "Separar itens que precisam de geladeira/freezer e confirmar quem compra, transporta e armazena.",
    });
  }

  if (hasAny(itemNames.concat(ingredientNames), ["doce", "pacoca", "pe de moleque", "brigadeiro", "bolo"])) {
    suggestions.push({
      category: "Doces",
      whatToBuy: "Doces prontos, embalagens, bolos, sobremesas e itens para porcionamento.",
      suggestedPlaces: "Mercados, atacados de doces, padarias e doações da comunidade.",
      notes: "Confirmar validade, embalagem individual e facilidade de servir no dia.",
    });
  }

  suggestions.push({
    category: "Descartáveis e operação",
    whatToBuy: "Copos, pratos, talheres, guardanapos, sacos de lixo, etiquetas, canetas e comandas de contingência.",
    suggestedPlaces: "Lojas de embalagens, atacados e supermercados em Campinas/SP.",
    notes: "Comprar com margem de segurança e separar por área: caixa, cozinha, retirada e mesas.",
  });

  suggestions.push({
    category: "Atenção",
    whatToBuy: "Cotações finais e fornecedores específicos.",
    suggestedPlaces: "Validar com coordenação antes da compra.",
    notes: "Os locais acima são categorias sugeridas, não fornecedores fechados. Preços, horários e disponibilidade precisam ser confirmados na semana do evento.",
  });

  return suggestions;
}
