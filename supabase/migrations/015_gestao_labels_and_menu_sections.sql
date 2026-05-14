-- Ajusta nomenclatura visual do menu: Geral/Admin -> Gestão e Painel Geral -> Painel de Gestão.
-- Mantém páginas/rotas existentes; altera apenas rótulos e agrupamento do menu configurável.

update public.admin_menu_items
set section = 'Gestão', updated_at = now()
where section in ('Geral', 'Admin');

update public.admin_menu_items
set section = 'Evento selecionado', updated_at = now()
where section = 'Operação';

update public.admin_menu_items
set label = 'Painel de Gestão', updated_at = now()
where label = 'Painel Geral' or item_key = 'painel_geral';

update public.admin_menu_items
set label = 'Gestão', updated_at = now()
where label in ('Admin', 'Geral');

-- Reposiciona o item Operação como agrupador dentro de Evento selecionado.
update public.admin_menu_items
set section = 'Evento selecionado', parent_key = null, sort_order = greatest(sort_order, 400), updated_at = now()
where item_key = 'operacao';

-- Garante que todos os filhos de Operação continuem dentro da mesma seção do evento selecionado.
update public.admin_menu_items
set section = 'Evento selecionado', updated_at = now()
where item_key like 'operacao_%';
