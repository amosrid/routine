"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import {
  getBlockReferenceName,
  getNextSortOrder,
  timeStringToDate,
  validateBlockInput,
  validateNoScheduleOverlap,
  validateTemplateInput
} from "@/lib/routine-template/validation";

export async function createTemplate(formData: FormData) {
  const user = await requireUser();
  const validation = validateTemplateInput({
    name: String(formData.get("name") ?? ""),
    daysOfWeek: formData.getAll("daysOfWeek").map(String)
  });

  if (!validation.ok) {
    return redirectToTemplates({ error: validation.error });
  }

  await prisma.routineTemplate.create({
    data: {
      userId: user.id,
      name: validation.value.name,
      daysOfWeek: validation.value.daysOfWeek
    }
  });

  return redirectToTemplates({ message: "Template created." });
}

export async function updateTemplate(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  const validation = validateTemplateInput({
    name: String(formData.get("name") ?? ""),
    daysOfWeek: formData.getAll("daysOfWeek").map(String)
  });

  if (!id) {
    return redirectToTemplates({ error: "Invalid template." });
  }

  if (!validation.ok) {
    return redirectToTemplates({ error: validation.error });
  }

  await prisma.routineTemplate.updateMany({
    where: { id, userId: user.id },
    data: {
      name: validation.value.name,
      daysOfWeek: validation.value.daysOfWeek
    }
  });

  return redirectToTemplates({ message: "Template updated." });
}

export async function deleteTemplate(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");

  if (!id) {
    return redirectToTemplates({ error: "Invalid template." });
  }

  await prisma.routineTemplate.deleteMany({
    where: { id, userId: user.id }
  });

  return redirectToTemplates({ message: "Template deleted." });
}

export async function addBlock(formData: FormData) {
  const user = await requireUser();
  const templateId = String(formData.get("templateId") ?? "");
  const validation = validateBlockInput({
    blockType: String(formData.get("blockType") ?? ""),
    referenceId: String(formData.get("referenceId") ?? ""),
    customName: String(formData.get("customName") ?? ""),
    durationMinutes: String(formData.get("durationMinutes") ?? ""),
    startTime: String(formData.get("startTime") ?? ""),
    endTime: String(formData.get("endTime") ?? "")
  });

  if (!validation.ok) {
    return redirectToTemplates({ error: validation.error });
  }

  const masterData = await getMasterData(user.id);
  const reference = getBlockReferenceName({
    blockType: validation.value.blockType,
    referenceId: validation.value.referenceId,
    customName: String(formData.get("customName") ?? ""),
    masterData
  });

  if (!reference.ok) {
    return redirectToTemplates({ error: reference.error });
  }

  const template = await prisma.routineTemplate.findFirst({
    where: { id: templateId, userId: user.id },
    include: {
      blocks: {
        select: {
          id: true,
          sortOrder: true,
          startTime: true,
          endTime: true
        }
      }
    }
  });

  if (!template) {
    return redirectToTemplates({ error: "Invalid template." });
  }

  const overlap = validateNoScheduleOverlap({
    startTime: validation.value.startTime,
    endTime: validation.value.endTime,
    existingBlocks: template.blocks.map((block) => ({
      id: block.id,
      startTime: block.startTime,
      endTime: block.endTime
    }))
  });

  if (!overlap.ok) {
    return redirectToTemplates({ error: overlap.error });
  }

  await prisma.routineBlock.create({
    data: {
      templateId: template.id,
      blockType: validation.value.blockType,
      referenceId: validation.value.referenceId,
      referenceName: reference.referenceName,
      startTime: timeStringToDate(validation.value.startTime),
      endTime: timeStringToDate(validation.value.endTime),
      durationMinutes: validation.value.durationMinutes,
      sortOrder: getNextSortOrder(template.blocks)
    }
  });

  return redirectToTemplates({ message: "Block added." });
}

