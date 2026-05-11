import { Search } from "lucide-react";
import { SiteHeader } from "@/components/site-header";

export default function MinhaCompraPage() {
  return (
    <main className="min-h-screen bg-amber-50 text-stone-900">
      <SiteHeader />
      <section className="mx-auto max-w-2xl px-5 py-16">
        <div className="rounded-[2rem] bg-white p-6 shadow-sm md:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-green-100 px-4 py-2 text-sm font-black text-green-900">
            <Search className="h-4 w-4" />
            Área do comprador
          </div>
          <h1 className="text-3xl font-black text-green-950">Consultar minha compra</h1>
          <p className="mt-3 text-stone-600">
            Digite o código recebido após registrar a compra para acessar a comprovação de entrada e, futuramente, o consumo da festa.
          </p>

          <form action="/minha-compra/consultar" method="get" className="mt-6">
            <label className="block text-sm font-black text-green-950">Código do comprador</label>
            <input
              name="code"
              className="mt-2 w-full rounded-2xl border border-stone-200 p-4 outline-none focus:border-green-700"
              placeholder="Ex.: TUCXA-2026-ABC123"
            />
            <button className="mt-4 rounded-2xl bg-green-900 px-5 py-3 font-bold text-white">Acessar compra</button>
            <p className="mt-3 text-sm text-stone-500">Para acessar diretamente, use o link no formato /minha-compra/SEU-CODIGO.</p>
          </form>
        </div>
      </section>
    </main>
  );
}
