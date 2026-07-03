import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import {
  formatBlockSchedule,
  formatDaysOfWeek,
  formatTimeValue,
  getBlockTypeLabel,
} from "@/lib/routine-template/validation";

import { AddBlockForm } from "./AddBlockForm";
import { BlockScheduleForm } from "./BlockScheduleForm";
import {
  addBlock,
  createTemplate,
  deleteBlock,
  deleteTemplate,
  moveBlockDown,
  moveBlockUp,
  updateBlock,
  updateTemplate
} from "./actions";

type SearchParams = {
  error?: string;
  message?: string;
};

const days = [
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
  { value: 0, label: "Sun" }
];

export default async function RoutineTemplatesPage({
  searchParams
}: {
  searchParams?: SearchParams;
}) {
  const user = await requireUser();
  const [templates, subjects, languages, exercises, books] = await Promise.all([
    prisma.routineTemplate.findMany({
      where: { userId: user.id },
      include: {
        blocks: {
          orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }]
        }
      },
      orderBy: { createdAt: "desc" }
    }),
    prisma.studySubject.findMany({
      where: { userId: user.id },
      orderBy: { name: "asc" }
    }),
    prisma.userLanguage.findMany({
      where: { userId: user.id },
      orderBy: { name: "asc" }
    }),
    prisma.exerciseType.findMany({
      where: { userId: user.id },
      orderBy: { name: "asc" }
    }),
    prisma.book.findMany({
      where: { userId: user.id, status: "reading" },
      orderBy: { title: "asc" }
    })
  ]);

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Routine Templates</h1>
        <p className="mt-2 text-slate-300">
          Create reusable routine plans from your master data.
        </p>
      </div>

      {searchParams?.error ? (
        <p className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {searchParams.error}
        </p>
      ) : null}

      {searchParams?.message ? (
        <p className="rounded-md border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
          {searchParams.message}
        </p>
      ) : null}

      <section className="rounded-lg border border-slate-800 bg-slate-900 p-5">
        <details open={templates.length === 0}>
          <summary className="cursor-pointer text-xl font-semibold">Create Template</summary>
          <form action={createTemplate} className="mt-4 space-y-4">
            <label className="grid gap-1 text-sm">
              Template Name
              <input
                className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-50"
                name="name"
                placeholder="Weekday Routine"
                required
              />
            </label>
            <DayCheckboxes selectedDays={[]} />
            <button className="rounded-md bg-primary px-4 py-2 font-medium text-white" type="submit">
              Create Template
            </button>
          </form>
        </details>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Templates</h2>
        {templates.length === 0 ? (
          <p className="rounded-lg border border-slate-800 bg-slate-900 p-5 text-sm text-slate-400">
            No routine templates yet.
          </p>
        ) : (
          templates.map((template) => {
            const sortedBlocks = sortBlocksForDisplay(template.blocks);
            const totalDuration = sortedBlocks.reduce(
              (sum, block) => sum + block.durationMinutes,
              0
            );

            return (
              <details
                className="space-y-5 rounded-lg border border-slate-800 bg-slate-900 p-5"
                key={template.id}
              >
                <summary className="cursor-pointer">
                  <span className="block text-lg font-semibold">{template.name}</span>
                  <span className="mt-1 block text-sm text-slate-400">
                    {formatDaysOfWeek(template.daysOfWeek)} | {totalDuration} minutes |{" "}
                    {sortedBlocks.length} blocks
                  </span>
                </summary>

                <div className="mt-5 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{template.name}</h3>
                    <p className="text-sm text-slate-400">
                      Active Days: {formatDaysOfWeek(template.daysOfWeek)}
                    </p>
                    <p className="text-sm text-slate-400">
                      Total Duration: {totalDuration} minutes
                    </p>
                    <p className="text-sm text-slate-400">
                      Blocks: {sortedBlocks.length}
                    </p>
                  </div>
                  <form action={deleteTemplate}>
                    <input name="id" type="hidden" value={template.id} />
                    <button
                      className="rounded-md border border-red-500/50 px-3 py-2 text-sm text-red-200"
                      type="submit"
                    >
                      Delete
                    </button>
                  </form>
                </div>

                <form action={updateTemplate} className="mt-5 space-y-4 rounded-md border border-slate-800 bg-slate-950 p-4">
                  <input name="id" type="hidden" value={template.id} />
                  <label className="grid gap-1 text-sm">
                    Template Name
                    <input
                      className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-50"
                      defaultValue={template.name}
                      name="name"
                      required
                    />
                  </label>
                  <DayCheckboxes selectedDays={template.daysOfWeek} />
                  <button
                    className="rounded-md border border-slate-700 px-3 py-2 text-sm text-slate-100"
                    type="submit"
                  >
                    Save Template
                  </button>
                </form>

                <section className="space-y-3">
                  <h4 className="font-medium">Blocks</h4>
                  {sortedBlocks.length === 0 ? (
                    <p className="text-sm text-slate-400">No blocks yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {sortedBlocks.map((block, index) => {
                        const blockName = block.referenceName ?? `${getBlockTypeLabel(block.blockType)} setup`;
                        const isScheduled = Boolean(block.startTime && block.endTime);

                        return (
                        <div
                          className="grid gap-3 rounded-md border border-slate-800 bg-slate-950 p-3"
                          key={block.id}
                        >
                          <div>
                            <p className="font-medium">
                              {formatBlockSchedule({
                                startTime: block.startTime,
                                endTime: block.endTime
                              })}{" "}
                              - {blockName}
                            </p>
                            <p className="text-sm text-slate-400">
                              {getBlockTypeLabel(block.blockType)} | Duration:{" "}
                              {block.durationMinutes} minutes
                            </p>
                          </div>
                          <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
                            <BlockScheduleForm
                              action={updateBlock}
                              blockId={block.id}
                              initialDurationMinutes={block.durationMinutes}
                              initialEndTime={block.endTime ? formatTimeValue(block.endTime) : ""}
                              initialStartTime={block.startTime ? formatTimeValue(block.startTime) : ""}
                            />
                            <div className="flex flex-wrap items-end gap-2">
                              {!isScheduled ? (
                                <>
                                  <form action={moveBlockUp}>
                                    <input name="id" type="hidden" value={block.id} />
                                    <button
                                      className="rounded-md border border-slate-700 px-3 py-2 text-sm disabled:opacity-40"
                                      disabled={index === 0}
                                      type="submit"
                                    >
                                      Move Up
                                    </button>
                                  </form>
                                  <form action={moveBlockDown}>
                                    <input name="id" type="hidden" value={block.id} />
                                    <button
                                      className="rounded-md border border-slate-700 px-3 py-2 text-sm disabled:opacity-40"
                                      disabled={index === sortedBlocks.length - 1}
                                      type="submit"
                                    >
                                      Move Down
                                    </button>
                                  </form>
                                </>
                              ) : null}
                            <form action={deleteBlock}>
                              <input name="id" type="hidden" value={block.id} />
                              <button className="text-sm text-red-200" type="submit">
                                Delete
                              </button>
                            </form>
                            </div>
                          </div>
                        </div>
                      );
                      })}
                    </div>
                  )}
                </section>

                <section className="rounded-md border border-slate-800 bg-slate-950 p-4">
                  <h4 className="font-medium">Add Block</h4>
                  <AddBlockForm
                    action={addBlock}
                    books={books.map((book) => ({ id: book.id, label: book.title }))}
                    exercises={exercises.map((exercise) => ({
                      id: exercise.id,
                      label: exercise.name
                    }))}
                    languages={languages.map((language) => ({
                      id: language.id,
                      label: language.name
                    }))}
                    subjects={subjects.map((subject) => ({
                      id: subject.id,
                      label: subject.name
                    }))}
                    templateId={template.id}
                  />
                  <p className="mt-3 text-xs text-slate-500">
                    Study, language, exercise, and book references are optional here.
                    Choose the exact daily item from Home during morning setup. Sleep is monitoring only.
                  </p>
                </section>
              </details>
            );
          })
        )}
      </section>
    </section>
  );
}

