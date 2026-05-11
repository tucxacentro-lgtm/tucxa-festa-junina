type Ingredient = {
  id: string;
  ingredient_name: string;
  ingredient_category: string;
  amount_per_unit: number | string;
  unit_label: string;
  notes: string | null;
  active: boolean;
};

export function MenuItemTechnicalSheet({ ingredients }: { ingredients: Ingredient[] }) {
  if (ingredients.length === 0) {
    return <p className="text-sm text-stone-500">Nenhum insumo cadastrado para este item.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[680px] text-left text-sm">
        <thead className="bg-green-950 text-white">
          <tr>
            <th className="p-3">Insumo</th>
            <th className="p-3">Categoria</th>
            <th className="p-3">Qtd. por unidade</th>
            <th className="p-3">Observação</th>
          </tr>
        </thead>
        <tbody>
          {ingredients.map((ingredient) => (
            <tr key={ingredient.id} className="border-b border-stone-100 last:border-0">
              <td className="p-3 font-bold text-green-950">{ingredient.ingredient_name}</td>
              <td className="p-3">{ingredient.ingredient_category}</td>
              <td className="p-3">{ingredient.amount_per_unit} {ingredient.unit_label}</td>
              <td className="p-3 text-stone-600">{ingredient.notes || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
