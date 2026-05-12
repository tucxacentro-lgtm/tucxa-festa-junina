import { MODULE_STATUS_LABELS, type EventModuleDefinition, type EventModuleStatus } from "@/lib/event-modules";

type Props = {
  definition: EventModuleDefinition;
  enabled?: boolean;
  status?: EventModuleStatus | string | null;
  notes?: string | null;
};

function statusClass(status: string) {
  if (status === "done") return "bg-green-100 text-green-900";
  if (status === "in_use") return "bg-blue-100 text-blue-900";
  if (status === "configuring") return "bg-amber-100 text-amber-900";
  if (status === "suggested") return "bg-stone-100 text-stone-700";
  return "bg-red-50 text-red-700";
}

export function EventModuleStatusCard({ definition, enabled = true, status = "suggested", notes }: Props) {
  const Icon = definition.icon;
  const normalizedStatus = (status ?? "suggested") as EventModuleStatus;
  return (
    <a href={definition.href} className="rounded-3xl bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <div className="flex items-start gap-4">
        <Icon className="mt-1 h-7 w-7 text-green-800" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-black text-green-950">{definition.title}</h3>
            <span className={`rounded-full px-3 py-1 text-xs font-black ${statusClass(enabled ? normalizedStatus : "not_used")}`}>
              {enabled ? MODULE_STATUS_LABELS[normalizedStatus] ?? normalizedStatus : MODULE_STATUS_LABELS.not_used}
            </span>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-stone-600">{definition.description}</p>
          {notes ? <p className="mt-3 rounded-2xl bg-amber-50 p-3 text-xs text-stone-600">{notes}</p> : null}
        </div>
      </div>
    </a>
  );
}
