import { requireAdmin } from "@/lib/auth";
import { AdminModulePlaceholder } from "@/components/admin-module-placeholder";

export const dynamic = "force-dynamic";

export default async function Page() {
  await requireAdmin();

  return (
    <AdminModulePlaceholder
      title="Relatórios e BI"
      description="Área planejada para relatórios configuráveis, com seleção de campos para vendas, pagamentos, convites, operação, compras e prestação de contas."
      bullets={["Selecionar campos e filtros do relatório.", "Acompanhar vendas por tipo de ingresso e forma de pagamento.", "Exportar ou consolidar dados para prestação de contas futura."]}
    />
  );
}
