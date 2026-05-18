-- 027 - Atendimento por mesa/responsável e fechamento no caixa
-- Campos opcionais para registrar garçom e regra de pagamento do pedido de consumo.

create extension if not exists pgcrypto;

alter table if exists public.event_consumption_orders
  add column if not exists waiter_name text,
  add column if not exists settlement_mode text not null default 'por_pedido';

do $$
begin
  if to_regclass('public.event_consumption_orders') is not null
     and not exists (
       select 1
       from pg_constraint
       where conname = 'event_consumption_orders_settlement_mode_check'
     ) then
    alter table public.event_consumption_orders
      add constraint event_consumption_orders_settlement_mode_check
      check (settlement_mode in ('por_pedido','fechamento_final')) not valid;
  end if;
end $$;

create index if not exists idx_event_consumption_orders_table_label
  on public.event_consumption_orders(event_id, table_label);

create index if not exists idx_event_consumption_orders_customer_name
  on public.event_consumption_orders(event_id, customer_name);

create index if not exists idx_event_consumption_orders_waiter_name
  on public.event_consumption_orders(event_id, waiter_name);

create table if not exists public.event_table_service_sessions (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  table_label text not null,
  responsible_name text,
  responsible_phone text,
  waiter_name text,
  settlement_mode text not null default 'por_pedido' check (settlement_mode in ('por_pedido','fechamento_final')),
  status text not null default 'open' check (status in ('open','closed','cancelled')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_event_table_service_sessions_event
  on public.event_table_service_sessions(event_id, status, table_label);
