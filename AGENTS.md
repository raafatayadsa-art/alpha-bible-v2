# AGENTS.md

## Cursor Cloud specific instructions

Alpha ("The Coptic Orthodox Digital Home") is a single TanStack Start (React 19, SSR)
web app. Data (Bible, Agpeya, Katameros, Synaxarium, Alpha Connect messaging, church
management) lives in a **hosted Supabase project**. The Supabase URL + anon key are
**hardcoded** in `src/integrations/supabase/client.ts`, so the app runs end-to-end with
**no `.env` setup** — there is no `.env.example` and none is needed for local dev.

### Package manager & services
- Use **Bun** (`bun.lock`, `bunfig.toml`). `npm` works as a fallback (`package-lock.json`).
- `bunfig.toml` enforces a 24h supply-chain guard (`minimumReleaseAge`) on installs; this
  can delay adoption of brand-new package versions and is expected.
- The only required external service is the hosted Supabase backend (already wired in via
  hardcoded creds). Cloudflare Workers / Wrangler and the local Supabase CLI stack are only
  needed for deploy / local-migration testing, not for `bun run dev`.

### Run / build / lint / test (commands live in `package.json`)
- Dev server: `bun run dev` → serves on **http://localhost:8080** and opens `/home`.
- Build: `bun run build` (emits a Cloudflare Workers bundle via Nitro to `dist/`).
- Lint: `bun run lint`. NOTE: the repo currently has **thousands of pre-existing
  eslint/prettier errors** unrelated to any new change — a clean lint run is not the
  baseline. Run `bun run format` (prettier) only if explicitly asked.
- E2E: `bunx playwright test` (Playwright, mobile-chromium profile). It auto-starts the dev
  server unless `E2E_BASE_URL` is set, and reuses an existing one on port 8080. Browsers
  must be present first: `bunx playwright install chromium` (idempotent; the update script
  does not install browsers). Several specs in `e2e/` assert on date/content-dependent data
  from Supabase and on strict-mode unique locators, so some may fail without indicating an
  environment problem.

### Non-obvious gotchas
- **Deep-linking directly to a Bible chapter URL** (e.g. `/matthew/1`) can hang on skeleton
  loaders. Navigate through the **UI flow** instead — Home → Bible card (`الكتاب المقدس`) →
  Testament chooser → book → chapter — which loads verse data reliably.
- The UI is Arabic / RTL (`<html dir="rtl">`); content is in Arabic + Coptic.
- The heavy SSR app + many dynamic imports can momentarily exhaust browser memory in the
  Cloud VM GUI (Chrome `ERR_INSUFFICIENT_RESOURCES` / "Aw Snap"); a reload recovers. The
  dev server itself stays healthy (`curl http://localhost:8080/home` returns 200).
