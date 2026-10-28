# 0001 — Backend mock em Express com persistência em arquivo JSON

- **Status:** Substituída por [0008](0008-backend-postgresql.md) em 2026-10-28
- **Data:** 2026-09-23

## Contexto
O backend definitivo ainda não existe, mas o frontend precisa de uma API realista (autenticação, validação, regras de parcelamento e recorrência) para ser desenvolvido e demonstrado.

## Decisão
Criar um projeto separado `backend/` em Node + Express + TypeScript que implementa o contrato de `docs/api.md`, persistindo os dados em `backend/data/db.json` (leitura em memória, escrita atômica via arquivo temporário + rename). Um script `seed` popula dados de demonstração.

## Alternativas consideradas
- **json-server / MSW:** rápidos, mas não permitem regras de negócio (métodos por conta, parcelamento, materialização de recorrentes) sem gambiarras.
- **Somente em memória:** perde dados a cada reinício, atrapalha testes manuais.
- **SQLite/Prisma:** mais próximo do real, mas é trabalho de backend definitivo, fora do escopo agora.

## Consequências
- O front depende apenas do contrato HTTP; trocar o backend não exige mudanças no front.
- Não há concorrência real nem transações — aceitável para mock com um usuário por vez.
- O cache em memória é recarregado quando o `mtime` do arquivo muda (ex.: `npm run seed` com o servidor rodando).
- `docs/api.md` é a fonte da verdade e precisa ser mantido.
