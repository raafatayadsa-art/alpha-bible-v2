# ALPHA-104 — Alpha Church Quiz & Competition System

**Date:** 2026-06-22  
**Ticket:** ALPHA-104  
**Audit type:** Architecture & gap analysis (no implementation in this pass)  
**Vision:** تحويل التعلم الروحي إلى تجربة تفاعلية — مسابقات كتابية، سنكسار، أجبية، عقيدة، ومناسبات.

---

## Executive Summary

ALPHA-104 defines a **full quiz & competition platform**: active/upcoming/ended competitions, premium question UI, instant scoring, leaderboards, digital badges, and (future) church-scoped events. **Nothing exists today** under quiz/competition routes or Supabase tables. Reusable DNA exists in **hero-card chrome**, **Platform Premium UI**, **Katameros progress**, and **Future Badge** stubs in `AlphaShield`. The existing **Bible Journey (ALPHA-101)** deliberately avoids gamification — Quiz must be a **separate module** with its own route namespace (`/competitions` recommended) so journey stays calm and competitions stay celebratory.

**Recommended path:** Phase 0–2 for **Alpha global competitions** (no church dependency); Phase 3+ for church/Sunday-school scope per spec.

---

## Findings

### What exists today ✅

| Area | State |
|------|--------|
| Premium card chrome | `hero-card-chrome.tsx`, church/platform gold glass patterns |
| Progress UI patterns | `KatamerosProgressUI`, journey tokens (reference only) |
| Content sources | Bible reader, Synaxarium saints, Agpeya prayers, Katameros — **data in app, not wired to quizzes** |
| Auth & profiles | Supabase auth, profile routes |
| Platform gating | `platform_modules` toggle system |
| Future badges stub | `FUTURE_BADGES` in `AlphaShield.tsx` — extendable, not persisted |
| `/bible/questions` | **Placeholder only** — not a competition engine |

### What ALPHA-104 requires ❌ (gaps)

| Requirement | Gap |
|-------------|-----|
| 🏆 المسابقات home (active / upcoming / ended / top players) | No route, no UI |
| Competition card (category, questions count, duration, participants, CTA) | Missing |
| Create competition (admin / approved servant) | Missing |
| 7 question types (MC, T/F, fill verse, who said, saint, order, image) | Missing |
| Premium question screen + correct/wrong effects | Missing |
| Final results screen (score, %, rating label) | Missing |
| Leaderboard (rank, name, score, time) | Missing |
| Achievements profile (stats + medals + badges) | Missing |
| 5 badge types from spec | Missing |
| Alpha global competitions (Resurrection, Holy Week, etc.) | Missing |
| Church-scoped competitions (future) | Missing — needs `church_id` + roles |
| Optional sound / haptics | Missing |
| DB persistence + RLS | Missing |

### Design DNA alignment

| Spec | Existing pattern to reuse |
|------|---------------------------|
| Gold accents + glassmorphism | `JOURNEY` / church beige-gold + `PlatformPremiumUI` PP_GOLD |
| Modern cards | `HeroBadgeEmblem`, `BooksPremiumBookCard` structure |
| Smooth animations | Existing `active:scale`, journey/church transitions — add quiz-specific CSS module |
| Apple-level polish | Match `BibleJourneyPremiumScreen` spacing, not Alpha Connect cyber theme |

**Important:** Do **not** merge quiz points into Bible Journey streak UI — keep modules visually related but logically separate.

---

## Proposed architecture

### Route map

```
/competitions                    → 🏆 المسابقات (tabs: active | upcoming | ended | leaders)
/competitions/$id                → Competition detail + "ابدأ المسابقة"
/competitions/$id/play           → Question flow (one card at a time)
/competitions/$id/results/$attemptId → Final score + rating
/competitions/$id/leaderboard    → 🥇🥈🥉 + list
/profile/competitions            → Achievements (or /competitions/me)

Admin:
/competitions/create             → Servant / church admin (role-gated)
/platform/competitions           → Alpha global CRUD (Mission Control)
```

