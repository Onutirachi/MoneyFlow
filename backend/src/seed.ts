// Popula data/db.json com dados de demonstração relativos ao mês atual.
// Uso: npm run seed  |  npm run reset (banco vazio)
import { db, emptyDatabase } from './db/jsonDb.js';
import * as accounts from './services/accounts.service.js';
import * as auth from './services/auth.service.js';
import * as categories from './services/categories.service.js';
import * as movements from './services/movements.service.js';
import * as recurring from './services/recurring.service.js';
import type { MovementType, PaymentMethod } from './types.js';
import { addMonths, currentMonth, dateInMonth, todayISO } from './utils/date.js';

db.replace(emptyDatabase());

if (process.argv.includes('--empty')) {
  console.log('Banco resetado (vazio).');
  process.exit(0);
}

const { user } = auth.register({
  name: 'Usuário Demo',
  email: 'demo@demo.com',
  password: '123456',
});
const userId = user.id;

const categoryId = (name: string) => {
  const category = categories.list(userId).find((c) => c.name === name);
  if (!category) throw new Error(`Categoria ${name} não existe`);
  return category.id;
};

const wallet = accounts.create(userId, {
  name: 'Carteira Física',
  color: '#16a34a',
  initialBalance: 180000,
  methods: ['DINHEIRO'],
});
const xpto = accounts.create(userId, {
  name: 'Banco XPTO',
  color: '#2563eb',
  initialBalance: 250000,
  methods: ['PIX', 'CREDITO', 'DEBITO'],
});
const digital = accounts.create(userId, {
  name: 'Banco Digital',
  color: '#9333ea',
  initialBalance: 350000,
  methods: ['PIX', 'CREDITO'],
});

const month = currentMonth();
const start = addMonths(month, -6);
const today = todayISO();

// ---- custos fixos ----
const fixed: [string, number, MovementType, string, PaymentMethod, string, number][] = [
  ['Salário', 550000, 'ENTRADA', xpto.id, 'PIX', 'Salário', 5],
  ['Aluguel', 180000, 'SAIDA', xpto.id, 'PIX', 'Moradia', 10],
  ['Internet', 11990, 'SAIDA', xpto.id, 'DEBITO', 'Moradia', 15],
  ['Streaming', 5590, 'SAIDA', digital.id, 'CREDITO', 'Assinaturas', 20],
  ['Academia', 9990, 'SAIDA', digital.id, 'CREDITO', 'Saúde', 8],
];
for (const [description, amount, type, accountId, method, category, dayOfMonth] of fixed) {
  recurring.create(userId, {
    description,
    amount,
    type,
    accountId,
    method,
    categoryId: categoryId(category),
    dayOfMonth,
    startMonth: start,
    endMonth: null,
    active: true,
  });
}

// ---- parcelados ----
movements.create(userId, {
  type: 'SAIDA',
  description: 'Notebook',
  amount: 480000,
  date: dateInMonth(addMonths(month, -4), 12),
  accountId: xpto.id,
  method: 'CREDITO',
  categoryId: categoryId('Compras'),
  installments: 12,
});
movements.create(userId, {
  type: 'SAIDA',
  description: 'Geladeira',
  amount: 300000,
  date: dateInMonth(addMonths(month, -1), 3),
  accountId: digital.id,
  method: 'CREDITO',
  categoryId: categoryId('Compras'),
  installments: 10,
});

// ---- gastos variáveis (pseudoaleatórios, determinísticos) ----
let seed = 42;
const rand = () => {
  seed = (seed * 16807) % 2147483647;
  return seed / 2147483647;
};
const between = (min: number, max: number) => Math.round(min + rand() * (max - min));

const variable: [string, string, string, PaymentMethod, number, number, number][] = [
  // descrição, categoria, conta, método, min, max, vezes por mês
  ['Mercado', 'Alimentação', xpto.id, 'DEBITO', 18000, 45000, 3],
  ['Restaurante', 'Alimentação', digital.id, 'CREDITO', 4000, 15000, 3],
  ['Padaria', 'Alimentação', wallet.id, 'DINHEIRO', 1200, 3500, 4],
  ['Uber', 'Transporte', digital.id, 'PIX', 1500, 4500, 4],
  ['Combustível', 'Transporte', xpto.id, 'CREDITO', 15000, 25000, 1],
  ['Farmácia', 'Saúde', xpto.id, 'DEBITO', 2000, 12000, 1],
  ['Cinema', 'Lazer', digital.id, 'CREDITO', 3000, 9000, 1],
  ['Feira', 'Alimentação', wallet.id, 'DINHEIRO', 3000, 8000, 2],
];

for (let i = 0; i <= 6; i++) {
  const m = addMonths(start, i);
  // meses com mais ou menos gasto, para a comparação mensal ficar interessante
  const factor = [1, 1.2, 0.85, 1.1, 0.9, 1.3, 0.8][i]!;

  for (const [description, category, accountId, method, min, max, times] of variable) {
    for (let t = 0; t < times; t++) {
      const date = dateInMonth(m, between(1, 28));
      if (date > today) continue;
      movements.create(userId, {
        type: 'SAIDA',
        description,
        amount: Math.round(between(min, max) * factor),
        date,
        accountId,
        method,
        categoryId: categoryId(category),
      });
    }
  }

  if (i % 2 === 0) {
    const date = dateInMonth(m, 22);
    if (date <= today) {
      movements.create(userId, {
        type: 'ENTRADA',
        description: 'Freelance',
        amount: between(60000, 150000),
        date,
        accountId: digital.id,
        method: 'PIX',
        categoryId: categoryId('Freelance'),
      });
    }
  }
}

recurring.ensureMaterialized(userId, addMonths(month, 3));

const total = db.data.movements.length;
console.log(`Seed concluído: ${total} movimentos. Login: demo@demo.com / 123456`);
