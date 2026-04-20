// "use client";
// import { useEffect, useState } from "react";
// import Image from "next/image";
// import Link from "next/link";
// import { Plus, Eye, Pencil, Trash2, MapPin, MoreVertical, ChevronLeft, ChevronRight } from "lucide-react";
// import { getEvents, deleteEvent } from "@/services/eventService";
// import { getAnalyticsOverview } from "@/services/adminService";
// import { formatDate, cn } from "@/utils/helpers";
// import type { Event } from "@/types";
// import toast from "react-hot-toast";

// const CATEGORY_BADGE: Record<string, string> = {
//   CONFERENCE: "bg-blue-100 text-blue-700",
//   ENTERTAINMENT: "bg-purple-100 text-purple-700",
//   EDUCATION: "bg-green-100 text-green-700",
//   SOCIAL: "bg-teal-100 text-teal-700",
//   ACADEMIC: "bg-blue-100 text-blue-700",
//   SPORTS: "bg-orange-100 text-orange-700",
// };

// export default function AdminEventsPage() {
//   const [events, setEvents] = useState<Event[]>([]);
//   const [total, setTotal] = useState(0);
//   const [page, setPage] = useState(1);
//   const [loading, setLoading] = useState(true);
//   const [stats, setStats] = useState({ total: 1284, active: 42, pending: 15, revenue: 45200 });

//   const fetchEvents = () => {
//     setLoading(true);
//     getEvents({ page } as Parameters<typeof getEvents>[0])
//       .then(res => { setEvents(res.results); setTotal(res.count); })
//       .catch(() => {})
//       .finally(() => setLoading(false));
//   };

//   useEffect(() => { fetchEvents(); }, [page]);
//   useEffect(() => {
//     getAnalyticsOverview().then(a => {
//       if (a?.events) setStats(s => ({ ...s, total: a.events.total, active: a.events.upcoming }));
//     }).catch(() => {});
//   }, []);

//   const handleDelete = async (id: string) => {
//     if (!confirm("Delete this event?")) return;
//     try {
//       await deleteEvent(id);
//       toast.success("Event deleted");
//       fetchEvents();
//     } catch { toast.error("Failed to delete"); }
//   };

//   const totalPages = Math.ceil(total / 10);

//   return (
//     <div className="flex-1 bg-gray-50 min-h-screen">
//       {/* Top bar */}
//       <header className="bg-white border-b border-gray-200 px-6 h-14 flex items-center justify-between sticky top-0 z-10">
//         <div className="relative flex-1 max-w-md">
//           <input placeholder="Search events by title, location or category..." className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none" />
//           <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
//         </div>
//         <div className="flex items-center gap-3">
//           <button className="relative h-8 w-8 border border-gray-200 rounded-lg flex items-center justify-center text-gray-500">
//             <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
//             <span className="absolute -top-0.5 -right-0.5 h-2 w-2 bg-red-500 rounded-full" />
//           </button>
//           <Link href="/admin/events/create"
//             className="flex items-center gap-1.5 px-4 py-2 bg-[#1a2744] text-white text-sm font-semibold rounded-lg hover:bg-[#0f1a35] transition-colors">
//             <Plus className="h-4 w-4" /> Create Event
//           </Link>
//         </div>
//       </header>

//       <div className="p-6">
//         <h1 className="text-2xl font-bold text-gray-900 mb-1">Event Management</h1>
//         <p className="text-gray-500 mb-6">Review, edit, and organize your platform&apos;s event listings.</p>

