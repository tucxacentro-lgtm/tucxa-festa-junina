-- Ajuste do menu: todos os itens ativos do catálogo ficam disponíveis para todos os eventos.
-- O status por evento indica uso, mas não oculta o item do menu lateral.

insert into public.event_menu_items (event_id, menu_item_id, item_key, enabled, status, sort_order, updated_at)
select e.id, ami.id, ami.item_key, true, 'suggested', ami.sort_order, now()
from public.events e
cross join public.admin_menu_items ami
where ami.active = true
on conflict (event_id, item_key) do update set
  menu_item_id = excluded.menu_item_id,
  enabled = true,
  sort_order = coalesce(event_menu_items.sort_order, excluded.sort_order),
  updated_at = now();
