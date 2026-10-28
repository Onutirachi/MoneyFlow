# 0008 — Backend real com PostgreSQL (substitui a 0001)

- **Status:** Aceita
- **Data:** 2026-10-28

## Contexto
O sistema vai ser publicado numa VPS para o grupo do TCC usar ao mesmo tempo. O mock da ADR 0001 guarda tudo num único arquivo JSON, sem transações e sem concorrência real. Um integrante do grupo (Matheus) escreveu uma versão do backend em PostgreSQL com a mesma estrutura de pastas e o mesmo contrato de `docs/api.md`.

## Decisão
Usar **PostgreSQL** como banco e o driver **`pg`** com SQL escrito à mão, partindo do código do Matheus:
- o esquema fica em `backend/db/schema.sql`, idempotente (`CREATE ... IF NOT EXISTS`), e é aplicado na subida do servidor, protegido por advisory lock;
- operações compostas (cadastro com categorias, parcelamento, edição de custo fixo) rodam em transação (`withTx`);
- a materialização de custos fixos trava as linhas com `SELECT ... FOR UPDATE ORDER BY id`. Requisições simultâneas, como as que o front dispara ao abrir o dashboard, não duplicam ocorrências;
- dinheiro em `BIGINT` (centavos, ADR 0002), datas em `DATE`, devolvidas como `'YYYY-MM-DD'` sem fuso;
- "hoje" é calculado no fuso `America/Sao_Paulo`, porque servidores costumam rodar em UTC;
- em desenvolvimento, o Postgres roda via `backend/docker-compose.yml` na porta 5433. Os testes usam um banco separado, `moneyflow_test`.

## Alternativas consideradas
- **ORM (Prisma/Drizzle):** tipagem automática e migrações versionadas, mas mais uma camada para o grupo aprender. As consultas do dashboard ficam mais claras em SQL.
- **SQLite:** zero infraestrutura, mas escrita concorrente limitada e diferente do que roda em produção.
- **Continuar com o mock:** não aguenta vários usuários simultâneos e perde a integridade referencial.

## Consequências
- O frontend não muda: o contrato de `docs/api.md` foi mantido e é verificado pelos testes de integração.
- Desenvolver o backend passa a exigir Docker (ou um PostgreSQL acessível via `DATABASE_URL`).
- Integridade garantida pelo banco: chaves estrangeiras (conta e categoria em uso não podem ser excluídas; ocorrências passadas de custo fixo ficam com `recurring_id = NULL`) e `CHECK`s de método, tipo, parcela e meses.
- Não há ferramenta de migração versionada. Mudanças de esquema precisam ser escritas de forma idempotente em `schema.sql` (ex.: `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`). Se o esquema começar a mudar com frequência, vale adotar uma ferramenta de migrações.
- Os arquivos de teste rodam em sequência (`--test-concurrency=1`), e cada um começa com o banco de teste zerado.
