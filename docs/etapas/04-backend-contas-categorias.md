# Etapa 04 — Backend: contas e categorias

- **Status:** ✅ concluída
- **Data:** 2026-09-23

## Objetivo
CRUD de contas (com os métodos de pagamento aceitos) e de categorias. É a base para restringir os métodos disponíveis ao lançar um movimento.

## O que foi feito
- `GET/POST/PUT/DELETE /api/accounts`. O retorno inclui `balance`, calculado como saldo inicial mais os movimentos até hoje.
- `methods` exige pelo menos um item, e duplicados são removidos automaticamente.
- `GET /api/categories?type=`, `POST`, `PUT` (nome e cor; o tipo não muda) e `DELETE`.
- Excluir uma conta ou categoria em uso retorna `409 ACCOUNT_IN_USE` / `CATEGORY_IN_USE`.
- Helpers reutilizáveis para as próximas etapas: `getOwnedAccount`, `assertMethodAllowed`, `computeBalance`, `signedAmount`, `getOwnedCategory`, `assertCategoryType`.
- Schemas comuns em `schemas/common.schema.ts` (cor, tipo, método, valor, mês e data).
- Testes: CRUD, validação de métodos, isolamento entre usuários (404) e categorias padrão.

## Arquivos principais
| Arquivo | Papel |
|---|---|
| `backend/src/services/accounts.service.ts` | Contas, saldo, validação de método |
| `backend/src/services/categories.service.ts` | Categorias, validação de tipo |
| `backend/src/schemas/common.schema.ts` | Schemas reutilizáveis |
| `backend/src/test/accounts.test.ts` | Testes |

## Decisões
- O saldo é calculado na leitura, não armazenado. Assim nunca fica inconsistente.
- ESLint passa a ignorar variáveis com prefixo `_`, usadas para omitir `userId` na desestruturação.

## Como testar
```bash
cd backend && npm test
curl -X POST localhost:3333/api/accounts -H "Authorization: Bearer <token>" -H "Content-Type: application/json" \
  -d '{"name":"Banco XPTO","color":"#2563eb","initialBalance":100000,"methods":["PIX","CREDITO","DEBITO"]}'
```

## Pendências / próximos passos
- Etapa 05: movimentos e parcelamento.
