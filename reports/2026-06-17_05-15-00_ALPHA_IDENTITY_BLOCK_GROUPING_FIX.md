# Alpha Identity Block Grouping Fix

**Date:** 2026-06-17  
**Scope:** Correct identity grouping — avatar attached to name/shield/role in one block.

---

## Executive Summary

Previous RTL fix split **avatar** and **name/shield** as separate top-level flex children. Correct model: one **`.alpha-identity-block`** containing Avatar + Name + Shield + Role (attached, starting from the right). Only actions/counters/previews sit outside the block.

---

## Findings

1. **`AlphaIdentityRow`** restructured:
   - `.alpha-identity-block` wraps avatar + details (name, shield, role meta)
   - `.alpha-identity-row__secondary` — message preview (non-identity)
   - `.alpha-identity-row__trailing` — controls, time, badges

2. **CSS** — removed flex-1 body column that stretched identity apart; block uses `flex: 0 1 auto` and tight gap.

3. **Cursor rule** updated — documents grouping, not text alignment.

4. **Screen fixes:**
   - `RecentCallerRow` — call time/duration moved to `trailing` (not identity)
   - `IndividualProfileCard` — presence in `meta`; status line in `subtitle`

---

## Warnings

- Profile card shows `subtitle` between identity block and QR — intentional non-identity line

---

## Errors

None (build verified).

---

## Overall Status

**PASS**
