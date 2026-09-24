# Etapa 03 — Backend: autenticação

- **Status:** ✅ concluída
- **Data:** 2026-09-23

## Objetivo
Cadastro, login e sessão do usuário via JWT, base para todas as rotas protegidas.

## O que foi feito
- `POST /api/auth/register`: valida os dados (nome ≥ 2, e-mail normalizado em minúsculas, senha ≥ 6), gera o hash da senha com bcrypt, cria as **categorias padrão** do usuário e retorna `{ token, user }`.
- `POST /api/auth/login`: retorna `401 INVALID_CREDENTIALS` quando e-mail ou senha estão errados.
- `GET /api/auth/me`: protegida pelo middleware `auth`.
- JWT com `sub = userId`, expira em 7 dias. `passwordHash` nunca é retornado (`toPublicUser`).
- **Testes de integração** (`src/test/`): sobem o app numa porta aleatória, usam um banco temporário e fazem requisições com `fetch`. Script `npm test`.

## Arquivos principais
| Arquivo | Papel |
|---|---|
| `backend/src/services/auth.service.ts` | register/login/me, assinatura do token |
| `backend/src/services/defaults.ts` | Categorias padrão |
| `backend/src/routes/auth.routes.ts` | Rotas |
| `backend/src/schemas/auth.schema.ts` | Validação |
| `backend/src/test/helpers.ts` | `startTestApi()`, `registerUser()` |
| `backend/src/test/auth.test.ts` | Testes de auth |

## Decisões
- Testes com `node:test` + `fetch` nativo, sem Jest ou supertest, para ter menos dependências. `src/test/setup.ts` precisa ser importado primeiro em cada teste, porque define `DB_PATH`.
- O token é invalidado se o usuário não existe mais no banco (por exemplo, depois de `npm run reset`).

## Como testar
```bash
cd backend && npm test
# manual
curl -X POST localhost:3334/api/auth/register -H "Content-Type: application/json" \
  -d '{"name":"Ana","email":"ana@test.com","password":"123456"}'
curl localhost:3334/api/auth/me -H "Authorization: Bearer <token>"
```

## Pendências / próximos passos
- Etapa 04: contas e categorias.
