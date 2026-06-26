# ALPHA-099 — Alpha Connect & Nearby Members System

**Date:** 2026-06-18  
**Status:** Approved Idea → **v1 Implementation**  
**Build:** verify after implementation

---

## Executive Summary

Implemented **ALPHA-099 v1**: GPS-based nearby member discovery inside Alpha Connect, mutual connection requests, privacy opt-in, and post-accept messaging handoff — without changing the approved 5-tab bottom navigation. Bluetooth is marked **قريباً** (phase 2).

---

## Findings

### Database (`supabase/migrations/20250618190000_alpha_nearby_members.sql`)
- `profiles` (if missing) — display name + avatar for discovery cards
- `alpha_user_discovery_prefs` — opt-in, location heartbeat, who_can_discover
- `alpha_connect_connection_requests` — pending / accepted / rejected
- `alpha_connect_contacts` — bilateral contacts after accept
- RPCs: `alpha_upsert_discovery_location`, `alpha_nearby_members`, `alpha_send_connection_request`, `alpha_respond_connection_request`

### Feature module (`src/features/nearby-members/`)
- GPS discovery with haversine query (same church, 2km default, 20min freshness)
- Connection request flow → accept → `alpha_connect_open_direct` + contacts
- Privacy: default **off** (opt-in banner)

### UI wiring
| Surface | Change |
|---------|--------|
| `/alpha-connect/nearby` | Full nearby screen (list, search, opt-in, connection actions) |
| `alpha-connect.tsx` Calls tab | Entry card «الأعضاء القريبون» |
| `AlphaConnectSettings` | «الظهور للأعضاء القريبين» + «من يستطيع اكتشاف حسابي» |

### Connection flow (implemented)
1. View: photo, name, shield, church, distance, Alpha ID
2. **إرسال طلب اتصال**
3. Other party: **قبول / رفض**
4. On accept: contacts + open direct chat via Alpha Connect messages

### Privacy & safety (v1)
- No phone sharing in nearby UI
- Alpha ID only (`deriveAlphaIdShort`)
- Same-church scoping in RPC
- Respects `alpha_user_presence.status = hidden`
- Opt-in discovery (default off)
- Disable visibility from nearby screen or Connect settings

---

## Warnings

1. **Run SQL on Supabase** — `supabase/migrations/20250618190000_alpha_nearby_members.sql` (or copy into SQL Editor + `notify pgrst, 'reload schema'`)
2. **Bluetooth** — UI placeholder only; no Web BLE / Capacitor plugin yet
3. **Two devices + two accounts** needed for end-to-end QA
4. **FUTURE-001** contact-request lock superseded by approved ALPHA-099 — same-church only, no cross-church discovery
5. RLS is dev-friendly; tighten before production location exposure

---

## Errors

None expected at build time if route tree regenerates.

---

## Recommendations

1. Apply migration to remote Supabase
2. Phase 2: Capacitor BLE proximity for indoor church halls
3. Push notifications for incoming connection requests
4. Sync `nearbyDiscoverable` from Connect settings save → `saveDiscoveryPrefs`
5. Member QR scan route `/alpha-connect/scan` as QR-less alternative complement

---

## Overall Status

**PARTIAL** — Core v1 implemented; requires DB migration + multi-device QA.

---

## Key paths

- `supabase/migrations/20250618190000_alpha_nearby_members.sql`
- `src/features/nearby-members/**`
- `src/routes/alpha-connect.nearby.tsx`
- `src/routes/alpha-connect.tsx` (entry card)
- `src/components/alpha/AlphaConnectSettings.tsx`
