"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireUser } from "@/lib/auth/session";
import { normalizeRoutineItemId } from "@/lib/activity-logs/service";
import { normalizeOptionalText } from "@/lib/activity-logs/validation";
import { prisma } from "@/lib/prisma";

export async function createJournalLog(formData: FormData) {
  const user = await requireUser();
  const dailyRoutineItemId = normalizeRoutineItemId(formData.get("dailyRoutineItemId"));

  if (!dailyRoutineItemId) {
    return redirect("/journaling?error=Select a completed journal item.");
  }

  try {
    await prisma.$transaction(async (tx) => {
      const routineItem = await tx.dailyRoutineItem.findFirst({
        where: {
          id: dailyRoutineItemId,
          blockType: { in: ["morning_journal", "night_journal"] },
          isCompleted: true,
          isSkipped: false,
          isSetupPlaceholder: false,
          dailyRoutine: { userId: user.id }
        },
        select: {
          id: true,
          blockType: true,
          dailyRoutine: { select: { routineDate: true } }
        }
      });

      if (!routineItem) {
        throw new Error("Invalid journal item.");
      }

      const existingLog = await tx.journalLog.findFirst({
        where: { dailyRoutineItemId: routineItem.id }
      });
      if (existingLog) {
        throw new Error("A journal entry already exists for this routine item.");
      }

      await tx.journalLog.create({
        data: {
          userId: user.id,
          dailyRoutineItemId: routineItem.id,
          logDate: routineItem.dailyRoutine.routineDate,
          journalType: routineItem.blockType === "morning_journal" ? "morning" : "night",
          plans: normalizeOptionalText(String(formData.get("plans") ?? "")),
          reflection: normalizeOptionalText(String(formData.get("reflection") ?? "")),
          notes: normalizeOptionalText(String(formData.get("notes") ?? ""))
        }
      });
    });
  } catch {
    return redirect("/journaling?error=Unable to save journal detail.");
  }

  revalidatePath("/journaling");
  return redirect("/journaling?message=Journal detail saved.");
}

export async function updateJournalLog(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");

  if (!id) {
    return redirect("/journaling?error=Invalid journal log.");
  }

  await prisma.journalLog.updateMany({
    where: { id, userId: user.id },
    data: {
      plans: normalizeOptionalText(String(formData.get("plans") ?? "")),
      reflection: normalizeOptionalText(String(formData.get("reflection") ?? "")),
      notes: normalizeOptionalText(String(formData.get("notes") ?? ""))
    }
  });

  revalidatePath("/journaling");
  return redirect("/journaling?message=Journal detail updated.");
}
