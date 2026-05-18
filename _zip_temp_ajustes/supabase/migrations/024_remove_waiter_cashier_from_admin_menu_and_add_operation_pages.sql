-- 024 - Limpeza do menu admin e páginas internas da operação
-- Garçom e Caixa ficam fora do login em /gestao-evento. O menu admin mantém as etapas internas: Check-in, Pedidos, Preparo, Retirada, Entrega e Ocorrências.

create extension if not exists pgcrypto;

create table if not exists public.event_ticket_checkins (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  ticket_order_id uuid not null references public.ticket_orders(id) on delete cascade,
  buyer_code text,
  buyer_name text,
  status text not null default 'checked_in' check (status in ('checked_in','cancelled')),
  notes text,
  checked_in_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(event_id, ticket_order_id)
);

create table if not exists public.event_operation_occurrences (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  title text not null,
  description text,
  area text not null default 'geral',
  responsible_name text,
  status text not null default 'open' check (status in ('open','in_progress','resolved','cancelled')),
  resolution_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_event_ticket_checkins_event_id on public.event_ticket_checkins(event_id);
create index if not exists idx_event_operation_occurrences_event_id on public.event_operation_occurrences(event_id);

-- Remove Garçom/Caixa do menu administrativo porque agora são acessos operacionais fora do login.
update public.admin_menu_items
set active = false,
    default_enabled = false,
    updated_at = now()
where item_key in ('operacao_atendimento_garcom','operacao_atendimento_caixa');

update public.event_menu_items
set enabled = false,
    status = 'not_used',
    updated_at = now()
where item_key in ('operacao_atendimento_garcom','operacao_atendimento_caixa');

insert into public.admin_menu_items
  (item_key, label, description, section, parent_key, route_path, icon_key, sort_order, default_enabled, implemented, active, not_implemented_message, template_key, is_deletable, opens_in_new_tab, updated_at)
values
  ('operacao_atendimento', 'Atendimento', 'Fluxo de atendimento no dia do evento.', 'Evento selecionado', 'operacao', null, null, 440, true, true, true, null, 'operation', true, false, now()),
  ('operacao_atendimento_checkin', 'Check-in', 'Recepção e conferência de código/QR Code ou convite impresso.', 'Evento selecionado', 'operacao_atendimento', '/admin/festa-junina/checkin', null, 441, true, true, true, null, 'operation', true, false, now()),
  ('operacao_atendimento_pedidos', 'Pedidos', 'Visão administrativa dos pedidos de consumo do cardápio.', 'Evento selecionado', 'operacao_atendimento', '/admin/festa-junina/atendimento/pedidos', null, 443, true, true, true, null, 'operation', true, false, now()),
  ('operacao_atendimento_preparo', 'Preparo', 'Fila de cozinha/preparo para pedidos recebidos ou em preparo.', 'Evento selecionado', 'operacao_atendimento', '/admin/festa-junina/preparo', null, 444, true, true, true, null, 'operation', true, false, now()),
  ('operacao_atendimento_retirada', 'Retirada', 'Pedidos prontos aguardando retirada no balcão.', 'Evento selecionado', 'operacao_atendimento', '/admin/festa-junina/retirada', null, 445, true, true, true, null, 'operation', true, false, now()),
  ('operacao_atendimento_entrega', 'Entrega', 'Entrega em mesa e confirmação de entrega.', 'Evento selecionado', 'operacao_atendimento', '/admin/festa-junina/entrega', null, 446, true, true, true, null, 'operation', true, false, now()),
  ('operacao_atendimento_ocorrencias', 'Ocorrências', 'Registro de problemas e decisões durante a operação.', 'Evento selecionado', 'operacao_atendimento', '/admin/festa-junina/ocorrencias', null, 448, true, true, true, null, 'operation', true, false, now())
on conflict (item_key) do update set
  label = excluded.label,
  description = excluded.description,
  section = excluded.section,
  parent_key = excluded.parent_key,
  route_path = excluded.route_path,
  sort_order = excluded.sort_order,
  default_enabled = excluded.default_enabled,
  implemented = excluded.implemented,
  active = true,
  not_implemented_message = excluded.not_implemented_message,
  template_key = excluded.template_key,
  is_deletable = excluded.is_deletable,
  opens_in_new_tab = excluded.opens_in_new_tab,
  updated_at = now();

insert into public.event_menu_items
  (event_id, menu_item_id, item_key, enabled, status, sort_order, updated_at)
select e.id, ami.id, ami.item_key, true, 'suggested', ami.sort_order, now()
from public.events e
join public.admin_menu_items ami on ami.item_key in (
  'operacao_atendimento',
  'operacao_atendimento_checkin',
  'operacao_atendimento_pedidos',
  'operacao_atendimento_preparo',
  'operacao_atendimento_retirada',
  'operacao_atendimento_entrega',
  'operacao_atendimento_ocorrencias'
)
where e.active_for_sales = true
on conflict (event_id, item_key) do update set
  menu_item_id = excluded.menu_item_id,
  enabled = true,
  sort_order = excluded.sort_order,
  updated_at = now();
