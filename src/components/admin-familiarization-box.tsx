import Link from "next/link";

export function AdminFamiliarizationBox() {
  return (
    <section className="mt-8 rounded-3xl border border-green-200 bg-green-50 p-6 shadow-sm">
      <h2 className="text-2xl font-black text-green-950">Link para familiarização dos coordenadores</h2>
      <p className="mt-3 text-sm leading-relaxed text-stone-700">
        Envie o link público como ambiente de homologação. Reforce que o sistema é configurável e que os convites impressos continuam válidos: registrar as vendas aqui ajuda no controle de comprovantes, planejamento de compras, cardápio, voluntários e prestação de contas.
      </p>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <Link href="/festa-junina" className="rounded-2xl bg-white px-4 py-3 text-sm font-black text-green-950 shadow-sm">
          Abrir página pública
        </Link>
        <Link href="/admin/festa-junina/operacao" className="rounded-2xl bg-white px-4 py-3 text-sm font-black text-green-950 shadow-sm">
          Preparar simulação operacional
        </Link>
      </div>
      <div className="mt-4 rounded-2xl bg-white p-4 text-xs leading-relaxed text-stone-700">
        <strong>Mensagem sugerida:</strong> pessoal, segue o link do sistema da Festa Junina do Tucxa para familiarização. Ele não substitui nem invalida convites impressos; o registro das vendas ajuda no planejamento, comprovantes, cardápio, voluntários, pagamento e prestação de contas. Valores, combos, Pix, cardápio e regras podem ser ajustados pela organização.
      </div>
    </section>
  );
}