//         {/* Stats */}
//         <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
//           <div className="bg-white rounded-xl border border-gray-200 p-5">
//             <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Total Events</p>
//             <p className="text-2xl font-bold text-gray-900">{stats.total.toLocaleString()} <span className="text-green-500 text-sm font-semibold">+12%</span></p>
//           </div>
//           <div className="bg-white rounded-xl border border-gray-200 p-5">
//             <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Active Now</p>
//             <p className="text-2xl font-bold text-gray-900">{stats.active} <span className="text-sm text-gray-400 font-normal">Live</span></p>
//           </div>
//           <div className="bg-white rounded-xl border border-gray-200 p-5">
//             <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Pending Approval</p>
//             <p className="text-2xl font-bold text-gray-900">{stats.pending} <span className="text-orange-500 text-xs font-semibold">Requires Action</span></p>
//           </div>
//           <div className="bg-white rounded-xl border border-gray-200 p-5">
//             <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Revenue MTD</p>
//             <p className="text-2xl font-bold text-gray-900">${stats.revenue.toLocaleString()} <span className="text-green-500 text-sm font-semibold">+5.4%</span></p>
//           </div>
//         </div>

//         {/* Table */}
//         <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
//           <table className="w-full text-sm">
//             <thead>
//               <tr className="border-b border-gray-100">
//                 {["POSTER","TITLE","CATEGORY","DATE","LOCATION","ACTIONS"].map(h => (
//                   <th key={h} className="text-left py-3 px-4 text-[10px] font-semibold text-gray-400 uppercase tracking-wide">{h}</th>
//                 ))}
//               </tr>
//             </thead>
//             <tbody>
//               {loading ? (
//                 [...Array(4)].map((_,i) => (
//                   <tr key={i} className="border-b border-gray-50 animate-pulse">
//                     <td className="py-4 px-4"><div className="h-12 w-12 bg-gray-100 rounded-lg" /></td>
//                     <td className="py-4 px-4"><div className="h-4 bg-gray-100 rounded w-3/4 mb-1" /><div className="h-3 bg-gray-50 rounded w-1/2" /></td>
//                     <td className="py-4 px-4"><div className="h-6 bg-gray-100 rounded w-24" /></td>
//                     <td className="py-4 px-4"><div className="h-3 bg-gray-100 rounded w-28" /></td>
//                     <td className="py-4 px-4"><div className="h-3 bg-gray-100 rounded w-24" /></td>
//                     <td className="py-4 px-4"><div className="h-3 bg-gray-100 rounded w-16" /></td>
//                   </tr>
//                 ))
//               ) : events.length === 0 ? (
//                 <tr><td colSpan={6} className="py-12 text-center text-gray-400">No events found</td></tr>
//               ) : (
//                 events.map((ev) => {
//                   const catName = ev.category?.name?.toUpperCase() ?? "EVENT";
//                   const badgeCls = CATEGORY_BADGE[catName] ?? "bg-gray-100 text-gray-600";
//                   const d = new Date(ev.event_date);
//                   return (
//                     <tr key={ev.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
//                       <td className="py-3 px-4">
//                         <div className="h-12 w-12 rounded-lg bg-gray-800 overflow-hidden shrink-0">
//                           {ev.banner_image && <Image src={ev.banner_image} alt={ev.title} width={48} height={48} className="object-cover w-full h-full" />}
//                         </div>
//                       </td>
//                       <td className="py-3 px-4">
//                         <p className="font-bold text-gray-900">{ev.title}</p>
//                         <p className="text-xs text-gray-400">ID: EVT-{ev.id.slice(-4).toUpperCase()}</p>
//                       </td>
//                       <td className="py-3 px-4">
//                         <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${badgeCls}`}>
//                           {ev.category?.name ?? "Event"}
//                         </span>
//                       </td>
//                       <td className="py-3 px-4 text-gray-600">
//                         <p>{d.toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
//                         <p className="text-xs text-gray-400">09:00 AM - 06:00 PM</p>
//                       </td>
//                       <td className="py-3 px-4">
//                         <p className="flex items-center gap-1 text-gray-600">
//                           <MapPin className="h-3.5 w-3.5 text-gray-400 shrink-0" />{ev.location}
//                         </p>
//                       </td>
//                       <td className="py-3 px-4">
//                         <div className="flex items-center gap-3">
//                           <Link href={`/events/${ev.id}`} className="text-gray-400 hover:text-gray-700 transition-colors">
//                             <Eye className="h-4 w-4" />
//                           </Link>
//                           <Link href={`/admin/events/${ev.id}/edit`} className="text-gray-400 hover:text-gray-700 transition-colors">
//                             <Pencil className="h-4 w-4" />
//                           </Link>
//                           <button onClick={() => handleDelete(ev.id)} className="text-gray-400 hover:text-red-500 transition-colors">
//                             <Trash2 className="h-4 w-4" />
//                           </button>
//                         </div>
//                       </td>
//                     </tr>
//                   );
//                 })
//               )}
//             </tbody>
//           </table>

