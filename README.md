# FindX — Campus Lost & Found

A lightweight prototype for posting, browsing, searching, and claiming campus lost-and-found items. Uses React, Vite, and a small Node.js API; no API keys or external services required.

## Requirements

- Node.js 20 or newer
- npm

## Run locally

```sh
npm install
npm run dev
```

Open the Vite URL printed in the terminal (normally http://localhost:5173). Vite serves the API locally using the same handler as the Vercel deployment. To serve the production build locally, run `npm run build` followed by `npm start` (http://localhost:3001).

## Production

```sh
npm run build
npm start
```

## Data and API

The API starts with sample listings and accepts lost/found reports and contact requests. Vercel function memory is not shared or durable, so the frontend also saves reports and responses in the browser's local storage. This keeps a report visible, openable, and claimable in the browser that created it, including after reload. Browser-local reports are not shared with other devices or users; shared production persistence requires a hosted data store. SQLite is not used by the deployed API because Vercel's local filesystem is not persistent.

- `GET /api/health`
- `GET /api/items` (optional `q`, `type`, and `category` filters)
- `GET /api/items/search?q=...`
- `GET /api/items/:id`
- `POST /api/items`
- `POST /api/responses`
- `POST /api/items/:id/claims`

New item and response IDs are unique UUIDs. Item images are optional URLs. API responses are JSON; the browser retains its own submitted reports and responses.
