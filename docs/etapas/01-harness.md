# Etapa 01 — Harness: padrões, documentação e comandos

- **Status:** ✅ concluída
- **Data:** 2026-09-23

## Objetivo
Antes de escrever código, definir os padrões do projeto e uma forma consistente de documentar cada etapa. Assim qualquer pessoa, ou o Claude Code em uma nova sessão, consegue consultar o que foi feito e seguir o mesmo padrão.

## O que foi feito
- `CLAUDE.md` na raiz com visão geral, comandos, regras e o fluxo obrigatório por etapa. O Claude Code carrega esse arquivo automaticamente.
- `backend/CLAUDE.md` e `frontend/CLAUDE.md` com a estrutura de pastas e o passo a passo para adicionar endpoints e telas.
- `docs/` com padrões, regras de negócio, contrato da API, roadmap, template de etapa e ADRs.
- Comandos `/nova-etapa`, `/fechar-etapa` e `/nova-adr` em `.claude/commands/`.
- `.claude/settings.json` com permissões para comandos de qualidade e git de leitura.
- `.editorconfig`, `.gitignore`, `README.md`, `CHANGELOG.md` e repositório git.

## Arquivos principais
| Arquivo | Papel |
|---|---|
| `CLAUDE.md` | Harness principal (lido pelo Claude Code) |
| `docs/padroes.md` | Padrões de código |
| `docs/api.md` | Contrato da API |
| `docs/regras-de-negocio.md` | Parcelamento, custos fixos, métodos, saldo |
| `docs/ROADMAP.md` | Etapas e status |
| `docs/adr/*` | Decisões de arquitetura |
| `.claude/commands/*` | Comandos do fluxo de etapas |

## Decisões
- ADRs 0001–0005 registradas.
- Conventional Commits em pt-BR, com um commit por etapa.

## Como testar
- Abrir uma nova sessão do Claude Code na pasta do projeto e perguntar "quais são os padrões do projeto?". A resposta deve refletir o `CLAUDE.md`.
- Digitar `/` e verificar se `nova-etapa`, `fechar-etapa` e `nova-adr` aparecem.
- `git log --oneline` deve mostrar o commit desta etapa.

## Pendências / próximos passos
- Etapa 02: setup do backend.
