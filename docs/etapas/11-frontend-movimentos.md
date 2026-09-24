# Etapa 11 — Frontend: movimentos

- **Status:** ✅ concluída
- **Data:** 2026-09-23

## Objetivo
A tela principal de uso diário: lançar entradas e saídas, parcelar compras e navegar pelos lançamentos dos meses anteriores e futuros.

## O que foi feito
- **`/movimentos?month=YYYY-MM`**: seletor de mês (‹ › e "Hoje"), resumo do mês (entradas, saídas, resultado) e lista agrupada por dia com o total de cada dia.
- Cada linha mostra a categoria (cor e inicial), a descrição, as badges **`3/10`** (parcela) e **Fixo** (custo fixo), a conta, o método e o valor (entrada em verde, com +). Dias futuros aparecem com a badge **previsto** e mais apagados.
- **Filtros**: tipo, conta, método (limitado aos métodos da conta filtrada) e categoria (limitada ao tipo).
- **Formulário de movimento**: tipo, conta, **método (só os cadastrados na conta escolhida)**, valor, data, descrição, categoria (do mesmo tipo) e **Parcelado**:
  - ao trocar de conta, o método é zerado se não valer para a conta nova; se a conta tiver um único método, ele é selecionado automaticamente;
  - parcelado: "Valor total", "Data da 1ª parcela" e número de parcelas, com **prévia** das parcelas geradas (`Notebook 1/10 … 10/10`, datas e valores, usando a mesma divisão do backend).
- **Editar parcela**: escolha entre "Só esta parcela" e "Todas as parcelas". Em grupo, valor e data ficam bloqueados, como na regra de negócio.
- **Excluir**: confirmação. Para parcelas, dá para escolher entre esta ou todas; para custo fixo, avisa que a ocorrência não volta.
- Estado vazio orienta a cadastrar uma conta primeiro.
- **Correção no `MoneyInput`**: dígitos e Backspace agora sempre agem no final do número. Antes, clicar no meio do campo inseria os dígitos na posição do cursor (3.599,90 virava 3.590.009,90). O bug foi encontrado no teste E2E.

## Arquivos principais
| Arquivo | Papel |
|---|---|
| `frontend/src/pages/Movements.tsx` | Tela |
| `frontend/src/components/movements/MovementFormDialog.tsx` | Formulário (métodos por conta, parcelado, escopo) |
| `frontend/src/components/movements/MovementList.tsx` | Lista por dia |
| `frontend/src/components/movements/MovementFilters.tsx` | Filtros |
| `frontend/src/components/movements/InstallmentPreview.tsx` | Prévia das parcelas |
| `frontend/src/components/movements/DeleteMovementDialog.tsx` | Exclusão com escopo |
| `frontend/src/lib/money.ts` | `splitInstallments` (espelho do backend) |

## Decisões
- A data padrão de um novo lançamento é hoje, se o mês visualizado for o atual; senão, o dia 1 daquele mês.
- O resumo do topo respeita os filtros (ex.: filtrando por conta, mostra só aquela conta).

## Como testar
Fluxo verificado com Playwright:
1. **Saída** → Conta "Carteira Física" → o Método só oferece **Dinheiro**.
2. Trocar para "Banco XPTO" → **PIX, Crédito, Débito** → Crédito, R$ 3.599,90, "Notebook", Compras, Parcelado 10 → a prévia mostra 10x de R$ 359,99 → **Lançar** → toast "10 parcelas lançadas até 06/2027".
3. Avançar os meses → "Notebook 6/10" em fev/2027.
4. Editar → "Todas as parcelas" → renomear → todas as parcelas mudam.
5. Excluir → "Todas as 10 parcelas" → somem de todos os meses.

## Pendências / próximos passos
- Etapa 12: custos fixos.
