import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import basicSsl from "@vitejs/plugin-basic-ssl";

export default defineConfig(({ mode }) => ({
  // HTTPS only for mobile/LAN mic testing: `npm run dev:https`
  // Default dev uses HTTP so the browser opens without certificate warnings.
  plugins: mode === "https" ? [basicSsl()] : [],
  // Always open /home on `npm run dev` — prevents browser from restoring a
  // previous Bible/chapter URL from the last session.
  server: {
    open: "/home",
    host: true,
  },
  optimizeDeps: {
    include: ["maplibre-gl"],
  },
  tanstackStart: {
    server: { entry: "server" },
  },
  // Force the Nitro Cloudflare Workers build to run for `vite build` outside the
  // Lovable sandbox (local CI / Cloudflare). Without this, only the client bundle
  // is emitted (dist/client, no SSR worker, no index.html) and the deploy 404s.
  // Nitro only runs at build time, so local `vite dev` is unaffected.
  nitro: {
    preset: "cloudflare-module",
    compatibilityDate: "2025-05-05",
    output: {
      dir: "dist",
      serverDir: "dist/server",
      publicDir: "dist/client",
    },
    cloudflare: {
      nodeCompat: true,
      deployConfig: true,
    },
  },
}));
