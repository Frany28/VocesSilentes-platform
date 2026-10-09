import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { loadEnv } from 'vite';
import { z } from 'zod';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'FRONTEND_');
  const port = z.coerce
    .number()
    .int()
    .min(1)
    .max(65535)
    .safeParse(env.FRONTEND_PORT ?? 5173);
  if (!port.success) throw new Error('Configuración de desarrollo inválida: FRONTEND_PORT');
  return {
    plugins: [react(), tailwindcss()],
    server: { host: 'localhost', port: port.data, strictPort: true },
    preview: { host: 'localhost', port: 4173, strictPort: true },
    test: {
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.js'],
      clearMocks: true,
      restoreMocks: true,
    },
  };
});
