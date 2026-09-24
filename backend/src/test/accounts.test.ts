import './setup.js';
import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { registerUser, startTestApi, type TestApi } from './helpers.js';

interface AccountRes {
  id: string;
  name: string;
  methods: string[];
  balance: number;
}

describe('contas e categorias', () => {
  let api: TestApi;
  let token: string;
  before(async () => {
    api = await startTestApi();
    token = await registerUser(api);
  });
  after(() => api.close());

  it('cria, lista, edita e exclui conta', async () => {
    const created = await api.request<AccountRes>('POST', '/accounts', {
      token,
      body: {
        name: 'Banco XPTO',
        color: '#2563eb',
        initialBalance: 10000,
        methods: ['PIX', 'CREDITO', 'PIX'],
      },
    });
    assert.equal(created.status, 201);
    assert.deepEqual(created.body.methods, ['PIX', 'CREDITO']);
    assert.equal(created.body.balance, 10000);

    const list = await api.request<AccountRes[]>('GET', '/accounts', { token });
    assert.equal(list.body.length, 1);

    const updated = await api.request<AccountRes>('PUT', `/accounts/${created.body.id}`, {
      token,
      body: { name: 'Banco XPTO 2', color: '#2563eb', initialBalance: 0, methods: ['DEBITO'] },
    });
    assert.equal(updated.body.name, 'Banco XPTO 2');

    const del = await api.request('DELETE', `/accounts/${created.body.id}`, { token });
    assert.equal(del.status, 204);
  });

  it('exige ao menos um método e isola usuários', async () => {
    const invalid = await api.request('POST', '/accounts', {
      token,
      body: { name: 'X', color: '#000000', initialBalance: 0, methods: [] },
    });
    assert.equal(invalid.status, 400);

    const mine = await api.request<AccountRes>('POST', '/accounts', {
      token,
      body: { name: 'Carteira', color: '#000000', initialBalance: 0, methods: ['DINHEIRO'] },
    });
    const other = await registerUser(api);
    const res = await api.request('PUT', `/accounts/${mine.body.id}`, {
      token: other,
      body: { name: 'Hack', color: '#000000', initialBalance: 0, methods: ['DINHEIRO'] },
    });
    assert.equal(res.status, 404);
  });

  it('usuário novo tem categorias padrão e pode filtrar por tipo', async () => {
    const all = await api.request<{ type: string }[]>('GET', '/categories', { token });
    assert.ok(all.body.length > 5);
    const income = await api.request<{ type: string }[]>('GET', '/categories?type=ENTRADA', {
      token,
    });
    assert.ok(income.body.every((c) => c.type === 'ENTRADA'));

    const created = await api.request<{ id: string }>('POST', '/categories', {
      token,
      body: { name: 'Pets', type: 'SAIDA', color: '#a16207' },
    });
    assert.equal(created.status, 201);
    const del = await api.request('DELETE', `/categories/${created.body.id}`, { token });
    assert.equal(del.status, 204);
  });
});
