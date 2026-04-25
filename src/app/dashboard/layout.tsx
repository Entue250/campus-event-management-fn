"use client";
import { DashboardSidebar } from "@/components/layout/Sidebar";
import { RouteGuard } from "@/components/layout/RouteGuard";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <RouteGuard requireAuth roles={["STUDENT", "ADMIN"]}>
      <div className="flex min-h-screen">
        <DashboardSidebar />
        {children}
      </div>
    </RouteGuard>
  );
}
