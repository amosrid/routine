# Sprint 4 Daily Routine Core Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Home-page Daily Routine core loop: generate today's WIB routine from the matching active template, show snapshot items, complete/skip/undo items, and recalculate score.

**Architecture:** Use Prisma migrations for `daily_routines` and `daily_routine_items`, focused pure helpers in `lib/daily-routine`, and server actions for Home page item changes. Home remains server-rendered and auto-generates today's routine when opened.

**Tech Stack:** Next.js App Router, React server components, Prisma, Supabase-authenticated profile ids, Vitest.

---

### Task 1: Pure Daily Routine Helpers

**Files:**
- Create: `lib/daily-routine/core.ts`
- Test: `tests/daily-routine.test.ts`

- [ ] Write failing tests for WIB date calculation, score calculation, snapshot item creation, and display ordering.
- [ ] Implement `getJakartaDateParts`, `calculateScorePercentage`, `createSnapshotItems`, and `sortDailyItemsForDisplay`.
- [ ] Run `npm run test:run -- tests/daily-routine.test.ts` and confirm the new tests pass.

### Task 2: Prisma Schema and Migration

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `prisma/migrations/<timestamp>_add_daily_routines/migration.sql`

- [ ] Add `DailyRoutine` and `DailyRoutineItem` models.
- [ ] Keep `daily_routines.user_id + routine_date` unique.
- [ ] Set `daily_routines.template_id` nullable with `onDelete: SetNull`.
- [ ] Copy schedule fields with `@db.Time(0)`.
- [ ] Run `npx prisma migrate dev --name add_daily_routines`.

### Task 3: Generation and Actions

**Files:**
- Create: `lib/daily-routine/service.ts`
- Create: `app/(dashboard)/daily-routine-actions.ts`
- Test: extend `tests/daily-routine.test.ts`

- [ ] Implement transaction-safe generation using the unique user/date constraint.
- [ ] Select the first active template matching today's WIB weekday by `createdAt ASC`.
- [ ] Do not create a daily routine when no matching template exists or the matching template has no blocks.
- [ ] Implement complete, skip, and undo actions; each action recalculates score in a transaction.

### Task 4: Home Page UI

**Files:**
- Modify: `app/(dashboard)/page.tsx`
- Modify: `tests/english-ui.test.ts`

- [ ] Show today's routine on Home with score, template snapshot name, and ordered item list.
- [ ] Display scheduled items as `04:00–05:30 — Name`.
- [ ] Display unscheduled items as `Unscheduled — Name`.
- [ ] Add English empty states for no matching template and template-without-blocks.
- [ ] Keep UI text English and avoid activity logs, streak, stats, todo, or lock logic.

### Task 5: Verification

**Files:**
- No source edits expected.

- [ ] Run `npm run test:run`.
- [ ] Run `npx prisma validate`.
- [ ] Run `npm run build`.
- [ ] Check `/login` returns 200 and `/` is protected/renders through the current browser session.
