import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const root = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  base: "/",
  build: {
    outDir: "dist",
    // Two pages: the portfolio at / and the bucket list at /bucket-list/.
    rollupOptions: {
      input: {
        main: resolve(root, "index.html"),
        bucket: resolve(root, "bucket-list/index.html"),
      },
    },
  },
});
