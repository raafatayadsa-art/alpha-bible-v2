/**
 * iOS-native-style haptics for Alpha Messages.
 * Web: ultra-short Vibration API pulses (no long / Android-style patterns).
 */

let lastPulseAt = 0;

function canVibrate(): boolean {
  return typeof navigator !== "undefined" && typeof navigator.vibrate === "function";
}

/** Debounce rapid-fire (picker scroll) while keeping each step perceptible. */
function pulse(pattern: number | number[], minGapMs = 24) {
  if (!canVibrate()) return;
  try {
    const now = performance.now();
    if (now - lastPulseAt < minGapMs) return;
    lastPulseAt = now;
    navigator.vibrate(pattern);
  } catch {
    /* unsupported */
  }
}

/** Timer picker — each option step (light impact). */
export function hapticLightImpact() {
  pulse(1, 20);
}

/** Toggles — mute, hidden chats, Face ID, switches. */
export function hapticSelection() {
  pulse(3, 16);
}

/** Hide / delete conversation, start reset code. */
export function hapticMediumImpact() {
  pulse(8, 40);
}

/** Final destructive confirms — clear chat, reset code, delete forever. */
export function hapticWarning() {
  pulse([8, 22, 8], 80);
}

/** Send message, save edit. */
export function hapticLightTap() {
  pulse(2, 12);
}
