# FindX — Campus Lost & Found

A lightweight local prototype for posting, browsing, searching, and claiming campus lost-and-found items. Uses React, Vite, Express, and Node's built-in SQLite module (Node 22.5+); no API keys or external services required.

## Requirements

- Node.js 22.5 or newer
- npm

## Run locally

```sh
npm install
npm run server
```

In another terminal:

```sh
npm run dev
```

Open the Vite URL printed in the terminal (normally http://localhost:5173). The frontend proxies `/api` requests to the Express server at http://localhost:3001. The API also serves the production build at http://localhost:3001 after building.

## Production

```sh
npm run build
npm start
```

## Data and API

SQLite creates `data/campus.sqlite` on first start. This local database is intentionally git-ignored; the API uses port 3001 and needs no environment variables.

- `GET /api/health`
- `GET /api/items` (optional `q`, `type`, and `category` filters)
- `GET /api/items/search?q=...`
- `GET /api/items/:id`
- `POST /api/items`
- `POST /api/items/:id/claims`

Item images are optional URLs. Claim/contact requests are saved locally in the SQLite `claims` table.
