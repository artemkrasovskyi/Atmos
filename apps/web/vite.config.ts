import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

// API_PROXY_TARGET is server-side only (never exposed to the browser bundle).
const apiTarget = process.env.API_PROXY_TARGET ?? "http://localhost:3000";

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    proxy: { "/api": apiTarget },
    watch: process.env.CHOKIDAR_USEPOLLING ? { usePolling: true } : undefined,
  },
  test: { environment: "jsdom" },
});
