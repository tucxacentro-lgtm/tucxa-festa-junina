# Ajustes — Garçom / Responsável / QR Code

## Arquivo alterado

Substituir o arquivo abaixo no projeto:

```txt
src/app/gestao-evento/garcom/page.tsx
```

## O que foi ajustado

1. O texto exibido abaixo do QR Code agora é um link clicável.
   - O QR Code e o link apontam para o mesmo endereço de acompanhamento dos pedidos do responsável.
   - O link agora é gerado como URL completa, facilitando copiar ou encaminhar por WhatsApp quando o QR Code não puder ser lido.

2. O botão “Abrir pedidos” foi alterado para “Fazer Pedido”.
   - O destino continua sendo o cardápio já vinculado ao responsável.

3. A tela de Garçom/Atendimento recebeu uma área de atalho rápido antes dos cards/tabela.
   - Mostra os nomes dos responsáveis em botões compactos.
   - Ao tocar/clicar no nome, abre o cardápio para fazer novo pedido para aquele responsável.
   - Permite ordenar por:
     - Ordem alfabética;
     - Mais recente;
     - Mais antiga.

## Passo a passo para atualizar

1. Feche o servidor local, caso esteja rodando.

2. Extraia este ZIP na raiz do projeto, mantendo a estrutura de pastas.

3. Confirme se o arquivo abaixo foi substituído:

```txt
src/app/gestao-evento/garcom/page.tsx
```

4. Rode as validações:

```bash
npm run lint
npm run build
```

5. Teste no celular e no notebook:

```txt
/gestao-evento/garcom
```

Valide:

- O texto abaixo do QR Code aparece como link clicável.
- O link abre a mesma tela de detalhes/acompanhamento dos pedidos do responsável.
- O botão aparece como “Fazer Pedido”.
- A lista rápida de responsáveis aparece antes dos cards.
- A ordenação funciona por ordem alfabética, mais recente e mais antiga.

6. Se tudo estiver correto, faça o commit:

```bash
git status
git add src/app/gestao-evento/garcom/page.tsx
git commit -m "Ajusta link do QR Code e atalhos de responsaveis no garcom"
git push
```
