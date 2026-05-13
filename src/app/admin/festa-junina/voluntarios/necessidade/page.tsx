import { requireAdmin } from "@/lib/auth";
import { AdminModulePlaceholder } from "@/components/admin-module-placeholder";

export const dynamic = "force-dynamic";

export default async function Page() {
  await requireAdmin();

  return (
    <AdminModulePlaceholder
      title="Necessidade de voluntários"
      description="Área planejada para comparar equipe necessária com convites vendidos e estimativa de público."
      bullets={["Estimar voluntários por público confirmado/provável.", "Separar necessidade por função.", "Apoiar escala de trabalho."]}
    />
  );
}
