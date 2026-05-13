import { requireAdmin } from "@/lib/auth";
import { AdminModulePlaceholder } from "@/components/admin-module-placeholder";

export const dynamic = "force-dynamic";

export default async function OcorrenciasPage() {
  await requireAdmin();
  return (
    <AdminModulePlaceholder
      title="Ocorrências"
      description="Módulo preparado para registrar problemas, ajustes manuais, exceções de pagamento, atendimento e decisões tomadas durante a festa."
      bullets={["Registro de ocorrência por área.", "Responsável e status da resolução.", "Histórico para relatório final e melhoria dos próximos eventos."]}
    />
  );
}
