"use server";

import type { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireUser } from "@/lib/auth/session";
import {
  getJakartaDateParts,
  getJakartaLockState,
  getNextItemState
} from "@/lib/daily-routine/core";
import {
  dateStringToDate,
  recalculateDailyRoutineScore
} from "@/lib/daily-routine/service";
import { prisma } from "@/lib/prisma";
import {
  getBlockTypeLabel,
  type RoutineBlockType
} from "@/lib/routine-template/validation";

export async function completeDailyRoutineItem(formData: FormData) {
  await updateDailyRoutineItemStatus(formData, "complete");
}

export async function skipDailyRoutineItem(formData: FormData) {
  await updateDailyRoutineItemStatus(formData, "skip");
}

export async function undoDailyRoutineItem(formData: FormData) {
  await updateDailyRoutineItemStatus(formData, "undo");
}

export async function lockTodayRoutine() {
  const user = await requireUser();
  const today = dateStringToDate(getJakartaDateParts().date);

  const result = await prisma.dailyRoutine.updateMany({
    where: {
      userId: user.id,
      routineDate: today,
      isSetupLocked: false
    },
    data: {
      isSetupLocked: true,
      setupLockedAt: new Date()
    }
  });

  revalidatePath("/");
  if (result.count === 0) {
    return redirect("/?message=Setup is already locked.");
  }
  return redirect("/?message=Daily routine locked.");
}

// Assign a specific subject/language/exercise/book to an existing placeholder item.
// The placeholder is converted in-place to a concrete item.
export async function assignDailySetupItem(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  const referenceId = String(formData.get("referenceId") ?? "").trim();

  if (!id) return redirect("/?error=Invalid routine item.");
  if (!referenceId) return redirect("/?error=Please select an option before assigning.");

  await prisma.$transaction(async (tx) => {
    const item = await tx.dailyRoutineItem.findFirst({
      where: { id, dailyRoutine: { userId: user.id } },
      select: {
        id: true,
        blockType: true,
        dailyRoutineId: true,
        isSetupPlaceholder: true,
        dailyRoutine: { select: { isSetupLocked: true } }
      }
    });

    if (!item) return redirect("/?error=Invalid routine item.");
    if (!item.isSetupPlaceholder) return redirect("/?error=This item is already assigned.");
    if (isDailySetupLocked(item.dailyRoutine.isSetupLocked)) {
      return redirect("/?error=Daily routine setup is locked.");
    }

    const reference = await resolveAssignReference(tx, {
      userId: user.id,
      blockType: item.blockType,
      referenceId
    });

    if (!reference.ok) return redirect(`/?error=${encodeURIComponent(reference.error)}`);

    await tx.dailyRoutineItem.update({
      where: { id: item.id },
      data: {
        referenceId: reference.referenceId,
        referenceName: reference.referenceName,
        displayName: reference.displayName,
        isSetupPlaceholder: false
      }
    });

    await recalculateDailyRoutineScore(tx, item.dailyRoutineId);
  });

  revalidatePath("/");
  return redirect("/");
}

export async function addDailySetupItem(formData: FormData) {
  const user = await requireUser();
  const routineId = String(formData.get("routineId") ?? "");
  const blockType = String(formData.get("blockType") ?? "") as RoutineBlockType;
  const referenceId = normalizeOptional(String(formData.get("referenceId") ?? ""));
  const customName = normalizeOptional(String(formData.get("customName") ?? ""));
  const durationMinutes = Number(String(formData.get("durationMinutes") ?? ""));

  if (!routineId) return redirect("/?error=Invalid daily routine.");
  if (!isAllowedDailySetupType(blockType)) return redirect("/?error=Invalid routine item type.");
  if (!Number.isInteger(durationMinutes) || durationMinutes < 5 || durationMinutes > 480) {
    return redirect("/?error=Duration must be between 5 and 480 minutes.");
  }

  await prisma.$transaction(async (tx) => {
    const routine = await tx.dailyRoutine.findFirst({
      where: { id: routineId, userId: user.id },
      include: {
        items: {
          select: { sortOrder: true }
        }
      }
    });

    if (!routine) return redirect("/?error=Invalid daily routine.");
    if (isDailySetupLocked(routine.isSetupLocked)) {
      return redirect("/?error=Daily routine setup is locked.");
    }

    const reference = await resolveDailySetupReference(tx, {
      userId: user.id,
      blockType,
      referenceId,
      customName
    });

    if (!reference.ok) return redirect(`/?error=${encodeURIComponent(reference.error)}`);

    const nextSortOrder =
      routine.items.length === 0
        ? 0
        : Math.max(...routine.items.map((item) => item.sortOrder)) + 1;

    await tx.dailyRoutineItem.create({
      data: {
        dailyRoutineId: routine.id,
        blockType,
        referenceId: reference.referenceId,
        referenceName: reference.referenceName,
        displayName: reference.displayName,
        durationMinutes,
        sortOrder: nextSortOrder,
        isSetupPlaceholder: false
      }
    });

    await recalculateDailyRoutineScore(tx, routine.id);
  });

  revalidatePath("/");
  return redirect("/?message=Routine item added.");
}

