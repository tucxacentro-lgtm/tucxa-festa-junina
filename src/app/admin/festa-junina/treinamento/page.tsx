import { requireAdmin } from "@/lib/auth";
import { AdminModulePlaceholder } from "@/components/admin-module-placeholder";

export const dynamic = "force-dynamic";

export default async function Page() {
  await requireAdmin();

  return (
    <AdminModulePlaceholder
      title="Treinamentos e simulação"
      description="Área planejada para organizar orientações e testes práticos antes do evento."
      bullets={["Treinar uso do QR Code e comprovantes.", "Simular vendas, check-in e caixa.", "Registrar responsáveis e pendências."]}
    />
  );
}
