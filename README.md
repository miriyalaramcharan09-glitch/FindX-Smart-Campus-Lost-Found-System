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

The API starts with sample listings and accepts lost/found reports and contact requests. For a zero-configuration Vercel demo, data is held in serverless instance memory: new reports may appear while that function instance is warm, but are not durable and can disappear on a cold start or redeploy. SQLite is used nowhere in the deployed API because Vercel's local filesystem is not persistent.

- `GET /api/health`
- `GET /api/items` (optional `q`, `type`, and `category` filters)
- `GET /api/items/search?q=...`
- `GET /api/items/:id`
- `POST /api/items`
- `POST /api/items/:id/claims`

Item images are optional URLs. Claim/contact requests use the same best-effort in-memory storage as reports.
