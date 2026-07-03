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
import { validateBookInput, type BookStatus } from "@/lib/master-data/validation";
import { prisma } from "@/lib/prisma";

export async function createBookItem(formData: FormData) {
  const user = await requireUser();
  const validation = validateBookInput({
    title: String(formData.get("title") ?? ""),
    author: String(formData.get("author") ?? "")
  });

  if (!validation.ok) return redirect(`/book?error=${encodeURIComponent(validation.error)}`);

  await prisma.book.create({
    data: {
      userId: user.id,
      title: validation.value.title,
      author: validation.value.author
    }
  });

  revalidatePath("/");
  revalidatePath("/book");
  return redirect("/book?message=Book added.");
}

export async function updateBookItemStatus(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "") as BookStatus;

  if (!id) return redirect("/book?error=Invalid book.");
  if (!["reading", "completed", "paused"].includes(status)) {
    return redirect("/book?error=Invalid book status.");
  }

  await prisma.book.updateMany({ where: { id, userId: user.id }, data: { status } });

  revalidatePath("/");
  revalidatePath("/book");
  return redirect("/book?message=Book status updated.");
}

export async function deleteBookItem(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");

  if (!id) return redirect("/book?error=Invalid book.");

  await prisma.book.deleteMany({ where: { id, userId: user.id } });

  revalidatePath("/");
  revalidatePath("/book");
  return redirect("/book?message=Book deleted.");
}

export async function createBookLog(formData: FormData) {
  const user = await requireUser();
  const duration = validateActivityDuration(String(formData.get("durationMinutes") ?? ""));
  const dailyRoutineItemId = normalizeRoutineItemId(formData.get("dailyRoutineItemId"));

  if (!dailyRoutineItemId) return redirect("/book?error=Select a completed book item.");
  if (!duration.ok) return redirect(`/book?error=${encodeURIComponent(duration.error)}`);

  try {
    await prisma.$transaction(async (tx) => {
      const routineItem = await tx.dailyRoutineItem.findFirst({
        where: {
          id: dailyRoutineItemId,
          blockType: "book",
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
        throw new Error("Invalid book.");
      }

      const existingLog = await tx.bookLog.findFirst({
        where: { dailyRoutineItemId }
      });
      if (existingLog) {
        throw new Error("A book log already exists for this routine item.");
      }

      const linkedItemId = await completeLinkedRoutineItem({
        tx,
        userId: user.id,
        dailyRoutineItemId,
        expectedType: "book",
        durationMinutes: duration.value
      });

      await tx.bookLog.create({
        data: {
          userId: user.id,
          bookId: routineItem.referenceId,
          dailyRoutineItemId: linkedItemId,
          logDate: routineItem.dailyRoutine.routineDate,
          durationMinutes: duration.value,
          pagesRead: parseOptionalPositiveInteger(formData.get("pagesRead")),
          notes: normalizeOptionalText(String(formData.get("notes") ?? ""))
        }
      });
    });
  } catch {
    return redirect("/book?error=Unable to save book log.");
  }

  revalidatePath("/");
  revalidatePath("/book");
  return redirect("/book?message=Book log saved.");
}

export async function updateBookLog(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  const duration = validateActivityDuration(String(formData.get("durationMinutes") ?? ""));

  if (!id) return redirect("/book?error=Invalid book log.");
  if (!duration.ok) return redirect(`/book?error=${encodeURIComponent(duration.error)}`);

  await prisma.bookLog.updateMany({
    where: { id, userId: user.id },
    data: {
      durationMinutes: duration.value,
      pagesRead: parseOptionalPositiveInteger(formData.get("pagesRead")),
      notes: normalizeOptionalText(String(formData.get("notes") ?? ""))
    }
  });

  revalidatePath("/book");
  return redirect("/book?message=Book detail updated.");
}