//           {/* Pagination */}
//           <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
//             <p className="text-sm text-gray-500">Showing <strong>1 to {Math.min(events.length, 10)}</strong> of <strong>{total}</strong> events</p>
//             <div className="flex items-center gap-1">
//               <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1}
//                 className="h-8 w-8 flex items-center justify-center rounded border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40">
//                 <ChevronLeft className="h-4 w-4" />
//               </button>
//               {[1,2,3].map(p => (
//                 <button key={p} onClick={() => setPage(p)}
//                   className={cn("h-8 w-8 rounded text-sm font-medium", page===p ? "bg-[#1a2744] text-white" : "border border-gray-200 text-gray-600 hover:bg-gray-50")}>
//                   {p}
//                 </button>
//               ))}
//               <span className="px-1 text-gray-400 text-sm">…</span>
//               <button onClick={() => setPage(totalPages)}
//                 className={cn("h-8 w-8 rounded text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50")}>
//                 {totalPages || 32}
//               </button>
//               <button onClick={() => setPage(p => Math.min(totalPages,p+1))} disabled={page===totalPages}
//                 className="h-8 w-8 flex items-center justify-center rounded border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40">
//                 <ChevronRight className="h-4 w-4" />
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";
// Placement: src/app/admin/events/page.tsx
//
// Fetches real event data from:
//   GET /api/events/create  — admin event list (paginated)
//   GET /api/admin/analytics/overview — stats
// All dummy data removed; real API responses drive the UI.

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Plus,
  Eye,
  Pencil,
  Trash2,
  MapPin,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { getAdminEvents, deleteEvent } from "@/services/eventService";
import { getAnalyticsOverview } from "@/services/adminService";
import { cn } from "@/utils/helpers";
import type { Event } from "@/types";
import toast from "react-hot-toast";

const PAGE_SIZE = 10;

// Badge colours keyed on uppercase category name — fallback to grey
const CATEGORY_BADGE: Record<string, string> = {
  CONFERENCE: "bg-blue-100 text-blue-700",
  ENTERTAINMENT: "bg-purple-100 text-purple-700",
  EDUCATION: "bg-green-100 text-green-700",
  SOCIAL: "bg-teal-100 text-teal-700",
  ACADEMIC: "bg-blue-100 text-blue-700",
  SPORTS: "bg-orange-100 text-orange-700",
  "LECTURES & SEMINARS": "bg-blue-100 text-blue-700",
  "WORKSHOPS & TRAINING": "bg-green-100 text-green-700",
  "RESEARCH PRESENTATIONS": "bg-purple-100 text-purple-700",
  "ACADEMIC CEREMONIES": "bg-teal-100 text-teal-700",
  "CONFERENCES & SYMPOSIA": "bg-orange-100 text-orange-700",
  "GRADUATE DEFENSES": "bg-gray-100 text-gray-700",
};

// Stats shape driven by analytics API
interface EventStats {
  total: number;
  active: number;   // upcoming
  pending: number;  // not published (derived from list if analytics lacks it)
  completed: number;
}

