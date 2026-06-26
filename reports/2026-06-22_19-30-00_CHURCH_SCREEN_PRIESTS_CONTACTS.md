# Church Screen — Priests, Phones & Email from DB

## Executive Summary

Connected the member church screen (`/church`) to full contact fields from the `public.churches` table: responsible priest names, phone, WhatsApp, email, and web/social links. Data now flows through `fetchChurchDashboard` and appears in the hero card and call/message popups.

## Findings

- **`churches.priests`** — Full text (often multiple names/lines) is now exposed as `priestsFull` on `ChurchDashboardRecord` and shown in the hero card with `whitespace-pre-line`.
- **`phone` / `whatsapp`** — Already selected via `CHURCHES_DIRECTORY_SELECT`; now surfaced in a dedicated “التواصل مع الكنيسة” row with tap-to-call / WhatsApp links.
- **`email` + URLs** — `email`, `website_url`, `facebook_url`, `youtube_url`, `church_url` mapped in dashboard API and shown as contact chips.
- **Popups** — When no `church_roles` contacts exist, “اتصال Alpha” and “رسائل Alpha” fall back to church-level phone, WhatsApp, and email.

## Warnings

- Priest display still prefers `church_roles` primary priest for avatar/name when roles exist; `priestsFull` from the table is shown as the authoritative list in the hero body.
- Social link labels (Facebook, YouTube) are English short labels on chips; full URLs remain in directory detail view.

## Errors

- None. Production build: **PASS**.

## Recommendations

- Verify on a real membership account that `churches` rows have populated `priests`, `phone`, and `email` for the linked church.
- Optionally sync `church_roles` from directory imports so Alpha Connect leader popups show named priests with app messaging.

## Overall Status

**PASS**

## Files Changed

| File | Change |
|------|--------|
| `src/features/church/church-dashboard-api.ts` | Extended `ChurchDashboardRecord`; map email/URLs/priestsFull from row |
| `src/routes/church.tsx` | Hero contact row, full priest text, popup fallbacks |
