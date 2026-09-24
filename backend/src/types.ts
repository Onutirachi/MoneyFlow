// Tipos de domínio. Espelhados em frontend/src/types/index.ts — mantenha os dois em sincronia.

export type MovementType = 'ENTRADA' | 'SAIDA';
export type PaymentMethod = 'DINHEIRO' | 'PIX' | 'CREDITO' | 'DEBITO';

export const MOVEMENT_TYPES = ['ENTRADA', 'SAIDA'] as const satisfies readonly MovementType[];
export const PAYMENT_METHODS = [
  'DINHEIRO',
  'PIX',
  'CREDITO',
  'DEBITO',
] as const satisfies readonly PaymentMethod[];

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
}

export type PublicUser = Omit<User, 'passwordHash'>;

export interface Account {
  id: string;
  userId: string;
  name: string;
  color: string;
  /** centavos */
  initialBalance: number;
  methods: PaymentMethod[];
  createdAt: string;
}

export interface Category {
  id: string;
  userId: string;
  name: string;
  type: MovementType;
  color: string;
}

export interface Movement {
  id: string;
  userId: string;
  type: MovementType;
  description: string;
  /** centavos, sempre > 0 */
  amount: number;
  /** YYYY-MM-DD */
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
  userId: string;
  description: string;
  amount: number;
  type: MovementType;
  accountId: string;
  method: PaymentMethod;
  categoryId: string;
  /** 1–31; dia inexistente no mês usa o último dia */
  dayOfMonth: number;
  /** YYYY-MM */
  startMonth: string;
  /** YYYY-MM ou null (sem fim) */
  endMonth: string | null;
  active: boolean;
  /** meses (YYYY-MM) já gerados como movimentos — ver ADR 0004 */
  materializedMonths: string[];
  createdAt: string;
}

export interface Database {
  users: User[];
  accounts: Account[];
  categories: Category[];
  movements: Movement[];
  recurring: RecurringCost[];
}
