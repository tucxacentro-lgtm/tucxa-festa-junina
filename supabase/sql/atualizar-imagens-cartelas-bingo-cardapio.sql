-- Atualiza os itens de cartela do bingo no cardápio público do Arraiá Tucxa 2026.
-- Execute no Supabase SQL Editor do projeto tucxa-festa-junina.
-- As imagens precisam estar publicadas em:
-- /cardapio/arraia-tucxa-2026/cartela-bingo-rs5-premios.jpg
-- /cardapio/arraia-tucxa-2026/cartela-bingo-rs7-premios.jpg

DO $$
DECLARE
  v_event_id uuid;
  v_image_column text;
BEGIN
  SELECT id
    INTO v_event_id
    FROM public.events
   WHERE slug = 'arraia-tucxa-2026'
   LIMIT 1;

  IF v_event_id IS NULL THEN
    RAISE NOTICE 'Evento arraia-tucxa-2026 não encontrado. Nenhuma atualização realizada.';
    RETURN;
  END IF;

  SELECT column_name
    INTO v_image_column
    FROM information_schema.columns
   WHERE table_schema = 'public'
     AND table_name = 'menu_items'
     AND column_name IN ('image_url', 'image_path', 'photo_url', 'cover_url')
   ORDER BY CASE column_name
     WHEN 'image_url' THEN 1
     WHEN 'image_path' THEN 2
     WHEN 'photo_url' THEN 3
     WHEN 'cover_url' THEN 4
     ELSE 99
   END
   LIMIT 1;

  UPDATE public.menu_items
     SET description = 'Cartela para rodadas populares de R$ 5,00, com prêmios previstos como Cesta Festa Junina, Jogo de Taças, Chaleira Elétrica, Cesta de Chocolate, Jogo de Cozinha, Petiscos Especiais, Fardo Heineken e outros itens para casa, mesa e momentos em família.'
   WHERE event_id = v_event_id
     AND price = 5.00
     AND lower(name) LIKE '%cartela%';

  UPDATE public.menu_items
     SET description = 'Cartela para rodadas especiais de R$ 7,00, com prêmios previstos como Cafeteira, Processador Elétrico, Liquidificador, Bolsa de Palha, Limpeza Dentária, Kit Natura, Tapete de Crochê, Cesta de Frutas e outros prêmios de cuidado, casa e celebração.'
   WHERE event_id = v_event_id
     AND price = 7.00
     AND lower(name) LIKE '%cartela%';

  IF v_image_column IS NOT NULL THEN
    EXECUTE format(
      'UPDATE public.menu_items
          SET %I = $1
        WHERE event_id = $2
          AND price = 5.00
          AND lower(name) LIKE ''%%cartela%%''',
      v_image_column
    )
    USING '/cardapio/arraia-tucxa-2026/cartela-bingo-rs5-premios.jpg', v_event_id;

    EXECUTE format(
      'UPDATE public.menu_items
          SET %I = $1
        WHERE event_id = $2
          AND price = 7.00
          AND lower(name) LIKE ''%%cartela%%''',
      v_image_column
    )
    USING '/cardapio/arraia-tucxa-2026/cartela-bingo-rs7-premios.jpg', v_event_id;

    RAISE NOTICE 'Imagens atualizadas na coluna %. Descrições atualizadas.', v_image_column;
  ELSE
    RAISE NOTICE 'Nenhuma coluna de imagem encontrada em public.menu_items. Apenas descrições foram atualizadas.';
  END IF;
END $$;
