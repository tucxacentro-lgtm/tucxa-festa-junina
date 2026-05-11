-- 006 - Notificações operacionais, cardápio/ficha técnica e voluntários

-- E-mail operacional que deve sempre receber cópias via aplicação:
-- tucxacentro@gmail.com. A aplicação também permite configurar TUCXA_OPERATIONS_EMAIL.

create table if not exists public.event_volunteers (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  name text not null,
  whatsapp text,
  email text,
  role text not null default 'Apoio geral',
  availability text,
  notes text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.event_volunteers enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'event_volunteers'
      and policyname = 'Service role manages event volunteers'
  ) then
    create policy "Service role manages event volunteers"
    on public.event_volunteers
    for all
    using (true)
    with check (true);
  end if;
end $$;

alter table public.planning_menu_estimates
  add column if not exists preparation_mode text,
  add column if not exists requires_preparation boolean not null default false,
  add column if not exists stock_notes text;

-- Ajustes úteis para ficha técnica e modo de preparo dos itens já existentes.
update public.planning_menu_estimates
set requires_preparation = true,
    preparation_mode = coalesce(preparation_mode, 'Preparar conforme demanda e organizar em lotes para reduzir fila.'),
    stock_notes = coalesce(stock_notes, 'Quantidade final deve ser ajustada pela coordenação conforme confirmações e compras pendentes.')
where lower(item_name) like '%pastel%' or lower(item_name) like '%bolo%';

update public.planning_menu_estimates
set requires_preparation = false,
    preparation_mode = coalesce(preparation_mode, 'Item pronto para separação/entrega. Conferir refrigeração e estoque.'),
    stock_notes = coalesce(stock_notes, 'Comprar com margem para consumo no local e reposição.')
where lower(category) like '%bebida%' or lower(item_name) like '%água%' or lower(item_name) like '%refrigerante%' or lower(item_name) like '%cerveja%' or lower(item_name) like '%suco%';

-- Voluntários iniciais como placeholders editáveis.
with event_base as (
  select id from public.events where slug = 'arraia-tucxa-2026'
)
insert into public.event_volunteers (event_id, name, role, availability, notes, active)
select id, name, role, availability, notes, true
from event_base
cross join (values
  ('A definir - Compras', 'Organização/compras', 'Antes da festa', 'Responsável por consolidar lista de compras e acompanhar status.'),
  ('A definir - Cozinha', 'Preparo/cozinha', 'Durante a festa', 'Responsável por preparo dos itens com ficha técnica.'),
  ('A definir - Atendimento', 'Atendimento/garçom', 'Durante a festa', 'Responsável por atendimento e apoio aos participantes.'),
  ('A definir - Caixa', 'Caixa', 'Durante a festa', 'Responsável por conferência de pagamentos e fechamento.'),
  ('A definir - Entrega', 'Entrega/retirada', 'Durante a festa', 'Responsável por separação e entrega/retirada de itens.')
) as defaults(name, role, availability, notes)
where not exists (
  select 1 from public.event_volunteers v
  where v.event_id = event_base.id
    and v.name = defaults.name
    and v.role = defaults.role
);

-- Mensagem de upsell ajustada para Deep Dive/praticidade e planejamento.
update public.upsell_campaigns
set whatsapp_message = 'Oi, {nome}! Sua presença no Arraiá do Tucxa já está registrada 🎉

Para deixar o dia da festa mais prático, você pode complementar sua compra com combo de comida, bebida ou cartela de bingo.

Assim você evita fila, ajuda a organização a comprar a quantidade certa e chega com parte da experiência já resolvida.

Acesse aqui para complementar: {link_compra_adicional}',
    description = 'Mensagem para convidar compradores a completar a experiência com combos, comida, bebida e bingo, destacando praticidade, menos fila e ajuda no planejamento da festa.',
    updated_at = now()
where event_id in (select id from public.events where slug = 'arraia-tucxa-2026');
