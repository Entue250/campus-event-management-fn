"use client";
// Placement: src/app/admin/users/page.tsx
//
// Real data from GET /api/admin/users — no static fallback.
// All action buttons wired to real API calls via useAdminUsers hook.
// UI structure, Tailwind classes, and layout are UNCHANGED.

import { useState } from "react";
import Link from "next/link";
import {
  Users,
  Radio,
  MessageCircle,
  Ban,
  SlidersHorizontal,
  Pencil,
  UserX,
  UserCheck,
  UserPlus,
  ChevronLeft,
  ChevronRight,
  Eye,
} from "lucide-react";
import { useAdminUsers } from "@/hooks/useAdminUsers";
import { getInitials, cn, timeAgo } from "@/utils/helpers";
import type { User } from "@/types";

const AVATAR_COLOURS = [
  "bg-blue-100 text-blue-700",
  "bg-purple-100 text-purple-700",
  "bg-orange-100 text-orange-700",
  "bg-pink-100 text-pink-700",
  "bg-teal-100 text-teal-700",
];

/** Derive a readable approval label from User flags */
function approvalLabel(
  user: User
): { label: string; cls: string } {
  if (user.is_rejected)
    return { label: "Rejected", cls: "bg-red-100 text-red-600" };
  if (user.is_approved)
    return { label: "Approved", cls: "bg-green-100 text-green-700" };
  return { label: "Pending", cls: "bg-yellow-100 text-yellow-700" };
}

