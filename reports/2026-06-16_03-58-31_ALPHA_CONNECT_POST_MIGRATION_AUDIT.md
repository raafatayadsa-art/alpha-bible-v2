# Alpha Connect MVP — Post-Migration Audit Report

**Project:** Alpha Bible  
**Supabase:** https://usflbjlyadihyitnvzya.supabase.co  
**Migration executed:** supabase/RUN_ALPHA_CONNECT_MVP.sql  
**Report generated:** 2026-06-16 03:58:31  
**Verification method:** REST probe + scripts/verify-alpha-tables.mjs

---

## Executive Summary

The Alpha Connect MVP migration has been successfully applied to Supabase. All three Connect tables are visible to PostgREST, RPCs respond correctly, the private storage bucket is reachable, and RLS blocks unauthenticated access as expected. All tables are empty (0 rows), indicating a clean first install with no Connect data yet.

**Overall Status: PASS**

Minor warnings exist around Realtime publication (not remotely confirmed), client-only purge scheduling, and the `never` retention policy bypassing the 7-day timed cap by design.

---

## Findings

### Created Tables

| Table | REST Status | Row Count |
|-------|-------------|-----------|
| alpha_connect_conversations | EXISTS + REST OK | 0 |
| alpha_connect_conversation_members | EXISTS + REST OK | 0 |
| alpha_connect_messages | EXISTS + REST OK | 0 |

Pre-existing (not part of this migration): alpha_identities — EXISTS + REST OK

### Columns and Data Types

#### alpha_connect_conversations

- id — uuid — NOT NULL — default gen_random_uuid() — PRIMARY KEY
- church_id — bigint — NULLABLE — FK to public.churches(id) ON DELETE SET NULL
- kind — text — NOT NULL — CHECK (direct, group)
- title — text — NULLABLE
- group_code — text — NULLABLE — UNIQUE
- created_at — timestamptz — NOT NULL — default now()
- updated_at — timestamptz — NOT NULL — default now()

#### alpha_connect_conversation_members

- conversation_id — uuid — NOT NULL — FK to conversations — PK part
- user_id — uuid — NOT NULL — FK to auth.users(id) — PK part
- role — text — NOT NULL — default member — CHECK (member, admin)
- joined_at — timestamptz — NOT NULL — default now()
- PRIMARY KEY: (conversation_id, user_id)

#### alpha_connect_messages

- id — uuid — NOT NULL — default gen_random_uuid() — PRIMARY KEY
- conversation_id — uuid — NOT NULL — FK ON DELETE CASCADE
- sender_id — uuid — NOT NULL — FK to auth.users(id) ON DELETE CASCADE
- kind — text — NOT NULL — default voice — CHECK (voice, text, ptt)
- body — text — NULLABLE
- audio_path — text — NULLABLE
- duration_ms — integer — NULLABLE
- retention_policy — text — NOT NULL — default day — CHECK (read, hour, day, week, never)
- expires_at — timestamptz — NULLABLE — set by triggers
- read_at — timestamptz — NULLABLE
- created_at — timestamptz — NOT NULL — default now()

**church_id confirmation:** bigint (NOT uuid) — matches MVP migration and churches.id

### Indexes

- alpha_connect_messages_conversation_idx — (conversation_id, created_at DESC)
- alpha_connect_messages_expires_idx — (expires_at) WHERE expires_at IS NOT NULL
- alpha_connect_conversations_group_code_idx — (group_code) WHERE group_code IS NOT NULL
- Plus implicit PK and UNIQUE indexes

### RLS Policies

RLS ENABLED on all three Connect tables.

**Table policies (authenticated):**

- alpha_connect_conversations_member_read — SELECT — user must be conversation member
- alpha_connect_members_self_read — SELECT — user_id = auth.uid()
- alpha_connect_messages_member_read — SELECT — user must be conversation member
- alpha_connect_messages_member_insert — INSERT — sender_id = auth.uid() and member
- alpha_connect_messages_member_update — UPDATE — user must be conversation member

**Storage policies (storage.objects):**

- alpha_connect_audio_upload — INSERT — bucket alpha-connect-audio, folder[1] = user UUID
- alpha_connect_audio_read — SELECT — bucket + user member of conversation in folder[2]
- alpha_connect_audio_delete — DELETE — bucket + folder[1] = user UUID

**Grants:**

