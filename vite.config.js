import { defineConfig } from 'react';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/sales-pipeline/',
});
