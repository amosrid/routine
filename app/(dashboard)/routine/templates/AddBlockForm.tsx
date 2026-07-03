"use client";

import { useMemo, useState } from "react";

import type { RoutineBlockType } from "@/lib/routine-template/validation";

type Option = { id: string; label: string };

type AddBlockFormProps = {
  action: (formData: FormData) => void;
  templateId: string;
  subjects: Option[];
  languages: Option[];
  exercises: Option[];
  books: Option[];
};

const blockTypes: { value: RoutineBlockType; label: string }[] = [
  { value: "study", label: "Study" },
  { value: "language", label: "Language" },
  { value: "exercise", label: "Exercise" },
  { value: "book", label: "Book" },
  { value: "morning_journal", label: "Morning Journal" },
  { value: "night_journal", label: "Night Journal" },
  { value: "custom", label: "Custom" }
];

export function AddBlockForm({
  action,
  templateId,
  subjects,
  languages,
  exercises,
  books
}: AddBlockFormProps) {
  const [blockType, setBlockType] = useState<RoutineBlockType>("study");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("30");
  const referenceOptions = useMemo(
    () =>
      ({
        study: subjects,
        language: languages,
        exercise: exercises,
        book: books,
        sleep: [],
        morning_journal: [],
        night_journal: [],
        custom: []
      })[blockType],
    [blockType, books, exercises, languages, subjects]
  );
  const shouldShowReference = ["study", "language", "exercise", "book"].includes(blockType);
  const shouldShowCustomName = blockType === "custom";

  function handleTimeChange(nextStartTime: string, nextEndTime: string) {
    setStartTime(nextStartTime);
    setEndTime(nextEndTime);

    const calculatedDuration = calculateDuration(nextStartTime, nextEndTime);
    if (calculatedDuration !== null) {
      setDurationMinutes(String(calculatedDuration));
    }
  }

  return (
    <form action={action} className="mt-4 grid gap-3 lg:grid-cols-[1fr_1fr_1fr_auto]">
      <input name="templateId" type="hidden" value={templateId} />
      <label className="grid gap-1 text-sm">
        Block Type
        <select
          className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-50"
          name="blockType"
          onChange={(event) => setBlockType(event.target.value as RoutineBlockType)}
          value={blockType}
        >
          {blockTypes.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </label>

      {shouldShowReference ? (
        <label className="grid gap-1 text-sm">
          Reference
          <select
            className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-50"
            name="referenceId"
          >
            <option value="">Choose during morning setup</option>
            {referenceOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      ) : (
        <input name="referenceId" type="hidden" value="" />
      )}

      {shouldShowCustomName ? (
        <label className="grid gap-1 text-sm">
          Custom Name
          <input
            className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-50"
            name="customName"
            placeholder="Dimsum"
            required
          />
        </label>
      ) : (
        <input name="customName" type="hidden" value="" />
      )}

      <div className="grid gap-3 md:grid-cols-3 lg:col-span-3">
        <label className="grid gap-1 text-sm">
          Start Time
          <input
            className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-50"
            name="startTime"
            onChange={(event) => handleTimeChange(event.target.value, endTime)}
            type="time"
            value={startTime}
          />
        </label>
        <label className="grid gap-1 text-sm">
          End Time
          <input
            className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-50"
            name="endTime"
            onChange={(event) => handleTimeChange(startTime, event.target.value)}
            type="time"
            value={endTime}
          />
        </label>
        <label className="grid gap-1 text-sm">
          Duration
          <input
            className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-50"
            max={480}
            min={5}
            name="durationMinutes"
            onChange={(event) => setDurationMinutes(event.target.value)}
            required={!startTime && !endTime}
            type="number"
            value={durationMinutes}
          />
        </label>
      </div>

      <button
        className="self-end rounded-md bg-primary px-4 py-2 font-medium text-white"
        type="submit"
      >
        Add Block
      </button>
    </form>
  );
}

function calculateDuration(startTime: string, endTime: string): number | null {
  if (!startTime || !endTime) return null;
  const [startHours, startMinutes] = startTime.split(":").map(Number);
  const [endHours, endMinutes] = endTime.split(":").map(Number);
  const startTotal = startHours * 60 + startMinutes;
  const endTotal = endHours * 60 + endMinutes;
  return endTotal > startTotal ? endTotal - startTotal : null;
}
