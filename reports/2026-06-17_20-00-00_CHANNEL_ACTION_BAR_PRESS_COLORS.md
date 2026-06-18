# Channel Action Bar Press Colors — Alpha Connect

**Date:** 2026-06-17

---

## Executive Summary

Enabled per-button press and toggle colors on the Connect **channel screen** action bar (`ConnectChannelActionBar`): mute, speaker, record, invite, and channel settings. Each button now shows its semantic color on `:active` press; mute and speaker also retain color when toggled on.

---

## Findings

### Component (`ConnectChannelsUI.tsx`)

- Refactored actions with `tone`: `mute` | `speaker` | `record` | `invite` | `settings`
- Added BEM classes: `connect-action-bar-btn`, `__ring`, `__icon`, `__label`
- Toggle state: `connect-action-bar-btn--on`
- Mute icon switches `Mic` / `MicOff` by state

### Press / toggle colors

| Button | Press color | Toggled-on color |
|--------|-------------|------------------|
| كتم الصوت | Red | Red (muted) |
| سماعة | Green | Green (speaker on) |
| تسجيل | Red dot glow | — (soon/disabled) |
| دعوة | Neon blue | — |
| إعدادات القناة | Forest green | — |

### CSS (`styles.css`)

- Dark Connect theme + Classic theme variants
- Ring border, background, glow, icon and label color on `:active` and `--on`

---

## Warnings

- Record button remains disabled (`قريباً`); press styling applies only if enabled later.

---

## Errors

None — build passes.

---

## Recommendations

Visual QA on channel screen in both Connect themes (dark + Classic).

---

## Overall Status

**PASS**
