import { requireAdmin } from "@/lib/auth";
import { AdminModulePlaceholder } from "@/components/admin-module-placeholder";

export const dynamic = "force-dynamic";

export default async function Page() {
  await requireAdmin();

  return (
    <AdminModulePlaceholder
      title="Compras"
      description="Área planejada para consolidar o que precisa ser comprado, quem comprará, status e local de armazenamento."
      bullets={["Lista consolidada de compras.", "Responsáveis por compra.", "Status: pendente, parcial, comprado e conferido."]}
    />
  );
}
