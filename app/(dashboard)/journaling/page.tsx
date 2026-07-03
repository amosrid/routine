import { requireUser } from "@/lib/auth/session";
import { getPendingRoutineItemsForType } from "@/lib/activity-logs/page-data";
import { prisma } from "@/lib/prisma";

import { createJournalLog, updateJournalLog } from "./actions";

type SearchParams = { error?: string; message?: string };

export default async function JournalingPage({ searchParams }: { searchParams?: SearchParams }) {
  const user = await requireUser();
  const [morningItems, nightItems, logs] = await Promise.all([
    getPendingRoutineItemsForType(user.id, "morning_journal"),
    getPendingRoutineItemsForType(user.id, "night_journal"),
    prisma.journalLog.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 7
    })
  ]);
  const pendingItems = [...morningItems, ...nightItems];

  return (
    <section className="space-y-5">
      <Header title="Journaling Details" error={searchParams?.error} message={searchParams?.message} />
      <section className="rounded-lg border border-slate-800 bg-slate-900 p-5">
        <h2 className="text-xl font-semibold">Pending Journal Details</h2>
        {pendingItems.length === 0 ? (
          <p className="mt-2 text-sm text-slate-400">
            No completed journal items are waiting for details.
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {pendingItems.map((item) => (
              <form action={createJournalLog} className="grid gap-3 rounded-md border border-slate-800 bg-slate-950 p-4" key={item.id}>
                <input name="dailyRoutineItemId" type="hidden" value={item.id} />
                <h3 className="font-medium">{item.displayName}</h3>
                <Textarea label="Plans" name="plans" />
                <Textarea label="Reflection" name="reflection" />
                <Textarea label="Notes" name="notes" />
                <button className="rounded-md bg-primary px-4 py-2 font-medium text-white" type="submit">
                  Save Journal Detail
                </button>
              </form>
            ))}
          </div>
        )}
      </section>
       <section className="rounded-lg border border-slate-800 bg-slate-900 p-5">
        <h2 className="text-xl font-semibold">History</h2>
        {logs.length === 0 ? (
          <p className="mt-2 text-sm text-slate-400">No logs yet.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {logs.map((log) => (
              <form action={updateJournalLog} className="grid gap-3 rounded-md border border-slate-800 bg-slate-950 p-4" key={log.id}>
                <input name="id" type="hidden" value={log.id} />
                <h3 className="font-medium">
                  {log.journalType === "morning" ? "Morning Journal" : "Night Journal"} - {log.logDate.toISOString().slice(0, 10)}
                </h3>
                <Textarea defaultValue={log.plans ?? ""} label="Plans" name="plans" />
                <Textarea defaultValue={log.reflection ?? ""} label="Reflection" name="reflection" />
                <Textarea defaultValue={log.notes ?? ""} label="Notes" name="notes" />
                <button className="rounded-md bg-primary px-4 py-2 font-medium text-white" type="submit">
                  Update Journal Detail
                </button>
              </form>
            ))}
          </div>
        )}
      </section>
    </section>
  );
}

function Header({ error, message, title }: { error?: string; message?: string; title: string }) {
  return <><div><h1 className="text-3xl font-semibold">{title}</h1><p className="mt-2 text-slate-300">Fill details for completed routine items. New detail forms appear after you complete an item on Home.</p></div>{error ? <p className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</p> : null}{message ? <p className="rounded-md border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">{message}</p> : null}</>;
}

function Textarea({ defaultValue, label, name }: { defaultValue?: string; label: string; name: string }) {
  return <label className="grid gap-1 text-sm">{label}<textarea className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-50" defaultValue={defaultValue} name={name} rows={3} /></label>;
}
