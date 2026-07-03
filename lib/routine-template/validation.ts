import type { BookStatus } from "@/lib/master-data/validation";

export type RoutineBlockType =
  | "study"
  | "language"
  | "exercise"
  | "book"
  | "sleep"
  | "morning_journal"
  | "night_journal"
  | "custom";

export type ValidationResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: string };

export type BlockReferenceResult =
  | { ok: true; referenceName: string | null }
  | { ok: false; error: string };

type MasterOption = { id: string; name: string };
type BookOption = { id: string; title: string; status: BookStatus | string };

const blockTypes: RoutineBlockType[] = [
  "study",
  "language",
  "exercise",
  "book",
  "sleep",
  "morning_journal",
  "night_journal",
  "custom"
];

const setupBlockTypes = ["study", "language", "exercise", "book"];

export function validateTemplateInput(input: {
  name: string;
  daysOfWeek: string[];
}): ValidationResult<{ name: string; daysOfWeek: number[] }> {
  const name = normalizeWhitespace(input.name);

  if (!name) {
    return { ok: false, error: "Template name is required." };
  }

  if (name.length > 100) {
    return { ok: false, error: "Template name must be 100 characters or fewer." };
  }

  const daysOfWeek = Array.from(
    new Set(input.daysOfWeek.map(Number).filter((day) => day >= 0 && day <= 6))
  ).sort((a, b) => a - b);

  if (daysOfWeek.length === 0) {
    return { ok: false, error: "Select at least one active day." };
  }

  return { ok: true, value: { name, daysOfWeek } };
}

export function validateBlockInput(input: {
  blockType: string;
  referenceId: string | null;
  customName: string;
  durationMinutes: string;
  startTime?: string | null;
  endTime?: string | null;
}): ValidationResult<{
  blockType: RoutineBlockType;
  referenceId: string | null;
  referenceName: string | null;
  durationMinutes: number;
  startTime: string | null;
  endTime: string | null;
}> {
  if (!isRoutineBlockType(input.blockType)) {
    return { ok: false, error: "Invalid block type." };
  }

  if (input.blockType === "sleep") {
    return {
      ok: false,
      error: "Sleep is monitoring only and cannot be added to a routine template."
    };
  }

  const referenceId = normalizeNullable(input.referenceId);
  const customName = normalizeWhitespace(input.customName);
  const startTime = normalizeNullable(input.startTime ?? "");
  const endTime = normalizeNullable(input.endTime ?? "");
  const hasStartTime = Boolean(startTime);
  const hasEndTime = Boolean(endTime);

  if (input.blockType === "custom" && !customName) {
    return { ok: false, error: "Custom block name is required." };
  }

  if (hasStartTime !== hasEndTime) {
    return {
      ok: false,
      error: "Start time and end time must be filled together."
    };
  }

  const scheduleDuration = startTime && endTime
    ? calculateDurationFromTimeRange(startTime, endTime)
    : null;

  if (scheduleDuration === "invalid-format") {
    return { ok: false, error: "Use HH:mm time format." };
  }

  if (scheduleDuration === "invalid-range") {
    return { ok: false, error: "End time must be later than start time." };
  }

  const manualDuration = normalizeNullable(input.durationMinutes);
  const durationMinutes = scheduleDuration ?? Number(manualDuration);

  if (
    !Number.isInteger(durationMinutes) ||
    durationMinutes < 5 ||
    durationMinutes > 480
  ) {
    return { ok: false, error: "Duration must be between 5 and 480 minutes." };
  }

  if (
    scheduleDuration !== null &&
    manualDuration !== null &&
    Number(manualDuration) !== scheduleDuration
  ) {
    return { ok: false, error: "Duration must match the selected time range." };
  }

  return {
    ok: true,
    value: {
      blockType: input.blockType,
      referenceId:
        input.blockType === "custom" ||
        input.blockType === "morning_journal" ||
        input.blockType === "night_journal"
          ? null
          : referenceId,
      referenceName:
        input.blockType === "custom"
          ? customName
          : input.blockType === "morning_journal"
            ? "Morning Journal"
            : input.blockType === "night_journal"
              ? "Night Journal"
              : null,
      durationMinutes,
      startTime,
      endTime
    }
  };
}

