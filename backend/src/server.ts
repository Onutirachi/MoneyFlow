import { createApp } from './app.js';
import { config } from './config.js';
import { migrate } from './db/migrate.js';
import { pool } from './db/pool.js';

try {
  await migrate(); // idempotente: garante que as tabelas existem
} catch (err) {
  const host = config.DATABASE_URL.replace(/\/\/[^@]*@/, '//'); // sem a senha
  console.error(`\nNão foi possível conectar ao PostgreSQL em ${host}.`);
  console.error('Suba o banco com "docker compose up -d db" na raiz do projeto e tente de novo.\n');
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
}

const server = createApp().listen(config.PORT, () => {
  console.log(`API em http://localhost:${config.PORT}/api`);
});

const shutdown = () => {
  server.close(() => {
    void pool.end().then(() => process.exit(0));
  });
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
