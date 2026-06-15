# Atualização — Despesas, receitas manuais e ticket médio na prestação de contas

## Objetivo

Esta entrega adiciona à Prestação de Contas:

- cadastro, edição e exclusão de despesas;
- cadastro, edição e exclusão de receitas manuais;
- lançamento inicial das despesas informadas pela coordenação;
- lançamento inicial de R$ 2.600,00 em convites antecipados;
- cálculo de ticket médio de consumo considerando R$ 20,00 por convite;
- inclusão dos dados no relatório final e na versão para PDF;
- inclusão dos lançamentos financeiros no CSV completo.

## Arquivos incluídos

```txt
src/lib/operation-dashboard.ts
src/app/admin/festa-junina/prestacao-contas/page.tsx
src/app/admin/festa-junina/prestacao-contas/actions.ts
src/app/admin/festa-junina/prestacao-contas/exportar-pedidos/route.ts
src/app/admin/festa-junina/prestacao-contas/gerar-pdf/route.ts
supabase/sql/032_event_accounting_entries.sql
README_ATUALIZACAO.md
aplicar-ajustes.ps1
```

## Passo a passo

### 1. Extrair o ZIP

Extraia o ZIP na raiz do projeto, mantendo a estrutura das pastas `src/...` e `supabase/sql/...`.

### 2. Rodar o SQL no Supabase

No Supabase, abra o **SQL Editor** e rode:

```txt
supabase/sql/032_event_accounting_entries.sql
```

Esse SQL cria a tabela `event_accounting_entries` e cadastra os lançamentos iniciais:

- despesas informadas pela coordenação;
- bebidas como `Aguardando valor`;
- receita manual de convites antecipados de R$ 2.600,00, com 130 convites a R$ 20,00.

### 3. Validar localmente

```bash
npm run lint
npm run build
```

### 4. Testar no navegador

```txt
/admin/festa-junina/prestacao-contas
/admin/festa-junina/prestacao-contas/gerar-pdf
/admin/festa-junina/prestacao-contas/exportar-pedidos
```

### 5. O que testar

- conferir os cards de receitas manuais, despesas, resultado e ticket médio;
- editar uma despesa existente;
- incluir o valor de bebidas quando estiver disponível;
- excluir um lançamento de teste;
- incluir nova receita manual;
- gerar o PDF e conferir se a seção financeira aparece;
- baixar o CSV e conferir se os lançamentos financeiros aparecem no final.

### 6. Commit sugerido

```bash
git status

git add src/lib/operation-dashboard.ts \
  src/app/admin/festa-junina/prestacao-contas/page.tsx \
  src/app/admin/festa-junina/prestacao-contas/actions.ts \
  src/app/admin/festa-junina/prestacao-contas/exportar-pedidos/route.ts \
  src/app/admin/festa-junina/prestacao-contas/gerar-pdf/route.ts \
  supabase/sql/032_event_accounting_entries.sql

git commit -m "Inclui despesas receitas manuais e ticket medio na prestacao de contas"

git push
```
