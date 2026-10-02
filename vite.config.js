import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { handleApi } from './api/handler.js';

const localApi = {
  name: 'findx-local-api',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      if (req.url === '/api' || req.url?.startsWith('/api/')) {
        handleApi(req, res);
        return;
      }
      next();
    });
  },
};

export default defineConfig({
  plugins: [react(), localApi],
});