export async function updateBlock(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");

  if (!id) {
    return redirectToTemplates({ error: "Invalid block." });
  }

  const block = await prisma.routineBlock.findFirst({
    where: {
      id,
      template: { userId: user.id }
    },
    include: {
      template: {
        include: {
          blocks: {
            select: {
              id: true,
              startTime: true,
              endTime: true
            }
          }
        }
      }
    }
  });

  if (!block) {
    return redirectToTemplates({ error: "Invalid block." });
  }

  const validation = validateBlockInput({
    blockType: block.blockType,
    referenceId: block.referenceId,
    customName: block.referenceName ?? "",
    durationMinutes: String(formData.get("durationMinutes") ?? ""),
    startTime: String(formData.get("startTime") ?? ""),
    endTime: String(formData.get("endTime") ?? "")
  });

  if (!validation.ok) {
    return redirectToTemplates({ error: validation.error });
  }

  const overlap = validateNoScheduleOverlap({
    startTime: validation.value.startTime,
    endTime: validation.value.endTime,
    excludeBlockId: block.id,
    existingBlocks: block.template.blocks.map((existingBlock) => ({
      id: existingBlock.id,
      startTime: existingBlock.startTime,
      endTime: existingBlock.endTime
    }))
  });

  if (!overlap.ok) {
    return redirectToTemplates({ error: overlap.error });
  }

  await prisma.routineBlock.updateMany({
    where: {
      id,
      template: { userId: user.id }
    },
    data: {
      startTime: timeStringToDate(validation.value.startTime),
      endTime: timeStringToDate(validation.value.endTime),
      durationMinutes: validation.value.durationMinutes
    }
  });

  return redirectToTemplates({ message: "Block updated." });
}

export async function deleteBlock(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");

  if (!id) {
    return redirectToTemplates({ error: "Invalid block." });
  }

  await prisma.routineBlock.deleteMany({
    where: {
      id,
      template: { userId: user.id }
    }
  });

  return redirectToTemplates({ message: "Block deleted." });
}

export async function moveBlockUp(formData: FormData) {
  await moveBlock(formData, "up");
}

export async function moveBlockDown(formData: FormData) {
  await moveBlock(formData, "down");
}

async function moveBlock(formData: FormData, direction: "up" | "down") {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");

  const block = await prisma.routineBlock.findFirst({
    where: {
      id,
      template: { userId: user.id }
    }
  });

  if (!block) {
    return redirectToTemplates({ error: "Invalid block." });
  }

  const sibling = await prisma.routineBlock.findFirst({
    where: {
      templateId: block.templateId,
      sortOrder:
        direction === "up" ? { lt: block.sortOrder } : { gt: block.sortOrder }
    },
    orderBy: { sortOrder: direction === "up" ? "desc" : "asc" }
  });

  if (!sibling) {
    return redirectToTemplates({ message: "Block order unchanged." });
  }

  const tempOrder = -1 - block.sortOrder; // unique negative temp value
  await prisma.$transaction([
    prisma.routineBlock.update({
      where: { id: block.id },
      data: { sortOrder: tempOrder }
    }),
    prisma.routineBlock.update({
      where: { id: sibling.id },
      data: { sortOrder: block.sortOrder }
    }),
    prisma.routineBlock.update({
      where: { id: block.id },
      data: { sortOrder: sibling.sortOrder }
    })
  ]);

  return redirectToTemplates({ message: "Block reordered." });
}

async function getMasterData(userId: string) {
  const [subjects, languages, exercises, books] = await Promise.all([
    prisma.studySubject.findMany({
      where: { userId },
      select: { id: true, name: true }
    }),
    prisma.userLanguage.findMany({
      where: { userId },
      select: { id: true, name: true }
    }),
    prisma.exerciseType.findMany({
      where: { userId },
      select: { id: true, name: true }
    }),
    prisma.book.findMany({
      where: { userId },
      select: { id: true, title: true, status: true }
    })
  ]);

  return { subjects, languages, exercises, books };
}

function redirectToTemplates(params: { error?: string; message?: string }): never {
  revalidatePath("/routine/templates");
  const searchParams = new URLSearchParams();
  if (params.error) searchParams.set("error", params.error);
  if (params.message) searchParams.set("message", params.message);
  redirect(`/routine/templates?${searchParams.toString()}`);
}
