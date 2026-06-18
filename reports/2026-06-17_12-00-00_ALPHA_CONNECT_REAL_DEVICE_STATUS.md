# Alpha Connect Real Device Status Implementation

## Executive Summary

Replaced all hardcoded Alpha Connect status indicators (battery, connection quality, encryption) with a live **AlphaConnectStatusEngine** backed by device APIs, network APIs, Supabase auth/health checks, and the existing `alpha_user_presence` realtime store. Build passes.

## Findings

### New modules

| File | Purpose |
|------|---------|
| `src/features/alpha-connect/status/types.ts` | Shared status types |
| `src/features/alpha-connect/status/capacitor-bridge.ts` | Optional Capacitor Network/Device (native shell only) |
| `src/features/alpha-connect/status/device-battery.ts` | Battery read + listeners |
| `src/features/alpha-connect/status/network-connection.ts` | Connection quality + listeners |
| `src/features/alpha-connect/status/security-check.ts` | HTTPS + Supabase + auth session |
| `src/features/alpha-connect/alpha-connect-status-engine.ts` | Central engine + tone helpers |
| `src/features/alpha-connect/useAlphaConnectStatus.ts` | Combined + granular hooks |
| `src/features/alpha-connect/useDeviceStatus.ts` | Re-export |
| `src/features/alpha-connect/useConnectionStatus.ts` | Re-export |
| `src/features/alpha-connect/useSecurityStatus.ts` | Re-export |

### APIs used

| Domain | Web fallback | Native (when Capacitor shell present) |
|--------|--------------|--------------------------------------|
| Battery | `navigator.getBattery()` + `levelchange` / `chargingchange` | `@capacitor/device` `getBatteryInfo()` |
| Network | `navigator.onLine`, `online`/`offline`, Network Information API (`connection.rtt`, `downlink`, `effectiveType`, `type`) | `@capacitor/network` `getStatus()` + `networkStatusChange` |
| Encryption | `window.location.protocol`, `supabase.auth.getSession()`, lightweight `alpha_user_presence` probe | Same |
| Presence | Existing `presence.ts` + `alpha_user_presence` realtime | Same |

### Mock values removed

| Location | Before | After |
|----------|--------|-------|
| `StatusStrip` (`alpha-connect.tsx`) | `"ممتاز"`, `"مفعل"`, `"85%"` | Live connection/security/battery |
| `AlphaConnectSettings` live panel | Random interval `{ ping: 26, packetLoss: 0.18, signal: 94 }` | Real RTT, derived signal, derived packet loss |
| `ConnectChannelsUI` `SignalBars` | Fixed green bars | Bars from `signalStrength` |
| `alpha-trust-shield-content.ts` | `"≈ 26 ms"`, static encryption | Live RTT, security label, connection quality |
| `AlphaChatScreen` security sheet | `"مفعّل"`, static badge | Live encryption + auth state |
| `IndividualProfileCard` subtitle | Static `"جاهز للاستماع والتحدث"` | Presence-driven subtitle |

### UI wired

- `src/routes/alpha-connect.tsx` — `StatusStrip`, presence subtitle
- `src/components/alpha/AlphaConnectSettings.tsx` — live stats panel
- `src/components/alpha/ConnectChannelsUI.tsx` — signal bars
- `src/components/alpha/alpha-trust-shield-content.ts` — trust rows
- `src/components/alpha/AlphaTrustShield.tsx` — passes live snapshot
- `src/components/alpha/AlphaChatScreen.tsx` — security sheet

### Security state logic

- **مشفّر (encrypted):** HTTPS + Supabase reachable + valid session + authenticated user
- **تحذير (warning):** Online but missing one requirement
- **غير متصل (offline):** Browser offline or Supabase unreachable

### Real-time updates

- Battery: event listeners + 60s poll
- Connection: online/offline + Network Information change + Capacitor network events + 30s poll
- Security: auth state change + auth context events + 45s poll (after connection refresh)
- Presence: existing realtime subscription on `alpha_user_presence`

## Warnings

- `navigator.getBattery()` is deprecated and unavailable in some browsers (Safari iOS) — label shows **غير متاح** when unsupported.
- Capacitor packages are **not installed** in `package.json`; native bridge activates only when `window.Capacitor.isNativePlatform()` is true and plugins exist at runtime.
- Packet loss is **derived** from RTT/quality when WebRTC stats are unavailable (not fake-random).

## Errors

None. `npm run build` — **PASS**.

## Recommendations

1. Add `@capacitor/core`, `@capacitor/network`, `@capacitor/device` when shipping native iOS/Android shells.
2. Bulk-fetch peer presence on conversation open to reduce `DEMO_SEED` fallback for unauthenticated demo users.
3. Feed active voice channel WebRTC stats into connection engine during calls for true packet-loss metrics.

## Overall Status

**PASS**
