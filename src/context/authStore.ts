// ============================================================
// CAMPUS EVENTS — Auth Store (Zustand)
// ============================================================
// Global auth state shared across all components.
// Persisted in localStorage via authService helpers.

"use client";

import { create } from "zustand";
import type { User } from "@/types";
import { getStoredUser, isAuthenticated } from "@/services/authService";
import { USER_KEY } from "@/utils/constants";

interface AuthState {
  /** Currently logged-in user, or null if unauthenticated */
  user: User | null;
  /** Whether the auth state has been hydrated from localStorage */
  hydrated: boolean;
  /** Set the current user (call after login or profile update) */
  setUser: (user: User | null) => void;
  /** Hydrate state from localStorage (call once on app mount) */
  hydrate: () => void;
  /** Clear auth state (call on logout) */
  clear: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  hydrated: false,

  setUser: (user) => {
    // Keep localStorage in sync
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_KEY);
    }
    set({ user });
  },

  hydrate: () => {
    const user = isAuthenticated() ? getStoredUser() : null;
    set({ user, hydrated: true });
  },

  clear: () => {
    set({ user: null });
  },
}));
