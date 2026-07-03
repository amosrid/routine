import { requireUser } from "@/lib/auth/session";
import {
  evaluateUserStreak,
  getOrCreateTodayRoutine
} from "@/lib/daily-routine/service";
import {
  getJakartaLockState,
  sortDailyItemsForDisplay
} from "@/lib/daily-routine/core";
import { prisma } from "@/lib/prisma";
import {
  formatBlockSchedule,
  getBlockTypeLabel,
  type RoutineBlockType
} from "@/lib/routine-template/validation";

import {
  assignDailySetupItem,
  completeDailyRoutineItem,
  deleteDailySetupItem,
  lockTodayRoutine,
  skipDailyRoutineItem,
  undoDailyRoutineItem
} from "./daily-routine-actions";

type SearchParams = {
  error?: string;
  message?: string;
};

export default async function HomePage({
  searchParams
}: {
  searchParams?: SearchParams;
}) {
  const user = await requireUser();
  const lockState = getJakartaLockState();
  const [profile, todayRoutine, streak, subjects, languages, exercises, books] = await Promise.all([
    prisma.profile.findUnique({
      where: { id: user.id }
    }),
    getOrCreateTodayRoutine(user.id),
    evaluateUserStreak(user.id),
    prisma.studySubject.findMany({ where: { userId: user.id }, orderBy: { name: "asc" } }),
    prisma.userLanguage.findMany({ where: { userId: user.id }, orderBy: { name: "asc" } }),
    prisma.exerciseType.findMany({ where: { userId: user.id }, orderBy: { name: "asc" } }),
    prisma.book.findMany({
      where: { userId: user.id, status: "reading" },
      orderBy: { title: "asc" }
    })
  ]);
  const profileName = profile?.fullName || profile?.displayName || user.email || "User";
  const isRoutineLocked =
    todayRoutine.status === "ready"
      ? todayRoutine.routine.isSetupLocked || lockState.isLocked
      : lockState.isLocked;

  const isStreakActive = streak.currentStreak > 0;

  return (
    <section className="space-y-6">
      <div className="overflow-hidden rounded-3xl border border-white/10 bg-[linear-gradient(135deg,rgba(20,184,166,0.18),rgba(15,23,42,0.74)_45%,rgba(245,158,11,0.12))] p-6 shadow-2xl shadow-black/20 md:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-teal-200/80">
              Today Command Center
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
              Welcome, {profileName}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 md:text-base">
              Set up the day, clear the checklist, and turn completed items into useful history.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">WIB date</p>
            <p className="mt-1 text-lg font-semibold">
              {todayRoutine.status === "ready" ? todayRoutine.routineDate : "Today"}
            </p>
          </div>
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <div
          className={[
            "relative overflow-hidden rounded-2xl border p-5 shadow-xl shadow-black/20",
            isStreakActive
              ? "border-amber-300/30 bg-amber-400/[0.08]"
              : "border-white/10 bg-white/[0.055]"
          ].join(" ")}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-slate-400">Streak</p>
              <p className="mt-2 text-3xl font-semibold">{streak.currentStreak} days</p>
              <p className="mt-1 text-sm text-slate-400">Best: {streak.longestStreak} days</p>
            </div>
            <div
              className={[
                "grid h-14 w-14 place-items-center rounded-2xl text-2xl shadow-lg",
                isStreakActive
                  ? "bg-amber-300 text-slate-950 shadow-amber-500/30"
                  : "bg-white/10 grayscale"
              ].join(" ")}
              aria-hidden="true"
            >
              🔥
            </div>
          </div>
          <p
            className={[
              "mt-4 inline-flex rounded-full px-3 py-1 text-xs font-semibold",
              isStreakActive
                ? "bg-amber-300/15 text-amber-100"
                : "bg-white/10 text-slate-300"
            ].join(" ")}
          >
            {isStreakActive ? "On fire" : "Ready to start"}
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.055] p-5 shadow-xl shadow-black/20">
          <p className="text-sm text-slate-400">Daily Routine Lock</p>
          <div className="mt-3 flex items-center gap-3">
            <span
              className={[
                "h-3 w-3 rounded-full",
                isRoutineLocked ? "bg-amber-300 shadow-[0_0_18px_rgba(245,158,11,0.65)]" : "bg-teal-300"
              ].join(" ")}
            />
            <p className="text-2xl font-semibold">{isRoutineLocked ? "Locked" : "Unlocked"}</p>
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            {isRoutineLocked
              ? `Structure is locked after ${lockState.lockHour}:00 WIB. Checklist and skip actions stay available.`
              : `Setup changes are available until ${lockState.lockHour}:00 WIB.`}
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.055] p-5 shadow-xl shadow-black/20">
          <p className="text-sm text-slate-400">Score</p>
          <p className="mt-2 text-3xl font-semibold">
            {todayRoutine.status === "ready" ? todayRoutine.routine.scorePercentage : 0}%
          </p>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-teal-300 to-amber-300"
              style={{
                width: `${
                  todayRoutine.status === "ready"
                    ? todayRoutine.routine.scorePercentage
                    : 0
                }%`
              }}
            />
          </div>
        </div>
      </section>

      {searchParams?.error ? (
        <p className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {searchParams.error}
        </p>
      ) : null}
      {searchParams?.message ? (
        <p className="rounded-md border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
          {searchParams.message}
        </p>
      ) : null}

      {todayRoutine.status === "no-template" ? (
        <EmptyState
          title="No routine template for today"
          message="Create or activate a routine template that includes today's weekday before a daily routine can be generated."
        />
      ) : null}

      {todayRoutine.status === "template-empty" ? (
        <EmptyState
          title="Template has no blocks"
          message={`The active template "${todayRoutine.templateName}" matches today, but it has no routine blocks yet.`}
        />
      ) : null}

      {todayRoutine.status === "ready" ? (
        <section className="space-y-4 rounded-3xl border border-white/10 bg-white/[0.055] p-5 shadow-2xl shadow-black/20 md:p-6">
          <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">Today's Routine</h2>
              <p className="mt-1 text-sm text-slate-400">
                {todayRoutine.routine.templateName} | {todayRoutine.routineDate}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-2 text-sm">
                Score:{" "}
                <span className="font-semibold text-teal-200">
                  {todayRoutine.routine.scorePercentage}%
                </span>
              </div>
              {!isRoutineLocked ? (
                <form action={lockTodayRoutine}>
                  <button
                    className="rounded-2xl border border-amber-500/40 bg-amber-500/10 px-4 py-2 text-sm font-medium text-amber-100 transition hover:bg-amber-500/20"
                    type="submit"
                  >
                    Lock Setup
                  </button>
                </form>
              ) : null}
            </div>
          </div>


          {todayRoutine.routine.items.length === 0 ? (
            <p className="text-sm text-slate-400">This daily routine has no items.</p>
          ) : (
            <div className="space-y-3">
              {sortDailyItemsForDisplay(todayRoutine.routine.items).map((item) => (
                <article
                  className="grid gap-4 rounded-2xl border border-white/10 bg-[#090d16] p-4 shadow-lg shadow-black/10 transition hover:border-white/20"
                  key={item.id}
                >
                  <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0">
                      <h3 className="text-base font-semibold">
                        {formatBlockSchedule({
                          startTime: item.startTime,
                          endTime: item.endTime
                        })}{" "}
                        - {item.displayName}
                      </h3>
                      <p className="mt-1 text-sm text-slate-400">
                        {getBlockTypeLabel(item.blockType)} | Planned:{" "}
                        {item.durationMinutes} minutes
                        {item.actualDuration ? ` | Actual: ${item.actualDuration} minutes` : ""}
                      </p>
                      {item.isCompleted ? (
                        <p className="mt-3 inline-flex rounded-full bg-teal-300/10 px-3 py-1 text-xs font-semibold text-teal-100">
                          Completed
                        </p>
                      ) : null}
                      {item.isSkipped ? (
                        <p className="mt-3 inline-flex rounded-full bg-amber-300/10 px-3 py-1 text-xs font-semibold text-amber-100">
                          Skipped{item.skipReason ? `: ${item.skipReason}` : ""}
                        </p>
                      ) : null}
                      {item.isSetupPlaceholder && !isRoutineLocked ? (
                        <div className="mt-3">
                          <AssignSubjectForm
                            itemId={item.id}
                            blockType={item.blockType}
                            subjects={subjects}
                            languages={languages}
                            exercises={exercises}
                            books={books}
                          />
                        </div>
                      ) : item.isSetupPlaceholder && isRoutineLocked ? (
                        <p className="mt-3 inline-flex rounded-full bg-slate-300/10 px-3 py-1 text-xs font-semibold text-slate-300">
                          Not assigned — locked.
                        </p>
                      ) : null}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <form action={completeDailyRoutineItem}>
                        <input name="id" type="hidden" value={item.id} />
                        <button
                          className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-white disabled:opacity-40"
                          disabled={item.isCompleted || item.isSetupPlaceholder}
                          type="submit"
                        >
                          Complete
                        </button>
                      </form>
                      <form action={undoDailyRoutineItem}>
                        <input name="id" type="hidden" value={item.id} />
                        <button
                          className="rounded-md border border-slate-700 px-3 py-2 text-sm disabled:opacity-40"
                          disabled={!item.isCompleted && !item.isSkipped}
                          type="submit"
                        >
                          Undo
                        </button>
                      </form>
                      {!isRoutineLocked && !item.isCompleted && !item.isSkipped ? (
                        <form action={deleteDailySetupItem}>
                          <input name="id" type="hidden" value={item.id} />
                          <button
                            className="rounded-md border border-red-500/50 px-3 py-2 text-sm text-red-100"
                            type="submit"
                          >
                            Delete
                          </button>
                        </form>
                      ) : null}
                    </div>
                  </div>

                  <form action={skipDailyRoutineItem} className="flex flex-col gap-2 md:flex-row">
                    <input name="id" type="hidden" value={item.id} />
                    <input
                      className="min-w-0 flex-1 rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-50"
                      name="skipReason"
                      placeholder="Optional skip reason"
                    />
                    <button
                      className="rounded-md border border-amber-500/50 px-3 py-2 text-sm text-amber-100 disabled:opacity-40"
                      disabled={item.isSkipped || item.isCompleted}
                      type="submit"
                    >
                      Skip
                    </button>
                  </form>
                </article>
              ))}
            </div>
          )}
        </section>
      ) : null}
    </section>
  );
}