export default function ManageUsersPage() {
  // ── Filter / search state ─────────────────────────────────────────────────
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  const {
    users,
    total,
    currentPage,
    totalPages,
    loading,
    setPage,
    refetch,
    actions,
  } = useAdminUsers({ search, role: roleFilter });

  // Commit search on Enter / blur
  const commitSearch = () => {
    setSearch(searchInput);
    setPage(1);
  };

  // ── Page-window helper ────────────────────────────────────────────────────
  const pageWindow = Array.from(
    new Set(
      [1, currentPage - 1, currentPage, currentPage + 1, totalPages].filter(
        (p) => p >= 1 && p <= totalPages
      )
    )
  ).sort((a, b) => a - b);

  // ── Derived stat counts (from current page + total) ───────────────────────
  const activeCount = users.filter((u) => u.is_active).length;
  const pendingCount = users.filter((u) => !u.is_approved && !u.is_rejected).length;
  const suspendedCount = users.filter((u) => !u.is_active).length;

  // ── Delete with confirmation ──────────────────────────────────────────────
  const handleDelete = async (user: User) => {
    if (!confirm(`Delete user "${user.full_name}"? This cannot be undone.`)) return;
    await actions.remove(user.id);
  };

  return (
    <div className="flex-1 bg-gray-50 min-h-screen">
      {/* ── Top bar ─────────────────────────────────────────────────────── */}
      <header className="bg-white border-b border-gray-200 px-6 h-14 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <Users className="h-4 w-4" /> User Management
        </div>
        <div className="flex items-center gap-3">
          <button className="h-8 w-8 border border-gray-200 rounded-lg flex items-center justify-center text-gray-500">
            <span className="relative">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full" />
            </span>
          </button>
          <button className="h-8 w-8 border border-gray-200 rounded-lg flex items-center justify-center text-gray-400">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>
      </header>

      <div className="p-6">
        {/* Page title + Add button */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Manage Users</h1>
            <p className="text-gray-500 mt-1">
              Review, edit, and control access for all campus community members.
            </p>
          </div>
          <Link
            href="/admin/users/create"
            className="flex items-center gap-2 px-4 py-2.5 bg-[#1a2744] text-white text-sm font-semibold rounded-lg hover:bg-[#0f1a35] transition-colors"
          >
            <UserPlus className="h-4 w-4" /> Add New User
          </Link>
        </div>

        {/* ── Stat cards ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{total.toLocaleString()}</p>
              </div>
              <div className="h-10 w-10 bg-gray-100 rounded-xl flex items-center justify-center">
                <Users className="h-5 w-5 text-gray-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500">Active Now</p>
                <p className="text-2xl font-bold text-gray-900">{activeCount}</p>
              </div>
              <div className="h-10 w-10 bg-green-100 rounded-xl flex items-center justify-center">
                <Radio className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500">Pending Requests</p>
                <p className="text-2xl font-bold text-gray-900">{pendingCount}</p>
              </div>
              <div className="h-10 w-10 bg-orange-100 rounded-xl flex items-center justify-center">
                <MessageCircle className="h-5 w-5 text-orange-500" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500">Suspended</p>
                <p className="text-2xl font-bold text-gray-900">{suspendedCount}</p>
              </div>
              <div className="h-10 w-10 bg-red-100 rounded-xl flex items-center justify-center">
                <Ban className="h-5 w-5 text-red-500" />
              </div>
            </div>
          </div>
        </div>

        {/* ── Table card ──────────────────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {/* Search + filter bar */}
          <div className="p-4 flex items-center gap-3 border-b border-gray-100">
            <div className="relative flex-1">
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && commitSearch()}
                onBlur={commitSearch}
                placeholder="Search by name, email or ID..."
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-[#1a2744]/30"
              />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
                fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Role filter */}
            <div className="relative">
              <select
                value={roleFilter}
                onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
                className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 appearance-none pr-8 bg-white focus:outline-none"
              >
                <option value="">All Roles</option>
                <option value="ADMIN">Admin</option>
                <option value="STUDENT">Student</option>
              </select>
              <SlidersHorizontal className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Table */}
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {[
                  "NAME",
                  "EMAIL",
                  "ROLE",
                  "APPROVAL",
                  "ACCOUNT STATUS",
                  "LAST LOGIN",
                  "ACTIONS",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left py-3 px-4 text-[10px] font-semibold text-gray-400 uppercase tracking-wide"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b border-gray-50 animate-pulse">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 bg-gray-100 rounded-full" />
                        <div className="h-4 bg-gray-100 rounded w-24" />
                      </div>
                    </td>
                    <td className="py-4 px-4"><div className="h-3 bg-gray-100 rounded w-36" /></td>
                    <td className="py-4 px-4"><div className="h-6 bg-gray-100 rounded w-16" /></td>
                    <td className="py-4 px-4"><div className="h-6 bg-gray-100 rounded w-20" /></td>
                    <td className="py-4 px-4"><div className="h-3 bg-gray-100 rounded w-20" /></td>
                    <td className="py-4 px-4"><div className="h-3 bg-gray-100 rounded w-24" /></td>
                    <td className="py-4 px-4"><div className="h-3 bg-gray-100 rounded w-16" /></td>
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400 text-sm">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user, i) => {
                  const bgCls = AVATAR_COLOURS[i % AVATAR_COLOURS.length];
                  const isActive = user.is_active !== false;
                  const approval = approvalLabel(user);

                  return (
                    <tr
                      key={user.id}
                      className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                    >
                      {/* Name + avatar */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          {user.profile_image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={user.profile_image}
                              alt={user.full_name}
                              className="h-9 w-9 rounded-full object-cover shrink-0"
                            />
                          ) : (
                            <div
                              className={`h-9 w-9 rounded-full ${bgCls} flex items-center justify-center text-xs font-bold shrink-0`}
                            >
                              {getInitials(user.full_name)}
                            </div>
                          )}
                          <span className="font-semibold text-gray-900">
                            {user.full_name}
                          </span>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="py-4 px-4 text-gray-500">{user.email}</td>

                      {/* Role */}
                      <td className="py-4 px-4">
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-700">
                          {user.role === "ADMIN" ? "Admin" : "Student"}
                        </span>
                      </td>

                      {/* Approval status */}
                      <td className="py-4 px-4">
                        <span
                          className={cn(
                            "text-xs font-semibold px-2.5 py-1 rounded-full",
                            approval.cls
                          )}
                        >
                          {approval.label}
                        </span>
                      </td>

                      {/* Active / Suspended */}
                      <td className="py-4 px-4">
                        <span
                          className={cn(
                            "flex items-center gap-1.5 text-sm font-medium",
                            isActive ? "text-gray-700" : "text-gray-500"
                          )}
                        >
                          <span
                            className={cn(
                              "h-2 w-2 rounded-full",
                              isActive ? "bg-green-500" : "bg-red-500"
                            )}
                          />
                          {isActive ? "Active" : "Suspended"}
                        </span>
                      </td>

                      {/* Last login */}
                      <td className="py-4 px-4 text-gray-400 text-xs">
                        {user.last_login ? timeAgo(user.last_login) : "Never"}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          {/* View details */}
                          <Link
                            href={`/admin/users/${user.id}`}
                            className="text-gray-400 hover:text-[#1a2744] transition-colors"
                            title="View details"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>

                          {/* Edit */}
                          <Link
                            href={`/admin/users/${user.id}/edit`}
                            className="text-gray-400 hover:text-gray-700 transition-colors"
                            title="Edit user"
                          >
                            <Pencil className="h-4 w-4" />
                          </Link>

                          {/* Approve (only shown for pending) */}
                          {!user.is_approved && !user.is_rejected && (
                            <button
                              onClick={() => actions.approve(user.id)}
                              className="text-gray-400 hover:text-green-600 transition-colors"
                              title="Approve user"
                            >
                              <UserCheck className="h-4 w-4" />
                            </button>
                          )}

                          {/* Toggle active / suspend */}
                          <button
                            onClick={() => actions.toggleStatus(user.id)}
                            className={cn(
                              "transition-colors",
                              isActive
                                ? "text-gray-400 hover:text-red-500"
                                : "text-gray-400 hover:text-green-600"
                            )}
                            title={isActive ? "Suspend user" : "Reactivate user"}
                          >
                            <UserX className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

          {/* ── Pagination ───────────────────────────────────────────────── */}
          <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Showing{" "}
              <strong>
                {total === 0
                  ? 0
                  : `${(currentPage - 1) * 10 + 1}–${Math.min(
                    currentPage * 10,
                    total
                  )}`}
              </strong>{" "}
              of <strong>{total.toLocaleString()}</strong> users
            </p>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="h-8 w-8 flex items-center justify-center rounded border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              {pageWindow.map((p, idx) => {
                const prev = pageWindow[idx - 1];
                const showEllipsis = prev !== undefined && p - prev > 1;
                return (
                  <span key={p} className="flex items-center gap-1">
                    {showEllipsis && (
                      <span className="px-1 text-gray-400">…</span>
                    )}
                    <button
                      onClick={() => setPage(p)}
                      className={cn(
                        "h-8 w-8 rounded text-sm font-medium",
                        currentPage === p
                          ? "bg-[#1a2744] text-white"
                          : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                      )}
                    >
                      {p}
                    </button>
                  </span>
                );
              })}

              <button
                onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage >= totalPages}
                className="h-8 w-8 flex items-center justify-center rounded border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}