---
description: Fecha a etapa atual (qualidade, documentação, changelog, roadmap e commit)
---

Feche a etapa que está 🔄 em `docs/ROADMAP.md`.
6. **Commit:** `git add -A` e commit em Conventional Commits pt-BR (ex.: `feat(backend): etapa 05 - movimentos e parcelamento`). O hash fica consultável com `git log --grep "etapa NN"`.
1. **Qualidade:** em cada projeto afetado (`backend/`, `frontend/`), rode `npm run typecheck`, `npm run lint`, `npm run build` e, no backend, `npm test`. Toda regra de negócio nova no backend deve ganhar teste em `src/test/`. Se algo falhar, corrija antes de continuar. Não pule esta etapa.
2. **Doc da etapa** (`docs/etapas/NN-*.md`): preencha "O que foi feito", "Arquivos principais", "Decisões", "Como testar" (comandos reais e resultado esperado) e "Pendências". Mude o status para ✅.
3. **Docs de referência:** se a API mudou, atualize `docs/api.md`; se uma regra de negócio mudou, atualize `docs/regras-de-negocio.md`; se houve decisão arquitetural, crie uma ADR em `docs/adr/`.
4. **CHANGELOG.md:** adicione uma seção `## [Etapa NN] — YYYY-MM-DD` com bullets em "Adicionado / Alterado / Corrigido".
5. **ROADMAP.md:** marque a etapa como ✅.
6. **Commit:** `git add -A` e commit em Conventional Commits pt-BR (ex.: `feat(backend): etapa 05 - movimentos e parcelamento`). Depois preencha o hash do commit no doc da etapa em um commit `docs: registra hash da etapa NN` apenas se o usuário quiser; caso contrário, deixe o hash visível via `git log`.
7. Mostre ao usuário: o que foi entregue, como testar e a próxima etapa do ROADMAP.
