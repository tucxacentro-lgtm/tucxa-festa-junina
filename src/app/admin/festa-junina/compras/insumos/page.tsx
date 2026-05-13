import { requireAdmin } from "@/lib/auth";
import { AdminModulePlaceholder } from "@/components/admin-module-placeholder";

export const dynamic = "force-dynamic";

export default async function Page() {
  await requireAdmin();

  return (
    <AdminModulePlaceholder
      title="Insumos"
      description="Área planejada para listar ingredientes e materiais necessários a partir da ficha técnica do cardápio."
      bullets={["Ingredientes por item preparado.", "Descartáveis, gelo e materiais de apoio.", "Quantidade sugerida e quantidade ajustada."]}
    />
  );
}
