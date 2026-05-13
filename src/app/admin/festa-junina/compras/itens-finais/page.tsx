import { requireAdmin } from "@/lib/auth";
import { AdminModulePlaceholder } from "@/components/admin-module-placeholder";

export const dynamic = "force-dynamic";

export default async function Page() {
  await requireAdmin();

  return (
    <AdminModulePlaceholder
      title="Itens finais"
      description="Área planejada para controlar itens prontos para venda, como bebidas, doces e produtos sem preparo."
      bullets={["Quantidade prevista.", "Quantidade comprada.", "Local de armazenamento e conferência."]}
    />
  );
}
