import { createApp } from './app.js';
import { config } from './config.js';

const server = createApp().listen(config.port, () => {
  console.log(`API mock rodando em http://localhost:${config.port}/api`);
});

server.on('error', (err: NodeJS.ErrnoException) => {
  if (err.code === 'EADDRINUSE') {
    console.error(
      `A porta ${config.port} já está em uso por outro processo. ` +
        'Encerre-o ou use outra porta: PORT=3335 npm run dev (e ajuste VITE_API_URL no frontend).',
    );
    process.exit(1);
  }
  throw err;
});
