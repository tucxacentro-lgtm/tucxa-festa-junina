-- 025 - Instruções dinâmicas de pagamento e Pix como opção principal
-- Mantém confirmação manual por comprovante, mas orienta PIX com QR Code/Copia e Cola com valor.

update public.payment_options
set
  sort_order = case method
    when 'pix' then 0
    when 'credit' then 1
    when 'debit' then 2
    when 'cash' then 3
    when 'manual' then 4
    else sort_order
  end,
  instructions = case method
    when 'pix' then 'Faça o pagamento via Pix pelo valor total informado, usando o QR Code ou Pix Copia e Cola. Depois anexe o comprovante na tela da compra/pedido para conferência da equipe.'
    when 'credit' then 'O pagamento por cartão de crédito será realizado presencialmente com a equipe da coordenação. Apresente o código/QR Code da compra ou pedido e guarde o comprovante da maquininha até a confirmação pela equipe.'
    when 'debit' then 'O pagamento por débito será realizado presencialmente com a equipe da coordenação. Após aprovação na maquininha, a equipe confirmará o pagamento no sistema. Apresente o código/QR Code quando solicitado.'
    when 'cash' then 'O pagamento em dinheiro será realizado presencialmente com a coordenação. Se possível, leve o valor aproximado para facilitar o troco e agilizar o atendimento. Apresente o código/QR Code quando solicitado.'
    when 'manual' then 'Anexe uma foto do recibo do cartão, comprovante de pagamento em dinheiro ou outro registro autorizado. Nas observações, informe o nome e o celular de quem pagou e, se possível, o nome de quem recebeu o pagamento.'
    else instructions
  end
where method in ('pix', 'credit', 'debit', 'cash', 'manual');
