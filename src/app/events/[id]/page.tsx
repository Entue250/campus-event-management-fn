// "use client";
// // Placement: src/app/events/[id]/page.tsx
// //
// // Changes from previous version:
// //   1. Back button — uses router.back() so it works from any referrer
// //   2. Tags display — renders comma-separated tags as pill badges below the description
// //   3. Attendance count fix — uses registered_count (from API) instead of
// //      registration_count (which was always 0 on the detail endpoint).
// //      Falls back through: registered_count → registration_count → 0

// import { useEffect, useState } from "react";
// import Image from "next/image";
// import Link from "next/link";
// import { useParams, useRouter } from "next/navigation";
// import {
//   GraduationCap,
//   MapPin,
//   Users,
//   Ticket,
//   CheckCircle,
//   Calendar,
//   ArrowLeft,
//   Tag,
// } from "lucide-react";
// import {
//   getEvent,
//   registerForEvent,
//   getRegistrationStatus,
//   getEvents,
// } from "@/services/eventService";
// import { extractErrorMessage } from "@/utils/helpers";
// import type { Event } from "@/types";
// import toast from "react-hot-toast";

// // Extended shape that covers extra fields returned by various endpoints
// interface EventDetail extends Event {
//   category_name?: string;
//   capacity?: number;
//   available_spots?: number | null;
//   registered_count?: number;  // returned by admin/list endpoints
//   is_registered?: boolean;
//   created_by_name?: string;
//   poster_image?: string | null;
// }

// export default function EventDetailPage() {
//   const { id } = useParams<{ id: string }>();
//   const router = useRouter();

//   const [event, setEvent] = useState<EventDetail | null>(null);
//   const [relatedEvents, setRelatedEvents] = useState<EventDetail[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [registered, setRegistered] = useState(false);
//   const [registering, setRegistering] = useState(false);
//   const [countdown, setCountdown] = useState({
//     days: 0, hours: 0, mins: 0, secs: 0,
//   });

//   const currentYear = new Date().getFullYear();

//   // ── Load event + registration status ────────────────────────────────────
//   useEffect(() => {
//     if (!id) return;

//     Promise.all([
//       getEvent(id) as Promise<EventDetail>,
//       getRegistrationStatus(id).catch(
//         (): { is_registered: boolean; registration: null } => ({
//           is_registered: false,
//           registration: null,
//         })
//       ),
//     ])
//       .then(([ev, status]) => {
//         setEvent(ev);

//         // Prefer is_registered baked into the event detail, fall back to status endpoint
//         const isReg = ev.is_registered ?? status?.is_registered ?? false;
//         setRegistered(isReg);

//         // Related events in the same category
//         const catId =
//           typeof ev.category === "object" && ev.category !== null
//             ? ev.category.id
//             : (ev.category as string | undefined);

//         if (catId) {
//           getEvents({ category: catId, page: 1 })
//             .then((res) => {
//               const others = (res.results as EventDetail[])
//                 .filter((e) => e.id !== id)
//                 .slice(0, 3);
//               setRelatedEvents(others);
//             })
//             .catch(() => { });
//         }
//       })
//       .catch(() => { })
//       .finally(() => setLoading(false));
//   }, [id]);

//   // ── Countdown timer ──────────────────────────────────────────────────────
//   useEffect(() => {
//     if (!event) return;
//     const tick = () => {
//       const diff = new Date(event.event_date).getTime() - Date.now();
//       if (diff <= 0) return;
//       setCountdown({
//         days: Math.floor(diff / 86400000),
//         hours: Math.floor((diff % 86400000) / 3600000),
//         mins: Math.floor((diff % 3600000) / 60000),
//         secs: Math.floor((diff % 60000) / 1000),
//       });
//     };
//     tick();
//     const timer = setInterval(tick, 1000);
//     return () => clearInterval(timer);
//   }, [event]);

//   // ── Register handler ─────────────────────────────────────────────────────
//   const handleRegister = async () => {
//     if (!event) return;
//     setRegistering(true);
//     try {
//       await registerForEvent(event.id);
//       setRegistered(true);
//       // Bump the local registered count so the UI reflects the new registration immediately
//       setEvent((prev) =>
//         prev
//           ? {
//             ...prev,
//             registered_count: (prev.registered_count ?? 0) + 1,
//             registration_count: (prev.registration_count ?? 0) + 1,
//           }
//           : prev
//       );
//       toast.success("You're registered!");
//     } catch (err) {
//       toast.error(extractErrorMessage(err));
//     } finally {
//       setRegistering(false);
//     }
//   };

