# Media Library Owner INSERT — Migration Apply Result

**Date:** 2026-06-29  
**Project:** `usflbjlyadihyitnvzya` (raafatayadsa-art's Project)  
**Migration:** `media_library_owner_insert`  
**File:** `supabase/migrations/20260629140000_media_library_owner_insert.sql`  
**Overall Status:** FAIL

---

## Executive Summary

Attempted to apply owner INSERT RLS policies for Media Manager uploads on production. **Migration was not applied.** Supabase MCP tools (`apply_migration`, `execute_sql`) were not available in this agent session. CLI fallback (`npx supabase db push --linked --yes`) failed due to missing database credentials and Supabase account privileges (403).

---

## Findings

### Migration SQL (pending apply)

```sql
drop policy if exists alpha_media_owner_insert on storage.objects;
create policy alpha_media_owner_insert
  on storage.objects for insert to authenticated
  with check (bucket_id = 'alpha-media' and public.is_platform_owner());

drop policy if exists media_library_owner_insert on public.media_library;
create policy media_library_owner_insert
  on public.media_library for insert to authenticated
  with check (public.is_platform_owner());
```

### Methods attempted

| Method | Result |
|--------|--------|
| Supabase MCP `apply_migration` | **Not available** — MCP tools not exposed to subagent session |
| Supabase MCP `execute_sql` | **Not available** |
| `npx supabase db push --linked --yes` | **Failed** |

### CLI failure details

1. **First attempt:** `.env.local` parse error (UTF-16 encoding with null bytes between characters).
2. **Second attempt** (`.env.local` temporarily renamed):  
   `unexpected login role status 403` — account lacks privileges for login-role endpoint.  
   CLI message: `Connect to your database by setting the env var correctly: SUPABASE_DB_PASSWORD`
3. **Environment check:** `SUPABASE_DB_PASSWORD`, `SUPABASE_ACCESS_TOKEN`, `DATABASE_URL`, `PGPASSWORD` — all unset in process environment.
4. **Project link:** Local link confirmed — `supabase/.temp/project-ref` = `usflbjlyadihyitnvzya`.

### Verification query (not run — migration not applied)

```sql
select polname, polcmd
from pg_policy p
join pg_class c on c.oid = p.polrelid
join pg_namespace n on n.oid = c.relnamespace
where (
  (n.nspname = 'public' and c.relname = 'media_library' and polname = 'media_library_owner_insert')
  or (n.nspname = 'storage' and c.relname = 'objects' and polname = 'alpha_media_owner_insert')
)
order by polname;
```

**Expected after apply:** 2 rows — `alpha_media_owner_insert` (INSERT), `media_library_owner_insert` (INSERT).

---

## Warnings

1. Media Manager FAB uploads will fail RLS until this migration is applied.
2. `.env.local` is UTF-16 encoded; Supabase CLI cannot parse it. Re-save as UTF-8 or use explicit env vars.
3. Prior migrations on this project were applied via Supabase MCP `apply_migration` (see `2026-06-27_16-00-00_ALPHA_121_DOMAIN_COMMENTS_MIGRATION.md`).

---

## Errors

- CLI 403 on login-role initialization.
- Missing `SUPABASE_DB_PASSWORD` / MCP auth for remote SQL execution.

---

## Recommendations

1. **Preferred:** Re-run from a session with Supabase MCP authenticated:
   - Tool: `apply_migration`
   - Project: `usflbjlyadihyitnvzya`
   - Name: `media_library_owner_insert`
   - SQL: contents of `20260629140000_media_library_owner_insert.sql`
2. **Alternative:** Set `SUPABASE_DB_PASSWORD` (Dashboard → Project Settings → Database) and run:
   ```powershell
   cd C:\Users\raafa\Documents\alpha-bible
   $env:SUPABASE_DB_PASSWORD = "<db-password>"
   npx supabase db push --linked --yes
   ```
3. **Manual:** Paste migration SQL in Supabase Dashboard → SQL Editor → Run, then run verification query above.
4. Fix `.env.local` encoding (UTF-8) so CLI can load other vars without rename workaround.

---

## Overall Status

**FAIL** — migration not applied; verification not executed.
