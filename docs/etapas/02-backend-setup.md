# Etapa 02 — Backend: setup

- **Status:** ✅ concluída
- **Data:** 2026-09-23

## Objetivo
Criar o esqueleto do backend mock: servidor Express 5 em TypeScript, persistência em JSON, tratamento padronizado de erros e ferramentas de qualidade.

## O que foi feito
- Projeto `backend/` em ESM com Express 5, Zod 4, TypeScript 6 (strict + `noUncheckedIndexedAccess`), ESLint 10 (flat config + typescript-eslint) e Prettier.
- Scripts: `dev`, `build`, `start`, `typecheck`, `lint`, `format`, `seed`, `reset`, `test`.
- `db/jsonDb.ts` mantém os dados em memória e grava `data/db.json` de forma atômica (arquivo temporário + rename).
- `AppError` e helpers (`notFound`, `unauthorized`, `badRequest`, `conflict`).
- `errorHandler` converte `AppError`, `ZodError` (400 `VALIDATION_ERROR` com `details`) e JSON malformado no formato padrão de erro. O `notFoundHandler` responde 404 para rotas inexistentes.
- Middleware `auth` (JWT → `req.userId`) já preparado para a etapa 03.
- Utilitários `utils/date.ts` (addMonths, dateInMonth com clamp, monthRange...), `utils/money.ts` (splitInstallments) e `utils/validation.ts` (`parse()` com mensagens do zod em pt-BR).
- Rota `GET /api/health`.

## Arquivos principais
| Arquivo | Papel |
|---|---|
| `backend/src/app.ts` | Monta o app (cors, json, rotas, handlers) |
| `backend/src/db/jsonDb.ts` | Persistência mock |
| `backend/src/errors.ts` | Erros de domínio |
| `backend/src/middleware/*` | auth, errorHandler, notFoundHandler |
| `backend/src/utils/*` | datas, dinheiro, validação |
| `backend/src/types.ts` | Tipos de domínio |

## Decisões
- **Validação com `parse()` na rota, não em middleware:** no Express 5, `req.query` é somente leitura. Chamar `parse(schema, req.query)` na rota também mantém a inferência de tipos.
- Express 5 encaminha erros de handlers async ao `errorHandler` sem wrapper.
- `.env` opcional, carregado por `process.loadEnvFile()` (nativo do Node), sem dependência de dotenv.
- `.gitattributes` com `eol=lf` para padronizar quebras de linha no Windows.

## Como testar
```bash
cd backend
npm run typecheck && npm run lint && npm run build
npm run dev
curl http://localhost:3334/api/health   # {"status":"ok"}
curl http://localhost:3334/api/xyz      # 404 {"error":{"code":"NOT_FOUND",...}}
```

## Pendências / próximos passos
- Etapa 03: autenticação.
