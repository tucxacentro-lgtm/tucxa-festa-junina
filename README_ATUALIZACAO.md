# Ajuste - Períodos do relatório final de prestação de contas

Este pacote ajusta o item **4. Itens vendidos por períodos de 60 minutos** do relatório final.

## O que foi alterado

1. O item 4 passou a ser exibido como resumo por **período + categoria**, no mesmo espírito do item **2. Totais por categoria/resumo**.

   Antes:
   - Período
   - Categoria
   - Item
   - Quantidade
   - Valor

   Agora:
   - Período
   - Categoria
   - Quantidade
   - Total

2. Os horários do item 4 agora são calculados no fuso **America/Sao_Paulo**.

3. O relatório considera a janela operacional principal da festa como **12:00–17:00**.

4. Pedidos registrados fora dessa janela aparecem agrupados como:
   - **Antes de 12:00**
   - **Após 17:00**

Isso evita que o relatório mostre períodos deslocados como 13:11–14:11, 14:11–15:11 etc. e deixa a leitura mais adequada para prestação de contas.

## Arquivos incluídos

```txt
src/lib/operation-dashboard.ts
src/app/admin/festa-junina/prestacao-contas/page.tsx
src/app/admin/festa-junina/prestacao-contas/gerar-pdf/route.ts
src/app/admin/festa-junina/prestacao-contas/exportar-pedidos/route.ts
README_ATUALIZACAO.md
aplicar-ajustes.ps1
```

## Como aplicar

Extraia este ZIP na raiz do projeto, mantendo a estrutura de pastas `src/...`.

Ou rode no PowerShell, a partir da raiz do projeto:

```powershell
.\aplicar-ajustes.ps1
```

## Validação

Depois de aplicar, rode:

```bash
npm run lint
npm run build
```

Depois teste:

```txt
/admin/festa-junina/prestacao-contas
/admin/festa-junina/prestacao-contas/gerar-pdf
```

## Commit sugerido

```bash
git status

git add src/lib/operation-dashboard.ts \
  src/app/admin/festa-junina/prestacao-contas/page.tsx \
  src/app/admin/festa-junina/prestacao-contas/gerar-pdf/route.ts \
  src/app/admin/festa-junina/prestacao-contas/exportar-pedidos/route.ts

git commit -m "Ajusta períodos do relatório final de prestação de contas"

git push
```
