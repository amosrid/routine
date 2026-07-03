"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireUser } from "@/lib/auth/session";
import {
  completeLinkedRoutineItem,
  normalizeRoutineItemId
} from "@/lib/activity-logs/service";
import {
  calculateSleepDuration,
  dateStringToDate,
  normalizeOptionalText,
  timeStringToDate,
  validateWakeDate
} from "@/lib/activity-logs/validation";
import { prisma } from "@/lib/prisma";

export async function createSleepLog(formData: FormData) {
  const user = await requireUser();
  const wakeDate = validateWakeDate(String(formData.get("wakeDate") ?? ""));
  const sleepTime = String(formData.get("sleepTime") ?? "");
  const wakeTime = String(formData.get("wakeTime") ?? "");
  const duration = calculateSleepDuration(sleepTime, wakeTime);
  const dailyRoutineItemId = normalizeRoutineItemId(formData.get("dailyRoutineItemId"));

  if (!wakeDate.ok) return redirect(`/sleep?error=${encodeURIComponent(wakeDate.error)}`);
  if (!duration.ok) return redirect(`/sleep?error=${encodeURIComponent(duration.error)}`);

  try {
    await prisma.$transaction(async (tx) => {
      const linkedItemId = await completeLinkedRoutineItem({
        tx,
        userId: user.id,
        dailyRoutineItemId,
        expectedType: "sleep",
        durationMinutes: duration.value
      });

      await tx.sleepLog.create({
        data: {
          userId: user.id,
          dailyRoutineItemId: linkedItemId,
          wakeDate: dateStringToDate(wakeDate.value),
          sleepTime: timeStringToDate(sleepTime),
          wakeTime: timeStringToDate(wakeTime),
          durationMinutes: duration.value,
          notes: normalizeOptionalText(String(formData.get("notes") ?? ""))
        }
      });
    });
  } catch {
    return redirect("/sleep?error=Unable to save sleep log. You may already have a sleep log for that wake date.");
  }

  revalidatePath("/");
  revalidatePath("/sleep");
  return redirect("/sleep?message=Sleep log saved.");
}
