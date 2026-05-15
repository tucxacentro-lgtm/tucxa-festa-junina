-- 018 - Regras flexíveis de operação por evento
-- Permite configurar, por evento, como funcionarão convites, QR Codes, mesas,
-- pedidos, comanda em papel, preparo, separação, entrega, caixa, divisão de pagamento e comprovantes.

create extension if not exists pgcrypto;

create table if not exists public.event_operation_settings (
  event_id uuid primary key references public.events(id) on delete cascade,
  sales_source_mode text not null default 'mixed' check (sales_source_mode in ('system_only','manual_only','mixed')),
  invite_manual_upload_enabled boolean not null default true,
  menu_access_mode text not null default 'event_and_table_qr' check (menu_access_mode in ('event_qr','table_qr','guest_qr','event_and_table_qr')),
  table_assignment_mode text not null default 'optional' check (table_assignment_mode in ('none','optional','required_for_orders')),
  order_entry_mode text not null default 'waiter_and_guest' check (order_entry_mode in ('guest_only','waiter_only','cashier_only','waiter_and_guest','all_modes')),
  paper_ticket_enabled boolean not null default true,
  kitchen_start_required boolean not null default false,
  kitchen_finish_required boolean not null default true,
  separation_required boolean not null default true,
  delivery_mode text not null default 'waiter_or_pickup' check (delivery_mode in ('waiter','pickup','waiter_or_pickup','by_item_type')),
  delivery_confirmation_mode text not null default 'optional_any_actor' check (delivery_confirmation_mode in ('none','requester','waiter','separation','optional_any_actor')),
  payment_mode text not null default 'per_order_or_closing' check (payment_mode in ('per_order','closing_by_table','closing_by_responsible','per_order_or_closing')),
  split_payment_enabled boolean not null default true,
  proof_upload_required boolean not null default true,
  proof_upload_actor text not null default 'client_waiter_cashier' check (proof_upload_actor in ('client','waiter','cashier','client_waiter_cashier','not_required')),
  tv_pickup_enabled boolean not null default true,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_event_operation_settings_event_id on public.event_operation_settings(event_id);

insert into public.event_operation_settings (
  event_id,
  sales_source_mode,
  invite_manual_upload_enabled,
  menu_access_mode,
  table_assignment_mode,
  order_entry_mode,
  paper_ticket_enabled,
  kitchen_start_required,
  kitchen_finish_required,
  separation_required,
  delivery_mode,
  delivery_confirmation_mode,
  payment_mode,
  split_payment_enabled,
  proof_upload_required,
  proof_upload_actor,
  tv_pickup_enabled,
  notes,
  updated_at
)
select
  e.id,
  'mixed',
  true,
  'event_and_table_qr',
  'optional',
  'waiter_and_guest',
  true,
  false,
  true,
  true,
  'waiter_or_pickup',
  'optional_any_actor',
  'per_order_or_closing',
  true,
  true,
  'client_waiter_cashier',
  true,
  'Configuração inicial flexível para permitir sistema + manual + planilha, pedidos por garçom ou convidado, comanda de papel, retirada/entrega e pagamento por pedido ou fechamento.',
  now()
from public.events e
where coalesce(e.active_for_sales, false) = true
on conflict (event_id) do nothing;

-- Cadastro do item no menu configurável.
insert into public.admin_menu_items (
  item_key,
  label,
  description,
  section,
  parent_key,
  route_path,
  icon_key,
  sort_order,
  default_enabled,
  implemented,
  active,
  not_implemented_message,
  template_key,
  updated_at
)
values (
  'operacao_configuracao',
  'Configuração Operacional',
  'Regras flexíveis para convites, mesas, QR Codes, pedidos, preparo, entrega, caixa, divisão de pagamento e comprovantes.',
  'Evento selecionado',
  'operacao',
  '/admin/festa-junina/operacao/configuracao',
  'settings',
  401,
  true,
  true,
  true,
  null,
  'module_config',
  now()
)
on conflict (item_key) do update set
  label = excluded.label,
  description = excluded.description,
  section = excluded.section,
  parent_key = excluded.parent_key,
  route_path = excluded.route_path,
  icon_key = excluded.icon_key,
  sort_order = excluded.sort_order,
  default_enabled = excluded.default_enabled,
  implemented = excluded.implemented,
  active = true,
  not_implemented_message = excluded.not_implemented_message,
  template_key = excluded.template_key,
  updated_at = now();

-- Garante que o item apareça no evento ativo/selecionado.
insert into public.event_menu_items (event_id, menu_item_id, item_key, enabled, status, sort_order, updated_at)
select e.id, ami.id, ami.item_key, true, 'configuring', ami.sort_order, now()
from public.events e
join public.admin_menu_items ami on ami.item_key = 'operacao_configuracao'
where coalesce(e.active_for_sales, false) = true
on conflict (event_id, item_key) do update set
  menu_item_id = excluded.menu_item_id,
  enabled = true,
  status = case
    when event_menu_items.status = 'not_used' then 'configuring'
    else event_menu_items.status
  end,
  sort_order = coalesce(event_menu_items.sort_order, excluded.sort_order),
  updated_at = now();
