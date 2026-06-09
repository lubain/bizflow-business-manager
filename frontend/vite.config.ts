import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
  // ← Nécessaire pour que jspdf soit correctement bundlé en ESM
  optimizeDeps: {
    include: ["jspdf", "jspdf-autotable"],
  },
  build: {
    commonjsOptions: {
      include: [/jspdf/, /jspdf-autotable/, /node_modules/],
    },
  },
  server: {
    port: 5173,
    host: true,
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api/, ""),
      },
    },
  },
});
