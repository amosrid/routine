import Link from "next/link";

import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

import {
  clearCompletedTodos,
  createTodo,
  deleteTodo,
  toggleTodo
} from "./actions";

type SearchParams = {
  error?: string;
  filter?: string;
  message?: string;
};

export default async function TodoPage({ searchParams }: { searchParams?: SearchParams }) {
  const user = await requireUser();
  const filter = searchParams?.filter ?? "all";
  const where = {
    userId: user.id,
    ...(filter === "active" ? { isCompleted: false } : {}),
    ...(filter === "completed" ? { isCompleted: true } : {})
  };
  const [todos, completedCount] = await Promise.all([
    prisma.todoItem.findMany({
      where,
      orderBy: [{ isCompleted: "asc" }, { dueDate: "asc" }, { createdAt: "desc" }]
    }),
    prisma.todoItem.count({ where: { userId: user.id, isCompleted: true } })
  ]);

  return (
    <section className="space-y-5">
      <div>
        <h1 className="text-3xl font-semibold">Todo</h1>
        <p className="mt-2 text-slate-300">Capture small tasks without mixing them into routine score.</p>
      </div>

      {searchParams?.error ? <Message tone="error" text={searchParams.error} /> : null}
      {searchParams?.message ? <Message tone="success" text={searchParams.message} /> : null}

      <form action={createTodo} className="grid gap-3 rounded-lg border border-slate-800 bg-slate-900 p-5 md:grid-cols-[1fr_auto_auto]">
        <label className="grid gap-1 text-sm">
          Title
          <input className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-50" name="title" placeholder="Write portfolio update" required />
        </label>
        <label className="grid gap-1 text-sm">
          Due Date
          <input className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-50" name="dueDate" type="date" />
        </label>
        <button className="self-end rounded-md bg-primary px-4 py-2 font-medium text-white" type="submit">
          Add Todo
        </button>
      </form>

      <div className="flex flex-wrap items-center gap-2">
        {["all", "active", "completed"].map((item) => (
          <Link
            className={`rounded-md border px-3 py-2 text-sm ${filter === item ? "border-primary text-white" : "border-slate-700 text-slate-300"}`}
            href={`/todo?filter=${item}`}
            key={item}
          >
            {item === "all" ? "All" : item === "active" ? "Active" : "Completed"}
          </Link>
        ))}
        <form action={clearCompletedTodos}>
          <button className="rounded-md border border-slate-700 px-3 py-2 text-sm disabled:opacity-40" disabled={completedCount === 0} type="submit">
            Clear Completed
          </button>
        </form>
      </div>

      <section className="space-y-3">
        {todos.length === 0 ? (
          <p className="rounded-lg border border-slate-800 bg-slate-900 p-5 text-sm text-slate-400">
            No todo items here.
          </p>
        ) : (
          todos.map((todo) => (
            <article className="flex flex-col gap-3 rounded-lg border border-slate-800 bg-slate-900 p-4 md:flex-row md:items-center md:justify-between" key={todo.id}>
              <div>
                <p className={todo.isCompleted ? "text-slate-400 line-through" : "text-slate-50"}>{todo.title}</p>
                <p className="text-sm text-slate-400">
                  {todo.dueDate ? `Due ${todo.dueDate.toISOString().slice(0, 10)}` : "No due date"}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <form action={toggleTodo}>
                  <input name="id" type="hidden" value={todo.id} />
                  <input name="isCompleted" type="hidden" value={(!todo.isCompleted).toString()} />
                  <button className="rounded-md border border-slate-700 px-3 py-2 text-sm" type="submit">
                    {todo.isCompleted ? "Mark Active" : "Mark Completed"}
                  </button>
                </form>
                <form action={deleteTodo}>
                  <input name="id" type="hidden" value={todo.id} />
                  <button className="rounded-md border border-red-500/50 px-3 py-2 text-sm text-red-200" type="submit">
                    Delete
                  </button>
                </form>
              </div>
            </article>
          ))
        )}
      </section>
    </section>
  );
}

function Message({ text, tone }: { text: string; tone: "error" | "success" }) {
  return (
    <p className={`rounded-md border px-3 py-2 text-sm ${tone === "error" ? "border-red-500/40 bg-red-500/10 text-red-200" : "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"}`}>
      {text}
    </p>
  );
}
