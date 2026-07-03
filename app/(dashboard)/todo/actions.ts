"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireUser } from "@/lib/auth/session";
import { dateStringToDate } from "@/lib/activity-logs/validation";
import { prisma } from "@/lib/prisma";
import { validateTodoTitle } from "@/lib/todo/validation";

export async function createTodo(formData: FormData) {
  const user = await requireUser();
  const title = validateTodoTitle(String(formData.get("title") ?? ""));
  const dueDate = String(formData.get("dueDate") ?? "").trim();

  if (dueDate) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) {
      return redirect(`/todo?error=${encodeURIComponent("Use YYYY-MM-DD date format for due date.")}`);
    }
    const parsedDate = new Date(`${dueDate}T00:00:00.000Z`);
    if (isNaN(parsedDate.getTime()) || parsedDate.toISOString().slice(0, 10) !== dueDate) {
      return redirect(`/todo?error=${encodeURIComponent("Invalid due date.")}`);
    }
  }

  if (!title.ok) {
    return redirect(`/todo?error=${encodeURIComponent(title.error)}`);
  }

  await prisma.todoItem.create({
    data: {
      userId: user.id,
      title: title.value,
      dueDate: dueDate ? dateStringToDate(dueDate) : null
    }
  });

  revalidatePath("/todo");
  return redirect("/todo?message=Todo added.");
}

export async function toggleTodo(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  const isCompleted = String(formData.get("isCompleted") ?? "") === "true";

  await prisma.todoItem.updateMany({
    where: { id, userId: user.id },
    data: {
      isCompleted,
      completedAt: isCompleted ? new Date() : null
    }
  });

  revalidatePath("/todo");
  return redirect("/todo");
}

export async function deleteTodo(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");

  await prisma.todoItem.deleteMany({
    where: { id, userId: user.id }
  });

  revalidatePath("/todo");
  return redirect("/todo?message=Todo deleted.");
}

export async function clearCompletedTodos() {
  const user = await requireUser();

  await prisma.todoItem.deleteMany({
    where: { userId: user.id, isCompleted: true }
  });

  revalidatePath("/todo");
  return redirect("/todo?message=Completed todos cleared.");
}
