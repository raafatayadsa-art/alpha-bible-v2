# Alpha Connect Classic Light Theme

**Date:** 2026-06-16  
**Scope:** Dual-theme system — Secure (dark) + Classic (light)

---

## Executive Summary

Added **Alpha Connect Classic** as a complete light theme alongside the unchanged **Alpha Connect Secure** dark theme. Users switch instantly from Settings → المظهر; preference persists in `alpha_connect_settings_v2`.

---

## Findings

1. **Architecture** — Modifier class `.alpha-connect-theme--classic` on existing `.alpha-connect-theme` scope; dark tokens untouched.
2. **Color system** — Ivory app bg `#F7F4EC`, cards `#FFFFFF`, borders `#E7E2D8`, gold accent `#C9A227`, soft shadows `0 4px 12px rgba(0,0,0,0.08)`.
3. **Settings** — New `theme: 'secure' | 'classic'` field; visual picker with instant save + toast.
4. **Coverage** — Glass cards, header, mode tabs, popups, drawers, chat bubbles, Trust Shield, logo gold glow, presence dots.
5. **Routes** — `alpha-connect.tsx`, `call.tsx`, `personal-call.tsx` use `getAlphaConnectFrameClass()`.

---

## Warnings

- Some inline dark hex in components still rely on CSS overrides in classic mode; future edits should prefer CSS variables.
- Call screens read theme at mount; re-open after switching if already on a call route.

---

## Errors

None — `npm run build` PASS.

---

## Recommendations

1. Open Alpha Connect → Settings → المظهر → tap Classic → verify instant ivory UI.
2. Switch back to Secure → confirm dark neon restored.
3. Test channels drawer, messages chat, and Trust Shield in both themes.

---

## Overall Status

**PASS**

---

## Key Files

| File | Role |
|------|------|
| `src/components/alpha/alpha-connect-theme.ts` | Theme types, frame class helper, event |
| `src/components/alpha/styles.css` | Classic token overrides (~280 lines) |
| `src/components/alpha/AlphaConnectSettings.tsx` | Theme picker UI |
| `src/features/alpha-connect/presence.ts` | Unified status colors |
