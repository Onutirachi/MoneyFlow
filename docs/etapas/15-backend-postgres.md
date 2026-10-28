# Etapa 15 — Backend real com PostgreSQL

- **Status:** ✅ concluída
- **Data:** 2026-10-28
- **Commit:** ver `git log --grep "etapa 15"`

## Objetivo
Trocar o backend mock (JSON em arquivo, ADR 0001) por um backend real com PostgreSQL, **sem mudar o contrato** de [api.md](../api.md), para o frontend continuar funcionando igual. A base é o backend que o Matheus escreveu (`backendmatheus/moneyflow-backend.zip`), com estas correções:
- edição de parcelas em grupo duplicava o sufixo `i/n`;
- token de usuário que não existe mais gerava erro 500 em vez de 401;
- `upcomingTotal` não somava os gastos avulsos;
- volta das nossas 13 categorias padrão e do usuário `demo@demo.com`;
- os testes de integração portados para rodar contra o Postgres.

Também prepara o terreno para publicar o sistema em containers numa VPS, para o grupo do TCC testar (isso fica para a etapa seguinte).

## O que foi feito
- **Código do Matheus incorporado:** pool `pg` com transações (`withTx`), `db/schema.sql` com chaves estrangeiras, `CHECK`s e índices, e services reescritos em SQL. Rotas, schemas e services seguem a mesma estrutura de antes.
- **Bugs corrigidos em relação ao código original:**
  - edição em grupo: o front envia "Celular 2/3" e o resultado era "Celular 2/3 1/3". Agora o sufixo é removido antes de ser reaplicado (`installmentDescription`);
  - `requireAuth` confere se o usuário existe. Um token antigo depois de `npm run seed` agora dá 401 (o front desloga), e não 500 por violar a chave estrangeira;
  - `upcomingTotal` inclui os avulsos, e o total do card de compromissos bate com as barras;
  - a edição de custo fixo segue a ADR 0006: um mês já passado continua marcado como gerado, mesmo que a ocorrência tenha sido excluída à mão;
  - a trava da materialização ganhou `ORDER BY id`, para evitar deadlock entre requisições simultâneas.
- **Alinhamento com o mock e com a spec:**
  - nossas 13 categorias padrão (`services/defaults.ts`);
  - limites de validação: nome com 2 ou mais caracteres, descrição até 100, categoria até 40, valor até R$ 1 bi;
  - ordenações: contas por nome (no dashboard, por saldo), custos fixos por dia do mês, categorias com entradas primeiro;
  - mensagem de rota inexistente com o caminho da rota.
- **"Hoje" no fuso `America/Sao_Paulo`** (`utils/date.ts`), para o servidor em UTC não adiantar o dia.
- **Infra:**
  - `docker-compose.yml` com Postgres 16 na porta 5433;
  - migração com advisory lock;
  - mensagem clara quando o banco está fora;
  - `process.loadEnvFile` em vez de `dotenv`.
- **Seed:** o nosso seed (3 contas, 5 custos fixos, 7 meses de gastos, cerca de 200 movimentos) convertido para async, com a nova opção `--if-empty`.
- **Testes:**
  - os 22 testes rodam contra o banco `moneyflow_test`, criado sozinho e zerado no início de cada arquivo;
  - os arquivos rodam em sequência;
  - 2 testes de regressão novos: token de usuário apagado e compromissos com avulsos.
- **`iniciar.cmd`:** verifica o Docker, sobe o banco (`--wait`) e faz o seed só na primeira vez.
- **Frontend:** os tipos de `Account` e `RecurringCost` deixaram de declarar `createdAt`, alinhados ao `api.md` (nenhuma tela usava o campo).

## Arquivos principais
| Arquivo | Papel |
|---|---|
| `backend/db/schema.sql` | esquema do banco (idempotente) |
| `backend/docker-compose.yml` | Postgres de desenvolvimento (porta 5433) |
| `backend/src/db/pool.ts` | pool, helpers de consulta e `withTx` |
| `backend/src/db/migrate.ts` | aplica o esquema com advisory lock |
| `backend/src/services/*.service.ts` | regras de negócio em SQL |
| `backend/src/middleware/auth.ts` | JWT + verificação de que o usuário existe |
| `backend/src/utils/date.ts` | "hoje" em `America/Sao_Paulo` |
| `backend/src/test/helpers.ts` | cria e zera o banco de testes |
| `iniciar.cmd` | sobe banco, backend e frontend |
| `docs/adr/0008-backend-postgresql.md` | decisão de usar PostgreSQL |

## Decisões
- PostgreSQL com `pg` e SQL à mão, sem ORM: [ADR 0008](../adr/0008-backend-postgresql.md), que substitui a 0001.
- Mantidos os nossos `utils/date.ts` e `utils/money.ts`, que espelham `frontend/src/lib/` e são cobertos por testes, em vez dos utilitários do Matheus.
- Postgres de desenvolvimento no Docker na porta 5433, para não conflitar com um Postgres instalado na máquina (5432). É o mesmo setup que vai para a VPS.
- Esquema sem ferramenta de migração versionada. Mudanças devem ser idempotentes em `schema.sql` (ver ADR 0008).

## Como testar
```bash
cd backend
cp .env.example .env
docker compose up -d --wait
npm install
npm test           # 24 testes, todos passando
npm run seed       # "Seed concluído: ~200 movimentos. Login: demo@demo.com / 123456"
npm run dev        # "API em http://localhost:3334/api"
# outro terminal
cd frontend && npm run dev
```
Ou dois cliques em `iniciar.cmd`.

Resultado esperado em http://localhost:5174 com `demo@demo.com` / `123456`:
- o dashboard mostra 3 contas com saldo, gráficos de 12 meses e compromissos;
- editar uma parcela em "todas as parcelas" mantém a descrição como "Notebook 1/12", "Notebook 2/12"...;
- rodar `npm run seed` com o app aberto e clicar em qualquer tela leva de volta ao login, sem tela de erro.

## Pendências / próximos passos
- Publicar em containers na VPS para o grupo testar: Dockerfile do backend, build estático do frontend servido por nginx com proxy `/api`, `docker-compose` de produção, HTTPS e `JWT_SECRET` forte.
- Etapa 16: casos de borda dos custos fixos (ver especificação §7). Continuam valendo nesta versão.
- A pasta `backendmatheus/` (zip original) não entra no repositório e pode ser apagada.
