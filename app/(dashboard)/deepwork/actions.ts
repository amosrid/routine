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

export async function createStudySubject(formData: FormData) {
  const user = await requireUser();
  const validation = validateMasterName(String(formData.get("name") ?? ""));

  if (!validation.ok) return redirect(`/deepwork?error=${encodeURIComponent(validation.error)}`);

  try {
    await prisma.studySubject.create({
      data: {
        userId: user.id,
        name: validation.value.name,
        nameNormalized: validation.value.normalizedName
      }
    });
  } catch {
    return redirect("/deepwork?error=Study subject already exists.");
  }

  revalidatePath("/");
  revalidatePath("/deepwork");
  return redirect("/deepwork?message=Study subject added.");
}

export async function deleteStudySubject(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");

  if (!id) return redirect("/deepwork?error=Invalid study subject.");

  const todayDate = dateStringToDate(getJakartaDateParts().date);
  const activeItem = await prisma.dailyRoutineItem.findFirst({
    where: {
      referenceId: id,
      blockType: "study",
      isCompleted: false,
      isSkipped: false,
      dailyRoutine: { userId: user.id, routineDate: todayDate }
    },
    select: { id: true }
  });
  if (activeItem) {
    return redirect("/deepwork?error=Cannot delete — subject is in today's active routine. Complete or skip the item first.");
  }

  await prisma.studySubject.deleteMany({
    where: { id, userId: user.id }
  });

  revalidatePath("/");
  revalidatePath("/deepwork");
  return redirect("/deepwork?message=Study subject deleted.");
}

export async function createStudyLog(formData: FormData) {
  const user = await requireUser();
  const duration = validateActivityDuration(String(formData.get("durationMinutes") ?? ""));
  const dailyRoutineItemId = normalizeRoutineItemId(formData.get("dailyRoutineItemId"));

  if (!dailyRoutineItemId) return redirect("/deepwork?error=Select a completed study item.");
  if (!duration.ok) return redirect(`/deepwork?error=${encodeURIComponent(duration.error)}`);

  try {
    await prisma.$transaction(async (tx) => {
      const routineItem = await tx.dailyRoutineItem.findFirst({
        where: {
          id: dailyRoutineItemId,
          blockType: "study",
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
        throw new Error("Invalid study subject.");
      }

      const existingLog = await tx.studyLog.findFirst({
        where: { dailyRoutineItemId }
      });
      if (existingLog) {
        throw new Error("A study log already exists for this routine item.");
      }

      const linkedItemId = await completeLinkedRoutineItem({
        tx,
        userId: user.id,
        dailyRoutineItemId,
        expectedType: "study",
        durationMinutes: duration.value
      });

      await tx.studyLog.create({
        data: {
          userId: user.id,
          subjectId: routineItem.referenceId,
          dailyRoutineItemId: linkedItemId,
          logDate: routineItem.dailyRoutine.routineDate,
          durationMinutes: duration.value,
          activity: normalizeOptionalText(String(formData.get("activity") ?? "")),
          material: normalizeOptionalText(String(formData.get("material") ?? "")),
          summary: normalizeOptionalText(String(formData.get("summary") ?? ""))
        }
      });
    });
  } catch {
    return redirect("/deepwork?error=Unable to save study log.");
  }

  revalidatePath("/");
  revalidatePath("/deepwork");
  return redirect("/deepwork?message=Study log saved.");
}

export async function updateStudyLog(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  const duration = validateActivityDuration(String(formData.get("durationMinutes") ?? ""));

  if (!id) return redirect("/deepwork?error=Invalid study log.");
  if (!duration.ok) return redirect(`/deepwork?error=${encodeURIComponent(duration.error)}`);

  await prisma.studyLog.updateMany({
    where: { id, userId: user.id },
    data: {
      durationMinutes: duration.value,
      activity: normalizeOptionalText(String(formData.get("activity") ?? "")),
      material: normalizeOptionalText(String(formData.get("material") ?? "")),
      summary: normalizeOptionalText(String(formData.get("summary") ?? ""))
    }
  });

  revalidatePath("/deepwork");
  return redirect("/deepwork?message=Study detail updated.");
}
