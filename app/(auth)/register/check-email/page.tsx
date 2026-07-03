import Link from "next/link";

export default function CheckEmailPage({
  searchParams
}: {
  searchParams?: { email?: string };
}) {
  const email = searchParams?.email ?? "your email address";

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <section className="w-full max-w-sm rounded-lg border border-slate-700 bg-slate-900 p-6">
        <h1 className="text-2xl font-semibold">Check your email</h1>
        <p className="mt-3 text-sm text-slate-300">
          We sent a confirmation link to {email}. Please confirm your account
          before signing in.
        </p>
        <Link
          className="mt-6 inline-flex w-full justify-center rounded-md bg-primary px-4 py-2 font-medium text-white"
          href="/login"
        >
          Back to Login
        </Link>
      </section>
    </main>
  );
}
