# Etapa 13 — Frontend: dashboard

- **Status:** ✅ concluída
- **Data:** 2026-09-23

## Objetivo
A tela inicial: resumo de gastos, entradas e saldo, gráficos unificados e separados, e a comparação com o mês anterior para saber se o usuário economizou.

## O que foi feito
- **Filtros no topo**: mês (‹ ›) e conta (todas ou uma), valendo para todo o painel.
- **KPIs** (stat tiles): saldo atual, entradas, saídas e resultado do mês. Cada um tem delta vs mês anterior (%, ou R$ para o resultado) com ícone e cor pelo significado (saída caindo = verde) e sparkline dos últimos 6 meses.
- **"Economizou?"**: frase de destaque, por exemplo "Economizou! Em setembro você gastou até agora R$ 1.870,64 a menos que em agosto. Sobraram R$ 2.840,25…". O texto se adapta a mês atual, passado ou futuro.
- **Entradas e saídas**: colunas agrupadas dos últimos 12 meses, com alternância **Gráfico/Tabela**.
- **Sobrou ou faltou?**: barras divergentes do resultado mensal, com resumo "6 de 7 meses no azul".
- **Para onde foi o dinheiro**: abas **Categoria | Conta | Método | Entradas**, com barras horizontais, valor e %, e a cauda agrupada em "Outras". A aba Conta some quando o filtro já é uma conta.
- **Saldo por conta**: lista com a participação de cada conta.
- **Compromissos**: saídas do mês por origem (parcelas, custos fixos e avulsos) e colunas empilhadas dos próximos 3 meses com o total já comprometido.
- Tooltips padronizados, com valor em destaque e chave em traço.
- Página do dashboard carregada sob demanda (lazy), para o recharts ficar fora do bundle inicial.
- Paleta validada pelo script da skill nos dois temas (ADR 0007).

## Arquivos principais
| Arquivo | Papel |
|---|---|
| `frontend/src/pages/Dashboard.tsx` | Tela e filtros |
| `frontend/src/components/dashboard/*` | StatTile, SavingsInsight, HistoryChart, ResultChart, BreakdownCard, AccountBalances, CommitmentsCard, ChartLegend, ChartTooltip |
| `frontend/src/lib/chartColors.ts`, `chartTicks.ts` | Paleta e eixos |
| `frontend/src/index.css` | Tokens de cor dos gráficos (claro/escuro) |
| `docs/adr/0007-visualizacao-de-dados.md` | Decisões |

## Decisões
- Ver ADR 0007.
- A variação do resultado aparece em R$, e não em %, porque o % explode quando o mês anterior está perto de zero (etapa 07).

## Como testar
```bash
cd backend && npm run seed && npm run dev
cd frontend && npm run dev   # http://localhost:5174 → demo@demo.com / 123456
```
1. Dashboard do mês atual: KPIs com deltas, frase "Economizou!" e gráficos preenchidos.
2. ‹ para agosto → a frase muda (agosto gastou mais que julho).
3. Filtro "Banco XPTO" → todos os números passam a ser só dessa conta e a aba "Conta" some.
4. "Tabela" no gráfico de 12 meses → tabela com os mesmos valores.
5. Alternar o tema claro/escuro → gráficos legíveis nos dois.

## Pendências / próximos passos
- O bundle principal ainda tem cerca de 800 kB. Dá para aplicar lazy loading nas outras páginas no futuro.
