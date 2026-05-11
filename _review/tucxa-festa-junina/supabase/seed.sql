insert into public.events (
  slug,
  name,
  subtitle,
  description,
  event_date,
  start_time,
  end_time,
  location_name,
  location_address,
  pix_key,
  pix_receiver_name,
  allow_public_sales,
  allow_combos,
  status
)
values (
  'arraia-tucxa-2026',
  'Arraiá do Tucxa 2026',
  'Comidas típicas, quadrilha, brincadeiras e muita alegria.',
  'Garanta seu convite antecipado e ajude a organização a planejar melhor alimentos, bebidas, mesas e atendimento.',
  '2026-06-14',
  '13:00',
  '18:00',
  'Espaço Santa Fé',
  'R. Antônio Maurício Ladera, 474 - Jardim Conceição, Campinas',
  null,
  'Tucxa',
  true,
  true,
  'published'
)
on conflict (slug) do update set
  name = excluded.name,
  subtitle = excluded.subtitle,
  description = excluded.description,
  event_date = excluded.event_date,
  start_time = excluded.start_time,
  end_time = excluded.end_time,
  location_name = excluded.location_name,
  location_address = excluded.location_address,
  status = excluded.status;

insert into public.ticket_types (event_id, name, description, price, sale_mode, sort_order)
select id, 'Convite antecipado', 'Valor de referência do convite antecipado. Pode ser ajustado no admin.', 20.00, 'online', 1
from public.events where slug = 'arraia-tucxa-2026';

insert into public.ticket_types (event_id, name, description, price, sale_mode, sort_order)
select id, 'Convite na hora', 'Valor de referência para venda no dia do evento.', 30.00, 'door', 2
from public.events where slug = 'arraia-tucxa-2026';

insert into public.ticket_types (event_id, name, description, price, sale_mode, is_free, sort_order)
select id, 'Criança até 10 anos', 'Crianças até 10 anos não pagam, conforme configuração do evento.', 0.00, 'manual', true, 3
from public.events where slug = 'arraia-tucxa-2026';

insert into public.payment_options (event_id, name, method, instructions, sort_order)
select id, 'Pix', 'pix', 'Faça o Pix para a chave configurada pela organização e envie o comprovante pelo WhatsApp.', 1
from public.events where slug = 'arraia-tucxa-2026';

insert into public.payment_options (event_id, name, method, instructions, sort_order)
select id, 'Pagar com responsável', 'manual', 'Combine o pagamento com um dos responsáveis pela venda dos convites.', 2
from public.events where slug = 'arraia-tucxa-2026';

insert into public.menu_categories (event_id, name, sort_order)
select id, 'Comidas típicas', 1 from public.events where slug = 'arraia-tucxa-2026';

insert into public.menu_categories (event_id, name, sort_order)
select id, 'Bebidas', 2 from public.events where slug = 'arraia-tucxa-2026';

insert into public.menu_items (event_id, category_id, name, description, price, requires_preparation, sort_order)
select e.id, c.id, 'Pastel', 'Sabor a definir: carne, queijo, palmito ou calabresa com queijo.', 12.00, true, 1
from public.events e
join public.menu_categories c on c.event_id = e.id and c.name = 'Comidas típicas'
where e.slug = 'arraia-tucxa-2026';

insert into public.menu_items (event_id, category_id, name, description, price, requires_preparation, sort_order)
select e.id, c.id, 'Fatia de bolo', 'Sabores a definir.', 12.00, false, 2
from public.events e
join public.menu_categories c on c.event_id = e.id and c.name = 'Comidas típicas'
where e.slug = 'arraia-tucxa-2026';

insert into public.menu_items (event_id, category_id, name, description, price, requires_preparation, sort_order)
select e.id, c.id, 'Refrigerante lata', 'Opções a definir.', 7.00, false, 1
from public.events e
join public.menu_categories c on c.event_id = e.id and c.name = 'Bebidas'
where e.slug = 'arraia-tucxa-2026';

insert into public.offer_combos (event_id, name, subtitle, description, price, compare_at_price, badge, highlighted, sort_order)
select id,
  'Combo Arraiá',
  'Convite + consumo antecipado',
  'Ideal para quem quer chegar com parte da festa garantida e ainda ajudar a organização a planejar as compras.',
  35.00,
  39.00,
  'Mais prático',
  true,
  1
from public.events where slug = 'arraia-tucxa-2026';

insert into public.offer_combos (event_id, name, subtitle, description, price, badge, highlighted, sort_order)
select id,
  'Combo Família',
  'Para vir junto e aproveitar melhor',
  'Opção pensada para famílias. Valores e quantidades podem ser ajustados pela organização.',
  70.00,
  'Família',
  false,
  2
from public.events where slug = 'arraia-tucxa-2026';
-- Combos adicionais para a etapa com bingo e planejamento antecipado.
insert into public.offer_combos (event_id, name, subtitle, description, price, compare_at_price, badge, highlighted, sort_order, includes_bingo, bingo_cards_quantity)
select id,
  'Combo Bingo Junino',
  'Convite + cartela de bingo',
  'Para quem quer garantir a entrada na festa e já participar de uma rodada especial do bingo. Ajuda a organização a prever convites e cartelas.',
  30.00,
  35.00,
  'Com bingo',
  false,
  3,
  true,
  1
from public.events
where slug = 'arraia-tucxa-2026'
  and not exists (
    select 1 from public.offer_combos c
    where c.event_id = events.id and c.name = 'Combo Bingo Junino'
  );

insert into public.offer_combos (event_id, name, subtitle, description, price, compare_at_price, badge, highlighted, sort_order, includes_bingo, bingo_cards_quantity)
select id,
  'Combo Festa Completa',
  'Convite + consumo + bingo',
  'Opção completa para chegar com parte da festa garantida: convite, consumo antecipado e cartela de bingo. Facilita a vida do comprador e melhora o planejamento de compras.',
  45.00,
  52.00,
  'Mais completo',
  true,
  4,
  true,
  1
from public.events
where slug = 'arraia-tucxa-2026'
  and not exists (
    select 1 from public.offer_combos c
    where c.event_id = events.id and c.name = 'Combo Festa Completa'
  );
