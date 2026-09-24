# Contrato da API

- Base URL: `http://localhost:3334/api` (o frontend acessa via proxy do Vite em `http://localhost:5174/api`)
- JSON em todas as requisições e respostas.
- Autenticação: header `Authorization: Bearer <token>` em todas as rotas, exceto `/auth/register`, `/auth/login` e `/health`.
- Dinheiro em **centavos (inteiro)**. Datas `YYYY-MM-DD`, meses `YYYY-MM`.
- Recursos de outro usuário respondem `404`.

## Formato de erro
```json
{ "error": { "code": "VALIDATION_ERROR", "message": "Dados inválidos", "details": [{ "path": "amount", "message": "..." }] } }
```
| Status | code | Quando |
|---|---|---|
| 400 | `VALIDATION_ERROR` | body/query inválido (com `details`) |
| 400 | `METHOD_NOT_ALLOWED` | método de pagamento não cadastrado na conta |
| 400 | `CATEGORY_TYPE_MISMATCH` | categoria de tipo diferente do movimento |
| 401 | `UNAUTHORIZED` | token ausente/inválido/expirado |
| 401 | `INVALID_CREDENTIALS` | login com e-mail/senha errados |
| 404 | `NOT_FOUND` | recurso inexistente |
| 409 | `EMAIL_IN_USE` | cadastro com e-mail existente |
| 409 | `ACCOUNT_IN_USE` / `CATEGORY_IN_USE` | exclusão de conta/categoria com vínculos |

## Tipos
```ts
type MovementType = 'ENTRADA' | 'SAIDA';
type PaymentMethod = 'DINHEIRO' | 'PIX' | 'CREDITO' | 'DEBITO';

interface User { id: string; name: string; email: string; createdAt: string }

interface Account {
  id: string; name: string; color: string;       // cor hex, ex. "#2563eb"
  initialBalance: number;                        // centavos
  methods: PaymentMethod[];                      // ao menos 1
  balance: number;                               // calculado: saldo até hoje
}

interface Category { id: string; name: string; type: MovementType; color: string }

interface Movement {
  id: string; type: MovementType; description: string;
  amount: number; date: string;
  accountId: string; method: PaymentMethod; categoryId: string;
  installmentGroupId: string | null; installmentNumber: number | null; installmentTotal: number | null;
  recurringId: string | null;
  createdAt: string;
}

interface RecurringCost {
  id: string; description: string; amount: number; type: MovementType;
  accountId: string; method: PaymentMethod; categoryId: string;
  dayOfMonth: number;            // 1–31
  startMonth: string;            // YYYY-MM
  endMonth: string | null;       // YYYY-MM ou null (sem fim)
  active: boolean;
  materializedMonths: string[];
}
```

## Health
`GET /health` → `200 { "status": "ok" }`

## Auth
| Método | Rota | Body | Resposta |
|---|---|---|---|
| POST | `/auth/register` | `{ name, email, password }` (senha ≥ 6) | `201 { token, user }` · `409 EMAIL_IN_USE` |
| POST | `/auth/login` | `{ email, password }` | `200 { token, user }` · `401 INVALID_CREDENTIALS` |
| GET | `/auth/me` | — | `200 { user }` |

Novo usuário recebe categorias padrão automaticamente. Token expira em 7 dias.

## Contas
| Método | Rota | Body | Resposta |
|---|---|---|---|
| GET | `/accounts` | — | `200 Account[]` |
| POST | `/accounts` | `{ name, color, initialBalance, methods }` | `201 Account` |
| PUT | `/accounts/:id` | igual ao POST | `200 Account` |
| DELETE | `/accounts/:id` | — | `204` · `409 ACCOUNT_IN_USE` |

## Categorias
| Método | Rota | Body | Resposta |
|---|---|---|---|
| GET | `/categories?type=ENTRADA\|SAIDA` | — | `200 Category[]` |
| POST | `/categories` | `{ name, type, color }` | `201 Category` |
| PUT | `/categories/:id` | `{ name, color }` (tipo não muda) | `200 Category` |
| DELETE | `/categories/:id` | — | `204` · `409 CATEGORY_IN_USE` |

## Movimentos
### `GET /movements?month=YYYY-MM`
Filtros opcionais: `accountId`, `type`, `categoryId`, `method`. Materializa os custos fixos até o mês. Retorna `200 Movement[]` ordenado por data (desc).

### `POST /movements`
```json
{ "type": "SAIDA", "description": "Notebook", "amount": 300000, "date": "2026-09-10",
  "accountId": "...", "method": "CREDITO", "categoryId": "...", "installments": 10 }
```
- `installments` opcional (2–72). Quando presente, `amount` é o **valor total** e são geradas as parcelas.
- Resposta: `201 Movement[]` (sempre array; 1 item se não parcelado).

### `PUT /movements/:id?scope=one|group`
Body: `{ description, amount, date, accountId, method, categoryId }` (tipo não muda).
- `scope=one` (padrão): altera só este movimento.
- `scope=group`: aplica `description` (base, o sufixo `i/n` é reaplicado), `accountId`, `method` e `categoryId` a todas as parcelas; `amount` e `date` são ignorados.
- Resposta: `200 Movement[]` (movimentos alterados).

### `DELETE /movements/:id?scope=one|group`
`204`. `scope=group` exclui todas as parcelas do grupo.

## Custos fixos
| Método | Rota | Body | Resposta |
|---|---|---|---|
| GET | `/recurring` | — | `200 RecurringCost[]` |
| POST | `/recurring` | `{ description, amount, type, accountId, method, categoryId, dayOfMonth, startMonth, endMonth, active }` | `201 RecurringCost` |
| PUT | `/recurring/:id` | igual ao POST | `200 RecurringCost` (ocorrências futuras são regeneradas) |
| DELETE | `/recurring/:id` | — | `204` (ocorrências futuras são removidas; passadas ficam com `recurringId: null`) |

## Dashboard
### `GET /dashboard?month=YYYY-MM&accountId=`
`accountId` opcional filtra tudo para uma conta. Materializa custos fixos até `month + 3`.
```ts
interface Dashboard {
  month: string;
  summary: {
    income: number; expense: number; result: number;          // mês selecionado
    previous: { income: number; expense: number; result: number };
    variation: { income: number | null; expense: number | null; result: number | null }; // % vs mês anterior (null se anterior = 0)
    // obs.: o % do resultado explode quando o anterior é próximo de 0 — a UI mostra a diferença em R$
  };
  totalBalance: number;
  accounts: { id: string; name: string; color: string; balance: number }[];
  expenseByCategory: { categoryId: string; name: string; color: string; total: number }[];
  incomeByCategory:  { categoryId: string; name: string; color: string; total: number }[];
  expenseByAccount:  { accountId: string; name: string; color: string; total: number }[];
  expenseByMethod:   { method: PaymentMethod; total: number }[];
  history: { month: string; income: number; expense: number; result: number }[]; // 12 meses terminando em `month`
  upcoming: { month: string; installments: number; recurring: number; other: number }[]; // saídas dos 3 meses seguintes
  upcomingTotal: number;
  composition: { installments: number; recurring: number; other: number };          // saídas do mês por origem
}
```
