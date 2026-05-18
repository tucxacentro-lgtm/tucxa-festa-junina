-- 019_customer_menu_experience_and_suppliers.sql
-- Ajustes de suporte para experiência do cardápio público/mobile e planejamento de fornecedores.
-- Seguro para rodar mais de uma vez.

alter table if exists public.event_operation_settings
  add column if not exists remember_customer_data_enabled boolean not null default true,
  add column if not exists repeat_previous_order_enabled boolean not null default true,
  add column if not exists public_menu_search_enabled boolean not null default true,
  add column if not exists public_menu_category_tabs_enabled boolean not null default true,
  add column if not exists table_qr_enabled boolean not null default true,
  add column if not exists customer_qr_enabled boolean not null default true,
  add column if not exists supplier_suggestions_enabled boolean not null default true;

create table if not exists public.event_suppliers (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references public.events(id) on delete cascade,
  name text not null,
  supplier_type text not null default 'outros',
  contact_name text,
  whatsapp text,
  address text,
  notes text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.event_supplier_items (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references public.events(id) on delete cascade,
  supplier_id uuid references public.event_suppliers(id) on delete cascade,
  item_name text not null,
  item_category text,
  average_price numeric(12,2),
  unit_label text default 'un',
  last_quote_at date,
  notes text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.event_customer_sessions (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references public.events(id) on delete cascade,
  customer_name text,
  customer_phone text,
  table_label text,
  last_order_id uuid,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table if exists public.event_tables
  add column if not exists qr_code_url text;

-- Sugestões genéricas iniciais. Não são fornecedores fechados; servem como roteiro de cotação.
insert into public.event_suppliers (event_id, name, supplier_type, notes)
select e.id, seed.name, seed.supplier_type, seed.notes
from public.events e
cross join (values
  ('Atacados e supermercados de Campinas/SP', 'mercado_atacado', 'Pesquisar bebidas, alimentos, descartáveis e itens prontos. Validar preço e disponibilidade na semana do evento.'),
  ('Distribuidores de bebidas', 'bebidas', 'Pesquisar água, refrigerantes, sucos, gelo e bebidas autorizadas. Avaliar consignação e devolução de fechados.'),
  ('Lojas de embalagens e descartáveis', 'descartaveis', 'Pesquisar copos, pratos, talheres, guardanapos, sacos de lixo, etiquetas e comandas de contingência.'),
  ('Padarias e fornecedores parceiros', 'preparo', 'Pesquisar pães, bolos, doces e itens que podem ser doados ou comprados prontos.')
) as seed(name, supplier_type, notes)
where e.active_for_sales = true
on conflict do nothing;