Register module key: **`competitions`** in `platform_modules` + `module-route-map.ts`.

### Database schema (proposed)

```sql
-- Enums
competition_audience: children | youth | servants | women | all
competition_scope: alpha_global | church
competition_status: draft | scheduled | active | ended | archived
question_type: multiple_choice | true_false | fill_verse | who_said | saint | event_order | image

quiz_competitions (
  id, title, description, audience, scope, church_id nullable,
  starts_at, ends_at, duration_seconds, points_per_question,
  question_count cached, participant_count cached,
  status, cover_image_url, theme_key, created_by, created_at
)

quiz_questions (
  id, competition_id, sort_order, type, prompt, prompt_image_url,
  options jsonb, correct_answer jsonb, explanation, points, source_ref
)

quiz_attempts (
  id, competition_id, user_id, started_at, finished_at,
  score, correct_count, wrong_count, duration_ms, rating_label
)

quiz_attempt_answers (
  attempt_id, question_id, user_answer jsonb, is_correct, answered_at
)

quiz_user_stats (
  user_id, competitions_entered, best_score_pct, medals_count, badges jsonb
)

quiz_badges (
  id, slug, label_ar, icon, criteria jsonb
)

user_quiz_badges (
  user_id, badge_id, earned_at, competition_id nullable
)
```

**Leaderboard:** SQL view or RPC `quiz_leaderboard(competition_id, limit)` ordered by `score DESC, duration_ms ASC`.

**RLS highlights:**
- Read active competitions: public/authenticated
- Write questions/competitions: platform admin OR church role `can_manage_quizzes`
- Attempts: user owns row; insert once per competition rules (configurable: one attempt vs daily)

### Question type handling

| Type | UI | Grading |
|------|-----|---------|
| multiple_choice | Large option buttons | Exact match option id |
| true_false | Two buttons | Boolean |
| fill_verse | Text input or word chips | Normalized text compare |
| who_said | MC with character names | Option id |
| saint | MC + optional saint image from Synaxarium | Option id |
| event_order | Drag reorder | Sequence match |
| image | Image prompt + MC | Option id |

**Content pipeline (Phase 2+):** Seed Alpha global packs from curated JSON; later generators from Bible/Synaxarium APIs with human review queue in `/platform/competitions`.

### Scoring & rating (client + server)

```
score = sum(question.points where correct)
pct = correct_count / question_count * 100

Rating (example):
  >= 90% → ممتاز جداً
  >= 75% → ممتاز
  >= 60% → جيد
  else   → حاول مرة أخرى
```

Server validates answers on submit — **never trust client-only scoring**.

### Visual effects (spec)

| Event | Implementation |
|-------|----------------|
| Correct | Gold glow CSS class + ✔ + points pop + optional `navigator.vibrate(20)` |
| Wrong | Shake animation + show correct after delay |
| Sound | Optional `Audio` — off by default, user setting |
| Achievement unlock | Modal overlay reusing shield/badge visual language |

Use CSS `@keyframes` in `competitions-premium.css` — no new heavy animation library unless needed.

### Badges (map to spec)

| Spec badge | Suggested slug | Criteria |
|------------|----------------|----------|
| 🏅 دارس الكتاب المقدس | `bible_scholar` | 3 Bible-themed competitions ≥ 80% |
| 🏅 خبير السنكسار | `synaxarium_expert` | 3 Synaxarium competitions ≥ 80% |
| 🏅 حافظ المزامير | `psalms_keeper` | Psalms pack completed |
| 🏅 بطل الأجبية | `agpeya_champion` | Agpeya pack completed |
| 🏅 متسابق الشهر | `competitor_of_month` | Top 10 in any monthly Alpha competition |

Extend `FutureBadgeId` or keep quiz badges in `user_quiz_badges` only — **prefer separate table** to avoid shield coupling.

---

## Phased rollout

### Phase 0 — Foundation (2 weeks) — **P0 launch slice**

