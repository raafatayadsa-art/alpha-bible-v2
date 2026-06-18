# Alpha Connect Send Button — Forensic Analysis

**Date:** 2026-06-17  
**Mode:** READ ONLY  
**Overall Status:** PARTIAL (static trace complete; runtime not instrumented)

---

## Executive Summary

The Alpha Connect chat send path is **only wired through `AlphaChatScreen`**. `AlphaConnectMessageThread` is display-only and **not used** in the live send flow. Static analysis shows **three hard gates** before any Supabase insert runs. The most probable failure point when Send appears dead is **`conversationId` never being set** during thread bootstrap (auth cache empty or conversation-open RPC failure), causing `sendMessageToThread` to return early **before** `sendAlphaConnectTextMessage` / DB insert execute.

---

## Findings

### Active UI entry point

| Component | Role in send flow |
|-----------|-------------------|
| **`AlphaChatScreen`** | **ACTIVE** — owns send button, composer, handlers, `useAlphaConnectThread` |
| **`AlphaConnectMessageThread`** | **NOT IN SEND PATH** — read-only message list; no send button; **zero imports** from `alpha-connect.tsx` or `AlphaMessagingSystem` |
| **`useAlphaConnectThread`** | **ACTIVE** — thread bootstrap + `sendText()` |
| **`messages-api.ts`** | **ACTIVE** — `openAlphaConnectConversation`, `sendAlphaConnectTextMessage` |

Alpha Connect embeds chat at:

```807:818:src/routes/alpha-connect.tsx
            <AlphaChatScreen
              embedded
              hideHeader
              profile={openChatConv}
              onBack={() => setOpenChatConv(null)}
              onShowToast={showConnectToast}
            />
```

---

### Exact send button component

**File:** `src/components/alpha/AlphaChatScreen.tsx`  
**Element:** native `<button type="button">` (not `@/components/ui/button`)  
**Class:** `connect-chat-send-btn`  
**Icon:** `SendHorizontal` (Lucide)  
**Location:** Composer footer, RTL layout (send button is on the **right** side of composer)

```572:586:src/components/alpha/AlphaChatScreen.tsx
              <button
                type="button"
                aria-label={editingId ? "حفظ التعديل" : "إرسال الرسالة"}
                disabled={!input.trim() || thread.sending || thread.loading}
                onClick={() => void handleSend()}
                className={`connect-chat-send-btn grid h-10 min-w-[48px] ...`}
              >
                {editingId
                  ? <Check className="size-[17px]" />
                  : <SendHorizontal className="size-[18px] rtl:-scale-x-100" />}
              </button>
```

**Disabled when:**
- `input` is empty/whitespace
- `thread.sending === true`
- `thread.loading === true`

When disabled: **`onClick` does not fire** (browser + `disabled:pointer-events-none` behavior on disabled buttons).

---

### Full click flow (step-by-step)

```
[1] BUTTON — <button.connect-chat-send-btn>
      ↓ onClick (only if NOT disabled)
[2] handleSend() — AlphaChatScreen.tsx:237
      ↓ input.trim() empty? → EARLY RETURN (no op)
      ↓ editingId? → local edit branch (not send)
      ↓ await sendMessageToThread(text)
[3] sendMessageToThread() — AlphaChatScreen.tsx:222
      ↓ thread.loading? → toast "جاري فتح المحادثة..." → return false
      ↓ !thread.conversationId? → toast error → return false  ⚠️ GATE
      ↓ await thread.sendText(body, retention)
[4] sendText() — useAlphaConnectThread.ts:98
      ↓ !getAuthUserSync()?.id? → return false (silent)  ⚠️ GATE
      ↓ !conversationId? → return false (silent)
      ↓ !body.trim()? → return false
      ↓ await sendAlphaConnectTextMessage({...})
[5] sendAlphaConnectTextMessage() — messages-api.ts:173
      ↓ supabase.from("alpha_connect_messages").insert(...).select().single()
[6] Supabase PostgREST INSERT (no RPC for send)
      ↓ RLS: alpha_connect_messages_member_insert
[7] PostgreSQL table public.alpha_connect_messages
      ↓ AFTER INSERT trigger (if migration applied): touch conversation updated_at
[8] Realtime — subscribeAlphaConnectMessages → refresh() → UI update
```

