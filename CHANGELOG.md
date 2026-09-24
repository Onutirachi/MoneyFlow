# Changelog

Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/). Cada etapa do [ROADMAP](docs/ROADMAP.md) gera uma entrada, em ordem cronológica (a mais recente no fim).

## [Etapa 01] — 2026-09-23
### Adicionado
- Harness do projeto: `CLAUDE.md` (raiz, backend, frontend), padrões de código, regras de negócio e contrato da API.
- Comandos do Claude Code: `/nova-etapa`, `/fechar-etapa`, `/nova-adr`.
- ADRs 0001–0005 (mock em JSON, centavos, UI, custos fixos, parcelamento).
- ROADMAP com as 14 etapas, template de etapa, `.editorconfig`, `.gitignore`.

## [Etapa 02] — 2026-09-23
### Adicionado
- Backend: Express 5 + TypeScript + Zod 4, ESLint e Prettier.
- Persistência mock em `data/db.json` com escrita atômica.
- Tratamento padronizado de erros (`AppError`, validação, JSON inválido, 404).
- Utilitários de data, dinheiro e validação; rota `GET /api/health`.
- `.gitattributes` com LF.

## [Etapa 03] — 2026-09-23
### Adicionado
- Backend: cadastro, login e `/auth/me` com JWT e bcrypt; categorias padrão criadas no cadastro.
- Testes de integração com `node:test` (`npm test`) e banco temporário.
### Alterado
- Harness: `npm test` passa a fazer parte do checklist de qualidade.

## [Etapa 04] — 2026-09-23
### Adicionado
- Backend: CRUD de contas (métodos de pagamento, saldo calculado) e de categorias.
- Proteção contra exclusão de conta ou categoria em uso (409).

## [Etapa 05] — 2026-09-23
### Adicionado
- Backend: movimentos (entrada/saída) com validação de método por conta e tipo da categoria.
- Parcelamento automático ("Descrição i/n", meses consecutivos, soma exata em centavos).
- Edição e exclusão de parcelas com `scope=one|group`.

## [Etapa 06] — 2026-09-23
### Adicionado
- Backend: custos fixos mensais com geração automática e idempotente dos movimentos.
### Alterado
- `validateRefs` movido para `services/refs.ts`.

## [Etapa 07] — 2026-09-23
### Adicionado
- Backend: `GET /api/dashboard` com resumo do mês, comparação com o mês anterior, quebras por categoria, conta e método, histórico de 12 meses e compromissos futuros.
- Seed de demonstração (`npm run seed`) e reset (`npm run reset`).

## [Etapa 08] — 2026-09-23
### Adicionado
- Frontend: Vite + React + TS, Tailwind v4, shadcn/ui, TanStack Query, React Router 8, ESLint e Prettier.
- Camada de dados (hooks), AuthContext, layout responsivo, tema claro/escuro, seletor de mês e componentes comuns.

## [Etapa 09] — 2026-09-23
### Adicionado
- Frontend: telas de login e cadastro, rotas protegidas e redirecionamento de volta à origem.
### Alterado
- Portas padrão: backend **3334**, frontend **5174** (3333 e 5173 já estão em uso por outro projeto na máquina).
- Tema claro/escuro com provider próprio no lugar de `next-themes`.
- Backend encerra com mensagem clara quando a porta está ocupada.

## [Etapa 10] — 2026-09-23
### Adicionado
- Frontend: telas de contas (saldo, métodos de pagamento) e categorias (entradas/saídas).
### Alterado
- Backend: `jsonDb` recarrega o arquivo quando ele muda por fora; seed com saldos iniciais realistas.

## [Etapa 11] — 2026-09-23
### Adicionado
- Frontend: tela de movimentos com navegação mensal, lista por dia, filtros e badges de parcela, fixo e previsto.
- Formulário com métodos limitados à conta, parcelamento com prévia e edição/exclusão por parcela ou grupo.
### Corrigido
- `MoneyInput`: a digitação sempre entra no final do número, independentemente da posição do cursor.

## [Etapa 12] — 2026-09-23
### Adicionado
- Frontend: tela de custos fixos com pausa/reativação, período e resumo mensal.
- Selects compartilhados de conta, método e categoria (`EntitySelects`) e o hook `useAccountMethodSync`.
### Alterado
- Backend (ADR 0006): editar, pausar ou excluir um custo fixo regenera as ocorrências futuras já geradas.

## [Etapa 13] — 2026-09-23
### Adicionado
- Frontend: dashboard com KPIs e deltas vs mês anterior, frase "economizou?", histórico de 12 meses (gráfico e tabela), resultado mensal divergente, quebras por categoria, conta e método, saldo por conta e compromissos futuros.
- Filtro de conta para o painel inteiro; paleta de gráficos validada para claro e escuro (ADR 0007).

## [Etapa 14] — 2026-09-24
### Corrigido
- Frontend: depois do cadastro o usuário ia para o dashboard em vez de `/contas` (corrida de redirecionamento). Agora só o `PublicOnlyRoute` redireciona, respeitando `state.from`.
- Gráficos: rótulo do topo do eixo não é mais comprimido; concordância "1 mês".
### Adicionado
- README com funcionalidades e mapa da documentação; verificação end-to-end com usuário novo.
