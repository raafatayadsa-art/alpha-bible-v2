# Publisher Team + One Page Per User

**Date:** 2026-06-24  
**Project:** Alpha Bible — Publisher module  
**Supabase project:** `usflbjlyadihyitnvzya`

---

## Executive Summary

Implemented **one self-service publisher page per user** and a **team assistants** system. After a user creates their publisher page, the "طلب صفحة ناشر جديدة" button is hidden. The owner can add Alpha users as assistants by email and assign granular permissions inside the publisher workspace. All required Supabase migrations were applied to the remote project.

---

## Findings

### Database (migration `20250624260000_publisher_team_members.sql`)

| Component | Status |
|-----------|--------|
| `publisher_team_members` table | Applied |
| Access helpers (`publisher_is_owner`, `publisher_team_has_perm`, `user_owns_self_service_publisher`) | Applied |
| `can_create_publisher_application()` RPC | Applied |
| `submit_publisher_application` — blocks second self-service page (`already_has_publisher`) | Applied |
| Permission-gated RPCs (`update_publisher_workspace`, `submit_publisher_content`, `submit_publisher_for_publication`) | Applied |
| Team RPCs (`get_publisher_access`, `list/add/update/remove_publisher_team_member`) | Applied |
| RLS policies for team read access | Applied |
| Grants to `authenticated` | Applied |

### Permissions model

| Permission | Key | Default for new assistant |
|------------|-----|---------------------------|
| تعديل الملف الشخصي | `can_edit_profile` | false |
| إدارة المحتوى | `can_manage_content` | true |
| طلب نشر الصفحة | `can_submit_publication` | false |
| إدارة المساعدين | `can_manage_team` | false |

Owner has all permissions implicitly.

### Client UI

| File | Change |
|------|--------|
| `src/routes/publisher.index.tsx` | Hides create button when `canCreate === false`; shows info message |
| `src/routes/publisher.apply.tsx` | Redirects to `/publisher` if user already has a page |
| `src/features/publisher/components/PublisherTeamSection.tsx` | Add/remove assistants, permission toggles |
| `src/features/publisher/components/PublisherWorkspaceScreen.tsx` | Sections gated by access; team section for owners |
| `src/features/publisher/publisher-team-api.ts` | Team CRUD + `fetchPublisherAccess` |
| `src/features/publisher/publisher-api.ts` | `fetchMyPublishers` includes owned + team pages; `fetchCanCreatePublisherApplication` |

---

## Warnings

- Assistants are looked up by **registered Alpha email** (`auth.users`). If the email is not found, add fails with a clear Arabic message.
- Church/monastery publisher types are excluded from the one-page rule (they use the claim flow).
- Admin RLS on publishers/content remains permissive for authenticated users — tighten with `platform_owners` in a future pass.

---

## Errors

None during migration apply or client integration.

---

## Recommendations

1. **Manual test:** Owner creates page → hub hides create button → add assistant by email → assistant logs in and sees gated workspace.
2. **Optional:** Show assistant email (not just userId prefix) in team list via profiles join.
3. **Optional:** Invitation flow (pending invite before user registers).

---

## Overall Status

**PASS** — One page per user enforced server-side; team assistants with permissions fully wired (DB + UI).
