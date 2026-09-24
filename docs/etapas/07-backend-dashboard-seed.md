# Etapa 07 — Backend: dashboard e seed

- **Status:** ✅ concluída
- **Data:** 2026-09-23

## Objetivo
Entregar ao front os agregados prontos para os gráficos e um conjunto de dados de demonstração realista.

## O que foi feito
- `GET /api/dashboard?month=YYYY-MM&accountId=` retorna (contrato em `docs/api.md`):
  - `summary`: entradas, saídas e resultado do mês, o mês anterior e a variação em %;
  - `totalBalance` e `accounts` (saldo por conta);
  - `expenseByCategory`, `incomeByCategory`, `expenseByAccount`, `expenseByMethod`;
  - `history`: 12 meses terminando no mês selecionado;
  - `upcoming`: saídas dos próximos 3 meses por origem (parcelas, fixos e outros), e `upcomingTotal`;
  - `composition`: saídas do mês por origem.
- O filtro `accountId` restringe todos os agregados a uma conta.
- Materializa os custos fixos até o mês + 3 antes de agregar.
- `npm run seed`: usuário `demo@demo.com` / `123456`, 3 contas (Carteira Física, Banco XPTO, Banco Digital), 5 custos fixos, 2 compras parceladas e cerca de 7 meses de gastos variáveis pseudoaleatórios (determinísticos) com meses mais e menos econômicos. `npm run reset` deixa o banco vazio.
- Testes do dashboard: totais, variação, composição e projeção futura.

## Arquivos principais
| Arquivo | Papel |
|---|---|
| `backend/src/services/dashboard.service.ts` | Agregações |
| `backend/src/seed.ts` | Dados de demonstração |
| `backend/src/test/dashboard.test.ts` | Testes |

## Decisões
- As agregações são feitas no backend, e o front só desenha. Isso mantém o contrato estável quando o backend real substituir o mock.
- A variação % é `null` quando o mês anterior é 0. O % do resultado pode explodir quando a base está perto de zero, por isso a UI mostra a diferença do resultado em R$.
- O seed usa os próprios services, então os dados passam pelas mesmas validações da API.

## Como testar
```bash
cd backend && npm test          # 20 testes
npm run seed && npm run dev
# login com demo@demo.com / 123456 e GET /api/dashboard?month=<mês atual>
```

## Pendências / próximos passos
- Etapa 08: setup do frontend.
