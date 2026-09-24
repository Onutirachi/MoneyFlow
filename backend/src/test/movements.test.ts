import './setup.js';
import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { registerUser, startTestApi, type TestApi } from './helpers.js';

interface MovementRes {
  id: string;
  description: string;
  amount: number;
  date: string;
  method: string;
  installmentGroupId: string | null;
  installmentNumber: number | null;
}

describe('movimentos', () => {
  let api: TestApi;
  let token: string;
  let walletId: string;
  let bankId: string;
  let expenseCategoryId: string;
  let incomeCategoryId: string;

  before(async () => {
    api = await startTestApi();
    token = await registerUser(api);
    const wallet = await api.request<{ id: string }>('POST', '/accounts', {
      token,
      body: { name: 'Carteira Física', color: '#16a34a', initialBalance: 0, methods: ['DINHEIRO'] },
    });
    walletId = wallet.body.id;
    const bank = await api.request<{ id: string }>('POST', '/accounts', {
      token,
      body: {
        name: 'Banco XPTO',
        color: '#2563eb',
        initialBalance: 0,
        methods: ['PIX', 'CREDITO', 'DEBITO'],
      },
    });
    bankId = bank.body.id;
    const cats = await api.request<{ id: string; type: string }[]>('GET', '/categories', { token });
    expenseCategoryId = cats.body.find((c) => c.type === 'SAIDA')!.id;
    incomeCategoryId = cats.body.find((c) => c.type === 'ENTRADA')!.id;
  });
  after(() => api.close());

  const expense = (extra: Record<string, unknown> = {}) => ({
    type: 'SAIDA',
    description: 'Mercado',
    amount: 5000,
    date: '2026-09-10',
    accountId: walletId,
    method: 'DINHEIRO',
    categoryId: expenseCategoryId,
    ...extra,
  });

  it('cria saída simples com método permitido', async () => {
    const res = await api.request<MovementRes[]>('POST', '/movements', { token, body: expense() });
    assert.equal(res.status, 201);
    assert.equal(res.body.length, 1);
    assert.equal(res.body[0]!.installmentGroupId, null);
  });

  it('rejeita método que não está na conta', async () => {
    const res = await api.request<{ error: { code: string } }>('POST', '/movements', {
      token,
      body: expense({ method: 'CREDITO' }),
    });
    assert.equal(res.status, 400);
    assert.equal(res.body.error.code, 'METHOD_NOT_ALLOWED');
  });

  it('rejeita categoria de tipo diferente', async () => {
    const res = await api.request<{ error: { code: string } }>('POST', '/movements', {
      token,
      body: expense({ categoryId: incomeCategoryId }),
    });
    assert.equal(res.body.error.code, 'CATEGORY_TYPE_MISMATCH');
  });

  it('gera parcelas com nome i/n, meses consecutivos e soma exata', async () => {
    const res = await api.request<MovementRes[]>('POST', '/movements', {
      token,
      body: expense({
        description: 'Notebook',
        amount: 100000,
        date: '2026-01-31',
        accountId: bankId,
        method: 'CREDITO',
        installments: 3,
      }),
    });
    assert.equal(res.status, 201);
    assert.deepEqual(
      res.body.map((m) => m.description),
      ['Notebook 1/3', 'Notebook 2/3', 'Notebook 3/3'],
    );
    assert.deepEqual(
      res.body.map((m) => m.date),
      ['2026-01-31', '2026-02-28', '2026-03-31'],
    );
    assert.equal(
      res.body.reduce((acc, m) => acc + m.amount, 0),
      100000,
    );

    const feb = await api.request<MovementRes[]>('GET', `/movements?month=2026-02`, { token });
    assert.equal(feb.body.length, 1);
    assert.equal(feb.body[0]!.description, 'Notebook 2/3');

    // edição em grupo reaplica o sufixo e preserva valores/datas
    const second = res.body[1]!;
    const upd = await api.request<MovementRes[]>('PUT', `/movements/${second.id}?scope=group`, {
      token,
      body: {
        description: 'Notebook Dell 2/3',
        amount: 1,
        date: '2030-01-01',
        accountId: bankId,
        method: 'DEBITO',
        categoryId: expenseCategoryId,
      },
    });
    assert.equal(upd.body.length, 3);
    assert.deepEqual(
      upd.body.map((m) => [m.description, m.method, m.date]),
      [
        ['Notebook Dell 1/3', 'DEBITO', '2026-01-31'],
        ['Notebook Dell 2/3', 'DEBITO', '2026-02-28'],
        ['Notebook Dell 3/3', 'DEBITO', '2026-03-31'],
      ],
    );

    // excluir só uma parcela, depois o grupo
    await api.request('DELETE', `/movements/${res.body[0]!.id}?scope=one`, { token });
    const jan = await api.request<MovementRes[]>('GET', '/movements?month=2026-01', { token });
    assert.equal(jan.body.length, 0);
    await api.request('DELETE', `/movements/${second.id}?scope=group`, { token });
    const mar = await api.request<MovementRes[]>('GET', '/movements?month=2026-03', { token });
    assert.equal(mar.body.length, 0);
  });

  it('filtra por mês, tipo e conta; saldo ignora previstos', async () => {
    await api.request('POST', '/movements', {
      token,
      body: {
        type: 'ENTRADA',
        description: 'Salário',
        amount: 500000,
        date: '2026-09-05',
        accountId: bankId,
        method: 'PIX',
        categoryId: incomeCategoryId,
      },
    });
    await api.request('POST', '/movements', {
      token,
      body: expense({ date: '2099-01-01', description: 'Futuro' }),
    });

    const sep = await api.request<MovementRes[]>(
      'GET',
      `/movements?month=2026-09&type=ENTRADA&accountId=${bankId}`,
      { token },
    );
    assert.equal(sep.body.length, 1);

    const accounts = await api.request<{ id: string; balance: number }[]>('GET', '/accounts', {
      token,
    });
    const wallet = accounts.body.find((a) => a.id === walletId)!;
    assert.equal(wallet.balance, -5000); // o "Futuro" não entra

    const noMonth = await api.request('GET', '/movements', { token });
    assert.equal(noMonth.status, 400);
  });
});
