"use client";
import { AdminSidebar } from "@/components/layout/Sidebar";
import { RouteGuard } from "@/components/layout/RouteGuard";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RouteGuard requireAuth roles={["ADMIN"]}>
      <div className="flex min-h-screen">
        <AdminSidebar />
        {children}
      </div>
    </RouteGuard>
  );
}
