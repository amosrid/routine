# Sprint 5 Lock and Streak Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add WIB-based daily routine lock status and idempotent streak tracking on Home without adding activity logs, stats, todo, or non-Sprint-5 features.

**Architecture:** Keep date, lock, and streak calculations as pure helpers in `lib/daily-routine/core.ts`, persist streak state in a small `user_streaks` table, and evaluate streak server-side when Home loads.

**Tech Stack:** Next.js App Router, Prisma, PostgreSQL/Supabase, Vitest.

---

### Task 1: Lock and Streak Helpers

**Files:**
- Modify: `lib/daily-routine/core.ts`
- Test: `tests/daily-routine.test.ts`

- [ ] Add failing tests for 11:00 WIB lock status.
- [ ] Add failing tests for idempotent streak state transitions.
- [ ] Implement `getJakartaLockState`, `getPreviousDateString`, and `getNextStreakState`.
- [ ] Run `npm run test:run -- tests/daily-routine.test.ts`.

### Task 2: Streak Persistence

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `prisma/migrations/<timestamp>_add_user_streaks/migration.sql`
- Modify: `lib/daily-routine/service.ts`

- [ ] Add `UserStreak` with one row per profile.
- [ ] Store `current_streak`, `longest_streak`, `last_active_date`, and `last_evaluated_date`.
- [ ] Add `evaluateUserStreak(userId, now)` that checks yesterday's daily routine score and updates once per WIB day.

### Task 3: Home UI

**Files:**
- Modify: `app/(dashboard)/page.tsx`
- Modify: `tests/english-ui.test.ts`

- [ ] Display streak badge on Home.
- [ ] Display lock status using Asia/Jakarta time.
- [ ] Keep complete/skip actions available.
- [ ] Keep all visible UI text English.

### Task 4: Verification

**Files:**
- No source edits expected.

- [ ] Run `npm run test:run`.
- [ ] Run `npx prisma validate`.
- [ ] Run `npm run build`.
- [ ] Run `npx prisma migrate status`.
- [ ] Route check `/login`, `/`, and `/routine/templates`.
