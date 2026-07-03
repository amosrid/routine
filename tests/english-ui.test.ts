import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const repoRoot = process.cwd();
const filesToScan = findSourceFiles(["app", "lib"]);

const bannedUserFacingText = [
  "Masuk",
  "Daftar",
  "Pengaturan",
  "Keluar",
  "Nama",
  "Bahasa",
  "Tambah",
  "Hapus",
  "Berhasil",
  "Gagal",
  "wajib",
  "maksimal",
  "Konfirmasi",
  "salah",
  "rutinitas",
  "Belum",
  "Buku",
  "Penulis",
  "Latihan",
  "Tersedia",
  "Tidak muncul",
  "Kelola",
  "Lanjutkan",
  "Judul",
  "Ubah",
  "Simpan",
  "Batal",
  "Tidak ada",
  "Pilih",
  "duplikat",
  "tidak valid",
  "sudah ada"
];

describe("English UI copy", () => {
  it("does not include known Indonesian user-facing text in current app files", () => {
    const matches = filesToScan.flatMap((file) => {
      const content = readFileSync(join(repoRoot, file), "utf8");

      return bannedUserFacingText
        .filter((text) => content.includes(text))
        .map((text) => `${file}: ${text}`);
    });

    expect(matches).toEqual([]);
  });

  it("keeps required Settings terminology in English", () => {
    const settingsPage = readFileSync(
      join(repoRoot, "app/(dashboard)/settings/page.tsx"),
      "utf8"
    );

    [
      "Settings",
      "Profile",
      "Preferences",
      "Profile and application preferences",
      "Category master data is managed from each category page."
    ].forEach((label) => {
      expect(settingsPage).toContain(label);
    });
  });

  it("keeps required Routine Template terminology in English", () => {
    const templatesPage = readFileSync(
      join(repoRoot, "app/(dashboard)/routine/templates/page.tsx"),
      "utf8"
    );
    const addBlockForm = readFileSync(
      join(repoRoot, "app/(dashboard)/routine/templates/AddBlockForm.tsx"),
      "utf8"
    );
    const blockScheduleForm = readFileSync(
      join(repoRoot, "app/(dashboard)/routine/templates/BlockScheduleForm.tsx"),
      "utf8"
    );
    const routineTemplateCopy = `${templatesPage}\n${addBlockForm}\n${blockScheduleForm}`;

    [
      "Routine Templates",
      "Create Template",
      "Template Name",
      "Active Days",
      "Add Block",
      "Block Type",
      "Duration",
      "Start Time",
      "End Time",
      "Reference",
      "Custom Name",
      "Move Up",
      "Move Down",
      "Save",
      "Delete"
    ].forEach((label) => {
      expect(routineTemplateCopy).toContain(label);
    });
  });

  it("keeps required Daily Routine terminology in English", () => {
    const homePage = readFileSync(
      join(repoRoot, "app/(dashboard)/page.tsx"),
      "utf8"
    );

    [
      "Today's Routine",
      "Streak",
      "Daily Routine Lock",
      "Locked",
      "Unlocked",
      "Score",
      "Complete",
      "Skip",
      "Undo",
      "Completed",
      "Skipped",
      "Optional skip reason",
      "No routine template for today",
      "Template has no blocks"
    ].forEach((label) => {
      expect(homePage).toContain(label);
    });
  });

  it("keeps required Activity Log terminology in English", () => {
    const activityPages = [
      "app/(dashboard)/deepwork/page.tsx",
      "app/(dashboard)/language/page.tsx",
      "app/(dashboard)/exercise/page.tsx",
      "app/(dashboard)/book/page.tsx",
      "app/(dashboard)/journaling/page.tsx",
      "app/(dashboard)/sleep/page.tsx"
    ].map((file) => readFileSync(join(repoRoot, file), "utf8")).join("\n");

    [
      "Study Details",
      "Language Details",
      "Exercise Details",
      "Book Details",
      "Journaling Details",
      "Sleep Log",
      "Duration Minutes",
      "No logs yet.",
      "Save Study Detail",
      "Save Journal Detail",
      "Update Journal Detail",
      "Save Sleep Log"
    ].forEach((label) => {
      expect(activityPages).toContain(label);
    });
  });

  it("keeps category master data and accumulation terminology in English", () => {
    const studyPage = readFileSync(join(repoRoot, "app/(dashboard)/deepwork/page.tsx"), "utf8");
    const languagePage = readFileSync(join(repoRoot, "app/(dashboard)/language/page.tsx"), "utf8");
    const exercisePage = readFileSync(join(repoRoot, "app/(dashboard)/exercise/page.tsx"), "utf8");
    const bookPage = readFileSync(join(repoRoot, "app/(dashboard)/book/page.tsx"), "utf8");
    const categoryCopy = `${studyPage}\n${languagePage}\n${exercisePage}\n${bookPage}`;
    const settingsPage = readFileSync(join(repoRoot, "app/(dashboard)/settings/page.tsx"), "utf8");

    [
      "Study Subjects",
      "Add Study Subject",
      "Language List",
      "Add Language",
      "Exercise Types",
      "Add Exercise Type",
      "Books",
      "Add Book",
      "Total Duration",
      "History"
    ].forEach((label) => {
      expect(categoryCopy).toContain(label);
    });

    expect(settingsPage).toContain("Profile and application preferences");
    expect(settingsPage).not.toContain("Manage the master data that will be used for routine templates.");
  });

  it("keeps required Todo and Statistics terminology in English", () => {
    const todoPage = readFileSync(
      join(repoRoot, "app/(dashboard)/todo/page.tsx"),
      "utf8"
    );
    const statsPage = readFileSync(
      join(repoRoot, "app/(dashboard)/stats/page.tsx"),
      "utf8"
    );
    const copy = `${todoPage}\n${statsPage}`;

    [
      "Todo",
      "Add Todo",
      "All",
      "Active",
      "Clear Completed",
      "Statistics",
      "Average Score This Week",
      "Daily Scores",
      "Study Duration",
      "Average Sleep Last 7 Days"
    ].forEach((label) => {
      expect(copy).toContain(label);
    });
  });

  it("documents English as the UI language standard", () => {
    const decisions = readFileSync(
      join(repoRoot, "IMPLEMENTATION_DECISIONS.md"),
      "utf8"
    );

    expect(decisions).toContain(
      "All user-facing application UI must be English across all sprints. SDD/internal planning documents may remain Indonesian."
    );
  });
});

function findSourceFiles(directories: string[]): string[] {
  return directories.flatMap((directory) => walk(directory));
}

function walk(relativePath: string): string[] {
  const absolutePath = join(repoRoot, relativePath);
  const stat = statSync(absolutePath);

  if (stat.isFile()) {
    return /\.(ts|tsx)$/.test(relativePath) ? [relativePath] : [];
  }

  return readdirSync(absolutePath).flatMap((entry) =>
    walk(join(relativePath, entry))
  );
}
