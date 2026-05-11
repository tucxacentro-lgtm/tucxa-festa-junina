import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabaseServer";
import type { EventConfig, PaymentOption } from "@/types/festa-junina";
import { savePaymentOption } from "./actions";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function FormStatusMessage({ message }: { message?: string }) {
  if (!message) return null;

  return (
    <div className="mb-5 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm font-bold text-green-900">
      {message}
    </div>
  );
}

async function getData() {
  const supabase = createSupabaseAdminClient();
  const { data: event, error: eventError } = await supabase.from("events").select("*").eq("slug", "arraia-tucxa-2026").single();
  if (eventError || !event) throw new Error(eventError?.message ?? "Evento não encontrado.");

  const { data: paymentOptions, error } = await supabase
    .from("payment_options")
    .select("*")
    .eq("event_id", event.id)
    .order("sort_order");

  if (error) throw new Error(error.message);
  return { event: event as EventConfig, paymentOptions: (paymentOptions ?? []) as PaymentOption[] };
}

function PaymentForm({ eventId, option }: { eventId: string; option?: PaymentOption }) {
  return (
    <form action={savePaymentOption} className="grid gap-3 rounded-3xl bg-white p-5 shadow-sm">
      <input type="hidden" name="event_id" value={eventId} />
      <input type="hidden" name="id" value={option?.id ?? ""} />

      <div className="grid gap-3 md:grid-cols-3">
        <label className="grid gap-1 text-sm font-bold text-green-950">
          Nome
          <input name="name" required defaultValue={option?.name ?? ""} className="rounded-2xl border border-stone-200 p-3 font-normal" />
        </label>
        <label className="grid gap-1 text-sm font-bold text-green-950">
          Método
          <select name="method" defaultValue={option?.method ?? "manual"} className="rounded-2xl border border-stone-200 p-3 font-normal">
            <option value="pix">Pix</option>
            <option value="cash">Dinheiro</option>
            <option value="credit">Crédito</option>
            <option value="debit">Débito</option>
            <option value="free">Cortesia</option>
            <option value="manual">Manual</option>
          </select>
        </label>
        <label className="grid gap-1 text-sm font-bold text-green-950">
          Ordem
          <input name="sort_order" type="number" defaultValue={option?.sort_order ?? 0} className="rounded-2xl border border-stone-200 p-3 font-normal" />
        </label>
      </div>

      <label className="grid gap-1 text-sm font-bold text-green-950">
        Instruções para o comprador
        <textarea name="instructions" defaultValue={option?.instructions ?? ""} className="min-h-20 rounded-2xl border border-stone-200 p-3 font-normal" />
      </label>

      <label className="flex items-center gap-2 text-sm font-bold text-green-950">
        <input name="active" type="checkbox" defaultChecked={option?.active ?? true} /> Ativo
      </label>

      <button className="rounded-2xl bg-green-900 px-5 py-3 font-black text-white">{option ? "Salvar forma de pagamento" : "Criar forma de pagamento"}</button>
    </form>
  );
}

export default async function PagamentosPage({ searchParams }: PageProps) {
  await requireAdmin(["admin", "coordenador"], "/admin/festa-junina/pagamentos");
  const { event, paymentOptions } = await getData();
  const params = await searchParams;
  const successMessage = params?.saved ? "Forma de pagamento salva com sucesso." : undefined;

  return (
    <main className="min-h-screen bg-amber-50 text-stone-900">
      <SiteHeader />
      <section className="mx-auto max-w-6xl px-5 py-10">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-black text-green-950">Pagamentos</h1>
            <p className="mt-2 text-stone-600">Configure Pix, dinheiro, cartão presencial, cortesia e instruções para o comprovante.</p>
          </div>
          <Link href="/admin/festa-junina" className="rounded-2xl bg-white px-5 py-3 text-sm font-bold text-green-950 shadow-sm">Voltar ao admin</Link>
        </div>

        <FormStatusMessage message={successMessage} />

        <div className="grid gap-5">
          {paymentOptions.map((option) => <PaymentForm key={option.id} eventId={event.id} option={option} />)}
          <div>
            <h2 className="mb-3 text-xl font-black text-green-950">Nova forma de pagamento</h2>
            <PaymentForm eventId={event.id} />
          </div>
        </div>
      </section>
    </main>
  );
}
