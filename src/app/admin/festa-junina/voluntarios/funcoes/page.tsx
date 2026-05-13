import { requireAdmin } from "@/lib/auth";
import { AdminModulePlaceholder } from "@/components/admin-module-placeholder";

export const dynamic = "force-dynamic";

export default async function Page() {
  await requireAdmin();

  return (
    <AdminModulePlaceholder
      title="Cadastro por função"
      description="Área planejada para organizar funções de voluntários por compras, preparo, atendimento, caixa, entrega, coordenação e apoio."
      bullets={["Listar funções necessárias.", "Associar voluntários a papéis.", "Identificar lacunas de equipe."]}
    />
  );
}
