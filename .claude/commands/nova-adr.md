---
description: Registra uma decisão de arquitetura (ADR)
argument-hint: <título da decisão>
---

Crie uma ADR para a decisão "$ARGUMENTS".

1. Descubra o próximo número em `docs/adr/` (4 dígitos, ex.: `0006`).
2. Crie `docs/adr/NNNN-<titulo-em-kebab-case>.md` com este formato:

```markdown
# NNNN — Título

- **Status:** Aceita | Substituída por NNNN | Obsoleta
- **Data:** YYYY-MM-DD

## Contexto
Qual problema ou força motivou a decisão.

## Decisão
O que foi decidido, de forma direta.

## Alternativas consideradas
- Alternativa A — por que não.

## Consequências
Positivas e negativas; o que passa a ser obrigatório.
```

3. Adicione a ADR na tabela de `docs/adr/README.md`.
4. Se a decisão substitui outra, atualize o status da antiga.
