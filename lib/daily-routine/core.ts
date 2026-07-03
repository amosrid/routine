import type { RoutineBlockType } from "@/lib/routine-template/validation";
import { formatTimeValue } from "@/lib/routine-template/validation";

type ScoreItem = {
  isCompleted: boolean;
  blockType?: RoutineBlockType;
  isSetupPlaceholder?: boolean;
};

type TemplateBlockSnapshot = {
  id: string;
  blockType: RoutineBlockType;
  referenceId: string | null;
  referenceName: string | null;
  startTime: Date | null;
  endTime: Date | null;
  durationMinutes: number;
  sortOrder: number;
};

type DisplaySortItem = {
  startTime: Date | null;
  endTime: Date | null;
  sortOrder: number;
  createdAt: Date;
};

type ItemStatusAction = "complete" | "skip" | "undo";

const setupPlaceholderTypes: RoutineBlockType[] = ["study", "language", "exercise", "book"];

type StreakStateInput = {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;
  lastEvaluatedDate: string | null;
  todayDate: string;
  yesterdayDate: string;
  yesterdayScorePercentage: number | null;
};

export function getJakartaDateParts(now = new Date()): {
  date: string;
  weekday: number;
} {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "Asia/Jakarta",
    weekday: "short",
    year: "numeric"
  });
  const parts = formatter.formatToParts(now);
  const value = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  const weekdayLabels: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6
  };

  return {
    date: `${value("year")}-${value("month")}-${value("day")}`,
    weekday: weekdayLabels[value("weekday")]
  };
}

export function getJakartaLockState(
  now = new Date(),
  lockHour = Number(process.env.NEXT_PUBLIC_LOCK_HOUR ?? 11)
): {
  isLocked: boolean;
  lockHour: number;
} {
  const formatter = new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    hour12: false,
    minute: "2-digit",
    timeZone: "Asia/Jakarta"
  });
  const parts = formatter.formatToParts(now);
  const hour = Number(parts.find((part) => part.type === "hour")?.value ?? 0);
  const minute = Number(parts.find((part) => part.type === "minute")?.value ?? 0);

  return {
    isLocked: hour > lockHour || (hour === lockHour && minute >= 0),
    lockHour
  };
}

export function getPreviousDateString(date: string): string {
  const previousDate = new Date(`${date}T00:00:00.000Z`);
  previousDate.setUTCDate(previousDate.getUTCDate() - 1);
  return previousDate.toISOString().slice(0, 10);
}

export function calculateScorePercentage(items: ScoreItem[]): number {
  const scorableItems = items.filter(
    (item) => !item.isSetupPlaceholder && item.blockType !== "sleep"
  );
  if (scorableItems.length === 0) return 0;
  const completedCount = scorableItems.filter((item) => item.isCompleted).length;
  return Math.round((completedCount / scorableItems.length) * 100);
}

export function getNextStreakState(input: StreakStateInput): {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;
  lastEvaluatedDate: string;
} {
  if (input.lastEvaluatedDate === input.todayDate) {
    return {
      currentStreak: input.currentStreak,
      longestStreak: input.longestStreak,
      lastActiveDate: input.lastActiveDate,
      lastEvaluatedDate: input.lastEvaluatedDate
    };
  }

  if ((input.yesterdayScorePercentage ?? 0) >= 80) {
    const dayBeforeYesterday = getPreviousDateString(input.yesterdayDate);
    const nextCurrentStreak =
      input.lastActiveDate === dayBeforeYesterday ? input.currentStreak + 1 : 1;

    return {
      currentStreak: nextCurrentStreak,
      longestStreak: Math.max(input.longestStreak, nextCurrentStreak),
      lastActiveDate: input.yesterdayDate,
      lastEvaluatedDate: input.todayDate
    };
  }

  return {
    currentStreak: 0,
    longestStreak: input.longestStreak,
    lastActiveDate: input.lastActiveDate,
    lastEvaluatedDate: input.todayDate
  };
}

export function createSnapshotItems(blocks: TemplateBlockSnapshot[]) {
  return blocks.map((block) => {
    const isSetupPlaceholder =
      setupPlaceholderTypes.includes(block.blockType) && !block.referenceId;

    return {
      sourceBlockId: block.id,
      blockType: block.blockType,
      referenceId: block.referenceId,
      referenceName: block.referenceName,
      displayName: isSetupPlaceholder
        ? `${getSetupPlaceholderLabel(block.blockType)} setup`
        : block.referenceName ?? getSetupPlaceholderLabel(block.blockType),
      isSetupPlaceholder,
      startTime: block.startTime,
      endTime: block.endTime,
      durationMinutes: block.durationMinutes,
      sortOrder: block.sortOrder
    };
  });
}

export function filterPendingDetailItems<
  T extends {
    blockType: RoutineBlockType;
    hasDetail: boolean;
    isCompleted: boolean;
    isSetupPlaceholder: boolean;
    isSkipped: boolean;
  }
>(items: T[], blockType: RoutineBlockType): T[] {
  return items.filter(
    (item) =>
      item.blockType === blockType &&
      item.isCompleted &&
      !item.isSkipped &&
      !item.isSetupPlaceholder &&
      !item.hasDetail
  );
}

export function sortDailyItemsForDisplay<T extends DisplaySortItem>(items: T[]): T[] {
  return [...items].sort((first, second) => {
    const firstScheduled = Boolean(first.startTime && first.endTime);
    const secondScheduled = Boolean(second.startTime && second.endTime);

    if (firstScheduled && secondScheduled) {
      return formatTimeValue(first.startTime!).localeCompare(
        formatTimeValue(second.startTime!)
      );
    }

    if (firstScheduled) return -1;
    if (secondScheduled) return 1;

    if (first.sortOrder !== second.sortOrder) {
      return first.sortOrder - second.sortOrder;
    }

    return first.createdAt.getTime() - second.createdAt.getTime();
  });
}

export function getNextItemState(input: {
  action: ItemStatusAction;
  durationMinutes: number;
  actualDuration: number | null;
  skipReason: string | null;
}): {
  isCompleted: boolean;
  isSkipped: boolean;
  skipReason: string | null;
  actualDuration: number | null;
} {
  if (input.action === "complete") {
    return {
      isCompleted: true,
      isSkipped: false,
      skipReason: null,
      actualDuration: input.actualDuration ?? input.durationMinutes
    };
  }

  if (input.action === "skip") {
    return {
      isCompleted: false,
      isSkipped: true,
      skipReason: normalizeOptionalReason(input.skipReason),
      actualDuration: null
    };
  }

  return {
    isCompleted: false,
    isSkipped: false,
    skipReason: null,
    actualDuration: null
  };
}

function normalizeOptionalReason(value: string | null): string | null {
  const normalized = (value ?? "").trim().replace(/\s+/g, " ");
  return normalized || null;
}

function getSetupPlaceholderLabel(blockType: RoutineBlockType): string {
  return {
    study: "Study",
    language: "Language",
    exercise: "Exercise",
    book: "Book",
    sleep: "Sleep",
    morning_journal: "Morning Journal",
    night_journal: "Night Journal",
    custom: "Custom"
  }[blockType];
}
