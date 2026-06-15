# Ajustes pós-evento — edição de pedidos e prestação de contas

## Arquivos incluídos

```txt
src/app/gestao-evento/caixa/page.tsx
src/app/gestao-evento/actions.ts
src/app/admin/festa-junina/prestacao-contas/page.tsx
src/app/admin/festa-junina/prestacao-contas/exportar-pedidos/route.ts
src/lib/operation-dashboard.ts
```

## O que foi ajustado

1. **Edição de pedidos no caixa**
   - Em cada pedido individual, foi adicionada a opção **Editar pedido: incluir, excluir ou trocar itens**.
   - Para excluir um item, deixar a quantidade como `0`.
   - Para incluir um item, informar a quantidade desejada.
   - Para trocar um item, zerar o item antigo e informar quantidade no novo item.
   - O total do pedido é recalculado automaticamente.
   - O status de pagamento é recalculado conforme o novo total e os pagamentos já registrados.

2. **Prestação de contas**
   - Corrigidos os blocos:
     - Totais por forma de pagamento.
     - Totais por categoria/resumo.
     - Itens vendidos por item do cardápio.
   - Substituído o drill-down por responsável/pedido por uma visão mais útil de **itens vendidos**.
   - Incluída ordenação por **valor** ou **quantidade**.
   - Incluída nova visão de **itens vendidos por períodos de 60 minutos**, do primeiro ao último pedido registrado.

3. **Exportação CSV**
   - O CSV passou a incluir a categoria do item.
   - Quando um pedido aparece como pago, mas não há forma de pagamento registrada em tabela de pagamentos, o CSV indica **Pago sem forma registrada**.

## Passo a passo para atualizar

1. Extraia este ZIP na raiz do projeto, mantendo a estrutura `src/...`.
2. Substitua os arquivos existentes quando o Windows perguntar.
3. Rode as validações:

```bash
npm run lint
npm run build
```

4. Teste as telas:

```txt
/gestao-evento/caixa
/admin/festa-junina/prestacao-contas
/admin/festa-junina/prestacao-contas/exportar-pedidos
```

## Testes recomendados

### Edição de pedido

1. Acesse `/gestao-evento/caixa`.
2. Selecione um responsável.
3. Abra um pedido individual.
4. Abra **Editar pedido: incluir, excluir ou trocar itens**.
5. Altere quantidades e salve.
6. Confira se o total do pedido e o total do responsável foram recalculados.

### Prestação de contas

1. Acesse `/admin/festa-junina/prestacao-contas`.
2. Confira os totais por forma de pagamento.
3. Confira os totais por categoria/resumo.
4. Teste a ordenação por valor e por quantidade.
5. Abra a visão por períodos de 60 minutos.

## Commit sugerido

```bash
git status

git add src/app/gestao-evento/caixa/page.tsx \
  src/app/gestao-evento/actions.ts \
  src/app/admin/festa-junina/prestacao-contas/page.tsx \
  src/app/admin/festa-junina/prestacao-contas/exportar-pedidos/route.ts \
  src/lib/operation-dashboard.ts

git commit -m "Ajusta edicao de pedidos e relatorios pos-evento"

git push
```
