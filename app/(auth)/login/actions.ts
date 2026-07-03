"use server";

import { redirect } from "next/navigation";

import { getLoginErrorMessage, validateLoginInput } from "@/lib/auth/validation";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function login(formData: FormData) {
  const emailInput = String(formData.get("email") ?? "");
  const validation = validateLoginInput({
    email: emailInput,
    password: String(formData.get("password") ?? "")
  });

  if (!validation.ok) {
    return redirectToLogin({ error: validation.error, email: emailInput });
  }

  const supabase = createServerSupabaseClient();
  const { error } = await supabase.auth.signInWithPassword(validation.value);

  if (error) {
    return redirectToLogin({ error: getLoginErrorMessage(error), email: emailInput });
  }

  return redirect("/");
}

function redirectToLogin(params: { error: string; email: string }): never {
  const searchParams = new URLSearchParams({
    error: params.error,
    email: params.email
  });

  redirect(`/login?${searchParams.toString()}`);
}
