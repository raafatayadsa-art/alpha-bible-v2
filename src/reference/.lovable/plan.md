
# Alpha Bible — Daily Church Home (Mobile UI Prototype)

One static, RTL Arabic mobile screen sized for iPhone 15/16 Pro (393×852), matching the reference image. UI only — all data flows through typed placeholder props so a future project can wire Supabase via Cursor without touching layout.

## Scope

- Single route: `/` replaces the placeholder in `src/routes/index.tsx`.
- Mobile-only canvas: centered 393px-wide frame on any viewport, RTL (`dir="rtl"`), Arabic font (Cairo or Tajawal via Google Fonts `<link>` in `__root.tsx`).
- iOS safe areas: top padding for Dynamic Island/status bar, bottom padding for home indicator + floating tab bar.
- No backend, no auth, no DB, no real handlers. Buttons are visual only.

## Design System (added to `src/styles.css` via `@theme`)

Premium light theme tokens (oklch):
- `--background` warm beige `oklch(0.985 0.008 80)`
- `--card` near-white with warmth
- Accent tokens for each card type: `--urgent` (soft red), `--meeting` (soft blue), `--trip` (soft green), `--prayer` (soft purple), `--celebration` (soft gold), `--condolence` (deep charcoal), plus `-foreground` and `-soft` (tinted glass bg) variants for each.
- Shared: `--glass` (white 60% + blur), `--shadow-luxe` elegant layered shadow, `--radius` 1.5rem.
- Typography: Cairo for display, Tajawal for body. Loaded via `<link>` in `__root.tsx`; family names registered as `--font-display` / `--font-body` in `@theme`.

All component styles use these semantic tokens — no hard-coded colors.

## Component Architecture (`src/components/alpha/`)

Every component takes typed props mirroring the future Supabase shape. Types live in `src/components/alpha/types.ts`:

```
Church, Priest, Member, Comment,
UrgentPost, MeetingPost, TripPost, PrayerPost, CelebrationPost, CondolencePost
```

Components:
- `PhoneFrame.tsx` — 393px RTL container with safe-area padding.
- `ChurchHeaderCard.tsx` — cover image, church name, priest row, status pill, member/servant/priest counts, two floating glass buttons (Call, Alpha Messages).
- `CategoryRow.tsx` + `CategoryChip.tsx` — horizontal scroll, 7 chips (عاجل، اجتماعات، رحلات، طلبات صلاة، تهنئة، تعزية، تأملات), each with its own icon + accent.
- `FeedCard.tsx` — shared shell (image left, content right, type pill top, peeking next-card behavior via horizontal carousel or via card width ~92% with overflow hint). The feed itself is a vertical stack; the *category row* uses Apple-style peeking. Per spec "cards must not occupy full width, show ~10% of next card" — I will apply this to a secondary horizontal section per type would distort layout, so I'll keep the reference's vertical feed and instead apply the peek effect to the category row and to a small "upcoming" horizontal sub-row inside Meeting/Trip if it fits cleanly. Confirm at build time; default = vertical feed exactly like reference.
- `UrgentCard.tsx`, `MeetingCard.tsx`, `TripCard.tsx`, `PrayerCard.tsx`, `CelebrationCard.tsx`, `CondolenceCard.tsx` — each composes `FeedCard` shell + type-specific body (trip seat stats grid, prayer counts, etc.).
- `CommentBox.tsx` — premium glass row: avatar, name, text, time. Used inside every card (max 2).
- `MemberStack.tsx` — overlapping avatar stack + `+N`.
- `ActionButton.tsx` — single component, identical size/shape, `variant` prop switches color per card type. Positioned to slightly overhang the card's bottom edge (Apple floating style).
- `BottomTabBar.tsx` — 5 tabs (الرئيسية active, الصلاة، الروحيات، المكتبة، الملف الشخصي), glass blur, safe-area aware.

## Placeholder Data

`src/components/alpha/sample-data.ts` exports one object per card matching the typed shape. Index route imports it and passes into components. Images: generate 7 images with `imagegen` (church cover, priest portrait, cross/candles for urgent, youth meeting room, bus, praying hands, birthday cake, lily/condolence) saved to `src/assets/` and imported. Member avatars: small generic portraits — use a single generated "avatar sheet" or solid-color initials circles to avoid 30+ image calls. Plan: initials-on-gradient avatars (pure CSS) for member stacks; only the 7 hero images are generated.

## Files to create / change

- `src/styles.css` — add tokens, font registration.
- `src/routes/__root.tsx` — add Google Fonts `<link>`, set Arabic-friendly meta title.
- `src/routes/index.tsx` — replace placeholder with `<PhoneFrame>` composing all sections.
- `src/components/alpha/` — types, sample data, 13 components above.
- `src/assets/` — 7 generated images + JSON pointers.

## Out of Scope (per user)

No Supabase, no auth, no server functions, no routing beyond `/`, no real button behavior, no dark mode, no tablet/desktop layout.
