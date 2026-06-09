import Link from "next/link";
import { AdminPageShell } from "@/components/admin-page-shell";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabaseServer";
import type { EventConfig, PaymentOption } from "@/types/festa-junina";
import { savePaymentOption } from "./actions";

export const dynamic = "force-dynamic";

type PageProps = { searchParams?: Promise<Record<string, string | string[] | undefined>> };

function firstParam(value: string | string[] | undefined) { return Array.isArray(value) ? value[0] : value; }
function StatusBadge({ active }: { active?: boolean }) { return <span className={`rounded-full px-3 py-1 text-xs font-black ${active ? "bg-green-100 text-green-900" : "bg-stone-100 text-stone-600"}`}>{active ? "Disponível" : "Inativa"}</span>; }
function methodLabel(method: string) { const labels: Record<string, string> = { pix: "Pix", cash: "Dinheiro", credit: "Crédito", debit: "Débito", free: "Cortesia", manual: "Manual/responsável" }; return labels[method] ?? method; }

async function getData() {
  const supabase = createSupabaseAdminClient();
  const { data: event, error: eventError } = await supabase.from("events").select("*").eq("slug", "arraia-tucxa-2026").single();
  if (eventError || !event) throw new Error(eventError?.message ?? "Evento não encontrado.");
  const { data: paymentOptions, error } = await supabase.from("payment_options").select("*").eq("event_id", event.id).order("sort_order");
  if (error) throw new Error(error.message);
  return { event: event as EventConfig, paymentOptions: (paymentOptions ?? []) as PaymentOption[] };
}

function FormStatusMessage({ message }: { message?: string }) {
  if (!message) return null;
  return <div className="rounded-2xl border border-green-200 bg-green-50 p-4 text-sm font-bold text-green-900">{message}</div>;
}

function PaymentCard({ option }: { option: PaymentOption }) {
  return (
    <article className="rounded-[1.75rem] border border-green-100 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div><h2 className="text-xl font-black text-green-950">{option.name}</h2><p className="mt-1 text-sm font-bold text-stone-600">{methodLabel(option.method)}</p></div>
        <StatusBadge active={option.active} />
      </div>
      {option.instructions ? <p className="mt-4 rounded-2xl bg-stone-50 p-4 text-sm text-stone-700">{option.instructions}</p> : null}
      <dl className="mt-5 grid gap-2 text-sm text-stone-700 md:grid-cols-2">
        <div><dt className="font-black text-green-950">Ordem</dt><dd>{option.sort_order ?? 0}</dd></div>
        <div><dt className="font-black text-green-950">Uso</dt><dd>Convites e consumo no dia</dd></div>
      </dl>
      <div className="mt-6 flex flex-wrap gap-3"><Link href={`/admin/festa-junina/pagamentos?edit=${option.id}`} className="rounded-full bg-green-900 px-5 py-3 text-sm font-black text-white" prefetch={false}>Editar</Link><Link href="/admin/festa-junina/pagamentos?new=1" className="rounded-full border border-green-100 bg-white px-5 py-3 text-sm font-black text-green-950" prefetch={false}>Criar nova</Link></div>
    </article>
  );
}

function PaymentForm({ eventId, option }: { eventId: string; option?: PaymentOption }) {
  return (
    <form action={savePaymentOption} className="rounded-[1.75rem] border border-green-100 bg-white p-6 shadow-sm">
      <input type="hidden" name="event_id" value={eventId} />
      <input type="hidden" name="id" value={option?.id ?? ""} />
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div><span className="rounded-full bg-green-50 px-3 py-1 text-xs font-black text-green-900">{option ? "Editar forma" : "Nova forma"}</span><h2 className="mt-3 text-2xl font-black text-green-950">{option?.name ?? "Cadastrar forma de pagamento"}</h2></div>
        <Link href="/admin/festa-junina/pagamentos" className="rounded-full bg-white px-4 py-2 text-sm font-black text-green-950 shadow-sm" prefetch={false}>Cancelar</Link>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        <label className="grid gap-1 text-sm font-bold text-green-950">Nome<input name="name" required defaultValue={option?.name ?? ""} className="rounded-2xl border border-stone-200 p-3 font-normal" /></label>
        <label className="grid gap-1 text-sm font-bold text-green-950">Método<select name="method" defaultValue={option?.method ?? "manual"} className="rounded-2xl border border-stone-200 p-3 font-normal"><option value="pix">Pix</option><option value="cash">Dinheiro</option><option value="credit">Crédito</option><option value="debit">Débito</option><option value="free">Cortesia</option><option value="manual">Manual/responsável</option></select></label>
        <label className="grid gap-1 text-sm font-bold text-green-950">Ordem<input name="sort_order" type="number" defaultValue={option?.sort_order ?? 0} className="rounded-2xl border border-stone-200 p-3 font-normal" /></label>
      </div>
      <label className="mt-3 grid gap-1 text-sm font-bold text-green-950">Instruções para comprador/cliente<textarea name="instructions" defaultValue={option?.instructions ?? ""} className="min-h-24 rounded-2xl border border-stone-200 p-3 font-normal" /></label>
      <label className="mt-4 flex items-center gap-2 text-sm font-bold text-green-950"><input name="active" type="checkbox" defaultChecked={option?.active ?? true} /> Disponível</label>
      <button className="mt-5 w-full rounded-2xl bg-green-900 px-5 py-3 font-black text-white">{option ? "Salvar forma de pagamento" : "Criar forma de pagamento"}</button>
    </form>
  );
}

export default async function PagamentosPage({ searchParams }: PageProps) {
  await requireAdmin(["admin", "coordenador"], "/admin/festa-junina/pagamentos");
  const { event, paymentOptions } = await getData();
  const params = await searchParams;
  const editId = firstParam(params?.edit);
  const showNew = firstParam(params?.new) === "1";
  const editingOption = editId ? paymentOptions.find((option) => option.id === editId) : undefined;
  const successMessage = params?.saved ? "Forma de pagamento salva com sucesso." : undefined;

  return (
    <AdminPageShell>
      <section className="mx-auto max-w-6xl px-5 py-10">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-black text-green-900">Vendas · Pagamento</span>
            <h1 className="mt-3 text-3xl font-black text-green-950">Formas de pagamento</h1>
            <p className="mt-2 max-w-3xl text-stone-600">Configure as formas que aparecerão para compra de convites e para consumo no dia da festa. Sempre que possível, peça upload do comprovante ou foto do recibo.</p>
          </div>
          <div className="flex flex-wrap gap-3"><Link href="/admin/festa-junina/pagamentos?new=1" className="rounded-full bg-green-900 px-5 py-3 text-sm font-black text-white" prefetch={false}>Nova forma de pagamento</Link><Link href="/admin/festa-junina" className="rounded-full bg-white px-5 py-3 text-sm font-bold text-green-950 shadow-sm" prefetch={false}>Voltar à gestão</Link></div>
        </div>
        <FormStatusMessage message={successMessage} />
        <div className="mt-6 rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-950"><strong>Comprovantes:</strong> Pix deve usar QR Code/chave do Tucxa. Cartão e dinheiro devem ter foto do recibo/registro com nome e WhatsApp de quem pagou.</div>
        {editingOption || showNew ? <div className="mt-6"><PaymentForm eventId={event.id} option={editingOption} /></div> : null}
        <div className="mt-6 grid gap-5 lg:grid-cols-2">{paymentOptions.map((option) => <PaymentCard key={option.id} option={option} />)}</div>
      </section>
    </AdminPageShell>
  );
}
