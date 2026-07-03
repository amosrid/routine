"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireUser } from "@/lib/auth/session";
import {
  completeLinkedRoutineItem,
  normalizeRoutineItemId,
  parseOptionalPositiveInteger
} from "@/lib/activity-logs/service";
import {
  normalizeOptionalText,
  validateActivityDuration
} from "@/lib/activity-logs/validation";
import { validateMasterName } from "@/lib/master-data/validation";
import { prisma } from "@/lib/prisma";
import { getJakartaDateParts } from "@/lib/daily-routine/core";
import { dateStringToDate } from "@/lib/daily-routine/service";

export async function createExerciseType(formData: FormData) {
  const user = await requireUser();
  const validation = validateMasterName(String(formData.get("name") ?? ""));

  if (!validation.ok) return redirect(`/exercise?error=${encodeURIComponent(validation.error)}`);

  try {
    await prisma.exerciseType.create({
      data: {
        userId: user.id,
        name: validation.value.name,
        nameNormalized: validation.value.normalizedName
      }
    });
  } catch {
    return redirect("/exercise?error=Exercise type already exists.");
  }

  revalidatePath("/");
  revalidatePath("/exercise");
  return redirect("/exercise?message=Exercise type added.");
}

export async function deleteExerciseType(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");

  if (!id) return redirect("/exercise?error=Invalid exercise type.");

  const todayDate = dateStringToDate(getJakartaDateParts().date);
  const activeItem = await prisma.dailyRoutineItem.findFirst({
    where: {
      referenceId: id,
      blockType: "exercise",
      isCompleted: false,
      isSkipped: false,
      dailyRoutine: { userId: user.id, routineDate: todayDate }
    },
    select: { id: true }
  });
  if (activeItem) {
    return redirect("/exercise?error=Cannot delete — exercise type is in today's active routine. Complete or skip the item first.");
  }

  await prisma.exerciseType.deleteMany({ where: { id, userId: user.id } });

  revalidatePath("/");
  revalidatePath("/exercise");
  return redirect("/exercise?message=Exercise type deleted.");
}

export async function createExerciseLog(formData: FormData) {
  const user = await requireUser();
  const duration = validateActivityDuration(String(formData.get("durationMinutes") ?? ""));
  const dailyRoutineItemId = normalizeRoutineItemId(formData.get("dailyRoutineItemId"));

  if (!dailyRoutineItemId) return redirect("/exercise?error=Select a completed exercise item.");
  if (!duration.ok) return redirect(`/exercise?error=${encodeURIComponent(duration.error)}`);

  try {
    await prisma.$transaction(async (tx) => {
      const routineItem = await tx.dailyRoutineItem.findFirst({
        where: {
          id: dailyRoutineItemId,
          blockType: "exercise",
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
        throw new Error("Invalid exercise type.");
      }

      const existingLog = await tx.exerciseLog.findFirst({
        where: { dailyRoutineItemId }
      });
      if (existingLog) {
        throw new Error("An exercise log already exists for this routine item.");
      }

      const linkedItemId = await completeLinkedRoutineItem({
        tx,
        userId: user.id,
        dailyRoutineItemId,
        expectedType: "exercise",
        durationMinutes: duration.value
      });

      await tx.exerciseLog.create({
        data: {
          userId: user.id,
          exerciseTypeId: routineItem.referenceId,
          dailyRoutineItemId: linkedItemId,
          logDate: routineItem.dailyRoutine.routineDate,
          durationMinutes: duration.value,
          sets: parseOptionalPositiveInteger(formData.get("sets")),
          reps: parseOptionalPositiveInteger(formData.get("reps")),
          notes: normalizeOptionalText(String(formData.get("notes") ?? ""))
        }
      });
    });
  } catch {
    return redirect("/exercise?error=Unable to save exercise log.");
  }

  revalidatePath("/");
  revalidatePath("/exercise");
  return redirect("/exercise?message=Exercise log saved.");
}

export async function updateExerciseLog(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  const duration = validateActivityDuration(String(formData.get("durationMinutes") ?? ""));

  if (!id) return redirect("/exercise?error=Invalid exercise log.");
  if (!duration.ok) return redirect(`/exercise?error=${encodeURIComponent(duration.error)}`);

  await prisma.exerciseLog.updateMany({
    where: { id, userId: user.id },
    data: {
      durationMinutes: duration.value,
      sets: parseOptionalPositiveInteger(formData.get("sets")),
      reps: parseOptionalPositiveInteger(formData.get("reps")),
      notes: normalizeOptionalText(String(formData.get("notes") ?? ""))
    }
  });

  revalidatePath("/exercise");
  return redirect("/exercise?message=Exercise detail updated.");
}
