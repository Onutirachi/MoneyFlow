# 0005 — Parcelas geradas como movimentos independentes agrupados

- **Status:** Aceita
- **Data:** 2026-09-23

## Contexto
O usuário informa o valor total e o número de parcelas; cada parcela precisa aparecer no mês correspondente, com o nome "Descrição i/n".

## Decisão
No momento da criação, o backend gera `n` movimentos independentes que compartilham `installmentGroupId` e têm `installmentNumber`/`installmentTotal`. Valor = `floor(total/n)`; a sobra de centavos vai para a 1ª parcela. Datas avançam mês a mês com clamp do dia (31 → último dia do mês). Edição e exclusão aceitam `scope=one|group`.

## Alternativas consideradas
- **Um único registro "parcelado" expandido na leitura:** complica filtros, somas mensais e edição de uma parcela específica.

## Consequências
- Consultas por mês continuam simples (filtro por data).
- Operações em grupo exigem buscar por `installmentGroupId`.
