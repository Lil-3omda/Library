import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    https: true, // Enable HTTPS for camera access
    host: true,  // Allow access from local network
  },
  preview: {
    https: true,
    host: true,
  }
});
