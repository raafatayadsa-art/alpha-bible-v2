# Alpha Connect Messaging Fixes — Send, Attachments, Call Log

**Date:** 2026-06-17  
**Overall Status:** PASS

---

## Executive Summary

Fixed three user-reported issues: send button failing silently, attachment buttons not wired, and call-log message button navigating away instead of opening in-app chat.

---

## Findings

### 1. Send button not working

**Root cause:** Direct conversations required `alpha_connect_open_direct` RPC (new migration). When RPC was missing, thread never got `conversationId` and `sendText` returned `false` with no user feedback.

**Fix:**
- `messages-api.ts`: fallback to existing `alpha_connect_open_group` with `direct:{userId}:{peerKey}` when direct RPC unavailable.
- `AlphaChatScreen.tsx`: `sendMessageToThread()` validates loading/conversationId and shows Arabic error toasts on failure.

### 2. Attachment buttons not wired

**Fix:** Hidden file inputs + geolocation in `AlphaChatScreen`:
- **صورة** → gallery picker → DB text message with filename/size
- **الكاميرا** → camera capture → same
- **ملف** → file picker → DB text message
- **الموقع** → `navigator.geolocation` → Google Maps link in message

All attachments persist via `thread.sendText()` (real DB messages, not local-only placeholders).

### 3. Call log message button

**Fix:** `openContactMessage` in `alpha-connect.tsx` now:
- Resolves contact from directory
- Switches to Messages mode
- Opens embedded `AlphaChatScreen` via `setOpenChatConv` (no `/messages` navigation)

---

## Files Modified

- `src/features/alpha-connect/messages-api.ts`
- `src/components/alpha/AlphaChatScreen.tsx`
- `src/routes/alpha-connect.tsx`

---

## Warnings

- Image/file attachments send descriptive text messages (filename, size, map link). Binary upload to storage is not yet implemented (audio bucket is audio-only).
- User must be signed in for send to succeed.

---

## Errors

None — build passed.

---

## Recommendations

1. Apply `20250617180000_alpha_connect_direct_messaging.sql` for dedicated direct RPC (fallback still works).
2. Future: attachments bucket + message kind for rich media.

---

## Overall Status

**PASS**
