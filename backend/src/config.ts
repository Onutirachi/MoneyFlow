try {
  process.loadEnvFile();
} catch {
  // .env é opcional (em container as variáveis vêm do ambiente)
}

const isProd = process.env.NODE_ENV === 'production';

if (isProd && !process.env.JWT_SECRET) {
  throw new Error('Defina JWT_SECRET em produção.');
}

export const config = {
  PORT: Number(process.env.PORT ?? 3334),
  JWT_SECRET: process.env.JWT_SECRET ?? 'dev-secret-somente-desenvolvimento',
  DATABASE_URL:
    process.env.DATABASE_URL ?? 'postgres://moneyflow:moneyflow@localhost:5433/moneyflow',
  /** origens permitidas no CORS, separadas por vírgula (vazio = qualquer origem) */
  CORS_ORIGIN: process.env.CORS_ORIGIN?.trim() ?? '',
};
