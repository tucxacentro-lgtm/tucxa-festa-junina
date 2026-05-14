-- 013_event_venue_capacity_and_menu_seed.sql
-- Amplia o cadastro do evento com dados do Espaço Santa Fé/capacidade e atualiza o catálogo do menu conforme Tucxa-FestaJunina.xlsx.

alter table if exists public.events
  add column if not exists venue_site_url text,
  add column if not exists venue_contact_email text,
  add column if not exists venue_contact_phone text,
  add column if not exists venue_rating_label text,
  add column if not exists venue_description text,
  add column if not exists covered_hall_capacity integer,
  add column if not exists operational_capacity integer,
  add column if not exists event_duration_hours numeric,
  add column if not exists average_stay_hours numeric,
  add column if not exists safety_margin_percent numeric,
  add column if not exists estimated_tables integer,
  add column if not exists estimated_chairs integer,
  add column if not exists has_gourmet_area boolean not null default false,
  add column if not exists has_barbecue_grill boolean not null default false,
  add column if not exists has_freezer boolean not null default false,
  add column if not exists freezer_count integer,
  add column if not exists has_refrigerator boolean not null default false,
  add column if not exists refrigerator_count integer,
  add column if not exists has_water_fountain boolean not null default false,
  add column if not exists has_gas_stove boolean not null default false,
  add column if not exists has_wood_stove boolean not null default false,
  add column if not exists has_heated_pool boolean not null default false,
  add column if not exists has_kids_pool_area boolean not null default false,
  add column if not exists has_covered_hall boolean not null default false,
  add column if not exists has_tables boolean not null default false,
  add column if not exists has_chairs boolean not null default false,
  add column if not exists has_ventilation boolean not null default false,
  add column if not exists has_sound_system boolean not null default false,
  add column if not exists venue_resources_notes text,
  add column if not exists capacity_notes text;

update public.events
set
  venue_site_url = coalesce(venue_site_url, 'https://espacosantafe.com.br/'),
  venue_contact_email = coalesce(venue_contact_email, 'contato@espacosantafe.com.br'),
  venue_contact_phone = coalesce(venue_contact_phone, '(19) 99859-1015'),
  venue_rating_label = coalesce(venue_rating_label, 'Avaliação 4,9 estrelas'),
  venue_description = coalesce(venue_description, 'Espaço para eventos de pequeno e médio porte, com área gourmet, piscina aquecida, salão coberto para até 80 pessoas, mesas, cadeiras, ventilação e som ambiente.'),
  covered_hall_capacity = coalesce(covered_hall_capacity, 80),
  operational_capacity = coalesce(operational_capacity, 80),
  event_duration_hours = coalesce(event_duration_hours, 5),
  average_stay_hours = coalesce(average_stay_hours, 4),
  safety_margin_percent = coalesce(safety_margin_percent, 15),
  estimated_tables = coalesce(estimated_tables, 20),
  estimated_chairs = coalesce(estimated_chairs, 80),
  has_gourmet_area = true,
  has_barbecue_grill = true,
  has_freezer = true,
  freezer_count = coalesce(freezer_count, 1),
  has_refrigerator = true,
  refrigerator_count = coalesce(refrigerator_count, 1),
  has_water_fountain = true,
  has_gas_stove = true,
  has_wood_stove = true,
  has_heated_pool = true,
  has_kids_pool_area = true,
  has_covered_hall = true,
  has_tables = true,
  has_chairs = true,
  has_ventilation = true,
  has_sound_system = true,
  venue_resources_notes = coalesce(venue_resources_notes, 'Área gourmet com churrasqueira, freezer, geladeira, bebedouro, fogão a gás e fogão à lenha. Piscina com área rasa para crianças e aquecimento solar.'),
  capacity_notes = coalesce(capacity_notes, 'Usar 80 pessoas como referência inicial do salão coberto. Ajustar capacidade operacional conforme circulação, filas, crianças, cardápio, voluntários e tempo médio de permanência.'),
  updated_at = now()
where slug = 'arraia-tucxa-2026' or active_for_sales = true;

-- Garante colunas opcionais do menu.
alter table if exists public.admin_menu_items
  add column if not exists template_key text default 'preparation',
  add column if not exists is_deletable boolean not null default true,
  add column if not exists opens_in_new_tab boolean not null default false;

insert into public.admin_menu_items
  (item_key, label, description, section, parent_key, route_path, icon_key, sort_order, default_enabled, implemented, active, not_implemented_message, template_key, is_deletable, opens_in_new_tab)
