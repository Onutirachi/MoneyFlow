# Etapa 08 — Frontend: setup

- **Status:** ✅ concluída
- **Data:** 2026-09-23

## Objetivo
Criar a base do frontend: projeto Vite, design system, camada de dados, layout com navegação e seletor de mês.

## O que foi feito
- Projeto `frontend/` criado com o template `react-ts` do Vite 8 (React 19, TS 6). O oxlint do template foi trocado por **ESLint + Prettier**, para seguir o mesmo padrão do backend.
- Tailwind v4 (`@tailwindcss/vite`) e **shadcn/ui** (base Radix, preset nova, fonte Geist), com os componentes button, card, input, label, select, dialog, alert-dialog, dropdown-menu, table, badge, tabs, checkbox, switch, separator, skeleton, sonner, tooltip, popover, avatar, sheet e toggle-group.
- Alias `@/` → `src/`.
- `types/index.ts` espelhando a API.
- `lib/`: `api.ts` (axios com token e handler de 401), `format.ts` (BRL, datas, meses, rótulos), `date.ts`, `queryKeys.ts`, `queryClient.ts` (`invalidateFinancialData`), `colors.ts`.
- Hooks de dados para todos os recursos: `useAccounts`, `useCategories`, `useMovements`, `useRecurring`, `useDashboard`, e `useMonthParam` (mês na URL).
- `AuthContext`: login, cadastro, logout e restauração da sessão via `/auth/me`.
- Layout: sidebar no desktop, menu lateral (Sheet) no mobile, tema claro/escuro e menu do usuário.
- Componentes comuns: `MonthSelector`, `PageHeader`, `EmptyState`, `MoneyInput` (digitação estilo caixa registradora, em centavos), `ConfirmDialog` e `ColorPicker`.
- Rotas com páginas provisórias.

## Arquivos principais
| Arquivo | Papel |
|---|---|
| `frontend/src/lib/api.ts` | Cliente HTTP |
| `frontend/src/hooks/*` | Única camada que faz HTTP |
| `frontend/src/contexts/AuthContext.tsx` | Sessão |
| `frontend/src/components/layout/*` | Layout, navegação, seletor de mês |
| `frontend/src/components/common/MoneyInput.tsx` | Entrada de valores em centavos |

## Decisões
- Mutations chamam `invalidateFinancialData()`, porque um movimento altera saldo, dashboard e listas.
- Os links da sidebar preservam `?month=` nas telas que usam mês, então o mês escolhido acompanha a navegação.
- `useMovements` e `useDashboard` usam `keepPreviousData`, para não piscar ao trocar de mês.

## Como testar
```bash
cd frontend && npm install
npm run typecheck && npm run lint && npm run build
npm run dev   # http://localhost:5173: layout, navegação, seletor de mês e tema
```

## Pendências / próximos passos
- Etapa 09: telas de login e cadastro e rotas protegidas.
- Code splitting (lazy) das páginas quando entrarem os gráficos.
