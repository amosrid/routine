type ValidationResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: string };

export function validateTodoTitle(value: string): ValidationResult<string> {
  const title = value.trim().replace(/\s+/g, " ");

  if (!title) {
    return { ok: false, error: "Todo title is required." };
  }

  if (title.length > 160) {
    return { ok: false, error: "Todo title must be 160 characters or fewer." };
  }

  return { ok: true, value: title };
}
