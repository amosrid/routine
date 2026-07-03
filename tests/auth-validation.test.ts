import { describe, expect, it } from "vitest";

import {
  getLoginErrorMessage,
  getAuthRedirect,
  validateLoginInput,
  validateRegisterInput
} from "@/lib/auth/validation";

describe("validateRegisterInput", () => {
  it("accepts a full name, valid email, and matching password", () => {
    const result = validateRegisterInput({
      fullName: "  Amos Student  ",
      email: " Student@Example.com ",
      password: "password123",
      confirmPassword: "password123"
    });

    expect(result).toEqual({
      ok: true,
      value: {
        fullName: "Amos Student",
        email: "student@example.com",
        password: "password123"
      }
    });
  });

  it("rejects an empty full name", () => {
    const result = validateRegisterInput({
      fullName: "   ",
      email: "student@example.com",
      password: "password123",
      confirmPassword: "password123"
    });

    expect(result).toEqual({
      ok: false,
      error: "Full name is required."
    });
  });

  it("rejects a password shorter than 8 characters", () => {
    const result = validateRegisterInput({
      fullName: "Amos Student",
      email: "student@example.com",
      password: "short",
      confirmPassword: "short"
    });

    expect(result).toEqual({
      ok: false,
      error: "Password must be at least 8 characters."
    });
  });

  it("rejects mismatched passwords", () => {
    const result = validateRegisterInput({
      fullName: "Amos Student",
      email: "student@example.com",
      password: "password123",
      confirmPassword: "different123"
    });

    expect(result).toEqual({
      ok: false,
      error: "Password confirmation does not match."
    });
  });
});

describe("validateLoginInput", () => {
  it("normalizes a valid login email", () => {
    const result = validateLoginInput({
      email: " USER@Example.com ",
      password: "password123"
    });

    expect(result).toEqual({
      ok: true,
      value: {
        email: "user@example.com",
        password: "password123"
      }
    });
  });

  it("rejects an invalid email format", () => {
    const result = validateLoginInput({
      email: "not-an-email",
      password: "password123"
    });

    expect(result).toEqual({
      ok: false,
      error: "Enter a valid email address."
    });
  });
});

describe("getLoginErrorMessage", () => {
  it("shows a confirmation message for unconfirmed email accounts", () => {
    expect(getLoginErrorMessage({ code: "email_not_confirmed" })).toBe(
      "Please confirm your email before signing in. Check your inbox for the confirmation link."
    );
  });

  it("shows a credential message for invalid credentials", () => {
    expect(getLoginErrorMessage({ code: "invalid_credentials" })).toBe(
      "Invalid email or password."
    );
  });

  it("uses a safe English fallback for other auth errors", () => {
    expect(getLoginErrorMessage({ code: "unexpected_failure" })).toBe(
      "Unable to sign in. Please try again."
    );
  });
});

describe("getAuthRedirect", () => {
  it("sends unauthenticated dashboard users to login", () => {
    expect(getAuthRedirect({ isAuthenticated: false, pathname: "/" })).toBe(
      "/login"
    );
  });

  it("sends authenticated login/register visitors to home", () => {
    expect(getAuthRedirect({ isAuthenticated: true, pathname: "/login" })).toBe(
      "/"
    );
    expect(
      getAuthRedirect({ isAuthenticated: true, pathname: "/register" })
    ).toBe("/");
  });

  it("allows public auth pages for unauthenticated users", () => {
    expect(
      getAuthRedirect({ isAuthenticated: false, pathname: "/register" })
    ).toBeNull();
    expect(
      getAuthRedirect({
        isAuthenticated: false,
        pathname: "/register/check-email"
      })
    ).toBeNull();
  });
});
