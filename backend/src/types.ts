export type MovementType = 'ENTRADA' | 'SAIDA';
export type PaymentMethod = 'DINHEIRO' | 'PIX' | 'CREDITO' | 'DEBITO';

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface Account {
  id: string;
  name: string;
  color: string;
  initialBalance: number;
  methods: PaymentMethod[];
  balance: number;
}

export interface Category {
  id: string;
  name: string;
  type: MovementType;
  color: string;
}

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

interface Totals {
  income: number;
  expense: number;
  result: number;
}

export interface Dashboard {
  month: string;
  summary: {
    income: number;
    expense: number;
    result: number;
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
  upcoming: { month: string; installments: number; recurring: number; other: number }[];
  upcomingTotal: number;
  composition: { installments: number; recurring: number; other: number };
}
