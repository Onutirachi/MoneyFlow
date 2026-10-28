import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { conflict, unauthorized } from '../errors.js';
import { execute, must, one, query, withTx } from '../db/pool.js';
import type { User } from '../types.js';
import { DEFAULT_CATEGORIES } from './defaults.js';

type UserRow = { id: string; name: string; email: string; created_at: Date };

const toUser = (r: UserRow): User => ({
  id: r.id,
  name: r.name,
  email: r.email,
  createdAt: r.created_at.toISOString(),
});

const signToken = (userId: string): string =>
  jwt.sign({}, config.JWT_SECRET, { subject: userId, expiresIn: '7d' });

const isUniqueViolation = (e: unknown): boolean =>
  typeof e === 'object' && e !== null && 'code' in e && e.code === '23505';

export async function register(input: { name: string; email: string; password: string }) {
  const passwordHash = await bcrypt.hash(input.password, 10);
  try {
    return await withTx(async (c) => {
      const user = toUser(
        must(
          await query<UserRow>(
            `INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3)
             RETURNING id, name, email, created_at`,
            [input.name, input.email, passwordHash],
            c,
          ),
        ),
      );
      for (const cat of DEFAULT_CATEGORIES) {
        await execute(
          'INSERT INTO categories (user_id, name, type, color) VALUES ($1, $2, $3, $4)',
          [user.id, cat.name, cat.type, cat.color],
          c,
        );
      }
      return { token: signToken(user.id), user };
    });
  } catch (err) {
    if (isUniqueViolation(err)) throw conflict('EMAIL_IN_USE', 'E-mail já cadastrado');
    throw err;
  }
}

export async function login(input: { email: string; password: string }) {
  const row = one(
    await query<UserRow & { password_hash: string }>(
      'SELECT id, name, email, created_at, password_hash FROM users WHERE email = $1',
      [input.email],
    ),
  );
  const ok = row ? await bcrypt.compare(input.password, row.password_hash) : false;
  if (!row || !ok) throw unauthorized('INVALID_CREDENTIALS', 'E-mail ou senha incorretos');
  return { token: signToken(row.id), user: toUser(row) };
}

export async function me(userId: string): Promise<User> {
  const row = one(
    await query<UserRow>('SELECT id, name, email, created_at FROM users WHERE id = $1', [userId]),
  );
  if (!row) throw unauthorized();
  return toUser(row);
}
