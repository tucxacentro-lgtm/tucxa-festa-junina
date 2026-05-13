-- Menu administrativo configurável por evento
-- Idempotente: pode ser executada novamente sem duplicar os itens.

create extension if not exists pgcrypto;

create table if not exists public.admin_menu_items (
  id uuid primary key default gen_random_uuid(),
  item_key text not null unique,
  label text not null,
  description text,
  section text not null default 'Geral',
  parent_key text,
  route_path text,
  icon_key text,
  sort_order integer not null default 0,
  default_enabled boolean not null default true,
  implemented boolean not null default true,
  active boolean not null default true,
  not_implemented_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.event_menu_items (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  menu_item_id uuid references public.admin_menu_items(id) on delete set null,
  item_key text not null,
  enabled boolean not null default true,
  status text not null default 'suggested' check (status in ('not_used','suggested','configuring','in_use','done')),
  custom_label text,
  sort_order integer,
  notes text,
  responsible_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint event_menu_items_event_item_key_unique unique (event_id, item_key)
);

create index if not exists idx_admin_menu_items_parent_key on public.admin_menu_items(parent_key);
create index if not exists idx_admin_menu_items_section_sort on public.admin_menu_items(section, sort_order);
create index if not exists idx_event_menu_items_event_id on public.event_menu_items(event_id);

with menu_items(item_key, label, description, section, parent_key, route_path, icon_key, sort_order, default_enabled, implemented, active, not_implemented_message) as (
  values
  ('eventos','Eventos','Lista de edições da Festa Junina. Abra o evento que será operado.','Geral',null,'/admin/festa-junina/eventos','calendar',10,true,true,true,null),
  ('novo_evento','Novo evento','Cadastro de uma nova edição anual da Festa Junina.','Geral',null,'/admin/festa-junina/eventos/novo','plus',20,true,true,true,null),
  ('menu_configuravel','Cadastro do menu','Configura a hierarquia, sequência e páginas associadas ao menu lateral.','Geral',null,'/admin/festa-junina/menu','menu',30,true,true,true,null),
  ('manuais_ajuda','Manuais e ajuda','Manual de uso do sistema e ajuda contextual por tela.','Geral',null,'/admin/festa-junina/ajuda','help',40,true,true,true,null),
  ('painel_evento','Painel do evento','Resumo do evento aberto e próximos passos.','Evento selecionado',null,'/admin/festa-junina','home',100,true,true,true,null),
  ('vendas','Vendas',null,'Evento selecionado',null,null,null,200,true,true,true,null),
  ('vendas_convites','Convites','Tipos de ingresso, valores e regras de venda.','Evento selecionado','vendas','/admin/festa-junina/convites',null,210,true,true,true,null),
  ('vendas_acesso','Acesso ao evento','Orientações para acesso/check-in e uso do código/QR Code.','Evento selecionado','vendas','/admin/festa-junina/acesso',null,220,true,true,true,null),
  ('vendas_conveniencias','Conveniências',null,'Evento selecionado','vendas',null,null,230,true,true,true,null),
  ('vendas_individuais_combos','Individuais/Combos','Configuração de compras individuais, combos e ofertas quando disponíveis.','Evento selecionado','vendas_conveniencias','/admin/festa-junina/combos',null,231,true,true,true,null),
  ('vendas_indicacoes','Programa indicações','Regras de indicação e brindes.','Evento selecionado','vendas_conveniencias','/admin/festa-junina/indicacoes',null,232,true,true,true,null),
  ('vendas_upsell','Upsell','Mensagens e ofertas complementares.','Evento selecionado','vendas_conveniencias','/admin/festa-junina/upsell',null,233,true,true,true,null),
  ('vendas_pagamentos','Pagamentos/Confirmações','Formas de pagamento e confirmação de comprovantes.','Evento selecionado','vendas','/admin/festa-junina/pagamentos',null,240,true,true,true,null),
  ('vendas_relatorios','Relatórios','Relatórios de vendas e pagamentos.','Evento selecionado','vendas','/admin/festa-junina/relatorios?modulo=vendas',null,250,true,true,true,null),
  ('conveniencias_cardapio','Cardápio de comidas, bebidas e doces',null,'Conveniências',null,null,null,300,true,true,true,null),
  ('conveniencias_resumo_clientes','Versão resumida para clientes','Resumo do cardápio para comunicação com clientes.','Conveniências','conveniencias_cardapio','/admin/festa-junina/cliente-resumo',null,310,true,true,true,null),
  ('conveniencias_ficha_tecnica','Ficha Técnica/Receitas','Itens do cardápio, modo de preparo e insumos.','Conveniências','conveniencias_cardapio','/admin/festa-junina/cardapio',null,320,true,true,true,null),
  ('conveniencias_outros','Outros',null,'Conveniências',null,null,null,330,true,true,true,null),
  ('conveniencias_bingo','Cartelas de Bingo','Configurações de cartelas de bingo quando disponíveis.','Conveniências','conveniencias_outros','/admin/festa-junina/bingo',null,331,true,true,true,null),
  ('conveniencias_outros_item','Outros','Outras conveniências do evento.','Conveniências','conveniencias_outros','/admin/festa-junina/outros',null,332,true,true,true,null),
  ('conveniencias_relatorios','Relatórios','Relatórios das conveniências.','Conveniências',null,'/admin/festa-junina/relatorios?modulo=conveniencias',null,340,true,true,true,null),
  ('operacao_voluntarios','Voluntários',null,'Operação',null,null,null,400,true,true,true,null),
  ('operacao_voluntarios_funcoes','Cadastro por função','Cadastro e organização dos voluntários por função.','Operação','operacao_voluntarios','/admin/festa-junina/voluntarios/funcoes',null,410,true,true,true,null),
  ('operacao_voluntarios_necessidade','Necessidade conforme convites vendidos/estimativa','Sugestão de equipe conforme público confirmado/provável.','Operação','operacao_voluntarios','/admin/festa-junina/voluntarios/necessidade',null,420,true,true,true,null),
  ('operacao_compras','Compras',null,'Operação',null,null,null,430,true,true,true,null),
  ('operacao_compras_insumos','Insumos','Lista de ingredientes e materiais de preparo.','Operação','operacao_compras','/admin/festa-junina/compras/insumos',null,431,true,true,true,null),
  ('operacao_compras_itens_finais','Itens finais','Bebidas, descartáveis e itens finais para compra.','Operação','operacao_compras','/admin/festa-junina/compras/itens-finais',null,432,true,true,true,null),
  ('operacao_treinamento','Treinamento/Simulação','Treinamento da equipe e simulações antes do evento.','Operação',null,'/admin/festa-junina/treinamento',null,440,true,true,true,null),
  ('operacao_atendimento','Atendimento no dia do evento',null,'Operação',null,null,null,450,true,true,true,null),
  ('operacao_checkin','Check-in','Validação de entrada e QR Code.','Operação','operacao_atendimento','/admin/festa-junina/atendimento?aba=checkin',null,451,true,true,true,null),
  ('operacao_pedidos','Pedidos','Pedidos e vendas durante o evento, quando usado.','Operação','operacao_atendimento','/admin/festa-junina/pedidos',null,452,true,true,true,null),
  ('operacao_entrega','Entrega','Separação e entrega dos itens.','Operação','operacao_atendimento','/admin/festa-junina/entrega',null,453,true,true,true,null),
  ('operacao_caixa','Caixa','Pagamento e caixa no dia do evento.','Operação','operacao_atendimento','/admin/festa-junina/caixa',null,454,true,true,true,null),
  ('operacao_ocorrencias','Ocorrências','Registro de ocorrências operacionais.','Operação','operacao_atendimento','/admin/festa-junina/ocorrencias',null,455,true,true,true,null),
  ('operacao_prestacao_contas','Prestação de contas','Resumo final financeiro e operacional.','Operação',null,'/admin/festa-junina/prestacao-contas',null,460,true,true,true,null),
  ('operacao_relatorios','Relatórios','Relatórios operacionais.','Operação',null,'/admin/festa-junina/relatorios?modulo=operacao',null,470,true,true,true,null)
)
insert into public.admin_menu_items (item_key, label, description, section, parent_key, route_path, icon_key, sort_order, default_enabled, implemented, active, not_implemented_message, updated_at)
select item_key, label, description, section, parent_key, route_path, icon_key, sort_order, default_enabled, implemented, active, not_implemented_message, now()
from menu_items
on conflict (item_key) do update set
  label = excluded.label,
  description = excluded.description,
  section = excluded.section,
  parent_key = excluded.parent_key,
  route_path = excluded.route_path,
  icon_key = excluded.icon_key,
  sort_order = excluded.sort_order,
  default_enabled = excluded.default_enabled,
  implemented = excluded.implemented,
  active = excluded.active,
  not_implemented_message = excluded.not_implemented_message,
  updated_at = now();

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