//   // ── Loading / not-found states ───────────────────────────────────────────
//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50">
//         <div className="animate-pulse text-gray-400">Loading event...</div>
//       </div>
//     );
//   }
//   if (!event) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50">
//         <div className="text-center">
//           <p className="text-gray-500 mb-4">Event not found</p>
//           <button
//             onClick={() => router.back()}
//             className="flex items-center gap-2 px-4 py-2 bg-[#1a2744] text-white text-sm font-semibold rounded-lg mx-auto"
//           >
//             <ArrowLeft className="h-4 w-4" /> Go Back
//           </button>
//         </div>
//       </div>
//     );
//   }

//   // ── Derived display values ───────────────────────────────────────────────
//   const categoryLabel =
//     event.category_name ??
//     (typeof event.category === "object" && event.category !== null
//       ? event.category.name
//       : null) ??
//     null;

//   const capacityNum = event.capacity ?? event.max_capacity ?? null;
//   const availableSpots = event.available_spots ?? null;
//   const organizerName = event.organizer ?? "University Events Team";
//   const createdByName = event.created_by_name ?? null;
//   const bannerImage = event.banner_image ?? event.poster_image ?? null;

//   // Attendance: prefer registered_count (list endpoint), fall back to
//   // registration_count (detail endpoint), then 0.
//   const attendanceCount =
//     event.registered_count ?? event.registration_count ?? 0;

//   // Tags: split comma-separated string into individual pill labels
//   const tagList: string[] =
//     event.tags
//       ? event.tags
//         .split(",")
//         .map((t) => t.trim())
//         .filter(Boolean)
//       : [];

//   // Schedule rows derived from event dates
//   const startDate = new Date(event.event_date);
//   const endDate = event.end_date ? new Date(event.end_date) : null;
//   const fmtTime = (d: Date) =>
//     d.toLocaleTimeString("en", {
//       hour: "2-digit",
//       minute: "2-digit",
//       hour12: true,
//     });

//   const sameTime = endDate && startDate.getTime() === endDate.getTime();
//   const scheduleRows =
//     sameTime || !endDate
//       ? [{ time: fmtTime(startDate), title: event.title, speaker: organizerName }]
//       : [
//         { time: fmtTime(startDate), title: "Event Begins", speaker: organizerName },
//         { time: fmtTime(endDate), title: "Event Concludes", speaker: organizerName },
//       ];

//   return (
//     <div className="min-h-screen bg-white">
//       {/* ── Navbar ────────────────────────────────────────────────────────── */}
//       <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
//         <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
//           {/* Back button + logo + title */}
//           <div className="flex items-center gap-3">
//             {/* Back button — returns to wherever the user came from */}
//             <button
//               onClick={() => router.back()}
//               className="flex items-center justify-center h-8 w-8 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors shrink-0"
//               aria-label="Go back"
//             >
//               <ArrowLeft className="h-4 w-4" />
//             </button>

//             <div className="flex items-center gap-2">
//               <div className="h-8 w-8 rounded-lg bg-[#1a2744] flex items-center justify-center">
//                 <GraduationCap style={{ height: 16, width: 16, color: "white" }} />
//               </div>
//               <span className="font-semibold text-gray-900 text-sm truncate max-w-xs">
//                 {event.title}
//               </span>
//             </div>
//           </div>

//           <div className="flex items-center gap-4 text-sm text-gray-600">
//             <a href="#details" className="hover:text-gray-900">Details</a>
//             <a href="#schedule" className="hover:text-gray-900">Schedule</a>
//             <a href="#organizer" className="hover:text-gray-900">Organizer</a>
//             <button
//               onClick={handleRegister}
//               disabled={registered || registering}
//               className="px-4 py-1.5 bg-[#1a2744] text-white text-sm font-semibold rounded-lg hover:bg-[#0f1a35] disabled:opacity-60 transition-colors"
//             >
//               {registered ? "Registered ✓" : "Register"}
//             </button>
//           </div>
//         </div>
//       </nav>

