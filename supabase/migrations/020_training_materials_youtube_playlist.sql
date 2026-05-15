-- 020 - Materiais de treinamento e playlist YouTube
-- Gera roteiros curtos para clientes/voluntários e permite cadastrar links de vídeos/áudios publicados.

create extension if not exists pgcrypto;

create table if not exists public.event_training_playlists (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  title text not null,
  description text,
  playlist_url text,
  status text not null default 'rascunho' check (status in ('rascunho','revisar','aprovado','publicado','inativo')),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(event_id, title)
);

create table if not exists public.event_training_materials (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  training_key text not null,
  audience text not null default 'voluntarios' check (audience in ('clientes','garcons','caixa','cozinha','separacao_entrega','checkin','coordenacao','voluntarios')),
  training_type text not null default 'video_curto',
  title text not null,
  objective text,
  script_text text,
  voiceover_text text,
  whatsapp_message text,
  youtube_description text,
  youtube_tags text,
  youtube_url text,
  status text not null default 'rascunho' check (status in ('rascunho','revisar','aprovado','publicado','inativo')),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(event_id, training_key)
);

create index if not exists idx_event_training_materials_event_id on public.event_training_materials(event_id);
create index if not exists idx_event_training_materials_audience on public.event_training_materials(event_id, audience);
create index if not exists idx_event_training_playlists_event_id on public.event_training_playlists(event_id);

-- Menu: Treinamentos como agrupador, Materiais e Playlist como páginas finais.
insert into public.admin_menu_items
  (item_key, label, description, section, parent_key, route_path, icon_key, sort_order, default_enabled, implemented, active, not_implemented_message, template_key, is_deletable, opens_in_new_tab, updated_at)
values
  ('operacao_treinamentos', 'Treinamentos', 'Treinamentos e simulações do evento.', 'Evento selecionado', 'operacao', null, null, 430, true, true, true, null, 'checklist', true, false, now()),
  ('operacao_treinamentos_materiais', 'Materiais de treinamento', 'Roteiros curtos, textos para narração e mensagens para WhatsApp.', 'Evento selecionado', 'operacao_treinamentos', '/admin/festa-junina/treinamento', null, 431, true, true, true, null, 'checklist', true, false, now()),
  ('operacao_treinamentos_playlist', 'Playlist YouTube', 'Cadastro da playlist e dos links de vídeos ou áudios publicados.', 'Evento selecionado', 'operacao_treinamentos', '/admin/festa-junina/treinamento/playlist', null, 432, true, true, true, null, 'help', true, false, now()),
  ('operacao_simulacao_capacidade', 'Simulação de capacidade', 'Simulação de convites, estrutura do local, voluntários e compras.', 'Evento selecionado', 'operacao_treinamentos', '/admin/festa-junina/simulacao/capacidade', null, 433, true, true, true, null, 'report_bi', true, false, now())
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
where e.active_for_sales = true
  and ami.item_key in ('operacao_treinamentos','operacao_treinamentos_materiais','operacao_treinamentos_playlist','operacao_simulacao_capacidade')
on conflict (event_id, item_key) do update set
  menu_item_id = excluded.menu_item_id,
  enabled = true,
  sort_order = excluded.sort_order,
  updated_at = now();

insert into public.event_training_playlists (event_id, title, description, status, sort_order, updated_at)
select
  e.id,
  'Playlist de treinamento — Festa Junina Tucxa',
  'Organize aqui os vídeos curtos para clientes, voluntários, caixa, cozinha, entrega e coordenação.',
  'rascunho',
  10,
  now()
from public.events e
where e.active_for_sales = true
on conflict (event_id, title) do nothing;

insert into public.event_training_materials
  (event_id, training_key, audience, training_type, title, objective, script_text, voiceover_text, whatsapp_message, youtube_description, youtube_tags, status, sort_order, updated_at)
