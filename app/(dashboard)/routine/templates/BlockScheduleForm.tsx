"use client";

import { useState } from "react";

type BlockScheduleFormProps = {
  action: (formData: FormData) => void;
  blockId: string;
  initialStartTime: string;
  initialEndTime: string;
  initialDurationMinutes: number;
};

export function BlockScheduleForm({
  action,
  blockId,
  initialStartTime,
  initialEndTime,
  initialDurationMinutes
}: BlockScheduleFormProps) {
  const [startTime, setStartTime] = useState(initialStartTime);
  const [endTime, setEndTime] = useState(initialEndTime);
  const [durationMinutes, setDurationMinutes] = useState(
    String(initialDurationMinutes)
  );

  function handleTimeChange(nextStartTime: string, nextEndTime: string) {
    setStartTime(nextStartTime);
    setEndTime(nextEndTime);

    const calculatedDuration = calculateDuration(nextStartTime, nextEndTime);
    if (calculatedDuration !== null) {
      setDurationMinutes(String(calculatedDuration));
    }
  }

  return (
    <form action={action} className="grid gap-2 md:grid-cols-[1fr_1fr_1fr_auto]">
      <input name="id" type="hidden" value={blockId} />
      <label className="grid gap-1 text-sm">
        Start Time
        <input
          className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-50"
          name="startTime"
          onChange={(event) => handleTimeChange(event.target.value, endTime)}
          type="time"
          value={startTime}
        />
      </label>
      <label className="grid gap-1 text-sm">
        End Time
        <input
          className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-50"
          name="endTime"
          onChange={(event) => handleTimeChange(startTime, event.target.value)}
          type="time"
          value={endTime}
        />
      </label>
      <label className="grid gap-1 text-sm">
        Duration
        <input
          className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-50"
          max={480}
          min={5}
          name="durationMinutes"
          onChange={(event) => setDurationMinutes(event.target.value)}
          required={!startTime && !endTime}
          type="number"
          value={durationMinutes}
        />
      </label>
      <button
        className="self-end rounded-md border border-slate-700 px-3 py-2 text-sm"
        type="submit"
      >
        Save
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
