// // ============================================================
// // CAMPUS EVENTS — Home Page
// // ============================================================

// "use client";

// import { useEffect, useState } from "react";
// import Link from "next/link";
// import Image from "next/image";
// import {
//   CalendarDays, MapPin, ChevronRight,
//   Monitor, Users, Trophy, Megaphone, BookOpen, FileText,
// } from "lucide-react";
// import { Navbar } from "@/components/layout/Navbar";
// import { Footer } from "@/components/layout/Footer";
// import { getUpcomingEvents } from "@/services/eventService";
// import { getCategories } from "@/services/adminService";
// import { formatDate } from "@/utils/helpers";
// import type { Event, Category } from "@/types";

// const STATIC_CATEGORIES = [
//   { id: "1", name: "Workshops", description: "Hands-on technical learning", icon: Monitor },
//   { id: "2", name: "Seminars", description: "Industry leader talks", icon: Users },
//   { id: "3", name: "Competitions", description: "Showcase your campus skills", icon: Trophy },
// ];

// const STATIC_ANNOUNCEMENTS = [
//   { id: "1", title: "Volunteer Registration Open for Charity Run", source: "Student Affairs", time: "2 hours ago", icon: Megaphone },
//   { id: "2", title: "AI Ethics Workshop: New Guest Speaker Added", source: "Computer Science Dept", time: "5 hours ago", icon: BookOpen },
//   { id: "3", title: "Guidelines for Thesis Presentation Competition", source: "Academic Office", time: "1 day ago", icon: FileText },
// ];

// const CATEGORY_COLOURS = [
//   "bg-emerald-500", "bg-blue-600", "bg-orange-500",
//   "bg-purple-600", "bg-pink-500", "bg-teal-500",
// ];

// const STATIC_EVENT_PLACEHOLDERS = [
//   { id: "s1", title: "Spring Hackathon 2024", date: "March 15–17, 2024", location: "Innovation Lab, Building B", badge: "HACKING", badgeColour: "bg-gray-800", btnLabel: "Register Now", imgColour: "from-teal-300 to-teal-500" },
//   { id: "s2", title: "Future Leaders Summit", date: "April 02, 2024", location: "Grand Auditorium", badge: "BUSINESS", badgeColour: "bg-emerald-600", btnLabel: "Get Tickets", imgColour: "from-gray-700 to-gray-900" },
//   { id: "s3", title: "Annual Fine Arts Expo", date: "May 10, 2024", location: "University Art Gallery", badge: "ARTS", badgeColour: "bg-orange-500", btnLabel: "Learn More", imgColour: "from-amber-400 to-orange-500" },
// ];

// export default function HomePage() {
//   const [events, setEvents] = useState<Event[]>([]);
//   const [categories, setCategories] = useState<Category[]>([]);
//   const [loading, setLoading] = useState(true);
//   const currentYear = new Date().getFullYear();

//   useEffect(() => {
//     Promise.allSettled([
//       getUpcomingEvents(6),
//       getCategories(),
//     ]).then(([evRes, catRes]) => {
//       // getUpcomingEvents now returns Event[] (already extracted from paginated response)
//       if (evRes.status === "fulfilled" && Array.isArray(evRes.value)) {
//         setEvents(evRes.value.slice(0, 3));
//       }
//       if (catRes.status === "fulfilled" && Array.isArray(catRes.value)) {
//         setCategories(catRes.value.slice(0, 6));
//       }
//     }).finally(() => setLoading(false));
//   }, []);

//   const displayCategories = categories.length > 0
//     ? categories.slice(0, 3).map((c, i) => ({
//         id: c.id,
//         name: c.name,
//         description: c.description || STATIC_CATEGORIES[i]?.description || "Explore events",
//         icon: STATIC_CATEGORIES[i]?.icon || Monitor,
//       }))
//     : STATIC_CATEGORIES;

