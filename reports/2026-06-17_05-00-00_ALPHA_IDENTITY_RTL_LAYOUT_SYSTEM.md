# Alpha Global RTL Identity Layout System

**Date:** 2026-06-17  
**Scope:** Unified identity row layout across Alpha Connect and Messages.

---

## Executive Summary

Introduced a **global RTL identity design system** so avatar, name, shield, role, and presence follow **one visual order** on every screen. Per-component alignment props and hand-built rows were removed in favor of `AlphaIdentityRow` + `alpha-identity-layout.css`.

---

## Findings

### New system

| Asset | Purpose |
|-------|---------|
| `alpha-identity-layout.css` | Global RTL rules, presence dot corner, name+shield unit |
| `alpha-identity-layout.ts` | Class name constants |
| `AlphaIdentityRow.tsx` | Canonical row: avatar → name+shield → subtitle/meta → trailing |
| `.cursor/rules/alpha-identity-rtl.mdc` | Agent rule — no per-screen alignment |

### Canonical order (RTL, right → left)

1. Avatar + presence (bottom-left)
2. Name + Shield (`AlphaUserName`)
3. Subtitle / meta
4. Trailing actions

### `AlphaUserName` changes

- Removed `align` prop and `connect-member-name` per-screen overrides
- Uses `alpha-identity-name` classes only

### Migrated surfaces

- Messages: conversation list, new-chat picker
- Chat header (`AlphaChatScreen`)
- Alpha Connect: profile card, chat header, new chat, callable contacts, call history
- Channels: participant strip, participants drawer, member moderation, invite picker
- Trust shield identity header

### Removed patterns

- `!bottom-0 !right-0 !left-auto` presence overrides on identity avatars
- `className="w-full justify-end"` on `AlphaUserName`
- `dir="ltr"` on `RecentCallerRow` (now unified RTL)
- Duplicate `connect-member-row` CSS in Connect theme

---

## Warnings

- Church routes still use `MemberAvatar` (separate system) — not migrated in this pass
- Profile hero (`profile.index.tsx`) uses custom centered layout — out of Alpha shield row scope
- `AlphaNavHub` drawer identity block not migrated

---

## Errors

None. `npm run build` — PASS.

---

## Recommendations

1. Migrate `AlphaNavHub` and church comment rows to `AlphaIdentityRow` when touching those screens
2. Extend `AlphaIdentityRow` with `as="article"` for swipe cards if needed
3. Enforce rule via PR review: no new hand-built identity flex rows

---

## Overall Status

**PASS**
