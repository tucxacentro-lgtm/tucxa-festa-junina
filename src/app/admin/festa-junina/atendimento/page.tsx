import { requireAdmin } from "@/lib/auth";
import { AdminModulePlaceholder } from "@/components/admin-module-placeholder";

export const dynamic = "force-dynamic";

export default async function Page() {
  await requireAdmin();

  return (
    <AdminModulePlaceholder
      title="Atendimento no dia do evento"
      description="Módulo futuro para check-in, pedidos, entrega, caixa e ocorrências."
      bullets={["Check-in de entrada por código/QR Code.", "Pedidos e entrega, caso o módulo seja usado.", "Caixa, pagamento e ocorrências do dia."]}
    />
  );
}