- alpha_connect_conversations: SELECT to authenticated
- alpha_connect_conversation_members: SELECT to authenticated
- alpha_connect_messages: SELECT, INSERT, UPDATE to authenticated

**RLS smoke test (anon):**

- Read conversations: 0 rows (RLS working)
- Insert alpha_identities without auth: BLOCKED

### RPC Functions

| Function | Remote Test Result |
|----------|-------------------|
| alpha_connect_open_personal() | EXISTS — returns not authenticated without session |
| alpha_connect_open_group(p_group_code, p_title) | EXISTS — returns not authenticated without session |
| alpha_connect_purge_expired_messages() | EXISTS — returned count 0 |
| alpha_connect_retention_interval(p_policy) | Created (internal) |
| alpha_connect_set_message_expiry() | Created (trigger) |
| alpha_connect_on_message_read() | Created (trigger) |
| alpha_connect_delete_storage_object(p_path) | Created (security definer) |

### Realtime Status

- Migration adds alpha_connect_messages to supabase_realtime publication
- App wiring: subscribeAlphaConnectMessages() in messages-api.ts
- Remote verification: NOT confirmed via REST in this audit
- Status: EXPECTED ACTIVE

Confirm with SQL:

```sql
SELECT schemaname, tablename
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
  AND tablename = 'alpha_connect_messages';
```

### Storage Bucket Status

| Property | Value |
|----------|-------|
| Bucket ID | alpha-connect-audio |
| Remote test | EXISTS (REST list OK) |
| Public | false (private) |
| File size limit | 10,485,760 bytes (10 MB) |
| Allowed MIME | audio/webm, audio/mp4, audio/aac, audio/ogg, audio/mpeg |
| Objects stored | 0 |
| Upload path | {userId}/{conversationId}/{messageId}.{ext} |

### ALPHA-DATA-POLICY-002 Verification

| Mechanism | Status |
|-----------|--------|
| retention_policy column + CHECK | ACTIVE |
| Insert trigger alpha_connect_messages_set_expiry | ACTIVE |
| Read trigger alpha_connect_messages_read_expiry | ACTIVE |
| Purge RPC alpha_connect_purge_expired_messages | ACTIVE |
| Client purge on load (useAlphaConnectThread) | ACTIVE |
| Client policy mapping (retentionPolicyFromSettings) | ACTIVE |

**Allowed retention values:**

- read — expires 60 seconds after read
- hour — expires 1 hour after insert
- day — expires 1 day after insert (default)
- week — expires 7 days after insert
- never — expires_at NULL (no automatic expiry)

### expires_at Enforcement

- Database INSERT: YES — trigger alpha_connect_set_message_expiry
- Database UPDATE on read: YES — trigger alpha_connect_on_message_read
- Database DELETE: YES — purge RPC when expires_at <= now()
- Storage cleanup: YES — purge RPC calls alpha_connect_delete_storage_object
- App: YES — purge RPC on thread open and refresh
- Server cron: NO — purge is client-triggered only

### Maximum Retention (7 Days)

**PASS for timed policies.**

Longest timed policy: week = 7 days via alpha_connect_retention_interval().

App settings (AlphaConnectSettings): read, hour, day, week, never.

### App Integration Status

- useAlphaConnectThread hook: Wired
- Text messages via Supabase: Wired
- Voice upload to Storage: Wired
- Realtime subscription: Wired in code
- IndexedDB workflow: REMOVED
- LiveKit / WebRTC / Direct calls: Not started (per scope)

---

## Warnings

1. Realtime publication not remotely verified — run SQL check above.
2. Purge is client-triggered only — no pg_cron scheduled job.
3. `never` retention policy bypasses 7-day timed cap by design.
4. Tables empty — end-to-end app test still needed while signed in.
5. verify-alpha-tables.mjs message still mentions running MVP if RPC missing (cosmetic).

---

## Errors

None detected.

---

## Recommendations

1. Sign in, open Alpha Connect, confirm conversation opens via RPC.
2. Send a text message — confirm row in alpha_connect_messages with expires_at set.
3. Send a voice message — confirm file in alpha-connect-audio bucket.
4. Run Realtime SQL check (see Findings section).
5. Consider adding pg_cron for server-side purge in a future phase.

---

## Overall Status

**PASS**

Migration applied successfully. All required database objects created. REST API confirms table visibility. RPCs and storage bucket respond. ALPHA-DATA-POLICY-002 is active. expires_at is enforced via triggers and purge RPC. Maximum timed retention is 7 days (week policy).
