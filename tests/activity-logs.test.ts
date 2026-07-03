import { describe, expect, it } from "vitest";

import {
  calculateSleepDuration,
  normalizeOptionalText,
  validateActivityDuration,
  validateWakeDate
} from "@/lib/activity-logs/validation";

describe("validateActivityDuration", () => {
  it("accepts duration between 5 and 480 minutes", () => {
    expect(validateActivityDuration("90")).toEqual({ ok: true, value: 90 });
  });

  it("rejects duration outside the allowed range", () => {
    expect(validateActivityDuration("4")).toEqual({
      ok: false,
      error: "Duration must be between 5 and 480 minutes."
    });
  });
});

describe("normalizeOptionalText", () => {
  it("trims whitespace and converts empty text to null", () => {
    expect(normalizeOptionalText("  Read chapter 1  ")).toBe("Read chapter 1");
    expect(normalizeOptionalText("   ")).toBeNull();
  });
});

describe("calculateSleepDuration", () => {
  it("calculates same-day sleep duration", () => {
    expect(calculateSleepDuration("22:00", "23:30")).toEqual({
      ok: true,
      value: 90
    });
  });

  it("calculates duration when sleep crosses midnight", () => {
    expect(calculateSleepDuration("23:00", "06:00")).toEqual({
      ok: true,
      value: 420
    });
  });

  it("rejects equal sleep and wake times", () => {
    expect(calculateSleepDuration("06:00", "06:00")).toEqual({
      ok: false,
      error: "Wake time must be different from sleep time."
    });
  });
});

describe("validateWakeDate", () => {
  it("accepts YYYY-MM-DD dates", () => {
    expect(validateWakeDate("2026-07-02")).toEqual({
      ok: true,
      value: "2026-07-02"
    });
  });

  it("rejects invalid dates", () => {
    expect(validateWakeDate("07/02/2026")).toEqual({
      ok: false,
      error: "Use YYYY-MM-DD date format."
    });
  });
});
