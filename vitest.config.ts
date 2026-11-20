import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    include: [
      'src/components/academic/**/*.test.tsx',
      'src/data/**/*.test.ts',
      'src/contracts/**/*.test.ts',
      'src/services/**/*.test.ts',
      'src/views/admin/**/*.test.tsx',
      'src/views/student/**/*.test.tsx',
    ],
    clearMocks: true,
    restoreMocks: true,
  },
});