//       <div className="max-w-4xl mx-auto px-4 py-6">
//         {/* ── Hero image ──────────────────────────────────────────────────── */}
//         <div className="relative rounded-2xl overflow-hidden h-72 bg-gradient-to-br from-teal-800 to-slate-900 mb-6">
//           {bannerImage && (
//             <Image src={bannerImage} alt={event.title} fill className="object-cover" />
//           )}
//           <div className="absolute inset-0 bg-black/40" />
//           <div className="absolute inset-0 p-8 flex flex-col justify-end">
//             {categoryLabel && (
//               <span className="inline-block bg-white/20 text-white text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full w-fit mb-3 backdrop-blur-sm">
//                 {categoryLabel}
//               </span>
//             )}
//             <h1 className="text-3xl font-bold text-white mb-2">{event.title}</h1>
//             <p className="text-white/80 text-sm max-w-lg line-clamp-2">
//               {event.description}
//             </p>
//           </div>
//           <div className="absolute bottom-6 right-6 text-right">
//             <button
//               onClick={handleRegister}
//               disabled={registered || registering}
//               className="px-6 py-2.5 bg-white text-[#1a2744] font-bold rounded-xl hover:bg-gray-100 disabled:opacity-60 transition-colors text-sm"
//             >
//               {registered ? "Registered ✓" : "Register Now"}
//             </button>
//             <p className="text-white/70 text-xs mt-1">
//               {availableSpots !== null
//                 ? `${availableSpots} spot${availableSpots !== 1 ? "s" : ""} remaining`
//                 : "Limited seats remaining"}
//             </p>
//           </div>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//           {/* ── Left column ─────────────────────────────────────────────── */}
//           <div className="lg:col-span-2 space-y-6" id="details">
//             {/* Full description */}
//             <div className="bg-white rounded-xl border border-gray-100 p-6">
//               <h2 className="font-bold text-gray-900 text-lg mb-3 flex items-center gap-2">
//                 <span className="h-5 w-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
//                   i
//                 </span>
//                 Full Description
//               </h2>
//               <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
//                 {event.description}
//               </p>

//               {/* ── Tags section (new) ──────────────────────────────────── */}
//               {tagList.length > 0 && (
//                 <div className="mt-4 pt-4 border-t border-gray-100">
//                   <div className="flex items-center gap-2 mb-2">
//                     <Tag className="h-3.5 w-3.5 text-gray-400" />
//                     <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
//                       Tags
//                     </p>
//                   </div>
//                   <div className="flex flex-wrap gap-2">
//                     {tagList.map((tag) => (
//                       <span
//                         key={tag}
//                         className="inline-block bg-gray-100 text-gray-600 text-xs font-medium px-2.5 py-1 rounded-full"
//                       >
//                         {tag}
//                       </span>
//                     ))}
//                   </div>
//                 </div>
//               )}
//             </div>

//             {/* Schedule */}
//             <div className="bg-white rounded-xl border border-gray-100 p-6" id="schedule">
//               <h2 className="font-bold text-gray-900 text-lg mb-1 flex items-center gap-2">
//                 <Calendar className="h-5 w-5 text-gray-500" /> Event Schedule
//               </h2>
//               <p className="text-xs text-gray-400 mb-4">
//                 {startDate.toLocaleDateString("en", {
//                   weekday: "long",
//                   year: "numeric",
//                   month: "long",
//                   day: "numeric",
//                 })}
//               </p>
//               <table className="w-full text-sm">
//                 <thead>
//                   <tr className="border-b border-gray-100">
//                     <th className="text-left py-2 pr-4 text-gray-400 font-medium text-xs uppercase">Time</th>
//                     <th className="text-left py-2 pr-4 text-gray-400 font-medium text-xs uppercase">Session</th>
//                     <th className="text-left py-2 text-gray-400 font-medium text-xs uppercase">Organizer</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {scheduleRows.map((row) => (
//                     <tr key={row.time} className="border-b border-gray-50">
//                       <td className="py-3 pr-4 text-gray-500 whitespace-nowrap">{row.time}</td>
//                       <td className="py-3 pr-4 font-medium text-gray-900">{row.title}</td>
//                       <td className="py-3 text-gray-500">{row.speaker}</td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>