values
  ('menu_configuravel', 'Menu', 'Cadastro e configuração da estrutura do menu do sistema.', 'Geral', null, '/admin/festa-junina/menu', null, 10, true, true, true, null, 'module_config', true, false),
  ('eventos', 'Eventos', 'Cadastro e configuração das edições da Festa Junina.', 'Geral', null, '/admin/festa-junina/eventos', null, 20, true, true, true, null, 'list_new', true, false),
  ('manuais_ajuda', 'Manuais e Ajuda', 'Documentações, procedimentos e orientações de uso do sistema.', 'Geral', null, '/admin/festa-junina/ajuda', null, 30, true, true, true, null, 'help', true, false),
  ('painel_geral', 'Painel Geral', 'Visão geral de todos os itens do menu e do evento aberto.', 'Evento selecionado', null, '/admin/festa-junina', null, 100, true, true, true, null, 'module_config', true, false),
  ('vendas', 'Vendas', 'Aquisição de receitas para realização do evento.', 'Evento selecionado', null, null, null, 200, true, true, true, null, 'module_config', true, false),
  ('vendas_convites', 'Convites', 'Acesso ao evento e controle dos convites.', 'Evento selecionado', 'vendas', '/admin/festa-junina/convites', null, 210, true, true, true, null, 'list_new', true, false),
  ('vendas_convites_individuais', 'Individuais', 'Cadastro/configuração dos convites individuais.', 'Evento selecionado', 'vendas_convites', '/admin/festa-junina/convites', null, 211, true, true, true, null, 'list_new', true, false),
  ('vendas_convites_combos', 'Combos', 'Cadastro/configuração de combos, quando disponíveis.', 'Evento selecionado', 'vendas_convites', '/admin/festa-junina/combos', null, 212, true, true, true, null, 'list_new', true, false),
  ('vendas_convites_campanhas', 'Campanhas', 'Cadastro/configuração de campanhas e programa de indicações.', 'Evento selecionado', 'vendas_convites', '/admin/festa-junina/indicacoes', null, 213, true, true, true, null, 'module_config', true, false),
  ('vendas_convites_upsell', 'Upsell', 'Receitas adicionais e mensagens para complementar a compra.', 'Evento selecionado', 'vendas_convites', '/admin/festa-junina/upsell', null, 214, true, true, true, null, 'module_config', true, false),
  ('vendas_convites_pagamento', 'Pagamento', 'Cadastro/configuração das formas de pagamento.', 'Evento selecionado', 'vendas_convites', '/admin/festa-junina/pagamentos', null, 215, true, true, true, null, 'module_config', true, false),
  ('vendas_convites_aprovacoes', 'Aprovações', 'Confirmações de pagamentos e acompanhamento de comprovantes.', 'Evento selecionado', 'vendas_convites', '/admin/festa-junina/pedidos', null, 216, true, true, true, null, 'list_new', true, false),
  ('vendas_convites_relatorios', 'Relatórios', 'Base de dados para informações de vendas.', 'Evento selecionado', 'vendas_convites', '/admin/festa-junina/relatorios?modulo=vendas', null, 217, true, true, true, null, 'report_bi', true, false),
  ('vendas_conveniencias', 'Conveniências', 'Experiências no dia do evento.', 'Evento selecionado', 'vendas', null, null, 230, true, true, true, null, 'module_config', true, false),
  ('vendas_conveniencias_cardapio', 'Cardápio', 'Comidas, bebidas e doces.', 'Evento selecionado', 'vendas_conveniencias', '/admin/festa-junina/cardapio', null, 231, true, true, true, null, 'list_new', true, false),
  ('vendas_conveniencias_cardapio_vendas', 'Cardápio Vendas', 'Descrição e preços do cardápio para clientes.', 'Evento selecionado', 'vendas_conveniencias_cardapio', '/admin/festa-junina/cliente-resumo', null, 232, true, true, true, null, 'list_new', true, false),
  ('vendas_conveniencias_cardapio_preparo', 'Cardápio Preparo', 'Ficha técnica, receitas e preparo.', 'Evento selecionado', 'vendas_conveniencias_cardapio', '/admin/festa-junina/cardapio', null, 233, true, true, true, null, 'list_new', true, false),
  ('vendas_conveniencias_bingo', 'Bingo', 'Aquisição de cartelas e ações de bingo vinculadas ao evento.', 'Evento selecionado', 'vendas_conveniencias', '/admin/festa-junina/bingo', null, 234, true, true, true, null, 'module_config', true, false),
  ('vendas_conveniencias_relatorios', 'Relatórios', 'Base de dados para informações das conveniências.', 'Evento selecionado', 'vendas_conveniencias', '/admin/festa-junina/relatorios?modulo=conveniencias', null, 235, true, true, true, null, 'report_bi', true, false),
  ('operacao', 'Operação', 'Ações para que o evento aconteça.', 'Operação', null, null, null, 400, true, true, true, null, 'module_config', true, false),
  ('operacao_voluntarios', 'Voluntários', 'Equipe mão na massa.', 'Operação', 'operacao', '/admin/festa-junina/voluntarios', null, 410, true, true, true, null, 'list_new', true, false),
  ('operacao_voluntarios_funcoes', 'Funções', 'Cadastro de funções dos voluntários.', 'Operação', 'operacao_voluntarios', '/admin/festa-junina/voluntarios/funcoes', null, 411, true, true, true, null, 'list_new', true, false),
  ('operacao_voluntarios_equipe', 'Equipe', 'Necessidade por função conforme convites vendidos/estimativa.', 'Operação', 'operacao_voluntarios', '/admin/festa-junina/voluntarios/necessidade', null, 412, true, true, true, null, 'module_config', true, false),
  ('operacao_voluntarios_relatorios', 'Relatórios', 'Base de dados para informações dos voluntários.', 'Operação', 'operacao_voluntarios', '/admin/festa-junina/relatorios?modulo=voluntarios', null, 413, true, true, true, null, 'report_bi', true, false),
  ('operacao_compras', 'Compras', 'Necessidades de compra para o evento.', 'Operação', 'operacao', '/admin/festa-junina/compras', null, 420, true, true, true, null, 'module_config', true, false),
  ('operacao_compras_insumos', 'Insumos', 'Itens para preparo das receitas.', 'Operação', 'operacao_compras', '/admin/festa-junina/compras/insumos', null, 421, true, true, true, null, 'list_new', true, false),
  ('operacao_compras_itens_finais', 'Itens finais', 'Produtos que serão apenas revendidos.', 'Operação', 'operacao_compras', '/admin/festa-junina/compras/itens-finais', null, 422, true, true, true, null, 'list_new', true, false),
  ('operacao_compras_relatorios', 'Relatórios', 'Base de dados para informações de compras.', 'Operação', 'operacao_compras', '/admin/festa-junina/relatorios?modulo=compras', null, 423, true, true, true, null, 'report_bi', true, false),
  ('operacao_treinamentos', 'Treinamentos', 'Simulação do que cada função deve realizar.', 'Operação', 'operacao', '/admin/festa-junina/treinamento', null, 430, true, true, true, null, 'checklist', true, false),
  ('operacao_simulacao_capacidade', 'Simulação de capacidade', 'Simulação de convites, estrutura do local, voluntários e compras.', 'Operação', 'operacao_treinamentos', '/admin/festa-junina/simulacao/capacidade', null, 431, true, true, true, null, 'report_bi', true, false),
  ('operacao_atendimento', 'Atendimento', 'Fluxo de atendimento no dia do evento.', 'Operação', 'operacao', '/admin/festa-junina/atendimento', null, 440, true, true, true, null, 'operation', true, false),
  ('operacao_atendimento_checkin', 'Check-in', 'Recepção e acomodação dos participantes.', 'Operação', 'operacao_atendimento', '/admin/festa-junina/atendimento?aba=checkin', null, 441, true, true, true, null, 'operation', true, false),
  ('operacao_atendimento_pedidos', 'Pedidos', 'Vendas de itens do cardápio no dia do evento.', 'Operação', 'operacao_atendimento', '/admin/festa-junina/pedidos', null, 442, true, true, true, null, 'operation', true, false),
  ('operacao_atendimento_preparo', 'Preparo', 'Produção conforme pedido e receita.', 'Operação', 'operacao_atendimento', '/admin/festa-junina/modulo/operacao_atendimento_preparo', null, 443, true, true, true, null, 'operation', true, false),
  ('operacao_atendimento_retirada', 'Retirada', 'Retirada pelo garçom ou diretamente pelo cliente.', 'Operação', 'operacao_atendimento', '/admin/festa-junina/modulo/operacao_atendimento_retirada', null, 444, true, true, true, null, 'operation', true, false),
  ('operacao_atendimento_entrega', 'Entrega', 'Entrega do garçom para o cliente.', 'Operação', 'operacao_atendimento', '/admin/festa-junina/entrega', null, 445, true, true, true, null, 'operation', true, false),
  ('operacao_atendimento_caixa', 'Caixa', 'Pagamentos e fechamento de caixa.', 'Operação', 'operacao_atendimento', '/admin/festa-junina/caixa', null, 446, true, true, true, null, 'operation', true, false),
  ('operacao_atendimento_ocorrencias', 'Ocorrências', 'Registro de problemas e ocorrências.', 'Operação', 'operacao_atendimento', '/admin/festa-junina/ocorrencias', null, 447, true, true, true, null, 'operation', true, false),
  ('operacao_prestacao_contas', 'Prestação de Contas', 'Prestação de contas financeira e operacional.', 'Operação', 'operacao', '/admin/festa-junina/prestacao-contas', null, 460, true, true, true, null, 'report_bi', true, false),
  ('operacao_prestacao_relatorios', 'Relatórios', 'Base de dados para informações da prestação de contas.', 'Operação', 'operacao_prestacao_contas', '/admin/festa-junina/relatorios?modulo=prestacao', null, 461, true, true, true, null, 'report_bi', true, false)
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
  template_key = excluded.template_key,
  is_deletable = excluded.is_deletable,
  opens_in_new_tab = excluded.opens_in_new_tab,
  updated_at = now();

insert into public.event_menu_items
  (event_id, menu_item_id, item_key, enabled, status, sort_order, updated_at)
select e.id, ami.id, ami.item_key, true, 'suggested', ami.sort_order, now()
from public.events e
cross join public.admin_menu_items ami
where (e.slug = 'arraia-tucxa-2026' or e.active_for_sales = true)
  and ami.active = true
on conflict (event_id, item_key) do update set
  menu_item_id = excluded.menu_item_id,
  enabled = true,
  sort_order = excluded.sort_order,
  updated_at = now();
