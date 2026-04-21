// "use client";
// // Placement: src/app/admin/registrations/page.tsx
// //
// // Changes from previous version:
// //   1. "Filter Event" dropdown now loads real events list and triggers
// //      GET /admin/events/{event_id}/registrations when an event is selected,
// //      otherwise falls back to GET /admin/registrations (all registrations).
// //   2. "Status" filter wired to real API query param.
// //   3. Export CSV and Add Registration buttons removed (not needed on admin side).
// //   4. No UI/layout/styling changes.

// import { useState, useEffect, useCallback } from "react";
// import {
//   BarChart3,
//   CheckCircle,
//   Timer,
//   XCircle,
//   ChevronLeft,
//   ChevronRight,
//   MoreHorizontal,
// } from "lucide-react";
// import { getAdminRegistrations } from "@/services/adminService";
// import { getEventRegistrations, getAdminEvents } from "@/services/eventService";
// import { cn } from "@/utils/helpers";
// import type { AdminRegistration, Event, PaginatedResponse } from "@/types";

// // ── Status badge colours ──────────────────────────────────────────────────────
// const STATUS_STYLE: Record<string, string> = {
//   REGISTERED: "bg-green-100 text-green-700",
//   ATTENDED:   "bg-blue-100 text-blue-700",
//   CANCELLED:  "bg-red-100 text-red-700",
//   CONFIRMED:  "bg-green-100 text-green-700",
//   PENDING:    "bg-gray-100 text-gray-600",
// };

// const INITIALS_BG = [
//   "bg-gray-200 text-gray-600",
//   "bg-blue-100 text-blue-700",
//   "bg-purple-100 text-purple-700",
//   "bg-green-100 text-green-700",
//   "bg-orange-100 text-orange-700",
// ];

// function getInitials(name: string): string {
//   return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
// }

// function formatDate(iso: string): string {
//   return new Date(iso).toLocaleDateString("en", {
//     month: "short",
//     day: "numeric",
//     year: "numeric",
//   });
// }

// const PAGE_SIZE = 10;

// export default function RegistrationsPage() {
//   // ── Filter state ──────────────────────────────────────────────────────────
//   const [searchInput, setSearchInput]   = useState("");
//   const [search, setSearch]             = useState("");
//   const [statusFilter, setStatusFilter] = useState("");
//   const [selectedEventId, setSelectedEventId] = useState(""); // "" = all events

//   // ── Pagination ────────────────────────────────────────────────────────────
//   const [currentPage, setCurrentPage] = useState(1);
//   const [totalPages, setTotalPages]   = useState(1);
//   const [total, setTotal]             = useState(0);

//   // ── Data ──────────────────────────────────────────────────────────────────
//   const [registrations, setRegistrations] = useState<AdminRegistration[]>([]);
//   const [loading, setLoading]             = useState(true);

//   // Events list for the filter dropdown
//   const [events, setEvents] = useState<Event[]>([]);
//   const [loadingEvents, setLoadingEvents] = useState(true);

//   // ── Load events for the filter dropdown (once on mount) ──────────────────
//   useEffect(() => {
//     setLoadingEvents(true);
//     // Fetch up to 100 events so the dropdown is useful without pagination
//     getAdminEvents({ page: 1 } as Parameters<typeof getAdminEvents>[0])
//       .then((res) => setEvents(res.results))
//       .catch(() => setEvents([]))
//       .finally(() => setLoadingEvents(false));
//   }, []);

//   // ── Fetch registrations whenever filters / page change ───────────────────
//   const fetchRegistrations = useCallback(async () => {
//     setLoading(true);
//     try {
//       let res: PaginatedResponse<AdminRegistration>;

//       if (selectedEventId) {
//         // Use the event-specific registrations endpoint
//         // GET /api/admin/events/{event_id}/registrations
//         // Note: this endpoint may not support pagination params — we handle both cases
//         res = await getEventRegistrations(selectedEventId);
//       } else {
//         // Use the general admin registrations endpoint with filters
//         res = await getAdminRegistrations({
//           page: currentPage,
//           search: search || undefined,
//           status: statusFilter || undefined,
//         });
//       }