//             {/* Organizer */}
//             <div className="bg-white rounded-xl border border-gray-100 p-6" id="organizer">
//               <h2 className="font-bold text-gray-900 text-lg mb-4">Organizer Info</h2>
//               <div className="flex items-start gap-4">
//                 <div className="h-16 w-16 rounded-full bg-[#1a2744] flex items-center justify-center shrink-0">
//                   <GraduationCap className="h-8 w-8 text-white" />
//                 </div>
//                 <div>
//                   <h3 className="font-bold text-gray-900">{organizerName}</h3>
//                   {createdByName && (
//                     <p className="text-xs text-gray-400 mt-0.5">
//                       Coordinated by{" "}
//                       <span className="font-medium text-gray-600">{createdByName}</span>
//                     </p>
//                   )}
//                   {categoryLabel && (
//                     <span className="inline-block mt-2 text-[10px] font-semibold uppercase tracking-wide bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
//                       {categoryLabel}
//                     </span>
//                   )}
//                   <p className="text-sm text-gray-500 mt-2 max-w-md">
//                     Organizing meaningful campus experiences for students, faculty,
//                     and the wider university community.
//                   </p>
//                   <div className="flex items-center gap-4 mt-3">
//                     <button className="text-sm text-gray-700 underline hover:no-underline">
//                       Visit Website
//                     </button>
//                     <button className="text-sm text-gray-700 underline hover:no-underline">
//                       Contact Support
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* ── Right column ────────────────────────────────────────────── */}
//           <div className="space-y-4">
//             {/* Countdown */}
//             <div className="bg-white rounded-xl border border-gray-100 p-5">
//               <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide text-center mb-4">
//                 Event Starts In
//               </p>
//               <div className="grid grid-cols-4 gap-1">
//                 {(
//                   [
//                     ["DAYS", countdown.days],
//                     ["HOURS", countdown.hours],
//                     ["MINS", countdown.mins],
//                     ["SECS", countdown.secs],
//                   ] as [string, number][]
//                 ).map(([label, val]) => (
//                   <div key={label} className="text-center bg-gray-50 rounded-lg py-2">
//                     <p className="text-xl font-bold text-gray-900">
//                       {String(val).padStart(2, "0")}
//                     </p>
//                     <p className="text-[9px] text-gray-400 uppercase mt-0.5">{label}</p>
//                   </div>
//                 ))}
//               </div>
//             </div>

//             {/* Event info */}
//             <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
//               {/* Location */}
//               <div className="flex items-start gap-3">
//                 <MapPin className="h-5 w-5 text-gray-400 shrink-0 mt-0.5" />
//                 <div>
//                   <p className="text-xs text-gray-400 uppercase font-medium tracking-wide">
//                     Location
//                   </p>
//                   <p className="text-sm font-semibold text-gray-900 mt-0.5">
//                     {event.location}
//                   </p>
//                 </div>
//               </div>

//               {/* Attendance — uses attendanceCount which prefers registered_count */}
//               <div className="flex items-start gap-3">
//                 <Users className="h-5 w-5 text-gray-400 shrink-0 mt-0.5" />
//                 <div>
//                   <p className="text-xs text-gray-400 uppercase font-medium tracking-wide">
//                     Attendance
//                   </p>
//                   <p className="text-sm font-semibold text-gray-900 mt-0.5">
//                     {capacityNum
//                       ? `${attendanceCount} / ${capacityNum} registered`
//                       : "Open Attendance"}
//                   </p>
//                   {availableSpots !== null && capacityNum && (
//                     <p className="text-xs text-gray-400 mt-0.5">
//                       {availableSpots} spots left
//                     </p>
//                   )}
//                 </div>
//               </div>

//               {/* Ticket price */}
//               <div className="flex items-start gap-3">
//                 <Ticket className="h-5 w-5 text-gray-400 shrink-0 mt-0.5" />
//                 <div>
//                   <p className="text-xs text-gray-400 uppercase font-medium tracking-wide">
//                     Ticket Price
//                   </p>
//                   <p className="text-sm font-semibold text-gray-900 mt-0.5">
//                     {event.registration_fee &&
//                       parseFloat(String(event.registration_fee)) > 0
//                       ? `$${event.registration_fee}`
//                       : "Free Entry"}
//                   </p>
//                 </div>
//               </div>
//             </div>

