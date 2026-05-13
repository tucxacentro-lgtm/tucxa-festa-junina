import { requireAdmin } from "@/lib/auth";
import { AdminModulePlaceholder } from "@/components/admin-module-placeholder";

export const dynamic = "force-dynamic";

export default async function Page() {
  await requireAdmin();

  return (
    <AdminModulePlaceholder
      title="Outros"
      description="Área reservada para conveniências adicionais que a coordenação decidir usar em cada edição do evento."
      bullets={["Registrar itens ou necessidades específicas do evento.", "Documentar decisões pontuais.", "Manter histórico para próximos anos."]}
    />
  );
}
