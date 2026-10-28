import './setup.js';
import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { registerUser, startTestApi, type TestApi } from './helpers.js';

interface DashboardRes {
  summary: {
    income: number;
    expense: number;
    result: number;
    previous: { expense: number };
    variation: { expense: number | null; income: number | null };
  };
  totalBalance: number;
  expenseByCategory: { name: string; total: number }[];
  expenseByMethod: { method: string; total: number }[];
  history: { month: string; expense: number }[];
  upcoming: { month: string; installments: number; recurring: number; other: number }[];
  upcomingTotal: number;
  composition: { installments: number; recurring: number; other: number };
}

describe('dashboard', () => {
  let api: TestApi;
  let token: string;

  before(async () => {
    api = await startTestApi();
    token = await registerUser(api);
    const acc = await api.request<{ id: string }>('POST', '/accounts', {
      token,
      body: { name: 'Banco', color: '#2563eb', initialBalance: 0, methods: ['PIX', 'CREDITO'] },
    });
    const cats = await api.request<{ id: string; type: string; name: string }[]>(
      'GET',
      '/categories',
      { token },
    );
    const cat = (name: string) => cats.body.find((c) => c.name === name)!.id;
    const post = (body: Record<string, unknown>) =>
      api.request('POST', '/movements', {
        token,
        body: { accountId: acc.body.id, method: 'PIX', ...body },
      });

    // agosto: gastou 1000; setembro: 900 (500 + 300 + parcela de 100) e entrada de 3000
    await post({
      type: 'SAIDA',
      description: 'A',
      amount: 100000,
      date: '2030-08-10',
      categoryId: cat('Lazer'),
    });
    await post({
      type: 'SAIDA',
      description: 'B',
      amount: 50000,
      date: '2030-09-10',
      categoryId: cat('Lazer'),
    });
    await post({
      type: 'SAIDA',
      description: 'C',
      amount: 30000,
      date: '2030-09-11',
      categoryId: cat('Moradia'),
    });
    await post({
      type: 'ENTRADA',
      description: 'Sal',
      amount: 300000,
      date: '2030-09-05',
      categoryId: cat('Salário'),
    });
    // parcelado a partir de setembro: 3x de 100
    await post({
      type: 'SAIDA',
      description: 'TV',
      amount: 30000,
      date: '2030-09-01',
      method: 'CREDITO',
      categoryId: cat('Compras'),
      installments: 3,
    });
    // custo fixo a partir de outubro
    await api.request('POST', '/recurring', {
      token,
      body: {
        description: 'Internet',
        amount: 10000,
        type: 'SAIDA',
        accountId: acc.body.id,
        method: 'PIX',
        categoryId: cat('Moradia'),
        dayOfMonth: 15,
        startMonth: '2030-10',
      },
    });
  });
  after(() => api.close());

  it('resume o mês e compara com o anterior', async () => {
    const { status, body } = await api.request<DashboardRes>('GET', '/dashboard?month=2030-09', {
      token,
    });
    assert.equal(status, 200);
    assert.equal(body.summary.income, 300000);
    assert.equal(body.summary.expense, 90000);
    assert.equal(body.summary.previous.expense, 100000);
    assert.equal(body.summary.variation.expense, -10); // gastou 10% menos
    assert.equal(body.summary.variation.income, null); // sem base
    assert.equal(body.expenseByCategory[0]!.name, 'Lazer');
    assert.equal(body.history.length, 12);
    assert.equal(body.history.at(-1)!.month, '2030-09');
    assert.deepEqual(body.composition, { installments: 10000, recurring: 0, other: 80000 });
  });

  it('projeta compromissos dos próximos 3 meses', async () => {
    const { body } = await api.request<DashboardRes>('GET', '/dashboard?month=2030-09', {
      token,
    });
    assert.deepEqual(
      body.upcoming.map((u) => [u.month, u.installments, u.recurring]),
      [
        ['2030-10', 10000, 10000],
        ['2030-11', 10000, 10000],
        ['2030-12', 0, 10000],
      ],
    );
    assert.equal(body.upcomingTotal, 50000);
  });

  it('compromissos incluem saídas avulsas já lançadas para os próximos meses', async () => {
    const [account] = (await api.request<{ id: string }[]>('GET', '/accounts', { token })).body;
    const cats = await api.request<{ id: string; name: string }[]>('GET', '/categories', { token });
    await api.request('POST', '/movements', {
      token,
      body: {
        type: 'SAIDA',
        description: 'Viagem',
        amount: 7000,
        date: '2030-11-20',
        accountId: account!.id,
        method: 'PIX',
        categoryId: cats.body.find((c) => c.name === 'Lazer')!.id,
      },
    });
    const { body } = await api.request<DashboardRes>('GET', '/dashboard?month=2030-09', {
      token,
    });
    assert.equal(body.upcoming[1]!.other, 7000);
    const sum = body.upcoming.reduce((a, u) => a + u.installments + u.recurring + u.other, 0);
    assert.equal(body.upcomingTotal, sum); // o total bate com as barras do card
    assert.equal(body.upcomingTotal, 57000);
  });

  it('exige mês válido', async () => {
    const res = await api.request('GET', '/dashboard?month=2030-13', { token });
    assert.equal(res.status, 400);
  });
});
