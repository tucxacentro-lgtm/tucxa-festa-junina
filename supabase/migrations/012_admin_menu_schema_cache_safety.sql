-- 012_admin_menu_schema_cache_safety.sql
-- Garante que as colunas opcionais usadas pelo cadastro visual do menu existam no banco.
-- Depois de rodar, se o Supabase ainda acusar schema cache antigo, aguarde alguns instantes ou reabra o SQL Editor.

alter table if exists public.admin_menu_items
  add column if not exists template_key text default 'preparation',
  add column if not exists is_deletable boolean not null default true,
  add column if not exists deleted_at timestamptz,
  add column if not exists opens_in_new_tab boolean not null default false;

update public.admin_menu_items
set template_key = coalesce(template_key, 'preparation')
where template_key is null;

create index if not exists idx_admin_menu_items_deleted_at on public.admin_menu_items(deleted_at);
