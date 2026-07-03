import { requireUser } from "@/lib/auth/session";
import { formatMinutes, getTodayDateString } from "@/lib/activity-logs/page-data";
import { prisma } from "@/lib/prisma";

import { createSleepLog } from "./actions";

type SearchParams = { error?: string; message?: string };

export default async function SleepPage({ searchParams }: { searchParams?: SearchParams }) {
  const user = await requireUser();
  const logs = await prisma.sleepLog.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 7
  });

  return (
    <section className="space-y-5">
      <Header title="Sleep Log" error={searchParams?.error} message={searchParams?.message} />
      <form action={createSleepLog} className="grid gap-3 rounded-lg border border-slate-800 bg-slate-900 p-5">
        <Input label="Wake Date" name="wakeDate" type="date" defaultValue={getTodayDateString()} />
        <Input label="Sleep Time" name="sleepTime" type="time" />
        <Input label="Wake Time" name="wakeTime" type="time" />
        <Textarea label="Notes" name="notes" />
        <Button label="Save Sleep Log" />
      </form>
      <Recent
        title="Recent Sleep Logs"
        logs={logs.map((log) => `${log.wakeDate.toISOString().slice(0, 10)} - ${formatMinutes(log.durationMinutes)}${log.notes ? ` - ${log.notes}` : ""}`)}
      />
    </section>
  );
}

function Header({ error, message, title }: { error?: string; message?: string; title: string }) {
  return <><div><h1 className="text-3xl font-semibold">{title}</h1><p className="mt-2 text-slate-300">Track sleep manually for monitoring. Sleep does not affect routine checklist score.</p></div>{error ? <p className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</p> : null}{message ? <p className="rounded-md border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">{message}</p> : null}</>;
}

function Input({ defaultValue, label, name, type = "text" }: { defaultValue?: string; label: string; name: string; type?: string }) {
  return <label className="grid gap-1 text-sm">{label}<input className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-50" defaultValue={defaultValue} name={name} required type={type} /></label>;
}

function Textarea({ label, name }: { label: string; name: string }) {
  return <label className="grid gap-1 text-sm">{label}<textarea className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-50" name={name} rows={3} /></label>;
}

function Button({ label }: { label: string }) {
  return <button className="rounded-md bg-primary px-4 py-2 font-medium text-white" type="submit">{label}</button>;
}

function Recent({ logs, title }: { logs: string[]; title: string }) {
  return <section className="rounded-lg border border-slate-800 bg-slate-900 p-5"><h2 className="text-xl font-semibold">{title}</h2>{logs.length === 0 ? <p className="mt-2 text-sm text-slate-400">No logs yet.</p> : <ul className="mt-3 space-y-2 text-sm text-slate-300">{logs.map((log, index) => <li className="rounded-md border border-slate-800 bg-slate-950 px-3 py-2" key={`${log}-${index}`}>{log}</li>)}</ul>}</section>;
}
