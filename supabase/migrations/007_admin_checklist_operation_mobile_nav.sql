-- 007 - Checklist operacional, operação/armazenamento e simulações

create table if not exists public.event_operational_checklist (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  title text not null,
  description text,
  status text not null default 'pending' check (status in ('pending', 'suggested', 'in_progress', 'confirmed')),
  notes text,
  href text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(event_id, title)
);

create table if not exists public.event_storage_locations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  name text not null,
  item_group text,
  responsible_name text,
  status text not null default 'pending' check (status in ('pending', 'partial', 'confirmed')),
  notes text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.event_simulation_runs (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  name text not null,
  scenario text,
  responsible_name text,
  status text not null default 'planned' check (status in ('planned', 'running', 'done', 'issue')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.event_operational_checklist enable row level security;
alter table public.event_storage_locations enable row level security;
alter table public.event_simulation_runs enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'event_operational_checklist' and policyname = 'Service role manages event operational checklist'
  ) then
    create policy "Service role manages event operational checklist"
    on public.event_operational_checklist
    for all
    using (true)
    with check (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'event_storage_locations' and policyname = 'Service role manages event storage locations'
  ) then
    create policy "Service role manages event storage locations"
    on public.event_storage_locations
    for all
    using (true)
    with check (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'event_simulation_runs' and policyname = 'Service role manages event simulation runs'
  ) then
    create policy "Service role manages event simulation runs"
    on public.event_simulation_runs
    for all
    using (true)
    with check (true);
  end if;
end $$;

with event_base as (
  select id from public.events where slug = 'arraia-tucxa-2026'
)
insert into public.event_operational_checklist (event_id, title, description, status, href, sort_order)
select id, title, description, status, href, sort_order
from event_base
cross join (values
  ('Configurar evento, data, local e Pix', 'Confirmar informações públicas, data, horário, local, chave Pix e status publicado.', 'suggested', '/admin/festa-junina/configuracoes', 1),
  ('Configurar convites e valores', 'Revisar valores, gratuidade para crianças e disponibilidade de venda.', 'suggested', '/admin/festa-junina/convites', 2),
  ('Configurar combos e ofertas', 'Definir combos de convite, comida, bebida, bingo e ofertas especiais.', 'suggested', '/admin/festa-junina/combos', 3),
  ('Revisar página pública', 'Testar a página pública no computador e no celular, incluindo QR Code e link de indicação.', 'pending', '/festa-junina', 4),
  ('Cadastrar cardápio e ficha técnica', 'Definir itens, categorias, consumo por pessoa, preparo e insumos.', 'pending', '/admin/festa-junina/cardapio', 5),
  ('Revisar planejamento de compras', 'Validar sugestões por pagamentos aprovados, pendentes, mesas, voluntários e insumos.', 'pending', '/admin/festa-junina/planejamento', 6),
  ('Cadastrar voluntários e funções', 'Definir responsáveis por compras, preparo, atendimento, caixa, entrega e coordenação.', 'pending', '/admin/festa-junina/voluntarios', 7),
  ('Confirmar compras e local de armazenamento', 'Registrar onde ficarão bebidas, gelo, descartáveis, alimentos e materiais de apoio.', 'pending', '/admin/festa-junina/operacao', 8),
  ('Testar compra de convite', 'Fazer compra de teste com e sem e-mail, WhatsApp obrigatório e comprovante.', 'pending', '/festa-junina', 9),
  ('Aprovar/reprovar comprovante de teste', 'Validar e-mails, status, cópias operacionais e link da área do comprador.', 'pending', '/admin/festa-junina/pedidos', 10),
  ('Simular entrada por QR Code', 'Ler QR Code pelo celular e confirmar que abre a URL pública sem login da Vercel.', 'pending', '/admin/festa-junina/operacao', 11),
  ('Simular atendimento e caixa/pagamento', 'Testar fluxo de atendimento, fechamento, conferência de pagamento e contingência.', 'pending', '/admin/festa-junina/operacao', 12),
  ('Treinar equipe e validar infraestrutura', 'Confirmar internet, celulares/notebooks, responsáveis e plano B caso a internet falhe.', 'pending', '/admin/festa-junina/operacao', 13),
  ('Validar relatório e prestação de contas', 'Conferir se os dados ajudam a coordenação e presidência no fechamento do evento.', 'pending', '/admin/festa-junina/pedidos', 14)
) as defaults(title, description, status, href, sort_order)
where not exists (
  select 1 from public.event_operational_checklist c
  where c.event_id = event_base.id and c.title = defaults.title
);

with event_base as (
  select id from public.events where slug = 'arraia-tucxa-2026'
)
insert into public.event_storage_locations (event_id, name, item_group, responsible_name, status, notes)
select id, name, item_group, responsible_name, status, notes
from event_base
cross join (values
  ('A definir - bebidas geladas', 'Bebidas/gelo', null, 'pending', 'Definir freezer, caixa térmica ou local de armazenamento.'),
  ('A definir - insumos de preparo', 'Pastel/bolo/ingredientes', null, 'pending', 'Definir onde ficam ingredientes e quem controla retirada.'),
  ('A definir - descartáveis e limpeza', 'Descartáveis/operação', null, 'pending', 'Separar guardanapos, pratos, copos, sacos de lixo e materiais de limpeza.')
) as defaults(name, item_group, responsible_name, status, notes)
where not exists (
  select 1 from public.event_storage_locations l
  where l.event_id = event_base.id and l.name = defaults.name
);

with event_base as (
  select id from public.events where slug = 'arraia-tucxa-2026'
)
insert into public.event_simulation_runs (event_id, name, scenario, responsible_name, status, notes)
select id, name, scenario, responsible_name, status, notes
from event_base
cross join (values
  ('Compra de teste com comprovante', 'Cliente compra, anexa comprovante e admin aprova/reprova.', null, 'planned', 'Validar e-mails, WhatsApp manual e área do comprador.'),
  ('Leitura de QR Code na entrada', 'Celular lê QR Code e abre área do comprador na URL pública.', null, 'planned', 'Confirmar que não abre localhost nem login da Vercel.'),
  ('Simulação de atendimento e caixa', 'Fluxo de comprador, atendimento, conferência de pagamento e apoio operacional.', null, 'planned', 'Registrar pendências e pontos de melhoria.')
) as defaults(name, scenario, responsible_name, status, notes)
where not exists (
  select 1 from public.event_simulation_runs s
  where s.event_id = event_base.id and s.name = defaults.name
);
