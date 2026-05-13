import { requireAdmin } from "@/lib/auth";
import { AdminModulePlaceholder } from "@/components/admin-module-placeholder";

export const dynamic = "force-dynamic";

export default async function Page() {
  await requireAdmin();

  return (
    <AdminModulePlaceholder
      title="Prestação de contas"
      description="Área planejada para consolidar resultados financeiros e operacionais após o evento."
      bullets={["Total vendido por forma de pagamento.", "Compras, sobras e observações.", "Relatório para coordenação e próximos eventos."]}
    />
  );
}
