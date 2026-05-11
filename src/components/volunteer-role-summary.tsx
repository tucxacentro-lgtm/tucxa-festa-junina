type VolunteerRoleSummaryProps = {
  confirmedPeople: number;
  possiblePeople: number;
};

function suggestionForPeople(people: number) {
  if (people <= 0) return { compras: 1, preparo: 1, atendimento: 1, caixa: 1, apoio: 1 };
  if (people <= 50) return { compras: 2, preparo: 2, atendimento: 2, caixa: 1, apoio: 1 };
  if (people <= 100) return { compras: 2, preparo: 3, atendimento: 4, caixa: 2, apoio: 2 };
  if (people <= 150) return { compras: 3, preparo: 5, atendimento: 6, caixa: 2, apoio: 3 };
  return { compras: 4, preparo: 6, atendimento: 8, caixa: 3, apoio: 4 };
}

export function VolunteerRoleSummary({ confirmedPeople, possiblePeople }: VolunteerRoleSummaryProps) {
  const confirmed = suggestionForPeople(confirmedPeople);
  const possible = suggestionForPeople(possiblePeople);

  const rows = [
    ["Organização/compras", confirmed.compras, possible.compras],
    ["Preparo/cozinha", confirmed.preparo, possible.preparo],
    ["Atendimento/garçom", confirmed.atendimento, possible.atendimento],
    ["Caixa", confirmed.caixa, possible.caixa],
    ["Apoio/entrega/retirada", confirmed.apoio, possible.apoio],
  ] as const;

  return (
    <div className="overflow-x-auto rounded-3xl bg-white p-5 shadow-sm">
      <h2 className="text-xl font-black text-green-950">Sugestão de voluntários</h2>
      <p className="mt-2 text-sm text-stone-600">Sugestão inicial editável pela coordenação. Use como ponto de partida para escala.</p>
      <table className="mt-4 w-full min-w-[520px] text-left text-sm">
        <thead className="bg-green-950 text-white">
          <tr><th className="p-3">Papel</th><th className="p-3">Base confirmada</th><th className="p-3">Base provável</th></tr>
        </thead>
        <tbody>
          {rows.map(([role, c, p]) => (
            <tr key={role} className="border-b border-stone-100 last:border-0">
              <td className="p-3 font-bold text-green-950">{role}</td>
              <td className="p-3">{c}</td>
              <td className="p-3">{p}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
