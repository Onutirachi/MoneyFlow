# Regras de negócio

## Contas e métodos de pagamento
- Uma **conta** (ex.: "Banco XPTO", "Carteira Física") tem saldo inicial e uma lista de **métodos** aceitos: `DINHEIRO`, `PIX`, `CREDITO`, `DEBITO` (pelo menos um).
- Ao criar/editar um **movimento** ou **custo fixo**, o `method` informado **deve** estar em `account.methods`. Caso contrário → `400 METHOD_NOT_ALLOWED`.
- Remover um método de uma conta é permitido; movimentos antigos com esse método são mantidos.
- Excluir uma conta com movimentos ou custos fixos vinculados → `409 ACCOUNT_IN_USE`.

## Movimentos
- Tipo `ENTRADA` ou `SAIDA`, valor em centavos (> 0), data `YYYY-MM-DD`, conta, método e categoria.
- A categoria deve ser do mesmo tipo do movimento (`CATEGORY_TYPE_MISMATCH`).
- Movimento com data futura é **previsto**: aparece na lista do mês, mas não afeta o saldo atual.

## Parcelamento
- Entrada: descrição, **valor total**, **número de parcelas** `n` (2–72), data da 1ª parcela.
- Gera `n` movimentos com o mesmo `installmentGroupId`:
  - data da parcela `i` = data inicial + `(i-1)` meses; se o dia não existe no mês (ex.: 31 em fevereiro), usa o último dia do mês;
  - descrição: `"<descrição> i/n"` (ex.: `"Notebook 3/10"`);
  - valor: `floor(total / n)`; a sobra de centavos vai para a **1ª parcela** (soma sempre exata).
- Editar/excluir parcela: `scope=one` (só essa) ou `scope=group` (todas do grupo). Em `group`, edições de valor não são permitidas (só descrição base, conta, método e categoria).

## Custos fixos (recorrentes)
- Definidos por: descrição, valor, tipo (normalmente `SAIDA`, mas pode ser `ENTRADA`, ex.: salário), conta, método, categoria, dia do mês (1–31), mês inicial e mês final opcional.
- **Materialização lazy e idempotente:** quando um mês é consultado (`/movements?month=` ou `/dashboard?month=`), o backend gera os movimentos reais de todos os custos fixos ativos, desde o `startMonth` até o mês consultado (o dashboard vai até mês + 3, por causa dos compromissos futuros). Cada custo fixo guarda `materializedMonths`; um mês já materializado nunca é gerado de novo, então consultar outra vez não duplica.
- Dia inexistente no mês → último dia do mês.
- Editar o custo fixo altera apenas os meses **ainda não materializados**. Desativar para de gerar. Excluir o custo fixo mantém os movimentos já gerados (desvinculados).
- Movimento gerado por custo fixo pode ser editado/excluído individualmente; se excluído, não é recriado (o mês continua em `materializedMonths`).

## Saldo
- Saldo da conta = `initialBalance + Σ entradas − Σ saídas` com `date <= hoje`.
- Saldo total = soma dos saldos das contas.

## Dashboard / comparação mensal
- Resultado do mês = entradas − saídas (inclui previstos do mês).
- Comparação com o mês anterior: variação absoluta e percentual de entradas, saídas e resultado. **Economizou** = gastou menos que no mês anterior (saídas menores) — a UI mostra em verde.
- Compromissos futuros = soma de parcelas e custos fixos dos próximos 3 meses.
