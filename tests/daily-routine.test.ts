import { describe, expect, it } from "vitest";

import {
  calculateScorePercentage,
  createSnapshotItems,
  filterPendingDetailItems,
  getJakartaDateParts,
  getJakartaLockState,
  getNextItemState,
  getNextStreakState,
  getPreviousDateString,
  sortDailyItemsForDisplay
} from "@/lib/daily-routine/core";

describe("getJakartaDateParts", () => {
  it("calculates the routine date and weekday using Asia/Jakarta", () => {
    expect(getJakartaDateParts(new Date("2026-07-01T18:30:00.000Z"))).toEqual({
      date: "2026-07-02",
      weekday: 4
    });
  });
});

describe("getJakartaLockState", () => {
  it("keeps the daily routine unlocked before 11:00 WIB", () => {
    expect(getJakartaLockState(new Date("2026-07-02T03:59:00.000Z"))).toEqual({
      isLocked: false,
      lockHour: 11
    });
  });

  it("locks the daily routine at 11:00 WIB", () => {
    expect(getJakartaLockState(new Date("2026-07-02T04:00:00.000Z"))).toEqual({
      isLocked: true,
      lockHour: 11
    });
  });
});

describe("getPreviousDateString", () => {
  it("returns the previous calendar date", () => {
    expect(getPreviousDateString("2026-07-01")).toBe("2026-06-30");
  });
});

describe("calculateScorePercentage", () => {
  it("calculates completed items divided by total items", () => {
    expect(
      calculateScorePercentage([
        { isCompleted: true },
        { isCompleted: false },
        { isCompleted: false }
      ])
    ).toBe(33);
  });

  it("returns zero when there are no routine items", () => {
    expect(calculateScorePercentage([])).toBe(0);
  });

  it("does not count setup placeholders in the daily score", () => {
    expect(
      calculateScorePercentage([
        { isCompleted: true, isSetupPlaceholder: false },
        { isCompleted: false, isSetupPlaceholder: false },
        { isCompleted: false, isSetupPlaceholder: true }
      ])
    ).toBe(50);
  });

  it("does not count sleep monitoring rows in the daily score", () => {
    expect(
      calculateScorePercentage([
        { isCompleted: true, blockType: "study" },
        { isCompleted: false, blockType: "sleep" }
      ])
    ).toBe(100);
  });
});

describe("createSnapshotItems", () => {
  it("copies routine block fields into daily item snapshots", () => {
    const items = createSnapshotItems([
      {
        id: "block-1",
        blockType: "custom",
        referenceId: null,
        referenceName: "Dimsum",
        startTime: new Date(Date.UTC(1970, 0, 1, 4, 0, 0)),
        endTime: new Date(Date.UTC(1970, 0, 1, 5, 30, 0)),
        durationMinutes: 90,
        sortOrder: 1
      }
    ]);

    expect(items).toEqual([
      {
        sourceBlockId: "block-1",
        blockType: "custom",
        referenceId: null,
        referenceName: "Dimsum",
        displayName: "Dimsum",
        isSetupPlaceholder: false,
        startTime: new Date(Date.UTC(1970, 0, 1, 4, 0, 0)),
        endTime: new Date(Date.UTC(1970, 0, 1, 5, 30, 0)),
        durationMinutes: 90,
        sortOrder: 1
      }
    ]);
  });

  it("marks rough category blocks without references as setup placeholders", () => {
    const items = createSnapshotItems([
      {
        id: "block-1",
        blockType: "study",
        referenceId: null,
        referenceName: null,
        startTime: null,
        endTime: null,
        durationMinutes: 180,
        sortOrder: 0
      }
    ]);

    expect(items[0]).toMatchObject({
      blockType: "study",
      displayName: "Study setup",
      isSetupPlaceholder: true
    });
  });

  it("copies journaling blocks as normal checklist items", () => {
    const items = createSnapshotItems([
      {
        id: "block-1",
        blockType: "morning_journal",
        referenceId: null,
        referenceName: "Morning Journal",
        startTime: null,
        endTime: null,
        durationMinutes: 15,
        sortOrder: 0
      }
    ]);

    expect(items[0]).toMatchObject({
      blockType: "morning_journal",
      displayName: "Morning Journal",
      isSetupPlaceholder: false
    });
  });
});

describe("sortDailyItemsForDisplay", () => {
  it("sorts scheduled items by start time before unscheduled items by sort order", () => {
    const items = sortDailyItemsForDisplay([
      {
        id: "unscheduled-late",
        startTime: null,
        endTime: null,
        sortOrder: 3,
        createdAt: new Date("2026-07-02T00:03:00.000Z")
      },
      {
        id: "scheduled-late",
        startTime: new Date(Date.UTC(1970, 0, 1, 9, 0, 0)),
        endTime: new Date(Date.UTC(1970, 0, 1, 10, 0, 0)),
        sortOrder: 0,
        createdAt: new Date("2026-07-02T00:01:00.000Z")
      },
      {
        id: "scheduled-early",
        startTime: new Date(Date.UTC(1970, 0, 1, 4, 0, 0)),
        endTime: new Date(Date.UTC(1970, 0, 1, 5, 30, 0)),
        sortOrder: 2,
        createdAt: new Date("2026-07-02T00:02:00.000Z")
      },
      {
        id: "unscheduled-early",
        startTime: null,
        endTime: null,
        sortOrder: 1,
        createdAt: new Date("2026-07-02T00:04:00.000Z")
      }
    ]);

    expect(items.map((item) => item.id)).toEqual([
      "scheduled-early",
      "scheduled-late",
      "unscheduled-early",
      "unscheduled-late"
    ]);
  });
});

