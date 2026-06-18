# Audio Output Device Picker — Alpha Connect

**Date:** 2026-06-17

---

## Executive Summary

Speaker button on the channel screen now opens a **compact device picker** (iPhone-style) listing phone earpiece, external speaker, and connected outputs (AirPods, Bluetooth headphones, Apple Watch, wired headsets). Selection is shared via `useConnectAudioOutput` and `ConnectAudioOutputControl` for reuse on any audio route button.

---

## Findings

### New components

| File | Role |
|------|------|
| `ConnectAudioOutputPicker.tsx` | Mini popover menu above speaker button |
| `ConnectAudioOutputControl.tsx` | Reusable button + picker (`action-bar` / `voice-footer`) |

### Device discovery (`connect-audio-output.ts`)

- Built-ins: سماعة الهاتف, السماعة الخارجية
- `enumerateDevices()` for `audiooutput` after mic permission unlock
- Label classification: bluetooth, watch, wired, earpiece, speaker, external
- `devicechange` listener refreshes list
- `applyConnectAudioSink()` via `HTMLMediaElement.setSinkId` when supported

### Integration

- `ConnectChannelActionBar` — speaker slot uses `ConnectAudioOutputControl`
- `VoiceControl` — same control (messages/voice footer variant)
- Single hook state: `selection`, `devices`, `pickerOpen`, `openPicker`, `selectDevice`

---

## Warnings

- iOS Safari may limit `audiooutput` enumeration until mic permission; list improves after PTT use.
- Native routing on iOS may still follow OS policy; `setSinkId` works on Chrome/Android/desktop.

---

## Errors

None — build passes.

---

## Recommendations

- Reuse `ConnectAudioOutputControl` on `call.tsx` / `personal-call.tsx` for full app parity.
- Wire `registerPlaybackElement` when inbound voice playback UI ships.

---

## Overall Status

**PASS**
