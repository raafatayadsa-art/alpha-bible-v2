# Alpha Connect Retention Policy Check Fix (23514)

**Date:** 2026-06-17  
**Mode:** Implementation  
**Overall Status:** PARTIAL (code fix applied; DB SQL must be run in Supabase)

---

## Executive Summary

Runtime error `23514` / `alpha_connect_messages_retention_policy_check` occurs when `retention_policy` on INSERT is not in the database CHECK allow-list. The app sends valid ALPHA-DATA-POLICY-002 values (notably `on_read` from chat timer "بعد القراءة"), but the live database likely still has the **16140000** constraint that excludes `on_read`. Code now normalizes all insert payloads; a migration + RUN script restores the full constraint including `on_read`.

---

## Findings

### Exact SQL constraint definition (target / post-fix)

```sql
CONSTRAINT alpha_connect_messages_retention_policy_check
  CHECK (retention_policy IN ('on_read', '1h', '6h', '12h', '24h', '3d', '7d'))
```

Source: `supabase/migrations/20250616150000_alpha_connect_on_read_immediate.sql`, reinforced in `20250617200000_alpha_connect_retention_policy_check_fix.sql`.

### Stale constraint on DB (probable live state)

Migration `20250616140000_alpha_connect_retention_policy_002.sql` temporarily replaced the check with:

```sql
CHECK (retention_policy IN ('1h', '6h', '12h', '24h', '3d', '7d'))
```

**`on_read` is missing.** Any INSERT with `retention_policy = 'on_read'` fails with 23514.

### Exact INSERT payload (from `sendAlphaConnectTextMessage`)

```json
{
  "conversation_id": "<uuid>",
  "sender_id": "<uuid>",
  "kind": "text",
  "body": "<trimmed user text>",
  "retention_policy": "<from timer or settings>"
}
```

**Chat send path:** `AlphaChatScreen` → `timerLabelToRetention(timer)` → `useAlphaConnectThread.sendText` → `sendAlphaConnectTextMessage`.

| Timer label (localStorage) | App sends `retention_policy` | Allowed by 16140000? | Allowed by target? |
|----------------------------|------------------------------|----------------------|--------------------|
| بعد القراءة                | `on_read`                    | **NO**               | YES                |
| ٣٠ دقيقة / ساعة            | `1h`                         | YES                  | YES                |
| ٢٤ ساعة (default)          | `24h`                        | YES                  | YES                |
| ٧ أيام                     | `7d`                         | YES                  | YES                |

| Legacy / settings value | Coerced to | Allowed by 16140000? |
|-------------------------|------------|----------------------|
| `read`                  | `on_read`  | **NO**               |
| `hour`                  | `1h`       | YES                  |
| `day`                   | `24h`      | YES                  |
| `week`                  | `7d`       | YES                  |
| `never`                 | `on_read`  | **NO**               |

### Violating field

**`retention_policy`** — value `on_read` (or legacy `read`/`never`) rejected by stale CHECK constraint.

### Root cause

**Database migration drift:** `20250616140000` removed `on_read` from the CHECK; `20250616150000` (or later fix) was not applied on the live Supabase project. The app correctly sends `on_read` for ephemeral "after read" messaging per ALPHA-DATA-POLICY-002.

---

## Code changes applied

| File | Change |
|------|--------|
| `src/features/alpha-connect/retention.ts` | `retentionPolicyFromSettings()` uses `normalizeRetentionPolicy()`; added `coerceMessageRetentionPolicy()` |
| `src/features/alpha-connect/messages-api.ts` | Coerce `retention_policy` before text/voice INSERT |
| `src/features/alpha-connect/alpha-connect-message-map.ts` | Timer labels + legacy coercion at send boundary |
| `supabase/migrations/20250617200000_alpha_connect_retention_policy_check_fix.sql` | **NEW** — restores full CHECK + triggers |
| `supabase/RUN_ALPHA_CONNECT_RETENTION_POLICY_CHECK_FIX.sql` | **NEW** — one-shot Supabase SQL editor script |
| `scripts/verify-retention-policy-coercion.mjs` | Static coercion proof (10/10 cases pass) |

---

## Verification

### Static (completed)

- `npm run build` — **PASS**
- `node scripts/verify-retention-policy-coercion.mjs` — **10/10 OK**
- Sample insert payload after coercion: `retention_policy: "on_read"` matches target CHECK

### Runtime (requires DB SQL apply + manual chat test)

After running `supabase/RUN_ALPHA_CONNECT_RETENTION_POLICY_CHECK_FIX.sql` in Supabase SQL Editor:

1. **First text message** — send with default timer (٢٤ ساعة → `24h`); row appears in thread
2. **Second text message** — send again; both rows persist in `alpha_connect_messages`
3. **Realtime delivery** — second client/tab receives `postgres_changes` on `alpha_connect_messages`
4. **Conversation persistence** — reload chat; messages load via `listAlphaConnectMessages`
5. **on_read path** — set timer to "بعد القراءة", send; INSERT must succeed (was failing with 23514)

---

## Warnings

- **DB SQL must be executed** on project `usflbjlyadihyitnvzya` — code normalization alone cannot fix `on_read` vs stale CHECK.
- Run the verification SELECT at end of RUN script to confirm constraint definition includes `on_read`.

---

## Errors

- Prior runtime: `23514 alpha_connect_messages_retention_policy_check` on message INSERT.

---

## Recommendations

1. Run `supabase/RUN_ALPHA_CONNECT_RETENTION_POLICY_CHECK_FIX.sql` in Supabase SQL Editor now.
2. Confirm output shows: `CHECK ((retention_policy = ANY (ARRAY['on_read'::text, ...])))`
3. Re-test send with timer "بعد القراءة" and default "٢٤ ساعة".

---

## Overall Status

**PARTIAL** — Application fix complete; database fix script provided and must be applied for full resolution.

---

## Field corrected

**`retention_policy`** — normalized at insert boundary; DB constraint must include `on_read`.

## Successful insert proof (static)

```
OK   "بعد القراءة" -> on_read
Sample insert payload: { ..., "retention_policy": "on_read" }
DB constraint (target): CHECK (retention_policy IN ('on_read', '1h', '6h', '12h', '24h', '3d', '7d'))
```

Live INSERT proof pending SQL apply + authenticated send test.
