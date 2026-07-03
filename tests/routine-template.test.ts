import { describe, expect, it } from "vitest";

import {
  formatBlockSchedule,
  getBlockReferenceName,
  getNextSortOrder,
  validateNoScheduleOverlap,
  validateBlockInput,
  validateTemplateInput
} from "@/lib/routine-template/validation";

describe("validateTemplateInput", () => {
  it("accepts a valid template name and active days", () => {
    expect(
      validateTemplateInput({
        name: "  Weekday Routine ",
        daysOfWeek: ["1", "2", "3", "4", "5"]
      })
    ).toEqual({
      ok: true,
      value: {
        name: "Weekday Routine",
        daysOfWeek: [1, 2, 3, 4, 5]
      }
    });
  });

  it("rejects an empty template name", () => {
    expect(validateTemplateInput({ name: " ", daysOfWeek: ["1"] })).toEqual({
      ok: false,
      error: "Template name is required."
    });
  });

  it("rejects templates without active days", () => {
    expect(validateTemplateInput({ name: "Weekday", daysOfWeek: [] })).toEqual({
      ok: false,
      error: "Select at least one active day."
    });
  });
});

describe("validateBlockInput", () => {
  it("accepts a referenced study block with a valid duration", () => {
    expect(
      validateBlockInput({
        blockType: "study",
        referenceId: "subject-1",
        customName: "",
        durationMinutes: "90",
        startTime: "",
        endTime: ""
      })
    ).toEqual({
      ok: true,
      value: {
        blockType: "study",
        referenceId: "subject-1",
        referenceName: null,
        durationMinutes: 90,
        startTime: null,
        endTime: null
      }
    });
  });

  it("allows rough master-data block types without references", () => {
    expect(
      validateBlockInput({
        blockType: "language",
        referenceId: "",
        customName: "",
        durationMinutes: "30",
        startTime: "",
        endTime: ""
      })
    ).toEqual({
      ok: true,
      value: {
        blockType: "language",
        referenceId: null,
        referenceName: null,
        durationMinutes: 30,
        startTime: null,
        endTime: null
      }
    });
  });

  it("rejects sleep as a routine template block", () => {
    expect(
      validateBlockInput({
        blockType: "sleep",
        referenceId: "",
        customName: "",
        durationMinutes: "30",
        startTime: "",
        endTime: ""
      })
    ).toEqual({
      ok: false,
      error: "Sleep is monitoring only and cannot be added to a routine template."
    });
  });

  it("requires a custom name for custom blocks", () => {
    expect(
      validateBlockInput({
        blockType: "custom",
        referenceId: "",
        customName: " ",
        durationMinutes: "30",
        startTime: "",
        endTime: ""
      })
    ).toEqual({
      ok: false,
      error: "Custom block name is required."
    });
  });

  it("rejects durations outside 5 to 480 minutes", () => {
    expect(
      validateBlockInput({
        blockType: "study",
        referenceId: "",
        customName: "",
        durationMinutes: "4",
        startTime: "",
        endTime: ""
      })
    ).toEqual({
      ok: false,
      error: "Duration must be between 5 and 480 minutes."
    });
  });

  it("accepts journaling checklist blocks without references", () => {
    expect(
      validateBlockInput({
        blockType: "morning_journal",
        referenceId: "",
        customName: "",
        durationMinutes: "15",
        startTime: "",
        endTime: ""
      })
    ).toEqual({
      ok: true,
      value: {
        blockType: "morning_journal",
        referenceId: null,
        referenceName: "Morning Journal",
        durationMinutes: 15,
        startTime: null,
        endTime: null
      }
    });
  });

  it("requires start and end time as a pair", () => {
    expect(
      validateBlockInput({
        blockType: "custom",
        referenceId: "",
        customName: "Dimsum",
        durationMinutes: "",
        startTime: "04:00",
        endTime: ""
      })
    ).toEqual({
      ok: false,
      error: "Start time and end time must be filled together."
    });
  });

  it("requires end time to be greater than start time", () => {
    expect(
      validateBlockInput({
        blockType: "custom",
        referenceId: "",
        customName: "Dimsum",
        durationMinutes: "",
        startTime: "05:30",
        endTime: "04:00"
      })
    ).toEqual({
      ok: false,
      error: "End time must be later than start time."
    });
  });

  it("calculates duration from a same-day time range", () => {
    expect(
      validateBlockInput({
        blockType: "custom",
        referenceId: "",
        customName: "Dimsum",
        durationMinutes: "90",
        startTime: "04:00",
        endTime: "05:30"
      })
    ).toEqual({
      ok: true,
      value: {
        blockType: "custom",
        referenceId: null,
        referenceName: "Dimsum",
        durationMinutes: 90,
        startTime: "04:00",
        endTime: "05:30"
      }
    });
  });

  it("rejects manual duration that conflicts with scheduled time range", () => {
    expect(
      validateBlockInput({
        blockType: "custom",
        referenceId: "",
        customName: "Dimsum",
        durationMinutes: "30",
        startTime: "04:00",
        endTime: "05:30"
      })
    ).toEqual({
      ok: false,
      error: "Duration must match the selected time range."
    });
  });
});

