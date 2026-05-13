import { requireAdmin } from "@/lib/auth";
import { AdminModulePlaceholder } from "@/components/admin-module-placeholder";

export const dynamic = "force-dynamic";

export default async function Page() {
  await requireAdmin();

  return (
    <AdminModulePlaceholder
      title="Versão resumida para clientes"
      description="Área planejada para gerar uma visão simples do evento para clientes, com informações essenciais de ingresso, local, horários e orientações."
      bullets={["Resumo público do evento.", "Informações de entrada, pagamento e comprovante.", "Comunicação rápida para WhatsApp ou impressão."]}
    />
  );
}
