import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  base: '/',
  plugins: [
    react(),
    TanStackRouterVite(),
    tailwindcss(),
    tsconfigPaths(),
  ],
  server: {
    proxy: {
      '/api': {
        target: 'https://api.mallusmart.com',
        changeOrigin: true,
        secure: false, // Ignore SSL issues for the proxy target
        timeout: 60000, // Wait up to 60s for server response
        proxyTimeout: 60000, // Wait up to 60s for proxy connection
        rewrite: (path) => {
          if (path.startsWith('/api/uploads')) return path.replace(/^\/api\/uploads/, '/Content/uploads');
          return path.replace(/^\/api/, '');
        },
      },
    },
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: 'index.html',
      },
    },
  },
});
