// ============================================================
// CAMPUS EVENTS — AuthHydrator
// Client component that reads localStorage on mount and
// populates the Zustand auth store.
// ============================================================

"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/context/authStore";

export function AuthHydrator() {
  const hydrate = useAuthStore((s) => s.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  // Renders nothing — purely a side-effect component
  return null;
}
