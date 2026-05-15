-- 017 - Cardápio público, sincronização preparo/vendas e simulações financeiras

-- Pais/agrupadores do menu não devem ser clicáveis; somente folhas abrem páginas.
update public.admin_menu_items
set route_path = null, updated_at = now()
where item_key in (
  'vendas',
  'vendas_convites',
  'vendas_conveniencias',
  'vendas_conveniencias_cardapio',
  'operacao',
  'operacao_voluntarios',
  'operacao_compras',
  'operacao_atendimento',
  'operacao_prestacao_contas'
);

alter table if exists public.planning_menu_estimates
  add column if not exists sales_price numeric(10,2) not null default 0,
  add column if not exists requires_preparation boolean not null default false,
  add column if not exists preparation_mode text,
  add column if not exists equipment_notes text,
  add column if not exists volunteer_role_suggestion text,
  add column if not exists is_sales_item boolean not null default true,
  add column if not exists menu_group text,
  add column if not exists average_unit_cost numeric(10,2) not null default 0;

alter table if exists public.event_sales_menu_items
  add column if not exists preparation_estimate_id uuid references public.planning_menu_estimates(id) on delete set null,
  add column if not exists average_unit_cost numeric(10,2) not null default 0;

-- Sugestões editáveis de custo médio para planejamento. Validar antes de comprar.
update public.planning_menu_estimates
set average_unit_cost = case lower(item_name)
  when 'pastel salgado' then 5.50
  when 'pastel doce' then 4.80
  when 'cachorro-quente' then 4.50
  when 'milho verde' then 3.00
  when 'pipoca' then 1.80
  when 'fatia de bolo' then 5.50
  when 'paçoca' then 1.60
  when 'pé de moleque' then 2.20
  when 'água' then 2.20
  when 'refrigerante lata' then 4.20
  when 'suco lata' then 4.00
  when 'cerveja' then 4.50
  when 'café' then 1.20
  when 'chocolate quente' then 2.80
  when 'cartela de bingo' then 0.50
  else coalesce(nullif(average_unit_cost, 0), coalesce(sales_price, 0) * 0.45)
end,
updated_at = now()
where active = true;

-- Todo item ativo e marcado como item de venda no cardápio de preparo aparece no cardápio de vendas.
insert into public.event_sales_menu_items
  (event_id, name, category, description, price, unit_label, requires_preparation, preparation_estimate_id, average_unit_cost, active, sort_order, updated_at)
select
  p.event_id,
  p.item_name,
  coalesce(p.menu_group, p.category, 'Cardápio'),
  'Item sincronizado a partir do cardápio de preparo/ficha técnica.',
  coalesce(p.sales_price, 0),
  coalesce(p.unit_label, 'un'),
  coalesce(p.requires_preparation, false),
  p.id,
  coalesce(p.average_unit_cost, 0),
  true,
  coalesce(p.sort_order, 100),
  now()
from public.planning_menu_estimates p
where p.active = true and coalesce(p.is_sales_item, true) = true
on conflict (event_id, name) do update set
  category = excluded.category,
  description = coalesce(public.event_sales_menu_items.description, excluded.description),
  price = case when public.event_sales_menu_items.price = 0 then excluded.price else public.event_sales_menu_items.price end,
  unit_label = excluded.unit_label,
  requires_preparation = excluded.requires_preparation,
  preparation_estimate_id = excluded.preparation_estimate_id,
  average_unit_cost = excluded.average_unit_cost,
  active = true,
  sort_order = excluded.sort_order,
  updated_at = now();

-- Alguns itens comuns que podem ter sido criados manualmente sem preço de venda.
update public.event_sales_menu_items s
set price = p.sales_price,
    average_unit_cost = p.average_unit_cost,
    preparation_estimate_id = p.id,
    updated_at = now()
from public.planning_menu_estimates p
where s.event_id = p.event_id
  and lower(s.name) = lower(p.item_name)
  and (s.preparation_estimate_id is null or s.price = 0);
