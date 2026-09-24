# Changelog

Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/). Cada etapa do [ROADMAP](docs/ROADMAP.md) gera uma entrada.

## [Etapa 01] — 2026-09-23
### Adicionado
- Harness do projeto: `CLAUDE.md` (raiz, backend, frontend), padrões de código, regras de negócio e contrato da API.
- Comandos do Claude Code: `/nova-etapa`, `/fechar-etapa`, `/nova-adr`.
- ADRs 0001–0005 (mock em JSON, centavos, UI, custos fixos, parcelamento).
- ROADMAP com as 14 etapas, template de etapa, `.editorconfig`, `.gitignore`.

## [Etapa 02] — 2026-09-23
### Adicionado
- Backend: Express 5 + TypeScript + Zod 4, ESLint e Prettier.
- Persistência mock em `data/db.json` com escrita atômica.
- Tratamento padronizado de erros (`AppError`, validação, JSON inválido, 404).
- Utilitários de data, dinheiro e validação; rota `GET /api/health`.
- `.gitattributes` com LF.

## [Etapa 03] — 2026-09-23
### Adicionado
- Backend: cadastro, login e `/auth/me` com JWT e bcrypt; categorias padrão criadas no cadastro.
- Testes de integração com `node:test` (`npm test`) e banco temporário.
### Alterado
- Harness: `npm test` passa a fazer parte do checklist de qualidade.
