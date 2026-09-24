# Etapa 12 — Frontend: custos fixos

- **Status:** ✅ concluída
- **Data:** 2026-09-23

## Objetivo
Tela para cadastrar gastos e receitas que se repetem todo mês e são lançados automaticamente.

## O que foi feito
- **`/custos-fixos`**: lista ordenada pelo dia do mês, com dia, descrição, categoria, conta, período ("desde mar/26 · sem fim"), método, valor, **switch para pausar/reativar** e menu de editar/excluir. O resumo mostra saídas e entradas fixas por mês (só ativos).
- **Formulário**: tipo, descrição, valor, conta → método (só os da conta; selecionado automaticamente se a conta tiver um só), categoria, dia do mês (1–31), mês inicial, mês final opcional e ativo.
- **Refatoração**: `AccountSelect`, `MethodSelect` e `CategorySelect` (`components/common/EntitySelects.tsx`) e o hook `useAccountMethodSync` agora são compartilhados pelos formulários de movimento e de custo fixo.
- **Backend, regra revisada (ADR 0006)**: editar, pausar ou excluir um custo fixo descarta as ocorrências futuras (data > hoje) já geradas, que são regeneradas com os dados novos se o custo continuar ativo. Antes, os 3 meses futuros já gerados pelo dashboard ficavam com os dados antigos. Novo teste cobre esse caso (21 testes no total).

## Arquivos principais
| Arquivo | Papel |
|---|---|
| `frontend/src/pages/Recurring.tsx` | Tela |
| `frontend/src/components/recurring/RecurringFormDialog.tsx` | Formulário |
| `frontend/src/components/common/EntitySelects.tsx` | Selects de conta/método/categoria |
| `frontend/src/hooks/useAccountMethodSync.ts` | Coerência conta ↔ método e tipo ↔ categoria |
| `backend/src/services/recurring.service.ts` | `dropFutureOccurrences` |
| `docs/adr/0006-custos-fixos-edicao-regenera-futuro.md` | Decisão |

## Decisões
- ADR 0006: mudanças em custos fixos valem a partir de amanhã; o histórico nunca muda.

## Como testar
1. `/custos-fixos` → **Novo custo fixo** → conta "Carteira Física" → o método vira "Dinheiro" automaticamente. Trocar para "Banco Digital" → só PIX e Crédito.
2. Salvar "Plano de celular" dia 28 → `/movimentos` do próximo mês mostra a ocorrência com a badge **Fixo**.
3. Pausar o Salário pelo switch → ele some dos meses futuros, mas continua nos passados.
4. `cd backend && npm test` → 21 testes.

## Pendências / próximos passos
- Etapa 13: dashboard.
