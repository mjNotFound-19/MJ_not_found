import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const root = dirname(fileURLToPath(import.meta.url));

// GitHub Pages can't send response headers, so the Content-Security-Policy ships
// as a <meta> tag. Build only: the dev server injects inline scripts (HMR,
// React refresh) that this policy would block. Framer Motion and React write
// inline styles, hence 'unsafe-inline' for styles only; scripts stay 'self'.
const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: https:",
  "connect-src 'self'",
  "media-src 'self'",
  "worker-src 'none'",
  "object-src 'none'",
  "frame-src 'none'",
  "base-uri 'self'",
  "form-action 'none'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = {
  name: "security-meta",
  apply: "build",
  transformIndexHtml: () => [
    { tag: "meta", attrs: { "http-equiv": "Content-Security-Policy", content: CSP }, injectTo: "head-prepend" },
    { tag: "meta", attrs: { name: "referrer", content: "strict-origin-when-cross-origin" }, injectTo: "head-prepend" },
  ],
};

export default defineConfig({
  plugins: [react(), securityHeaders],
  base: "/",
  build: {
    outDir: "dist",
    // Pages: the portfolio at /, the bucket list at /bucket-list/ and the DUM-E desk demo at /dum-e/. The demo's
    // source is private and copied in only to build (see .gitignore), so a checkout without it builds the other two.
    rollupOptions: {
      input: {
        main: resolve(root, "index.html"),
        bucket: resolve(root, "bucket-list/index.html"),
        ...(existsSync(resolve(root, "dum-e/index.html")) ? { dume: resolve(root, "dum-e/index.html") } : {}),
      },
    },
  },
});