//       setRegistrations(res.results);
//       setTotal(res.count);
//       setTotalPages(res.total_pages ?? Math.max(1, Math.ceil(res.count / PAGE_SIZE)));
//     } catch (err) {
//       console.error("[RegistrationsPage] fetch failed:", err);
//       setRegistrations([]);
//       setTotal(0);
//       setTotalPages(1);
//     } finally {
//       setLoading(false);
//     }
//   }, [selectedEventId, currentPage, search, statusFilter]);

//   useEffect(() => {
//     fetchRegistrations();
//   }, [fetchRegistrations]);

//   // Reset to page 1 when any filter changes
//   const applyFilter = (fn: () => void) => {
//     fn();
//     setCurrentPage(1);
//   };

//   // Commit search on Enter / blur
//   const commitSearch = () => applyFilter(() => setSearch(searchInput));

//   // ── Page window helper ───────────────────────────────────────────────────
//   const pageWindow = Array.from(
//     new Set(
//       [1, currentPage - 1, currentPage, currentPage + 1, totalPages].filter(
//         (p) => p >= 1 && p <= totalPages
//       )
//     )
//   ).sort((a, b) => a - b);

//   // ── Stat counts (from current page results) ───────────────────────────────
//   const registeredCount = registrations.filter(
//     (r) => r.status === "REGISTERED" || r.status === "CONFIRMED"
//   ).length;
//   const attendedCount  = registrations.filter((r) => r.status === "ATTENDED").length;
//   const cancelledCount = registrations.filter((r) => r.status === "CANCELLED").length;

//   return (
//     <div className="flex-1 bg-gray-50 min-h-screen">
//       {/* ── Top bar ─────────────────────────────────────────────────────── */}
//       <header className="bg-white border-b border-gray-200 px-6 h-14 flex items-center justify-between sticky top-0 z-10">
//         <h1 className="font-semibold text-gray-900">Event Registrations</h1>
//         <div className="flex items-center gap-3">
//           <div className="relative">
//             <input
//               placeholder="Search registration..."
//               value={searchInput}
//               onChange={(e) => setSearchInput(e.target.value)}
//               onKeyDown={(e) => e.key === "Enter" && commitSearch()}
//               onBlur={commitSearch}
//               className="pl-9 pr-4 py-1.5 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none w-52"
//             />
//             <svg
//               className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400"
//               fill="none" viewBox="0 0 24 24" stroke="currentColor"
//             >
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
//                 d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
//             </svg>
//           </div>
//           <button className="h-8 w-8 border border-gray-200 rounded-lg flex items-center justify-center text-gray-400">
//             <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
//                 d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//             </svg>
//           </button>
//         </div>
//       </header>

//       <div className="p-6">
//         {/* ── Stat cards ──────────────────────────────────────────────────── */}
//         <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
//           <div className="bg-white rounded-xl border border-gray-200 p-5">
//             <div className="flex items-start justify-between mb-3">
//               <div>
//                 <p className="text-sm text-gray-500">Total Registrations</p>
//                 <p className="text-2xl font-bold text-gray-900">{total.toLocaleString()}</p>
//               </div>
//               <div className="h-10 w-10 bg-gray-100 rounded-xl flex items-center justify-center shrink-0">
//                 <BarChart3 className="h-5 w-5 text-gray-500" />
//               </div>
//             </div>
//             <p className="text-xs text-green-600">+12% from last month</p>
//           </div>

//           <div className="bg-white rounded-xl border border-gray-200 p-5">
//             <div className="flex items-start justify-between mb-3">
//               <div>
//                 <p className="text-sm text-gray-500">Registered</p>
//                 <p className="text-2xl font-bold text-gray-900">{registeredCount.toLocaleString()}</p>
//               </div>
//               <div className="h-10 w-10 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
//                 <CheckCircle className="h-5 w-5 text-green-600" />
//               </div>
//             </div>
//             <p className="text-xs text-gray-400">Active on this page</p>
//           </div>

