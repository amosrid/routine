import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

type SearchParams = {
  error?: string;
  message?: string;
};

export default async function SettingsPage({
  searchParams
}: {
  searchParams?: SearchParams;
}) {
  const user = await requireUser();
  const profile = await prisma.profile.findUnique({ where: { id: user.id } });
  const profileName = profile?.fullName || profile?.displayName || user.email || "User";

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Settings</h1>
        <p className="mt-2 text-slate-300">
          Profile and application preferences live here. Category master data is managed from each category page.
        </p>
      </div>

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

      <section className="rounded-lg border border-slate-800 bg-slate-900 p-5">
        <h2 className="text-xl font-semibold">Profile</h2>
        <div className="mt-4 grid gap-3 text-sm text-slate-300">
          <p>Name: {profileName}</p>
          <p>Email: {user.email}</p>
        </div>
      </section>

      <section className="rounded-lg border border-slate-800 bg-slate-900 p-5">
        <h2 className="text-xl font-semibold">Preferences</h2>
        <p className="mt-2 text-sm text-slate-400">
          Routine preferences and history settings can be added here after the revised core flow is stable.
        </p>
      </section>
    </section>
  );
}
