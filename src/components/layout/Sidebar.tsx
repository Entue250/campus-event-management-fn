"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  GraduationCap, LayoutDashboard, Calendar, ClipboardList,
  Bell, User, LogOut, Plus, Settings, BarChart3, Users, BriefcaseBusiness, CircleUser,
} from "lucide-react";
import { useAuthStore } from "@/context/authStore";
import { logout } from "@/services/authService";
import { cn, getInitials } from "@/utils/helpers";
import toast from "react-hot-toast";

// ── Student Nav items ─────────────────────────────────────────────────────────
const STUDENT_NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/events", label: "Events", icon: Calendar },
  { href: "/dashboard/my-events", label: "Registered Events", icon: ClipboardList },
  { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
  { href: "/dashboard/profile", label: "Profile", icon: User },
];

// ── Admin Nav items ───────────────────────────────────────────────────────────
const ADMIN_NAV = [
  { href: "/admin", label: "Dashboard Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/events", label: "Events Management", icon: Calendar },
  { href: "/admin/registrations", label: "Registrations", icon: ClipboardList },
  { href: "/admin/users", label: "User Directory", icon: Users },
  { href: "/admin/categories", label: "Categories", icon: BriefcaseBusiness },
  { href: "/admin/analytics", label: "Reports", icon: BarChart3 },
  { href: "/admin/profile", label: "Profile", icon: CircleUser },
  { href: "/admin/settings", label: "Global Settings", icon: Settings, divider: true },
];

// ── Student Sidebar ───────────────────────────────────────────────────────────
export function DashboardSidebar({ unread = 0 }: { unread?: number }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, clear } = useAuthStore();

  const handleLogout = async () => {
    try { await logout(); } catch { /* silent */ }
    clear();
    toast.success("Logged out");
    router.push("/login");
  };

  return (
    <aside className="w-56 bg-[#1a2744] border-r border-gray-200 flex flex-col min-h-screen sticky top-0 shrink-0">
      {/* User info */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center shrink-0">
            <span className="text-gray-600 font-bold text-sm">{getInitials(user?.full_name ?? "U")}</span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate">{user?.full_name ?? "Student"}</p>
            <p className="text-xs text-blue-300 truncate">STUDENT Portal</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5">
        {STUDENT_NAV.map((item) => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                active ? "bg-white/15 text-white" : "text-blue-200 hover:bg-white/10 hover:text-white"
              )}>
              <item.icon className="shrink-0" style={{ height: 18, width: 18 }} />
              <span className="flex-1">{item.label}</span>
              {item.icon === Bell && unread > 0 && (
                <span className="h-5 w-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unread > 9 ? "9+" : unread}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-gray-100">
        <button onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-blue-200 hover:bg-red-50 hover:text-red-600 transition-colors">
          <LogOut style={{ height: 18, width: 18 }} className="shrink-0" />
          <span>Log out</span>
        </button>
      </div>
    </aside>
  );
}

// ── Admin Sidebar ─────────────────────────────────────────────────────────────
export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, clear } = useAuthStore();

  const handleLogout = async () => {
    try { await logout(); } catch { /* silent */ }
    clear();
    toast.success("Logged out");
    router.push("/login");
  };

  return (
    <aside className="w-56 bg-[#1a2744] flex flex-col min-h-screen sticky top-0 shrink-0">
      {/* Brand */}
      <div className="p-5 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-white/20 flex items-center justify-center">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">Campus Events</p>
            <p className="text-blue-300 text-[10px] uppercase tracking-wider">Admin Portal</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5">
        {ADMIN_NAV.map((item, i) => {
          if (item.divider && i > 0) {
            return (
              <div key={item.href}>
                <p className="text-[10px] font-semibold text-blue-400/60 uppercase tracking-wider px-3 pt-4 pb-1">System</p>
                <AdminNavItem item={item} pathname={pathname} />
              </div>
            );
          }
          return <AdminNavItem key={item.href} item={item} pathname={pathname} />;
        })}
      </nav>

      {/* Bottom */}
      <div className="p-3 space-y-3 border-t border-white/10">
        <Link href="/admin/events/create"
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-white/15 hover:bg-white/20 text-white text-sm font-semibold rounded-lg transition-colors">
          <Plus className="h-4 w-4" /> Create New Event
        </Link>
        <div className="flex items-center gap-3 px-1">
          <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <span className="text-white text-xs font-bold">{getInitials(user?.full_name ?? "A")}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-semibold truncate">{user?.full_name ?? "Admin"}</p>
            <p className="text-blue-300 text-[10px] truncate">System Admin</p>
          </div>
          <button onClick={handleLogout} className="text-blue-300 hover:text-white transition-colors">
            <LogOut style={{ height: 15, width: 15 }} />
          </button>
        </div>
      </div>
    </aside>
  );
}

function AdminNavItem({ item, pathname }: { item: typeof ADMIN_NAV[0]; pathname: string }) {
  const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
  return (
    <Link href={item.href}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
        active ? "bg-white/15 text-white" : "text-blue-200 hover:bg-white/10 hover:text-white"
      )}>
      <item.icon className="shrink-0" style={{ height: 17, width: 17 }} />
      {item.label}
    </Link>
  );
}