- Migration: core tables + RLS + RPCs (`start_attempt`, `submit_answer`, `finish_attempt`)
- Module key `competitions` + home entry (Bible home card or main home tile)
- Screen: `/competitions` with 3 tabs + static seed of 1–2 Alpha global competitions
- Play flow: **multiple_choice + true_false only**
- Results screen with % and Arabic rating
- No leaderboard yet — proves loop

### Phase 1 — Engagement (2 weeks) — **P1**

- Leaderboard RPC + UI
- `/competitions/me` achievements (counts only)
- Correct/wrong premium effects + optional haptics
- Remaining question types except `image` and `event_order`

### Phase 2 — Creation & Alpha packs (2–3 weeks) — **P1**

- `/platform/competitions` CRUD for Alpha admin
- `/competitions/create` for approved servants (role flag)
- Seed packs: القيامة، أسبوع الآلام، الميلاد، الرسل، القديسين
- Badge earn rules + celebration modal

### Phase 3 — Church scope (post-launch, per spec) — **P2**

- `scope = church`, `church_id` FK
- Church hub entry + Sunday school / youth filters
- Moderation: draft → publish by priest/admin

### Phase 4 — Polish — **P3**

- Image questions + event ordering UX
- Optional sound toggle
- Anti-cheat: server timer, tab blur policy, attempt limits
- Analytics in Mission Control dashboard

---

## Integration points

| Module | Integration |
|--------|-------------|
| Home / Bible home | New feature card «🏆 المسابقات» → `/competitions` |
| Platform Control | New card + module toggle |
| Profile | Link achievements section |
| Church hub | Future card when Phase 3 |
| Search | Optional: competition titles in global search |
| `/bible/questions` | Keep Q&A placeholder OR redirect to competitions FAQ — **do not conflate** |

---

## Warnings

1. **Scope size:** Full ALPHA-104 is **6–10 weeks** engineering; do not ship all question types in v1.
2. **Gamification vs Journey:** Bible Journey users expect calm UX — separate routes and copy.
3. **Content legal/quality:** Auto-generated Bible questions need theological review before publish.
4. **RLS complexity:** Church-scoped quizzes need same membership checks as church posts.
5. **Offline:** Attempts require network for fair scoring unless explicit offline mode is spec'd later.
6. **Module disabled:** Respect `platform_modules` — hide all competition entry points when off.

---

## Errors

None (planning audit only — no code changes in this pass).

---

## Recommendations

| Priority | Action |
|----------|--------|
| **P0** | Approve route namespace `/competitions` + DB migration + module key |
| **P0** | Seed 2 Alpha global competitions (10 MC questions each) for internal QA |
| **P1** | Leaderboard + achievements + create flow |
| **P2** | Church-scoped competitions after ALPHA-108 church pages mature |
| **P3** | Image/order types + sound |

**Suggested first vertical slice ticket:** `ALPHA-104a` — Competitions home + play + results (MC/T-F only, Alpha global, no create UI).

---

## Overall Status

**PLANNING** — Spec received; **0% implemented**; ready for phased build after P0 approval.

---

## Key files (future)

| Layer | Path (proposed) |
|-------|-----------------|
| Feature | `src/features/competitions/` |
| Routes | `src/routes/competitions.*.tsx` |
| Tokens | `src/features/competitions/competitions-tokens.ts` |
| API | `src/features/competitions/competitions-api.ts` |
| Migration | `supabase/migrations/*_quiz_competitions.sql` |
| Platform | `src/features/platform-admin/CompetitionsAdminScreen.tsx` |

## Reference files (reuse today)

- `src/components/home/hero-card-chrome.tsx`
- `src/features/bible-journey/BibleJourneyPremiumScreen.tsx`
- `src/features/platform-admin/PlatformPremiumUI.tsx`
- `src/features/katameros/components/KatamerosProgressUI.tsx`
- `src/components/alpha/AlphaShield.tsx` (badge visual language only)