function EmptyState({ title, message }: { title: string; message: string }) {
  return (
    <section className="rounded-lg border border-slate-800 bg-slate-900 p-5">
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="mt-2 text-sm text-slate-400">{message}</p>
    </section>
  );
}

function AssignSubjectForm({
  itemId,
  blockType,
  subjects,
  languages,
  exercises,
  books
}: {
  itemId: string;
  blockType: RoutineBlockType;
  subjects: { id: string; name: string }[];
  languages: { id: string; name: string }[];
  exercises: { id: string; name: string }[];
  books: { id: string; title: string }[];
}) {
  const options = getAssignOptions(blockType, { subjects, languages, exercises, books });
  const label = getBlockTypeLabel(blockType);

  if (options.length === 0) {
    return (
      <p className="inline-flex rounded-full bg-rose-300/10 px-3 py-1 text-xs font-semibold text-rose-200">
        No {label} found. Add one in the {label} page first.
      </p>
    );
  }

  return (
    <form action={assignDailySetupItem} className="flex flex-wrap items-center gap-2">
      <input name="id" type="hidden" value={itemId} />
      <select
        className="rounded-lg border border-sky-500/40 bg-sky-500/10 px-3 py-1.5 text-sm text-sky-100 focus:outline-none focus:ring-1 focus:ring-sky-400"
        name="referenceId"
        required
      >
        <option value="">Select {label}…</option>
        {options.map((opt) => (
          <option key={opt.id} value={opt.id}>
            {opt.label}
          </option>
        ))}
      </select>
      <button
        className="rounded-lg bg-sky-500/20 px-3 py-1.5 text-sm font-medium text-sky-100 transition hover:bg-sky-500/30"
        type="submit"
      >
        Assign
      </button>
    </form>
  );
}

function getAssignOptions(
  blockType: RoutineBlockType,
  data: {
    subjects: { id: string; name: string }[];
    languages: { id: string; name: string }[];
    exercises: { id: string; name: string }[];
    books: { id: string; title: string }[];
  }
): { id: string; label: string }[] {
  if (blockType === "study") return data.subjects.map((s) => ({ id: s.id, label: s.name }));
  if (blockType === "language") return data.languages.map((l) => ({ id: l.id, label: l.name }));
  if (blockType === "exercise") return data.exercises.map((e) => ({ id: e.id, label: e.name }));
  if (blockType === "book") return data.books.map((b) => ({ id: b.id, label: b.title }));
  return [];
}
