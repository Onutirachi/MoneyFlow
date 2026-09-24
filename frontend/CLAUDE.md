# Frontend — padrões

Vite + React + TypeScript, Tailwind + shadcn/ui, Recharts, TanStack Query, react-hook-form + zod, react-router. Consome a API de [../docs/api.md](../docs/api.md).

## Comandos
```bash
npm run dev        # porta 5173 (API em VITE_API_URL, padrão http://localhost:3333/api)
npm run typecheck && npm run lint && npm run build
```

## Estrutura
```
src/
  main.tsx, App.tsx, routes.tsx
  types/index.ts         tipos espelhados do backend
  lib/
    api.ts               axios + token + 401 → logout
    queryKeys.ts         chaves do TanStack Query
    format.ts            formatBRL, formatDate, formatMonth, methodLabel
    date.ts              currentMonth, addMonths, ...
    chartColors.ts       paleta única dos gráficos
    utils.ts             cn() do shadcn
  contexts/AuthContext.tsx
  hooks/                 useAccounts, useCategories, useMovements, useRecurring, useDashboard, useMonthParam
  components/
    ui/                  shadcn (não alterar lógica)
    layout/              AppLayout, Sidebar, MonthSelector
    common/              MoneyInput, ConfirmDialog, EmptyState, ...
    accounts/ movements/ recurring/ categories/ dashboard/
  pages/                 Login, Register, Dashboard, Movements, Accounts, Categories, Recurring
```

## Como adicionar uma tela
1. Tipos em `types/index.ts` (espelhando o backend).
2. Hook em `hooks/useX.ts` com `useQuery`/`useMutation`; keys em `lib/queryKeys.ts`; invalidar keys afetadas no `onSuccess`.
3. Página em `pages/X.tsx` usando só hooks + componentes.
4. Rota em `routes.tsx` e item no `Sidebar`.

## Regras
- **Nada de axios fora de `hooks/`** (e do `AuthContext`).
- Mutations de movimentos/custos fixos invalidam `movements`, `dashboard` e `accounts`.
- Dinheiro: estado em centavos; exibir com `formatBRL`; digitar com `MoneyInput`.
- Mês selecionado: `useMonthParam()` (lê/escreve `?month=`).
- Textos da UI em pt-BR. Feedback de ações via toast (sonner).
- Cores de gráficos só de `lib/chartColors.ts`.
