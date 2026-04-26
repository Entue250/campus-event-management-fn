"use client";
// Placement: src/app/dashboard/my-events/page.tsx
//
// Fixes:
//   1. TypeScript errors — GET /my-events returns MyRegistration objects,
//      not Event objects. Registration status values (REGISTERED, ATTENDED,
//      CANCELLED) live on MyRegistration.status, NOT on Event.status
//      (EventStatus). Introduced a MyRegistration interface that matches
//      the actual API response shape exactly.
//   2. Removed all dummy/static "Past Events" cards — replaced with real
//      completed/cancelled registrations from the API.
//   3. cancelRegistration correctly passes the registration event UUID.

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  CheckCircle,
  Clock,
  History,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Calendar,
} from "lucide-react";
import { getMyEvents, cancelRegistration } from "@/services/eventService";
import { formatDate, cn } from "@/utils/helpers";
import type { RegistrationStatusType } from "@/types";
import toast from "react-hot-toast";

// ── MyRegistration — actual shape returned by GET /api/my-events ─────────────
// This is NOT the same as Event. It is a flat registration record.
interface MyRegistration {
  id: string;
  /** UUID of the event */
  event: string;
  event_title: string;
  event_date: string;
  event_location: string;
  event_poster: string | null;
  status: RegistrationStatusType;
  registration_date: string;
}

// ── Status display helpers ────────────────────────────────────────────────────
const STATUS_TEXT_CLS: Record<string, string> = {
  REGISTERED: "text-green-600",
  CONFIRMED: "text-green-600",
  ATTENDED: "text-blue-600",
  PENDING: "text-yellow-600",
  CANCELLED: "text-red-500",
};

const STATUS_DOT_CLS: Record<string, string> = {
  REGISTERED: "bg-green-500",
  CONFIRMED: "bg-green-500",
  ATTENDED: "bg-blue-500",
  PENDING: "bg-yellow-500",
  CANCELLED: "bg-red-400",
};

// Prettier label: "REGISTERED" → "Registered"
function statusLabel(s: string): string {
  return s.charAt(0) + s.slice(1).toLowerCase();
}

const PAGE_SIZE = 10;

