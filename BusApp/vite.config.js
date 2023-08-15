import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import replace from '@rollup/plugin-replace';

export default defineConfig({
  plugins: [
    react(),
    replace({
      'process.env.REACT_APP_GOOGLE_MAPS_APIKEY': JSON.stringify(process.env.REACT_APP_GOOGLE_MAPS_APIKEY),
    }),
  ],
});
