// "use client";
// import { useEffect, useState } from "react";
// import Image from "next/image";
// import Link from "next/link";
// import { CalendarDays, MapPin, Clock, Plus, TrendingUp } from "lucide-react";
// import { useAuthStore } from "@/context/authStore";
// import { getStudentDashboard } from "@/services/userService";
// import { getNotifications } from "@/services/notificationService";
// import { formatDate, getInitials, timeAgo } from "@/utils/helpers";
// import type { StudentDashboardData, Notification } from "@/types";

// const DAYS = ["S", "M", "T", "W", "T", "F", "S"];

// export default function StudentDashboard() {
//   const { user } = useAuthStore();
//   const [dashboard, setDashboard] = useState<StudentDashboardData | null>(null);
//   const [notifications, setNotifications] = useState<Notification[]>([]);
//   const [today] = useState(new Date());

//   useEffect(() => {
//     getStudentDashboard().then(setDashboard).catch(() => { });
//     getNotifications().then(r => setNotifications(r.results.slice(0, 3))).catch(() => { });
//   }, []);

//   // StudentDashboardData has: upcoming_events, stats.total_registered, stats.total_attended
//   const upcomingEvents = dashboard?.upcoming_events ?? [];
//   const stats = dashboard?.stats;
//   const registeredCount = stats?.total_registered ?? 0;
//   const attendedCount = stats?.total_attended ?? 0;

//   // Note: recommended events not in API, so we show upcoming events as recommended
//   const recommendedEvents = upcomingEvents.slice(2, 6);

//   const calDays = Array.from({ length: 35 }, (_, i) => {
//     const d = new Date(today.getFullYear(), today.getMonth(), 1);
//     d.setDate(1 - d.getDay() + i);
//     return d;
//   });

//   return (
//     <div className="flex-1 bg-gray-50 min-h-screen">
//       {/* Top bar */}
//       <header className="bg-white border-b border-gray-200 px-6 h-14 flex items-center justify-between">
//         <div className="relative flex-1 max-w-md">
//           <input placeholder="Search for events, workshops, or clubs..."
//             className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-1 focus:ring-[#1a2744]/30" />
//           <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
//         </div>
//         <div className="flex items-center gap-3">
//           <button className="h-9 w-9 border border-gray-200 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-50">
//             <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
//           </button>

//         </div>
//       </header>

//       <div className="p-6 flex gap-6">
//         <div className="flex-1 min-w-0">
//           {/* Welcome */}
//           <div className="mb-6">
//             <h1 className="text-2xl font-bold text-gray-900">
//               Welcome back, {user?.full_name?.split(" ")[0] ?? "Alex"}! 👋
//             </h1>
//             <p className="text-gray-500 mt-1">
//               {upcomingEvents.length > 0
//                 ? `You have ${upcomingEvents.length} upcoming events. Here's what's happening on campus.`
//                 : "Explore upcoming events and register for ones you're interested in."}
//             </p>
//           </div>

