# Ajustes - pedidos, caixa e convites

## Arquivos alterados

1. `src/components/ticket-order-form.tsx`
   - Quantidade de convites/combos/crianças agora usa controle mobile friendly com botões `-` e `+`.
   - O campo numérico seleciona o valor ao tocar/clicar, evitando o problema de manter o `0` à direita ao digitar outro número.
   - O valor enviado ao formulário fica em campo oculto, sempre normalizado.

2. `src/components/public-sales-menu.tsx`
   - O formulário agora envia as quantidades de todos os itens do cardápio, inclusive os selecionados em abas/categorias que não estão abertas no momento.
   - Corrige o problema em que o pedido final considerava apenas itens da última aba/categoria visível.

3. `src/lib/operation-dashboard.ts`
   - O cálculo de pago/pendente passa a considerar tanto `payment_status = paid` quanto pagamentos registrados na tabela `event_consumption_payments` com status `paid`.
   - Evita divergência visual entre tabela de pedidos, total pago e total pendente.

4. `src/app/gestao-evento/caixa/page.tsx`
   - Quando não houver pendência, a tela mostra `Pago / sem pendências` em vez de continuar destacando `Pendente: R$ 0,00` em vermelho.
   - A coluna de pagamento usa a mesma regra consolidada do dashboard.
   - Mantido layout mobile friendly.

5. `src/app/gestao-evento/actions.ts`
   - Enviado completo para manter compatibilidade com o fluxo de fechamento do caixa.

## Passo a passo para atualizar

1. Faça backup ou commit da versão atual antes de substituir os arquivos.

2. Copie as pastas deste zip para a raiz do projeto, mantendo a estrutura `src/...`.

3. No terminal, dentro da pasta do projeto, rode:

```bash
npm install
npm run lint
npm run build
```

4. Teste no navegador, principalmente no celular ou modo responsivo:

- Comprar/reservar convite:
  - tocar no campo de quantidade;
  - digitar outro número;
  - validar se o zero não permanece à direita;
  - testar botões `-` e `+`.

- Cardápio/pedido:
  - adicionar item em Bebidas;
  - mudar para Comidas;
  - adicionar item em Comidas;
  - criar o pedido;
  - confirmar que todos os itens aparecem no pedido criado.

- Caixa:
  - registrar pagamento por Pix;
  - voltar para `/gestao-evento/caixa`;
  - confirmar que o responsável aparece como `Pago / sem pendências`;
  - confirmar que a tabela do pedido mostra `Pago`.

5. Se tudo estiver correto, faça o commit:

```bash
git status
git add src/components/ticket-order-form.tsx \
  src/components/public-sales-menu.tsx \
  src/lib/operation-dashboard.ts \
  src/app/gestao-evento/caixa/page.tsx \
  src/app/gestao-evento/actions.ts

git commit -m "Corrige quantidades mobile, itens por categoria e status do caixa"
git push
```

## Observação importante

O zip enviado pelo ambiente anterior estava achatado, com vários arquivos `page.tsx` e `actions.ts` sem suas pastas originais. Por isso, este pacote entrega os arquivos corrigidos já na estrutura esperada `src/...`.
