-- 021 - Cadastro de funções de voluntários em cards
-- Cria uma camada específica para planejar funções, quantidades sugeridas, responsabilidades e status.

create extension if not exists pgcrypto;

create table if not exists public.event_volunteer_functions (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  function_key text not null,
  name text not null,
  description text,
  area text,
  suggested_quantity integer not null default 1,
  confirmed_quantity integer not null default 0,
  shift_label text,
  responsibilities text,
  notes text,
  status text not null default 'suggested' check (status in ('suggested','confirmed','needs_people','inactive')),
  active boolean not null default true,
  sort_order integer not null default 999,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(event_id, function_key)
);

create index if not exists idx_event_volunteer_functions_event_id on public.event_volunteer_functions(event_id);
create index if not exists idx_event_volunteer_functions_status on public.event_volunteer_functions(event_id, status);

alter table public.event_volunteer_functions enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'event_volunteer_functions'
      and policyname = 'Service role manages event volunteer functions'
  ) then
    create policy "Service role manages event volunteer functions"
    on public.event_volunteer_functions
    for all
    using (true)
    with check (true);
  end if;
end $$;

with event_base as (
  select id from public.events where slug = 'arraia-tucxa-2026'
), defaults as (
  select * from (values
    ('coordenacao_geral','Coordenação geral','Coordenação',2,'Antes e durante a festa','Organiza decisões, responsáveis, prioridades, comunicação e resolução de dúvidas.','Validar fluxo operacional; acompanhar vendas; alinhar voluntários; resolver exceções; apoiar prestação de contas.',10),
    ('checkin_entrada','Check-in/entrada','Entrada',2,'Início do evento','Confere convite, código ou QR Code na entrada e orienta participantes.','Conferir convites; orientar sobre cardápio; direcionar mesas; acionar coordenação em divergências.',20),
    ('caixa_pagamento','Caixa/pagamento','Caixa',2,'Durante a festa','Confere pagamentos, comprovantes, Pix, cartão, dinheiro e fechamento.','Registrar pagamento; conferir comprovantes; apoiar divisão de pagamento; controlar pendências e fechamento.',30),
    ('atendimento_garcom','Atendimento/garçom','Atendimento',4,'Durante a festa','Apoia convidados, registra ou confere pedidos e faz atendimento nas mesas.','Orientar cardápio; lançar pedidos; acompanhar mesas; apoiar entrega quando necessário.',40),
    ('cozinha_preparo','Cozinha/preparo','Cozinha',4,'Durante a festa','Prepara comidas e bebidas que exigem produção ou montagem.','Seguir ficha técnica; controlar estoque; sinalizar preparo/pronto quando usado; avisar falta de insumos.',50),
    ('separacao_entrega','Separação/entrega','Entrega',3,'Durante a festa','Separa pedidos prontos e organiza entrega ou retirada pelo cliente.','Conferir pedido, nome e mesa; separar itens; confirmar entrega; apoiar TV de retirada quando usada.',60),
    ('compras_armazenamento','Compras/armazenamento','Compras',2,'Antes da festa','Organiza compras, recebimento, armazenamento e distribuição dos itens.','Conferir lista de compras; cotar fornecedores; armazenar itens; separar insumos por área.',70),
    ('apoio_limpeza','Apoio/limpeza','Apoio',2,'Durante e após a festa','Apoia organização, limpeza, reposição, filas e necessidades emergenciais.','Repor descartáveis; apoiar filas; manter áreas organizadas; acionar coordenação quando necessário.',80)
  ) as v(function_key, name, area, suggested_quantity, shift_label, description, responsibilities, sort_order)
)
insert into public.event_volunteer_functions (
  event_id,
  function_key,
  name,
  area,
  suggested_quantity,
  shift_label,
  description,
  responsibilities,
  status,
  active,
  sort_order,
  updated_at
)
select
  event_base.id,
  defaults.function_key,
  defaults.name,
  defaults.area,
  defaults.suggested_quantity,
  defaults.shift_label,
  defaults.description,
  defaults.responsibilities,
  'suggested',
  true,
  defaults.sort_order,
  now()
from event_base
cross join defaults
on conflict (event_id, function_key) do nothing;