//           {/* Upcoming Events */}
//           <div className="mb-6">
//             <div className="flex items-center justify-between mb-4">
//               <h2 className="font-bold text-gray-900 flex items-center gap-2">
//                 <CalendarDays className="h-5 w-5 text-gray-500" /> Upcoming Events
//               </h2>
//               <Link href="/dashboard/events" className="text-sm text-gray-500 hover:text-gray-900">View All</Link>
//             </div>
//             {upcomingEvents.length === 0 ? (
//               <div className="grid grid-cols-2 gap-4">
//                 <div className="bg-white rounded-xl border border-gray-200 p-6 text-center text-gray-400 text-sm">
//                   No upcoming events yet. <Link href="/dashboard/events" className="text-[#1a2744] underline">Browse events</Link>
//                 </div>
//               </div>
//             ) : (
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                 {upcomingEvents.slice(0, 2).map((ev, i) => (
//                   <div key={ev.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
//                     <div className="relative h-36 bg-gradient-to-br from-teal-400 to-teal-600">
//                       {ev.banner_image && <Image src={ev.banner_image} alt={ev.title} fill className="object-cover" />}
//                       <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm rounded-md px-2 py-1">
//                         <span className="text-xs font-semibold text-gray-700">{formatDate(ev.event_date)}</span>
//                       </div>
//                     </div>
//                     <div className="p-4">
//                       <div className="flex items-start justify-between gap-2 mb-2">
//                         <h3 className="font-bold text-gray-900 text-sm leading-snug">{ev.title}</h3>
//                         {ev.category && (
//                           <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-700 shrink-0">{ev.category.name}</span>
//                         )}
//                       </div>
//                       <p className="text-xs text-gray-500 flex items-center gap-1 mb-1"><Clock className="h-3 w-3" />{formatDate(ev.event_date)}</p>
//                       <p className="text-xs text-gray-500 flex items-center gap-1 mb-3"><MapPin className="h-3 w-3" />{ev.location}</p>
//                       <Link href={`/events/${ev.id}`}
//                         className="w-full block text-center py-2 border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
//                         View Details
//                       </Link>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>

//           {/* Recommended */}
//           {recommendedEvents.length > 0 && (
//             <div>
//               <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
//                 <TrendingUp className="h-5 w-5 text-gray-500" /> ✦ Recommended For You
//               </h2>
//               <div className="space-y-3">
//                 {recommendedEvents.map((ev) => (
//                   <div key={ev.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4">
//                     <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-teal-400 to-blue-500 shrink-0 overflow-hidden">
//                       {ev.banner_image && <Image src={ev.banner_image} alt={ev.title} width={56} height={56} className="object-cover w-full h-full" />}
//                     </div>
//                     <div className="flex-1 min-w-0">
//                       <p className="text-[10px] font-bold text-[#1a2744] uppercase tracking-wide">{ev.category?.name ?? "Event"}</p>
//                       <p className="font-semibold text-gray-900 text-sm mt-0.5">{ev.title}</p>
//                       <p className="text-xs text-gray-400 mt-0.5">{ev.location}</p>
//                     </div>
//                     <div className="text-right shrink-0">
//                       <p className="text-xs font-bold text-gray-500">{formatDate(ev.event_date).slice(0, 6)}</p>
//                       <Link href={`/events/${ev.id}`}
//                         className="mt-2 h-7 w-7 rounded-full bg-gray-100 hover:bg-[#1a2744] hover:text-white flex items-center justify-center transition-colors">
//                         <Plus className="h-3.5 w-3.5" />
//                       </Link>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Right panel */}
//         <div className="w-72 shrink-0 space-y-4">
//           {/* Notifications */}
//           <div className="bg-white rounded-xl border border-gray-200 p-4">
//             <div className="flex items-center justify-between mb-3">
//               <h3 className="font-bold text-gray-900 text-sm">Recent Notifications</h3>
//               {(dashboard?.unread_notifications ?? 0) > 0 && (
//                 <span className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded font-semibold">New</span>
//               )}
//             </div>
//             {notifications.length > 0 ? (
//               <div className="space-y-3">
//                 {notifications.map((n) => (
//                   <div key={n.id} className="flex items-start gap-3">
//                     <div className="h-8 w-8 rounded-full bg-[#1a2744] flex items-center justify-center shrink-0">
//                       <span className="text-white text-[10px]">📋</span>
//                     </div>
//                     <div className="flex-1 min-w-0">
//                       <p className="text-xs text-gray-700 leading-snug line-clamp-2">{n.title}</p>
//                       <p className="text-[10px] text-gray-400 mt-0.5">{timeAgo(n.created_at)}</p>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             ) : (
//               <p className="text-xs text-gray-400">No recent notifications</p>
//             )}
//             <Link href="/dashboard/notifications"
//               className="w-full block mt-3 py-1.5 text-xs font-semibold text-center text-gray-600 hover:text-gray-900 transition-colors">
//               View All Notifications
//             </Link>
//           </div>

//           {/* Activity Stats */}
//           <div className="bg-[#1a2744] rounded-xl p-4">
//             <div className="flex items-center justify-between mb-3">
//               <h3 className="font-semibold text-white text-sm">Activity Stats</h3>
//               <TrendingUp className="h-4 w-4 text-blue-300" />
//             </div>
//             <div className="grid grid-cols-2 gap-2 mb-4">
//               <div className="bg-white/10 rounded-lg p-3">
//                 <p className="text-blue-300 text-[9px] font-semibold tracking-wide">REGISTERED</p>
//                 <p className="text-2xl font-bold text-white">{registeredCount}</p>
//               </div>
//               <div className="bg-white/10 rounded-lg p-3">
//                 <p className="text-blue-300 text-[9px] font-semibold tracking-wide">ATTENDED</p>
//                 <p className="text-2xl font-bold text-white">{attendedCount}</p>
//               </div>
//             </div>
//             <div>
//               <div className="flex justify-between text-xs mb-1">
//                 <span className="text-blue-200">Profile Completion</span>
//                 <span className="text-white font-semibold">85%</span>
//               </div>
//               <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
//                 <div className="h-full bg-white rounded-full" style={{ width: "85%" }} />
//               </div>
//             </div>
//           </div>

//           {/* Mini Calendar */}
//           <div className="bg-white rounded-xl border border-gray-200 p-4">
//             <div className="flex items-center justify-between mb-3">
//               <h3 className="font-bold text-gray-900 text-sm">
//                 {today.toLocaleString('default', { month: 'long', year: 'numeric' })}
//               </h3>
//               <div className="flex gap-1">
//                 <button className="h-6 w-6 rounded border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 text-xs">‹</button>
//                 <button className="h-6 w-6 rounded border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 text-xs">›</button>
//               </div>
//             </div>
//             <div className="grid grid-cols-7 gap-0.5 text-center">
//               {DAYS.map((d, i) => <div key={i} className="text-[10px] font-semibold text-gray-400 py-1">{d}</div>)}
//               {calDays.map((d, i) => {
//                 const isToday = d.toDateString() === today.toDateString();
//                 const isCurrentMonth = d.getMonth() === today.getMonth();
//                 return (
//                   <div key={i} className={`h-7 w-7 mx-auto flex items-center justify-center rounded-full text-xs cursor-pointer
//                     ${isToday ? "bg-[#1a2744] text-white font-bold" : ""}
//                     ${!isToday && isCurrentMonth ? "text-gray-700 hover:bg-gray-100" : ""}
//                     ${!isCurrentMonth ? "text-gray-300" : ""}
//                   `}>
//                     {d.getDate()}
//                   </div>
//                 );
//               })}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";
// Placement: src/app/dashboard/page.tsx
//
// Changes from previous version:
//   - Uses my_registered_events from getStudentDashboard() for the
//     registered events list (flat shape with event_title, event_date etc.)
//   - Uses recent_notifications from dashboard payload instead of a
//     separate getNotifications() call (reduces one API request)
//   - upcoming_events items have category as UUID string + category_name
//     as flat field — resolved correctly
//   - Stats: total_registered, total_attended, total_cancelled, unread_notifications
//   - No dummy/static data

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { CalendarDays, MapPin, Clock, Plus, TrendingUp, Bell } from "lucide-react";
import { useAuthStore } from "@/context/authStore";
import { getStudentDashboard } from "@/services/userService";
import { formatDate, getInitials, timeAgo, cn } from "@/utils/helpers";
import type { StudentDashboardData, Notification } from "@/types";

// ── MyRegistration shape as returned inside dashboard.my_registered_events ───
interface DashboardRegistration {
  id: string;
  event: string;
  event_title: string;
  event_date: string;
  event_location: string;
  event_poster: string | null;
  status: string;
  registration_date: string;
}

// ── UpcomingEvent shape as returned inside dashboard.upcoming_events ──────────
interface DashboardUpcomingEvent {
  id: string;
  title: string;
  category: string | null;
  category_name?: string;
  event_date: string;
  location: string;
  organizer: string;
  banner_image: string | null;
  status: string;
  registered_count: number;
  is_full: boolean;
  capacity: number;
  max_capacity: number | null;
  registration_fee: string | null;
}

// ── DashboardNotification shape ───────────────────────────────────────────────
interface DashboardNotification {
  id: string;
  title: string;
  message: string;
  notification_type: string;
  is_read: boolean;
  related_event: string | null;
  created_at: string;
}

const DAYS = ["S", "M", "T", "W", "T", "F", "S"];

// Notification type → emoji icon
function notifIcon(type: string): string {
  const map: Record<string, string> = {
    REGISTRATION: "📋",
    CANCELLATION: "❌",
    EVENT_UPDATE: "📝",
    APPROVAL: "✅",
    REJECTION: "🚫",
    BROADCAST: "📢",
    ANNOUNCEMENT: "📣",
    REMINDER: "🔔",
    SYSTEM: "⚙️",
  };
  return map[type] ?? "🔔";
}

export default function StudentDashboard() {
  const { user } = useAuthStore();
  const [dashboard, setDashboard] = useState<StudentDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [today] = useState(new Date());

  useEffect(() => {
    setLoading(true);
    getStudentDashboard()
      .then(setDashboard)
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  // ── Derived data from dashboard response ──────────────────────────────────
  const upcomingEvents =
    (dashboard?.upcoming_events as unknown as DashboardUpcomingEvent[]) ?? [];

  const myRegisteredEvents =
    (dashboard?.my_registered_events as unknown as DashboardRegistration[]) ?? [];

  const recentNotifications =
    (dashboard?.recent_notifications as unknown as DashboardNotification[]) ?? [];

  const stats = dashboard?.stats;
  const registeredCount = stats?.total_registered ?? 0;
  const attendedCount = stats?.total_attended ?? 0;
  const cancelledCount = stats?.total_cancelled ?? 0;
  const unreadNotifCount = dashboard?.unread_notifications ?? 0;

  // Slice: first 2 upcoming for "Upcoming Events" cards,
  // next up to 3 for "Recommended" list
  const upcomingCards = upcomingEvents.slice(0, 2);
  const recommendedList = upcomingEvents.slice(2, 5);

  // Mini calendar
  const calDays = Array.from({ length: 35 }, (_, i) => {
    const d = new Date(today.getFullYear(), today.getMonth(), 1);
    d.setDate(1 - d.getDay() + i);
    return d;
  });

  // Mark days that have an upcoming event
  const eventDates = new Set(
    upcomingEvents.map((e) =>
      new Date(e.event_date).toDateString()
    )
  );

  return (
    <div className="flex-1 bg-gray-50 min-h-screen">
      {/* ── Top bar ─────────────────────────────────────────────────────── */}
      <header className="bg-white border-b border-gray-200 px-6 h-14 flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <input
            placeholder="Search for events, workshops, or clubs..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-1 focus:ring-[#1a2744]/30"
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
          {/* Notification bell with live unread badge */}
          <Link
            href="/dashboard/notifications"
            className="relative h-9 w-9 border border-gray-200 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors"
          >
            <Bell className="h-5 w-5" />
            {unreadNotifCount > 0 && (
              <span className="absolute -top-1 -right-1 h-4 min-w-4 px-0.5 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {unreadNotifCount}
              </span>
            )}
          </Link>
          <button className="h-9 w-9 border border-gray-200 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-50">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </header>

      <div className="p-6 flex gap-6">
        {/* ── Main column ──────────────────────────────────────────────── */}
        <div className="flex-1 min-w-0">
          {/* Welcome */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back,{" "}
              {(dashboard?.user?.full_name ?? user?.full_name)?.split(" ")[0] ?? "Student"}! 👋
            </h1>
            <p className="text-gray-500 mt-1">
              {upcomingEvents.length > 0
                ? `You have ${upcomingEvents.length} upcoming event${upcomingEvents.length !== 1 ? "s" : ""}. Here's what's happening on campus.`
                : "Explore upcoming events and register for ones you're interested in."}
            </p>
          </div>

          {/* ── Upcoming Events cards ─────────────────────────────────── */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900 flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-gray-500" /> Upcoming Events
              </h2>
              <Link href="/dashboard/events" className="text-sm text-gray-500 hover:text-gray-900">
                View All
              </Link>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 gap-4">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse">
                    <div className="h-36 bg-gray-100" />
                    <div className="p-4 space-y-2">
                      <div className="h-4 bg-gray-100 rounded w-3/4" />
                      <div className="h-3 bg-gray-50 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : upcomingCards.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-6 text-center text-gray-400 text-sm">
                No upcoming events yet.{" "}
                <Link href="/dashboard/events" className="text-[#1a2744] underline">
                  Browse events
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {upcomingCards.map((ev) => (
                  <div
                    key={ev.id}
                    className="bg-white rounded-xl border border-gray-200 overflow-hidden"
                  >
                    <div className="relative h-36 bg-gradient-to-br from-teal-400 to-teal-600">
                      {ev.banner_image && (
                        <Image
                          src={ev.banner_image}
                          alt={ev.title}
                          fill
                          className="object-cover"
                        />
                      )}
                      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm rounded-md px-2 py-1">
                        <span className="text-xs font-semibold text-gray-700">
                          {formatDate(ev.event_date)}
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-bold text-gray-900 text-sm leading-snug">
                          {ev.title}
                        </h3>
                        {ev.category_name && (
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-700 shrink-0">
                            {ev.category_name}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mb-1">
                        <Clock className="h-3 w-3" />
                        {formatDate(ev.event_date)}
                      </p>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mb-3">
                        <MapPin className="h-3 w-3" />
                        {ev.location}
                      </p>
                      <Link
                        href={`/events/${ev.id}`}
                        className="w-full block text-center py-2 border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── My Registered Events (quick list) ────────────────────── */}
          {myRegisteredEvents.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-gray-900">My Registrations</h2>
                <Link
                  href="/dashboard/my-events"
                  className="text-sm text-gray-500 hover:text-gray-900"
                >
                  View All
                </Link>
              </div>
              <div className="space-y-2">
                {myRegisteredEvents.slice(0, 3).map((reg) => (
                  <div
                    key={reg.id}
                    className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4"
                  >
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-teal-400 to-blue-500 shrink-0 overflow-hidden">
                      {reg.event_poster && (
                        <Image
                          src={reg.event_poster}
                          alt={reg.event_title}
                          width={48}
                          height={48}
                          className="object-cover w-full h-full"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm truncate">
                        {reg.event_title}
                      </p>
                      <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="h-3 w-3" />
                        {reg.event_location}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-semibold text-gray-500">
                        {formatDate(reg.event_date)}
                      </p>
                      <span
                        className={cn(
                          "text-[10px] font-bold uppercase px-2 py-0.5 rounded mt-1 inline-block",
                          reg.status === "REGISTERED" || reg.status === "CONFIRMED"
                            ? "bg-green-100 text-green-700"
                            : reg.status === "CANCELLED"
                              ? "bg-red-100 text-red-600"
                              : "bg-gray-100 text-gray-600"
                        )}
                      >
                        {reg.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Recommended ─────────────────────────────────────────── */}
          {recommendedList.length > 0 && (
            <div>
              <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-gray-500" /> ✦ Recommended For You
              </h2>
              <div className="space-y-3">
                {recommendedList.map((ev) => (
                  <div
                    key={ev.id}
                    className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4"
                  >
                    <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-teal-400 to-blue-500 shrink-0 overflow-hidden">
                      {ev.banner_image && (
                        <Image
                          src={ev.banner_image}
                          alt={ev.title}
                          width={56}
                          height={56}
                          className="object-cover w-full h-full"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold text-[#1a2744] uppercase tracking-wide">
                        {ev.category_name ?? "Event"}
                      </p>
                      <p className="font-semibold text-gray-900 text-sm mt-0.5">{ev.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{ev.location}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-bold text-gray-500">
                        {formatDate(ev.event_date).slice(0, 6)}
                      </p>
                      <Link
                        href={`/events/${ev.id}`}
                        className="mt-2 h-7 w-7 rounded-full bg-gray-100 hover:bg-[#1a2744] hover:text-white flex items-center justify-center transition-colors"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Right panel ──────────────────────────────────────────────── */}
        <div className="w-72 shrink-0 space-y-4">
          {/* Recent Notifications — from dashboard.recent_notifications */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-gray-900 text-sm">Recent Notifications</h3>
              {unreadNotifCount > 0 && (
                <span className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded font-semibold">
                  {unreadNotifCount} New
                </span>
              )}
            </div>

            {loading ? (
              <div className="space-y-3 animate-pulse">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="h-8 w-8 bg-gray-100 rounded-full shrink-0" />
                    <div className="flex-1 space-y-1">
                      <div className="h-3 bg-gray-100 rounded w-3/4" />
                      <div className="h-2 bg-gray-50 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : recentNotifications.length > 0 ? (
              <div className="space-y-3">
                {recentNotifications.slice(0, 4).map((n) => (
                  <div key={n.id} className="flex items-start gap-3">
                    <div
                      className={cn(
                        "h-8 w-8 rounded-full flex items-center justify-center shrink-0",
                        n.is_read ? "bg-gray-100" : "bg-[#1a2744]"
                      )}
                    >
                      <span className="text-[11px]">
                        {notifIcon(n.notification_type)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={cn(
                          "text-xs leading-snug line-clamp-2",
                          n.is_read ? "text-gray-500" : "text-gray-700 font-medium"
                        )}
                      >
                        {n.title}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        {timeAgo(n.created_at)}
                      </p>
                    </div>
                    {!n.is_read && (
                      <div className="h-2 w-2 rounded-full bg-blue-500 shrink-0 mt-1" />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400">No recent notifications</p>
            )}

            <Link
              href="/dashboard/notifications"
              className="w-full block mt-3 py-1.5 text-xs font-semibold text-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              View All Notifications
            </Link>
          </div>

          {/* Activity Stats — all real data */}
          <div className="bg-[#1a2744] rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-white text-sm">Activity Stats</h3>
              <TrendingUp className="h-4 w-4 text-blue-300" />
            </div>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="bg-white/10 rounded-lg p-3">
                <p className="text-blue-300 text-[9px] font-semibold tracking-wide">REGISTERED</p>
                <p className="text-2xl font-bold text-white">
                  {loading ? (
                    <span className="inline-block h-7 w-8 bg-white/10 rounded animate-pulse" />
                  ) : registeredCount}
                </p>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <p className="text-blue-300 text-[9px] font-semibold tracking-wide">ATTENDED</p>
                <p className="text-2xl font-bold text-white">
                  {loading ? (
                    <span className="inline-block h-7 w-8 bg-white/10 rounded animate-pulse" />
                  ) : attendedCount}
                </p>
              </div>
            </div>
            {/* Cancelled count */}
            {cancelledCount > 0 && (
              <div className="bg-white/10 rounded-lg p-2 mb-3 flex items-center justify-between">
                <p className="text-blue-300 text-[9px] font-semibold tracking-wide">CANCELLED</p>
                <p className="text-sm font-bold text-white">{cancelledCount}</p>
              </div>
            )}
            {/* Profile completion indicator */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-blue-200">Attendance Rate</span>
                <span className="text-white font-semibold">
                  {registeredCount > 0
                    ? `${Math.round((attendedCount / registeredCount) * 100)}%`
                    : "—"}
                </span>
              </div>
              <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all duration-500"
                  style={{
                    width: registeredCount > 0
                      ? `${Math.min(100, Math.round((attendedCount / registeredCount) * 100))}%`
                      : "0%",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Mini Calendar — event dots on days with events */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-gray-900 text-sm">
                {today.toLocaleString("default", { month: "long", year: "numeric" })}
              </h3>
              <div className="flex gap-1">
                <button className="h-6 w-6 rounded border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 text-xs">
                  ‹
                </button>
                <button className="h-6 w-6 rounded border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 text-xs">
                  ›
                </button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-0.5 text-center">
              {DAYS.map((d, i) => (
                <div key={i} className="text-[10px] font-semibold text-gray-400 py-1">
                  {d}
                </div>
              ))}
              {calDays.map((d, i) => {
                const isToday = d.toDateString() === today.toDateString();
                const isCurrent = d.getMonth() === today.getMonth();
                const hasEvent = eventDates.has(d.toDateString());
                return (
                  <div
                    key={i}
                    className={cn(
                      "h-7 w-7 mx-auto flex flex-col items-center justify-center rounded-full text-xs cursor-pointer relative",
                      isToday && "bg-[#1a2744] text-white font-bold",
                      !isToday && isCurrent && "text-gray-700 hover:bg-gray-100",
                      !isCurrent && "text-gray-300"
                    )}
                  >
                    {d.getDate()}
                    {/* Event dot */}
                    {hasEvent && !isToday && (
                      <span className="absolute bottom-0.5 h-1 w-1 rounded-full bg-blue-500" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}