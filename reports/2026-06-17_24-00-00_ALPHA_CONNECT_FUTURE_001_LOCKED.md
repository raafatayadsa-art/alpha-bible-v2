# ALPHA-081 / ALPHA-CONNECT-FUTURE-001 — Future Communication Architecture

**Date:** 2026-06-17  
**Ticket:** ALPHA-081  
**Reference:** ALPHA-CONNECT-FUTURE-001  
**Status:** Discussed — **Locked / Not Active**  
**Activation:** Future Release Only

---

## Executive Summary

This report registers the **locked future planning note** for Alpha Connect communication architecture. Per the note: **no implementation, database, UI, APIs, or permissions** for these items until a future release decision after core Alpha Connect reaches production stability.

---

## Findings

### Locked future scope (do not build now)

| Area | Summary |
|------|---------|
| Public communities | «Coming Soon» — max ~20 members, limited permissions (future only) |
| Contact request system | Member A → request → Member B accepts → then messages/calls |
| Cross-church discovery | Via comments, prayer requests, activities (future) |
| Connected presence | Online status, activity, current channel for approved contacts (future) |
| Privacy controls | Who can send contact requests (future, undecided) |

### Active today (church channels — not part of FUTURE-001 lock)

Current codebase already supports **church channel** member invite (priest/servant managed):

- `ConnectChannelInviteSheet` — «دعوة أعضاء للقناة»
- Channel action bar — زر «دعوة»
- Invite policy in `ConnectChannelSettings` — «من يستطيع دعوة أعضاء»
- Deep link / QR via `ConnectChannelQrBadge`

This is **official church channel** communication, aligned with the doc’s «Church Channels» section — not the locked «Contact Request System» or «Public Communities».

### Church leadership vs member-to-member

| Path | Status in doc |
|------|----------------|
| Priest / servant / church profile | Official — existing church surfaces |
| Regular member ↔ member without approval | **Future** — contact requests required |
| Public user creating channels | **Not allowed** (now and in doc) |

---

## Warnings

- Do **not** conflate **channel member invite** (active UI mock/local state) with **contact requests** (locked).
- Do **not** add «Coming Soon» public communities UI unless product explicitly requests a placeholder in a future sprint.

---

## Errors

None — documentation-only registration.

---

## Recommendations

1. Keep FUTURE-001 in `reports/` or move to `docs/alpha-connect/` when a docs folder is established.
2. Revisit after Alpha Connect core (voice, channels, DB wiring) is production-stable.
3. When activating contact requests, start with schema + privacy decision before UI.

---

## Overall Status

**PASS (locked note registered — zero implementation)**

---

## COPYABLE LOCK NOTICE

```
ALPHA-CONNECT-FUTURE-001 — LOCKED
Do not implement: contact requests, public communities, cross-church discovery,
connected presence, privacy controls for requests.
Church channel invite (existing) remains separate and in scope for current Alpha Connect.
```
