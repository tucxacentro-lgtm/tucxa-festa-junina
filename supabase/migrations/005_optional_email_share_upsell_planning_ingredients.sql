-- 005 - E-mail opcional, compartilhamento, upsell e insumos de planejamento

alter table public.ticket_orders
  alter column buyer_email drop not null,
  add column if not exists assisted_sale boolean not null default false,
  add column if not exists assisted_by_name text,
  add column if not exists support_contact_name text,
  add column if not exists support_contact_phone text;

create table if not exists public.upsell_campaigns (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  name text not null default 'Complementos para o Arraiá',
  description text,
  active boolean not null default true,
  show_after_purchase boolean not null default true,
  email_after_days integer not null default 3,
  whatsapp_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(event_id)
);

create table if not exists public.planning_recipe_ingredients (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  estimate_id uuid not null references public.planning_menu_estimates(id) on delete cascade,
  ingredient_name text not null,
  ingredient_category text not null default 'Insumos',
  amount_per_unit numeric(10,3) not null default 0,
  unit_label text not null default 'un',
  editable_quantity numeric(10,2),
  purchase_status text not null default 'pending' check (purchase_status in ('pending', 'partial', 'purchased')),
  notes text,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.upsell_campaigns enable row level security;
alter table public.planning_recipe_ingredients enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'upsell_campaigns' and policyname = 'Public can read active upsell campaigns'
  ) then
    create policy "Public can read active upsell campaigns"
    on public.upsell_campaigns
    for select
    using (active = true);
  end if;
end $$;

insert into public.upsell_campaigns (event_id, name, description, active, show_after_purchase, email_after_days, whatsapp_message)
select
  id,
  'Complementos para o Arraiá',
  'Mensagem para convidar compradores a completar a experiência com combos, comida, bebida e bingo.',
  true,
  true,
  3,
  'Oi! Sua presença no Arraiá do Tucxa já está registrada. Que tal deixar a festa mais prática incluindo combo de comida, bebida ou cartela de bingo? Assim você evita fila e ajuda a organização a planejar melhor as compras.'
from public.events
where slug = 'arraia-tucxa-2026'
on conflict (event_id) do nothing;

with event_base as (
  select id from public.events where slug = 'arraia-tucxa-2026'
), estimate_base as (
  select pme.id, pme.event_id, pme.item_name
  from public.planning_menu_estimates pme
  join event_base e on e.id = pme.event_id
)
insert into public.planning_recipe_ingredients (event_id, estimate_id, ingredient_name, ingredient_category, amount_per_unit, unit_label, sort_order, notes)
select eb.event_id, eb.id, ingredient_name, ingredient_category, amount_per_unit, unit_label, sort_order, notes
from estimate_base eb
join (values
  ('Pastel salgado', 'Massa de pastel', 'Pastel', 1.000, 'un', 1, 'Ajustar conforme tamanho da massa.'),
  ('Pastel salgado', 'Recheio salgado médio', 'Pastel', 0.080, 'kg', 2, 'Pode ser carne, queijo, palmito ou calabresa.'),
  ('Pastel salgado', 'Óleo para fritura', 'Pastel', 0.020, 'L', 3, 'Estimativa por unidade; ajustar por lote/fritadeira.'),
  ('Pastel salgado', 'Embalagem/guardanapo', 'Descartáveis', 1.000, 'un', 4, 'Um conjunto por pastel.'),
  ('Pastel doce', 'Massa de pastel', 'Pastel doce', 1.000, 'un', 5, 'Ajustar conforme tamanho da massa.'),
  ('Pastel doce', 'Chocolate/banana/leite condensado', 'Pastel doce', 0.070, 'kg', 6, 'Estimativa média por pastel doce.'),
  ('Pastel doce', 'Óleo para fritura', 'Pastel doce', 0.020, 'L', 7, 'Estimativa por unidade; ajustar por lote/fritadeira.'),
  ('Fatia de bolo', 'Bolo/recheio pronto', 'Bolo', 1.000, 'fatia', 8, 'Quantidade equivalente às fatias previstas.'),
  ('Fatia de bolo', 'Prato/embalagem para bolo', 'Descartáveis', 1.000, 'un', 9, 'Um conjunto por fatia.'),
  ('Água', 'Água sem gás', 'Bebidas', 1.000, 'un', 10, 'Comprar conforme formato definido.'),
  ('Água com gás', 'Água com gás', 'Bebidas', 1.000, 'un', 11, 'Comprar conforme formato definido.'),
  ('Refrigerante lata', 'Refrigerante lata variado', 'Bebidas', 1.000, 'un', 12, 'Distribuir entre Coca, Coca Zero, Guaraná e Fanta.'),
  ('Suco de uva lata', 'Suco de uva lata', 'Bebidas', 1.000, 'un', 13, 'Comprar conforme disponibilidade.'),
  ('Cerveja lata', 'Cerveja lata variada', 'Bebidas', 1.000, 'un', 14, 'Distribuir entre marcas definidas.'),
  ('Refrigerante lata', 'Gelo', 'Operação', 0.050, 'kg', 15, 'Estimativa para resfriamento das bebidas.'),
  ('Cerveja lata', 'Gelo', 'Operação', 0.060, 'kg', 16, 'Estimativa para resfriamento das bebidas.'),
  ('Refrigerante lata', 'Saco de lixo/limpeza', 'Operação', 0.010, 'un', 17, 'Estimativa operacional.'),
  ('Cerveja lata', 'Saco de lixo/limpeza', 'Operação', 0.010, 'un', 18, 'Estimativa operacional.')
) as defaults(item_name, ingredient_name, ingredient_category, amount_per_unit, unit_label, sort_order, notes)
  on defaults.item_name = eb.item_name
where not exists (
  select 1
  from public.planning_recipe_ingredients pri
  where pri.estimate_id = eb.id
    and pri.ingredient_name = defaults.ingredient_name
);
