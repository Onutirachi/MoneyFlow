# 0006 — Editar, pausar ou excluir um custo fixo regenera as ocorrências futuras

- **Status:** Aceita (substitui a regra de edição da ADR 0004)
- **Data:** 2026-09-23

## Contexto
Pela ADR 0004, editar um custo fixo só valia para meses ainda não materializados. Como o dashboard materializa até 3 meses à frente, editar o valor do aluguel deixava os próximos 3 meses com o valor antigo. Da mesma forma, pausar ou excluir o custo fixo não tirava essas ocorrências futuras. O usuário esperaria que a mudança valesse "daqui pra frente".

## Decisão
Ao **editar**, **pausar** (`active: false`) ou **excluir** um custo fixo, o backend descarta as ocorrências já geradas com **data posterior a hoje** e remove esses meses de `materializedMonths`. Se o custo continuar ativo, esses meses são gerados de novo com os dados atuais na próxima consulta. Ocorrências de hoje ou do passado nunca são alteradas.

## Alternativas consideradas
- **Atualizar as ocorrências futuras em vez de recriá-las:** preservaria exclusões manuais, mas complica o caso de mudança de dia do mês ou de conta.
- **Não materializar o futuro:** o dashboard perderia a projeção de compromissos.

## Consequências
- Mudanças em custos fixos valem a partir de amanhã, como esperado.
- Uma ocorrência futura editada ou excluída manualmente é recriada se o custo fixo for editado depois. Esse trade-off está documentado em `regras-de-negocio.md`.
