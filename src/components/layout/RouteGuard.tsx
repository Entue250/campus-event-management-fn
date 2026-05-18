// ============================================================
// CAMPUS EVENTS — RouteGuard
// Protects pages that require authentication or specific roles.
// Redirects to /login if not authenticated, or /dashboard if
// the user doesn't have the required role.
// ============================================================

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/context/authStore";
import { PageSpinner } from "@/components/ui/index";
import type { UserRole } from "@/types";

interface RouteGuardProps {
  children: React.ReactNode;
  /** If provided, user must have this role to access the page */
  requiredRole?: UserRole;
}

export function RouteGuard({ children, requiredRole }: RouteGuardProps) {
  const { user, hydrated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!hydrated) return; // Wait for localStorage hydration

    if (!user) {
      // Not logged in → go to login
      router.replace("/login");
      return;
    }

    if (requiredRole && user.role !== requiredRole) {
      // Wrong role → redirect to appropriate dashboard
      router.replace(user.role === "ADMIN" ? "/admin" : "/dashboard");
    }
  }, [hydrated, user, requiredRole, router]);

  // Show spinner while hydrating or redirecting
  if (!hydrated || !user || (requiredRole && user.role !== requiredRole)) {
    return <PageSpinner />;
  }

  return <>{children}</>;
}