//           <div className="bg-white rounded-xl border border-gray-200 p-5">
//             <div className="flex items-start justify-between mb-3">
//               <div>
//                 <p className="text-sm text-gray-500">Attended</p>
//                 <p className="text-2xl font-bold text-gray-900">{attendedCount.toLocaleString()}</p>
//               </div>
//               <div className="h-10 w-10 bg-yellow-100 rounded-xl flex items-center justify-center shrink-0">
//                 <Timer className="h-5 w-5 text-yellow-600" />
//               </div>
//             </div>
//             <p className="text-xs text-gray-400">Checked-in attendees</p>
//           </div>

//           <div className="bg-white rounded-xl border border-gray-200 p-5">
//             <div className="flex items-start justify-between mb-3">
//               <div>
//                 <p className="text-sm text-gray-500">Cancelled</p>
//                 <p className="text-2xl font-bold text-gray-900">{cancelledCount.toLocaleString()}</p>
//               </div>
//               <div className="h-10 w-10 bg-red-100 rounded-xl flex items-center justify-center shrink-0">
//                 <XCircle className="h-5 w-5 text-red-500" />
//               </div>
//             </div>
//             <p className="text-xs text-red-500">Cancelled on this page</p>
//           </div>
//         </div>

//         {/* ── Main table card ─────────────────────────────────────────────── */}
//         <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
//           {/* Card header */}
//           <div className="p-5 flex items-start justify-between">
//             <div>
//               <h2 className="font-bold text-gray-900">Registration Management</h2>
//               <p className="text-sm text-gray-500">
//                 Monitor and manage student enrollments for campus events.
//               </p>
//             </div>
//           </div>

//           {/* ── Filters ──────────────────────────────────────────────────── */}
//           <div className="px-5 pb-3 flex items-center gap-3 flex-wrap">
//             {/* Event filter — loads real events */}
//             <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
//               Filter Event:
//             </p>
//             <div className="relative">
//               <select
//                 value={selectedEventId}
//                 onChange={(e) =>
//                   applyFilter(() => setSelectedEventId(e.target.value))
//                 }
//                 disabled={loadingEvents}
//                 className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none bg-white appearance-none pr-7 max-w-[220px] truncate disabled:opacity-50"
//               >
//                 <option value="">All Events</option>
//                 {events.map((ev) => (
//                   <option key={ev.id} value={ev.id}>
//                     {ev.title}
//                   </option>
//                 ))}
//               </select>
//               <ChevronRight className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400 rotate-90 pointer-events-none" />
//             </div>

//             {/* Status filter — hidden when viewing a specific event (status param
//                 not supported by the event-registrations endpoint) */}
//             {!selectedEventId && (
//               <>
//                 <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide ml-2">
//                   Status:
//                 </p>
//                 <div className="relative">
//                   <select
//                     value={statusFilter}
//                     onChange={(e) =>
//                       applyFilter(() => setStatusFilter(e.target.value))
//                     }
//                     className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none bg-white appearance-none pr-7"
//                   >
//                     <option value="">All Statuses</option>
//                     <option value="REGISTERED">Registered</option>
//                     <option value="ATTENDED">Attended</option>
//                     <option value="CANCELLED">Cancelled</option>
//                   </select>
//                   <ChevronRight className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400 rotate-90 pointer-events-none" />
//                 </div>
//               </>
//             )}

//             <p className="text-sm text-gray-400 ml-auto">
//               {selectedEventId ? (
//                 // For event-specific view show all results (no server-side pagination)
//                 <>Showing <strong>{registrations.length}</strong> of <strong>{total}</strong> results</>
//               ) : (
//                 <>
//                   Showing{" "}
//                   <strong>
//                     {total === 0
//                       ? 0
//                       : `${(currentPage - 1) * PAGE_SIZE + 1}–${Math.min(
//                           currentPage * PAGE_SIZE,
//                           total
//                         )}`}
//                   </strong>{" "}
//                   of <strong>{total.toLocaleString()}</strong> results
//                 </>
//               )}
//             </p>
//           </div>

//           {/* ── Table ───────────────────────────────────────────────────── */}
//           <table className="w-full text-sm">
//             <thead>
//               <tr className="border-y border-gray-100">
//                 {[
//                   "STUDENT NAME",
//                   "EMAIL ADDRESS",
//                   "EVENT TITLE",
//                   "REGISTRATION DATE",
//                   "STATUS",
//                   "ACTIONS",
//                 ].map((h) => (
//                   <th
//                     key={h}
//                     className="text-left py-3 px-4 text-[10px] font-semibold text-gray-400 uppercase tracking-wide"
//                   >
//                     {h}
//                   </th>
//                 ))}
//               </tr>
//             </thead>

