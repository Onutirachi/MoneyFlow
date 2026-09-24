import fs from 'node:fs';
import path from 'node:path';
import { config } from '../config.js';
import type { Database } from '../types.js';

export const emptyDatabase = (): Database => ({
  users: [],
  accounts: [],
  categories: [],
  movements: [],
  recurring: [],
});

let cache: Database | null = null;
/** mtime do arquivo quando o cache foi carregado/salvo; detecta alterações externas (seed, edição manual). */
let cachedMtime = 0;

const fileMtime = (): number => {
  try {
    return fs.statSync(config.dbPath).mtimeMs;
  } catch {
    return 0;
  }
};

function load(): Database {
  cachedMtime = fileMtime();
  if (!cachedMtime) return emptyDatabase();
  const raw = fs.readFileSync(config.dbPath, 'utf-8');
  return { ...emptyDatabase(), ...(JSON.parse(raw) as Partial<Database>) };
}

/** Banco mock: mantido em memória e persistido em data/db.json (ADR 0001). */
export const db = {
  get data(): Database {
    if (!cache || fileMtime() !== cachedMtime) cache = load();
    return cache;
  },

  /** Escrita atômica: grava em arquivo temporário e renomeia. */
  save(): void {
    const dir = path.dirname(config.dbPath);
    fs.mkdirSync(dir, { recursive: true });
    const tmp = `${config.dbPath}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(cache ?? emptyDatabase(), null, 2));
    fs.renameSync(tmp, config.dbPath);
    cachedMtime = fileMtime();
  },

  replace(data: Database): void {
    cache = data;
    this.save();
  },
};
