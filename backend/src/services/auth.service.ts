import { randomUUID } from 'node:crypto';
import bcrypt from 'bcryptjs';
import jwt, { type SignOptions } from 'jsonwebtoken';
import { config } from '../config.js';
import { db } from '../db/jsonDb.js';
import { AppError, conflict, notFound } from '../errors.js';
import type { LoginInput, RegisterInput } from '../schemas/auth.schema.js';
import type { PublicUser, User } from '../types.js';
import { DEFAULT_CATEGORIES } from './defaults.js';

export interface AuthResult {
  token: string;
  user: PublicUser;
}

export const toPublicUser = ({ passwordHash: _hash, ...user }: User): PublicUser => user;

export function signToken(userId: string): string {
  const options: SignOptions = { subject: userId, expiresIn: config.jwtExpiresIn };
  return jwt.sign({}, config.jwtSecret, options);
}

export function register(input: RegisterInput): AuthResult {
  const { data } = db;
  if (data.users.some((u) => u.email === input.email)) {
    throw conflict('EMAIL_IN_USE', 'Este e-mail já está cadastrado');
  }

  const user: User = {
    id: randomUUID(),
    name: input.name,
    email: input.email,
    passwordHash: bcrypt.hashSync(input.password, 10),
    createdAt: new Date().toISOString(),
  };
  data.users.push(user);
  data.categories.push(
    ...DEFAULT_CATEGORIES.map((c) => ({ ...c, id: randomUUID(), userId: user.id })),
  );
  db.save();

  return { token: signToken(user.id), user: toPublicUser(user) };
}

export function login(input: LoginInput): AuthResult {
  const user = db.data.users.find((u) => u.email === input.email);
  if (!user || !bcrypt.compareSync(input.password, user.passwordHash)) {
    throw new AppError(401, 'INVALID_CREDENTIALS', 'E-mail ou senha inválidos');
  }
  return { token: signToken(user.id), user: toPublicUser(user) };
}

export function me(userId: string): PublicUser {
  const user = db.data.users.find((u) => u.id === userId);
  if (!user) throw notFound('Usuário');
  return toPublicUser(user);
}
