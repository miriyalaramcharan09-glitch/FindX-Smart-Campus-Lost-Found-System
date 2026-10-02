import { handleApi } from './handler.js';

export function routeApi(req, res, pathname) {
  const queryStart = req.url?.indexOf('?') ?? -1;
  const search = queryStart >= 0 ? req.url.slice(queryStart) : '';
  req.url = `${pathname}${search}`;
  return handleApi(req, res);
}

export function routeItem(req, res, suffix = '') {
  const match = req.url?.match(/\/api\/items\/(\d+)/);
  const id = typeof req.query?.id === 'string' ? req.query.id : match?.[1];
  if (!id || !/^\d+$/.test(id)) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ error: 'Invalid item id' }));
    return;
  }
  return routeApi(req, res, `/api/items/${id}${suffix}`);
}
