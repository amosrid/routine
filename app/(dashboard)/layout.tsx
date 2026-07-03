import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

import { DashboardShell } from "./DashboardShell";

export default async function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  const profile = await prisma.profile.findUnique({
    where: { id: user.id }
  });
  const profileName = profile?.fullName || profile?.displayName || user.email || "User";

  return <DashboardShell profileName={profileName}>{children}</DashboardShell>;
}
