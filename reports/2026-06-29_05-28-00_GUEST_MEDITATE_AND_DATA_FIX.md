# Guest Meditate Button + Guest Data Hygiene

## Executive Summary

Restored the **تأمّل** button on the verse hero card for all users (including guests). Fixed stale account data (old avatar, profile, community caches) persisting when continuing as guest by wiping user-scoped localStorage on guest entry and once per guest tab session.

## Findings

1. `PremiumVerseHeroCard` hid meditate via `hideMeditate={!personalOn}` and blocked the handler for guests.
2. `enterGuestMode()` only signed out — it did not clear `ab:profile-user`, community, or friends keys.
3. Home screen showed full personalized UI (greeting with name, Alpha Connect, church news) for unauthenticated guests.

## Changes

| File | Change |
|------|--------|
| `PremiumVerseHeroCard.tsx` | Restored meditate button + local engagement for everyone; save still requires login |
| `guest-mode.ts` | Clear user-scoped data on guest entry; `ensureGuestSessionHygiene()` per tab |
| `auth-context.ts` | Run guest hygiene when signed out; clear guest flag on login |
| `home.tsx` | Guest UI: generic greeting, hide notifications, Alpha Connect, smart context, church sections |

## Warnings

- Guest meditate uses local hero engagement counters only (not journal).
- First guest visit in a tab clears personal caches once; re-login restores from cloud.

## Errors

None — build PASS (~72s).

## Overall Status

**PASS**
