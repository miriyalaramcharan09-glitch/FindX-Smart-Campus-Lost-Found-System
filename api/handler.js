import { randomUUID } from 'node:crypto';

const demoItems = [
  {
    id: 1, type: 'lost', title: 'Silver AirPods case', category: 'Electronics',
    description: 'Small silver case with a blue sticker on the back. Last seen near the east entrance.',
    location: 'Science Building, Room 204', date: '2026-10-01', image: '',
    contact: 'campus@example.edu', status: 'active', created_at: '2026-10-01 12:00:00',
  },
  {
    id: 2, type: 'found', title: 'Green canvas tote bag', category: 'Bags',
    description: 'Green canvas tote with a sketchbook and pencils inside. Turned in at the front desk.',
    location: 'Student Union', date: '2026-10-02', image: '',
    contact: 'campus@example.edu', status: 'active', created_at: '2026-10-02 12:00:00',
  },
  {
    id: 3, type: 'lost', title: 'Blue water bottle', category: 'Accessories',
    description: 'Reusable blue bottle with a small mountain sticker.',
    location: 'Main Library, second floor', date: '2026-09-30', image: '',
    contact: 'campus@example.edu', status: 'active', created_at: '2026-09-30 12:00:00',
  },
  {
    id: 4, type: 'found', title: 'Set of brass keys', category: 'Keys',
    description: 'Three keys on a red fabric keychain. Handed in to campus security.',
    location: 'West Lecture Hall', date: '2026-10-01', image: '',
    contact: 'campus@example.edu', status: 'active', created_at: '2026-10-01 10:00:00',
  },
  {
    id: 5, type: 'lost', title: 'Calculus notebook', category: 'Books',
    description: 'Black spiral notebook with calculus notes and a name written inside.',
    location: 'Engineering Building', date: '2026-09-29', image: '',
    contact: 'campus@example.edu', status: 'active', created_at: '2026-09-29 12:00:00',
  },
  {
    id: 6, type: 'found', title: 'Wireless headphones', category: 'Electronics',
    description: 'Black over-ear headphones left on a table after afternoon class.',
    location: 'Arts Center Cafe', date: '2026-10-02', image: '',
    contact: 'campus@example.edu', status: 'active', created_at: '2026-10-02 09:00:00',
  },
];

const items = [...demoItems.map((item) => ({ ...item, createdAt: item.created_at || item.createdAt || new Date().toISOString(), created_at: item.created_at || item.createdAt || new Date().toISOString() }))];
const responses = [];

function send(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(body));
}

async function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  let text = '';
  for await (const chunk of req) text += chunk;
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export async function handleApi(req, res) {
  try {
    const url = new URL(req.url || '/', 'http://localhost');
    const pathname = url.pathname.replace(/\/+$/, '') || '/';
    const method = req.method || 'GET';

    if (pathname === '/api/health' && method === 'GET') return send(res, 200, { ok: true });

    if (pathname === '/api/items' && method === 'GET' || pathname === '/api/items/search' && method === 'GET') {
      const q = (url.searchParams.get('q') || '').trim().toLowerCase();
      const type = url.searchParams.get('type');
      const category = url.searchParams.get('category');
      const filtered = items.filter((item) => item.status === 'active'
        && (!type || type === 'all' || item.type === type)
        && (!category || category === 'all' || item.category === category)
        && (!q || [item.title, item.description, item.location, item.category].some((value) => String(value).toLowerCase().includes(q))))
        .slice().sort((a, b) => new Date(b.createdAt || b.created_at).getTime() - new Date(a.createdAt || a.created_at).getTime());
      return send(res, 200, filtered);
    }

    const itemPath = pathname.match(/^\/api\/items\/([A-Za-z0-9_-]+)$/);
    if (itemPath && method === 'GET') {
      const item = items.find((entry) => String(entry.id) === itemPath[1]);
      if (!item) return send(res, 404, { error: 'Item not found' });
      return send(res, 200, item);
    }

    const claimPath = pathname.match(/^\/api\/items\/([A-Za-z0-9_-]+)\/claims$/);
    if (claimPath && method === 'POST') {
      const item = items.find((entry) => String(entry.id) === claimPath[1] && entry.status === 'active');
      if (!item) return send(res, 404, { error: 'Item not found' });
      const body = await readBody(req);
      if (!body || ![body.name, body.contact, body.message].every((value) => typeof value === 'string' && value.trim())) {
        return send(res, 400, { error: 'Name, contact, and message are required.' });
      }
      const response = {
        id: randomUUID(),
        itemId: String(item.id),
        name: body.name.trim(),
        contact: body.contact.trim(),
        message: body.message.trim(),
        createdAt: new Date().toISOString(),
      };
      responses.push(response);
      return send(res, 201, { id: response.id, itemId: response.itemId, message: 'Response sent successfully.' });
    }

    if (pathname === '/api/responses' && method === 'POST') {
      const body = await readBody(req);
      if (!body || !['string', 'number'].includes(typeof body.itemId) || !String(body.itemId).trim()
        || ![body.name, body.contact, body.message].every((value) => typeof value === 'string' && value.trim())) {
        return send(res, 400, { error: 'Item id, name, contact, and message are required.' });
      }
      const response = {
        id: randomUUID(),
        itemId: String(body.itemId),
        name: body.name.trim(),
        contact: body.contact.trim(),
        message: body.message.trim(),
        createdAt: new Date().toISOString(),
      };
      responses.push(response);
      return send(res, 201, { success: true, message: 'Response sent successfully.', response });
    }

    if (pathname === '/api/items' && method === 'POST') {
      const body = await readBody(req);
      const { type, title, category, description, location, date, image = '', contact } = body || {};
      if (!['lost', 'found'].includes(type) || ![title, category, description, location, date, contact].every((value) => typeof value === 'string' && value.trim()) || typeof image !== 'string') {
        return send(res, 400, { error: 'Complete all required fields with valid values.' });
      }
      const item = {
        id: randomUUID(),
        type,
        title: title.trim(),
        category: category.trim(),
        description: description.trim(),
        location: location.trim(),
        date,
        image: String(image).trim(),
        contact: contact.trim(),
        status: 'active',
        createdAt: new Date().toISOString(),
      };
      item.created_at = item.createdAt;
      items.push(item);
      return send(res, 201, item);
    }

    return send(res, 404, { error: 'API endpoint not found' });
  } catch (error) {
    console.error('API request failed:', error);
    return send(res, 500, { error: 'The request could not be completed.' });
  }
}
