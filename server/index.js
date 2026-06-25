import express from 'express';
import cors from 'cors';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';
import db from './db.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;
const TIMEZONE = 'Europe/Oslo';

app.set('trust proxy', true);
app.use(cors());
app.use(express.json());

function osloNow() {
  const now = new Date();
  const date = new Intl.DateTimeFormat('sv-SE', { timeZone: TIMEZONE, year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
  const time = new Intl.DateTimeFormat('sv-SE', { timeZone: TIMEZONE, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(now);
  return { date, time, iso: now.toISOString() };
}

function osloDate(daysAgo = 0) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return new Intl.DateTimeFormat('sv-SE', { timeZone: TIMEZONE, year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
}

const lastTapTime = new Map();
const DEBOUNCE_MS = 3000;

// GET /log — NFC tap endpoint
app.get('/log', (req, res) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');

  const now = Date.now();
  const clientId = req.ip;

  const lastTap = lastTapTime.get(clientId) || 0;
  if (now - lastTap < DEBOUNCE_MS) {
    const base = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5173';
    return res.redirect(302, `${base}/`);
  }
  lastTapTime.set(clientId, now);

  const oslo = osloNow();
  const stmt = db.prepare('INSERT INTO water_log (timestamp, oslo_date, amount_ml) VALUES (?, ?, 500)');
  stmt.run(oslo.iso, oslo.date);

  const base = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5173';
  res.redirect(302, `${base}/?tapped=${now}`);
});

// GET /api/today
app.get('/api/today', (req, res) => {
  const goal = parseInt(req.query.goal) || 2000;
  const today = osloDate();

  const entries = db.prepare(
    'SELECT id, timestamp, amount_ml FROM water_log WHERE oslo_date = ? ORDER BY timestamp ASC'
  ).all(today);

  const total_ml = entries.reduce((sum, e) => sum + e.amount_ml, 0);

  res.json({
    total_ml,
    goal_ml: goal,
    tap_count: entries.length,
    entries: entries.map(e => ({
      id: e.id,
      timestamp: e.timestamp,
      amount_ml: e.amount_ml,
    })),
  });
});

// GET /api/history?days=7
app.get('/api/history', (req, res) => {
  const days = Math.min(parseInt(req.query.days) || 7, 90);
  const results = [];

  for (let i = 0; i < days; i++) {
    const dateStr = osloDate(i);

    const row = db.prepare(
      'SELECT COALESCE(SUM(amount_ml), 0) as total_ml, COUNT(*) as tap_count FROM water_log WHERE oslo_date = ?'
    ).get(dateStr);

    results.push({
      date: dateStr,
      total_ml: row.total_ml,
      tap_count: row.tap_count,
    });
  }

  res.json(results);
});

// GET /api/entries?date=2024-01-15
app.get('/api/entries', (req, res) => {
  const dateStr = req.query.date;
  if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return res.status(400).json({ error: 'date parameter required (YYYY-MM-DD)' });
  }

  const entries = db.prepare(
    'SELECT id, timestamp, amount_ml FROM water_log WHERE oslo_date = ? ORDER BY timestamp ASC'
  ).all(dateStr);

  res.json(entries);
});

// Serve static files in production
const distPath = join(__dirname, '..', 'dist');
if (existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(join(distPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Vanntracking server running on http://localhost:${PORT}`);
});
