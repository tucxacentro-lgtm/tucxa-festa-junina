-- 014 - Menu exatamente conforme Excel, cardápio de vendas/preparo e simulações por cenário

-- O menu lateral passa a seguir somente os itens ativos abaixo. Páginas/rotas existentes não são apagadas.
update public.admin_menu_items
set active = false, updated_at = now()
where item_key not in ('menu_configuravel', 'eventos', 'manuais_ajuda', 'painel_geral', 'simulacoes', 'vendas', 'vendas_convites', 'vendas_convites_individuais', 'vendas_convites_combos', 'vendas_convites_campanhas', 'vendas_convites_upsell', 'vendas_convites_pagamento', 'vendas_convites_aprovacoes', 'vendas_convites_relatorios', 'vendas_conveniencias', 'vendas_conveniencias_cardapio', 'vendas_conveniencias_cardapio_vendas', 'vendas_conveniencias_cardapio_preparo', 'vendas_conveniencias_bingo', 'vendas_conveniencias_relatorios', 'operacao', 'operacao_voluntarios', 'operacao_voluntarios_funcoes', 'operacao_voluntarios_equipe', 'operacao_voluntarios_relatorios', 'operacao_compras', 'operacao_compras_insumos', 'operacao_compras_itens_finais', 'operacao_compras_relatorios', 'operacao_treinamentos', 'operacao_simulacao_capacidade', 'operacao_atendimento', 'operacao_atendimento_checkin', 'operacao_atendimento_pedidos', 'operacao_atendimento_preparo', 'operacao_atendimento_retirada', 'operacao_atendimento_entrega', 'operacao_atendimento_caixa', 'operacao_atendimento_ocorrencias', 'operacao_prestacao_contas', 'operacao_prestacao_relatorios');

insert into public.admin_menu_items
  (item_key, label, description, section, parent_key, route_path, icon_key, sort_order, default_enabled, implemented, active, not_implemented_message, template_key, is_deletable, opens_in_new_tab)
values
  ('menu_configuravel', 'Menu', 'Cadastro e configuração da estrutura do menu do sistema.', 'Geral', null, '/admin/festa-junina/menu', null, 10, true, true, true, null, 'module_config', true, false),
  ('eventos', 'Eventos', 'Cadastro e configuração das edições da Festa Junina.', 'Geral', null, '/admin/festa-junina/eventos', null, 20, true, true, true, null, 'list_new', true, false),
  ('manuais_ajuda', 'Manuais e Ajuda', 'Documentações, procedimentos e orientações de uso do sistema.', 'Geral', null, '/admin/festa-junina/ajuda', null, 30, true, true, true, null, 'help', true, false),
  ('painel_geral', 'Painel Geral', 'Visão geral de todos os itens do menu e do evento aberto.', 'Evento selecionado', null, '/admin/festa-junina', null, 100, true, true, true, null, 'module_config', true, false),
  ('simulacoes', 'Simulações', 'Módulo Simulacoes da Festa Junina do Tucxa.', 'Evento selecionado', null, '/admin/festa-junina/simulacao/capacidade', null, 150, true, true, true, null, 'report_bi', true, false),
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
  not_implemented_message = excluded.not_implemented_message,
  template_key = excluded.template_key,
  is_deletable = excluded.is_deletable,
  opens_in_new_tab = excluded.opens_in_new_tab,
  updated_at = now();

insert into public.event_menu_items
  (event_id, menu_item_id, item_key, enabled, status, sort_order, updated_at)
select e.id, ami.id, ami.item_key, true, 'suggested', ami.sort_order, now()
from public.events e
cross join public.admin_menu_items ami
where e.active_for_sales = true and ami.active = true
on conflict (event_id, item_key) do update set
  menu_item_id = excluded.menu_item_id,
  enabled = true,
  sort_order = excluded.sort_order,
  updated_at = now();

alter table if exists public.planning_menu_estimates
  add column if not exists sales_price numeric(10,2) not null default 0,
  add column if not exists requires_preparation boolean not null default false,
  add column if not exists preparation_mode text,
  add column if not exists equipment_notes text,
  add column if not exists volunteer_role_suggestion text,
  add column if not exists is_sales_item boolean not null default true,
  add column if not exists menu_group text;