//             <tbody>
//               {loading ? (
//                 [...Array(5)].map((_, i) => (
//                   <tr key={i} className="border-b border-gray-50 animate-pulse">
//                     <td className="py-4 px-4">
//                       <div className="flex items-center gap-3">
//                         <div className="h-8 w-8 bg-gray-100 rounded-full" />
//                         <div className="h-4 bg-gray-100 rounded w-24" />
//                       </div>
//                     </td>
//                     <td className="py-4 px-4"><div className="h-3 bg-gray-100 rounded w-32" /></td>
//                     <td className="py-4 px-4"><div className="h-3 bg-gray-100 rounded w-28" /></td>
//                     <td className="py-4 px-4"><div className="h-3 bg-gray-100 rounded w-20" /></td>
//                     <td className="py-4 px-4"><div className="h-6 bg-gray-100 rounded w-20" /></td>
//                     <td className="py-4 px-4"><div className="h-3 bg-gray-100 rounded w-6" /></td>
//                   </tr>
//                 ))
//               ) : registrations.length === 0 ? (
//                 <tr>
//                   <td colSpan={6} className="py-12 text-center text-gray-400 text-sm">
//                     No registrations found
//                   </td>
//                 </tr>
//               ) : (
//                 registrations.map((reg: AdminRegistration, i: number) => {
//                   const initials    = getInitials(reg.user_name);
//                   const bgCls       = INITIALS_BG[i % INITIALS_BG.length];
//                   const statusStyle = STATUS_STYLE[reg.status] ?? "bg-gray-100 text-gray-600";
//                   const statusLabel =
//                     reg.status.charAt(0) + reg.status.slice(1).toLowerCase();

//                   return (
//                     <tr
//                       key={reg.id}
//                       className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
//                     >
//                       <td className="py-4 px-4">
//                         <div className="flex items-center gap-3">
//                           <div
//                             className={`h-9 w-9 rounded-full ${bgCls} flex items-center justify-center text-xs font-bold shrink-0`}
//                           >
//                             {initials}
//                           </div>
//                           <span className="font-semibold text-gray-900">{reg.user_name}</span>
//                         </div>
//                       </td>
//                       <td className="py-4 px-4 text-gray-500">{reg.user_email}</td>
//                       <td className="py-4 px-4 text-gray-700 font-medium">{reg.event_title}</td>
//                       <td className="py-4 px-4 text-gray-500">{formatDate(reg.registration_date)}</td>
//                       <td className="py-4 px-4">
//                         <span
//                           className={cn(
//                             "text-xs font-semibold px-3 py-1.5 rounded-full",
//                             statusStyle
//                           )}
//                         >
//                           {statusLabel}
//                         </span>
//                       </td>
//                       <td className="py-4 px-4">
//                         <button className="text-gray-400 hover:text-gray-700 transition-colors">
//                           <MoreHorizontal className="h-4 w-4" />
//                         </button>
//                       </td>
//                     </tr>
//                   );
//                 })
//               )}
//             </tbody>
//           </table>

//           {/* ── Pagination (only shown for all-registrations view) ───────── */}
//           {!selectedEventId && (
//             <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
//               <button
//                 onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
//                 disabled={currentPage === 1}
//                 className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40"
//               >
//                 <ChevronLeft className="h-4 w-4" /> Previous
//               </button>

//               <div className="flex items-center gap-1">
//                 {pageWindow.map((p, idx) => {
//                   const prev = pageWindow[idx - 1];
//                   const showEllipsis = prev !== undefined && p - prev > 1;
//                   return (
//                     <span key={p} className="flex items-center gap-1">
//                       {showEllipsis && (
//                         <span className="px-1 text-gray-400 text-sm">…</span>
//                       )}
//                       <button
//                         onClick={() => setCurrentPage(p)}
//                         className={cn(
//                           "h-8 w-8 rounded text-sm font-medium",
//                           currentPage === p
//                             ? "bg-[#1a2744] text-white"
//                             : "border border-gray-200 text-gray-600 hover:bg-gray-50"
//                         )}
//                       >
//                         {p}
//                       </button>
//                     </span>
//                   );
//                 })}
//               </div>

