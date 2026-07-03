import { requireUser } from "@/lib/auth/session";
import { formatMinutes, getPendingRoutineItemsForType } from "@/lib/activity-logs/page-data";
import { prisma } from "@/lib/prisma";

import {
  createBookItem,
  createBookLog,
  deleteBookItem,
  updateBookItemStatus,
  updateBookLog
} from "./actions";

type SearchParams = { error?: string; message?: string };
type BookStatus = "reading" | "completed" | "paused";

export default async function BookPage({ searchParams }: { searchParams?: SearchParams }) {
  const user = await requireUser();
  const [books, routineItems, logs] = await Promise.all([
    prisma.book.findMany({ where: { userId: user.id }, orderBy: { title: "asc" } }),
    getPendingRoutineItemsForType(user.id, "book"),
    prisma.bookLog.findMany({ where: { userId: user.id }, include: { book: true }, orderBy: { createdAt: "desc" } })
  ]);
  const totals = books.map((book) => {
    const bookLogs = logs.filter((log) => log.book.id === book.id);
    return { id: book.id, title: book.title, durationMinutes: bookLogs.reduce((total, log) => total + log.durationMinutes, 0), logs: bookLogs };
  });

  return <section className="space-y-5"><Header title="Book Details" error={searchParams?.error} message={searchParams?.message} /><Master books={books} /><Pending items={routineItems} /><Totals totals={totals} /><History logs={logs} /></section>;
}

function Header({ error, message, title }: { error?: string; message?: string; title: string }) { return <><div><h1 className="text-3xl font-semibold">{title}</h1><p className="mt-2 text-slate-300">Manage books, fill details for completed routine items, and track accumulated reading duration.</p></div>{error ? <p className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</p> : null}{message ? <p className="rounded-md border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">{message}</p> : null}</>; }
function Master({ books }: { books: { id: string; title: string; author: string | null; status: BookStatus }[] }) { return <section className="rounded-lg border border-slate-800 bg-slate-900 p-5"><h2 className="text-xl font-semibold">Books</h2><form action={createBookItem} className="mt-4 grid gap-3 md:grid-cols-[1fr_1fr_auto]"><label className="grid gap-1 text-sm">Title<input className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-50" name="title" placeholder="Atomic Habits" required /></label><label className="grid gap-1 text-sm">Author<input className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-50" name="author" placeholder="James Clear" /></label><button className="self-end rounded-md bg-primary px-4 py-2 font-medium text-white" type="submit">Add Book</button></form>{books.length === 0 ? <p className="mt-3 text-sm text-slate-400">No books yet.</p> : <div className="mt-4 space-y-2">{books.map((book) => <div className="flex flex-col gap-3 rounded-md border border-slate-800 bg-slate-950 p-3 md:flex-row md:items-center md:justify-between" key={book.id}><div><p className="font-medium">{book.title}</p><p className="text-sm text-slate-400">{book.author ?? "No author"}</p></div><div className="flex flex-wrap gap-2"><form action={updateBookItemStatus}><input name="id" type="hidden" value={book.id} /><select className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-50" defaultValue={book.status} name="status"><option value="reading">Reading</option><option value="completed">Completed</option><option value="paused">Paused</option></select><button className="ml-2 rounded-md border border-slate-700 px-3 py-2 text-sm" type="submit">Save</button></form><form action={deleteBookItem}><input name="id" type="hidden" value={book.id} /><button className="rounded-md border border-red-500/50 px-3 py-2 text-sm text-red-200" type="submit">Delete</button></form></div></div>)}</div>}</section>; }
function Pending({ items }: { items: { id: string; displayName: string; durationMinutes: number }[] }) { return <section className="rounded-lg border border-slate-800 bg-slate-900 p-5"><h2 className="text-xl font-semibold">Pending Book Details</h2>{items.length === 0 ? <p className="mt-2 text-sm text-slate-400">No completed book items are waiting for details.</p> : <div className="mt-4 space-y-3">{items.map((item) => <form action={createBookLog} className="grid gap-3 rounded-md border border-slate-800 bg-slate-950 p-4" key={item.id}><input name="dailyRoutineItemId" type="hidden" value={item.id} /><h3 className="font-medium">{item.displayName}</h3><Input defaultValue={String(item.durationMinutes)} label="Duration Minutes" name="durationMinutes" type="number" /><Input label="Pages Read" name="pagesRead" type="number" /><Textarea label="Notes" name="notes" /><Button label="Save Book Detail" /></form>)}</div>}</section>; }
function Totals({ totals }: { totals: { id: string; title: string; durationMinutes: number; logs: BookLogWithBook[] }[] }) { return <section className="rounded-lg border border-slate-800 bg-slate-900 p-5"><h2 className="text-xl font-semibold">Total Duration</h2>{totals.length === 0 ? <p className="mt-2 text-sm text-slate-400">No reading duration yet.</p> : <div className="mt-4 space-y-3">{totals.map((item) => <details className="rounded-md border border-slate-800 bg-slate-950 p-3" key={item.id}><summary className="cursor-pointer font-medium">{item.title}: {formatMinutes(item.durationMinutes)}</summary><ul className="mt-3 space-y-2 text-sm text-slate-300">{item.logs.length === 0 ? <li>No history yet.</li> : item.logs.map((log) => <li key={log.id}>{log.logDate.toISOString().slice(0, 10)} - {formatMinutes(log.durationMinutes)}{log.notes ? ` - ${log.notes}` : ""}</li>)}</ul></details>)}</div>}</section>; }
function History({ logs }: { logs: BookLogWithBook[] }) { return <section className="rounded-lg border border-slate-800 bg-slate-900 p-5"><h2 className="text-xl font-semibold">History</h2>{logs.length === 0 ? <p className="mt-2 text-sm text-slate-400">No logs yet.</p> : <div className="mt-4 space-y-3">{logs.slice(0, 10).map((log) => <form action={updateBookLog} className="grid gap-3 rounded-md border border-slate-800 bg-slate-950 p-4" key={log.id}><input name="id" type="hidden" value={log.id} /><h3 className="font-medium">{log.book.title} - {log.logDate.toISOString().slice(0, 10)}</h3><Input defaultValue={String(log.durationMinutes)} label="Duration Minutes" name="durationMinutes" type="number" /><Input defaultValue={log.pagesRead ? String(log.pagesRead) : ""} label="Pages Read" name="pagesRead" type="number" /><Textarea defaultValue={log.notes ?? ""} label="Notes" name="notes" /><Button label="Update Book Detail" /></form>)}</div>}</section>; }
function Input({ defaultValue, label, name, type = "text" }: { defaultValue?: string; label: string; name: string; type?: string }) { return <label className="grid gap-1 text-sm">{label}<input className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-50" defaultValue={defaultValue} name={name} required={name === "durationMinutes"} type={type} /></label>; }
function Textarea({ defaultValue, label, name }: { defaultValue?: string; label: string; name: string }) { return <label className="grid gap-1 text-sm">{label}<textarea className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-50" defaultValue={defaultValue} name={name} rows={3} /></label>; }
function Button({ label }: { label: string }) { return <button className="rounded-md bg-primary px-4 py-2 font-medium text-white" type="submit">{label}</button>; }

type BookLogWithBook = { id: string; logDate: Date; durationMinutes: number; pagesRead: number | null; notes: string | null; book: { id: string; title: string } };
