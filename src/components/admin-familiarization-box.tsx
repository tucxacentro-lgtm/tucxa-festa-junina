import { HelpCircle } from "lucide-react";
import { WhatsAppSupportButton } from "@/components/whatsapp-support-button";

export function AdminFamiliarizationBox() {
  return (
    <section className="mt-8 rounded-3xl border border-green-200 bg-green-50 p-5 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-black text-green-950">É novo por aqui?</h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-stone-700">
            Conheça todas as funcionalidades do sistema e veja o caminho recomendado para configurar a Festa Junina, validar compras, planejar insumos e preparar a operação.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <a
            href="/admin/festa-junina/ajuda"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-black text-green-950 shadow-sm transition hover:bg-amber-100"
          >
            <HelpCircle className="h-4 w-4" />
            Conhecer funcionalidades
          </a>
          <WhatsAppSupportButton />
        </div>
      </div>
    </section>
  );
}