//   return (
//     <div className="min-h-screen flex flex-col bg-gray-50">
//       <Navbar />

//       {/* ── HERO ── */}
//       <section className="relative h-[340px] overflow-hidden bg-gray-800">
//         <div
//           className="absolute inset-0 bg-cover bg-center bg-no-repeat"
//           style={{ backgroundImage: `url('https://images.unsplash.com/photo-1562774053-701939374585?w=1400&q=80')` }}
//         />
//         <div className="absolute inset-0 bg-black/50" />
//         <div className="relative h-full flex flex-col items-center justify-center text-center px-4">
//           <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3 leading-tight">
//             Find Your Next<br />Opportunity
//           </h1>
//           <p className="text-white/90 text-base max-w-xl mb-8">
//             Discover workshops, seminars, and competitions happening across your campus today.
//           </p>
//           <div className="flex items-center gap-3 flex-wrap justify-center">
//             <Link href="/events" className="px-6 py-2.5 rounded border border-white text-white text-sm font-medium hover:bg-white/10 transition-colors">
//               Explore All Events
//             </Link>
//             <Link href="/support" className="px-6 py-2.5 rounded bg-[#1a2744] border border-[#1a2744] text-white text-sm font-medium hover:bg-[#0f1a35] transition-colors">
//               Host an Event
//             </Link>
//           </div>
//         </div>
//       </section>

//       {/* ── BROWSE BY CATEGORY ── */}
//       <section className="py-10 px-4 bg-gray-50">
//         <div className="mx-auto max-w-5xl">
//           <h2 className="text-xl font-bold text-gray-900 mb-6">Browse by Category</h2>
//           <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
//             {displayCategories.map(({ id, name, description, icon: Icon }) => (
//               <Link key={id} href={`/events?category=${id}`}
//                 className="bg-white rounded-lg border border-gray-200 p-6 flex flex-col items-center text-center hover:shadow-md transition-shadow group">
//                 <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
//                   <Icon className="h-6 w-6 text-gray-600" />
//                 </div>
//                 <h3 className="font-semibold text-gray-900 text-sm mb-1">{name}</h3>
//                 <p className="text-xs text-gray-500">{description}</p>
//               </Link>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* ── FEATURED EVENTS ── */}
//       <section className="py-10 px-4 bg-gray-50">
//         <div className="mx-auto max-w-5xl">
//           <div className="flex items-center justify-between mb-6">
//             <h2 className="text-xl font-bold text-gray-900">Featured Events</h2>
//             <Link href="/events" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">View All</Link>
//           </div>
//           <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
//             {loading ? (
//               [1, 2, 3].map((n) => (
//                 <div key={n} className="bg-white rounded-lg border border-gray-200 overflow-hidden animate-pulse">
//                   <div className="h-44 bg-gray-200" />
//                   <div className="p-4 space-y-2">
//                     <div className="h-4 bg-gray-200 rounded w-3/4" />
//                     <div className="h-3 bg-gray-100 rounded w-1/2" />
//                     <div className="h-3 bg-gray-100 rounded w-2/3" />
//                     <div className="h-8 bg-gray-100 rounded mt-3" />
//                   </div>
//                 </div>
//               ))
//             ) : events.length > 0 ? (
//               events.map((event, i) => (
//                 <RealEventCard key={event.id} event={event} index={i} />
//               ))
//             ) : (
//               STATIC_EVENT_PLACEHOLDERS.map((ev, i) => (
//                 <PlaceholderEventCard key={ev.id} ev={ev} />
//               ))
//             )}
//           </div>
//         </div>
//       </section>

