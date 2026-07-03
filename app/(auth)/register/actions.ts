"use server";

import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { validateRegisterInput } from "@/lib/auth/validation";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function register(formData: FormData) {
  const validation = validateRegisterInput({
    fullName: String(formData.get("fullName") ?? ""),
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
    confirmPassword: String(formData.get("confirmPassword") ?? "")
  });

  if (!validation.ok) {
    return redirectToRegister({
      error: validation.error,
      fullName: String(formData.get("fullName") ?? ""),
      email: String(formData.get("email") ?? "")
    });
  }

  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase.auth.signUp({
    email: validation.value.email,
    password: validation.value.password,
    options: {
      data: {
        full_name: validation.value.fullName,
        display_name: validation.value.fullName
      }
    }
  });

  if (error) {
    const errorCode = (error as { code?: string }).code?.toLowerCase() ?? "";
    const errorMsg = error.message?.toLowerCase() ?? "";
    let message = "Unable to create account. Please try again.";
    if (
      errorCode === "user_already_exists" ||
      errorMsg.includes("already registered") ||
      errorMsg.includes("already exists") ||
      errorMsg.includes("email address is already")
    ) {
      message = "An account with this email already exists. Try logging in instead.";
    }
    return redirectToRegister({
      error: message,
      fullName: validation.value.fullName ?? "",
      email: validation.value.email
    });
  }

  if (data.user) {
    await prisma.profile.upsert({
      where: { id: data.user.id },
      update: {
        email: validation.value.email,
        fullName: validation.value.fullName,
        displayName: validation.value.fullName
      },
      create: {
        id: data.user.id,
        email: validation.value.email,
        fullName: validation.value.fullName,
        displayName: validation.value.fullName
      }
    });
  }

  if (!data.session) {
    return redirect(`/register/check-email?email=${encodeURIComponent(validation.value.email)}`);
  }

  return redirect("/");
}

function redirectToRegister(params: {
  error: string;
  fullName: string;
  email: string;
}): never {
  const searchParams = new URLSearchParams({
    error: params.error,
    fullName: params.fullName,
    email: params.email
  });

  redirect(`/register?${searchParams.toString()}`);
}
