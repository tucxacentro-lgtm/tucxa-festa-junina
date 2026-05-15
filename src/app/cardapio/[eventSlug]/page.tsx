import { notFound } from "next/navigation";
import { createSupabaseAdminClient } from "@/lib/supabaseServer";
import { formatCurrency } from "@/lib/format";
import { createPublicConsumptionOrder } from "./actions";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ eventSlug: string }>; searchParams?: Promise<{ error?: string }> };

type SalesItem = {
  id: string;
  name: string;
  category: string;
  description: string | null;
  price: number | string;
  unit_label: string;
  requires_preparation: boolean;
};

type EventRow = { id: string; slug: string; name: string; event_date: string | null; pix_key: string | null; pix_receiver_name: string | null };

async function getData(eventSlug: string) {
  const supabase = createSupabaseAdminClient();
  const { data: event } = await supabase.from("events").select("id, slug, name, event_date, pix_key, pix_receiver_name").eq("slug", eventSlug).maybeSingle();
  if (!event) return null;
  const { data: items } = await supabase
    .from("event_sales_menu_items")
    .select("id, name, category, description, price, unit_label, requires_preparation")
    .eq("event_id", event.id)
    .eq("active", true)
    .order("category")
    .order("sort_order");
  return { event: event as EventRow, items: (items ?? []) as SalesItem[] };
}

export default async function PublicCardapioPage({ params, searchParams }: PageProps) {
  const { eventSlug } = await params;
  const query = await searchParams;
  const data = await getData(eventSlug);
  if (!data) notFound();
  const { event, items } = data;
  const categories = Array.from(new Set(items.map((item) => item.category)));

  return (
    <main className="min-h-screen bg-[#fff9e6] text-green-950">
      <section className="mx-auto max-w-3xl px-4 py-6">
        <div className="rounded-[2rem] bg-gradient-to-br from-amber-400 to-yellow-300 p-6 shadow-sm">
          <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-black text-green-900">Cardápio público</span>
          <h1 className="mt-4 text-3xl font-black">{event.name}</h1>
          <p className="mt-2 text-sm text-green-950/80">Escolha os itens, informe seu nome/mesa e gere o pedido com total para pagamento.</p>
        </div>

        {query?.error === "no-items" ? <div className="mt-4 rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-800">Selecione pelo menos um item para criar o pedido.</div> : null}

        <form action={createPublicConsumptionOrder.bind(null, event.slug)} className="mt-5 rounded-[2rem] bg-white p-4 shadow-sm">
          <h2 className="text-xl font-black">Novo pedido</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1 text-sm font-bold">Tipo
              <select name="order_mode" className="rounded-2xl border border-stone-200 p-3 font-normal">
                <option value="individual">Individual</option>
                <option value="group">Grupo/família</option>
                <option value="table">Mesa</option>
              </select>
            </label>
            <label className="grid gap-1 text-sm font-bold">Nome/responsável<input required name="customer_name" className="rounded-2xl border border-stone-200 p-3 font-normal" placeholder="Seu nome" /></label>
            <label className="grid gap-1 text-sm font-bold">WhatsApp<input name="customer_phone" className="rounded-2xl border border-stone-200 p-3 font-normal" placeholder="Opcional" /></label>
            <label className="grid gap-1 text-sm font-bold">Mesa/grupo<input name="table_label" className="rounded-2xl border border-stone-200 p-3 font-normal" placeholder="Ex.: Mesa 4" /></label>
          </div>

          <div className="mt-5 grid gap-5">
            {categories.map((category) => (
              <section key={category} className="rounded-3xl bg-stone-50 p-3">
                <h3 className="px-1 text-lg font-black">{category}</h3>
                <div className="mt-3 grid gap-3">
                  {items.filter((item) => item.category === category).map((item) => (
                    <label key={item.id} className="rounded-2xl bg-white p-4 shadow-sm">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-black">{item.name}</p>
                          {item.description ? <p className="mt-1 text-xs text-stone-500">{item.description}</p> : null}
                          <p className="mt-2 font-black text-green-800">{formatCurrency(item.price)} / {item.unit_label}</p>
                        </div>
                        {item.requires_preparation ? <span className="rounded-full bg-amber-50 px-2 py-1 text-[0.65rem] font-black text-amber-900">preparo</span> : null}
                      </div>
                      <input name={`qty_${item.id}`} type="number" min="0" step="1" defaultValue="0" className="mt-3 w-full rounded-2xl border border-stone-200 p-3" />
                    </label>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <label className="mt-4 grid gap-1 text-sm font-bold">Observações<textarea name="notes" className="min-h-20 rounded-2xl border border-stone-200 p-3 font-normal" placeholder="Ex.: sem cebola, entregar na mesa, retirar no balcão..." /></label>
          <button className="mt-4 w-full rounded-2xl bg-green-900 px-5 py-4 font-black text-white">Criar pedido e ver pagamento</button>
        </form>
      </section>
    </main>
  );
}
