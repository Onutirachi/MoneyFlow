# 0002 — Valores monetários em centavos (inteiro)

- **Status:** Aceita
- **Data:** 2026-09-23

## Contexto
Números de ponto flutuante geram erros de arredondamento (`0.1 + 0.2 !== 0.3`), o que é inaceitável em somas financeiras e na divisão de parcelas.

## Decisão
Todo valor monetário é um **inteiro em centavos** na API, no banco mock e no estado do frontend. A conversão para reais acontece somente em `formatBRL` (exibição) e no componente `MoneyInput` (entrada).

## Alternativas consideradas
- **Float em reais:** simples, mas com erros de arredondamento.
- **Decimal como string / lib decimal.js:** correto, porém mais verboso para um app deste porte.

## Consequências
- Somas e divisões de parcelas são exatas (a sobra vai para a 1ª parcela).
- Todo campo de dinheiro na UI precisa usar `MoneyInput`.
