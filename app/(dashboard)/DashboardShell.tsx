"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { logout } from "./actions";

const navGroups = [
  {
    label: "Today",
    items: [
      { href: "/", label: "Home", short: "H" },
      { href: "/routine/templates", label: "Templates", short: "T" },
      { href: "/settings", label: "Settings", short: "G" }
    ]
  },
  {
    label: "Track",
    items: [
      { href: "/deepwork", label: "Study", short: "S" },
      { href: "/language", label: "Language", short: "L" },
      { href: "/exercise", label: "Exercise", short: "E" },
      { href: "/book", label: "Book", short: "B" },
      { href: "/journaling", label: "Journaling", short: "J" },
      { href: "/sleep", label: "Sleep", short: "Z" }
    ]
  },
  {
    label: "Plan",
    items: [
      { href: "/todo", label: "Todo", short: "D" },
      { href: "/stats", label: "Stats", short: "A" }
    ]
  }
];

export function DashboardShell({
  children,
  profileName
}: {
  children: React.ReactNode;
  profileName: string;
}) {
  const pathname = usePathname();

  return (
    <main className="min-h-screen bg-[#080a0f] text-slate-50">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(20,184,166,0.16),transparent_34%),radial-gradient(circle_at_top_right,rgba(245,158,11,0.10),transparent_30%)]" />
      <div className="relative mx-auto flex min-h-screen max-w-7xl gap-6 px-4 py-4 lg:px-6">
        <aside className="sticky top-4 hidden h-[calc(100vh-2rem)] w-72 shrink-0 flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.055] shadow-2xl shadow-black/30 backdrop-blur lg:flex">
          <div className="border-b border-white/10 p-3">
            <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-teal-300 to-amber-300 text-sm font-black text-slate-950 shadow-lg shadow-teal-950/30">
                DR
              </div>
              <div>
                <p className="text-sm font-semibold tracking-wide text-slate-100">
                  Daily Routine
                </p>
                <p className="max-w-[180px] truncate text-xs text-slate-400">
                  {profileName}
                </p>
              </div>
            </div>
          </div>

          <nav className="min-h-0 flex-1 space-y-2 overflow-y-auto px-3 py-3">
            {navGroups.map((group) => (
              <div key={group.label}>
                <p className="px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  {group.label}
                </p>
                <div className="mt-1 space-y-1">
                  {group.items.map((item) => (
                    <NavLink
                      href={item.href}
                      isActive={isActivePath(pathname, item.href)}
                      key={item.href}
                      label={item.label}
                      short={item.short}
                    />
                  ))}
                </div>
              </div>
            ))}
            <form action={logout} className="border-t border-white/10 pt-3">
              <button
                className="w-full rounded-xl border border-white/10 px-3 py-2 text-sm font-medium text-slate-200 transition hover:border-red-300/50 hover:bg-red-500/10 hover:text-red-100"
                type="submit"
              >
                Logout
              </button>
            </form>
          </nav>
        </aside>

        <section className="min-w-0 flex-1">
          <header className="sticky top-3 z-20 mb-5 rounded-2xl border border-white/10 bg-[#10141f]/90 p-3 shadow-xl shadow-black/20 backdrop-blur lg:hidden">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-teal-300 to-amber-300 text-xs font-black text-slate-950">
                  DR
                </div>
                <div>
                  <p className="text-sm font-semibold">Daily Routine</p>
                  <p className="text-xs text-slate-400">{profileName}</p>
                </div>
              </div>
              <details className="relative">
                <summary className="cursor-pointer list-none rounded-xl border border-white/10 px-3 py-2 text-sm font-medium">
                  Menu
                </summary>
                <div className="absolute right-0 mt-2 w-64 rounded-xl border border-white/10 bg-[#10141f] p-2 shadow-2xl">
                  {navGroups.flatMap((group) =>
                    group.items.map((item) => (
                      <Link
                        className={mobileNavClass(isActivePath(pathname, item.href))}
                        href={item.href}
                        key={item.href}
                      >
                        {item.label}
                      </Link>
                    ))
                  )}
                  <form action={logout} className="mt-2 border-t border-white/10 pt-2">
                    <button
                      className="w-full rounded-lg px-3 py-2 text-left text-sm text-slate-300"
                      type="submit"
                    >
                      Logout
                    </button>
                  </form>
                </div>
              </details>
            </div>
          </header>

          <div className="mx-auto max-w-6xl py-4 lg:py-8">{children}</div>
        </section>
      </div>
    </main>
  );
}

function NavLink({
  href,
  isActive,
  label,
  short
}: {
  href: string;
  isActive: boolean;
  label: string;
  short: string;
}) {
  return (
    <Link
      className={[
        "group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition",
        isActive
          ? "bg-white text-slate-950 shadow-lg shadow-black/20"
          : "text-slate-300 hover:bg-white/10 hover:text-white"
      ].join(" ")}
      href={href}
    >
      <span
        className={[
          "grid h-6 w-6 place-items-center rounded-lg text-[11px] font-bold transition",
          isActive
            ? "bg-slate-950 text-teal-200"
            : "bg-white/10 text-slate-400 group-hover:bg-white/15 group-hover:text-slate-100"
        ].join(" ")}
      >
        {short}
      </span>
      <span>{label}</span>
    </Link>
  );
}

function isActivePath(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function mobileNavClass(isActive: boolean) {
  return [
    "block rounded-lg px-3 py-2 text-sm font-medium",
    isActive ? "bg-white text-slate-950" : "text-slate-300 hover:bg-white/10"
  ].join(" ");
}
