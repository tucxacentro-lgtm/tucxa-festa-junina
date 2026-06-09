import { requireAdmin } from "@/lib/auth";
import { AdminModulePlaceholder } from "@/components/admin-module-placeholder";

export const dynamic = "force-dynamic";

export default async function Page() {
  await requireAdmin();

  return (
    <AdminModulePlaceholder
      title="Cartelas de Bingo"
      description="Área planejada para organizar cartelas, regras e vínculo com brindes do evento, como a Air Fryer de 2026."
      bullets={["Regras de participação do ingresso no bingo/sorteio.", "Controle de cartelas, quando aplicável.", "Integração futura com o app de Bingo."]}
    />
  );
}
