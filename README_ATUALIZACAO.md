# Ajustes - Caixa, login, cancelados, CSV e prestação de contas

## Arquivos incluídos

```txt
src/app/gestao-evento/caixa/page.tsx
src/app/gestao-evento/actions.ts
src/app/admin/login/page.tsx
src/app/admin/login/admin-login-form.tsx
src/app/admin/festa-junina/atendimento/cancelados/page.tsx
src/app/admin/festa-junina/atendimento/cancelados/actions.ts
src/app/admin/festa-junina/prestacao-contas/page.tsx
src/app/admin/festa-junina/prestacao-contas/exportar-pedidos/route.ts
supabase/031_limpeza_pedidos_cancelados_teste.sql
```

## O que foi ajustado

1. **Caixa por responsável**
   - O fechamento agora reforça o total agrupado por responsável.
   - O caixa pode registrar pagamento agrupado de todos os pedidos pendentes do responsável.
   - Os pedidos individuais aparecem em blocos de abrir/recolher.
   - Cada pedido individual também pode ser pago separadamente por Pix, crédito, débito ou dinheiro.

2. **Login da gestão**
   - A tela de login passou a usar o mesmo cabeçalho das demais telas.
   - Foi adicionada opção de mostrar/ocultar senha.

3. **Pedidos cancelados**
   - A tela mostra somente pedidos cancelados no dia da festa, com base em `events.event_date` e `cancelled_at`.
   - Foi adicionada opção de **Excluir definitivamente** o pedido cancelado.
   - Antes da exclusão, o sistema exibe alerta informando que a ação é irreversível.
   - A exclusão remove pagamentos, itens e o pedido.

4. **Plano B - CSV**
   - Criada rota para exportar todos os pedidos registrados em CSV:

```txt
/admin/festa-junina/prestacao-contas/exportar-pedidos
```

5. **Relatório final / prestação de contas**
   - Criada tela com drill-down:
     - resumo geral;
     - formas de pagamento;
     - categorias/resumo;
     - itens do cardápio;
     - responsáveis e pedidos;
     - cancelamentos e divergências;
     - botão para exportar CSV.

6. **SQL opcional**
   - Incluído SQL opcional para limpar pedidos cancelados de teste fora do dia da festa:

```txt
supabase/031_limpeza_pedidos_cancelados_teste.sql
```

## Passo a passo para aplicar

### Opção 1 - Aplicar manualmente

1. Extraia o ZIP na raiz do projeto.
2. Confirme que os arquivos foram substituídos/criados nos caminhos acima.
3. Rode:

```bash
npm run lint
npm run build
```

4. Teste as telas:

```txt
/gestao-evento/caixa
/admin/login
/admin/festa-junina/atendimento/cancelados
/admin/festa-junina/prestacao-contas
/admin/festa-junina/prestacao-contas/exportar-pedidos
```

### Opção 2 - Aplicar pelo PowerShell

Na raiz do projeto, depois de extrair o ZIP, rode:

```powershell
./aplicar-ajustes.ps1
```

## Commit no GitHub

Depois dos testes:

```bash
git status

git add src/app/gestao-evento/caixa/page.tsx \
  src/app/gestao-evento/actions.ts \
  src/app/admin/login/page.tsx \
  src/app/admin/login/admin-login-form.tsx \
  src/app/admin/festa-junina/atendimento/cancelados/page.tsx \
  src/app/admin/festa-junina/atendimento/cancelados/actions.ts \
  src/app/admin/festa-junina/prestacao-contas/page.tsx \
  src/app/admin/festa-junina/prestacao-contas/exportar-pedidos/route.ts \
  supabase/031_limpeza_pedidos_cancelados_teste.sql

git commit -m "Ajusta caixa, login, cancelados, CSV e prestação de contas"

git push
```
