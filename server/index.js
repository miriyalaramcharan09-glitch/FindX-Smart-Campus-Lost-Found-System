import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { handleApi } from '../api/handler.js';

const app = express();
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
app.use(express.json({ limit: '1mb' }));
app.use((req, res, next) => {
  if (req.path === '/api' || req.path.startsWith('/api/')) {
    handleApi(req, res);
    return;
  }
  next();
});
app.use(express.static(path.join(root, 'dist')));
app.get('/{*path}', (_req, res) => res.sendFile(path.join(root, 'dist', 'index.html')));

const port = 3001;
app.listen(port, () => console.log(`FindX local server running at http://localhost:${port}`));
