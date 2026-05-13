import { requireAdmin } from "@/lib/auth";
import { AdminModulePlaceholder } from "@/components/admin-module-placeholder";

export const dynamic = "force-dynamic";

export default async function Page() {
  await requireAdmin();

  return (
    <AdminModulePlaceholder
      title="Novo evento"
      description="Área preparada para cadastrar futuras edições da Festa Junina do Tucxa. Nesta etapa, use a tela Eventos para acompanhar e ajustar o evento ativo."
      bullets={["Criar edições futuras como 2027 e 2028.", "Manter dados separados por evento.", "Reaproveitar módulos conforme decisão da organização."]}
    />
  );
}
