import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import {
  calculateAverageScore,
  formatMinutes,
  sumDurationsByLabel
} from "@/lib/stats/summary";

export default async function StatsPage() {
  const user = await requireUser();
  const since7 = daysAgo(7);
  const since30 = daysAgo(30);
  const since90 = daysAgo(90);
  const [routines7, routines30, studyLogs, languageLogs, exerciseLogs, bookLogs, sleepLogs] =
    await Promise.all([
      prisma.dailyRoutine.findMany({
        where: { userId: user.id, routineDate: { gte: since7 } },
        orderBy: { routineDate: "asc" }
      }),
      prisma.dailyRoutine.findMany({
        where: { userId: user.id, routineDate: { gte: since30 } },
        orderBy: { routineDate: "asc" }
      }),
      prisma.studyLog.findMany({ where: { userId: user.id, logDate: { gte: since90 } }, include: { subject: true }, orderBy: { logDate: "desc" } }),
      prisma.languageLog.findMany({ where: { userId: user.id, logDate: { gte: since90 } }, include: { language: true }, orderBy: { logDate: "desc" } }),
      prisma.exerciseLog.findMany({ where: { userId: user.id, logDate: { gte: since90 } }, include: { exerciseType: true }, orderBy: { logDate: "desc" } }),
      prisma.bookLog.findMany({ where: { userId: user.id, logDate: { gte: since90 } }, include: { book: true }, orderBy: { logDate: "desc" } }),
      prisma.sleepLog.findMany({
        where: { userId: user.id, wakeDate: { gte: since30 } },
        orderBy: { wakeDate: "desc" }
      })
    ]);

  const weeklyAverage = calculateAverageScore(routines7.map((routine) => routine.scorePercentage));
  const monthlyAverage = calculateAverageScore(routines30.map((routine) => routine.scorePercentage));
  const sleep7 = sleepLogs.filter((log) => log.wakeDate >= since7);

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Statistics</h1>
        <p className="mt-2 text-slate-300">Review score trends and accumulated activity time.</p>
      </div>

      <section className="grid gap-3 md:grid-cols-3">
        <Metric label="Average Score This Week" value={`${weeklyAverage}%`} />
        <Metric label="Average Score This Month" value={`${monthlyAverage}%`} />
        <Metric label="Tracked Days" value={String(routines30.length)} />
      </section>

      <section className="rounded-lg border border-slate-800 bg-slate-900 p-5">
        <h2 className="text-xl font-semibold">Daily Scores</h2>
        {routines30.length === 0 ? (
          <p className="mt-2 text-sm text-slate-400">No score history yet.</p>
        ) : (
          <div className="mt-4 space-y-2">
            {routines30.map((routine) => (
              <div className="grid grid-cols-[110px_1fr_50px] items-center gap-3 text-sm" key={routine.id}>
                <span className="text-slate-400">{routine.routineDate.toISOString().slice(0, 10)}</span>
                <div className="h-2 rounded bg-slate-800">
                  <div className="h-2 rounded bg-primary" style={{ width: `${routine.scorePercentage}%` }} />
                </div>
                <span className="text-right">{routine.scorePercentage}%</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <DurationList title="Study Duration" items={sumDurationsByLabel(studyLogs.map((log) => ({ label: log.subject.name, durationMinutes: log.durationMinutes })))} />
        <DurationList title="Language Duration" items={sumDurationsByLabel(languageLogs.map((log) => ({ label: log.language.name, durationMinutes: log.durationMinutes })))} />
        <DurationList title="Exercise Duration" items={sumDurationsByLabel(exerciseLogs.map((log) => ({ label: log.exerciseType.name, durationMinutes: log.durationMinutes })))} />
        <DurationList title="Book Duration" items={sumDurationsByLabel(bookLogs.map((log) => ({ label: log.book.title, durationMinutes: log.durationMinutes })))} />
      </section>

      <section className="grid gap-3 md:grid-cols-2">
        <Metric label="Average Sleep Last 7 Days" value={formatMinutes(calculateAverage(sleep7.map((log) => log.durationMinutes)))} />
        <Metric label="Average Sleep Last 30 Days" value={formatMinutes(calculateAverage(sleepLogs.map((log) => log.durationMinutes)))} />
      </section>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-lg border border-slate-800 bg-slate-900 p-5"><p className="text-sm text-slate-400">{label}</p><p className="mt-1 text-2xl font-semibold">{value}</p></div>;
}

function DurationList({ items, title }: { items: { label: string; durationMinutes: number }[]; title: string }) {
  return <section className="rounded-lg border border-slate-800 bg-slate-900 p-5"><h2 className="text-xl font-semibold">{title}</h2>{items.length === 0 ? <p className="mt-2 text-sm text-slate-400">No activity yet.</p> : <ul className="mt-3 space-y-2 text-sm">{items.map((item) => <li className="flex justify-between rounded-md border border-slate-800 bg-slate-950 px-3 py-2" key={item.label}><span>{item.label}</span><span>{formatMinutes(item.durationMinutes)}</span></li>)}</ul>}</section>;
}

function daysAgo(days: number): Date {
  // Get today's date in Jakarta timezone
  const jakartaFormatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  });
  const todayJakarta = jakartaFormatter.format(new Date());
  // Subtract days and return as UTC midnight
  const date = new Date(`${todayJakarta}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() - days + 1);
  return date;
}

function calculateAverage(values: number[]): number {
  if (values.length === 0) return 0;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}
