# 0004 — Custos fixos com materialização lazy e idempotente

- **Status:** Aceita
- **Data:** 2026-09-23

## Contexto
Custos fixos (aluguel, internet, salário) devem aparecer automaticamente todo mês. Não há job agendado (cron) no mock, e o usuário navega livremente para meses futuros e passados.

## Decisão
Cada `RecurringCost` guarda `materializedMonths: string[]`. Ao consultar um mês (`/movements`, `/dashboard`), o service `ensureMaterialized(userId, untilMonth)` gera os movimentos reais faltantes de cada custo fixo ativo, do `startMonth` até `untilMonth` (limitado por `endMonth`), e registra os meses gerados.

## Alternativas consideradas
- **Movimentos virtuais calculados na leitura:** não permite editar/excluir uma ocorrência específica sem uma tabela de exceções.
- **Gerar tudo na criação (ex.: 5 anos):** polui o banco e não reflete edições posteriores.
- **Cron job:** não existe no mock e não cobre meses futuros navegados.

## Consequências
- Ocorrências são movimentos normais: editáveis e excluíveis individualmente.
- Excluir uma ocorrência não a recria (o mês já consta em `materializedMonths`).
- Editar o custo fixo só vale para meses ainda não gerados.