export async function deleteDailySetupItem(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");

  if (!id) return redirect("/?error=Invalid routine item.");

  await prisma.$transaction(async (tx) => {
    const item = await tx.dailyRoutineItem.findFirst({
      where: {
        id,
        dailyRoutine: { userId: user.id }
      },
      select: {
        id: true,
        dailyRoutineId: true,
        isCompleted: true,
        isSkipped: true,
        dailyRoutine: { select: { isSetupLocked: true } }
      }
    });

    if (!item) return redirect("/?error=Invalid routine item.");
    if (isDailySetupLocked(item.dailyRoutine.isSetupLocked)) {
      return redirect("/?error=Daily routine setup is locked.");
    }
    if (item.isCompleted || item.isSkipped) {
      return redirect("/?error=Undo the item before deleting it.");
    }

    await tx.dailyRoutineItem.delete({ where: { id: item.id } });
    await recalculateDailyRoutineScore(tx, item.dailyRoutineId);
  });

  revalidatePath("/");
  return redirect("/?message=Routine item removed.");
}

async function updateDailyRoutineItemStatus(
  formData: FormData,
  action: "complete" | "skip" | "undo"
) {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");

  if (!id) {
    return redirect("/?error=Invalid routine item.");
  }

  await prisma.$transaction(async (tx) => {
    const item = await tx.dailyRoutineItem.findFirst({
      where: {
        id,
        dailyRoutine: { userId: user.id }
      },
      select: {
        id: true,
        dailyRoutineId: true,
        blockType: true,
        isSetupPlaceholder: true,
        isCompleted: true,
        isSkipped: true,
        durationMinutes: true,
        actualDuration: true
      }
    });

    if (!item) {
      return redirect("/?error=Invalid routine item.");
    }

    if (item.blockType === "sleep") {
      return redirect("/?error=Sleep is monitoring only and cannot be checked off.");
    }
    if (item.isSetupPlaceholder) {
      return redirect("/?error=Assign the exact activity before checking this item off.");
    }

    // BUG-012: Prevent completing a skipped item without undoing first,
    // and prevent skipping a completed item without undoing first.
    if (action === "complete" && item.isSkipped) {
      return redirect("/?error=Undo the skip before marking this item as complete.");
    }
    if (action === "skip" && item.isCompleted) {
      return redirect("/?error=Undo the completion before skipping this item.");
    }

    const nextState = getNextItemState({
      action,
      durationMinutes: item.durationMinutes,
      actualDuration: item.actualDuration,
      skipReason: String(formData.get("skipReason") ?? "")
    });

    await tx.dailyRoutineItem.update({
      where: { id: item.id },
      data: nextState
    });

    await recalculateDailyRoutineScore(tx, item.dailyRoutineId);
  });

  revalidatePath("/");
  return redirect("/");
}

function isDailySetupLocked(isSetupLocked: boolean): boolean {
  return isSetupLocked || getJakartaLockState().isLocked;
}

function isAllowedDailySetupType(blockType: RoutineBlockType): boolean {
  return [
    "study",
    "language",
    "exercise",
    "book",
    "morning_journal",
    "night_journal",
    "custom"
  ].includes(blockType);
}

