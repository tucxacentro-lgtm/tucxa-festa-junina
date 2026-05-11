-- 004 - Aprovação de comprovantes, indicações/brindes e planejamento inicial

alter table public.ticket_orders
  add column if not exists payment_reviewed_at timestamptz,
  add column if not exists payment_reviewed_by uuid references auth.users(id) on delete set null,
  add column if not exists payment_rejection_reason text;

alter table public.ticket_orders
  drop constraint if exists ticket_orders_payment_status_check;

alter table public.ticket_orders
  add constraint ticket_orders_payment_status_check
  check (payment_status in ('pending', 'proof_sent', 'paid', 'rejected', 'cancelled'));

create table if not exists public.referral_campaigns (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  name text not null default 'Indique amigos para o Arraiá',
  description text,
  active boolean not null default true,
  count_only_paid_orders boolean not null default true,
  share_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.referral_reward_rules (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.referral_campaigns(id) on delete cascade,
  name text not null,
  qualifying_paid_orders integer not null default 1,
  reward_description text not null,
  max_rewards_per_buyer integer,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.planning_assumptions (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  guests_per_table numeric(10,2) not null default 4,
  volunteers_per_50_guests numeric(10,2) not null default 3,
  safety_margin_percent numeric(10,2) not null default 15,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(event_id)
);

create table if not exists public.planning_menu_estimates (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  item_name text not null,
  category text not null,
  consumption_per_adult numeric(10,2) not null default 0,
  consumption_per_child numeric(10,2) not null default 0,
  unit_label text not null default 'un',
  editable_quantity numeric(10,2),
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.referral_campaigns enable row level security;
alter table public.referral_reward_rules enable row level security;
alter table public.planning_assumptions enable row level security;
alter table public.planning_menu_estimates enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'referral_campaigns' and policyname = 'Public can read active referral campaigns'
  ) then
    create policy "Public can read active referral campaigns"
    on public.referral_campaigns
    for select
    using (active = true);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'referral_reward_rules' and policyname = 'Public can read active referral rewards'
  ) then
    create policy "Public can read active referral rewards"
    on public.referral_reward_rules
    for select
    using (active = true);
  end if;
end $$;

insert into public.referral_campaigns (event_id, name, description, active, count_only_paid_orders, share_message)
select
  e.id,
  'Indique amigos para o Arraiá',
  'Campanha de indicação para incentivar compras antecipadas e premiar quem ajudar a divulgar a festa.',
  true,
  true,
  'Garanta seu convite para o Arraiá do Tucxa usando meu link. Assim você ajuda a organização a planejar melhor a festa!'
from public.events e
where e.slug = 'arraia-tucxa-2026'
on conflict do nothing;

insert into public.referral_reward_rules (campaign_id, name, qualifying_paid_orders, reward_description, sort_order)
select c.id, 'Primeira indicação confirmada', 1, '1 cartela promocional de bingo ou brinde definido pela organização', 1
from public.referral_campaigns c
join public.events e on e.id = c.event_id
where e.slug = 'arraia-tucxa-2026'
on conflict do nothing;

insert into public.referral_reward_rules (campaign_id, name, qualifying_paid_orders, reward_description, sort_order)
select c.id, 'Três indicações confirmadas', 3, 'Brinde especial da festa definido pela organização', 2
from public.referral_campaigns c
join public.events e on e.id = c.event_id
where e.slug = 'arraia-tucxa-2026'
on conflict do nothing;

insert into public.planning_assumptions (event_id, guests_per_table, volunteers_per_50_guests, safety_margin_percent, notes)
select id, 4, 3, 15, 'Premissas iniciais. Ajuste conforme a organização da festa.'
from public.events
where slug = 'arraia-tucxa-2026'
on conflict (event_id) do nothing;

insert into public.planning_menu_estimates (event_id, item_name, category, consumption_per_adult, consumption_per_child, unit_label, sort_order)
select e.id, item_name, category, adult_rate, child_rate, unit_label, sort_order
from public.events e
cross join (values
  ('Pastel salgado', 'Comidas', 1.00, 0.50, 'un', 1),
  ('Pastel doce', 'Comidas', 0.35, 0.25, 'un', 2),
  ('Fatia de bolo', 'Comidas', 0.45, 0.35, 'un', 3),
  ('Água', 'Bebidas', 0.45, 0.35, 'un', 4),
  ('Água com gás', 'Bebidas', 0.15, 0.05, 'un', 5),
  ('Refrigerante lata', 'Bebidas', 0.80, 0.50, 'un', 6),
  ('Suco de uva lata', 'Bebidas', 0.20, 0.20, 'un', 7),
  ('Cerveja lata', 'Bebidas', 0.45, 0.00, 'un', 8)
) as defaults(item_name, category, adult_rate, child_rate, unit_label, sort_order)
where e.slug = 'arraia-tucxa-2026'
on conflict do nothing;
