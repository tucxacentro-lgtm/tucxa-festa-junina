-- 031 - Limpeza opcional de pedidos cancelados de teste
-- Use apenas se preferir limpar direto no Supabase em vez do botão "Excluir definitivamente".
-- Ajuste o slug/data se necessário. Esta versão preserva os cancelados no dia da festa.

with evento_atual as (
  select id, event_date
  from public.events
  where slug = 'arraia-tucxa-2026'
  limit 1
), pedidos_teste_cancelados as (
  select o.id
  from public.event_consumption_orders o
  join evento_atual e on e.id = o.event_id
  where o.status = 'cancelled'
    and (
      e.event_date is null
      or o.cancelled_at is null
      or o.cancelled_at::date <> e.event_date::date
    )
)
delete from public.event_consumption_payments
where order_id in (select id from pedidos_teste_cancelados);

with evento_atual as (
  select id, event_date
  from public.events
  where slug = 'arraia-tucxa-2026'
  limit 1
), pedidos_teste_cancelados as (
  select o.id
  from public.event_consumption_orders o
  join evento_atual e on e.id = o.event_id
  where o.status = 'cancelled'
    and (
      e.event_date is null
      or o.cancelled_at is null
      or o.cancelled_at::date <> e.event_date::date
    )
)
delete from public.event_consumption_order_items
where order_id in (select id from pedidos_teste_cancelados);

with evento_atual as (
  select id, event_date
  from public.events
  where slug = 'arraia-tucxa-2026'
  limit 1
), pedidos_teste_cancelados as (
  select o.id
  from public.event_consumption_orders o
  join evento_atual e on e.id = o.event_id
  where o.status = 'cancelled'
    and (
      e.event_date is null
      or o.cancelled_at is null
      or o.cancelled_at::date <> e.event_date::date
    )
)
delete from public.event_consumption_orders
where id in (select id from pedidos_teste_cancelados);
