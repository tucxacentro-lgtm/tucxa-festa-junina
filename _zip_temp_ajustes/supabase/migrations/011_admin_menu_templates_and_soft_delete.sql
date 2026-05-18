-- 011_admin_menu_templates_and_soft_delete.sql
-- Evolui o cadastro do menu para usar templates padrão, desativação segura e abertura opcional em nova aba.

alter table if exists public.admin_menu_items
  add column if not exists template_key text default 'preparation',
  add column if not exists is_deletable boolean not null default true,
  add column if not exists deleted_at timestamptz,
  add column if not exists opens_in_new_tab boolean not null default false;

update public.admin_menu_items
set template_key = coalesce(template_key, 'preparation')
where template_key is null;

update public.admin_menu_items
set is_deletable = false
where item_key in ('eventos', 'novo_evento', 'menu_configuravel', 'manuais_ajuda', 'painel_evento');

update public.admin_menu_items
set template_key = case
  when item_key like '%relatorios%' then 'report_bi'
  when item_key like '%checklist%' then 'checklist'
  when item_key like '%treinamento%' then 'help'
  when item_key like '%atendimento%' or item_key like '%checkin%' or item_key like '%caixa%' or item_key like '%entrega%' or item_key like '%ocorrencias%' then 'operation'
  when route_path is null then 'preparation'
  else coalesce(template_key, 'module_config')
end
where template_key is null or template_key = 'preparation';

create index if not exists idx_admin_menu_items_deleted_at on public.admin_menu_items(deleted_at);
