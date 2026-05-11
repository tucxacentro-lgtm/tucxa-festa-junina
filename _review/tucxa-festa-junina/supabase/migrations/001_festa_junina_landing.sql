create extension if not exists "pgcrypto";

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  subtitle text,
  description text,
  event_date date,
  start_time time,
  end_time time,
  location_name text,
  location_address text,
  logo_url text,
  hero_image_url text,
  pix_key text,
  pix_receiver_name text,
  allow_public_sales boolean not null default true,
  allow_combos boolean not null default true,
  allow_children_free boolean not null default true,
  children_free_age_limit integer not null default 10,
  status text not null default 'draft' check (status in ('draft', 'published', 'closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ticket_types (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  name text not null,
  description text,
  price numeric(10,2) not null default 0,
  sale_mode text not null default 'online' check (sale_mode in ('online', 'door', 'manual')),
  available_from timestamptz,
  available_until timestamptz,
  max_quantity integer,
  is_free boolean not null default false,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.menu_categories (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  name text not null,
  description text,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.menu_items (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  category_id uuid references public.menu_categories(id) on delete set null,
  name text not null,
  description text,
  price numeric(10,2) not null default 0,
  requires_preparation boolean not null default false,
  planning_enabled boolean not null default true,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.offer_combos (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  name text not null,
  subtitle text,
  description text,
  price numeric(10,2) not null default 0,
  compare_at_price numeric(10,2),
  badge text,
  active boolean not null default true,
  highlighted boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.offer_combo_items (
  id uuid primary key default gen_random_uuid(),
  combo_id uuid not null references public.offer_combos(id) on delete cascade,
  ticket_type_id uuid references public.ticket_types(id) on delete set null,
  menu_item_id uuid references public.menu_items(id) on delete set null,
  quantity integer not null default 1,
  label text,
  created_at timestamptz not null default now()
);

create table if not exists public.payment_options (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  name text not null,
  method text not null check (method in ('pix', 'cash', 'credit', 'debit', 'free', 'manual')),
  instructions text,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.ticket_orders (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  buyer_name text not null,
  buyer_whatsapp text not null,
  buyer_email text,
  adults_quantity integer not null default 1,
  children_quantity integer not null default 0,
  selected_ticket_type_id uuid references public.ticket_types(id) on delete set null,
  selected_combo_id uuid references public.offer_combos(id) on delete set null,
  payment_option_id uuid references public.payment_options(id) on delete set null,
  total_amount numeric(10,2) not null default 0,
  payment_status text not null default 'pending' check (payment_status in ('pending', 'proof_sent', 'paid', 'cancelled')),
  order_status text not null default 'created' check (order_status in ('created', 'confirmed', 'cancelled')),
  notes text,
  planning_answers jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.events enable row level security;
alter table public.ticket_types enable row level security;
alter table public.menu_categories enable row level security;
alter table public.menu_items enable row level security;
alter table public.offer_combos enable row level security;
alter table public.offer_combo_items enable row level security;
alter table public.payment_options enable row level security;
alter table public.ticket_orders enable row level security;

create policy "Public can read published events"
on public.events
for select
using (status = 'published');

create policy "Public can read active ticket types"
on public.ticket_types
for select
using (
  active = true
  and exists (
    select 1 from public.events e
    where e.id = ticket_types.event_id
    and e.status = 'published'
  )
);

create policy "Public can read active menu categories"
on public.menu_categories
for select
using (
  active = true
  and exists (
    select 1 from public.events e
    where e.id = menu_categories.event_id
    and e.status = 'published'
  )
);

create policy "Public can read active menu items"
on public.menu_items
for select
using (
  active = true
  and exists (
    select 1 from public.events e
    where e.id = menu_items.event_id
    and e.status = 'published'
  )
);

create policy "Public can read active combos"
on public.offer_combos
for select
using (
  active = true
  and exists (
    select 1 from public.events e
    where e.id = offer_combos.event_id
    and e.status = 'published'
  )
);

create policy "Public can read combo items"
on public.offer_combo_items
for select
using (
  exists (
    select 1
    from public.offer_combos c
    join public.events e on e.id = c.event_id
    where c.id = offer_combo_items.combo_id
    and c.active = true
    and e.status = 'published'
  )
);

create policy "Public can read active payment options"
on public.payment_options
for select
using (
  active = true
  and exists (
    select 1 from public.events e
    where e.id = payment_options.event_id
    and e.status = 'published'
  )
);

create policy "Public can create ticket orders"
on public.ticket_orders
for insert
with check (
  exists (
    select 1 from public.events e
    where e.id = ticket_orders.event_id
    and e.status = 'published'
    and e.allow_public_sales = true
  )
);