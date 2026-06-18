# Call Screen Audio Picker Parity — Alpha Connect

**Date:** 2026-06-17

---

## Executive Summary

Applied channel-style audio output picker (`ConnectAudioOutputControl` + `useConnectAudioOutput`) to **personal call** and **call** screens. Replaced separate speaker/bluetooth toggle buttons with one control that opens the compact device list.

---

## Findings

### Updated screens

| Route | Change |
|-------|--------|
| `/personal-call` | Single speaker control (`call-grid`); removed legacy device sheet |
| `/call` | Single speaker control (`call-compact`); 4-column grid |
| `alpha-connect` individual mode | Audio device scan enabled alongside channels |

### New control variants

- `call-grid` — 58×58px buttons (personal call)
- `call-compact` — 48×48px buttons (call screen)

### Shared behavior

- Tap speaker → mini picker (earpiece, loudspeaker, AirPods/BT/watch if detected)
- Menu item «اختيار مخرج الصوت» opens same picker on personal call

---

## Warnings

None new.

---

## Errors

None — build passes.

---

## Recommendations

None.

---

## Overall Status

**PASS**
