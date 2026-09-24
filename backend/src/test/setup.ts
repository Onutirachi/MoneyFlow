// Importar PRIMEIRO em todo teste: aponta o banco para um arquivo temporário.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const dbPath = path.join(os.tmpdir(), `financas-test-${process.pid}-${Date.now()}.json`);
process.env.DB_PATH = dbPath;
process.on('exit', () => fs.rmSync(dbPath, { force: true }));