//       {/* ── LATEST ANNOUNCEMENTS ── */}
//       <section className="py-10 px-4 bg-gray-50">
//         <div className="mx-auto max-w-5xl">
//           <h2 className="text-xl font-bold text-gray-900 mb-5">Latest Announcements</h2>
//           <div className="space-y-2">
//             {STATIC_ANNOUNCEMENTS.map(({ id, title, source, time, icon: Icon }) => (
//               <div key={id} className="bg-white rounded-lg border border-gray-200 px-5 py-4 flex items-center gap-4 hover:shadow-sm transition-shadow cursor-pointer group">
//                 <div className="h-9 w-9 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
//                   <Icon className="h-5 w-5 text-gray-500" />
//                 </div>
//                 <div className="flex-1 min-w-0">
//                   <p className="text-sm font-semibold text-gray-900 truncate">{title}</p>
//                   <p className="text-xs text-gray-400 mt-0.5">{source} • {time}</p>
//                 </div>
//                 <ChevronRight className="h-4 w-4 text-gray-400 shrink-0 group-hover:text-gray-600 transition-colors" />
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* ── FOOTER ── */}
//       <Footer />
//     </div>
//   );
// }

// // ── Real event card (from API) ────────────────────────────────────────────────
// function RealEventCard({ event, index }: { event: Event; index: number }) {
//   const badgeColour = CATEGORY_COLOURS[index % CATEGORY_COLOURS.length];
//   const btnLabels = ["Register Now", "Get Tickets", "Learn More"];
//   return (
//     <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
//       <div className="relative h-44 bg-gray-200 overflow-hidden">
//         {event.banner_image ? (
//           <Image src={event.banner_image} alt={event.title} fill className="object-cover" />
//         ) : (
//           <div className="absolute inset-0 bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center">
//             <CalendarDays className="h-12 w-12 text-white/50" />
//           </div>
//         )}
//         {event.category && (
//           <span className={`absolute top-3 left-3 ${badgeColour} text-white text-[10px] font-bold uppercase px-2 py-0.5 rounded`}>
//             {event.category.name}
//           </span>
//         )}
//       </div>
//       <div className="p-4 flex flex-col flex-1">
//         <h3 className="font-bold text-gray-900 text-sm mb-2 line-clamp-2 leading-snug">{event.title}</h3>
//         <div className="space-y-1 mb-4">
//           <p className="flex items-center gap-1.5 text-xs text-gray-500">
//             <CalendarDays className="h-3.5 w-3.5 text-gray-400 shrink-0" />{formatDate(event.event_date)}
//           </p>
//           <p className="flex items-center gap-1.5 text-xs text-gray-500">
//             <MapPin className="h-3.5 w-3.5 text-gray-400 shrink-0" />{event.location}
//           </p>
//         </div>
//         <Link href={`/events/${event.id}`}
//           className="mt-auto w-full text-center py-2 px-4 border border-gray-300 rounded text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
//           {btnLabels[index % btnLabels.length]}
//         </Link>
//       </div>
//     </div>
//   );
// }

// // ── Placeholder event card (no API data yet) ──────────────────────────────────
// function PlaceholderEventCard({ ev }: { ev: typeof STATIC_EVENT_PLACEHOLDERS[0] }) {
//   return (
//     <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
//       <div className={`relative h-44 bg-gradient-to-br ${ev.imgColour} flex items-center justify-center`}>
//         <CalendarDays className="h-12 w-12 text-white/30" />
//         <span className={`absolute top-3 left-3 ${ev.badgeColour} text-white text-[10px] font-bold uppercase px-2 py-0.5 rounded`}>
//           {ev.badge}
//         </span>
//       </div>
//       <div className="p-4 flex flex-col flex-1">
//         <h3 className="font-bold text-gray-900 text-sm mb-2 leading-snug">{ev.title}</h3>
//         <div className="space-y-1 mb-4">
//           <p className="flex items-center gap-1.5 text-xs text-gray-500">
//             <CalendarDays className="h-3.5 w-3.5 text-gray-400 shrink-0" />{ev.date}
//           </p>
//           <p className="flex items-center gap-1.5 text-xs text-gray-500">
//             <MapPin className="h-3.5 w-3.5 text-gray-400 shrink-0" />{ev.location}
//           </p>
//         </div>
//         <Link href="/events"
//           className="mt-auto w-full text-center py-2 px-4 border border-gray-300 rounded text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
//           {ev.btnLabel}
//         </Link>
//       </div>
//     </div>
//   );
// }

