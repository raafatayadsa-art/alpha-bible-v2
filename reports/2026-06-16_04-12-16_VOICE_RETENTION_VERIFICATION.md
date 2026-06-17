# Alpha Connect Voice Retention Verification

**Report generated:** 2026-06-16 04:12:16  
**Question:** Does partial voice/PTT playback trigger Immediate After Listen deletion?  
**Scope:** Alpha Connect voice and PT messages only

---

## Executive Summary

Confirmed from source code: voice and PTT messages are NOT marked consumed when playback starts. Partial playback (10%, 50%) followed by pause, stop, or leaving the screen leaves the message available. Deletion for the on_read policy is triggered only from audio.onended after full playback completes, which then sets read_at and fires the database consume trigger.

**Overall Status: PASS** (matches required behavior)

---

## Findings

### Client: AlphaConnectMessageThread.tsx playVoice()

On play button click:
- Downloads audio and calls audio.play()
- Does NOT call onMarkRead at play start
- Sets listenTargetRef.onMarkRead only when retention_policy is on_read AND message is from another user

Consumption call site (only one for voice):
- audio.onended handler calls target.onMarkRead(message.id)
- No ontimeupdate, onplay, or progress-based consumption

On pause / stop mid-playback (tap play while playing):
- audioRef.current.pause() and setPlayingId(null)
- Does NOT call onMarkRead
- pause() does not fire onended

On unmount / close screen:
- useEffect cleanup: audio.pause() and revokeObjectURL
- Does NOT call onMarkRead

### Client: markAlphaConnectMessageRead()

- Updates read_at in Supabase
- Only invoked for voice via onended path (for on_read incoming messages)

### Database: alpha_connect_on_message_consumed trigger

- Fires AFTER UPDATE OF read_at
- Deletes row + storage only when retention_policy = on_read AND read_at newly set
- No server-side hook tied to playback start

### Policy gate

onMarkRead for voice is undefined unless:
- message.sender_id !== current user (recipient only)
- message.retention_policy === on_read

Timed policies (1h–7d) never call markRead on voice playback at all.

---

## Warnings

1. Relies on HTML5 Audio onended event — fires when playback reaches natural end, not on pause/navigation.
2. Corrupt/truncated audio that ends early may fire onended before user perceived 100% — browser behavior, not progress-percent tracking.
3. Sender playing own on_read voice never triggers consumption (by design).

---

## Errors

None identified for the stated requirement.

---

## Recommendations

No code change required for partial-playback requirement — implementation already correct.

Optional future hardening: track currentTime/duration and only consume when currentTime >= duration * 0.99 if stricter than onended is needed.

---

## Overall Status

PASS
