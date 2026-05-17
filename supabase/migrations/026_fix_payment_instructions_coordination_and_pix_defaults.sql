-- 026 - Ajusta instruções de pagamento para coordenação e reforça PIX como método padrão.
-- Seguro para rodar mais de uma vez.

update public.payment_options
set
  method = 'pix',
  sort_order = 0,
  active = true,
  instructions = 'Faça o pagamento via Pix pelo valor total informado, usando o QR Code ou Pix Copia e Cola. Depois anexe o comprovante na tela da compra/pedido para conferência da equipe.'
where lower(coalesce(name, '')) in ('pix', 'p i x')
   or lower(coalesce(method, '')) = 'pix';

update public.payment_options
set
  instructions = replace(instructions, 'equipe do caixa', 'equipe da coordenação'),
  updated_at = now()
where instructions ilike '%equipe do caixa%';

update public.payment_options
set
  instructions = replace(instructions, 'presencialmente no caixa', 'presencialmente com a coordenação'),
  updated_at = now()
where instructions ilike '%presencialmente no caixa%';

update public.payment_options
set
  instructions = replace(instructions, ' no caixa', ' com a coordenação'),
  updated_at = now()
where instructions ilike '% no caixa%';

update public.payment_options
set
  instructions = case lower(coalesce(method, ''))
    when 'credit' then 'O pagamento por cartão de crédito será realizado presencialmente com a equipe da coordenação. Apresente o código/QR Code da compra ou pedido e guarde o comprovante da maquininha até a confirmação pela equipe.'
    when 'debit' then 'O pagamento por débito será realizado presencialmente com a equipe da coordenação. Após aprovação na maquininha, a equipe confirmará o pagamento no sistema. Apresente o código/QR Code quando solicitado.'
    when 'cash' then 'O pagamento em dinheiro será realizado presencialmente com a coordenação. Se possível, leve o valor aproximado para facilitar o troco e agilizar o atendimento. Apresente o código/QR Code quando solicitado.'
    when 'manual' then 'Anexe uma foto do recibo do cartão, comprovante de pagamento em dinheiro ou outro registro autorizado. Nas observações, informe o nome e o celular de quem pagou e, se possível, o nome de quem recebeu o pagamento.'
    else instructions
  end,
  updated_at = now()
where lower(coalesce(method, '')) in ('credit', 'debit', 'cash', 'manual');