export default function MyEventsPage() {
  const [registrations, setRegistrations] = useState<MyRegistration[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const fetchEvents = useCallback(() => {
    setLoading(true);
    // getMyEvents() calls GET /my-events — returns PaginatedResponse<MyRegistration>
    // We cast because the service typed it as Event but the real shape is MyRegistration
    (getMyEvents() as unknown as Promise<{ count: number; total_pages?: number; results: MyRegistration[] }>)
      .then((res) => {
        setRegistrations(res.results ?? []);
        setTotal(res.count ?? 0);
        setTotalPages(res.total_pages ?? Math.max(1, Math.ceil((res.count ?? 0) / PAGE_SIZE)));
      })
      .catch(() => toast.error("Failed to load registered events"))
      .finally(() => setLoading(false));
  }, [page]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  // Cancel a registration — the endpoint is DELETE /events/{event_id}/cancel
  // so we pass reg.event (the event UUID), not reg.id
  const handleCancel = async (reg: MyRegistration) => {
    if (!confirm(`Cancel registration for "${reg.event_title}"?`)) return;
    setCancellingId(reg.id);
    try {
      await cancelRegistration(reg.event);
      toast.success("Registration cancelled");
      fetchEvents();
    } catch {
      toast.error("Failed to cancel registration");
    } finally {
      setCancellingId(null);
    }
  };

  // ── Derived stat counts from current page ────────────────────────────────
  const confirmedCount = registrations.filter(
    (r) => r.status === "REGISTERED" || r.status === "CONFIRMED"
  ).length;
  const pendingCount = registrations.filter((r) => r.status === "PENDING").length;
  const attendedCount = registrations.filter(
    (r) => r.status === "ATTENDED" || r.status === "CANCELLED"
  ).length;

  // Separate completed/cancelled for "Past Events" section
  const pastRegistrations = registrations.filter(
    (r) => r.status === "ATTENDED" || r.status === "CANCELLED"
  );
  const activeRegistrations = registrations.filter(
    (r) => r.status !== "ATTENDED" && r.status !== "CANCELLED"
  );

  return (
    <div className="flex-1 bg-gray-50 min-h-screen">
      {/* ── Top bar ─────────────────────────────────────────────────────── */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="relative">
          <input
            placeholder="Search my events..."
            className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-1 focus:ring-[#1a2744]/30 w-64"
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <div className="flex items-center gap-3">
          <button className="h-8 w-8 border border-gray-200 rounded flex items-center justify-center text-gray-400">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>
      </header>

      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">My Registered Events</h1>
          <p className="text-gray-500 mt-1">
            Manage your upcoming campus activities, track approval status, and view history.
          </p>
        </div>

        {/* ── Stats ────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { icon: CheckCircle, label: "Registered", value: confirmedCount, iconBg: "bg-gray-100" },
            { icon: Clock, label: "Pending", value: pendingCount, iconBg: "bg-orange-50" },
            { icon: History, label: "Attended", value: attendedCount, iconBg: "bg-gray-100" },
          ].map(({ icon: Icon, label, value, iconBg }) => (
            <div key={label} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4">
              <div className={`h-12 w-12 ${iconBg} rounded-xl flex items-center justify-center`}>
                <Icon className="h-6 w-6 text-gray-500" />
              </div>
              <div>
                <p className="text-gray-500 text-sm">{label}</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? (
                    <span className="inline-block h-7 w-8 bg-gray-100 rounded animate-pulse" />
                  ) : value}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Registrations table ───────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {["Event Title", "Date & Time", "Location", "Status", "Actions"].map((h) => (
                  <th
                    key={h}
                    className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <tr key={i} className="border-b border-gray-50 animate-pulse">
                    <td className="py-4 px-4">
                      <div className="h-4 bg-gray-100 rounded w-3/4 mb-1" />
                      <div className="h-3 bg-gray-50 rounded w-1/2" />
                    </td>
                    <td className="py-4 px-4"><div className="h-3 bg-gray-100 rounded w-24" /></td>
                    <td className="py-4 px-4"><div className="h-3 bg-gray-100 rounded w-28" /></td>
                    <td className="py-4 px-4"><div className="h-3 bg-gray-100 rounded w-16" /></td>
                    <td className="py-4 px-4"><div className="h-3 bg-gray-100 rounded w-20" /></td>
                  </tr>
                ))
              ) : registrations.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-400">
                    No registered events yet.{" "}
                    <Link href="/dashboard/events" className="text-[#1a2744] underline">
                      Browse events
                    </Link>
                  </td>
                </tr>
              ) : (
                registrations.map((reg) => (
                  <tr
                    key={reg.id}
                    className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                  >
                    {/* Event title */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        {/* Poster thumbnail */}
                        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-teal-400 to-blue-500 shrink-0 overflow-hidden">
                          {reg.event_poster && (
                            <Image
                              src={reg.event_poster}
                              alt={reg.event_title}
                              width={40}
                              height={40}
                              className="object-cover w-full h-full"
                            />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 line-clamp-1">
                            {reg.event_title}
                          </p>
                          <p className="text-xs text-gray-400">
                            Registered {formatDate(reg.registration_date)}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Date */}
                    <td className="py-4 px-4 text-gray-600 whitespace-nowrap">
                      <p className="flex items-center gap-1 text-sm">
                        <Calendar className="h-3.5 w-3.5 text-gray-400" />
                        {formatDate(reg.event_date)}
                      </p>
                    </td>

                    {/* Location */}
                    <td className="py-4 px-4 text-gray-600">
                      <p className="flex items-center gap-1 text-sm">
                        <MapPin className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                        <span className="line-clamp-1">{reg.event_location}</span>
                      </p>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4">
                      <span
                        className={cn(
                          "text-sm font-semibold flex items-center gap-1",
                          STATUS_TEXT_CLS[reg.status] ?? "text-gray-600"
                        )}
                      >
                        <span
                          className={cn(
                            "h-2 w-2 rounded-full shrink-0",
                            STATUS_DOT_CLS[reg.status] ?? "bg-gray-300"
                          )}
                        />
                        {statusLabel(reg.status)}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4">
                      {reg.status !== "CANCELLED" && reg.status !== "ATTENDED" ? (
                        <div className="flex items-center gap-3">
                          <Link
                            href={`/events/${reg.event}`}
                            className="text-[#1a2744] text-xs font-semibold hover:underline"
                          >
                            View
                          </Link>
                          <button
                            onClick={() => handleCancel(reg)}
                            disabled={cancellingId === reg.id}
                            className="text-red-500 text-xs font-semibold hover:text-red-700 disabled:opacity-50"
                          >
                            {cancellingId === reg.id ? "Cancelling..." : "Cancel"}
                          </button>
                        </div>
                      ) : (
                        <Link
                          href={`/events/${reg.event}`}
                          className="text-[#1a2744] text-xs font-semibold hover:underline"
                        >
                          View
                        </Link>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="px-4 py-3 flex items-center justify-between border-t border-gray-100">
            <p className="text-sm text-gray-500">
              Showing {registrations.length} of {total} registered events
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40"
              >
                <ChevronLeft className="h-3.5 w-3.5" /> Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40"
              >
                Next <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* ── Past Events — real completed/cancelled registrations ─────── */}
        {!loading && pastRegistrations.length > 0 && (
          <div>
            <h2 className="font-bold text-gray-900 mb-4">Past Events</h2>
            <div className="grid grid-cols-2 gap-4">
              {pastRegistrations.map((reg) => (
                <Link
                  key={reg.id}
                  href={`/events/${reg.event}`}
                  className="relative rounded-xl overflow-hidden h-32 block group"
                >
                  {/* Poster or gradient fallback */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-700 to-blue-900">
                    {reg.event_poster && (
                      <Image
                        src={reg.event_poster}
                        alt={reg.event_title}
                        fill
                        className="object-cover opacity-60"
                      />
                    )}
                  </div>
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors" />
                  <div className="absolute top-3 left-3 bg-black/50 text-white text-[10px] font-bold uppercase px-2 py-0.5 rounded">
                    {statusLabel(reg.status)}
                  </div>
                  <div className="absolute bottom-3 left-3 right-3">
                    <p className="text-white font-semibold text-sm line-clamp-1">
                      {reg.event_title}
                    </p>
                    <p className="text-white/70 text-xs mt-0.5">
                      {formatDate(reg.event_date)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ── Empty past events state ───────────────────────────────────── */}
        {!loading && pastRegistrations.length === 0 && activeRegistrations.length > 0 && (
          <div>
            <h2 className="font-bold text-gray-900 mb-4">Past Events</h2>
            <p className="text-gray-400 text-sm">
              No past events yet. Your attended and cancelled events will appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}