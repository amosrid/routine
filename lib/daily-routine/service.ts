import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import {
  calculateScorePercentage,
  createSnapshotItems,
  getJakartaDateParts,
  getNextStreakState,
  getPreviousDateString
} from "./core";

const dailyRoutineInclude = {
  items: true
} satisfies Prisma.DailyRoutineInclude;

export type TodayRoutineResult =
  | {
      status: "ready";
      routine: Prisma.DailyRoutineGetPayload<{ include: typeof dailyRoutineInclude }>;
      routineDate: string;
    }
  | {
      status: "no-template";
      routineDate: string;
      weekday: number;
    }
  | {
      status: "template-empty";
      routineDate: string;
      templateName: string;
    };

export async function getOrCreateTodayRoutine(
  userId: string,
  now = new Date()
): Promise<TodayRoutineResult> {
  const jakartaDate = getJakartaDateParts(now);
  const routineDate = dateStringToDate(jakartaDate.date);

  try {
    return await prisma.$transaction(async (tx) => {
      const existingRoutine = await tx.dailyRoutine.findUnique({
        where: {
          userId_routineDate: {
            userId,
            routineDate
          }
        },
        include: dailyRoutineInclude
      });

      if (existingRoutine) {
        return {
          status: "ready",
          routine: existingRoutine,
          routineDate: jakartaDate.date
        };
      }

      const template = await tx.routineTemplate.findFirst({
        where: {
          userId,
          isActive: true,
          daysOfWeek: { has: jakartaDate.weekday }
        },
        include: {
          blocks: {
            orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }]
          }
        },
        orderBy: { createdAt: "asc" }
      });

      if (!template) {
        return {
          status: "no-template",
          routineDate: jakartaDate.date,
          weekday: jakartaDate.weekday
        };
      }

      if (template.blocks.length === 0) {
        return {
          status: "template-empty",
          routineDate: jakartaDate.date,
          templateName: template.name
        };
      }

      const snapshotItems = createSnapshotItems(template.blocks);
      const routine = await tx.dailyRoutine.create({
        data: {
          userId,
          routineDate,
          templateId: template.id,
          templateName: template.name,
          scorePercentage: 0,
          items: {
            create: snapshotItems.map((item) => ({
              sourceBlockId: item.sourceBlockId,
              blockType: item.blockType,
              referenceId: item.referenceId,
              referenceName: item.referenceName,
              displayName: item.displayName,
              startTime: item.startTime,
              endTime: item.endTime,
              durationMinutes: item.durationMinutes,
              sortOrder: item.sortOrder,
              isSetupPlaceholder: item.isSetupPlaceholder
            }))
          }
        },
        include: dailyRoutineInclude
      });

      return {
        status: "ready",
        routine,
        routineDate: jakartaDate.date
      };
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      const existingRoutine = await prisma.dailyRoutine.findUnique({
        where: {
          userId_routineDate: {
            userId,
            routineDate
          }
        },
        include: dailyRoutineInclude
      });

      if (existingRoutine) {
        return {
          status: "ready",
          routine: existingRoutine,
          routineDate: jakartaDate.date
        };
      }
    }

    throw error;
  }
}

export async function recalculateDailyRoutineScore(
  tx: Prisma.TransactionClient,
  dailyRoutineId: string
): Promise<number> {
  const items = await tx.dailyRoutineItem.findMany({
    where: { dailyRoutineId },
    select: { blockType: true, isCompleted: true, isSetupPlaceholder: true }
  });
  const scorePercentage = calculateScorePercentage(items);

  await tx.dailyRoutine.update({
    where: { id: dailyRoutineId },
    data: { scorePercentage }
  });

  return scorePercentage;
}

export async function evaluateUserStreak(userId: string, now = new Date()) {
  const today = getJakartaDateParts(now).date;
  const yesterday = getPreviousDateString(today);
  const todayDate = dateStringToDate(today);
  const yesterdayDate = dateStringToDate(yesterday);

  return prisma.$transaction(async (tx) => {
    const existingStreak = await tx.userStreak.upsert({
      where: { userId },
      create: {
        userId,
        currentStreak: 0,
        longestStreak: 0
      },
      update: {}
    });

    if (dateToDateString(existingStreak.lastEvaluatedDate) === today) {
      return existingStreak;
    }

    const yesterdayRoutine = await tx.dailyRoutine.findUnique({
      where: {
        userId_routineDate: {
          userId,
          routineDate: yesterdayDate
        }
      },
      select: { scorePercentage: true }
    });

    const nextState = getNextStreakState({
      currentStreak: existingStreak.currentStreak,
      longestStreak: existingStreak.longestStreak,
      lastActiveDate: dateToDateString(existingStreak.lastActiveDate),
      lastEvaluatedDate: dateToDateString(existingStreak.lastEvaluatedDate),
      todayDate: today,
      yesterdayDate: yesterday,
      yesterdayScorePercentage: yesterdayRoutine?.scorePercentage ?? null
    });

    return tx.userStreak.update({
      where: { userId },
      data: {
        currentStreak: nextState.currentStreak,
        longestStreak: nextState.longestStreak,
        lastActiveDate: nextState.lastActiveDate
          ? dateStringToDate(nextState.lastActiveDate)
          : null,
        lastEvaluatedDate: todayDate
      }
    });
  });
}

export function dateStringToDate(date: string): Date {
  return new Date(`${date}T00:00:00.000Z`);
}

export function dateToDateString(date: Date | null): string | null {
  return date ? date.toISOString().slice(0, 10) : null;
}

function isUniqueConstraintError(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}
