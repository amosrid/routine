import { describe, expect, it } from "vitest";

import {
  calculateAverageScore,
  formatMinutes,
  sumDurationsByLabel
} from "@/lib/stats/summary";
import { validateTodoTitle } from "@/lib/todo/validation";

describe("calculateAverageScore", () => {
  it("rounds the average score", () => {
    expect(calculateAverageScore([80, 90, 91])).toBe(87);
  });

  it("returns zero for empty scores", () => {
    expect(calculateAverageScore([])).toBe(0);
  });
});

describe("formatMinutes", () => {
  it("formats minutes as hours and minutes", () => {
    expect(formatMinutes(150)).toBe("2h 30m");
    expect(formatMinutes(60)).toBe("1h");
    expect(formatMinutes(45)).toBe("45m");
  });
});

describe("sumDurationsByLabel", () => {
  it("groups duration totals by label", () => {
    expect(
      sumDurationsByLabel([
        { label: "PHP", durationMinutes: 60 },
        { label: "PHP", durationMinutes: 30 },
        { label: "English", durationMinutes: 45 }
      ])
    ).toEqual([
      { label: "PHP", durationMinutes: 90 },
      { label: "English", durationMinutes: 45 }
    ]);
  });
});

describe("validateTodoTitle", () => {
  it("accepts and normalizes todo title", () => {
    expect(validateTodoTitle("  Submit portfolio  ")).toEqual({
      ok: true,
      value: "Submit portfolio"
    });
  });

  it("rejects empty todo title", () => {
    expect(validateTodoTitle(" ")).toEqual({
      ok: false,
      error: "Todo title is required."
    });
  });
});
