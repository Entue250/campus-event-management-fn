// ============================================================
// CAMPUS EVENTS — useAuth Hook
// ============================================================
// Wraps the auth store and auth service actions into one hook.

"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import toast from "react-hot-toast";
import { useAuthStore } from "@/context/authStore";
import {
  login as loginService,
  logout as logoutService,
} from "@/services/authService";
import { extractErrorMessage } from "@/utils/helpers";
import type { LoginPayload } from "@/types";

export function useAuth() {
  const { user, hydrated, setUser, clear } = useAuthStore();
  const router = useRouter();

  const isAdmin = user?.role === "ADMIN";
  const isStudent = user?.role === "STUDENT";
  const isLoggedIn = !!user;

  // ── Login ──────────────────────────────────────────────────────────────────
  const login = useCallback(
    async (payload: LoginPayload) => {
      const response = await loginService(payload);
      setUser(response.user);

      // Redirect based on role
      if (response.user.role === "ADMIN") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }

      return response;
    },
    [setUser, router]
  );

  // ── Logout ─────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      await logoutService();
    } catch (err) {
      // Even if logout API fails, clear local state
      console.warn("Logout API error:", extractErrorMessage(err));
    } finally {
      clear();
      toast.success("Logged out successfully");
      router.push("/login");
    }
  }, [clear, router]);

  return {
    user,
    hydrated,
    isAdmin,
    isStudent,
    isLoggedIn,
    login,
    logout,
  };
}
