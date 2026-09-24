import './setup.js';
import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { registerUser, startTestApi, type TestApi } from './helpers.js';

interface MovementRes {
  id: string;
  description: string;
  amount: number;
  date: string;
  recurringId: string | null;
}

describe('custos fixos', () => {
  let api: TestApi;
  let token: string;
  let accountId: string;
  let categoryId: string;

  before(async () => {
    api = await startTestApi();
    token = await registerUser(api);
    const acc = await api.request<{ id: string }>('POST', '/accounts', {
      token,
      body: { name: 'Banco', color: '#2563eb', initialBalance: 0, methods: ['PIX', 'DEBITO'] },
    });
    accountId = acc.body.id;
    const cats = await api.request<{ id: string }[]>('GET', '/categories?type=SAIDA', { token });
    categoryId = cats.body[0]!.id;
  });
  after(() => api.close());

  const rent = (extra: Record<string, unknown> = {}) => ({
    description: 'Aluguel',
    amount: 150000,
    type: 'SAIDA',
    accountId,
    method: 'PIX',
    categoryId,
    dayOfMonth: 31,
    startMonth: '2026-01',
    ...extra,
  });

  it('valida método da conta e intervalo de meses', async () => {
    const bad = await api.request<{ error: { code: string } }>('POST', '/recurring', {
      token,
      body: rent({ method: 'CREDITO' }),
    });
    assert.equal(bad.body.error.code, 'METHOD_NOT_ALLOWED');
    const badRange = await api.request('POST', '/recurring', {
      token,
      body: rent({ endMonth: '2025-12' }),
    });
    assert.equal(badRange.status, 400);
  });

  it('materializa ao consultar o mês, de forma idempotente', async () => {
    const created = await api.request<{ id: string }>('POST', '/recurring', {
      token,
      body: rent(),
    });
    assert.equal(created.status, 201);

    const feb1 = await api.request<MovementRes[]>('GET', '/movements?month=2026-02', { token });
    const feb2 = await api.request<MovementRes[]>('GET', '/movements?month=2026-02', { token });
    assert.equal(feb1.body.length, 1);
    assert.equal(feb2.body.length, 1);
    assert.equal(feb1.body[0]!.date, '2026-02-28');
    assert.equal(feb1.body[0]!.recurringId, created.body.id);

    // janeiro também foi gerado (desde o startMonth)
    const jan = await api.request<MovementRes[]>('GET', '/movements?month=2026-01', { token });
    assert.equal(jan.body.length, 1);

    // excluir uma ocorrência não a recria
    await api.request('DELETE', `/movements/${jan.body[0]!.id}`, { token });
    const janAgain = await api.request<MovementRes[]>('GET', '/movements?month=2026-01', {
      token,
    });
    assert.equal(janAgain.body.length, 0);

    // editar vale apenas para meses ainda não gerados
    await api.request('PUT', `/recurring/${created.body.id}`, {
      token,
      body: rent({ amount: 160000 }),
    });
    const feb3 = await api.request<MovementRes[]>('GET', '/movements?month=2026-02', { token });
    assert.equal(feb3.body[0]!.amount, 150000);
    const apr = await api.request<MovementRes[]>('GET', '/movements?month=2026-04', { token });
    assert.equal(apr.body[0]!.amount, 160000);

    // excluir o custo fixo mantém ocorrências, desvinculadas
    await api.request('DELETE', `/recurring/${created.body.id}`, { token });
    const aprAfter = await api.request<MovementRes[]>('GET', '/movements?month=2026-04', {
      token,
    });
    assert.equal(aprAfter.body.length, 1);
    assert.equal(aprAfter.body[0]!.recurringId, null);
  });

  it('respeita endMonth e active=false', async () => {
    await api.request('POST', '/recurring', {
      token,
      body: rent({ description: 'Curso', startMonth: '2027-01', endMonth: '2027-02' }),
    });
    await api.request('POST', '/recurring', {
      token,
      body: rent({ description: 'Pausado', startMonth: '2027-01', active: false }),
    });
    const mar = await api.request<MovementRes[]>('GET', '/movements?month=2027-03', { token });
    assert.equal(mar.body.filter((m) => m.recurringId).length, 0);
    const feb = await api.request<MovementRes[]>('GET', '/movements?month=2027-02', { token });
    assert.deepEqual(
      feb.body.filter((m) => m.recurringId).map((m) => m.description),
      ['Curso'],
    );
  });
});
