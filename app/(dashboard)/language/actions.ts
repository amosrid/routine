"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireUser } from "@/lib/auth/session";
import {
  completeLinkedRoutineItem,
  normalizeRoutineItemId
} from "@/lib/activity-logs/service";
import {
  normalizeOptionalText,
  validateActivityDuration
} from "@/lib/activity-logs/validation";
import { validateMasterName } from "@/lib/master-data/validation";
import { prisma } from "@/lib/prisma";
import { getJakartaDateParts } from "@/lib/daily-routine/core";
import { dateStringToDate } from "@/lib/daily-routine/service";

export async function createLanguage(formData: FormData) {
  const user = await requireUser();
  const validation = validateMasterName(String(formData.get("name") ?? ""));

  if (!validation.ok) return redirect(`/language?error=${encodeURIComponent(validation.error)}`);

  try {
    await prisma.userLanguage.create({
      data: {
        userId: user.id,
        name: validation.value.name,
        nameNormalized: validation.value.normalizedName
      }
    });
  } catch {
    return redirect("/language?error=Language already exists.");
  }

  revalidatePath("/");
  revalidatePath("/language");
  return redirect("/language?message=Language added.");
}

export async function deleteLanguage(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");

  if (!id) return redirect("/language?error=Invalid language.");

  const todayDate = dateStringToDate(getJakartaDateParts().date);
  const activeItem = await prisma.dailyRoutineItem.findFirst({
    where: {
      referenceId: id,
      blockType: "language",
      isCompleted: false,
      isSkipped: false,
      dailyRoutine: { userId: user.id, routineDate: todayDate }
    },
    select: { id: true }
  });
  if (activeItem) {
    return redirect("/language?error=Cannot delete — language is in today's active routine. Complete or skip the item first.");
  }

  await prisma.userLanguage.deleteMany({ where: { id, userId: user.id } });

  revalidatePath("/");
  revalidatePath("/language");
  return redirect("/language?message=Language deleted.");
}

export async function createLanguageLog(formData: FormData) {
  const user = await requireUser();
  const duration = validateActivityDuration(String(formData.get("durationMinutes") ?? ""));
  const dailyRoutineItemId = normalizeRoutineItemId(formData.get("dailyRoutineItemId"));

  if (!dailyRoutineItemId) return redirect("/language?error=Select a completed language item.");
  if (!duration.ok) return redirect(`/language?error=${encodeURIComponent(duration.error)}`);

  try {
    await prisma.$transaction(async (tx) => {
      const routineItem = await tx.dailyRoutineItem.findFirst({
        where: {
          id: dailyRoutineItemId,
          blockType: "language",
          isCompleted: true,
          isSkipped: false,
          isSetupPlaceholder: false,
          dailyRoutine: { userId: user.id }
        },
        select: {
          referenceId: true,
          dailyRoutine: { select: { routineDate: true } }
        }
      });

      if (!routineItem?.referenceId) {
        throw new Error("Invalid language.");
      }

      const existingLog = await tx.languageLog.findFirst({
        where: { dailyRoutineItemId }
      });
      if (existingLog) {
        throw new Error("A language log already exists for this routine item.");
      }

      const linkedItemId = await completeLinkedRoutineItem({
        tx,
        userId: user.id,
        dailyRoutineItemId,
        expectedType: "language",
        durationMinutes: duration.value
      });

      await tx.languageLog.create({
        data: {
          userId: user.id,
          languageId: routineItem.referenceId,
          dailyRoutineItemId: linkedItemId,
          logDate: routineItem.dailyRoutine.routineDate,
          durationMinutes: duration.value,
          material: normalizeOptionalText(String(formData.get("material") ?? "")),
          vocabulary: normalizeOptionalText(String(formData.get("vocabulary") ?? "")),
          notes: normalizeOptionalText(String(formData.get("notes") ?? ""))
        }
      });
    });
  } catch {
    return redirect("/language?error=Unable to save language log.");
  }

  revalidatePath("/");
  revalidatePath("/language");
  return redirect("/language?message=Language log saved.");
}

export async function updateLanguageLog(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  const duration = validateActivityDuration(String(formData.get("durationMinutes") ?? ""));

  if (!id) return redirect("/language?error=Invalid language log.");
  if (!duration.ok) return redirect(`/language?error=${encodeURIComponent(duration.error)}`);

  await prisma.languageLog.updateMany({
    where: { id, userId: user.id },
    data: {
      durationMinutes: duration.value,
      material: normalizeOptionalText(String(formData.get("material") ?? "")),
      vocabulary: normalizeOptionalText(String(formData.get("vocabulary") ?? "")),
      notes: normalizeOptionalText(String(formData.get("notes") ?? ""))
    }
  });

  revalidatePath("/language");
  return redirect("/language?message=Language detail updated.");
}
