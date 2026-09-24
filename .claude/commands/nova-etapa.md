---
description: Inicia uma nova etapa de trabalho (cria o doc da etapa e marca no ROADMAP)
argument-hint: <nome-da-etapa>
---

Inicie uma nova etapa chamada "$ARGUMENTS".

1. Leia `docs/ROADMAP.md` e descubra o próximo número `NN` (2 dígitos). Se a etapa já existe no ROADMAP com esse nome, use o número dela.
2. Crie `docs/etapas/NN-<nome-em-kebab-case>.md` copiando `docs/etapas/_template.md`. Preencha título, status 🔄, data de hoje e o **Objetivo** (com base no ROADMAP e no pedido do usuário).
3. No `docs/ROADMAP.md`, marque a etapa como 🔄 e coloque o link do doc na coluna "Doc" (adicione a linha se for uma etapa nova).
4. Releia `CLAUDE.md`, `docs/padroes.md` e o `CLAUDE.md` do projeto afetado antes de começar a implementar.
5. Mostre ao usuário um resumo curto do que será feito nesta etapa.
