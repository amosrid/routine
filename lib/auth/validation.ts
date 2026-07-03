export type AuthValidationResult =
  | { ok: true; value: { email: string; password: string; fullName?: string } }
  | { ok: false; error: string };

export function validateRegisterInput(_input: {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}): AuthValidationResult {
  const fullName = normalizeWhitespace(_input.fullName);
  if (!fullName) {
    return { ok: false, error: "Full name is required." };
  }

  const email = normalizeEmail(_input.email);
  const emailError = validateEmail(email);
  if (emailError) return emailError;

  if (_input.password.length < 8) {
    return { ok: false, error: "Password must be at least 8 characters." };
  }

  if (_input.password !== _input.confirmPassword) {
    return { ok: false, error: "Password confirmation does not match." };
  }

  return { ok: true, value: { fullName, email, password: _input.password } };
}

export function validateLoginInput(_input: {
  email: string;
  password: string;
}): AuthValidationResult {
  const email = normalizeEmail(_input.email);
  const emailError = validateEmail(email);
  if (emailError) return emailError;

  if (!_input.password) {
    return { ok: false, error: "Password is required." };
  }

  return { ok: true, value: { email, password: _input.password } };
}

export function getLoginErrorMessage(error: {
  code?: string;
  message?: string;
} | null | undefined): string {
  const code = error?.code?.toLowerCase() ?? "";
  const message = error?.message?.toLowerCase() ?? "";

  if (code === "email_not_confirmed" || message.includes("email not confirmed")) {
    return "Please confirm your email before signing in. Check your inbox for the confirmation link.";
  }

  if (
    code === "invalid_credentials" ||
    message.includes("invalid login credentials") ||
    message.includes("invalid credentials")
  ) {
    return "Invalid email or password.";
  }

  return "Unable to sign in. Please try again.";
}

export function getAuthRedirect(_input: {
  isAuthenticated: boolean;
  pathname: string;
}): string | null {
  const authPaths = ["/login", "/register"];
  const isAuthPath =
    authPaths.includes(_input.pathname) ||
    _input.pathname.startsWith("/register/check-email");

  if (_input.isAuthenticated && isAuthPath) return "/";
  if (!_input.isAuthenticated && !isAuthPath) return "/login";

  return null;
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function normalizeWhitespace(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

function validateEmail(email: string): AuthValidationResult | null {
  if (!email) {
    return { ok: false, error: "Email is required." };
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: "Enter a valid email address." };
  }

  return null;
}
