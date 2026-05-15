// ============================================================
// CAMPUS EVENTS — useProfile Hook
// Placement: src/hooks/useProfile.ts
//
// Three hooks:
//   useProfile()        — fetch & cache the logged-in user's profile
//   useUpdateProfile()  — submit profile updates (multipart/form-data)
//   useChangePassword() — submit password change
// ============================================================

"use client";

import { useState, useEffect, useCallback } from "react";
import { getProfile, updateProfile, changePassword } from "@/services/userService";
import { useAuthStore } from "@/context/authStore";
import { extractErrorMessage } from "@/utils/helpers";
import toast from "react-hot-toast";
import type { User, ProfileUpdatePayload } from "@/types";

// ── useProfile ────────────────────────────────────────────────────────────────
interface UseProfileReturn {
  profile: User | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useProfile(): UseProfileReturn {
  const { setUser } = useAuthStore();
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading]  = useState(true);
  const [error, setError]      = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getProfile();
      setProfile(data);
      // Keep global auth store in sync
      setUser(data);
    } catch (err) {
      setError(extractErrorMessage(err));
      console.error("[useProfile] fetch failed:", err);
    } finally {
      setLoading(false);
    }
  }, [setUser]);

  useEffect(() => { fetch(); }, [fetch]);

  return { profile, loading, error, refetch: fetch };
}

// ── useUpdateProfile ──────────────────────────────────────────────────────────
interface UseUpdateProfileReturn {
  update: (payload: ProfileUpdatePayload) => Promise<User | null>;
  updating: boolean;
}

export function useUpdateProfile(): UseUpdateProfileReturn {
  const { setUser } = useAuthStore();
  const [updating, setUpdating] = useState(false);

  const update = useCallback(
    async (payload: ProfileUpdatePayload): Promise<User | null> => {
      setUpdating(true);
      try {
        const updated = await updateProfile(payload);
        setUser(updated);
        toast.success("Profile updated successfully!");
        return updated;
      } catch (err) {
        toast.error(extractErrorMessage(err));
        return null;
      } finally {
        setUpdating(false);
      }
    },
    [setUser]
  );

  return { update, updating };
}

// ── useChangePassword ─────────────────────────────────────────────────────────
interface ChangePasswordPayload {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

interface UseChangePasswordReturn {
  submit: (payload: ChangePasswordPayload) => Promise<boolean>;
  submitting: boolean;
}

export function useChangePassword(): UseChangePasswordReturn {
  const [submitting, setSubmitting] = useState(false);

  const submit = useCallback(
    async (payload: ChangePasswordPayload): Promise<boolean> => {
      setSubmitting(true);
      try {
        // Map to the field names the existing changePassword service expects
        await changePassword({
          old_password: payload.current_password,
          new_password: payload.new_password,
          confirm_new_password: payload.confirm_password,
        });
        toast.success("Password changed successfully!");
        return true;
      } catch (err) {
        toast.error(extractErrorMessage(err));
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    []
  );

  return { submit, submitting };
}