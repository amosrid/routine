import Link from "next/link";

import { register } from "./actions";

export default function RegisterPage({
  searchParams
}: {
  searchParams?: { error?: string; fullName?: string; email?: string };
}) {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <section className="w-full max-w-sm rounded-lg border border-slate-700 bg-slate-900 p-6">
        <h1 className="text-2xl font-semibold">Register</h1>
        <p className="mt-2 text-sm text-slate-300">
          Create an account to start building your routine.
        </p>

        {searchParams?.error ? (
          <p className="mt-4 rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-200">
            {searchParams.error}
          </p>
        ) : null}

        <form action={register} className="mt-6 space-y-4">
          <label className="block text-sm">
            Full name
            <input
              autoComplete="name"
              className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-50"
              defaultValue={searchParams?.fullName ?? ""}
              name="fullName"
              required
            />
          </label>
          <label className="block text-sm">
            Email
            <input
              autoComplete="email"
              className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-50"
              defaultValue={searchParams?.email ?? ""}
              name="email"
              type="email"
              required
            />
          </label>
          <label className="block text-sm">
            Password
            <input
              autoComplete="new-password"
              className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-50"
              name="password"
              type="password"
              minLength={8}
              required
            />
          </label>
          <label className="block text-sm">
            Confirm password
            <input
              autoComplete="new-password"
              className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-50"
              name="confirmPassword"
              type="password"
              minLength={8}
              required
            />
          </label>
          <button
            className="w-full rounded-md bg-primary px-4 py-2 font-medium text-white"
            type="submit"
          >
            Register
          </button>
        </form>

        <p className="mt-4 text-sm text-slate-300">
          Already have an account?{" "}
          <Link className="font-medium text-indigo-300" href="/login">
            Log in
          </Link>
        </p>
      </section>
    </main>
  );
}
