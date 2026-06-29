# Founder Bootstrap — alpha.coptic@proton.me

**Date:** 2026-06-27  
**Scope:** Platform owner registration + admin team table privileges

---

## Executive Summary

تم إعداد SQL لتسجيل **alpha.coptic@proton.me** كـ **المؤسس** في `platform_owners` (مالك مخفي بصلاحيات كاملة)، وتأمين جداول فريق Alpha بـ **REVOKE + RLS deny** — الوصول فقط عبر RPCs.

**Overall Status: PARTIAL** — يتطلب تشغيل SQL يدوياً في Supabase Dashboard

---

## Findings

### Files Created/Updated

| File | Purpose |
|------|---------|
| `supabase/RUN_FOUNDER_ALPHA_COPTIC_BOOTSTRAP.sql` | **شغّل هذا** في SQL Editor |
| `supabase/migrations/20260627120000_founder_alpha_coptic_admin_grants.sql` | Migration للمستودع |
| `supabase/RUN_PLATFORM_OWNER_BOOTSTRAP.sql` | محدّث بالإيميل |
| `supabase/RUN_ADMIN_TEAM_MANAGEMENT.sql` | + REVOKE + deny policies |
| `supabase/migrations/20260629200000_admin_team_management.sql` | + REVOKE + deny policies |

### Founder Registration
```sql
insert into platform_owners (user_id, label)
select id, 'المؤسس' from auth.users
where lower(email) = lower('alpha.coptic@proton.me');
```

### Admin Tables Secured (7 tables)
- `admin_roles`, `admin_permissions`, `admin_role_permissions`
- `admin_users`, `admin_user_permissions`
- `admin_invites`, `admin_activity_logs`

**Mechanism:** `REVOKE ALL` from `anon`/`authenticated` + RLS policy `using (false)` — كل العمليات عبر `admin_*` RPCs (security definer).

### platform_owners RLS
- إزالة `platform_owners_dev_all` (كانت تسمح بكتابة مفتوحة)
- الإبقاء على `platform_owners_read_self` فقط

---

## Warnings

1. **يجب أن يكون الحساب مسجّلاً** في `auth.users` قبل تشغيل SQL — سجّل دخول مرة في التطبيق بـ `alpha.coptic@proton.me`.
2. إذا لم تُشغَّل **`RUN_ADMIN_TEAM_MANAGEMENT.sql`** بعد، شغّلها أولاً ثم `RUN_FOUNDER_ALPHA_COPTIC_BOOTSTRAP.sql`.
3. المؤسس **لا يظهر** في قائمة فريق Alpha — موجود فقط في `platform_owners`.

---

## Errors

- None in repo. Remote DB status unknown until SQL is executed.

---

## Recommendations

### Run order in Supabase SQL Editor:
1. `RUN_ADMIN_TEAM_MANAGEMENT.sql` (if not applied)
2. `RUN_FOUNDER_ALPHA_COPTIC_BOOTSTRAP.sql`

### Verify (Step 4 output):
- `is_owner = true`
- `is_hidden_owner = true`
- `label = المؤسس`

### After run:
- افتح Alpha Control — يجب الدخول كمالك بدون قيود
- فريق Alpha + Media Manager + Module Control كلها متاحة

---

## Overall Status

**PARTIAL** — SQL ready; awaiting manual execution on Supabase.