---

### Per-step forensic status (static analysis)

| Step | Name | Executed on Send click? | Throws? | Returns | Notes |
|------|------|-------------------------|---------|---------|-------|
| 1 | Send button | **Conditional** | No | N/A | **Not executed** if `disabled` (empty input, `thread.loading`, or `thread.sending`) |
| 2 | `handleSend` | **Yes** if button enabled | No | void | Early exit if `!input.trim()` |
| 3 | `sendMessageToThread` | **Yes** if handleSend runs | No | `false` if gated | **Stops here** if `!conversationId` or `loading` |
| 4 | `thread.sendText` | **Only if step 3 passes** | Caught internally | `true`/`false` | Silent `false` if `getAuthUserSync()` null |
| 5 | `sendAlphaConnectTextMessage` | **Only if step 4 passes** | **Yes** → caught in sendText | Message row or throw | PostgREST insert, not RPC |
| 6 | Supabase insert | **Only if step 5 runs** | RLS/validation error | row / error | Requires membership + `sender_id = auth.uid()` |
| 7 | DB row | **Only if insert succeeds** | Trigger errors rare | 1 row | `kind='text'`, retention_policy from timer |
| 8 | Realtime refresh | **After successful insert** | No | N/A | Also runs `refresh()` directly after send |

---

### Bootstrap flow (runs BEFORE send — determines `conversationId`)

On `AlphaChatScreen` mount, `useAlphaConnectThread` effect runs **once per profile/scope**:

```46:89:src/features/alpha-connect/useAlphaConnectThread.ts
  useEffect(() => {
    ...
    const user = getAuthUserSync();
    if (!user?.id) {
      setError("سجّل الدخول لاستخدام Alpha Connect");
      setLoading(false);
      return;  // conversationId NEVER SET — no retry on auth load
    }
    ...
    id = await openAlphaConnectConversation("direct", { peerKey, title });
    setConversationId(id);
    ...
  }, [enabled, scope, peerKey, groupCode, groupTitle, initialConversationId]);
```

**Open conversation API** (`messages-api.ts:16-59`):

For `scope === "direct"` (private chats like `priest`, `servant`):

1. `supabase.auth.getUser()` — must return user id
2. RPC `alpha_connect_open_direct(p_peer_key, p_title)` — **requires migration `20250617180000`**
3. **Fallback** if direct RPC fails: RPC `alpha_connect_open_group(p_group_code: "direct:{uid}:{peerKey}")`
4. If both fail → throws → `thread.error` set → **`conversationId` stays `null`**

---

### Auth split (important)

| Function | Auth source | Used where |
|----------|-------------|------------|
| `getAuthUserSync()` | In-memory cache (`cachedUser`) | Thread init, `sendText` senderId |
| `supabase.auth.getUser()` | Live Supabase session | Direct open fallback path only |