select e.id, t.training_key, t.audience, t.training_type, t.title, t.objective, t.script_text, t.voiceover_text, t.whatsapp_message, t.youtube_description, t.youtube_tags, 'rascunho', t.sort_order, now()
from public.events e
cross join (values
  ('cliente_guardar_codigo','clientes','video_curto','Cliente: como guardar o código da compra','Explicar como encontrar e guardar o código/QR Code para entrada e acompanhamento.','1. Abra o link da Festa Junina. 2. Registre seu convite quando orientado pela coordenação. 3. Após enviar o comprovante, guarde o código da compra. 4. No dia da festa, apresente o código, QR Code ou convite impresso na entrada.','Oi! Para participar da Festa Junina do Tucxa com mais tranquilidade, guarde o código da sua compra. Ele ajuda na entrada, na conferência do pagamento e no acompanhamento das próximas etapas conforme a orientação da coordenação.','Oi! Para facilitar sua entrada na Festa Junina do Tucxa, guarde o código/QR Code da compra. No dia, apresente o código, QR Code ou convite impresso conforme orientação da coordenação.','Treinamento rápido para clientes da Festa Junina do Tucxa: como guardar o código da compra e usar no dia do evento.','Festa Junina Tucxa, convite, QR Code, cliente, treinamento',10),
  ('cliente_cardapio_pedido','clientes','video_curto','Cliente: como usar o cardápio pelo celular','Mostrar como abrir o cardápio, buscar itens, montar pedido e acompanhar pagamento/retirada.','1. Acesse o cardápio pelo QR Code da mesa ou link informado. 2. Busque por bebidas, comidas, doces ou bingo. 3. Adicione itens ao pedido. 4. Confira o total. 5. Pague conforme orientação e envie o comprovante quando solicitado.','No dia da festa, você pode consultar o cardápio pelo celular. Escolha os itens, confira o total e siga a forma de pagamento orientada pela equipe. Isso ajuda a reduzir filas e organizar melhor o atendimento.','No dia da festa, use o cardápio pelo celular para escolher comidas, bebidas e itens disponíveis. Confira o total e envie o comprovante quando solicitado pela equipe.','Treinamento rápido para usar o cardápio da Festa Junina do Tucxa pelo celular.','Festa Junina Tucxa, cardápio, pedido, celular, atendimento',20),
  ('garcom_lancar_pedido','garcons','video_curto','Garçom: como lançar pedido por mesa ou cliente','Orientar o voluntário de atendimento a registrar pedidos no sistema quando essa operação for escolhida.','1. Acesse a tela de cardápio de vendas. 2. Informe mesa, responsável ou cliente. 3. Adicione os itens pedidos. 4. Confirme o total. 5. Oriente sobre pagamento ou fechamento conforme a configuração operacional.','Garçom, antes de registrar o pedido, confirme a mesa ou o responsável. Depois selecione os itens, confira o total e siga a regra definida pela coordenação: pagamento por pedido ou fechamento no final.','Treinamento do garçom: confirme mesa/responsável, lance os itens do pedido e siga a orientação de pagamento definida para o evento.','Treinamento para garçons e atendimento da Festa Junina do Tucxa: como registrar pedidos no sistema.','Festa Junina Tucxa, garçom, pedido, mesa, atendimento',30),
  ('caixa_registrar_pagamento','caixa','video_curto','Caixa: como conferir pagamento e comprovante','Orientar o caixa a registrar Pix, cartão, dinheiro, divisão de pagamento e comprovantes.','1. Abra o pedido ou fechamento. 2. Confira o total. 3. Selecione a forma de pagamento. 4. Registre valores pagos por cada pessoa, se houver divisão. 5. Anexe comprovante ou recibo quando obrigatório. 6. Confirme o pagamento.','No caixa, confira o valor total antes de confirmar. O pagamento pode ser por Pix, cartão, dinheiro ou dividido entre pessoas, conforme a regra do evento. Anexe o comprovante quando for obrigatório.','Treinamento do caixa: confira total, forma de pagamento, comprovante/recibo e só depois confirme o pagamento no sistema.','Treinamento para caixa da Festa Junina do Tucxa: pagamentos, comprovantes e divisão de valores.','Festa Junina Tucxa, caixa, Pix, comprovante, pagamento',40),
  ('cozinha_preparo_status','cozinha','video_curto','Cozinha: como sinalizar preparo','Orientar cozinha/preparo a sinalizar início e término quando essa regra for usada.','1. Abra a fila de preparo. 2. Verifique o pedido e os itens. 3. Sinalize início do preparo se a coordenação exigir. 4. Ao terminar, marque como pronto para separação ou retirada.','Na cozinha, acompanhe a fila de pedidos. Quando a operação exigir, marque o início do preparo e, ao finalizar, sinalize que o pedido está pronto. Isso ajuda entrega, retirada e caixa a trabalharem com mais organização.','Treinamento da cozinha: acompanhe a fila, sinalize início quando necessário e marque o pedido como pronto ao finalizar.','Treinamento para cozinha e preparo da Festa Junina do Tucxa.','Festa Junina Tucxa, cozinha, preparo, pedido, voluntários',50),
  ('entrega_retirada_confirmacao','separacao_entrega','video_curto','Entrega/retirada: como confirmar pedido entregue','Orientar separação/entrega a marcar pedidos prontos e entregues conforme o fluxo escolhido.','1. Abra a tela de entrega ou retirada. 2. Confira número do pedido, nome e mesa. 3. Entregue ao garçom ou ao cliente. 4. Registre a entrega quando a coordenação definir essa confirmação como necessária.','Na entrega ou retirada, confira sempre número do pedido, nome e mesa. Depois confirme no sistema quando essa etapa estiver habilitada. Isso evita duplicidade e ajuda a prestação de contas.','Treinamento de entrega/retirada: confira pedido, nome e mesa antes de entregar e confirme no sistema quando solicitado.','Treinamento para separação, entrega e retirada de pedidos da Festa Junina do Tucxa.','Festa Junina Tucxa, entrega, retirada, pedido pronto, voluntários',60),
  ('coordenacao_config_operacional','coordenacao','video_curto','Coordenação: como configurar a operação do evento','Mostrar que a coordenação pode escolher como convites, pedidos, mesas, preparo, entrega e pagamentos funcionarão.','1. Abra Configuração Operacional. 2. Defina se vendas serão pelo sistema, manual ou planilha. 3. Escolha QR Code por evento, mesa ou convidado. 4. Defina quem lança pedidos. 5. Configure preparo, separação, entrega, caixa e comprovantes.','A Configuração Operacional permite escolher como a Festa Junina vai funcionar na prática. O sistema não obriga um fluxo único: a coordenação decide o que usar em cada evento.','Treinamento da coordenação: use Configuração Operacional para definir vendas, QR Codes, mesas, pedidos, preparo, entrega, caixa e comprovantes.','Treinamento para coordenação: configuração operacional flexível do sistema da Festa Junina do Tucxa.','Festa Junina Tucxa, coordenação, operação, configuração, sistema',70)
) as t(training_key, audience, training_type, title, objective, script_text, voiceover_text, whatsapp_message, youtube_description, youtube_tags, sort_order)
where e.active_for_sales = true
on conflict (event_id, training_key) do nothing;
