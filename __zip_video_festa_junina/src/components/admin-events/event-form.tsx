import type { EventConfig } from "@/types/festa-junina";
import { saveEvent } from "@/app/admin/festa-junina/eventos/actions";

type EventRow = Partial<EventConfig> & {
  year?: number | null;
  active_for_sales?: boolean | null;
  featured_prize_name?: string | null;
  featured_prize_description?: string | null;
};

export function EventForm({ event }: { event?: EventRow }) {
  return (
    <form action={saveEvent} className="grid gap-5 rounded-[2rem] border border-green-100 bg-white p-6 shadow-sm">
      <input type="hidden" name="id" value={event?.id ?? ""} />

      <div className="grid gap-4 md:grid-cols-3">
        <label className="grid gap-2 text-sm font-bold text-green-950 md:col-span-2">
          Nome do evento
          <input name="name" required defaultValue={event?.name ?? "Arraiá Tucxa 2026"} className="rounded-2xl border border-stone-200 p-3 font-normal" />
        </label>
        <label className="grid gap-2 text-sm font-bold text-green-950">
          Ano
          <input name="year" type="number" required defaultValue={event?.year ?? 2026} className="rounded-2xl border border-stone-200 p-3 font-normal" />
        </label>
        <label className="grid gap-2 text-sm font-bold text-green-950 md:col-span-2">
          Slug
          <input name="slug" defaultValue={event?.slug ?? "arraia-tucxa-2026"} className="rounded-2xl border border-stone-200 p-3 font-normal" />
        </label>
        <label className="grid gap-2 text-sm font-bold text-green-950">
          Status
          <select name="status" defaultValue={event?.status ?? "published"} className="rounded-2xl border border-stone-200 p-3 font-normal">
            <option value="draft">Rascunho</option>
            <option value="published">Publicado</option>
            <option value="closed">Encerrado</option>
          </select>
        </label>
        <label className="grid gap-2 text-sm font-bold text-green-950 md:col-span-3">
          Subtítulo
          <input name="subtitle" defaultValue={event?.subtitle ?? "Comidas típicas, quadrilha, brincadeiras e muita alegria."} className="rounded-2xl border border-stone-200 p-3 font-normal" />
        </label>
        <label className="grid gap-2 text-sm font-bold text-green-950 md:col-span-3">
          Descrição
          <textarea name="description" defaultValue={event?.description ?? "Garanta seu convite antecipado, participe da festa e concorra a uma linda Air Fryer no bingo do evento."} className="min-h-24 rounded-2xl border border-stone-200 p-3 font-normal" />
        </label>
        <label className="grid gap-2 text-sm font-bold text-green-950">
          Data
          <input name="event_date" type="date" defaultValue={event?.event_date ?? "2026-06-14"} className="rounded-2xl border border-stone-200 p-3 font-normal" />
        </label>
        <label className="grid gap-2 text-sm font-bold text-green-950">
          Início
          <input name="start_time" type="time" defaultValue={event?.start_time?.slice(0, 5) ?? "12:00"} className="rounded-2xl border border-stone-200 p-3 font-normal" />
        </label>
        <label className="grid gap-2 text-sm font-bold text-green-950">
          Fim
          <input name="end_time" type="time" defaultValue={event?.end_time?.slice(0, 5) ?? "17:00"} className="rounded-2xl border border-stone-200 p-3 font-normal" />
        </label>
        <label className="grid gap-2 text-sm font-bold text-green-950">
          Local
          <input name="location_name" defaultValue={event?.location_name ?? "Espaço Santa Fé"} className="rounded-2xl border border-stone-200 p-3 font-normal" />
        </label>
        <label className="grid gap-2 text-sm font-bold text-green-950 md:col-span-2">
          Endereço
          <input name="location_address" defaultValue={event?.location_address ?? "Rua Antônio Maurício Ladeira, 474 — Jd. Conceição — Campinas/SP"} className="rounded-2xl border border-stone-200 p-3 font-normal" />
        </label>
        <label className="grid gap-2 text-sm font-bold text-green-950">
          Brinde/sorteio
          <input name="featured_prize_name" defaultValue={event?.featured_prize_name ?? "Linda Air Fryer"} className="rounded-2xl border border-stone-200 p-3 font-normal" />
        </label>
        <label className="grid gap-2 text-sm font-bold text-green-950 md:col-span-2">
          Descrição do brinde
          <input name="featured_prize_description" defaultValue={event?.featured_prize_description ?? "Cada ingresso concorre a uma linda Air Fryer através de um bingo realizado na festa."} className="rounded-2xl border border-stone-200 p-3 font-normal" />
        </label>
      </div>

      <div className="rounded-[1.75rem] border border-green-100 bg-green-50/40 p-5">
        <h2 className="text-xl font-black text-green-950">Estrutura do local e capacidade</h2>
        <p className="mt-2 text-sm leading-relaxed text-stone-700">
          Informações usadas para simular quantidade confortável de convites, mesas, voluntários, compras, filas e execução no dia do evento.
        </p>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <label className="grid gap-2 text-sm font-bold text-green-950 md:col-span-2">
            Site do local
            <input name="venue_site_url" defaultValue={event?.venue_site_url ?? "https://espacosantafe.com.br/"} className="rounded-2xl border border-stone-200 p-3 font-normal" />
          </label>
          <label className="grid gap-2 text-sm font-bold text-green-950">
            Avaliação/divulgação
            <input name="venue_rating_label" defaultValue={event?.venue_rating_label ?? "Avaliação 4,9 estrelas"} className="rounded-2xl border border-stone-200 p-3 font-normal" />
          </label>
          <label className="grid gap-2 text-sm font-bold text-green-950">
            E-mail do local
            <input name="venue_contact_email" defaultValue={event?.venue_contact_email ?? "contato@espacosantafe.com.br"} className="rounded-2xl border border-stone-200 p-3 font-normal" />
          </label>
          <label className="grid gap-2 text-sm font-bold text-green-950">
            Telefone/WhatsApp do local
            <input name="venue_contact_phone" defaultValue={event?.venue_contact_phone ?? "(19) 99859-1015"} className="rounded-2xl border border-stone-200 p-3 font-normal" />
          </label>
          <label className="grid gap-2 text-sm font-bold text-green-950">
            Capacidade salão coberto
            <input name="covered_hall_capacity" type="number" defaultValue={event?.covered_hall_capacity ?? 80} className="rounded-2xl border border-stone-200 p-3 font-normal" />
          </label>
          <label className="grid gap-2 text-sm font-bold text-green-950">
            Capacidade operacional planejada
            <input name="operational_capacity" type="number" defaultValue={event?.operational_capacity ?? 80} className="rounded-2xl border border-stone-200 p-3 font-normal" />
          </label>
          <label className="grid gap-2 text-sm font-bold text-green-950">
            Duração estimada do evento (h)
            <input name="event_duration_hours" type="number" step="0.5" defaultValue={event?.event_duration_hours ?? 5} className="rounded-2xl border border-stone-200 p-3 font-normal" />
          </label>
          <label className="grid gap-2 text-sm font-bold text-green-950">
            Permanência média (h)
            <input name="average_stay_hours" type="number" step="0.5" defaultValue={event?.average_stay_hours ?? 4} className="rounded-2xl border border-stone-200 p-3 font-normal" />
          </label>
          <label className="grid gap-2 text-sm font-bold text-green-950">
            Margem de segurança (%)
            <input name="safety_margin_percent" type="number" defaultValue={event?.safety_margin_percent ?? 15} className="rounded-2xl border border-stone-200 p-3 font-normal" />
          </label>
          <label className="grid gap-2 text-sm font-bold text-green-950">
            Mesas estimadas
            <input name="estimated_tables" type="number" defaultValue={event?.estimated_tables ?? 20} className="rounded-2xl border border-stone-200 p-3 font-normal" />
          </label>
          <label className="grid gap-2 text-sm font-bold text-green-950">
            Cadeiras estimadas
            <input name="estimated_chairs" type="number" defaultValue={event?.estimated_chairs ?? 80} className="rounded-2xl border border-stone-200 p-3 font-normal" />
          </label>
          <label className="grid gap-2 text-sm font-bold text-green-950">
            Freezers
            <input name="freezer_count" type="number" defaultValue={event?.freezer_count ?? 1} className="rounded-2xl border border-stone-200 p-3 font-normal" />
          </label>
          <label className="grid gap-2 text-sm font-bold text-green-950">
            Geladeiras
            <input name="refrigerator_count" type="number" defaultValue={event?.refrigerator_count ?? 1} className="rounded-2xl border border-stone-200 p-3 font-normal" />
          </label>
          <label className="grid gap-2 text-sm font-bold text-green-950 md:col-span-3">
            Descrição/observações do local
            <textarea name="venue_description" defaultValue={event?.venue_description ?? "Espaço para eventos de pequeno e médio porte, com área gourmet, piscina aquecida, salão coberto para até 80 pessoas, mesas, cadeiras, ventilação e som ambiente."} className="min-h-20 rounded-2xl border border-stone-200 p-3 font-normal" />
          </label>
          <label className="grid gap-2 text-sm font-bold text-green-950 md:col-span-3">
            Observações de recursos, preparo e armazenamento
            <textarea name="venue_resources_notes" defaultValue={event?.venue_resources_notes ?? "Área gourmet com churrasqueira, freezer, geladeira, bebedouro, fogão a gás e fogão à lenha. Piscina com área rasa para crianças e aquecimento solar."} className="min-h-20 rounded-2xl border border-stone-200 p-3 font-normal" />
          </label>
          <label className="grid gap-2 text-sm font-bold text-green-950 md:col-span-3">
            Premissas de capacidade e conforto
            <textarea name="capacity_notes" defaultValue={event?.capacity_notes ?? "Usar 80 pessoas como referência inicial do salão coberto. Ajustar capacidade operacional conforme circulação, filas, crianças, cardápio, voluntários e tempo médio de permanência."} className="min-h-20 rounded-2xl border border-stone-200 p-3 font-normal" />
          </label>
        </div>

        <div className="mt-5 grid gap-3 rounded-3xl bg-white/70 p-4 md:grid-cols-3">
          <label className="flex items-center gap-2 text-sm font-bold text-green-950"><input name="has_gourmet_area" type="checkbox" defaultChecked={event?.has_gourmet_area ?? true} /> Área gourmet</label>
          <label className="flex items-center gap-2 text-sm font-bold text-green-950"><input name="has_barbecue_grill" type="checkbox" defaultChecked={event?.has_barbecue_grill ?? true} /> Churrasqueira</label>
          <label className="flex items-center gap-2 text-sm font-bold text-green-950"><input name="has_freezer" type="checkbox" defaultChecked={event?.has_freezer ?? true} /> Freezer</label>
          <label className="flex items-center gap-2 text-sm font-bold text-green-950"><input name="has_refrigerator" type="checkbox" defaultChecked={event?.has_refrigerator ?? true} /> Geladeira</label>
          <label className="flex items-center gap-2 text-sm font-bold text-green-950"><input name="has_water_fountain" type="checkbox" defaultChecked={event?.has_water_fountain ?? true} /> Bebedouro</label>
          <label className="flex items-center gap-2 text-sm font-bold text-green-950"><input name="has_gas_stove" type="checkbox" defaultChecked={event?.has_gas_stove ?? true} /> Fogão a gás</label>
          <label className="flex items-center gap-2 text-sm font-bold text-green-950"><input name="has_wood_stove" type="checkbox" defaultChecked={event?.has_wood_stove ?? true} /> Fogão à lenha</label>
          <label className="flex items-center gap-2 text-sm font-bold text-green-950"><input name="has_heated_pool" type="checkbox" defaultChecked={event?.has_heated_pool ?? true} /> Piscina aquecida</label>
          <label className="flex items-center gap-2 text-sm font-bold text-green-950"><input name="has_kids_pool_area" type="checkbox" defaultChecked={event?.has_kids_pool_area ?? true} /> Área rasa para crianças</label>
          <label className="flex items-center gap-2 text-sm font-bold text-green-950"><input name="has_covered_hall" type="checkbox" defaultChecked={event?.has_covered_hall ?? true} /> Salão coberto</label>
          <label className="flex items-center gap-2 text-sm font-bold text-green-950"><input name="has_tables" type="checkbox" defaultChecked={event?.has_tables ?? true} /> Mesas</label>
          <label className="flex items-center gap-2 text-sm font-bold text-green-950"><input name="has_chairs" type="checkbox" defaultChecked={event?.has_chairs ?? true} /> Cadeiras</label>
          <label className="flex items-center gap-2 text-sm font-bold text-green-950"><input name="has_ventilation" type="checkbox" defaultChecked={event?.has_ventilation ?? true} /> Ventilação</label>
          <label className="flex items-center gap-2 text-sm font-bold text-green-950"><input name="has_sound_system" type="checkbox" defaultChecked={event?.has_sound_system ?? true} /> Som ambiente</label>
        </div>
      </div>

      <div className="grid gap-3 rounded-3xl bg-amber-50 p-4 md:grid-cols-4">
        <label className="flex items-center gap-2 text-sm font-bold text-green-950"><input name="active_for_sales" type="checkbox" defaultChecked={event?.active_for_sales ?? true} /> Evento aberto/selecionado</label>
        <label className="flex items-center gap-2 text-sm font-bold text-green-950"><input name="allow_public_sales" type="checkbox" defaultChecked={event?.allow_public_sales ?? true} /> Vendas públicas</label>
        <label className="flex items-center gap-2 text-sm font-bold text-green-950"><input name="allow_combos" type="checkbox" defaultChecked={event?.allow_combos ?? false} /> Combos</label>
        <label className="flex items-center gap-2 text-sm font-bold text-green-950"><input name="allow_children_free" type="checkbox" defaultChecked={event?.allow_children_free ?? true} /> Crianças grátis</label>
      </div>

      <input type="hidden" name="children_free_age_limit" value={event?.children_free_age_limit ?? 10} />
      <button className="rounded-2xl bg-green-900 px-5 py-3 font-black text-white transition hover:bg-green-800">{event?.id ? "Salvar evento" : "Criar evento"}</button>
    </form>
  );
}
