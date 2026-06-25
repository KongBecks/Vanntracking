import Database from 'better-sqlite3';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = join(__dirname, '..', 'data', 'water.db');

import { mkdirSync } from 'fs';
mkdirSync(join(__dirname, '..', 'data'), { recursive: true });

const db = new Database(dbPath);

db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS water_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT NOT NULL,
    oslo_date TEXT NOT NULL DEFAULT '',
    amount_ml INTEGER NOT NULL DEFAULT 500
  )
`);

// Migrate old schema: add oslo_date column if missing
const columns = db.pragma('table_info(water_log)').map(c => c.name);
if (!columns.includes('oslo_date')) {
  db.exec(`ALTER TABLE water_log ADD COLUMN oslo_date TEXT NOT NULL DEFAULT ''`);
  db.exec(`UPDATE water_log SET oslo_date = substr(timestamp, 1, 10)`);
}

export default db;
