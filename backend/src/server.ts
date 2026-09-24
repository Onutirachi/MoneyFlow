import { createApp } from './app.js';
import { config } from './config.js';

createApp().listen(config.port, () => {
  console.log(`API mock rodando em http://localhost:${config.port}/api`);
});
