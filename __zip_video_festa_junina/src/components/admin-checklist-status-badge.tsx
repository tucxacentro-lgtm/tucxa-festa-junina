const labels: Record<string, string> = {
  pending: "Pendente",
  suggested: "Sugestão",
  in_progress: "Em andamento",
  confirmed: "Confirmado",
};

const classes: Record<string, string> = {
  pending: "bg-stone-100 text-stone-700",
  suggested: "bg-amber-100 text-amber-900",
  in_progress: "bg-blue-100 text-blue-900",
  confirmed: "bg-green-100 text-green-900",
};

export function AdminChecklistStatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${classes[status] ?? classes.pending}`}>
      {labels[status] ?? status}
    </span>
  );
}
