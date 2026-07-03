import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

describe("README revised flow", () => {
  const readme = readFileSync(join(process.cwd(), "README.md"), "utf8");

  it("documents the checklist-first revised routine flow", () => {
    [
      "Template kasar -> Daily setup pagi -> Lock -> Checklist item konkret -> Pending detail",
      "Checklist complete first, detail later",
      "Sleep hanya monitoring",
      "Master data berada di halaman kategori masing-masing",
      "Study subjects: `/deepwork`",
      "Languages: `/language`",
      "Exercise types: `/exercise`",
      "Books: `/book`"
    ].forEach((text) => {
      expect(readme).toContain(text);
    });
  });

  it("does not document the old log-first flow as the main behavior", () => {
    [
      "User menyelesaikan checklist atau mengisi activity log.",
      "Activity Log ke Checklist",
      "item tersebut otomatis selesai",
      "Routine Item optional",
      "Master data yang tersedia:"
    ].forEach((text) => {
      expect(readme).not.toContain(text);
    });
  });
});
