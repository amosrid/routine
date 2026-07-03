# Sprint 6 Activity Logs Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add basic Study, Language, Exercise, Book, and Sleep logging with optional linkage to today's routine items, completing linked items and recalculating daily score.

**Architecture:** Add Prisma models for each log type, shared validation helpers in `lib/activity-logs/validation.ts`, shared server-side routine item completion in `lib/activity-logs/service.ts`, and server-action pages for each log route.

**Tech Stack:** Next.js App Router, Prisma, PostgreSQL/Supabase, server actions, Vitest.

---

### Task 1: Validation Helpers

**Files:**
- Create: `lib/activity-logs/validation.ts`
- Create: `tests/activity-logs.test.ts`

- [ ] Add failing tests for duration validation, optional note normalization, and sleep duration crossing midnight.
- [ ] Implement minimal validation helpers and run `npm run test:run -- tests/activity-logs.test.ts`.

### Task 2: Database Schema

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `prisma/migrations/<timestamp>_add_activity_logs/migration.sql`

- [ ] Add `StudyLog`, `LanguageLog`, `ExerciseLog`, `BookLog`, and `SleepLog`.
- [ ] Connect logs to `Profile` and optionally to `DailyRoutineItem` with `ON DELETE SET NULL`.
- [ ] Keep one sleep log per user and wake date.

### Task 3: Server Actions and Services

**Files:**
- Create: `lib/activity-logs/service.ts`
- Create: `app/(dashboard)/deepwork/actions.ts`
- Create: `app/(dashboard)/language/actions.ts`
- Create: `app/(dashboard)/exercise/actions.ts`
- Create: `app/(dashboard)/book/actions.ts`
- Create: `app/(dashboard)/sleep/actions.ts`

- [ ] Create log actions with user filtering.
- [ ] If a log has `dailyRoutineItemId`, complete that item in the same transaction, set actual duration, clear skipped state, and recalculate score.

### Task 4: Log Pages

**Files:**
- Create pages for `/deepwork`, `/language`, `/exercise`, `/book`, `/sleep`
- Modify: `app/(dashboard)/layout.tsx`
- Modify: `tests/english-ui.test.ts`

- [ ] Add simple create/list pages.
- [ ] Show today's matching routine item selector by log type.
- [ ] Keep visible UI English.

### Task 5: Verification

**Files:**
- No source edits expected.

- [ ] Run `npm run test:run`.
- [ ] Run `npx prisma validate`.
- [ ] Run `npm run build`.
- [ ] Run `npx prisma migrate status`.
- [ ] Route check `/login`, `/`, and new log routes.
