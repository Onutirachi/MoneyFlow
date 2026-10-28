# Frontend — padrões

Vite 8 + React 19 + TypeScript 6, Tailwind v4 + shadcn/ui (base Radix, preset nova), Recharts 3, TanStack Query 5, react-hook-form + zod 4, React Router 8 (pacote `react-router`, API igual à v7), tema claro/escuro próprio (`contexts/ThemeContext.tsx`), sonner (toasts). Consome a API de [../docs/api.md](../docs/api.md).

## Comandos
```bash
npm run dev        # porta 5174 (API em VITE_API_URL, padrão http://localhost:3334/api)
npm run typecheck && npm run lint && npm run build
```

## Estrutura
```
src/
  main.tsx, App.tsx, routes.tsx
  types/index.ts         tipos espelhados do backend
  lib/
    api.ts               axios (baseURL /api → proxy do Vite para o backend) + token + 401 → logout
    queryKeys.ts         chaves do TanStack Query
    format.ts            formatBRL, formatDate, formatMonth, methodLabel
    date.ts              currentMonth, addMonths, ...
    chartColors.ts       paleta única dos gráficos (CSS vars validadas em index.css)
    chartTicks.ts        niceTicks(): ticks redondos para eixos
    money.ts             splitInstallments (prévia das parcelas)
    methods.ts           ícones por método de pagamento
    utils.ts             cn() (reexporta o pacote `cn`, substituto do clsx + tailwind-merge)
    colors.ts            cores disponíveis para contas/categorias
    queryClient.ts       QueryClient + invalidateFinancialData()
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
- A API é acessada por `/api` no mesmo endereço do front (proxy em `vite.config.ts`, alvo `API_TARGET`, padrão 127.0.0.1:3334). Em produção, quem faz esse proxy é o nginx (`nginx.conf`, container moneyflow-web). Não coloque URL absoluta da API no código.
- Depois de login ou cadastro, **só o `PublicOnlyRoute` redireciona** (para `location.state.from` ou `/`). As páginas não chamam `navigate()` depois de autenticar, porque isso cria uma corrida entre redirecionamentos (etapa 14).
- Mutations de movimentos/custos fixos invalidam `movements`, `dashboard` e `accounts`.
- Dinheiro: estado em centavos; exibir com `formatBRL`; digitar com `MoneyInput`.
- Mês selecionado: `useMonthParam()` (lê/escreve `?month=`).
- Textos da UI em pt-BR. Feedback de ações via toast (sonner).
- Cores de gráficos só de `lib/chartColors.ts`. **Antes de criar ou alterar um gráfico, carregue a skill `dataviz`** e siga a ADR 0007: forma pelo trabalho do dado, eixo único, legenda em 2+ séries e visão em tabela. Paleta nova tem que passar no `validate_palette.js`.
- Componentes shadcn: adicionar com `npx shadcn@latest add <nome>`. Não editar a lógica deles.
- Prettier ordena as classes Tailwind (`prettier-plugin-tailwindcss`). Rode `npm run format` antes de fechar a etapa.
- Arquivos `.tsx` exportam só componentes (fast refresh); constantes e helpers vão para `lib/`.
