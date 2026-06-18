# Channel Speaker Route Cycle — Alpha Connect

**Date:** 2026-06-17

---

## Executive Summary

Channel screen speaker button now cycles audio routes iPhone-style: **phone earpiece → external speaker → Bluetooth (when detected) → earpiece**. Icons and labels update per route (`Ear`, `Volume2`, `Bluetooth`).

---

## Findings

### Cycle logic (`connect-audio-output.ts`)

| Step | Route | Icon | Label |
|------|-------|------|-------|
| Default | `earpiece` | Ear | سماعة الهاتف |
| 1st tap | `speaker` | Volume2 | سماعة خارجية |
| 2nd tap | `bluetooth`* | Bluetooth | بلوتوث |
| 3rd tap | `earpiece` | Ear | سماعة الهاتف |

\*Bluetooth step skipped when no BT audio output detected.

### Bluetooth detection

- `scanBluetoothAudioAvailable()` via `navigator.mediaDevices.enumerateDevices()`
- Label heuristics: bluetooth, airpods, headset, etc.
- Listens to `devicechange`
- Rescan on channel enter and each button press
- Falls back to earpiece if BT disconnects while on `bluetooth` route

### UI updates

- `ConnectChannelActionBar` — dynamic icon/label/tone per route
- `VoiceControl` footer — same route icons/colors
- CSS — `connect-action-bar-btn--bluetooth` (blue accent)

---

## Warnings

- Web browsers may hide BT device labels until mic permission is granted; detection improves after PTT/mic use on some phones.
- Actual OS audio routing (`setSinkId`) not wired yet — UI state + future native hook point.

---

## Errors

None — build passes.

---

## Recommendations

Wire `ConnectAudioRoute` to playback elements via `HTMLMediaElement.setSinkId` when voice playback UI lands.

---

## Overall Status

**PASS**
