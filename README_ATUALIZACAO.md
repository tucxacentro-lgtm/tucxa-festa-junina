# Ajustes — Caixa agrupado, Relatórios e Cancelados

## Arquivos incluídos no pacote

```txt
src/app/gestao-evento/caixa/page.tsx
src/app/gestao-evento/actions.ts
src/app/admin/festa-junina/relatorios/page.tsx
src/app/admin/festa-junina/atendimento/cancelados/page.tsx
src/app/admin/festa-junina/atendimento/cancelados/actions.ts
src/app/admin/festa-junina/prestacao-contas/page.tsx
src/app/admin/festa-junina/prestacao-contas/exportar-pedidos/route.ts
src/app/admin/login/page.tsx
src/app/admin/login/admin-login-form.tsx
supabase/031_limpeza_pedidos_cancelados_teste.sql
```

## O que foi ajustado

### 1. Caixa agrupado por responsável

A tela `/gestao-evento/caixa` agora agrupa os cards pelo nome do responsável.

Exemplo esperado:

- Emerson com 2 pedidos de R$ 34,00 aparece uma única vez.
- O total agrupado aparece como R$ 68,00.
- Ao abrir o fechamento, aparecem os pedidos individuais.
- O caixa pode registrar pagamento agrupado ou abrir cada pedido para pagar separadamente.

Também foi ajustada a action `registerCashierGroupPayment` para receber os `order_ids` do grupo e registrar o pagamento nos pedidos corretos.

### 2. Menu Relatórios da Prestação de Contas

Foi criada a rota:

```txt
/admin/festa-junina/relatorios
```

Ela redireciona para:

```txt
/admin/festa-junina/prestacao-contas
```

Assim, se o menu lateral continuar apontando para `Relatórios`, o usuário será levado para a nova tela de prestação de contas com drill-down.

### 3. Cancelados com filtro operacional

A tela `/admin/festa-junina/atendimento/cancelados` foi alterada para mostrar filtros por:

- data inicial;
- data final;
- período do dia: madrugada, manhã, tarde, noite ou dia inteiro.

Agora, sem filtro aplicado, a tela mostra todos os pedidos cancelados do evento, inclusive testes. Com filtro, mostra somente o período selecionado.

Os textos antigos que diziam que apenas o dia da festa seria exibido foram removidos.

A tela mantém:

- abrir pedido;
- restaurar pedido;
- excluir definitivamente com confirmação de ação irreversível.

## Passo a passo para atualizar

1. Feche o servidor local, se estiver rodando.

2. Extraia o conteúdo do ZIP na raiz do projeto, mantendo a estrutura das pastas `src/...`.

3. Confirme os arquivos alterados:

```bash
git status
```

4. Rode as validações:

```bash
npm run lint
npm run build
```

5. Teste as telas:

```txt
/gestao-evento/caixa
/admin/festa-junina/relatorios
/admin/festa-junina/prestacao-contas
/admin/festa-junina/atendimento/cancelados
```

## Testes recomendados

### Caixa

1. Crie dois pedidos para o mesmo responsável, por exemplo Emerson.
2. Acesse `/gestao-evento/caixa`.
3. Confira se Emerson aparece uma única vez na lista lateral.
4. Confira se o total agrupado soma todos os pedidos dele.
5. Abra os pedidos individuais e confira se cada pedido pode ser pago separadamente.
6. Registre pagamento agrupado e confira se todos os pedidos ficam como pagos.

### Relatórios

1. Entre na gestão.
2. Clique em `Prestação de Contas > Relatórios`.
3. Confirme se abre a tela de prestação de contas com o drill-down.
4. Teste o botão de exportar CSV.

### Cancelados

1. Acesse `/admin/festa-junina/atendimento/cancelados`.
2. Confira se os cancelados de teste aparecem quando não há filtro.
3. Filtre por uma data específica.
4. Teste restaurar um pedido cancelado.
5. Teste excluir definitivamente apenas em um pedido de teste.

## Commit sugerido

```bash
git add src/app/gestao-evento/caixa/page.tsx \
  src/app/gestao-evento/actions.ts \
  src/app/admin/festa-junina/relatorios/page.tsx \
  src/app/admin/festa-junina/atendimento/cancelados/page.tsx \
  src/app/admin/festa-junina/atendimento/cancelados/actions.ts \
  src/app/admin/festa-junina/prestacao-contas/page.tsx \
  src/app/admin/festa-junina/prestacao-contas/exportar-pedidos/route.ts \
  src/app/admin/login/page.tsx \
  src/app/admin/login/admin-login-form.tsx \
  supabase/031_limpeza_pedidos_cancelados_teste.sql

git commit -m "Ajusta caixa agrupado, relatorios e cancelados"

git push
```
