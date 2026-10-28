# Architecture Decision Records (ADRs)

Cada ADR registra **uma** decisão importante, o contexto e as alternativas. ADRs não são editadas depois de aceitas; se a decisão mudar, cria-se uma nova que substitui a anterior.

| # | Decisão | Status |
|---|---|---|
| [0001](0001-backend-mock-com-json.md) | Backend mock em Express com persistência em arquivo JSON | Substituída por 0008 |
| [0002](0002-valores-em-centavos.md) | Valores monetários em centavos (inteiro) | Aceita |
| [0003](0003-ui-tailwind-shadcn-recharts.md) | UI com Tailwind + shadcn/ui e gráficos com Recharts | Aceita |
| [0004](0004-custos-fixos-materializacao-lazy.md) | Custos fixos com materialização lazy e idempotente | Aceita (edição → 0006) |
| [0005](0005-parcelamento-como-movimentos.md) | Parcelas geradas como movimentos independentes agrupados | Aceita |
| [0006](0006-custos-fixos-edicao-regenera-futuro.md) | Editar/pausar/excluir custo fixo regenera as ocorrências futuras | Aceita |
| [0007](0007-visualizacao-de-dados.md) | Padrões de visualização do dashboard (skill dataviz, paleta validada) | Aceita |
| [0008](0008-backend-postgresql.md) | Backend real com PostgreSQL (`pg` + SQL, Docker em dev) | Aceita |
| [0009](0009-containers-web-api-db.md) | Três containers (web, api, db) num único compose `moneyflow` | Aceita |
