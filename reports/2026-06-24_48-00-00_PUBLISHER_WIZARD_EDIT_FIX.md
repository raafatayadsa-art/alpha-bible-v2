# Publisher Workspace Add/Edit Wizard Fix

**Date:** 2026-06-24  
**Scope:** Fix wizard reopen loop + keep approved content on metadata edits

---

## Executive Summary

Fixed add/edit content wizard reopening after save (caused by full-page loading unmounting the wizard while `wizardOpen` stayed true). Updated DB `update_publisher_content` so approved items stay approved when editing title/description/cover/album tracks without changing the media file.

---

## Root Causes

### 1. Wizard reopen after save
`reload()` set `loading=true` → workspace returned early with spinner → wizard unmounted but `wizardOpen` remained `true` → after reload wizard reopened automatically.

### 2. Edit always sent to review
`update_publisher_content` set `status = pending_review` on every edit for non-trusted publishers, even metadata-only changes to already-approved content.

---

## Fixes

### Client
- `PublisherWorkspaceScreen`: refresh without full-page loader; `handleWizardSuccess` closes wizard + add sheet
- `PublisherContentWizard`: closes immediately after successful save (no stuck "done" step loop)
- `openWizard`: always closes add sheet first

### Database
- Migration `publisher_content_edit_keep_approved`
- Approved content stays **approved** unless media URL changes
- Trusted publishers always stay approved on edit
- New review request only when status transitions to `pending_review`

---

## Overall Status

**PASS**

---

## Changed Files

- `src/features/publisher/components/PublisherWorkspaceScreen.tsx`
- `src/features/publisher/components/PublisherContentWizard.tsx`
- `supabase/migrations/20250625005000_publisher_content_edit_keep_approved.sql`
