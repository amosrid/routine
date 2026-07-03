"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { validateBookInput, validateMasterName, type BookStatus } from "@/lib/master-data/validation";

type MasterKind = "subject" | "language" | "exercise";

const duplicateMessage = "This name already exists in this category.";

export async function createMasterItem(formData: FormData) {
  const user = await requireUser();
  const kind = String(formData.get("kind") ?? "") as MasterKind;
  const validation = validateMasterName(String(formData.get("name") ?? ""));

  if (!validation.ok) {
    return redirectToSettings({ error: validation.error });
  }

  try {
    if (kind === "subject") {
      await prisma.studySubject.create({
        data: {
          userId: user.id,
          name: validation.value.name,
          nameNormalized: validation.value.normalizedName
        }
      });
    } else if (kind === "language") {
      await prisma.userLanguage.create({
        data: {
          userId: user.id,
          name: validation.value.name,
          nameNormalized: validation.value.normalizedName
        }
      });
    } else if (kind === "exercise") {
      await prisma.exerciseType.create({
        data: {
          userId: user.id,
          name: validation.value.name,
          nameNormalized: validation.value.normalizedName
        }
      });
    } else {
      return redirectToSettings({ error: "Invalid master data category." });
    }
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return redirectToSettings({ error: duplicateMessage });
    }
    throw error;
  }

  revalidatePath("/settings");
  return redirectToSettings({ message: "Data added." });
}

export async function deleteMasterItem(formData: FormData) {
  const user = await requireUser();
  const kind = String(formData.get("kind") ?? "") as MasterKind;
  const id = String(formData.get("id") ?? "");

  if (!id) {
    return redirectToSettings({ error: "Invalid data." });
  }

  if (kind === "subject") {
    await prisma.studySubject.deleteMany({ where: { id, userId: user.id } });
  } else if (kind === "language") {
    await prisma.userLanguage.deleteMany({ where: { id, userId: user.id } });
  } else if (kind === "exercise") {
    await prisma.exerciseType.deleteMany({ where: { id, userId: user.id } });
  } else {
    return redirectToSettings({ error: "Invalid master data category." });
  }

  revalidatePath("/settings");
  return redirectToSettings({ message: "Data deleted." });
}

export async function createBook(formData: FormData) {
  const user = await requireUser();
  const validation = validateBookInput({
    title: String(formData.get("title") ?? ""),
    author: String(formData.get("author") ?? "")
  });

  if (!validation.ok) {
    return redirectToSettings({ error: validation.error });
  }

  await prisma.book.create({
    data: {
      userId: user.id,
      title: validation.value.title,
      author: validation.value.author
    }
  });

  revalidatePath("/settings");
  return redirectToSettings({ message: "Book added." });
}

export async function updateBookStatus(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "") as BookStatus;

  if (!id || !["reading", "completed", "paused"].includes(status)) {
    return redirectToSettings({ error: "Invalid book status." });
  }

  await prisma.book.updateMany({
    where: { id, userId: user.id },
    data: { status }
  });

  revalidatePath("/settings");
  return redirectToSettings({ message: "Book status updated." });
}

export async function deleteBook(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");

  if (!id) {
    return redirectToSettings({ error: "Invalid book." });
  }

  await prisma.book.deleteMany({ where: { id, userId: user.id } });

  revalidatePath("/settings");
  return redirectToSettings({ message: "Book deleted." });
}

function redirectToSettings(params: { error?: string; message?: string }): never {
  const searchParams = new URLSearchParams();
  if (params.error) searchParams.set("error", params.error);
  if (params.message) searchParams.set("message", params.message);
  redirect(`/settings?${searchParams.toString()}`);
}

function isUniqueConstraintError(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}
