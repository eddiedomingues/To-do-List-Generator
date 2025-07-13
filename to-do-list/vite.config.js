// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";

export default defineConfig({
  plugins: [
    react(),
    svgr(), // Keep your other plugins
  ],
  server: {
    host: true,
    proxy: {
      // string shorthand: http://localhost:5173/api -> http://localhost:3000/api
      // We'll create a custom path prefix '/api' to tell Vite when to proxy
      "/api": {
        target:
          "https://us-central1-to-do-list-generator.cloudfunctions.net/api", // Your backend server
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""), // Remove /api from the request
      },
    },
  },
});