**Risk:** Thread init uses **sync cache only**. If chat opens before `AuthBootstrap` finishes, init aborts with "سجّل الدخول" and **never re-runs** when auth later loads (effect deps don't include auth state). Result: permanent `conversationId = null`.

---

### RLS policies (insert path)

From `20250615160000_alpha_connect_mvp.sql`:

**`alpha_connect_messages_member_insert`** — INSERT allowed when:
- `sender_id = auth.uid()`
- User exists in `alpha_connect_conversation_members` for that `conversation_id`

**No INSERT policy** on `alpha_connect_conversations` for clients — conversation creation **must** go through RPC (`alpha_connect_open_direct` or `alpha_connect_open_group`).

If open RPC never succeeded → user not a member → insert fails even if send reaches API.

---

### Realtime

- Per-thread: `subscribeAlphaConnectMessages(conversationId)` — postgres_changes on `alpha_connect_messages` filtered by `conversation_id`
- Publication: `supabase_realtime add table alpha_connect_messages` (in MVP migration)
- **Does not fire** if insert never happens
- **Also:** `sendText` calls `refresh()` after insert regardless of realtime

---

### AlphaConnectMessageThread

- **No send button**
- Props: `messages`, `loading`, `error`, `onMarkRead` — display only
- **Not mounted** in Alpha Connect chat or `/messages` route
- **Irrelevant** to send-button failure

---

## Answers: When I press Send

| Question | Static answer |
|----------|---------------|
| **Does the click fire?** | **Only if** button not disabled (`input` non-empty AND `!thread.loading` AND `!thread.sending`). If `thread.loading` stuck true or input empty → **NO** |
| **Does sendMessage execute?** | There is no `sendMessage`. Chain is `handleSend` → `sendMessageToThread` → `thread.sendText`. **First two run if click fires.** `sendText` runs **only if** `conversationId` is set |
| **Does API execute?** | `sendAlphaConnectTextMessage` runs **only if** `sendText` passes auth + conversationId gates. **Often does NOT run** |
| **Does DB insert happen?** | **Only if** PostgREST insert succeeds (RLS + valid retention_policy). **Often does NOT run** |
| **Does realtime fire?** | **Only after** successful insert (plus manual `refresh()` in sendText) |

---

## Exact failing step (most probable)

### Primary failure: **Step 3 — `sendMessageToThread` gate: `!thread.conversationId`**

**Why `conversationId` is null:**

| Cause | Mechanism |
|-------|-----------|
| **A. Auth cache empty at mount** | `getAuthUserSync()` null → thread init returns early → **no retry** when auth loads |
| **B. Supabase session missing** | `openAlphaConnectConversation` throws "Not authenticated" or RPC `not authenticated` |
| **C. Both open RPCs fail** | `alpha_connect_open_direct` missing + `alpha_connect_open_group` error → catch sets `thread.error` |
| **D. User sees composer but thread still loading** | Button disabled → **click never fires** (user may think send is broken) |

### Secondary failure: **Step 4 — `sendText` silent return (`getAuthUserSync()` null)**

Possible if `conversationId` was set via `profile.conversationId` from list hook but sync cache cleared — **unlikely but silent** (returns `false`, toast shown).

### Tertiary failure: **Step 6 — RLS insert rejection**

If `sender_id` (from cache) ≠ `auth.uid()` or user not in `alpha_connect_conversation_members`:
- Insert throws
- Caught in `sendText` → `setError("تعذّر إرسال الرسالة")` → returns `false`
- Toast: "تعذّر إرسال الرسالة"

---

## Failure decision tree

```
Press Send
├─ Button disabled? (empty input | thread.loading | thread.sending)
│   └─ FAIL @ Step 1 — click NOT executed
├─ handleSend → sendMessageToThread
│   ├─ thread.loading === true
│   │   └─ FAIL @ Step 3 — toast "جاري فتح المحادثة..."
│   ├─ thread.conversationId === null  ← MOST LIKELY
│   │   └─ FAIL @ Step 3 — toast "تعذّر فتح المحادثة..."
│   └─ thread.sendText
│       ├─ getAuthUserSync()?.id missing
│       │   └─ FAIL @ Step 4 — silent false → toast "تعذّر إرسال الرسالة"
│       └─ sendAlphaConnectTextMessage insert
│           ├─ RLS / validation error
│           │   └─ FAIL @ Step 6 — toast "تعذّر إرسال الرسالة"
│           └─ success
│               └─ PASS — refresh + optional realtime
```

---

## Warnings

1. Static analysis only — no runtime logging or Supabase query confirmation in this session.
2. User may perceive "nothing happens" when toast is easy to miss (embedded toast via `showConnectToast` in Alpha Connect).
3. Lock screen (`isLocked && !isAuthenticated`) **replaces entire composer** — send button not rendered at all in locked state.

---

## Errors

None in codebase lint/build from this read-only pass.

---

## Recommendations (analysis only — not implemented)

1. Confirm at runtime: `thread.conversationId`, `thread.loading`, `thread.error` on Send press (React DevTools / console).
2. Confirm Supabase session: `supabase.auth.getUser()` in browser console.
3. Confirm RPCs exist: `alpha_connect_open_direct`, `alpha_connect_open_group`.
4. Check Network tab for `alpha_connect_messages` POST on send — absence confirms failure before Step 6.

---

## Overall Status

**PARTIAL** — Root cause narrowed to pre-insert gates; **`conversationId` bootstrap** is the highest-probability exact failing step.
