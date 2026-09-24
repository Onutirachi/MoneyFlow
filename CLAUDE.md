# Finanças Pessoais — Guia do Projeto (harness)

Este arquivo é lido automaticamente pelo Claude Code em toda sessão. Ele define **o que é o projeto, como rodar, os padrões obrigatórios e o fluxo de trabalho por etapas**. Siga-o sempre.

## Visão geral
Sistema de gerenciamento financeiro pessoal (TCC). Dois projetos independentes:

| Pasta | Stack | Papel |
|---|---|---|
| `backend/` | Node + Express + TypeScript | API **mock** (persistência em `backend/data/db.json`). Será substituída por um backend real mantendo o contrato de `docs/api.md`. |
| `frontend/` | Vite + React + TypeScript, Tailwind, shadcn/ui, Recharts, TanStack Query | Aplicação web |

Padrões específicos: [backend/CLAUDE.md](backend/CLAUDE.md) e [frontend/CLAUDE.md](frontend/CLAUDE.md).

## Comandos
Atalho: `iniciar.cmd` na raiz (Windows) sobe tudo em duas janelas e abre o navegador.
```bash
# backend (porta 3334)
cd backend && npm install && npm run seed && npm run dev
# frontend (porta 5174)
cd frontend && npm install && npm run dev
# qualidade (rodar nos dois projetos)
npm run typecheck && npm run lint && npm run build   # backend também: npm test
```
Usuário do seed: `demo@demo.com` / `123456`.

## Documentação (consultar antes de mudar algo)
- [docs/README.md](docs/README.md) — índice
- [docs/ROADMAP.md](docs/ROADMAP.md) — etapas e status
- [docs/padroes.md](docs/padroes.md) — padrões de código detalhados
- [docs/api.md](docs/api.md) — contrato da API (fonte da verdade front ↔ back)
- [docs/regras-de-negocio.md](docs/regras-de-negocio.md) — parcelamento, custos fixos, métodos, saldo
- [docs/etapas/](docs/etapas/) — diário: o que foi feito em cada etapa
- [docs/adr/](docs/adr/) — decisões de arquitetura e seus porquês
- [CHANGELOG.md](CHANGELOG.md)

## Regras gerais
- TypeScript `strict` em tudo. Sem `any` sem justificativa em comentário.
- Código (identificadores) em **inglês**; textos de UI, docs e mensagens de commit em **pt-BR**.
- Dinheiro sempre em **centavos (inteiro)**. Só converte para reais na formatação/entrada da UI.
- Datas: `YYYY-MM-DD`; mês: `YYYY-MM`.
- Mudou a API? Atualize `docs/api.md` **e** os tipos espelhados (`backend/src/types.ts` ↔ `frontend/src/types/index.ts`).
- Mudou uma regra de negócio? Atualize `docs/regras-de-negocio.md`.
- Decisão arquitetural nova (lib, padrão, trade-off)? Crie uma ADR (`/nova-adr`).
- Commits: Conventional Commits em pt-BR — `feat(backend): ...`, `fix(frontend): ...`, `docs: ...`, `chore: ...`.

## Fluxo obrigatório por etapa
1. `/nova-etapa <nome>` → cria `docs/etapas/NN-nome.md` a partir do template e marca 🔄 no ROADMAP.
2. Implementar seguindo os padrões.
3. `/fechar-etapa` → roda typecheck + lint + build nos projetos afetados; preenche o doc da etapa; atualiza CHANGELOG e ROADMAP (✅); faz o commit.

**Uma etapa só está concluída quando:** qualidade passa, doc da etapa está preenchido (incluindo "Como testar"), CHANGELOG/ROADMAP atualizados, `api.md`/ADR atualizados quando aplicável.
