// ============================================================
// CAMPUS EVENTS — Auth Service
// Backend URLs have NO trailing slashes
//
// ACTUAL login response shape from your API:
//   { message, access, refresh, user }
//   (tokens are TOP-LEVEL fields, NOT nested under "tokens")
//
// ACTUAL register payload your backend requires:
//   { full_name, email, password, confirm_password, role }
// ============================================================

import api from "./api";
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, USER_KEY } from "@/utils/constants";
import type { AuthResponse, LoginPayload, RegisterPayload, User } from "@/types";

// ── POST /api/auth/login ──────────────────────────────────────────────────────
export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>("/auth/login", payload);

  // Backend returns: { message, access, refresh, user }
  // access and refresh are TOP-LEVEL — not inside a "tokens" object
  if (!data?.access || !data?.refresh) {
    throw new Error("Invalid login response from server");
  }

  localStorage.setItem(ACCESS_TOKEN_KEY, data.access);
  localStorage.setItem(REFRESH_TOKEN_KEY, data.refresh);
  localStorage.setItem(USER_KEY, JSON.stringify(data.user));
  return data;
}

// ── POST /api/auth/register ───────────────────────────────────────────────────
// Backend requires: full_name, email, password, confirm_password, role
export async function register(
  payload: RegisterPayload
): Promise<{ message: string }> {
  const { data } = await api.post<{ message: string }>("/auth/register", payload);
  return data;
}

// ── POST /api/auth/logout ─────────────────────────────────────────────────────
export async function logout(): Promise<void> {
  try {
    const refresh = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (refresh) await api.post("/auth/logout", { refresh });
  } finally {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
}

// ── POST /api/auth/change-password ───────────────────────────────────────────
export async function changePassword(payload: {
  old_password: string;
  new_password: string;
  confirm_new_password: string;
}): Promise<{ message: string }> {
  const { data } = await api.post<{ message: string }>(
    "/auth/change-password",
    payload
  );
  return data;
}

// ── POST /api/auth/forgot-password/request ───────────────────────────────────
export async function forgotPassword(
  email: string
): Promise<{ message: string }> {
  const { data } = await api.post<{ message: string }>(
    "/auth/forgot-password/request",
    { email }
  );
  return data;
}

// ── POST /api/auth/forgot-password/reset ─────────────────────────────────────
export async function resetPassword(payload: {
  uid: string;
  token: string;
  new_password: string;
  confirm_password: string;
}): Promise<{ message: string }> {
  const { data } = await api.post<{ message: string }>(
    "/auth/forgot-password/reset",
    payload
  );
  return data;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
export function getStoredUser(): User | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem(ACCESS_TOKEN_KEY);
}
