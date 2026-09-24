import path from 'node:path';

try {
  process.loadEnvFile();
} catch {
  // .env é opcional
}

export const config = {
  port: Number(process.env.PORT ?? 3334),
  jwtSecret: process.env.JWT_SECRET ?? 'dev-secret-troque-em-producao',
  jwtExpiresIn: '7d',
  dbPath: process.env.DB_PATH ?? path.resolve(process.cwd(), 'data', 'db.json'),
} as const;
