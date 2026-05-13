import { requireAdmin } from "@/lib/auth";
import { AdminModulePlaceholder } from "@/components/admin-module-placeholder";

export const dynamic = "force-dynamic";

export default async function EntregaPage() {
  await requireAdmin();
  return (
    <AdminModulePlaceholder
      title="Entrega"
      description="Módulo preparado para acompanhar retirada no balcão, entrega em mesa e confirmação de entrega por responsável."
      bullets={["Pedidos separados aguardando retirada/entrega.", "Confirmação de entrega.", "Acompanhamento de pendências e ocorrências."]}
    />
  );
}