// Resolve a reference for an assign operation (placeholder → concrete item).
async function resolveAssignReference(
  tx: Prisma.TransactionClient,
  input: {
    userId: string;
    blockType: RoutineBlockType;
    referenceId: string;
  }
): Promise<
  | { ok: true; referenceId: string; referenceName: string; displayName: string }
  | { ok: false; error: string }
> {
  if (input.blockType === "study") {
    const subject = await tx.studySubject.findFirst({
      where: { id: input.referenceId, userId: input.userId },
      select: { id: true, name: true }
    });
    return subject
      ? { ok: true, referenceId: subject.id, referenceName: subject.name, displayName: subject.name }
      : { ok: false, error: "Select a valid study subject." };
  }

  if (input.blockType === "language") {
    const language = await tx.userLanguage.findFirst({
      where: { id: input.referenceId, userId: input.userId },
      select: { id: true, name: true }
    });
    return language
      ? { ok: true, referenceId: language.id, referenceName: language.name, displayName: language.name }
      : { ok: false, error: "Select a valid language." };
  }

  if (input.blockType === "exercise") {
    const exercise = await tx.exerciseType.findFirst({
      where: { id: input.referenceId, userId: input.userId },
      select: { id: true, name: true }
    });
    return exercise
      ? { ok: true, referenceId: exercise.id, referenceName: exercise.name, displayName: exercise.name }
      : { ok: false, error: "Select a valid exercise type." };
  }

  if (input.blockType === "book") {
    const book = await tx.book.findFirst({
      where: { id: input.referenceId, userId: input.userId, status: "reading" },
      select: { id: true, title: true }
    });
    return book
      ? { ok: true, referenceId: book.id, referenceName: book.title, displayName: book.title }
      : { ok: false, error: "Select a reading book." };
  }

  return { ok: false, error: "This block type cannot be assigned this way." };
}

async function resolveDailySetupReference(
  tx: Prisma.TransactionClient,
  input: {
    userId: string;
    blockType: RoutineBlockType;
    referenceId: string | null;
    customName: string | null;
  }
): Promise<
  | {
      ok: true;
      referenceId: string | null;
      referenceName: string | null;
      displayName: string;
    }
  | { ok: false; error: string }
> {
  if (input.blockType === "custom") {
    return input.customName
      ? {
          ok: true,
          referenceId: null,
          referenceName: input.customName,
          displayName: input.customName
        }
      : { ok: false, error: "Custom activity name is required." };
  }

  if (input.blockType === "morning_journal" || input.blockType === "night_journal") {
    const displayName = getBlockTypeLabel(input.blockType);
    return { ok: true, referenceId: null, referenceName: displayName, displayName };
  }

  if (!input.referenceId) {
    return { ok: false, error: `Select a ${getBlockTypeLabel(input.blockType)} item.` };
  }

  if (input.blockType === "study") {
    const subject = await tx.studySubject.findFirst({
      where: { id: input.referenceId, userId: input.userId },
      select: { id: true, name: true }
    });
    return subject
      ? { ok: true, referenceId: subject.id, referenceName: subject.name, displayName: subject.name }
      : { ok: false, error: "Select a valid study subject." };
  }

  if (input.blockType === "language") {
    const language = await tx.userLanguage.findFirst({
      where: { id: input.referenceId, userId: input.userId },
      select: { id: true, name: true }
    });
    return language
      ? { ok: true, referenceId: language.id, referenceName: language.name, displayName: language.name }
      : { ok: false, error: "Select a valid language." };
  }

  if (input.blockType === "exercise") {
    const exercise = await tx.exerciseType.findFirst({
      where: { id: input.referenceId, userId: input.userId },
      select: { id: true, name: true }
    });
    return exercise
      ? { ok: true, referenceId: exercise.id, referenceName: exercise.name, displayName: exercise.name }
      : { ok: false, error: "Select a valid exercise type." };
  }

  const book = await tx.book.findFirst({
    where: { id: input.referenceId, userId: input.userId, status: "reading" },
    select: { id: true, title: true }
  });

  return book
    ? { ok: true, referenceId: book.id, referenceName: book.title, displayName: book.title }
    : { ok: false, error: "Select a reading book." };
}

function normalizeOptional(value: string): string | null {
  const normalized = value.trim().replace(/\s+/g, " ");
  return normalized || null;
}
