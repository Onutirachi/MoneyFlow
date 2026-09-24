# Etapa 06 — Backend: custos fixos

- **Status:** ✅ concluída
- **Data:** 2026-09-23

## Objetivo
Cadastrar custos fixos (aluguel, internet, assinaturas, salário...) que entram automaticamente todo mês.

## O que foi feito
- `GET/POST/PUT/DELETE /api/recurring`, com validação de conta, método permitido, tipo da categoria, dia do mês (1–31) e `endMonth >= startMonth`.
- `ensureMaterialized(userId, untilMonth)` gera os movimentos reais de cada custo fixo ativo, do `startMonth` até o mês consultado, e registra os meses em `materializedMonths`. É chamado por `GET /movements` e será chamado pelo dashboard.
- Idempotente: consultar o mesmo mês de novo não duplica, e uma ocorrência excluída não é recriada.
- Editar um custo fixo vale só para meses ainda não gerados. `active: false` para a geração. Excluir mantém as ocorrências já geradas, com `recurringId: null`.
- `validateRefs` foi para `services/refs.ts`, compartilhado entre movimentos e custos fixos, para evitar import circular.
- Testes: idempotência, dia 31 em fevereiro, exclusão de ocorrência, edição, `endMonth` e `active`.

## Arquivos principais
| Arquivo | Papel |
|---|---|
| `backend/src/services/recurring.service.ts` | CRUD + materialização |
| `backend/src/services/refs.ts` | Validação compartilhada de conta/método/categoria |
| `backend/src/schemas/recurring.schema.ts` | Validação |
| `backend/src/test/recurring.test.ts` | Testes |

## Decisões
- Materialização lazy (ADR 0004).

## Como testar
```bash
cd backend && npm test    # 17 testes
```
Manual: criar um custo fixo com `startMonth` no mês atual e consultar `GET /api/movements?month=` de um mês futuro. A ocorrência aparece uma única vez.

## Pendências / próximos passos
- Etapa 07: dashboard e seed.
