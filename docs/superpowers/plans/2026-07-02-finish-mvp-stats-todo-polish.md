# Finish MVP Stats Todo Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete the remaining MVP by adding basic statistics, todo CRUD, navigation, responsive polish, and final verification.

**Architecture:** Keep statistics as read-only server-rendered summaries from existing routine/log tables, add a focused `todo_items` table with server actions, and guard behavior with small pure-helper tests.

**Tech Stack:** Next.js App Router, Prisma, PostgreSQL/Supabase, server actions, Vitest.

---

### Task 1: Helper Tests

- [ ] Add tests for score averages and minute formatting.
- [ ] Add tests for todo title validation.
- [ ] Implement helpers in `lib/stats/summary.ts` and `lib/todo/validation.ts`.

### Task 2: Todo Data and Actions

- [ ] Add `TodoItem` model and migration.
- [ ] Implement create, toggle, delete, and clear completed server actions.
- [ ] Keep all queries scoped to logged-in user.

### Task 3: Pages

- [ ] Add `/stats` with score summaries, recent score list, category duration totals, and sleep averages.
- [ ] Add `/todo` with all/active/completed tabs, create form, toggles, delete, and clear completed.
- [ ] Add navigation links and English UI guard.

### Task 4: Verification

- [ ] Apply migrations and generate Prisma Client.
- [ ] Run `npm run test:run`, `npx prisma validate`, `npm run build`, `npx prisma migrate status`.
- [ ] Route-check protected routes and finish with MVP audit.