export function getBlockReferenceName(input: {
  blockType: RoutineBlockType;
  referenceId: string | null;
  customName: string;
  masterData: {
    subjects: MasterOption[];
    languages: MasterOption[];
    exercises: MasterOption[];
    books: BookOption[];
  };
}): BlockReferenceResult {
  if (input.blockType === "sleep") {
    return { ok: true, referenceName: "Sleep" };
  }

  if (input.blockType === "morning_journal") {
    return { ok: true, referenceName: "Morning Journal" };
  }

  if (input.blockType === "night_journal") {
    return { ok: true, referenceName: "Night Journal" };
  }

  if (input.blockType === "custom") {
    const customName = normalizeWhitespace(input.customName);
    return customName
      ? { ok: true, referenceName: customName }
      : { ok: false, error: "Custom block name is required." };
  }

  if (!input.referenceId) {
    return setupBlockTypes.includes(input.blockType)
      ? { ok: true, referenceName: null }
      : { ok: false, error: "Select an item for this block." };
  }

  if (input.blockType === "study") {
    return findName(input.masterData.subjects, input.referenceId);
  }

  if (input.blockType === "language") {
    return findName(input.masterData.languages, input.referenceId);
  }

  if (input.blockType === "exercise") {
    return findName(input.masterData.exercises, input.referenceId);
  }

  const book = input.masterData.books.find((item) => item.id === input.referenceId);
  if (!book || book.status !== "reading") {
    return { ok: false, error: "Select a reading book for this block." };
  }

  return { ok: true, referenceName: book.title };
}

export function formatDaysOfWeek(daysOfWeek: number[]): string {
  const labels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return daysOfWeek.map((day) => labels[day]).join(", ");
}

export function getBlockTypeLabel(blockType: RoutineBlockType): string {
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

export function getNextSortOrder(blocks: { sortOrder: number }[]): number {
  if (blocks.length === 0) return 0;
  return Math.max(...blocks.map((block) => block.sortOrder)) + 1;
}

export function validateNoScheduleOverlap(input: {
  startTime: string | null;
  endTime: string | null;
  excludeBlockId?: string | null;
  existingBlocks: {
    id: string;
    startTime: string | Date | null;
    endTime: string | Date | null;
  }[];
}): { ok: true } | { ok: false; error: string } {
  if (!input.startTime || !input.endTime) {
    return { ok: true };
  }

  const startMinutes = parseTimeToMinutes(input.startTime);
  const endMinutes = parseTimeToMinutes(input.endTime);

  if (startMinutes === null || endMinutes === null) {
    return { ok: false, error: "Use HH:mm time format." };
  }

  const overlaps = input.existingBlocks.some((block) => {
    if (block.id === input.excludeBlockId || !block.startTime || !block.endTime) {
      return false;
    }

    const existingStart = parseTimeToMinutes(formatTimeValue(block.startTime));
    const existingEnd = parseTimeToMinutes(formatTimeValue(block.endTime));

    if (existingStart === null || existingEnd === null) {
      return false;
    }

    return startMinutes < existingEnd && endMinutes > existingStart;
  });

  return overlaps
    ? { ok: false, error: "Scheduled blocks cannot overlap." }
    : { ok: true };
}

export function formatBlockSchedule(input: {
  startTime: string | Date | null;
  endTime: string | Date | null;
}): string {
  if (!input.startTime || !input.endTime) {
    return "Unscheduled";
  }

  return `${formatTimeValue(input.startTime)}-${formatTimeValue(input.endTime)}`;
}

export function formatTimeValue(value: string | Date): string {
  if (typeof value === "string") {
    return value.slice(0, 5);
  }

  return [
    value.getUTCHours().toString().padStart(2, "0"),
    value.getUTCMinutes().toString().padStart(2, "0")
  ].join(":");
}

export function timeStringToDate(value: string | null): Date | null {
  if (!value) return null;
  const minutes = parseTimeToMinutes(value);
  if (minutes === null) return null;
  const date = new Date(Date.UTC(1970, 0, 1, 0, 0, 0));
  date.setUTCMinutes(minutes);
  return date;
}

function findName(items: MasterOption[], id: string): BlockReferenceResult {
  const item = items.find((option) => option.id === id);
  return item
    ? { ok: true, referenceName: item.name }
    : { ok: false, error: "Select an item for this block." };
}

function isRoutineBlockType(blockType: string): blockType is RoutineBlockType {
  return blockTypes.includes(blockType as RoutineBlockType);
}

function calculateDurationFromTimeRange(
  startTime: string,
  endTime: string
): number | "invalid-format" | "invalid-range" {
  const startMinutes = parseTimeToMinutes(startTime);
  const endMinutes = parseTimeToMinutes(endTime);

  if (startMinutes === null || endMinutes === null) {
    return "invalid-format";
  }

  if (endMinutes <= startMinutes) {
    return "invalid-range";
  }

  return endMinutes - startMinutes;
}

function parseTimeToMinutes(value: string): number | null {
  if (!/^\d{2}:\d{2}$/.test(value)) return null;
  const [hours, minutes] = value.split(":").map(Number);
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
  return hours * 60 + minutes;
}

function normalizeNullable(value: string | null): string | null {
  const normalized = normalizeWhitespace(value ?? "");
  return normalized || null;
}

function normalizeWhitespace(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}
