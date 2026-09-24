# Backend (mock) — padrões

API mock em Node + Express + TypeScript. Implementa o contrato de [../docs/api.md](../docs/api.md). Regras em [../docs/regras-de-negocio.md](../docs/regras-de-negocio.md).

## Comandos
```bash
npm run dev        # tsx watch, porta 3334
npm run seed       # recria data/db.json com dados de demonstração
npm run reset      # recria data/db.json vazio
npm run typecheck && npm run lint && npm run build && npm test
npm test           # testes de integração (node:test + fetch, banco temporário)
```

## Estrutura
```
src/
  server.ts            sobe o servidor
  app.ts               cria o express app (cors, json, rotas, errorHandler)
  config.ts            PORT, JWT_SECRET, DB_PATH
  types.ts             tipos de domínio (espelhados em frontend/src/types/index.ts)
  db/jsonDb.ts         carrega/salva data/db.json (escrita atômica)
  errors.ts            AppError + helpers (notFound, badRequest...)
  middleware/          auth.ts (JWT → req.userId), errorHandler.ts, notFoundHandler.ts
  schemas/             x.schema.ts — schemas zod de entrada
  routes/              x.routes.ts — rotas finas
  services/            x.service.ts — TODA regra de negócio
  utils/               date.ts, money.ts, validation.ts
  seed.ts
```

## Como adicionar um endpoint
1. Schema zod em `schemas/x.schema.ts`.
2. Função no service `services/x.service.ts` recebendo `(userId, input)` e retornando dados puros. Lança `AppError` para erros.
3. Rota em `routes/x.routes.ts`: `router.post('/', (req, res) => { res.status(201).json(service.create(req.userId, parse(createSchema, req.body))); })`. No Express 5 `req.query` é somente leitura, por isso validamos com `parse()` na rota e não com middleware. Erros lançados, inclusive em handlers async, chegam ao `errorHandler`.
4. Registrar o router em `routes/index.ts` (se for novo).
5. Documentar em `docs/api.md` e espelhar tipos no frontend.

## Regras
- Services **não** importam express.
- Todo acesso filtra por `userId`; recurso alheio → `notFound()`.
- Nunca retornar `passwordHash`.
- Mutations chamam `db.save()` ao final.
- Datas só via `utils/date.ts`.
