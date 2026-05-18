-- 023 - Acessos operacionais, voluntários por função, insumos e itens finais
-- Cria controle de itens finais e insumos, reforça cadastro de voluntários e adiciona base inicial a partir do cardápio.

create extension if not exists pgcrypto;

alter table if exists public.event_volunteers
  add column if not exists email text,
  add column if not exists whatsapp text,
  add column if not exists availability text,
  add column if not exists notes text,
  add column if not exists active boolean not null default true,
  add column if not exists updated_at timestamptz not null default now();

create table if not exists public.event_purchase_final_items (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  sales_menu_item_id uuid references public.event_sales_menu_items(id) on delete set null,
  name text not null,
  category text,
  item_type text not null default 'ready_for_sale' check (item_type in ('ready_for_sale','requires_preparation','bingo','support')),
  planned_quantity numeric(12,2) not null default 0,
  purchased_quantity numeric(12,2) not null default 0,
  consumed_quantity numeric(12,2) not null default 0,
  unit_label text not null default 'un',
  sales_price numeric(12,2) not null default 0,
  estimated_cost numeric(12,2) not null default 0,
  actual_cost numeric(12,2) not null default 0,
  storage_location text,
  status text not null default 'planned' check (status in ('planned','to_buy','bought','preparing','ready','unavailable')),
  notes text,
  active boolean not null default true,
  sort_order integer not null default 999,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(event_id, name)
);

create table if not exists public.event_purchase_ingredients (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  final_item_id uuid references public.event_purchase_final_items(id) on delete set null,
  sales_menu_item_id uuid references public.event_sales_menu_items(id) on delete set null,
  name text not null,
  category text,
  planned_quantity numeric(12,2) not null default 0,
  purchased_quantity numeric(12,2) not null default 0,
  unit_label text not null default 'un',
  estimated_unit_cost numeric(12,2) not null default 0,
  actual_unit_cost numeric(12,2) not null default 0,
  supplier_hint text,
  storage_location text,
  status text not null default 'planned' check (status in ('planned','to_buy','bought','stored','checked')),
  notes text,
  active boolean not null default true,
  sort_order integer not null default 999,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_event_purchase_final_items_event_id on public.event_purchase_final_items(event_id);
create index if not exists idx_event_purchase_ingredients_event_id on public.event_purchase_ingredients(event_id);
create index if not exists idx_event_purchase_ingredients_final_item_id on public.event_purchase_ingredients(final_item_id);
create unique index if not exists event_purchase_ingredients_event_name_final_unique
  on public.event_purchase_ingredients(event_id, name, final_item_id) nulls not distinct;

alter table public.event_purchase_final_items enable row level security;
alter table public.event_purchase_ingredients enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'event_purchase_final_items'
      and policyname = 'Service role manages event purchase final items'
  ) then
    create policy "Service role manages event purchase final items"
    on public.event_purchase_final_items
    for all
    using (true)
    with check (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'event_purchase_ingredients'
      and policyname = 'Service role manages event purchase ingredients'
  ) then
    create policy "Service role manages event purchase ingredients"
    on public.event_purchase_ingredients
    for all
    using (true)
    with check (true);
  end if;
end $$;

-- Atualiza menu de cabeçalho por código; aqui reforçamos rotas operacionais no menu configurável.
insert into public.admin_menu_items
  (item_key, label, description, section, parent_key, route_path, icon_key, sort_order, default_enabled, implemented, active, not_implemented_message, template_key, is_deletable, opens_in_new_tab, updated_at)
values
  ('operacao_atendimento_garcom', 'Garçom', 'Pedidos por mesa ou cliente para atendimento/garçom.', 'Evento selecionado', 'operacao_atendimento', '/gestao-evento/garcom', null, 442, true, true, true, null, 'operation', true, false, now()),
  ('operacao_atendimento_caixa', 'Caixa', 'Pagamentos, comprovantes e fechamento de caixa por mesa/responsável.', 'Evento selecionado', 'operacao_atendimento', '/gestao-evento/caixa', null, 447, true, true, true, null, 'operation', true, false, now())
on conflict (item_key) do update set
  route_path = excluded.route_path,
  label = excluded.label,
  description = excluded.description,
  updated_at = now();

-- Itens finais iniciais a partir do cardápio de vendas.
insert into public.event_purchase_final_items
  (event_id, sales_menu_item_id, name, category, item_type, unit_label, sales_price, estimated_cost, status, active, sort_order, notes, updated_at)
select
  s.event_id,
  s.id,
  s.name,
  s.category,
  case
    when lower(s.category) like '%bingo%' then 'bingo'
    when s.requires_preparation then 'requires_preparation'
    else 'ready_for_sale'
  end,
  s.unit_label,
  s.price,
  coalesce(s.suggested_unit_cost, 0),
  case when s.active then 'planned' else 'unavailable' end,
  s.active,
  s.sort_order,
  'Criado a partir do cardápio de vendas. Ajustar quantidade prevista, compras, custo e armazenamento conforme validação da coordenação.',
  now()
