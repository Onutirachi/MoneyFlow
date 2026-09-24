# Etapa 05 — Backend: movimentos e parcelamento

- **Status:** ✅ concluída
- **Data:** 2026-09-23

## Objetivo
Lançar entradas e saídas vinculadas a uma conta, um método e uma categoria. O método precisa ser um dos cadastrados na conta. Também gerar as parcelas automaticamente nos meses seguintes.

## O que foi feito
- `GET /api/movements?month=YYYY-MM` com filtros opcionais `accountId`, `type`, `categoryId` e `method`.
- `POST /api/movements`: valida a conta, o método permitido na conta (`METHOD_NOT_ALLOWED`) e o tipo da categoria (`CATEGORY_TYPE_MISMATCH`). Com `installments: n`, gera `n` parcelas:
  - descrição `"<descrição> i/n"`;
  - datas mês a mês, com o dia limitado ao último dia do mês (31/01 → 28/02 → 31/03);
  - `splitInstallments`: sobra de centavos na 1ª parcela, soma exata.
- `PUT /api/movements/:id?scope=one|group`. Em `group`, o sufixo `i/n` é reaplicado e o valor e a data de cada parcela são preservados.
- `DELETE /api/movements/:id?scope=one|group`.
- Testes unitários de datas e dinheiro, além de testes de integração de movimentos.

## Arquivos principais
| Arquivo | Papel |
|---|---|
| `backend/src/services/movements.service.ts` | Regras de movimentos e parcelas |
| `backend/src/schemas/movement.schema.ts` | Validação de body e query |
| `backend/src/routes/movements.routes.ts` | Rotas |
| `backend/src/test/movements.test.ts`, `utils.test.ts` | Testes |

## Decisões
- Parcelas como movimentos independentes, agrupados por `installmentGroupId` (ADR 0005).
- Em edição de grupo, se a descrição enviada já tiver o sufixo `i/n`, ele é removido antes de reaplicar. Isso evita `"X 2/3 2/3"`.
- O tipo (entrada/saída) de um movimento não pode ser editado; é preciso excluir e recriar.

## Como testar
```bash
cd backend && npm test    # 14 testes
```
Manual: `POST /api/movements` com `"installments": 10` e depois `GET /api/movements?month=` de meses seguintes.

## Pendências / próximos passos
- Etapa 06: custos fixos.
