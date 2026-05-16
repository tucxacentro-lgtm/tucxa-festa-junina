-- 022 - Acessos operacionais para Garçom e Caixa
-- Acrescenta o item Garçom ao menu configurável e reforça a rota do Caixa.

insert into public.admin_menu_items
  (item_key, label, description, section, parent_key, route_path, icon_key, sort_order, default_enabled, implemented, active, not_implemented_message, template_key, is_deletable, opens_in_new_tab, updated_at)
values
  ('operacao_atendimento_garcom', 'Garçom', 'Pedidos por mesa ou cliente para atendimento/garçom.', 'Evento selecionado', 'operacao_atendimento', '/admin/festa-junina/garcom', null, 442, true, true, true, null, 'operation', true, false, now()),
  ('operacao_atendimento_caixa', 'Caixa', 'Pagamentos, comprovantes e fechamento de caixa por mesa/responsável.', 'Evento selecionado', 'operacao_atendimento', '/admin/festa-junina/caixa', null, 447, true, true, true, null, 'operation', true, false, now())
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
join public.admin_menu_items ami on ami.item_key in ('operacao_atendimento_garcom','operacao_atendimento_caixa')
where e.active_for_sales = true
on conflict (event_id, item_key) do update set
  menu_item_id = excluded.menu_item_id,
  enabled = true,
  sort_order = excluded.sort_order,
  updated_at = now();