create table if not exists public.event_sales_menu_items (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  name text not null,
  category text not null default 'Cardápio',
  description text,
  price numeric(10,2) not null default 0,
  unit_label text not null default 'un',
  requires_preparation boolean not null default false,
  preparation_estimate_id uuid references public.planning_menu_estimates(id) on delete set null,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(event_id, name)
);

create table if not exists public.event_consumption_orders (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  order_mode text not null default 'individual' check (order_mode in ('individual','group','table')),
  customer_name text,
  customer_phone text,
  table_label text,
  status text not null default 'received' check (status in ('received','preparing','ready','delivered','cancelled')),
  payment_status text not null default 'pending' check (payment_status in ('pending','registered','proof_sent','paid','cancelled')),
  delivery_status text not null default 'pending' check (delivery_status in ('pending','delivered')),
  total_amount numeric(10,2) not null default 0,
  notes text,
  delivered_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.event_consumption_order_items (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  order_id uuid not null references public.event_consumption_orders(id) on delete cascade,
  sales_menu_item_id uuid references public.event_sales_menu_items(id) on delete set null,
  item_name text not null,
  quantity numeric(10,2) not null default 1,
  unit_price numeric(10,2) not null default 0,
  total_price numeric(10,2) not null default 0,
  status text not null default 'received',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.event_consumption_payments (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  order_id uuid not null references public.event_consumption_orders(id) on delete cascade,
  method text not null default 'pix' check (method in ('pix','credit','debit','cash','free')),
  amount numeric(10,2) not null default 0,
  status text not null default 'registered' check (status in ('registered','proof_sent','paid','rejected')),
  proof_file_path text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.event_sales_menu_items enable row level security;
alter table public.event_consumption_orders enable row level security;
alter table public.event_consumption_order_items enable row level security;
alter table public.event_consumption_payments enable row level security;

insert into storage.buckets (id, name, public)
values ('payment-proofs', 'payment-proofs', false)
on conflict (id) do nothing;

with event_base as (
  select id from public.events where active_for_sales = true order by event_date desc nulls last limit 1
), defaults(category, name, description, price, unit_label, requires_preparation, adult, child, sort_order) as (
values
  ('Comidas','Pastel salgado','Pastel frito com recheio salgado a definir pela coordenação.',12,'un',true,1.2,0.6,10),
  ('Comidas','Pastel doce','Pastel doce de chocolate, banana ou leite condensado.',12,'un',true,0.4,0.3,20),
  ('Comidas','Cachorro-quente','Cachorro-quente simples para venda no evento.',10,'un',true,0.5,0.4,30),
  ('Comidas','Milho verde','Milho cozido ou preparado conforme estrutura do evento.',8,'un',true,0.4,0.2,40),
  ('Comidas','Pipoca','Porção de pipoca para crianças e adultos.',6,'porção',true,0.4,0.5,50),
  ('Doces','Fatia de bolo','Fatia de bolo para consumo durante a festa.',12,'fatia',false,0.5,0.3,60),
  ('Doces','Paçoca','Doce típico individual.',4,'un',false,0.4,0.4,70),
  ('Doces','Pé de moleque','Doce típico individual.',5,'un',false,0.3,0.3,80),
  ('Bebidas','Água','Água sem gás.',5,'un',false,0.8,0.6,90),
  ('Bebidas','Refrigerante lata','Refrigerante lata sabores variados.',7,'un',false,1.0,0.7,100),
  ('Bebidas','Suco lata','Suco lata/sachê pronto conforme disponibilidade.',7,'un',false,0.4,0.5,110),
  ('Bebidas','Café','Café coado ou pronto.',4,'copo',true,0.3,0.0,120),
  ('Bebidas','Chocolate quente','Chocolate quente para festa junina.',6,'copo',true,0.3,0.4,130),
  ('Bingo','Cartela de bingo','Cartela avulsa de bingo, quando disponível.',5,'un',false,0.3,0.0,140)
), inserted_estimates as (
  insert into public.planning_menu_estimates
    (event_id, item_name, category, consumption_per_adult, consumption_per_child, unit_label, active, sort_order, sales_price, requires_preparation, is_sales_item, menu_group, preparation_mode)
  select e.id, d.name, d.category, d.adult, d.child, d.unit_label, true, d.sort_order, d.price, d.requires_preparation, true, d.category,
    case when d.requires_preparation then 'Preparo durante ou antes do evento, validar com cozinha.' else null end
  from event_base e cross join defaults d
  where not exists (
    select 1 from public.planning_menu_estimates p
    where p.event_id = e.id and p.item_name = d.name
  )
  returning id, event_id, item_name
), all_estimates as (
  select p.id, p.event_id, p.item_name
  from public.planning_menu_estimates p
  join event_base e on e.id = p.event_id
)
insert into public.event_sales_menu_items
  (event_id, name, category, description, price, unit_label, requires_preparation, preparation_estimate_id, active, sort_order)
select e.id, d.name, d.category, d.description, d.price, d.unit_label, d.requires_preparation, ae.id, true, d.sort_order
from event_base e
cross join defaults d
left join all_estimates ae on ae.event_id = e.id and ae.item_name = d.name
on conflict (event_id, name) do update set
  category = excluded.category,
  description = excluded.description,
  price = excluded.price,
  unit_label = excluded.unit_label,
  requires_preparation = excluded.requires_preparation,
  preparation_estimate_id = excluded.preparation_estimate_id,
  active = true,
  sort_order = excluded.sort_order,
  updated_at = now();

with event_base as (
  select id from public.events where active_for_sales = true order by event_date desc nulls last limit 1
), estimate_base as (
  select p.id, p.event_id, p.item_name from public.planning_menu_estimates p join event_base e on e.id = p.event_id
), defaults(item_name, ingredient_name, ingredient_category, amount_per_unit, unit_label, sort_order) as (
values
  ('Pastel salgado','Massa de pastel','Pastel',1,'un',1),
  ('Pastel salgado','Recheio salgado','Pastel',0.08,'kg',2),
  ('Pastel salgado','Óleo para fritura','Pastel',0.02,'L',3),
  ('Pastel salgado','Embalagem/guardanapo','Descartáveis',1,'un',4),
  ('Pastel doce','Massa de pastel','Pastel doce',1,'un',5),
  ('Pastel doce','Recheio doce','Pastel doce',0.07,'kg',6),
  ('Pastel doce','Óleo para fritura','Pastel doce',0.02,'L',7),
  ('Pastel doce','Embalagem/guardanapo','Descartáveis',1,'un',8),
  ('Cachorro-quente','Pão de hot dog','Cachorro-quente',1,'un',9),
  ('Cachorro-quente','Salsicha/molho','Cachorro-quente',0.12,'kg',10),
  ('Cachorro-quente','Guardanapo/embalagem','Descartáveis',1,'un',11),
  ('Milho verde','Milho verde','Milho',1,'un',12),
  ('Milho verde','Manteiga/sal','Milho',0.01,'kg',13),
  ('Pipoca','Milho de pipoca','Pipoca',0.04,'kg',14),
  ('Pipoca','Óleo/manteiga/sal','Pipoca',0.01,'kg',15),
  ('Pipoca','Saquinho de pipoca','Descartáveis',1,'un',16),
  ('Café','Pó de café/açúcar','Bebidas quentes',0.02,'kg',17),
  ('Café','Copo descartável','Descartáveis',1,'un',18),
  ('Chocolate quente','Leite/chocolate/açúcar','Bebidas quentes',0.2,'L',19),
  ('Chocolate quente','Copo descartável','Descartáveis',1,'un',20),
  ('Refrigerante lata','Gelo','Operação',0.05,'kg',21),
  ('Água','Gelo','Operação',0.03,'kg',22)
)
insert into public.planning_recipe_ingredients
  (event_id, estimate_id, ingredient_name, ingredient_category, amount_per_unit, unit_label, active, sort_order, notes)
select eb.event_id, eb.id, d.ingredient_name, d.ingredient_category, d.amount_per_unit, d.unit_label, true, d.sort_order, 'Sugestão inicial para validação da coordenação.'
from estimate_base eb join defaults d on d.item_name = eb.item_name
where not exists (
  select 1 from public.planning_recipe_ingredients pri where pri.estimate_id = eb.id and pri.ingredient_name = d.ingredient_name
);
