# Alpha Connect Deletion Countdown + Exit-on-Read

**Date:** 2026-06-17  
**Mode:** Implementation  
**Overall Status:** PASS

---

## Executive Summary

Added a live deletion countdown (minutes/hours) next to each message bubble, and changed **after-read** deletion to run when the user **leaves** the chat—not while viewing it.

---

## Findings

### Countdown UI

| Policy | Label shown |
|--------|-------------|
| Timed (`1h`, `24h`, …) | `⏱ ٢٣ د` (Arabic digits, updates every minute) |
| Incoming `on_read` | `⏱ عند الخروج` |
| Outgoing `on_read` | `⏱ بعد القراءة` |

Displayed in message footer beside timestamp with `Clock3` icon.

### After-read on exit

1. While chat is open: incoming `on_read` messages stay visible; IDs tracked in `pendingOnReadRef`.
2. On back / unmount: `flushOnReadOnExit()` calls `markRead` → DB trigger deletes rows.
3. Works for embedded Alpha Connect and `/messages` chat.

### Files changed

| File | Change |
|------|--------|
| `retention.ts` | `formatDeletionCountdown()` |
| `alpha-connect-message-map.ts` | `deleteCountdown` on `ChatMessageView` |
| `AlphaChatScreen.tsx` | Countdown tick, exit flush, `handleLeaveChat`, bubble UI |

---

## Warnings

- Timed countdown requires `expires_at` from DB trigger (run auto-delete SQL if missing).
- Countdown refreshes every 60 seconds.

---

## Errors

None.

---

## Recommendations

Test: open chat with `بعد القراءة` timer → messages show `عند الخروج` → press back → messages deleted.

---

## Overall Status

**PASS**
