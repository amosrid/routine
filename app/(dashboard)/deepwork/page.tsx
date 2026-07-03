import { requireUser } from "@/lib/auth/session";
import { formatMinutes, getPendingRoutineItemsForType } from "@/lib/activity-logs/page-data";
import { prisma } from "@/lib/prisma";

import {
  createStudyLog,
  createStudySubject,
  deleteStudySubject,
  updateStudyLog
} from "./actions";

type SearchParams = { error?: string; message?: string };

export default async function DeepworkPage({ searchParams }: { searchParams?: SearchParams }) {
  const user = await requireUser();
  const [subjects, routineItems, logs] = await Promise.all([
    prisma.studySubject.findMany({ where: { userId: user.id }, orderBy: { name: "asc" } }),
    getPendingRoutineItemsForType(user.id, "study"),
    prisma.studyLog.findMany({
      where: { userId: user.id },
      include: { subject: true },
      orderBy: { createdAt: "desc" }
    })
  ]);
  const totals = sumStudyTotals(subjects, logs);

  return (
    <PageShell error={searchParams?.error} message={searchParams?.message} title="Study Details">
      <MasterSection subjects={subjects} />
      <PendingStudyDetails items={routineItems} />
      <TotalDurationSection totals={totals} />
      <HistorySection logs={logs} />
    </PageShell>
  );
}

function PageShell({ children, error, message, title }: { children: React.ReactNode; error?: string; message?: string; title: string }) {
  return <section className="space-y-5"><div><h1 className="text-3xl font-semibold">{title}</h1><p className="mt-2 text-slate-300">Manage study subjects, fill details for completed routine items, and track accumulated study duration.</p></div>{error ? <p className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</p> : null}{message ? <p className="rounded-md border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">{message}</p> : null}{children}</section>;
}

function MasterSection({ subjects }: { subjects: { id: string; name: string }[] }) {
  return <section className="rounded-lg border border-slate-800 bg-slate-900 p-5"><h2 className="text-xl font-semibold">Study Subjects</h2><form action={createStudySubject} className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]"><label className="grid gap-1 text-sm">Add Study Subject<input className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-50" name="name" placeholder="PHP, Laravel, Vibe Coding" required /></label><button className="self-end rounded-md bg-primary px-4 py-2 font-medium text-white" type="submit">Add</button></form>{subjects.length === 0 ? <p className="mt-3 text-sm text-slate-400">No study subjects yet.</p> : <ul className="mt-4 space-y-2">{subjects.map((subject) => <li className="flex items-center justify-between gap-3 rounded-md border border-slate-800 bg-slate-950 px-3 py-2" key={subject.id}><span>{subject.name}</span><form action={deleteStudySubject}><input name="id" type="hidden" value={subject.id} /><button className="text-sm text-red-200" type="submit">Delete</button></form></li>)}</ul>}</section>;
}

function PendingStudyDetails({ items }: { items: { id: string; displayName: string; durationMinutes: number }[] }) {
  return <section className="rounded-lg border border-slate-800 bg-slate-900 p-5"><h2 className="text-xl font-semibold">Pending Study Details</h2>{items.length === 0 ? <p className="mt-2 text-sm text-slate-400">No completed study items are waiting for details.</p> : <div className="mt-4 space-y-3">{items.map((item) => <form action={createStudyLog} className="grid gap-3 rounded-md border border-slate-800 bg-slate-950 p-4" key={item.id}><input name="dailyRoutineItemId" type="hidden" value={item.id} /><h3 className="font-medium">{item.displayName}</h3><Input defaultValue={String(item.durationMinutes)} label="Duration Minutes" name="durationMinutes" type="number" /><Input label="Activity" name="activity" /><Input label="Material" name="material" /><Textarea label="Summary" name="summary" /><Button label="Save Study Detail" /></form>)}</div>}</section>;
}

function TotalDurationSection({ totals }: { totals: { id: string; name: string; durationMinutes: number; logs: StudyLogWithSubject[] }[] }) {
  return <section className="rounded-lg border border-slate-800 bg-slate-900 p-5"><h2 className="text-xl font-semibold">Total Duration</h2>{totals.length === 0 ? <p className="mt-2 text-sm text-slate-400">No study duration yet.</p> : <div className="mt-4 space-y-3">{totals.map((item) => <details className="rounded-md border border-slate-800 bg-slate-950 p-3" key={item.id}><summary className="cursor-pointer font-medium">{item.name}: {formatMinutes(item.durationMinutes)}</summary><ul className="mt-3 space-y-2 text-sm text-slate-300">{item.logs.length === 0 ? <li>No history yet.</li> : item.logs.map((log) => <li key={log.id}>{log.logDate.toISOString().slice(0, 10)} - {formatMinutes(log.durationMinutes)}{log.summary ? ` - ${log.summary}` : ""}</li>)}</ul></details>)}</div>}</section>;
}

function HistorySection({ logs }: { logs: StudyLogWithSubject[] }) {
  return <section className="rounded-lg border border-slate-800 bg-slate-900 p-5"><h2 className="text-xl font-semibold">History</h2>{logs.length === 0 ? <p className="mt-2 text-sm text-slate-400">No logs yet.</p> : <div className="mt-4 space-y-3">{logs.slice(0, 10).map((log) => <form action={updateStudyLog} className="grid gap-3 rounded-md border border-slate-800 bg-slate-950 p-4" key={log.id}><input name="id" type="hidden" value={log.id} /><h3 className="font-medium">{log.subject.name} - {log.logDate.toISOString().slice(0, 10)}</h3><Input defaultValue={String(log.durationMinutes)} label="Duration Minutes" name="durationMinutes" type="number" /><Input defaultValue={log.activity ?? ""} label="Activity" name="activity" /><Input defaultValue={log.material ?? ""} label="Material" name="material" /><Textarea defaultValue={log.summary ?? ""} label="Summary" name="summary" /><Button label="Update Study Detail" /></form>)}</div>}</section>;
}

function Input({ defaultValue, label, name, type = "text" }: { defaultValue?: string; label: string; name: string; type?: string }) {
  return <label className="grid gap-1 text-sm">{label}<input className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-50" defaultValue={defaultValue} name={name} required={name === "durationMinutes"} type={type} /></label>;
}

function Textarea({ defaultValue, label, name }: { defaultValue?: string; label: string; name: string }) {
  return <label className="grid gap-1 text-sm">{label}<textarea className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-50" defaultValue={defaultValue} name={name} rows={3} /></label>;
}

function Button({ label }: { label: string }) {
  return <button className="rounded-md bg-primary px-4 py-2 font-medium text-white" type="submit">{label}</button>;
}

type StudyLogWithSubject = {
  id: string;
  logDate: Date;
  durationMinutes: number;
  activity: string | null;
  material: string | null;
  summary: string | null;
  subject: { id: string; name: string };
};

function sumStudyTotals(
  subjects: { id: string; name: string }[],
  logs: StudyLogWithSubject[]
) {
  return subjects.map((subject) => {
    const subjectLogs = logs.filter((log) => log.subject.id === subject.id);
    return {
      id: subject.id,
      name: subject.name,
      durationMinutes: subjectLogs.reduce((total, log) => total + log.durationMinutes, 0),
      logs: subjectLogs
    };
  });
}
