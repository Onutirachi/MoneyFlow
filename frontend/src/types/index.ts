// Tipos da API. Espelham backend/src/types.ts e docs/api.md — mantenha em sincronia.

export type MovementType = 'ENTRADA' | 'SAIDA';
export type PaymentMethod = 'DINHEIRO' | 'PIX' | 'CREDITO' | 'DEBITO';

export const PAYMENT_METHODS: PaymentMethod[] = ['DINHEIRO', 'PIX', 'CREDITO', 'DEBITO'];

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Account {
  id: string;
  name: string;
  color: string;
  /** centavos */
  initialBalance: number;
  methods: PaymentMethod[];
  /** saldo até hoje, centavos */
  balance: number;
}

export type AccountInput = Pick<Account, 'name' | 'color' | 'initialBalance' | 'methods'>;

export interface Category {
  id: string;
  name: string;
  type: MovementType;
  color: string;
}

export type CategoryInput = Pick<Category, 'name' | 'type' | 'color'>;

export interface Movement {
  id: string;
  type: MovementType;
  description: string;
  amount: number;
  date: string;
  accountId: string;
  method: PaymentMethod;
  categoryId: string;
  installmentGroupId: string | null;
  installmentNumber: number | null;
  installmentTotal: number | null;
  recurringId: string | null;
  createdAt: string;
}

export interface MovementInput {
  type: MovementType;
  description: string;
  /** valor total quando `installments` for informado */
  amount: number;
  date: string;
  accountId: string;
  method: PaymentMethod;
  categoryId: string;
  installments?: number;
}

export type MovementUpdateInput = Omit<MovementInput, 'type' | 'installments'>;
export type MovementScope = 'one' | 'group';

export interface MovementFilters {
  month: string;
  accountId?: string;
  type?: MovementType;
  categoryId?: string;
  method?: PaymentMethod;
}

export interface RecurringCost {
  id: string;
  description: string;
  amount: number;
  type: MovementType;
  accountId: string;
  method: PaymentMethod;
  categoryId: string;
  dayOfMonth: number;
  startMonth: string;
  endMonth: string | null;
  active: boolean;
  materializedMonths: string[];
}

export type RecurringInput = Omit<RecurringCost, 'id' | 'materializedMonths'>;

interface Totals {
  income: number;
  expense: number;
  result: number;
}

export interface Composition {
  installments: number;
  recurring: number;
  other: number;
}

export interface Dashboard {
  month: string;
  summary: Totals & {
    previous: Totals;
    variation: { income: number | null; expense: number | null; result: number | null };
  };
  totalBalance: number;
  accounts: { id: string; name: string; color: string; balance: number }[];
  expenseByCategory: { categoryId: string; name: string; color: string; total: number }[];
  incomeByCategory: { categoryId: string; name: string; color: string; total: number }[];
  expenseByAccount: { accountId: string; name: string; color: string; total: number }[];
  expenseByMethod: { method: PaymentMethod; total: number }[];
  history: ({ month: string } & Totals)[];
  upcoming: ({ month: string } & Composition)[];
  upcomingTotal: number;
  composition: Composition;
}

export interface ApiErrorBody {
  error: { code: string; message: string; details?: { path: string; message: string }[] };
}