//             {/* Register CTA */}
//             {!registered ? (
//               <button
//                 onClick={handleRegister}
//                 disabled={registering}
//                 className="w-full py-3 bg-[#1a2744] text-white font-bold rounded-xl hover:bg-[#0f1a35] disabled:opacity-60 transition-colors"
//               >
//                 {registering ? "Registering..." : "Register Now"}
//               </button>
//             ) : (
//               <div className="w-full py-3 bg-green-50 border border-green-200 rounded-xl flex items-center justify-center gap-2 text-green-700 font-semibold">
//                 <CheckCircle className="h-5 w-5" /> Registered!
//               </div>
//             )}

//             {/* Related events */}
//             <div className="bg-white rounded-xl border border-gray-100 p-5">
//               <h3 className="font-semibold text-gray-900 mb-3 text-sm">
//                 Related Events
//               </h3>
//               {relatedEvents.length === 0 ? (
//                 <p className="text-xs text-gray-400">
//                   No related events at the moment.
//                 </p>
//               ) : (
//                 <div className="space-y-3">
//                   {relatedEvents.map((re) => {
//                     const rd = new Date(re.event_date);
//                     const rBanner = re.banner_image ?? re.poster_image ?? null;
//                     return (
//                       <Link
//                         key={re.id}
//                         href={`/events/${re.id}`}
//                         className="flex items-center gap-3 group"
//                       >
//                         <div className="h-10 w-10 rounded-lg bg-gray-800 shrink-0 overflow-hidden relative">
//                           {rBanner ? (
//                             <Image
//                               src={rBanner}
//                               alt={re.title}
//                               fill
//                               className="object-cover"
//                             />
//                           ) : (
//                             <div className="h-full w-full bg-gradient-to-br from-[#1a2744] to-slate-700 flex items-center justify-center">
//                               <Calendar className="h-4 w-4 text-white/50" />
//                             </div>
//                           )}
//                         </div>
//                         <div className="min-w-0">
//                           <p className="text-sm font-medium text-gray-900 leading-tight line-clamp-1 group-hover:text-[#1a2744] transition-colors">
//                             {re.title}
//                           </p>
//                           <p className="text-xs text-gray-400">
//                             {rd.toLocaleDateString("en", {
//                               month: "short",
//                               day: "numeric",
//                               year: "numeric",
//                             })}
//                           </p>
//                         </div>
//                       </Link>
//                     );
//                   })}
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* ── Footer ────────────────────────────────────────────────────────── */}
//       <footer className="border-t border-gray-100 py-4 mt-8 bg-white">
//         <p className="text-center text-xs text-gray-400">
//           © {currentYear} University Events Committee. All rights reserved.
//         </p>
//       </footer>
//     </div>
//   );
// }

"use client";
// Placement: src/app/events/[id]/page.tsx
//
// Changes from previous version:
//   1. Back button — uses router.back() so it works from any referrer
//   2. Tags display — renders comma-separated tags as pill badges below the description
//   3. Attendance count fix — uses registered_count (from API) instead of
//      registration_count (which was always 0 on the detail endpoint).
//      Falls back through: registered_count → registration_count → 0

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  GraduationCap,
  MapPin,
  Users,
  Ticket,
  CheckCircle,
  Calendar,
  ArrowLeft,
  Tag,
} from "lucide-react";
import {
  getEvent,
  registerForEvent,
  getRegistrationStatus,
  getEvents,
} from "@/services/eventService";
import { extractErrorMessage } from "@/utils/helpers";
import type { Event } from "@/types";
import toast from "react-hot-toast";

