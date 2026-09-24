# Etapa 10 — Frontend: contas e categorias

- **Status:** ✅ concluída
- **Data:** 2026-09-23

## Objetivo
Telas para cadastrar onde o dinheiro fica (contas e seus métodos de pagamento) e como ele é classificado (categorias).

## O que foi feito
- **Contas** (`/contas`): cards com cor, saldo atual (vermelho se negativo), saldo inicial e badges dos métodos. O saldo total aparece no cabeçalho, e há um estado vazio que orienta o primeiro cadastro.
- **Formulário de conta**: nome, saldo inicial (`MoneyInput`, aceita negativo), métodos como checkboxes com ícone (Dinheiro, PIX, Crédito, Débito; pelo menos um) e cor.
- **Categorias** (`/categorias`): duas colunas (Saídas / Entradas), com criação, edição e exclusão. O tipo não pode ser alterado depois de criada.
- A exclusão pede confirmação. Se o registro estiver em uso, a API responde 409 e a mensagem aparece em toast.
- Componentes reutilizáveis: `RowActions` (menu ⋯), `MethodBadge` e `lib/methods.ts` (ícones por método).
- Backend: seed com saldos iniciais realistas, e o `jsonDb` recarrega o arquivo quando ele muda por fora, então `npm run seed` funciona com o servidor rodando.

## Arquivos principais
| Arquivo | Papel |
|---|---|
| `frontend/src/pages/Accounts.tsx` | Tela de contas |
| `frontend/src/components/accounts/AccountFormDialog.tsx` | Formulário de conta |
| `frontend/src/pages/Categories.tsx` | Tela de categorias |
| `frontend/src/components/categories/CategoryFormDialog.tsx` | Formulário de categoria |
| `backend/src/db/jsonDb.ts` | Recarga por mtime |

## Decisões
- Os métodos são salvos sempre na ordem canônica (Dinheiro, PIX, Crédito, Débito), independentemente da ordem em que foram clicados.

## Como testar
1. `/contas` → **Nova conta** "Banco XPTO" com PIX, Crédito e Débito → aparece o card com as badges.
2. Tentar salvar sem nenhum método → mensagem "Selecione ao menos um método".
3. Excluir uma conta do seed → toast "Conta possui movimentos ou custos fixos vinculados".
4. `/categorias` → criar "Pets" em Saídas.

## Pendências / próximos passos
- Etapa 11: movimentos.
