# Membership Barcode Card — Reference Layout Fix

## Executive Summary

Resized and restructured the membership QR card to match the reference mockup: smaller barcode, golden beveled frame, correct component order (shield · text · QR), and labeled membership fields.

## Findings

- New `MembershipBarcodeCard.tsx` extracted from profile screen.
- **Layout:** `dir="ltr"` on card for reference order — shield left · info center · QR right.
- **QR:** reduced to **46×46px** inside **3px golden gradient bevel frame** + white inset.
- **Shield:** `lg` (48px) with pulse — proportional to compact card height.
- **Text block:** بطاقة العضوية · role · رقم العضوية · ID · حالة العضوية · compact «نشط» pill.
- Card padding tightened (`px-3 py-2.5`, `rounded-[20px]`).

## Warnings

None.

## Errors

None. `npm run build` — PASS.

## Recommendations

- Optional laurel SVG behind shield for pixel-perfect reference match.

## Overall Status

**PASS**
