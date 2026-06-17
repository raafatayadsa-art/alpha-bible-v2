# Participants Drawer — Icon Column Alignment

**Date:** 2026-06-17  
**Status:** PASS

## Summary

Participants list uses a **4-column CSS grid** so shields and status icons align in straight vertical columns regardless of name length.

## Grid (RTL, right → left)

| Column | Width | Content |
|--------|-------|---------|
| Avatar | 2.5rem | Photo + presence + mute overlay |
| Details | 1fr | Name + presence · role |
| Shield | 1.75rem | Fixed centered shield |
| Status | 1.625rem | Mute / ear / empty slot |

## Files

- `ConnectChannelsUI.tsx` — `ConnectParticipantListRow`
- `alpha-identity-layout.css` — `.connect-participant-row--grid`
