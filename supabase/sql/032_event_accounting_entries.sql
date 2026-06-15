-- 032 - Prestação de contas: receitas manuais, despesas e ticket médio
-- Rode no SQL Editor do Supabase antes de publicar os arquivos desta entrega.

create table if not exists public.event_accounting_entries (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  entry_type text not null check (entry_type in ('expense', 'manual_revenue')),
  category text not null,
  description text not null,
  amount numeric(12,2),
  quantity numeric(12,2),
  unit_amount numeric(12,2),
  status text not null default 'confirmed' check (status in ('confirmed', 'pending_value', 'cancelled')),
  occurred_on date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists event_accounting_entries_event_idx
  on public.event_accounting_entries (event_id, entry_type, status);

create unique index if not exists event_accounting_entries_event_unique_seed_idx
  on public.event_accounting_entries (event_id, entry_type, category, description);

insert into public.event_accounting_entries (
  event_id, entry_type, category, description, amount, quantity, unit_amount, status, occurred_on, notes
)
select e.id, v.entry_type, v.category, v.description, v.amount, v.quantity, v.unit_amount, v.status, v.occurred_on::date, v.notes
from public.events e
cross join (values
  ('manual_revenue', 'Convites antecipados', 'Convites antecipados informados pela coordenação', 2600.00::numeric, 130.00::numeric, 20.00::numeric, 'confirmed', '2026-06-14', 'Valor informado externamente. Considerado para ticket médio com R$ 20,00 por convite.'),
  ('expense', 'Mercado', 'Mercado', 1252.57::numeric, null::numeric, null::numeric, 'confirmed', '2026-06-14', null),
  ('expense', 'Decoração', 'Decoração', 205.39::numeric, null::numeric, null::numeric, 'confirmed', '2026-06-14', null),
  ('expense', 'Descartáveis', 'Descartável', 160.05::numeric, null::numeric, null::numeric, 'confirmed', '2026-06-14', null),
  ('expense', 'Gráfico', 'Gráfico', 178.00::numeric, null::numeric, null::numeric, 'confirmed', '2026-06-14', null),
  ('expense', 'Mercado', 'Mercado (carne, molho)', 136.00::numeric, null::numeric, null::numeric, 'confirmed', '2026-06-14', null),
  ('expense', 'Alimentos', 'Pão', 62.50::numeric, null::numeric, null::numeric, 'confirmed', '2026-06-14', null),
  ('expense', 'Alimentos', 'Milho verde', 60.00::numeric, null::numeric, null::numeric, 'confirmed', '2026-06-14', null),
  ('expense', 'Bingo', 'Prendas Bingo', 279.00::numeric, null::numeric, null::numeric, 'confirmed', '2026-06-14', null),
  ('expense', 'Mercado', 'Mercado complementar', 750.00::numeric, null::numeric, null::numeric, 'confirmed', '2026-06-14', null),
  ('expense', 'Estrutura', 'Aluguel espaço/local', 1400.00::numeric, null::numeric, null::numeric, 'confirmed', '2026-06-14', null),
  ('expense', 'Estrutura', 'Mesas alugadas', 250.00::numeric, null::numeric, null::numeric, 'confirmed', '2026-06-14', null),
  ('expense', 'Alimentos', 'Espetinhos frango e carne', 418.77::numeric, null::numeric, null::numeric, 'confirmed', '2026-06-14', null),
  ('expense', 'Alimentos', 'Feijão', 10.49::numeric, null::numeric, null::numeric, 'confirmed', '2026-06-14', null),
  ('expense', 'Alimentos', 'Bolo', 200.00::numeric, null::numeric, null::numeric, 'confirmed', '2026-06-14', null),
  ('expense', 'Estrutura', 'Gelo', 90.00::numeric, null::numeric, null::numeric, 'confirmed', '2026-06-14', null),
  ('expense', 'Equipe', 'Café da manhã', 48.00::numeric, null::numeric, null::numeric, 'confirmed', '2026-06-14', null),
  ('expense', 'Bebidas', 'Bebidas', null::numeric, null::numeric, null::numeric, 'pending_value', '2026-06-14', 'Aguardando valor final das bebidas.')
) as v(entry_type, category, description, amount, quantity, unit_amount, status, occurred_on, notes)
where e.slug = 'arraia-tucxa-2026'
on conflict (event_id, entry_type, category, description) do update set
  amount = excluded.amount,
  quantity = excluded.quantity,
  unit_amount = excluded.unit_amount,
  status = excluded.status,
  occurred_on = excluded.occurred_on,
  notes = excluded.notes,
  updated_at = now();
