# Atualização — Relatório final, PDF e bloqueio de edição de pedidos pagos

## Arquivos alterados / novos

Substituir ou adicionar estes arquivos na mesma estrutura do projeto:

```txt
src/app/gestao-evento/caixa/page.tsx
src/app/gestao-evento/actions.ts
src/app/admin/festa-junina/prestacao-contas/page.tsx
src/app/admin/festa-junina/prestacao-contas/exportar-pedidos/route.ts
src/app/admin/festa-junina/prestacao-contas/gerar-pdf/route.ts
src/lib/operation-dashboard.ts
```

## O que foi ajustado

### 1. Editar pedido somente quando não estiver pago

Na tela de caixa, a opção **Editar pedido: incluir, excluir ou trocar itens** aparece somente para pedidos ainda não pagos.

Para pedidos já pagos, aparece a mensagem:

```txt
Pedido pago. Edição bloqueada para preservar a prestação de contas.
```

Também foi incluída validação no servidor para impedir alteração via action caso alguém tente editar um pedido pago diretamente.

### 2. Relatório final do evento

A consulta de pedidos/itens foi reforçada para preencher corretamente:

```txt
- Totais por forma de pagamento
- Totais por categoria/resumo
- Itens vendidos por item do cardápio
- Itens vendidos por períodos de 60 minutos
```

A função que busca pedidos agora também tenta uma consulta alternativa dos itens, caso a base não aceite algum campo extra no select. Isso evita que o relatório fique sem itens mesmo quando o acompanhamento de vendas mostra os dados.

### 3. Gerar PDF do relatório

Foi criada a rota:

```txt
/admin/festa-junina/prestacao-contas/gerar-pdf
```

Na tela de Prestação de Contas, foi incluído o botão **Gerar PDF do relatório**.

Ao abrir, o navegador exibe uma versão de impressão do relatório e abre a opção de imprimir/salvar. Para salvar PDF, escolha a impressora **Salvar como PDF**.

## Passo a passo para aplicar

1. Extraia o ZIP na raiz do projeto, mantendo a estrutura `src/...`.

2. Rode as validações:

```bash
npm run lint
npm run build
```

3. Teste as telas:

```txt
/gestao-evento/caixa
/admin/festa-junina/prestacao-contas
/admin/festa-junina/prestacao-contas/gerar-pdf
/admin/festa-junina/prestacao-contas/exportar-pedidos
```

4. Pontos de teste importantes:

```txt
- Pedido pago não deve mostrar a opção de edição.
- Pedido pendente deve mostrar a opção de edição.
- Relatório final deve mostrar itens vendidos.
- Totais por categoria/resumo devem aparecer.
- Itens por períodos de 60 minutos devem aparecer.
- Botão Gerar PDF deve abrir a tela de impressão/salvar em PDF.
```

5. Commit no GitHub:

```bash
git status

git add src/app/gestao-evento/caixa/page.tsx \
  src/app/gestao-evento/actions.ts \
  src/app/admin/festa-junina/prestacao-contas/page.tsx \
  src/app/admin/festa-junina/prestacao-contas/exportar-pedidos/route.ts \
  src/app/admin/festa-junina/prestacao-contas/gerar-pdf/route.ts \
  src/lib/operation-dashboard.ts

git commit -m "Ajusta relatorio final, PDF e bloqueia edicao de pedidos pagos"

git push
```
