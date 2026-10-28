# Backend — padrões

API em Node + Express 5 + TypeScript com PostgreSQL (driver `pg`, SQL escrito à mão, ADR 0008). Implementa o contrato de [../docs/api.md](../docs/api.md). Regras em [../docs/regras-de-negocio.md](../docs/regras-de-negocio.md).

## Comandos
```bash
docker compose up -d   # PostgreSQL 16 na porta 5433 (dados no volume moneyflow-data)
npm run dev            # tsx watch, porta 3334 (aplica o schema ao subir)
npm run seed           # APAGA tudo e cria o usuário demo (demo@demo.com / 123456)
npm run seed -- --if-empty   # só se o banco não tiver usuários (usado pelo iniciar.cmd)
npm run reset          # apaga tudo, banco vazio
npm run migrate        # só aplica db/schema.sql
npm run typecheck && npm run lint && npm run build && npm test
npm test               # integração (node:test + fetch) no banco moneyflow_test, criado sozinho
```
Configuração em `.env` (copie de `.env.example`): `PORT`, `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGIN`. Testes usam `TEST_DATABASE_URL` se definido.

## Estrutura
```
db/schema.sql          esquema idempotente (CREATE ... IF NOT EXISTS), aplicado na subida
docker-compose.yml     Postgres de desenvolvimento
src/
  server.ts            migra e sobe o servidor (mensagem clara se o banco estiver fora)
  app.ts               express app (cors, json, rotas, errorHandler)
  config.ts            PORT, JWT_SECRET, DATABASE_URL, CORS_ORIGIN
  types.ts             tipos públicos da API (espelhados em frontend/src/types/index.ts)
  db/pool.ts           pool, query/execute/one/must, withTx (transação)
  db/migrate.ts        aplica schema.sql com advisory lock
  db/movements.ts      linha ↔ Movement e insertMovement (usado por movimentos e custos fixos)
  errors.ts            AppError + helpers (notFound, badRequest, conflict, unauthorized)
  middleware/          auth.ts (JWT + usuário existe → req.userId), errorHandler.ts, notFoundHandler.ts
  schemas/             x.schema.ts (zod) + common.ts
  routes/              x.routes.ts — rotas finas
  services/            x.service.ts — TODA regra de negócio
  utils/               date.ts (hoje em America/Sao_Paulo), money.ts, validation.ts (parse, idParam)
  seed.ts
```

## Como adicionar um endpoint
1. Schema zod em `schemas/x.schema.ts`.
2. Função async no service `services/x.service.ts` recebendo `(userId, ...)` e retornando dados no formato da API (camelCase). Lança `AppError` para erros.
3. Rota em `routes/x.routes.ts`: `router.post('/', async (req, res) => { res.status(201).json(await service.create(req.userId, parse(schema, req.body))); })`. Ids da URL passam por `idParam()`, que transforma um id que não é UUID em 404. No Express 5, erros lançados em handlers async chegam ao `errorHandler`.
4. Registrar o router em `routes/index.ts` (se for novo), atrás de `requireAuth`.
5. Documentar em `docs/api.md` e espelhar tipos no frontend.

## Regras
- Services **não** importam express.
- Todo SQL filtra por `user_id`; recurso alheio → `notFound()`.
- SQL **sempre parametrizado** (`$1`, `$2`...). Colunas em snake_case no banco, camelCase na API (converter no service).
- Mais de uma escrita que precisa ser atômica → `withTx(async (c) => ...)`, passando `c` para `query`/`execute`.
- Somas em SQL com `::bigint` (o pool converte BIGINT para `number`; `SUM` sem cast vira `numeric`/string).
- Mudança de esquema: editar `db/schema.sql` de forma idempotente (`ADD COLUMN IF NOT EXISTS`...). O banco de quem já roda o projeto não é recriado.
- Nunca retornar `password_hash`.
- Datas só via `utils/date.ts`.
