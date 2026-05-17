// ============================================================
// CAMPUS EVENTS — Navbar (exact match to design screenshot)
// [Logo] Home Events Categories | [Search...] | Login [Register]
// ============================================================

"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Search, GraduationCap, Menu, X,
  Bell, ChevronDown, LogOut, User, LayoutDashboard,
} from "lucide-react";
import { useAuthStore } from "@/context/authStore";
import { logout } from "@/services/authService";
import { getUnreadCount } from "@/services/notificationService";
import { cn, getInitials } from "@/utils/helpers";
import toast from "react-hot-toast";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, clear, hydrated } = useAuthStore();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [searchValue, setSearchValue] = useState("");

  // Poll notification count when logged in
  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      try { setUnread((await getUnreadCount()).unread_count); } catch { /* silent */ }
    };
    fetch();
    const id = setInterval(fetch, 30_000);
    return () => clearInterval(id);
  }, [user]);

  const handleLogout = async () => {
    try { await logout(); } catch { /* silent */ }
    clear();
    toast.success("Logged out");
    router.push("/login");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) router.push(`/events?search=${encodeURIComponent(searchValue.trim())}`);
  };

  const dashHref = user?.role === "ADMIN" ? "/admin" : "/dashboard";

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex h-14 items-center gap-5">

          {/* ── Logo ─────────────────────────────────────────── */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="h-8 w-8 rounded-lg bg-[#1e2a5e] flex items-center justify-center">
              <GraduationCap className="text-white" style={{ height: 18, width: 18 }} />
            </div>
            <span className="font-bold text-[#1e2a5e] text-sm tracking-tight">CampusEvents</span>
          </Link>

          {/* ── Nav links ────────────────────────────────────── */}
          <div className="hidden md:flex items-center gap-0">
            {[
              { href: "/", label: "Home" },
              { href: "/events", label: "Events" },
              { href: "/events?view=categories", label: "Categories" },
            ].map(({ href, label }) => {
              const active = href === "/" ? pathname === "/" : pathname.startsWith(href.split("?")[0]);
              return (
                <Link
                  key={label}
                  href={href}
                  className={cn(
                    "px-3 py-1.5 text-sm font-medium rounded transition-colors",
                    active ? "text-gray-900 font-semibold" : "text-gray-600 hover:text-gray-900"
                  )}
                >
                  {label}
                </Link>
              );
            })}
          </div>

          {/* ── Search ──────────────────────────────────────── */}
          <form onSubmit={handleSearch} className="hidden md:block flex-1 max-w-[280px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
              <input
                type="search"
                value={searchValue}
                onChange={e => setSearchValue(e.target.value)}
                placeholder="Search events..."
                className="w-full pl-8 pr-3 py-1.5 text-sm rounded-md border border-gray-200 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1e2a5e]/20 focus:border-gray-400"
              />
            </div>
          </form>

          {/* ── Right actions ────────────────────────────────── */}
          <div className="flex items-center gap-2 ml-auto">
            {hydrated && user ? (
              <>
                {/* Bell */}
                <Link href={`${dashHref}/notifications`} className="relative p-1.5 text-gray-500 hover:text-gray-900 rounded">
                  <Bell style={{ height: 18, width: 18 }} />
                  {unread > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 h-4 w-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                      {unread > 9 ? "9+" : unread}
                    </span>
                  )}
                </Link>

                {/* User dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(v => !v)}
                    className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-gray-100 transition-colors"
                  >
                    <div className="h-7 w-7 rounded-full bg-[#1e2a5e] text-white text-xs font-bold flex items-center justify-center">
                      {getInitials(user.full_name)}
                    </div>
                    <span className="hidden sm:block text-sm font-medium text-gray-700 max-w-[80px] truncate">
                      {user.full_name.split(" ")[0]}
                    </span>
                    <ChevronDown className="h-3 w-3 text-gray-400" />
                  </button>

                  {userMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                      <div className="absolute right-0 mt-1 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-20">
                        <div className="px-3 py-2.5 border-b border-gray-100">
                          <p className="text-sm font-semibold text-gray-900 truncate">{user.full_name}</p>
                          <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </div>
                        <Link href={dashHref} onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                          <LayoutDashboard className="h-4 w-4 text-gray-400" /> Dashboard
                        </Link>
                        <Link href={`${dashHref}/profile`} onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                          <User className="h-4 w-4 text-gray-400" /> Profile
                        </Link>
                        <hr className="my-1 border-gray-100" />
                        <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50">
                          <LogOut className="h-4 w-4" /> Sign Out
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm font-medium text-gray-700 px-3 py-1.5 rounded hover:bg-gray-50 transition-colors">
                  Login
                </Link>
                <Link href="/register" className="text-sm font-semibold bg-[#1e2a5e] text-white px-4 py-1.5 rounded hover:bg-[#162050] transition-colors">
                  Register
                </Link>
              </>
            )}

            {/* Mobile burger */}
            <button className="md:hidden p-1.5 text-gray-500 rounded" onClick={() => setMobileOpen(v => !v)}>
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-1">
          <form onSubmit={handleSearch} className="mb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <input type="search" value={searchValue} onChange={e => setSearchValue(e.target.value)} placeholder="Search events..."
                className="w-full pl-8 pr-3 py-2 text-sm rounded-lg border border-gray-200 bg-gray-50 focus:outline-none focus:ring-1 focus:ring-[#1e2a5e]/30" />
            </div>
          </form>
          {[{ href: "/", label: "Home" }, { href: "/events", label: "Events" }, { href: "/events?view=categories", label: "Categories" }].map(({ href, label }) => (
            <Link key={label} href={href} onClick={() => setMobileOpen(false)}
              className="block px-3 py-2 rounded text-sm font-medium text-gray-700 hover:bg-gray-50">
              {label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
