export type MasterNameValidationResult =
  | { ok: true; value: { name: string; normalizedName: string } }
  | { ok: false; error: string };

export type BookInputValidationResult =
  | { ok: true; value: { title: string; author: string | null } }
  | { ok: false; error: string };

export type BookStatus = "reading" | "completed" | "paused";

export function validateMasterName(_name: string): MasterNameValidationResult {
  const name = normalizeWhitespace(_name);

  if (!name) {
    return { ok: false, error: "Name is required." };
  }

  if (name.length > 100) {
    return { ok: false, error: "Name must be 100 characters or fewer." };
  }

  return { ok: true, value: { name, normalizedName: name.toLowerCase() } };
}

export function validateBookInput(_input: {
  title: string;
  author?: string | null;
}): BookInputValidationResult {
  const title = normalizeWhitespace(_input.title);
  const author = normalizeWhitespace(_input.author ?? "");

  if (!title) {
    return { ok: false, error: "Book title is required." };
  }

  return {
    ok: true,
    value: {
      title,
      author: author || null
    }
  };
}

export function canUseBookInRoutine(_status: BookStatus): boolean {
  return _status === "reading";
}

function normalizeWhitespace(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}