function sortBlocksForDisplay<T extends {
  startTime: Date | null;
  endTime: Date | null;
  sortOrder: number;
  createdAt: Date;
}>(blocks: T[]): T[] {
  return [...blocks].sort((first, second) => {
    const firstScheduled = Boolean(first.startTime && first.endTime);
    const secondScheduled = Boolean(second.startTime && second.endTime);

    if (firstScheduled && secondScheduled) {
      return formatTimeValue(first.startTime!).localeCompare(
        formatTimeValue(second.startTime!)
      );
    }

    if (firstScheduled) return -1;
    if (secondScheduled) return 1;

    if (first.sortOrder !== second.sortOrder) {
      return first.sortOrder - second.sortOrder;
    }

    return first.createdAt.getTime() - second.createdAt.getTime();
  });
}

function DayCheckboxes({ selectedDays }: { selectedDays: number[] }) {
  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-medium">Active Days</legend>
      <div className="flex flex-wrap gap-2">
        {days.map((day) => (
          <label
            className="flex items-center gap-2 rounded-md border border-slate-700 px-3 py-2 text-sm"
            key={day.value}
          >
            <input
              defaultChecked={selectedDays.includes(day.value)}
              name="daysOfWeek"
              type="checkbox"
              value={day.value}
            />
            {day.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