// ============================================================
// CAMPUS EVENTS — Home Page
// ============================================================

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  CalendarDays, MapPin, ChevronRight,
  Megaphone, BookOpen, FileText,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { getUpcomingEvents } from "@/services/eventService";
import { getCategories } from "@/services/adminService";
import { formatDate } from "@/utils/helpers";
import type { Event, Category } from "@/types";

const STATIC_ANNOUNCEMENTS = [
  { id: "1", title: "Volunteer Registration Open for Charity Run", source: "Student Affairs", time: "2 hours ago", icon: Megaphone },
  { id: "2", title: "AI Ethics Workshop: New Guest Speaker Added", source: "Computer Science Dept", time: "5 hours ago", icon: BookOpen },
  { id: "3", title: "Guidelines for Thesis Presentation Competition", source: "Academic Office", time: "1 day ago", icon: FileText },
];

const CATEGORY_COLOURS = [
  "bg-emerald-500", "bg-blue-600", "bg-orange-500",
  "bg-purple-600", "bg-pink-500", "bg-teal-500",
];

export default function HomePage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      getUpcomingEvents(6),
      getCategories(),
    ]).then(([evRes, catRes]) => {
      if (evRes.status === "fulfilled" && Array.isArray(evRes.value)) {
        setEvents(evRes.value.slice(0, 3));
      }
      if (catRes.status === "fulfilled" && Array.isArray(catRes.value)) {
        setCategories(catRes.value.slice(0, 3));   // show 3 in the grid
      }
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      {/* ── HERO ── */}
      <section className="relative h-[340px] overflow-hidden bg-gray-800">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1562774053-701939374585?w=1400&q=80')` }}
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative h-full flex flex-col items-center justify-center text-center px-4">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3 leading-tight">
            Find Your Next<br />Opportunity
          </h1>
          <p className="text-white/90 text-base max-w-xl mb-8">
            Discover workshops, seminars, and competitions happening across your campus today.
          </p>
          <div className="flex items-center gap-3 flex-wrap justify-center">
            <Link href="/events" className="px-6 py-2.5 rounded border border-white text-white text-sm font-medium hover:bg-white/10 transition-colors">
              Explore All Events
            </Link>
            <Link href="/support" className="px-6 py-2.5 rounded bg-[#1a2744] border border-[#1a2744] text-white text-sm font-medium hover:bg-[#0f1a35] transition-colors">
              Host an Event
            </Link>
          </div>
        </div>
      </section>

      {/* ── BROWSE BY CATEGORY ── */}
      <section className="py-10 px-4 bg-gray-50">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Browse by Category</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {loading ? (
              [1, 2, 3].map((n) => (
                <div key={n} className="bg-white rounded-lg border border-gray-200 p-6 flex flex-col items-center animate-pulse">
                  <div className="h-12 w-12 rounded-full bg-gray-200 mb-3" />
                  <div className="h-4 bg-gray-200 rounded w-24 mb-2" />
                  <div className="h-3 bg-gray-100 rounded w-32" />
                </div>
              ))
            ) : categories.map((cat, i) => (
              <Link key={cat.id} href={`/events?category=${cat.id}`}
                className="bg-white rounded-lg border border-gray-200 p-6 flex flex-col items-center text-center hover:shadow-md transition-shadow group">
                {/* Coloured initial avatar in place of a generic icon */}
                <div className={`h-12 w-12 rounded-full flex items-center justify-center mb-3 text-white font-bold text-lg ${CATEGORY_COLOURS[i % CATEGORY_COLOURS.length]}`}>
                  {cat.name.charAt(0)}
                </div>
                <h3 className="font-semibold text-gray-900 text-sm mb-1">{cat.name}</h3>
                <p className="text-xs text-gray-500 line-clamp-2">{cat.description}</p>
                {cat.event_count !== undefined && (
                  <span className="mt-2 text-xs text-gray-400">{cat.event_count} event{cat.event_count !== 1 ? "s" : ""}</span>
                )}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED EVENTS ── */}
      <section className="py-10 px-4 bg-gray-50">
        <div className="mx-auto max-w-5xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Featured Events</h2>
            <Link href="/events" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">View All</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {loading ? (
              [1, 2, 3].map((n) => (
                <div key={n} className="bg-white rounded-lg border border-gray-200 overflow-hidden animate-pulse">
                  <div className="h-44 bg-gray-200" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-100 rounded w-1/2" />
                    <div className="h-3 bg-gray-100 rounded w-2/3" />
                    <div className="h-8 bg-gray-100 rounded mt-3" />
                  </div>
                </div>
              ))
            ) : events.length > 0 ? (
              events.map((event, i) => (
                <RealEventCard key={event.id} event={event} index={i} />
              ))
            ) : (
              <p className="col-span-3 text-center text-sm text-gray-400 py-10">No upcoming events at the moment.</p>
            )}
          </div>
        </div>
      </section>

      {/* ── LATEST ANNOUNCEMENTS ── */}
      <section className="py-10 px-4 bg-gray-50">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-xl font-bold text-gray-900 mb-5">Latest Announcements</h2>
          <div className="space-y-2">
            {STATIC_ANNOUNCEMENTS.map(({ id, title, source, time, icon: Icon }) => (
              <div key={id} className="bg-white rounded-lg border border-gray-200 px-5 py-4 flex items-center gap-4 hover:shadow-sm transition-shadow cursor-pointer group">
                <div className="h-9 w-9 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                  <Icon className="h-5 w-5 text-gray-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{source} • {time}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400 shrink-0 group-hover:text-gray-600 transition-colors" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

// ── Real event card ───────────────────────────────────────────────────────────
function RealEventCard({ event, index }: { event: Event; index: number }) {
  const badgeColour = CATEGORY_COLOURS[index % CATEGORY_COLOURS.length];
  const btnLabels = ["Register Now", "Get Tickets", "Learn More"];

  // The events list endpoint returns category_name as a flat string
  // The event detail endpoint returns category as a nested object — handle both
  const categoryLabel =
    (event as any).category_name ??
    (typeof event.category === "object" && event.category !== null
      ? event.category.name
      : null);

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
      <div className="relative h-44 bg-gray-200 overflow-hidden">
        {event.banner_image ? (
          <Image src={event.banner_image} alt={event.title} fill className="object-cover" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center">
            <CalendarDays className="h-12 w-12 text-white/50" />
          </div>
        )}
        {categoryLabel && (
          <span className={`absolute top-3 left-3 ${badgeColour} text-white text-[10px] font-bold uppercase px-2 py-0.5 rounded`}>
            {categoryLabel}
          </span>
        )}
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-bold text-gray-900 text-sm mb-2 line-clamp-2 leading-snug">{event.title}</h3>
        <div className="space-y-1 mb-4">
          <p className="flex items-center gap-1.5 text-xs text-gray-500">
            <CalendarDays className="h-3.5 w-3.5 text-gray-400 shrink-0" />
            {formatDate(event.event_date)}
          </p>
          <p className="flex items-center gap-1.5 text-xs text-gray-500">
            <MapPin className="h-3.5 w-3.5 text-gray-400 shrink-0" />
            {event.location}
          </p>
        </div>
        <Link href={`/events/${event.id}`}
          className="mt-auto w-full text-center py-2 px-4 border border-gray-300 rounded text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
          {btnLabels[index % btnLabels.length]}
        </Link>
      </div>
    </div>
  );
}