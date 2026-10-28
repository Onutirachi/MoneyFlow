# Etapa 17 — Identidade visual (logo, favicon e título)

- **Status:** ✅ concluída
- **Data:** 2026-10-28
- **Commit:** ver `git log --grep "etapa 17"`

## Objetivo
Trocar a marca genérica ("Finanças" com ícone de cofrinho, favicon padrão do Vite, título "Finanças Pessoais") pelo logo do MoneyFlow, entregue pelo grupo em SVG.

## O que foi feito
- `docs/marca/MoneyFlowLogo.svg`: arte original, exportada do CorelDRAW.
- `frontend/src/components/common/Logo.tsx`: o mesmo desenho como componente React, com `fill="currentColor"`. A cor vem do texto em volta (escura no tema claro, clara no escuro), e o tamanho é definido pela altura (`h-7 w-auto`).
- Onde o logo aparece:
  - barra lateral (`Brand`, em `Sidebar.tsx`);
  - menu lateral do celular;
  - **barra do topo no celular**, onde a barra lateral fica escondida (link para o dashboard);
  - telas de login e cadastro: grande no painel esquerdo do desktop e na `Brand` no celular.
- `frontend/public/favicon.svg`: as três setas do logo, brancas num quadrado escuro com borda, legível sobre abas claras e escuras.
- `index.html`: título "MoneyFlow" e meta description.
- Login: a dica da conta de demonstração ficou sem a instrução `npm run seed`, que só servia para desenvolvimento.

## Arquivos principais
| Arquivo | Papel |
|---|---|
| `docs/marca/MoneyFlowLogo.svg` | arte original |
| `frontend/src/components/common/Logo.tsx` | logo como componente (currentColor) |
| `frontend/public/favicon.svg` | ícone da aba |
| `frontend/src/components/layout/Sidebar.tsx` | `Brand` com o logo |
| `frontend/src/components/layout/AppLayout.tsx` | logo no topo no celular |
| `frontend/src/components/layout/AuthLayout.tsx` | logo grande no login/cadastro |

## Decisões
- SVG inline em componente, e não `<img src>`: assim o logo herda a cor do tema sem precisar de dois arquivos.
- Favicon só com as setas: o wordmark completo fica ilegível em 16–32 px.
- As chaves internas do `localStorage` (`financas.token`, `financas.theme`) não foram renomeadas, para não deslogar quem já usa o sistema.

## Como testar
```bash
cd frontend && npm run dev   # ou: docker compose up -d --build web (http://localhost:8080)
```
Resultado esperado:
- a aba mostra "MoneyFlow" e o ícone das três setas;
- o login mostra o logo grande à esquerda (desktop);
- logado, o logo aparece no topo da barra lateral e fica claro no tema escuro;
- no celular (largura < 768 px), o logo aparece na barra do topo, ao lado do botão de menu.

Verificado com prints do Edge headless: login no desktop (claro), login no celular (escuro), dashboard no desktop (claro e escuro) e movimentos no celular (claro).

## Pendências / próximos passos
- Ícone para "adicionar à tela inicial" do celular (`apple-touch-icon` e manifest PNG), se o grupo quiser.
