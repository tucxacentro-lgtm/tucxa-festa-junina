import { notFound } from "next/navigation";
import { getCurrentEventForPublic } from "@/lib/current-event";
import { getServiceResponsiblesForEvent } from "@/lib/operation-dashboard";
import ResponsibleTrackingPage from "./[sessionId]/page";

export const dynamic = "force-dynamic";

type PageProps = { searchParams?: Promise<{ nome?: string }> };

export default async function ResponsibleTrackingByNamePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const name = params?.nome?.trim();
  if (!name) notFound();
  const event = await getCurrentEventForPublic();
  const rows = await getServiceResponsiblesForEvent(event.id);
  const row = rows.find((item) => item.responsibleName.toLocaleLowerCase("pt-BR") === name.toLocaleLowerCase("pt-BR"));
  if (!row) notFound();
  return <ResponsibleTrackingPage params={Promise.resolve({ sessionId: row.id })} />;
}
