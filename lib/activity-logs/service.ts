import type { Prisma, RoutineBlockType } from "@prisma/client";

import { getJakartaDateParts } from "@/lib/daily-routine/core";
import { dateStringToDate, recalculateDailyRoutineScore } from "@/lib/daily-routine/service";

export function getTodayDate(): Date {
  return dateStringToDate(getJakartaDateParts().date);
}

export function parseOptionalPositiveInteger(value: FormDataEntryValue | null): number | null {
  const raw = String(value ?? "").trim();
  if (!raw) return null;
  const parsed = Number(raw);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

export async function completeLinkedRoutineItem(input: {
  tx: Prisma.TransactionClient;
  userId: string;
  dailyRoutineItemId: string | null;
  expectedType: RoutineBlockType;
  durationMinutes: number;
}): Promise<string | null> {
  if (!input.dailyRoutineItemId) {
    return null;
  }

  const item = await input.tx.dailyRoutineItem.findFirst({
    where: {
      id: input.dailyRoutineItemId,
      blockType: input.expectedType,
      isCompleted: true,
      isSkipped: false,
      isSetupPlaceholder: false,
      dailyRoutine: { userId: input.userId }
    },
    select: {
      id: true,
      dailyRoutineId: true
    }
  });

  if (!item) {
    throw new Error("Invalid routine item.");
  }

  await input.tx.dailyRoutineItem.update({
    where: { id: item.id },
    data: {
      actualDuration: input.durationMinutes
    }
  });

  await recalculateDailyRoutineScore(input.tx, item.dailyRoutineId);

  return item.id;
}

export function normalizeRoutineItemId(value: FormDataEntryValue | null): string | null {
  const normalized = String(value ?? "").trim();
  return normalized || null;
}