describe("getBlockReferenceName", () => {
  const masterData = {
    subjects: [{ id: "subject-1", name: "PHP" }],
    languages: [{ id: "language-1", name: "English" }],
    exercises: [{ id: "exercise-1", name: "Push Up" }],
    books: [
      { id: "book-1", title: "Atomic Habits", status: "reading" },
      { id: "book-2", title: "Completed Book", status: "completed" }
    ]
  };

  it("uses only reading books as block references", () => {
    expect(
      getBlockReferenceName({
        blockType: "book",
        referenceId: "book-1",
        customName: "",
        masterData
      })
    ).toEqual({ ok: true, referenceName: "Atomic Habits" });

    expect(
      getBlockReferenceName({
        blockType: "book",
        referenceId: "book-2",
        customName: "",
        masterData
      })
    ).toEqual({
      ok: false,
      error: "Select a reading book for this block."
    });
  });

  it("uses the custom block name as the reference name", () => {
    expect(
      getBlockReferenceName({
        blockType: "custom",
        referenceId: null,
        customName: "Planning",
        masterData
      })
    ).toEqual({ ok: true, referenceName: "Planning" });
  });

  it("allows rough blocks without a reference", () => {
    expect(
      getBlockReferenceName({
        blockType: "study",
        referenceId: null,
        customName: "",
        masterData
      })
    ).toEqual({ ok: true, referenceName: null });
  });
});

describe("getNextSortOrder", () => {
  it("uses one more than the highest current sort order", () => {
    expect(getNextSortOrder([{ sortOrder: 0 }, { sortOrder: 4 }])).toBe(5);
  });

  it("starts at zero when the template has no blocks", () => {
    expect(getNextSortOrder([])).toBe(0);
  });
});

describe("validateNoScheduleOverlap", () => {
  it("rejects overlapping scheduled blocks in the same template", () => {
    expect(
      validateNoScheduleOverlap({
        startTime: "05:20",
        endTime: "06:00",
        existingBlocks: [
          { id: "block-1", startTime: "04:00", endTime: "05:30" },
          { id: "block-2", startTime: null, endTime: null }
        ]
      })
    ).toEqual({
      ok: false,
      error: "Scheduled blocks cannot overlap."
    });
  });

  it("allows adjacent scheduled blocks", () => {
    expect(
      validateNoScheduleOverlap({
        startTime: "05:30",
        endTime: "06:00",
        existingBlocks: [{ id: "block-1", startTime: "04:00", endTime: "05:30" }]
      })
    ).toEqual({ ok: true });
  });
});

describe("formatBlockSchedule", () => {
  it("formats scheduled and unscheduled block labels", () => {
    expect(formatBlockSchedule({ startTime: "04:00", endTime: "05:30" })).toBe(
      "04:00-05:30"
    );
    expect(formatBlockSchedule({ startTime: null, endTime: null })).toBe(
      "Unscheduled"
    );
  });
});
