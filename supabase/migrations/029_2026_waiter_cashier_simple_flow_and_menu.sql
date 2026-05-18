-- 029 - Fluxo 2026 simplificado para Garçom/Atendimento e Caixa + cardápio oficial
-- IMPORTANTE: esta migration não remove funcionalidades do sistema logado.
-- Ela apenas ajusta o uso operacional público de garçom/caixa e atualiza o cardápio de vendas de 2026.

create extension if not exists pgcrypto;

alter table if exists public.event_consumption_orders
  add column if not exists service_session_id uuid references public.event_table_service_sessions(id) on delete set null,
  add column if not exists waiter_name text,
  add column if not exists settlement_mode text not null default 'fechamento_final';

alter table if exists public.event_table_service_sessions
  add column if not exists responsible_phone text,
  add column if not exists notes text,
  add column if not exists updated_at timestamptz default now();

create index if not exists idx_event_table_service_sessions_responsible
  on public.event_table_service_sessions(event_id, lower(coalesce(responsible_name, '')));

create index if not exists idx_event_consumption_orders_service_session
  on public.event_consumption_orders(event_id, service_session_id);

-- No fluxo 2026, o atendimento operacional padrão será fechamento no caixa ao final.
update public.event_table_service_sessions
set settlement_mode = 'fechamento_final', updated_at = now()
where settlement_mode is null or settlement_mode not in ('por_pedido', 'fechamento_final');

update public.event_consumption_orders
set settlement_mode = 'fechamento_final', updated_at = now()
where settlement_mode is null or settlement_mode not in ('por_pedido', 'fechamento_final');

-- Cardápio oficial definido pela coordenação.
-- Não apaga os itens antigos: apenas deixa ativos os itens oficiais abaixo para o cardápio público de 2026.
with target_event as (
  select id
  from public.events
  where slug = 'arraia-tucxa-2026'
  order by created_at desc
  limit 1
), official_items(name, category, description, price, unit_label, requires_preparation, sort_order) as (
  values
    ('Cachorro-quente pequeno', 'Comidas', 'Cachorro-quente pequeno.', 10.00::numeric, 'un', true, 10),
    ('Batata frita', 'Comidas', 'Porção de batata frita.', 10.00::numeric, 'un', true, 20),
    ('Pastel carne/queijo/palmito', 'Comidas', 'Pastel nos sabores carne, queijo ou palmito.', 12.00::numeric, 'un', true, 30),
    ('Lanche pernil', 'Comidas', 'Lanche de pernil.', 12.00::numeric, 'un', true, 40),
    ('Milho verde', 'Comidas', 'Milho verde.', 8.00::numeric, 'un', true, 50),
    ('Caldo de feijão', 'Comidas', 'Caldo de feijão.', 8.00::numeric, 'un', true, 60),
    ('Espetinho de carne', 'Comidas', 'Espetinho de carne.', 13.00::numeric, 'un', true, 70),
    ('Kafta', 'Comidas', 'Kafta.', 12.00::numeric, 'un', true, 80),
    ('Frango', 'Comidas', 'Espetinho de frango.', 12.00::numeric, 'un', true, 90),
    ('Bolo recheado', 'Doces', 'Bolo recheado.', 12.00::numeric, 'un', false, 110),
    ('Maçã do amor', 'Doces', 'Maçã do amor.', 10.00::numeric, 'un', false, 120),
    ('Canjica', 'Doces', 'Canjica.', 6.00::numeric, 'un', true, 130),
    ('Doces diversos', 'Doces', 'Doces diversos.', 6.00::numeric, 'un', false, 140),
    ('Cerveja Heineken', 'Bebidas', 'Cerveja Heineken.', 10.00::numeric, 'un', false, 210),
    ('Cerveja Império/Original', 'Bebidas', 'Cerveja Império ou Original.', 7.00::numeric, 'un', false, 220),
    ('Refrigerante', 'Bebidas', 'Refrigerante.', 7.00::numeric, 'un', false, 230),
    ('Água', 'Bebidas', 'Água.', 4.00::numeric, 'un', false, 240),
    ('Suco', 'Bebidas', 'Suco.', 8.00::numeric, 'un', false, 250),
    ('Vinho quente', 'Bebidas', 'Vinho quente.', 8.00::numeric, 'un', true, 260),
    ('Quentão', 'Bebidas', 'Quentão.', 8.00::numeric, 'un', true, 270)
), deactivate_old as (
  update public.event_sales_menu_items s
  set active = false, updated_at = now()
  from target_event e
  where s.event_id = e.id
    and not exists (select 1 from official_items i where i.name = s.name)
  returning s.id
)
insert into public.event_sales_menu_items
  (event_id, name, category, description, price, unit_label, requires_preparation, active, sort_order, updated_at)
select
  e.id,
  i.name,
  i.category,
  i.description,
  i.price,
  i.unit_label,
  i.requires_preparation,
  true,
  i.sort_order,
  now()
from target_event e
cross join official_items i
on conflict (event_id, name) do update set
  category = excluded.category,
  description = excluded.description,
  price = excluded.price,
  unit_label = excluded.unit_label,
  requires_preparation = excluded.requires_preparation,
  active = true,
  sort_order = excluded.sort_order,
  updated_at = now();