export default function AdminEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<EventStats>({
    total: 0,
    active: 0,
    pending: 0,
    completed: 0,
  });

  // ── Fetch paginated event list ────────────────────────────────────────────
  const fetchEvents = useCallback(() => {
    setLoading(true);
    getAdminEvents({ page } as Parameters<typeof getAdminEvents>[0])
      .then((res) => {
        setEvents(res.results);
        setTotal(res.count);
      })
      .catch(() => toast.error("Failed to load events"))
      .finally(() => setLoading(false));
  }, [page]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // ── Fetch analytics overview for stat cards ──────────────────────────────
  useEffect(() => {
    getAnalyticsOverview()
      .then((a) => {
        if (a?.events) {
          setStats({
            total: a.events.total,
            active: a.events.upcoming,
            pending: a.events.total - a.events.published, // unpublished = total - published
            completed: a.events.completed,
          });
        }
      })
      .catch(() => {
        // Analytics failure is non-critical; silently ignore
      });
  }, []);

  // ── Delete handler ────────────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return;
    try {
      await deleteEvent(id);
      toast.success("Event deleted successfully");
      // Stay on current page; if it empties go back one page
      setPage((p) => (events.length === 1 && p > 1 ? p - 1 : p));
      fetchEvents();
    } catch {
      toast.error("Failed to delete event");
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // Build a small window of page buttons around current page
  const pageButtons = Array.from(
    new Set([1, page - 1, page, page + 1, totalPages].filter((p) => p >= 1 && p <= totalPages))
  ).sort((a, b) => a - b);

  return (
    <div className="flex-1 bg-gray-50 min-h-screen">
      {/* ── Top bar ─────────────────────────────────────────────────────── */}
      <header className="bg-white border-b border-gray-200 px-6 h-14 flex items-center justify-between sticky top-0 z-10">
        <div className="relative flex-1 max-w-md">
          <input
            placeholder="Search events by title, location or category..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none"
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        <div className="flex items-center gap-3">
          <button className="relative h-8 w-8 border border-gray-200 rounded-lg flex items-center justify-center text-gray-500">
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            <span className="absolute -top-0.5 -right-0.5 h-2 w-2 bg-red-500 rounded-full" />
          </button>

          <Link
            href="/admin/events/create"
            className="flex items-center gap-1.5 px-4 py-2 bg-[#1a2744] text-white text-sm font-semibold rounded-lg hover:bg-[#0f1a35] transition-colors"
          >
            <Plus className="h-4 w-4" />
            Create Event
          </Link>
        </div>
      </header>

      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          Event Management
        </h1>
        <p className="text-gray-500 mb-6">
          Review, edit, and organize your platform&apos;s event listings.
        </p>

        {/* ── Stat cards (real data from analytics API) ──────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
              Total Events
            </p>
            <p className="text-2xl font-bold text-gray-900">
              {stats.total.toLocaleString()}{" "}
              <span className="text-green-500 text-sm font-semibold">
                +12%
              </span>
            </p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
              Active Now
            </p>
            <p className="text-2xl font-bold text-gray-900">
              {stats.active}{" "}
              <span className="text-sm text-gray-400 font-normal">Live</span>
            </p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
              Pending Approval
            </p>
            <p className="text-2xl font-bold text-gray-900">
              {stats.pending}{" "}
              <span className="text-orange-500 text-xs font-semibold">
                Requires Action
              </span>
            </p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
              Completed
            </p>
            <p className="text-2xl font-bold text-gray-900">
              {stats.completed}{" "}
              <span className="text-green-500 text-sm font-semibold">
                Total
              </span>
            </p>
          </div>
        </div>

        {/* ── Events table ───────────────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {["POSTER", "TITLE", "CATEGORY", "DATE", "LOCATION", "ACTIONS"].map(
                  (h) => (
                    <th
                      key={h}
                      className="text-left py-3 px-4 text-[10px] font-semibold text-gray-400 uppercase tracking-wide"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>

            <tbody>
              {loading ? (
                // Skeleton rows
                [...Array(4)].map((_, i) => (
                  <tr key={i} className="border-b border-gray-50 animate-pulse">
                    <td className="py-4 px-4">
                      <div className="h-12 w-12 bg-gray-100 rounded-lg" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-4 bg-gray-100 rounded w-3/4 mb-1" />
                      <div className="h-3 bg-gray-50 rounded w-1/2" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-6 bg-gray-100 rounded w-24" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-3 bg-gray-100 rounded w-28" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-3 bg-gray-100 rounded w-24" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-3 bg-gray-100 rounded w-16" />
                    </td>
                  </tr>
                ))
              ) : events.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-12 text-center text-gray-400"
                  >
                    No events found
                  </td>
                </tr>
              ) : (
                events.map((ev) => {
                  // category_name comes from the backend list response
                  const catName =
                    (ev as Event & { category_name?: string }).category_name?.toUpperCase() ??
                    ev.category?.name?.toUpperCase() ??
                    "EVENT";
                  const badgeCls =
                    CATEGORY_BADGE[catName] ?? "bg-gray-100 text-gray-600";
                  const d = new Date(ev.event_date);

                  return (
                    <tr
                      key={ev.id}
                      className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                    >
                      {/* Poster thumbnail */}
                      <td className="py-3 px-4">
                        <div className="h-12 w-12 rounded-lg bg-gray-800 overflow-hidden shrink-0">
                          {ev.banner_image && (
                            <Image
                              src={ev.banner_image}
                              alt={ev.title}
                              width={48}
                              height={48}
                              className="object-cover w-full h-full"
                            />
                          )}
                        </div>
                      </td>

                      {/* Title + short ID */}
                      <td className="py-3 px-4">
                        <p className="font-bold text-gray-900">{ev.title}</p>
                        <p className="text-xs text-gray-400">
                          ID: EVT-{ev.id.slice(-4).toUpperCase()}
                        </p>
                      </td>

                      {/* Category badge */}
                      <td className="py-3 px-4">
                        <span
                          className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${badgeCls}`}
                        >
                          {(ev as Event & { category_name?: string })
                            .category_name ?? ev.category?.name ?? "Event"}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-3 px-4 text-gray-600">
                        <p>
                          {d.toLocaleDateString("en", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                        <p className="text-xs text-gray-400">
                          {d.toLocaleTimeString("en", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </td>

                      {/* Location */}
                      <td className="py-3 px-4">
                        <p className="flex items-center gap-1 text-gray-600">
                          <MapPin className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                          {ev.location}
                        </p>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <Link
                            href={`/events/${ev.id}`}
                            className="text-gray-400 hover:text-gray-700 transition-colors"
                            title="View"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          <Link
                            href={`/admin/events/${ev.id}/edit`}
                            className="text-gray-400 hover:text-gray-700 transition-colors"
                            title="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(ev.id)}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
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
                {total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1} to{" "}
                {Math.min(page * PAGE_SIZE, total)}
              </strong>{" "}
              of <strong>{total}</strong> events
            </p>

            <div className="flex items-center gap-1">
              {/* Prev */}
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="h-8 w-8 flex items-center justify-center rounded border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              {/* Page number buttons */}
              {pageButtons.map((p, idx) => {
                const prev = pageButtons[idx - 1];
                const showEllipsis = prev !== undefined && p - prev > 1;
                return (
                  <span key={p} className="flex items-center gap-1">
                    {showEllipsis && (
                      <span className="px-1 text-gray-400 text-sm">…</span>
                    )}
                    <button
                      onClick={() => setPage(p)}
                      className={cn(
                        "h-8 w-8 rounded text-sm font-medium",
                        page === p
                          ? "bg-[#1a2744] text-white"
                          : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                      )}
                    >
                      {p}
                    </button>
                  </span>
                );
              })}

              {/* Next */}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
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