//               <button
//                 onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
//                 disabled={currentPage >= totalPages}
//                 className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40"
//               >
//                 Next <ChevronRight className="h-4 w-4" />
//               </button>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";
// Placement: src/app/admin/registrations/page.tsx
//
// Changes from previous version:
//   1. "Filter Event" dropdown now loads real events list and triggers
//      GET /admin/events/{event_id}/registrations when an event is selected,
//      otherwise falls back to GET /admin/registrations (all registrations).
//   2. "Status" filter wired to real API query param.
//   3. Export CSV and Add Registration buttons removed (not needed on admin side).
//   4. No UI/layout/styling changes.

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  BarChart3,
  CheckCircle,
  Timer,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Eye,
} from "lucide-react";
import { getAdminRegistrations } from "@/services/adminService";
import { getEventRegistrations, getAdminEvents } from "@/services/eventService";
import { cn } from "@/utils/helpers";
import type { AdminRegistration, Event, PaginatedResponse } from "@/types";

// ── Status badge colours ──────────────────────────────────────────────────────
const STATUS_STYLE: Record<string, string> = {
  REGISTERED: "bg-green-100 text-green-700",
  ATTENDED: "bg-blue-100 text-blue-700",
  CANCELLED: "bg-red-100 text-red-700",
  CONFIRMED: "bg-green-100 text-green-700",
  PENDING: "bg-gray-100 text-gray-600",
};

const INITIALS_BG = [
  "bg-gray-200 text-gray-600",
  "bg-blue-100 text-blue-700",
  "bg-purple-100 text-purple-700",
  "bg-green-100 text-green-700",
  "bg-orange-100 text-orange-700",
];

