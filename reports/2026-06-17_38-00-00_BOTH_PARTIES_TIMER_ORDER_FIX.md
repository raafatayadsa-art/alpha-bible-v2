# Both Parties Skip Auto-Delete System Message

**Date:** 2026-06-17  
**Overall Status:** PASS

---

## Executive Summary

Chat messages from **both parties** now appear **after** the auto-delete system message in chronological order, and both incoming/outgoing messages sent after timer activation share the same countdown and auto-delete policy.

---

## Changes

1. **Chronological sort** — DB messages + system message merged by `orderedAt`; old messages stay above, system message in the middle, new messages below.
2. **`activeRetentionPolicy`** — Applied to all messages with `created_at >= timerAnchorMs` (sender and receiver).
3. **Removed duplicate static timer banner** at bottom of chat (system 🕒 message is the single anchor).

---

## User Flow

1. Older messages (both parties) → shown **above** auto-delete notice  
2. User picks timer → 🕒 system message inserted at that moment  
3. New messages (both parties) → appear **below** system message with seconds countdown and auto-delete  

---

## Overall Status

**PASS** — build green.
