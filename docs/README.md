# Documentação

| Documento | Para que serve |
|---|---|
| [especificacao.md](especificacao.md) | Requisitos funcionais e não funcionais, telas, comportamentos de borda |
| [ROADMAP.md](ROADMAP.md) | Lista de etapas e status atual |
| [padroes.md](padroes.md) | Padrões de código, estrutura de pastas, git |
| [api.md](api.md) | Contrato da API — rotas, payloads, erros |
| [regras-de-negocio.md](regras-de-negocio.md) | Como funcionam parcelamento, custos fixos, métodos, saldo |
| [etapas/](etapas/) | Diário: o que foi feito em cada etapa e como testar |
| [adr/](adr/) | Decisões de arquitetura (o *porquê*) |
| [../CHANGELOG.md](../CHANGELOG.md) | Histórico resumido de mudanças |

## Como usar
- **Quero saber o que já foi feito:** `ROADMAP.md` → abra o doc da etapa.
- **Quero entender por que algo é assim:** `adr/`.
- **Vou mexer no código:** leia `padroes.md` e o `CLAUDE.md` do projeto (`backend/` ou `frontend/`).
- **Vou integrar front e back:** `api.md`.

## Comandos do Claude Code (`.claude/commands/`)
| Comando | O que faz |
|---|---|
| `/nova-etapa <nome>` | Cria `etapas/NN-nome.md` a partir do template e marca 🔄 no ROADMAP |
| `/fechar-etapa` | Roda typecheck/lint/build, preenche o doc, atualiza CHANGELOG/ROADMAP e faz commit |
| `/nova-adr <título>` | Cria `adr/NNNN-titulo.md` |
