# 0003 — UI com Tailwind + shadcn/ui e gráficos com Recharts

- **Status:** Aceita
- **Data:** 2026-09-23

## Contexto
O app precisa de formulários, diálogos, tabelas e um dashboard com vários gráficos, com visual moderno e consistente, sem prender o projeto a um design system pesado.

## Decisão
- **Tailwind CSS** para estilo.
- **shadcn/ui** (componentes Radix copiados para `src/components/ui/`, código nosso).
- **Recharts** para gráficos (declarativo, componentes React, bom suporte a tooltip/legendas).
- **lucide-react** para ícones.
- Dados remotos com **TanStack Query**; formulários com **react-hook-form + zod**.

## Alternativas consideradas
- **MUI / Chakra:** mais prontos, porém mais pesados e com visual mais "genérico".
- **Chart.js / ECharts:** poderosos, mas imperativos; Recharts se integra melhor ao React.

## Consequências
- Componentes UI ficam no repositório e podem ser ajustados.
- Uma única paleta de cores para gráficos em `lib/chartColors.ts`.
