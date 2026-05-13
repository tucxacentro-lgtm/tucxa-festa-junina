import { requireAdmin } from "@/lib/auth";
import { AdminModulePlaceholder } from "@/components/admin-module-placeholder";

export const dynamic = "force-dynamic";

export default async function CaixaPage() {
  await requireAdmin();
  return (
    <AdminModulePlaceholder
      title="Caixa"
      description="Módulo preparado para fechamento de consumo, registro de pagamentos, conferência de Pix, cartão, dinheiro e prestação parcial."
      bullets={["Fechamento por pessoa ou mesa.", "Registro de forma de pagamento.", "Resumo para prestação de contas."]}
    />
  );
}