// Extended shape that covers extra fields returned by various endpoints
interface EventDetail extends Event {
  category_name?: string;
  capacity?: number;
  available_spots?: number | null;
  registered_count?: number;  // returned by admin/list endpoints
  is_registered?: boolean;
  created_by_name?: string;
  poster_image?: string | null;
}

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [event, setEvent] = useState<EventDetail | null>(null);
  const [relatedEvents, setRelatedEvents] = useState<EventDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [registered, setRegistered] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [countdown, setCountdown] = useState({
    days: 0, hours: 0, mins: 0, secs: 0,
  });

  const currentYear = new Date().getFullYear();

  // ── Load event + registration status ────────────────────────────────────
  useEffect(() => {
    if (!id) return;

    Promise.all([
      getEvent(id) as Promise<EventDetail>,
      getRegistrationStatus(id).catch(
        (): { is_registered: boolean; registration: null } => ({
          is_registered: false,
          registration: null,
        })
      ),
    ])
      .then(([ev, status]) => {
        setEvent(ev);

        // Prefer is_registered baked into the event detail, fall back to status endpoint
        const isReg = ev.is_registered ?? status?.is_registered ?? false;
        setRegistered(isReg);

        // Related events in the same category
        // ev.category is typed as Category | null — never a raw string on this endpoint,
        // so we only read the id when it is a non-null object.
        const catId =
          ev.category !== null && typeof ev.category === "object"
            ? ev.category.id
            : undefined;

        if (catId) {
          getEvents({ category: catId, page: 1 })
            .then((res) => {
              const others = (res.results as EventDetail[])
                .filter((e) => e.id !== id)
                .slice(0, 3);
              setRelatedEvents(others);
            })
            .catch(() => { });
        }
      })
      .catch(() => { })
      .finally(() => setLoading(false));
  }, [id]);

  // ── Countdown timer ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!event) return;
    const tick = () => {
      const diff = new Date(event.event_date).getTime() - Date.now();
      if (diff <= 0) return;
      setCountdown({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        mins: Math.floor((diff % 3600000) / 60000),
        secs: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [event]);

  // ── Register handler ─────────────────────────────────────────────────────
  const handleRegister = async () => {
    if (!event) return;
    setRegistering(true);
    try {
      await registerForEvent(event.id);
      setRegistered(true);
      // Bump the local registered count so the UI reflects the new registration immediately
      setEvent((prev) =>
        prev
          ? {
            ...prev,
            registered_count: (prev.registered_count ?? 0) + 1,
            registration_count: (prev.registration_count ?? 0) + 1,
          }
          : prev
      );
      toast.success("You're registered!");
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setRegistering(false);
    }
  };

  // ── Loading / not-found states ───────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse text-gray-400">Loading event...</div>
      </div>
    );
  }
  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Event not found</p>
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 px-4 py-2 bg-[#1a2744] text-white text-sm font-semibold rounded-lg mx-auto"
          >
            <ArrowLeft className="h-4 w-4" /> Go Back
          </button>
        </div>
      </div>
    );
  }

  // ── Derived display values ───────────────────────────────────────────────
  const categoryLabel =
    event.category_name ??
    (typeof event.category === "object" && event.category !== null
      ? event.category.name
      : null) ??
    null;

  const capacityNum = event.capacity ?? event.max_capacity ?? null;
  const availableSpots = event.available_spots ?? null;
  const organizerName = event.organizer ?? "University Events Team";
  const createdByName = event.created_by_name ?? null;
  const bannerImage = event.banner_image ?? event.poster_image ?? null;

  // Attendance: prefer registered_count (list endpoint), fall back to
  // registration_count (detail endpoint), then 0.
  const attendanceCount =
    event.registered_count ?? event.registration_count ?? 0;

  // Tags: split comma-separated string into individual pill labels
  const tagList: string[] =
    event.tags
      ? event.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
      : [];

  // Schedule rows derived from event dates
  const startDate = new Date(event.event_date);
  const endDate = event.end_date ? new Date(event.end_date) : null;
  const fmtTime = (d: Date) =>
    d.toLocaleTimeString("en", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

  const sameTime = endDate && startDate.getTime() === endDate.getTime();
  const scheduleRows =
    sameTime || !endDate
      ? [{ time: fmtTime(startDate), title: event.title, speaker: organizerName }]
      : [
        { time: fmtTime(startDate), title: "Event Begins", speaker: organizerName },
        { time: fmtTime(endDate), title: "Event Concludes", speaker: organizerName },
      ];

  return (
    <div className="min-h-screen bg-white">
      {/* ── Navbar ────────────────────────────────────────────────────────── */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          {/* Back button + logo + title */}
          <div className="flex items-center gap-3">
            {/* Back button — returns to wherever the user came from */}
            <button
              onClick={() => router.back()}
              className="flex items-center justify-center h-8 w-8 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors shrink-0"
              aria-label="Go back"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-[#1a2744] flex items-center justify-center">
                <GraduationCap style={{ height: 16, width: 16, color: "white" }} />
              </div>
              <span className="font-semibold text-gray-900 text-sm truncate max-w-xs">
                {event.title}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-600">
            <a href="#details" className="hover:text-gray-900">Details</a>
            <a href="#schedule" className="hover:text-gray-900">Schedule</a>
            <a href="#organizer" className="hover:text-gray-900">Organizer</a>
            <button
              onClick={handleRegister}
              disabled={registered || registering}
              className="px-4 py-1.5 bg-[#1a2744] text-white text-sm font-semibold rounded-lg hover:bg-[#0f1a35] disabled:opacity-60 transition-colors"
            >
              {registered ? "Registered ✓" : "Register"}
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* ── Hero image ──────────────────────────────────────────────────── */}
        <div className="relative rounded-2xl overflow-hidden h-72 bg-gradient-to-br from-teal-800 to-slate-900 mb-6">
          {bannerImage && (
            <Image src={bannerImage} alt={event.title} fill className="object-cover" />
          )}
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-0 p-8 flex flex-col justify-end">
            {categoryLabel && (
              <span className="inline-block bg-white/20 text-white text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full w-fit mb-3 backdrop-blur-sm">
                {categoryLabel}
              </span>
            )}
            <h1 className="text-3xl font-bold text-white mb-2">{event.title}</h1>
            <p className="text-white/80 text-sm max-w-lg line-clamp-2">
              {event.description}
            </p>
          </div>
          <div className="absolute bottom-6 right-6 text-right">
            <button
              onClick={handleRegister}
              disabled={registered || registering}
              className="px-6 py-2.5 bg-white text-[#1a2744] font-bold rounded-xl hover:bg-gray-100 disabled:opacity-60 transition-colors text-sm"
            >
              {registered ? "Registered ✓" : "Register Now"}
            </button>
            <p className="text-white/70 text-xs mt-1">
              {availableSpots !== null
                ? `${availableSpots} spot${availableSpots !== 1 ? "s" : ""} remaining`
                : "Limited seats remaining"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── Left column ─────────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-6" id="details">
            {/* Full description */}
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h2 className="font-bold text-gray-900 text-lg mb-3 flex items-center gap-2">
                <span className="h-5 w-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                  i
                </span>
                Full Description
              </h2>
              <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
                {event.description}
              </p>

              {/* ── Tags section (new) ──────────────────────────────────── */}
              {tagList.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Tag className="h-3.5 w-3.5 text-gray-400" />
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                      Tags
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {tagList.map((tag) => (
                      <span
                        key={tag}
                        className="inline-block bg-gray-100 text-gray-600 text-xs font-medium px-2.5 py-1 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Schedule */}
            <div className="bg-white rounded-xl border border-gray-100 p-6" id="schedule">
              <h2 className="font-bold text-gray-900 text-lg mb-1 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-gray-500" /> Event Schedule
              </h2>
              <p className="text-xs text-gray-400 mb-4">
                {startDate.toLocaleDateString("en", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-2 pr-4 text-gray-400 font-medium text-xs uppercase">Time</th>
                    <th className="text-left py-2 pr-4 text-gray-400 font-medium text-xs uppercase">Session</th>
                    <th className="text-left py-2 text-gray-400 font-medium text-xs uppercase">Organizer</th>
                  </tr>
                </thead>
                <tbody>
                  {scheduleRows.map((row) => (
                    <tr key={row.time} className="border-b border-gray-50">
                      <td className="py-3 pr-4 text-gray-500 whitespace-nowrap">{row.time}</td>
                      <td className="py-3 pr-4 font-medium text-gray-900">{row.title}</td>
                      <td className="py-3 text-gray-500">{row.speaker}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Organizer */}
            <div className="bg-white rounded-xl border border-gray-100 p-6" id="organizer">
              <h2 className="font-bold text-gray-900 text-lg mb-4">Organizer Info</h2>
              <div className="flex items-start gap-4">
                <div className="h-16 w-16 rounded-full bg-[#1a2744] flex items-center justify-center shrink-0">
                  <GraduationCap className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{organizerName}</h3>
                  {createdByName && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      Coordinated by{" "}
                      <span className="font-medium text-gray-600">{createdByName}</span>
                    </p>
                  )}
                  {categoryLabel && (
                    <span className="inline-block mt-2 text-[10px] font-semibold uppercase tracking-wide bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                      {categoryLabel}
                    </span>
                  )}
                  <p className="text-sm text-gray-500 mt-2 max-w-md">
                    Organizing meaningful campus experiences for students, faculty,
                    and the wider university community.
                  </p>
                  <div className="flex items-center gap-4 mt-3">
                    <button className="text-sm text-gray-700 underline hover:no-underline">
                      Visit Website
                    </button>
                    <button className="text-sm text-gray-700 underline hover:no-underline">
                      Contact Support
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Right column ────────────────────────────────────────────── */}
          <div className="space-y-4">
            {/* Countdown */}
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide text-center mb-4">
                Event Starts In
              </p>
              <div className="grid grid-cols-4 gap-1">
                {(
                  [
                    ["DAYS", countdown.days],
                    ["HOURS", countdown.hours],
                    ["MINS", countdown.mins],
                    ["SECS", countdown.secs],
                  ] as [string, number][]
                ).map(([label, val]) => (
                  <div key={label} className="text-center bg-gray-50 rounded-lg py-2">
                    <p className="text-xl font-bold text-gray-900">
                      {String(val).padStart(2, "0")}
                    </p>
                    <p className="text-[9px] text-gray-400 uppercase mt-0.5">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Event info */}
            <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
              {/* Location */}
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-gray-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-400 uppercase font-medium tracking-wide">
                    Location
                  </p>
                  <p className="text-sm font-semibold text-gray-900 mt-0.5">
                    {event.location}
                  </p>
                </div>
              </div>

              {/* Attendance — uses attendanceCount which prefers registered_count */}
              <div className="flex items-start gap-3">
                <Users className="h-5 w-5 text-gray-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-400 uppercase font-medium tracking-wide">
                    Attendance
                  </p>
                  <p className="text-sm font-semibold text-gray-900 mt-0.5">
                    {capacityNum
                      ? `${attendanceCount} / ${capacityNum} registered`
                      : "Open Attendance"}
                  </p>
                  {availableSpots !== null && capacityNum && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      {availableSpots} spots left
                    </p>
                  )}
                </div>
              </div>

              {/* Ticket price */}
              <div className="flex items-start gap-3">
                <Ticket className="h-5 w-5 text-gray-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-400 uppercase font-medium tracking-wide">
                    Ticket Price
                  </p>
                  <p className="text-sm font-semibold text-gray-900 mt-0.5">
                    {event.registration_fee &&
                      parseFloat(String(event.registration_fee)) > 0
                      ? `$${event.registration_fee}`
                      : "Free Entry"}
                  </p>
                </div>
              </div>
            </div>

            {/* Register CTA */}
            {!registered ? (
              <button
                onClick={handleRegister}
                disabled={registering}
                className="w-full py-3 bg-[#1a2744] text-white font-bold rounded-xl hover:bg-[#0f1a35] disabled:opacity-60 transition-colors"
              >
                {registering ? "Registering..." : "Register Now"}
              </button>
            ) : (
              <div className="w-full py-3 bg-green-50 border border-green-200 rounded-xl flex items-center justify-center gap-2 text-green-700 font-semibold">
                <CheckCircle className="h-5 w-5" /> Registered!
              </div>
            )}

            {/* Related events */}
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h3 className="font-semibold text-gray-900 mb-3 text-sm">
                Related Events
              </h3>
              {relatedEvents.length === 0 ? (
                <p className="text-xs text-gray-400">
                  No related events at the moment.
                </p>
              ) : (
                <div className="space-y-3">
                  {relatedEvents.map((re) => {
                    const rd = new Date(re.event_date);
                    const rBanner = re.banner_image ?? re.poster_image ?? null;
                    return (
                      <Link
                        key={re.id}
                        href={`/events/${re.id}`}
                        className="flex items-center gap-3 group"
                      >
                        <div className="h-10 w-10 rounded-lg bg-gray-800 shrink-0 overflow-hidden relative">
                          {rBanner ? (
                            <Image
                              src={rBanner}
                              alt={re.title}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="h-full w-full bg-gradient-to-br from-[#1a2744] to-slate-700 flex items-center justify-center">
                              <Calendar className="h-4 w-4 text-white/50" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 leading-tight line-clamp-1 group-hover:text-[#1a2744] transition-colors">
                            {re.title}
                          </p>
                          <p className="text-xs text-gray-400">
                            {rd.toLocaleDateString("en", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer className="border-t border-gray-100 py-4 mt-8 bg-white">
        <p className="text-center text-xs text-gray-400">
          © {currentYear} University Events Committee. All rights reserved.
        </p>
      </footer>
    </div>
  );
}