import type { RoutineBlockType } from "@prisma/client";

import { getJakartaDateParts } from "@/lib/daily-routine/core";
import { prisma } from "@/lib/prisma";

export async function getPendingRoutineItemsForType(
  userId: string,
  blockType: RoutineBlockType
) {
  return prisma.dailyRoutineItem.findMany({
    where: {
      blockType,
      isCompleted: true,
      isSkipped: false,
      isSetupPlaceholder: false,
      dailyRoutine: { userId },
      ...getMissingDetailWhere(blockType)
    },
    orderBy: [
      { dailyRoutine: { routineDate: "desc" } },
      { sortOrder: "asc" },
      { createdAt: "asc" }
    ]
  });
}

function getMissingDetailWhere(blockType: RoutineBlockType) {
  if (blockType === "study") return { studyLogs: { none: {} } };
  if (blockType === "language") return { languageLogs: { none: {} } };
  if (blockType === "exercise") return { exerciseLogs: { none: {} } };
  if (blockType === "book") return { bookLogs: { none: {} } };
  if (blockType === "morning_journal" || blockType === "night_journal") {
    return { journalLogs: { none: {} } };
  }
  return {};
}

export function getTodayDateString(): string {
  return getJakartaDateParts().date;
}

export function formatMinutes(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (hours === 0) return `${remainingMinutes} min`;
  if (remainingMinutes === 0) return `${hours}h`;
  return `${hours}h ${remainingMinutes}m`;
}