from public.event_sales_menu_items s
join public.events e on e.id = s.event_id
where e.active_for_sales = true
on conflict (event_id, name) do update set
  sales_menu_item_id = excluded.sales_menu_item_id,
  category = excluded.category,
  item_type = excluded.item_type,
  unit_label = excluded.unit_label,
  sales_price = excluded.sales_price,
  estimated_cost = case when public.event_purchase_final_items.estimated_cost = 0 then excluded.estimated_cost else public.event_purchase_final_items.estimated_cost end,
  active = excluded.active,
  sort_order = excluded.sort_order,
  updated_at = now();

-- Insumos gerais de apoio.
with event_base as (
  select id from public.events where active_for_sales = true
), default_ingredients(name, category, planned_quantity, unit_label, estimated_unit_cost, supplier_hint, notes, sort_order) as (
  values
    ('Gelo', 'Apoio', 20, 'kg', 8, 'Mercado, distribuidor de bebidas ou fornecedor local.', 'Validar necessidade conforme bebidas e conservação.', 10),
    ('Guardanapos', 'Descartáveis', 300, 'un', 0.08, 'Loja de embalagens, atacado ou mercado.', 'Separar por caixa, mesas e retirada.', 20),
    ('Copos descartáveis', 'Descartáveis', 250, 'un', 0.12, 'Loja de embalagens, atacado ou mercado.', 'Comprar com margem de segurança.', 30),
    ('Pratos descartáveis', 'Descartáveis', 200, 'un', 0.25, 'Loja de embalagens, atacado ou mercado.', 'Validar se serão usados conforme cardápio.', 40),
    ('Sacos de lixo', 'Limpeza', 20, 'un', 1.50, 'Mercado ou loja de limpeza.', 'Separar para cozinha, salão e área externa.', 50)
)
insert into public.event_purchase_ingredients
  (event_id, name, category, planned_quantity, unit_label, estimated_unit_cost, supplier_hint, notes, status, sort_order, updated_at)
select e.id, d.name, d.category, d.planned_quantity, d.unit_label, d.estimated_unit_cost, d.supplier_hint, d.notes, 'planned', d.sort_order, now()
from event_base e cross join default_ingredients d
on conflict (event_id, name, final_item_id) do nothing;

-- Insumos base por item preparado/final. São sugestões para os coordenadores ajustarem.
with prepared_items as (
  select f.id as final_item_id, f.event_id, f.name
  from public.event_purchase_final_items f
  where f.active = true
), ingredient_seed(item_match, name, category, qty, unit_label, cost, supplier_hint, sort_order) as (
  values
    ('pastel', 'Massa de pastel', 'Ingrediente', 1, 'un', 1.50, 'Atacado, mercado ou fornecedor de massas.', 100),
    ('pastel', 'Recheio do pastel', 'Ingrediente', 1, 'porção', 2.50, 'Mercado, açougue ou fornecedor definido pela cozinha.', 101),
    ('cachorro', 'Pão de hot dog', 'Ingrediente', 1, 'un', 1.20, 'Padaria ou atacado.', 110),
    ('cachorro', 'Salsicha', 'Ingrediente', 1, 'un', 1.40, 'Mercado ou atacado.', 111),
    ('cachorro', 'Molho/condimentos', 'Ingrediente', 1, 'porção', 0.80, 'Mercado ou atacado.', 112),
    ('pipoca', 'Milho de pipoca', 'Ingrediente', 1, 'porção', 0.80, 'Mercado ou atacado.', 120),
    ('pipoca', 'Saquinho/embalagem de pipoca', 'Descartáveis', 1, 'un', 0.15, 'Loja de embalagens.', 121),
    ('chocolate quente', 'Leite', 'Ingrediente', 0.2, 'l', 1.20, 'Mercado ou atacado.', 130),
    ('chocolate quente', 'Chocolate em pó', 'Ingrediente', 0.03, 'kg', 1.00, 'Mercado ou atacado.', 131),
    ('café', 'Pó de café', 'Ingrediente', 0.02, 'kg', 0.80, 'Mercado ou atacado.', 140),
    ('milho', 'Milho verde', 'Ingrediente', 1, 'un', 2.00, 'Mercado, hortifruti ou atacado.', 150)
)
insert into public.event_purchase_ingredients
  (event_id, final_item_id, name, category, planned_quantity, unit_label, estimated_unit_cost, supplier_hint, notes, status, sort_order, updated_at)
select
  p.event_id,
  p.final_item_id,
  s.name,
  s.category,
  s.qty,
  s.unit_label,
  s.cost,
  s.supplier_hint,
  'Sugestão inicial por unidade/porção do item final. Ajustar quantidade total pela simulação de público e ficha técnica.',
  'planned',
  s.sort_order,
  now()
from prepared_items p
join ingredient_seed s on lower(p.name) like '%' || s.item_match || '%'
on conflict (event_id, name, final_item_id) do nothing;
