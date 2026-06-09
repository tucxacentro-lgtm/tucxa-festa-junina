import { requireAdmin } from "@/lib/auth";
import { AdminModulePlaceholder } from "@/components/admin-module-placeholder";

export const dynamic = "force-dynamic";

export default async function AcessoPage() {
  await requireAdmin();
  return (
    <AdminModulePlaceholder
      title="Acesso ao evento"
      description="Módulo preparado para controlar entrada, leitura de QR Code/código do comprador e conferência manual de ingressos impressos ou digitais."
      bullets={["Check-in por código ou QR Code.", "Consulta rápida por nome, WhatsApp ou código.", "Registro de entrada e exceções no dia do evento."]}
    />
  );
}
