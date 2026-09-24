import './setup.js';
import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { startTestApi, type TestApi } from './helpers.js';

describe('auth', () => {
  let api: TestApi;
  before(async () => {
    api = await startTestApi();
  });
  after(() => api.close());

  it('cadastra, loga e retorna o usuário em /me', async () => {
    const reg = await api.request<{ token: string; user: Record<string, unknown> }>(
      'POST',
      '/auth/register',
      { body: { name: 'Ana', email: 'Ana@Test.com', password: '123456' } },
    );
    assert.equal(reg.status, 201);
    assert.equal(reg.body.user.email, 'ana@test.com');
    assert.equal(reg.body.user.passwordHash, undefined);

    const dup = await api.request<{ error: { code: string } }>('POST', '/auth/register', {
      body: { name: 'Ana', email: 'ana@test.com', password: '123456' },
    });
    assert.equal(dup.status, 409);
    assert.equal(dup.body.error.code, 'EMAIL_IN_USE');

    const bad = await api.request<{ error: { code: string } }>('POST', '/auth/login', {
      body: { email: 'ana@test.com', password: 'errada' },
    });
    assert.equal(bad.status, 401);
    assert.equal(bad.body.error.code, 'INVALID_CREDENTIALS');

    const login = await api.request<{ token: string }>('POST', '/auth/login', {
      body: { email: 'ana@test.com', password: '123456' },
    });
    assert.equal(login.status, 200);

    const me = await api.request<{ user: { name: string } }>('GET', '/auth/me', {
      token: login.body.token,
    });
    assert.equal(me.status, 200);
    assert.equal(me.body.user.name, 'Ana');
  });

  it('valida o body e exige token', async () => {
    const invalid = await api.request<{ error: { code: string; details: unknown[] } }>(
      'POST',
      '/auth/register',
      { body: { name: 'A', email: 'x', password: '1' } },
    );
    assert.equal(invalid.status, 400);
    assert.equal(invalid.body.error.code, 'VALIDATION_ERROR');
    assert.equal(invalid.body.error.details.length, 3);

    const noToken = await api.request('GET', '/auth/me');
    assert.equal(noToken.status, 401);
    const badToken = await api.request('GET', '/auth/me', { token: 'abc' });
    assert.equal(badToken.status, 401);
  });

  it('aceita e-mail com espaços nas pontas (autocompletar/teclado)', async () => {
    await api.request('POST', '/auth/register', {
      body: { name: 'Bia', email: 'bia@test.com', password: '123456' },
    });
    const res = await api.request<{ token: string }>('POST', '/auth/login', {
      body: { email: '  Bia@Test.com ', password: '123456' },
    });
    assert.equal(res.status, 200);
    assert.ok(res.body.token);
  });
});
