import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const repoRoot = process.cwd();

describe("pending detail flow", () => {
  it("does not limit pending category details to the current day", () => {
    const pageData = readFileSync(join(repoRoot, "lib/activity-logs/page-data.ts"), "utf8");

    expect(pageData).toContain("getPendingRoutineItemsForType");
    expect(pageData).not.toContain("userId_routineDate");
  });

  it("saves category detail dates from the source routine item", () => {
    [
      "app/(dashboard)/deepwork/actions.ts",
      "app/(dashboard)/language/actions.ts",
      "app/(dashboard)/exercise/actions.ts",
      "app/(dashboard)/book/actions.ts",
      "app/(dashboard)/journaling/actions.ts"
    ].forEach((file) => {
      const content = readFileSync(join(repoRoot, file), "utf8");
      expect(content).toContain("dailyRoutine: { select: { routineDate: true } }");
      expect(content).toContain("logDate: routineItem.dailyRoutine.routineDate");
    });
  });
});
