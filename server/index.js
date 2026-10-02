import express from 'express';
import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const dataDir = path.resolve(root, 'data');
mkdirSync(dataDir, { recursive: true });
const db = new DatabaseSync(path.join(dataDir, 'campus.sqlite'));

db.exec(`
  CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL CHECK(type IN ('lost', 'found')),
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    location TEXT NOT NULL,
    date TEXT NOT NULL,
    image TEXT,
    contact TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS claims (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_id INTEGER NOT NULL REFERENCES items(id),
    name TEXT NOT NULL,
    contact TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`);

const app = express();
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.get('/api/items', (req, res) => {
  const { type, category, q } = req.query;
  const filters = ["status = 'active'"];
  const values = [];
  if (type === 'lost' || type === 'found') { filters.push('type = ?'); values.push(type); }
  if (typeof category === 'string' && category) { filters.push('category = ?'); values.push(category); }
  if (typeof q === 'string' && q.trim()) {
    filters.push('(title LIKE ? OR description LIKE ? OR location LIKE ? OR category LIKE ?)');
    const term = `%${q.trim()}%`;
    values.push(term, term, term, term);
  }
  res.json(db.prepare(`SELECT * FROM items WHERE ${filters.join(' AND ')} ORDER BY created_at DESC, id DESC`).all(...values));
});
app.get('/api/items/search', (req, res) => {
  const q = typeof req.query.q === 'string' ? req.query.q : '';
  const term = `%${q.trim()}%`;
  res.json(db.prepare("SELECT * FROM items WHERE status = 'active' AND (title LIKE ? OR description LIKE ? OR location LIKE ? OR category LIKE ?) ORDER BY created_at DESC, id DESC")
    .all(term, term, term, term));
});
app.get('/api/items/:id', (req, res) => {
  const item = db.prepare('SELECT * FROM items WHERE id = ?').get(Number(req.params.id));
  if (!item) return res.status(404).json({ error: 'Item not found' });
  res.json(item);
});
app.post('/api/items', (req, res) => {
  const { type, title, category, description, location, date, image = '', contact } = req.body ?? {};
  if (!['lost', 'found'].includes(type) || ![title, category, description, location, date, contact].every((v) => typeof v === 'string' && v.trim())) {
    return res.status(400).json({ error: 'Complete all required fields with valid values.' });
  }
  const result = db.prepare('INSERT INTO items (type, title, category, description, location, date, image, contact) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
    .run(type, title.trim(), category.trim(), description.trim(), location.trim(), date, image.trim(), contact.trim());
  res.status(201).json(db.prepare('SELECT * FROM items WHERE id = ?').get(Number(result.lastInsertRowid)));
});
app.post('/api/items/:id/claims', (req, res) => {
  const item = db.prepare("SELECT id FROM items WHERE id = ? AND status = 'active'").get(Number(req.params.id));
  if (!item) return res.status(404).json({ error: 'Item not found' });
  const { name, contact, message } = req.body ?? {};
  if (![name, contact, message].every((v) => typeof v === 'string' && v.trim())) {
    return res.status(400).json({ error: 'Name, contact, and message are required.' });
  }
  db.prepare('INSERT INTO claims (item_id, name, contact, message) VALUES (?, ?, ?, ?)')
    .run(item.id, name.trim(), contact.trim(), message.trim());
  res.status(201).json({ message: 'Your request has been saved for the campus team.' });
});

app.use('/api', (_req, res) => res.status(404).json({ error: 'API endpoint not found' }));
app.use(express.static(path.join(root, 'dist')));
app.get('/{*path}', (_req, res) => res.sendFile(path.join(root, 'dist', 'index.html')));

const port = 3001;
app.listen(port, () => console.log(`Findr API and website running at http://localhost:${port}`));
