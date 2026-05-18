-- 028 - Cancelamento de mesas/responsáveis/pedidos e histórico logado
-- Permite cancelar pedidos operacionais sem rodar SQL de limpeza manual.
-- Cancelados deixam de aparecer para Garçom/Atendimento e Caixa e ficam no admin logado.

alter table if exists public.event_consumption_orders
  add column if not exists cancelled_at timestamptz,
  add column if not exists cancellation_reason text;

alter table if exists public.event_consumption_orders
  alter column status set default 'received';

-- Amplia a constraint de delivery_status para aceitar cancelamento.
do $$
begin
  if to_regclass('public.event_consumption_orders') is not null then
    if exists (
      select 1 from pg_constraint
      where conname = 'event_consumption_orders_delivery_status_check'
        and conrelid = 'public.event_consumption_orders'::regclass
    ) then
      alter table public.event_consumption_orders drop constraint event_consumption_orders_delivery_status_check;
    end if;

    alter table public.event_consumption_orders
      add constraint event_consumption_orders_delivery_status_check
      check (delivery_status in ('pending','delivered','cancelled'));
  end if;
end $$;


-- Garante rótulos/status esperados nas tabelas atuais, sem depender de constraint existente.
update public.event_consumption_orders
set status = 'cancelled'
where status in ('canceled', 'cancelado');

update public.event_consumption_orders
set payment_status = 'cancelled'
where payment_status in ('canceled', 'cancelado');

update public.event_consumption_orders
set delivery_status = 'cancelled'
where delivery_status in ('canceled', 'cancelado');

update public.event_consumption_order_items
set status = 'cancelled'
where status in ('canceled', 'cancelado');

-- Menu logado: Atendimento > Cancelados
insert into public.admin_menu_items
  (item_key, label, description, section, parent_key, route_path, icon_key, sort_order, default_enabled, implemented, active, not_implemented_message, template_key, is_deletable, opens_in_new_tab, updated_at)
values
  ('operacao_atendimento_cancelados', 'Cancelados', 'Mesas, responsáveis e pedidos cancelados ocultos das telas públicas de Garçom/Atendimento e Caixa.', 'Evento selecionado', 'operacao_atendimento', '/admin/festa-junina/atendimento/cancelados', null, 4435, true, true, true, null, 'operation', true, false, now())
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
join public.admin_menu_items ami on ami.item_key = 'operacao_atendimento_cancelados'
where e.active_for_sales = true
on conflict (event_id, item_key) do update set
  menu_item_id = excluded.menu_item_id,
  enabled = true,
  sort_order = excluded.sort_order,
  updated_at = now();
