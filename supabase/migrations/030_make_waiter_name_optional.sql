-- Permite que o nome do garçom seja opcional no fluxo operacional de 2026.
-- Idempotente: só altera colunas caso as tabelas/colunas existam.

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'event_table_service_sessions'
      and column_name = 'waiter_name'
  ) then
    alter table public.event_table_service_sessions
      alter column waiter_name drop not null;
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'event_consumption_orders'
      and column_name = 'waiter_name'
  ) then
    alter table public.event_consumption_orders
      alter column waiter_name drop not null;
  end if;
end $$;
