-- 008 - Multi-evento, módulos independentes e ingressos oficiais de 2026
-- Rode esta migration após limpar/homologar os dados operacionais antigos.

alter table public.events
  add column if not exists year integer,
  add column if not exists active_for_sales boolean not null default false,
  add column if not exists featured_prize_name text,
  add column if not exists featured_prize_description text;

update public.events
set
  year = coalesce(year, extract(year from event_date)::integer, 2026),
  featured_prize_name = coalesce(featured_prize_name, 'Linda Air Fryer'),
  featured_prize_description = coalesce(featured_prize_description, 'Cada ingresso concorre a uma linda Air Fryer através de um bingo realizado na festa.'),
  active_for_sales = case when slug = 'arraia-tucxa-2026' then true else active_for_sales end
where slug = 'arraia-tucxa-2026';

insert into public.events (
  slug,
  name,
  year,
  subtitle,
  description,
  event_date,
  start_time,
  end_time,
  location_name,
  location_address,
  pix_receiver_name,
  allow_public_sales,
  allow_combos,
  allow_children_free,
  children_free_age_limit,
  status,
  active_for_sales,
  featured_prize_name,
  featured_prize_description
)
values (
  'arraia-tucxa-2026',
  'Arraiá Tucxa 2026',
  2026,
  'Comidas típicas, quadrilha, brincadeiras e muita alegria.',
  'Garanta seu convite antecipado, participe da festa e concorra a uma linda Air Fryer no bingo do evento.',
  '2026-06-14',
  '12:00',
  '17:00',
  'Espaço Santa Fé',
  'Rua Antônio Maurício Ladeira, 474 - Jd Conceição - Campinas',
  'Tucxa',
  true,
  false,
  true,
  10,
  'published',
  true,
  'Linda Air Fryer',
  'Cada ingresso concorre a uma linda Air Fryer através de um bingo realizado na festa.'
)
on conflict (slug) do update set
  name = excluded.name,
  year = excluded.year,
  subtitle = excluded.subtitle,
  description = excluded.description,
  event_date = excluded.event_date,
  start_time = excluded.start_time,
  end_time = excluded.end_time,
  location_name = excluded.location_name,
  location_address = excluded.location_address,
  allow_public_sales = excluded.allow_public_sales,
  allow_combos = excluded.allow_combos,
  allow_children_free = excluded.allow_children_free,
  children_free_age_limit = excluded.children_free_age_limit,
  status = excluded.status,
  active_for_sales = excluded.active_for_sales,
  featured_prize_name = excluded.featured_prize_name,
  featured_prize_description = excluded.featured_prize_description,
  updated_at = now();

create table if not exists public.event_modules (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  module_key text not null,
  enabled boolean not null default true,
  status text not null default 'suggested' check (status in ('not_used', 'suggested', 'configuring', 'in_use', 'done')),
  notes text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(event_id, module_key)
);

create table if not exists public.event_manual_sales (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  presale_paid_quantity integer not null default 0,
  door_paid_quantity integer not null default 0,
  children_free_quantity integer not null default 0,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(event_id)
);

alter table public.event_modules enable row level security;
alter table public.event_manual_sales enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'event_modules' and policyname = 'Service role manages event modules'
  ) then
    create policy "Service role manages event modules"
    on public.event_modules
    for all
    using (true)
    with check (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'event_manual_sales' and policyname = 'Service role manages event manual sales'
  ) then
    create policy "Service role manages event manual sales"
    on public.event_manual_sales
    for all
    using (true)
    with check (true);
  end if;
end $$;

-- Desativa convites antigos do evento 2026 e recria somente os oficiais deste ano.
update public.ticket_types
set active = false
where event_id = (select id from public.events where slug = 'arraia-tucxa-2026');

insert into public.ticket_types (event_id, name, description, price, sale_mode, available_until, active, sort_order)
select
  e.id,
  'Convite antecipado',
  'Convite antecipado R$ 20,00 até 08/06/2026. Cada ingresso concorre a uma linda Air Fryer no bingo da festa.',
  20.00,
  'online',
  '2026-06-08 23:59:59-03'::timestamptz,
  true,
  1
from public.events e
where e.slug = 'arraia-tucxa-2026'
  and not exists (
    select 1 from public.ticket_types t
    where t.event_id = e.id and t.name = 'Convite antecipado' and t.price = 20.00 and t.active = true
  );

insert into public.ticket_types (event_id, name, description, price, sale_mode, available_from, active, sort_order)
select
  e.id,
  'Convite na hora',
  'Convite no dia da festa: R$ 30,00 em 14/06/2026. Cada ingresso concorre a uma linda Air Fryer no bingo da festa.',
  30.00,
  'door',
  '2026-06-14 00:00:00-03'::timestamptz,
  true,
  2
from public.events e
where e.slug = 'arraia-tucxa-2026'
  and not exists (
    select 1 from public.ticket_types t
    where t.event_id = e.id and t.name = 'Convite na hora' and t.price = 30.00 and t.active = true
  );

insert into public.ticket_types (event_id, name, description, price, sale_mode, is_free, active, sort_order)
select
  e.id,
  'Criança até 10 anos',
  'Crianças até 10 anos não pagam.',
  0.00,
  'manual',
  true,
  true,
  3
from public.events e
where e.slug = 'arraia-tucxa-2026'
  and not exists (
    select 1 from public.ticket_types t
    where t.event_id = e.id and t.name = 'Criança até 10 anos' and t.is_free = true and t.active = true
  );

-- Desativa combos para 2026 por decisão inicial dos coordenadores.
do $$
begin
  if to_regclass('public.offer_combos') is not null then
    update public.offer_combos
    set active = false
    where event_id = (select id from public.events where slug = 'arraia-tucxa-2026');
  end if;
end $$;

insert into public.event_manual_sales (event_id, notes)
select id, 'Use este registro caso nem todas as vendas dos convites impressos sejam lançadas no sistema.'
from public.events
where slug = 'arraia-tucxa-2026'
on conflict (event_id) do nothing;

insert into public.event_modules (event_id, module_key, enabled, status, sort_order)
select e.id, modules.module_key, modules.enabled, modules.status, modules.sort_order
from public.events e
cross join (values
  ('configuracao', true, 'in_use', 10),
  ('vendas_ingressos', true, 'in_use', 20),
  ('planejamento', true, 'configuring', 30),
  ('compras', true, 'suggested', 40),
  ('treinamento', true, 'suggested', 50),
  ('simulacao', true, 'suggested', 60),
  ('operacao_execucao', true, 'suggested', 70),
  ('prestacao_contas', true, 'suggested', 80),
  ('cardapio_ficha_tecnica', true, 'configuring', 90),
  ('voluntarios', true, 'configuring', 100),
  ('atendimento_caixa', false, 'not_used', 110)
) as modules(module_key, enabled, status, sort_order)
where e.slug = 'arraia-tucxa-2026'
on conflict (event_id, module_key) do update set
  enabled = excluded.enabled,
  status = excluded.status,
  sort_order = excluded.sort_order,
  updated_at = now();
