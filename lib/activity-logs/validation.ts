type ValidationResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: string };

export function validateActivityDuration(value: string): ValidationResult<number> {
  const duration = Number(value);

  if (!Number.isInteger(duration) || duration < 5 || duration > 480) {
    return { ok: false, error: "Duration must be between 5 and 480 minutes." };
  }

  return { ok: true, value: duration };
}

export function validateWakeDate(value: string): ValidationResult<string> {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return { ok: false, error: "Use YYYY-MM-DD date format." };
  }

  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
    return { ok: false, error: "Use YYYY-MM-DD date format." };
  }

  return { ok: true, value };
}

export function calculateSleepDuration(
  sleepTime: string,
  wakeTime: string
): ValidationResult<number> {
  const sleepMinutes = parseTimeToMinutes(sleepTime);
  const wakeMinutes = parseTimeToMinutes(wakeTime);

  if (sleepMinutes === null || wakeMinutes === null) {
    return { ok: false, error: "Use HH:mm time format." };
  }

  if (sleepMinutes === wakeMinutes) {
    return { ok: false, error: "Wake time must be different from sleep time." };
  }

  const duration =
    wakeMinutes > sleepMinutes
      ? wakeMinutes - sleepMinutes
      : 24 * 60 - sleepMinutes + wakeMinutes;

  return { ok: true, value: duration };
}

export function normalizeOptionalText(value: string | null): string | null {
  const normalized = (value ?? "").trim().replace(/\s+/g, " ");
  return normalized || null;
}

export function dateStringToDate(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`);
}

export function timeStringToDate(value: string): Date {
  const minutes = parseTimeToMinutes(value);
  const date = new Date(Date.UTC(1970, 0, 1, 0, 0, 0));
  date.setUTCMinutes(minutes ?? 0);
  return date;
}

function parseTimeToMinutes(value: string): number | null {
  if (!/^\d{2}:\d{2}$/.test(value)) return null;
  const [hours, minutes] = value.split(":").map(Number);
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
  return hours * 60 + minutes;
}