describe("getNextItemState", () => {
  it("completes an item, clears skipped state, and sets actual duration when empty", () => {
    expect(
      getNextItemState({
        action: "complete",
        durationMinutes: 90,
        actualDuration: null,
        skipReason: "Too tired"
      })
    ).toEqual({
      isCompleted: true,
      isSkipped: false,
      skipReason: null,
      actualDuration: 90
    });
  });

  it("keeps an existing actual duration when completing an item", () => {
    expect(
      getNextItemState({
        action: "complete",
        durationMinutes: 90,
        actualDuration: 75,
        skipReason: null
      })
    ).toEqual({
      isCompleted: true,
      isSkipped: false,
      skipReason: null,
      actualDuration: 75
    });
  });

  it("skips an item, clears completed state, and stores an optional reason", () => {
    expect(
      getNextItemState({
        action: "skip",
        durationMinutes: 30,
        actualDuration: 30,
        skipReason: "Family errand"
      })
    ).toEqual({
      isCompleted: false,
      isSkipped: true,
      skipReason: "Family errand",
      actualDuration: null
    });
  });

  it("undoes complete and skip state", () => {
    expect(
      getNextItemState({
        action: "undo",
        durationMinutes: 30,
        actualDuration: 30,
        skipReason: "Family errand"
      })
    ).toEqual({
      isCompleted: false,
      isSkipped: false,
      skipReason: null,
      actualDuration: null
    });
  });
});

describe("filterPendingDetailItems", () => {
  it("returns completed category items that do not have details yet", () => {
    expect(
      filterPendingDetailItems([
        {
          id: "completed-without-log",
          blockType: "study",
          isCompleted: true,
          isSkipped: false,
          isSetupPlaceholder: false,
          hasDetail: false
        },
        {
          id: "completed-with-log",
          blockType: "study",
          isCompleted: true,
          isSkipped: false,
          isSetupPlaceholder: false,
          hasDetail: true
        },
        {
          id: "not-completed",
          blockType: "study",
          isCompleted: false,
          isSkipped: false,
          isSetupPlaceholder: false,
          hasDetail: false
        },
        {
          id: "custom",
          blockType: "custom",
          isCompleted: true,
          isSkipped: false,
          isSetupPlaceholder: false,
          hasDetail: false
        }
      ], "study").map((item) => item.id)
    ).toEqual(["completed-without-log"]);
  });
});

describe("getNextStreakState", () => {
  it("increments streak when yesterday score is at least 80", () => {
    expect(
      getNextStreakState({
        currentStreak: 2,
        longestStreak: 4,
        lastActiveDate: "2026-06-30",
        lastEvaluatedDate: "2026-07-01",
        todayDate: "2026-07-02",
        yesterdayDate: "2026-07-01",
        yesterdayScorePercentage: 80
      })
    ).toEqual({
      currentStreak: 3,
      longestStreak: 4,
      lastActiveDate: "2026-07-01",
      lastEvaluatedDate: "2026-07-02"
    });
  });

  it("starts streak at one when yesterday passed but previous active date is not consecutive", () => {
    expect(
      getNextStreakState({
        currentStreak: 5,
        longestStreak: 5,
        lastActiveDate: "2026-06-28",
        lastEvaluatedDate: "2026-07-01",
        todayDate: "2026-07-02",
        yesterdayDate: "2026-07-01",
        yesterdayScorePercentage: 90
      })
    ).toEqual({
      currentStreak: 1,
      longestStreak: 5,
      lastActiveDate: "2026-07-01",
      lastEvaluatedDate: "2026-07-02"
    });
  });

  it("resets current streak when yesterday is missing or below 80", () => {
    expect(
      getNextStreakState({
        currentStreak: 3,
        longestStreak: 3,
        lastActiveDate: "2026-06-30",
        lastEvaluatedDate: "2026-07-01",
        todayDate: "2026-07-02",
        yesterdayDate: "2026-07-01",
        yesterdayScorePercentage: 79
      })
    ).toEqual({
      currentStreak: 0,
      longestStreak: 3,
      lastActiveDate: "2026-06-30",
      lastEvaluatedDate: "2026-07-02"
    });
  });

  it("does not change streak more than once per WIB day", () => {
    expect(
      getNextStreakState({
        currentStreak: 3,
        longestStreak: 4,
        lastActiveDate: "2026-07-01",
        lastEvaluatedDate: "2026-07-02",
        todayDate: "2026-07-02",
        yesterdayDate: "2026-07-01",
        yesterdayScorePercentage: 100
      })
    ).toEqual({
      currentStreak: 3,
      longestStreak: 4,
      lastActiveDate: "2026-07-01",
      lastEvaluatedDate: "2026-07-02"
    });
  });
});
