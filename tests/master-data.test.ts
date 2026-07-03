import { describe, expect, it } from "vitest";

import {
  canUseBookInRoutine,
  validateBookInput,
  validateMasterName
} from "@/lib/master-data/validation";

describe("validateMasterName", () => {
  it("normalizes a valid master data name", () => {
    expect(validateMasterName("  English  ")).toEqual({
      ok: true,
      value: {
        name: "English",
        normalizedName: "english"
      }
    });
  });

  it("rejects an empty name", () => {
    expect(validateMasterName("   ")).toEqual({
      ok: false,
      error: "Name is required."
    });
  });

  it("rejects a name longer than 100 characters", () => {
    expect(validateMasterName("a".repeat(101))).toEqual({
      ok: false,
      error: "Name must be 100 characters or fewer."
    });
  });
});

describe("validateBookInput", () => {
  it("normalizes valid book title and author", () => {
    expect(validateBookInput({ title: "  Atomic Habits ", author: " James Clear " })).toEqual({
      ok: true,
      value: {
        title: "Atomic Habits",
        author: "James Clear"
      }
    });
  });

  it("stores an empty author as null", () => {
    expect(validateBookInput({ title: "Atomic Habits", author: "  " })).toEqual({
      ok: true,
      value: {
        title: "Atomic Habits",
        author: null
      }
    });
  });

  it("rejects an empty title", () => {
    expect(validateBookInput({ title: " ", author: "" })).toEqual({
      ok: false,
      error: "Book title is required."
    });
  });
});

describe("canUseBookInRoutine", () => {
  it("only allows reading books as routine choices", () => {
    expect(canUseBookInRoutine("reading")).toBe(true);
    expect(canUseBookInRoutine("completed")).toBe(false);
    expect(canUseBookInRoutine("paused")).toBe(false);
  });
});
