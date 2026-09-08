import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// La configuración de pruebas vive junto a la de build: un solo archivo, una sola verdad.
// defineConfig viene de vitest/config para tipar la clave "test" sin triple slash.
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: true,
  },
});
