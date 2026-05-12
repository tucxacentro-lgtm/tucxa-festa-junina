-- Limpeza operacional para reiniciar a homologação da Festa Junina.
-- Este script NÃO apaga auth.users nem public.admin_profiles.
-- Rode primeiro o bloco A para conferir. Depois rode o bloco B para limpar.

-- A) Conferência segura: não referencia tabelas inexistentes diretamente.
do $$
declare
  table_name text;
  total bigint;
  tables_to_check text[] := array[
    'ticket_order_items',
    'ticket_orders',
    'bingo_referral_rewards',
    'referral_rewards',
    'referral_reward_rules',
    'referral_campaigns',
    'upsell_send_log',
    'upsell_campaign_offers',
    'upsell_campaigns',
    'event_volunteers',
    'volunteer_roles',
    'planning_purchase_suggestions',
    'planning_item_recipes',
    'planning_ingredients',
    'planning_recipe_ingredients',
    'planning_menu_estimates',
    'planning_assumptions',
    'event_storage_locations',
    'event_simulation_runs',
    'event_operational_checklist',
    'event_manual_sales',
    'event_modules',
    'offer_combos',
    'ticket_types',
    'payment_options',
    'event_payment_methods'
  ];
begin
  foreach table_name in array tables_to_check loop
    if to_regclass('public.' || table_name) is not null then
      execute format('select count(*) from public.%I', table_name) into total;
      raise notice '%: % registros', table_name, total;
    else
      raise notice '%: tabela não existe, ignorada', table_name;
    end if;
  end loop;
end $$;

-- B) Limpeza destrutiva de dados operacionais.
-- Descomente/rode este bloco apenas quando tiver certeza.
do $$
declare
  table_name text;
  tables_to_clean text[] := array[
    'ticket_order_items',
    'ticket_orders',
    'bingo_referral_rewards',
    'referral_rewards',
    'referral_reward_rules',
    'referral_campaigns',
    'upsell_send_log',
    'upsell_campaign_offers',
    'upsell_campaigns',
    'event_volunteers',
    'volunteer_roles',
    'planning_purchase_suggestions',
    'planning_item_recipes',
    'planning_ingredients',
    'planning_recipe_ingredients',
    'planning_menu_estimates',
    'planning_assumptions',
    'event_storage_locations',
    'event_simulation_runs',
    'event_operational_checklist',
    'event_manual_sales',
    'event_modules',
    'offer_combos',
    'ticket_types',
    'payment_options',
    'event_payment_methods'
  ];
begin
  foreach table_name in array tables_to_clean loop
    if to_regclass('public.' || table_name) is not null then
      execute format('truncate table public.%I restart identity cascade', table_name);
      raise notice 'Tabela limpa: %', table_name;
    else
      raise notice 'Tabela não existe, ignorada: %', table_name;
    end if;
  end loop;
end $$;

-- C) Depois da limpeza, rode a migration 008_events_modules_2026_tickets.sql
-- para recriar o evento 2026, os ingressos oficiais, módulos e vendas manuais.