function getInitials(name: string): string {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const PAGE_SIZE = 10;

export default function RegistrationsPage() {
  // ── Filter state ──────────────────────────────────────────────────────────
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedEventId, setSelectedEventId] = useState(""); // "" = all events

  // ── Pagination ────────────────────────────────────────────────────────────
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // ── Data ──────────────────────────────────────────────────────────────────
  const [registrations, setRegistrations] = useState<AdminRegistration[]>([]);
  const [loading, setLoading] = useState(true);

  // Events list for the filter dropdown
  const [events, setEvents] = useState<Event[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  // ── Load events for the filter dropdown (once on mount) ──────────────────
  useEffect(() => {
    setLoadingEvents(true);
    // Fetch up to 100 events so the dropdown is useful without pagination
    getAdminEvents({ page: 1 } as Parameters<typeof getAdminEvents>[0])
      .then((res) => setEvents(res.results))
      .catch(() => setEvents([]))
      .finally(() => setLoadingEvents(false));
  }, []);

  // ── Fetch registrations whenever filters / page change ───────────────────
  const fetchRegistrations = useCallback(async () => {
    setLoading(true);
    try {
      let res: PaginatedResponse<AdminRegistration>;

      if (selectedEventId) {
        // Use the event-specific registrations endpoint
        // GET /api/admin/events/{event_id}/registrations
        // Note: this endpoint may not support pagination params — we handle both cases
        res = await getEventRegistrations(selectedEventId);
      } else {
        // Use the general admin registrations endpoint with filters
        res = await getAdminRegistrations({
          page: currentPage,
          search: search || undefined,
          status: statusFilter || undefined,
        });
      }

      setRegistrations(res.results);
      setTotal(res.count);
      setTotalPages(res.total_pages ?? Math.max(1, Math.ceil(res.count / PAGE_SIZE)));
    } catch (err) {
      console.error("[RegistrationsPage] fetch failed:", err);
      setRegistrations([]);
      setTotal(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [selectedEventId, currentPage, search, statusFilter]);

  useEffect(() => {
    fetchRegistrations();
  }, [fetchRegistrations]);

  // Reset to page 1 when any filter changes
  const applyFilter = (fn: () => void) => {
    fn();
    setCurrentPage(1);
  };

  // Commit search on Enter / blur
  const commitSearch = () => applyFilter(() => setSearch(searchInput));

  // ── Page window helper ───────────────────────────────────────────────────
  const pageWindow = Array.from(
    new Set(
      [1, currentPage - 1, currentPage, currentPage + 1, totalPages].filter(
        (p) => p >= 1 && p <= totalPages
      )
    )
  ).sort((a, b) => a - b);

  // ── Stat counts (from current page results) ───────────────────────────────
  const registeredCount = registrations.filter(
    (r) => r.status === "REGISTERED" || r.status === "CONFIRMED"
  ).length;
  const attendedCount = registrations.filter((r) => r.status === "ATTENDED").length;
  const cancelledCount = registrations.filter((r) => r.status === "CANCELLED").length;

  return (
    <div className="flex-1 bg-gray-50 min-h-screen">
      {/* ── Top bar ─────────────────────────────────────────────────────── */}
      <header className="bg-white border-b border-gray-200 px-6 h-14 flex items-center justify-between sticky top-0 z-10">
        <h1 className="font-semibold text-gray-900">Event Registrations</h1>
        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              placeholder="Search registration..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && commitSearch()}
              onBlur={commitSearch}
              className="pl-9 pr-4 py-1.5 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none w-52"
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400"
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <button className="h-8 w-8 border border-gray-200 rounded-lg flex items-center justify-center text-gray-400">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>
      </header>

      <div className="p-6">
        {/* ── Stat cards ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-sm text-gray-500">Total Registrations</p>
                <p className="text-2xl font-bold text-gray-900">{total.toLocaleString()}</p>
              </div>
              <div className="h-10 w-10 bg-gray-100 rounded-xl flex items-center justify-center shrink-0">
                <BarChart3 className="h-5 w-5 text-gray-500" />
              </div>
            </div>
            <p className="text-xs text-green-600">+12% from last month</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-sm text-gray-500">Registered</p>
                <p className="text-2xl font-bold text-gray-900">{registeredCount.toLocaleString()}</p>
              </div>
              <div className="h-10 w-10 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <p className="text-xs text-gray-400">Active on this page</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-sm text-gray-500">Attended</p>
                <p className="text-2xl font-bold text-gray-900">{attendedCount.toLocaleString()}</p>
              </div>
              <div className="h-10 w-10 bg-yellow-100 rounded-xl flex items-center justify-center shrink-0">
                <Timer className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
            <p className="text-xs text-gray-400">Checked-in attendees</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-sm text-gray-500">Cancelled</p>
                <p className="text-2xl font-bold text-gray-900">{cancelledCount.toLocaleString()}</p>
              </div>
              <div className="h-10 w-10 bg-red-100 rounded-xl flex items-center justify-center shrink-0">
                <XCircle className="h-5 w-5 text-red-500" />
              </div>
            </div>
            <p className="text-xs text-red-500">Cancelled on this page</p>
          </div>
        </div>

        {/* ── Main table card ─────────────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {/* Card header */}
          <div className="p-5 flex items-start justify-between">
            <div>
              <h2 className="font-bold text-gray-900">Registration Management</h2>
              <p className="text-sm text-gray-500">
                Monitor and manage student enrollments for campus events.
              </p>
            </div>
          </div>

          {/* ── Filters ──────────────────────────────────────────────────── */}
          <div className="px-5 pb-3 flex items-center gap-3 flex-wrap">
            {/* Event filter — loads real events */}
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
              Filter Event:
            </p>
            <div className="relative">
              <select
                value={selectedEventId}
                onChange={(e) =>
                  applyFilter(() => setSelectedEventId(e.target.value))
                }
                disabled={loadingEvents}
                className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none bg-white appearance-none pr-7 max-w-[220px] truncate disabled:opacity-50"
              >
                <option value="">All Events</option>
                {events.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.title}
                  </option>
                ))}
              </select>
              <ChevronRight className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400 rotate-90 pointer-events-none" />
            </div>

            {/* Status filter — hidden when viewing a specific event (status param
                not supported by the event-registrations endpoint) */}
            {!selectedEventId && (
              <>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide ml-2">
                  Status:
                </p>
                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={(e) =>
                      applyFilter(() => setStatusFilter(e.target.value))
                    }
                    className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none bg-white appearance-none pr-7"
                  >
                    <option value="">All Statuses</option>
                    <option value="REGISTERED">Registered</option>
                    <option value="ATTENDED">Attended</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                  <ChevronRight className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400 rotate-90 pointer-events-none" />
                </div>
              </>
            )}

            <p className="text-sm text-gray-400 ml-auto">
              {selectedEventId ? (
                // For event-specific view show all results (no server-side pagination)
                <>Showing <strong>{registrations.length}</strong> of <strong>{total}</strong> results</>
              ) : (
                <>
                  Showing{" "}
                  <strong>
                    {total === 0
                      ? 0
                      : `${(currentPage - 1) * PAGE_SIZE + 1}–${Math.min(
                        currentPage * PAGE_SIZE,
                        total
                      )}`}
                  </strong>{" "}
                  of <strong>{total.toLocaleString()}</strong> results
                </>
              )}
            </p>
          </div>

          {/* ── Table ───────────────────────────────────────────────────── */}
          <table className="w-full text-sm">
            <thead>
              <tr className="border-y border-gray-100">
                {[
                  "STUDENT NAME",
                  "EMAIL ADDRESS",
                  "EVENT TITLE",
                  "REGISTRATION DATE",
                  "STATUS",
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
                        <div className="h-8 w-8 bg-gray-100 rounded-full" />
                        <div className="h-4 bg-gray-100 rounded w-24" />
                      </div>
                    </td>
                    <td className="py-4 px-4"><div className="h-3 bg-gray-100 rounded w-32" /></td>
                    <td className="py-4 px-4"><div className="h-3 bg-gray-100 rounded w-28" /></td>
                    <td className="py-4 px-4"><div className="h-3 bg-gray-100 rounded w-20" /></td>
                    <td className="py-4 px-4"><div className="h-6 bg-gray-100 rounded w-20" /></td>
                    <td className="py-4 px-4"><div className="h-3 bg-gray-100 rounded w-6" /></td>
                  </tr>
                ))
              ) : registrations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400 text-sm">
                    No registrations found
                  </td>
                </tr>
              ) : (
                registrations.map((reg: AdminRegistration, i: number) => {
                  const initials = getInitials(reg.user_name);
                  const bgCls = INITIALS_BG[i % INITIALS_BG.length];
                  const statusStyle = STATUS_STYLE[reg.status] ?? "bg-gray-100 text-gray-600";
                  const statusLabel =
                    reg.status.charAt(0) + reg.status.slice(1).toLowerCase();

                  return (
                    <tr
                      key={reg.id}
                      className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`h-9 w-9 rounded-full ${bgCls} flex items-center justify-center text-xs font-bold shrink-0`}
                          >
                            {initials}
                          </div>
                          <span className="font-semibold text-gray-900">{reg.user_name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-gray-500">{reg.user_email}</td>
                      <td className="py-4 px-4 text-gray-700 font-medium">{reg.event_title}</td>
                      <td className="py-4 px-4 text-gray-500">{formatDate(reg.registration_date)}</td>
                      <td className="py-4 px-4">
                        <span
                          className={cn(
                            "text-xs font-semibold px-3 py-1.5 rounded-full",
                            statusStyle
                          )}
                        >
                          {statusLabel}
                        </span>
                      </td>
                      {/* View — navigates to the event-specific registrations page */}
                      <td className="py-4 px-4">
                        <Link
                          href={`/admin/registrations/${reg.event}`}
                          className="text-gray-400 hover:text-[#1a2744] transition-colors"
                          title="View all registrations for this event"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

          {/* ── Pagination (only shown for all-registrations view) ───────── */}
          {!selectedEventId && (
            <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" /> Previous
              </button>

              <div className="flex items-center gap-1">
                {pageWindow.map((p, idx) => {
                  const prev = pageWindow[idx - 1];
                  const showEllipsis = prev !== undefined && p - prev > 1;
                  return (
                    <span key={p} className="flex items-center gap-1">
                      {showEllipsis && (
                        <span className="px-1 text-gray-400 text-sm">…</span>
                      )}
                      <button
                        onClick={() => setCurrentPage(p)}
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
              </div>

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40"
              >
                Next <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}