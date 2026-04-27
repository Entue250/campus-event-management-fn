// "use client";
// import { useEffect, useState, useCallback } from "react";
// import Image from "next/image";
// import Link from "next/link";
// import { useSearchParams, useRouter } from "next/navigation";
// import { Suspense } from "react";
// import {
//   GraduationCap, Search, SlidersHorizontal, Clock, MapPin,
//   ChevronLeft, ChevronRight, Heart, SortDesc
// } from "lucide-react";
// import { getEvents } from "@/services/eventService";
// import { getCategories } from "@/services/adminService";
// import { formatDate, cn } from "@/utils/helpers";
// import type { Event, Category } from "@/types";

// const CATEGORY_BADGE_COLOURS: Record<string, string> = {
//   ACADEMIC: "bg-blue-100 text-blue-700",
//   SPORTS: "bg-orange-100 text-orange-700",
//   ARTS: "bg-purple-100 text-purple-700",
//   CAREER: "bg-green-100 text-green-700",
//   SOCIAL: "bg-teal-100 text-teal-700",
//   EXHIBITION: "bg-pink-100 text-pink-700",
// };

// function EventsContent() {
//   const router = useRouter();
//   const searchParams = useSearchParams();

//   const [events, setEvents] = useState<Event[]>([]);
//   const [categories, setCategories] = useState<Category[]>([]);
//   const [total, setTotal] = useState(0);
//   const [page, setPage] = useState(1);
//   const [loading, setLoading] = useState(true);

//   const [dateFrom, setDateFrom] = useState("");
//   const [selectedCats, setSelectedCats] = useState<string[]>([]);
//   const [sortOrder, setSortOrder] = useState("-event_date");
//   const [search, setSearch] = useState(searchParams.get("search") ?? "");

//   const fetchEvents = useCallback(async () => {
//     setLoading(true);
//     try {
//       const params: Record<string, string | number | undefined> = { page, ordering: sortOrder };
//       if (search) params.search = search;
//       if (dateFrom) params.date_from = dateFrom;
//       if (selectedCats.length === 1) params.category = selectedCats[0];
//       const res = await getEvents(params as Parameters<typeof getEvents>[0]);
//       setEvents(res.results);
//       setTotal(res.count);
//     } catch { /* silent */ } finally { setLoading(false); }
//   }, [page, sortOrder, search, dateFrom, selectedCats]);

//   useEffect(() => { fetchEvents(); }, [fetchEvents]);
//   useEffect(() => { getCategories().then(setCategories).catch(() => {}); }, []);

//   const totalPages = Math.ceil(total / 9);

//   const applyFilters = () => { setPage(1); fetchEvents(); };
//   const clearFilters = () => { setSelectedCats([]); setDateFrom(""); setPage(1); };
//   const toggleCat = (id: string) => setSelectedCats(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);

//   return (
//     <div className="min-h-screen bg-gray-50 flex flex-col">
//       {/* Navbar */}
//       <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center gap-6">
//           <Link href="/" className="flex items-center gap-2 shrink-0">
//             <div className="h-8 w-8 rounded-lg bg-[#1a2744] flex items-center justify-center">
//               <GraduationCap style={{ height: 18, width: 18, color: 'white' }} />
//             </div>
//             <span className="font-bold text-[#1a2744] text-sm">CampusEvents</span>
//           </Link>
//           <div className="hidden md:flex items-center gap-1">
//             {[{h:"/events",l:"Events"},{h:"/dashboard/my-events",l:"My Bookings"},{h:"/events?view=calendar",l:"Calendar"},{h:"/events?view=clubs",l:"Clubs"}].map(({h,l}) => (
//               <Link key={l} href={h} className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-md hover:bg-gray-50 transition-colors">{l}</Link>
//             ))}
//           </div>
//           <div className="flex-1 max-w-xs hidden md:block">
//             <div className="relative">
//               <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
//               <input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && fetchEvents()}
//                 placeholder="Search events..." className="w-full pl-8 pr-3 py-1.5 text-sm rounded-md border border-gray-200 bg-gray-50 focus:outline-none focus:ring-1 focus:ring-[#1a2744]/30 focus:bg-white" />
//             </div>
//           </div>
//           <div className="ml-auto flex items-center gap-2">
//             <div className="h-8 w-8 rounded-full bg-[#1a2744] flex items-center justify-center cursor-pointer">
//               <span className="text-white text-xs font-bold">U</span>
//             </div>
//           </div>
//         </div>
//       </nav>

//       <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex gap-6">
//         {/* Sidebar */}
//         <aside className="w-56 shrink-0">
//           <div className="bg-white rounded-xl border border-gray-200 p-5 sticky top-20">
//             <div className="flex items-center gap-2 mb-5">
//               <SlidersHorizontal className="h-4 w-4 text-gray-600" />
//               <h3 className="font-semibold text-gray-900 text-sm">Filters</h3>
//             </div>

//             <div className="mb-5">
//               <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Date Range</p>
//               <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
//                 className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1a2744]/30" />
//             </div>

//             <div className="mb-5">
//               <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Category</p>
//               <div className="space-y-2">
//                 {(categories.length > 0 ? categories : [
//                   {id:"aw",name:"Academic Workshops"},{id:"sa",name:"Sports & Athletics"},
//                   {id:"ac",name:"Arts & Culture"},{id:"cf",name:"Career Fairs"},{id:"mc",name:"Music & Concerts"},
//                 ]).map((cat) => (
//                   <label key={cat.id} className="flex items-center gap-2 cursor-pointer">
//                     <input type="checkbox" checked={selectedCats.includes(cat.id)} onChange={() => toggleCat(cat.id)}
//                       className="h-4 w-4 rounded border-gray-300 text-[#1a2744] focus:ring-[#1a2744]" />
//                     <span className="text-sm text-gray-600">{cat.name}</span>
//                   </label>
//                 ))}
//               </div>
//             </div>

//             <button onClick={applyFilters} className="w-full py-2.5 bg-[#1a2744] text-white text-sm font-semibold rounded-lg hover:bg-[#0f1a35] transition-colors mb-2">
//               Apply Filters
//             </button>
//             <button onClick={clearFilters} className="w-full text-sm text-gray-500 hover:text-gray-700 transition-colors py-1">
//               Clear All
//             </button>
//           </div>
//         </aside>

//         {/* Main */}
//         <main className="flex-1 min-w-0">
//           <div className="flex items-start justify-between mb-6">
//             <div>
//               <h1 className="text-3xl font-bold text-gray-900">Upcoming Events</h1>
//               <p className="text-gray-500 mt-1">Discover what&apos;s happening on campus today</p>
//             </div>
//             <div className="flex items-center gap-2">
//               <span className="text-sm text-gray-500">Sort by:</span>
//               <button className="flex items-center gap-1.5 text-sm font-bold text-gray-900 hover:text-[#1a2744]">
//                 Latest First <SortDesc className="h-4 w-4" />
//               </button>
//             </div>
//           </div>

//           {loading ? (
//             <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
//               {[...Array(6)].map((_,i) => (
//                 <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse">
//                   <div className="h-44 bg-gray-200" />
//                   <div className="p-4 space-y-3">
//                     <div className="h-3 bg-gray-200 rounded w-1/4" />
//                     <div className="h-4 bg-gray-200 rounded w-3/4" />
//                     <div className="h-3 bg-gray-100 rounded w-1/2" />
//                     <div className="h-9 bg-gray-100 rounded mt-2" />
//                   </div>
//                 </div>
//               ))}
//             </div>
//           ) : events.length === 0 ? (
//             <div className="text-center py-16 text-gray-400">No events found</div>
//           ) : (
//             <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
//               {events.map((ev) => {
//                 const catName = ev.category?.name?.toUpperCase() ?? "EVENT";
//                 const badgeCls = CATEGORY_BADGE_COLOURS[catName] ?? "bg-gray-100 text-gray-600";
//                 const d = new Date(ev.event_date);
//                 return (
//                   <div key={ev.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow flex flex-col">
//                     {/* Image */}
//                     <div className="relative h-44 bg-gradient-to-br from-gray-700 to-gray-900">
//                       {ev.banner_image && <Image src={ev.banner_image} alt={ev.title} fill className="object-cover" />}
//                       {/* Date badge */}
//                       <div className="absolute top-3 left-3 bg-white rounded-lg px-2.5 py-1.5 text-center shadow-sm">
//                         <p className="text-[10px] font-bold text-gray-500 uppercase">{d.toLocaleString('en',{month:'short'})}</p>
//                         <p className="text-lg font-bold text-gray-900 leading-none">{d.getDate()}</p>
//                       </div>
//                       {/* Favourite */}
//                       <button className="absolute top-3 right-3 h-8 w-8 bg-white/90 rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-colors">
//                         <Heart className="h-4 w-4 text-gray-400" />
//                       </button>
//                     </div>

//                     <div className="p-4 flex flex-col flex-1">
//                       <span className={`inline-block text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded mb-2 w-fit ${badgeCls}`}>
//                         {ev.category?.name ?? "Event"}
//                       </span>
//                       <h3 className="font-bold text-gray-900 text-base mb-2 line-clamp-2 leading-snug">{ev.title}</h3>
//                       <div className="space-y-1 mb-4 text-sm text-gray-500">
//                         <p className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 shrink-0" />{formatDate(ev.event_date)}</p>
//                         <p className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 shrink-0" />{ev.location}</p>
//                       </div>
//                       <Link href={`/events/${ev.id}`}
//                         className="mt-auto text-center py-2 px-4 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
//                         View Details
//                       </Link>
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           )}

//           {/* Pagination */}
//           {totalPages > 1 && (
//             <div className="flex items-center justify-center gap-1 mt-8">
//               <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1}
//                 className="h-9 w-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-40">
//                 <ChevronLeft className="h-4 w-4" />
//               </button>
//               {[...Array(Math.min(totalPages, 8))].map((_, i) => {
//                 const p = i + 1;
//                 return (
//                   <button key={p} onClick={() => setPage(p)}
//                     className={cn("h-9 w-9 rounded-lg text-sm font-medium transition-colors",
//                       page === p ? "bg-[#1a2744] text-white" : "border border-gray-200 text-gray-600 hover:bg-gray-50")}>
//                     {p}
//                   </button>
//                 );
//               })}
//               {totalPages > 8 && <span className="px-1 text-gray-400">...</span>}
//               {totalPages > 8 && (
//                 <button onClick={() => setPage(totalPages)}
//                   className={cn("h-9 w-9 rounded-lg text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50", page === totalPages && "bg-[#1a2744] text-white border-[#1a2744]")}>
//                   {totalPages}
//                 </button>
//               )}
//               <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page === totalPages}
//                 className="h-9 w-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-40">
//                 <ChevronRight className="h-4 w-4" />
//               </button>
//             </div>
//           )}
//         </main>
//       </div>

//       {/* Footer */}
//       <footer className="bg-white border-t border-gray-100 py-6 mt-8">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
//             <div className="flex items-center gap-2">
//               <div className="h-7 w-7 rounded-lg bg-[#1a2744] flex items-center justify-center">
//                 <GraduationCap style={{height:14,width:14,color:'white'}} />
//               </div>
//               <span className="font-bold text-gray-900 text-sm">CampusEvents Information System</span>
//             </div>
//             <div className="flex items-center gap-6 text-sm text-gray-500">
//               <Link href="/support" className="hover:text-gray-900">Terms of Service</Link>
//               <Link href="/support" className="hover:text-gray-900">Privacy Policy</Link>
//               <Link href="/support" className="hover:text-gray-900">Support</Link>
//             </div>
//           </div>
//           <p className="text-center text-xs text-gray-400 mt-4">© 2024 University Events Committee. All rights reserved.</p>
//         </div>
//       </footer>
//     </div>
//   );
// }

// export default function EventsPage() {
//   return <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="text-gray-500">Loading...</div></div>}><EventsContent /></Suspense>;
// }

"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import {
  GraduationCap, Search, SlidersHorizontal, Clock, MapPin,
  ChevronLeft, ChevronRight, Heart, SortDesc, CalendarDays,
  LayoutGrid, ChevronDown, Check,
} from "lucide-react";
import { getEvents } from "@/services/eventService";
import { getCategories } from "@/services/adminService";
import { formatDate, cn } from "@/utils/helpers";
import type { Event, Category } from "@/types";

const CATEGORY_BADGE_COLOURS: Record<string, string> = {
  ACADEMIC: "bg-blue-100 text-blue-700",
  SPORTS: "bg-orange-100 text-orange-700",
  ARTS: "bg-purple-100 text-purple-700",
  CAREER: "bg-green-100 text-green-700",
  SOCIAL: "bg-teal-100 text-teal-700",
  EXHIBITION: "bg-pink-100 text-pink-700",
};

const SORT_OPTIONS = [
  { value: "-event_date", label: "Latest First" },
  { value: "event_date", label: "Earliest First" },
  { value: "title", label: "Name A–Z" },
  { value: "-title", label: "Name Z–A" },
];

// ── Tiny calendar helpers ─────────────────────────────────────────────────────
function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay(); // 0=Sun
}
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function CalendarView({ events }: { events: Event[] }) {
  const today = new Date();
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());

  const daysInMonth = getDaysInMonth(calYear, calMonth);
  const firstDayOfWeek = getFirstDayOfMonth(calYear, calMonth);

  // Build a map: "YYYY-MM-DD" → Event[]
  const eventsByDay: Record<string, Event[]> = {};
  for (const ev of events) {
    const d = new Date(ev.event_date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    if (!eventsByDay[key]) eventsByDay[key] = [];
    eventsByDay[key].push(ev);
  }

  const prevMonth = () => {
    if (calMonth === 0) { setCalYear(y => y - 1); setCalMonth(11); }
    else setCalMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (calMonth === 11) { setCalYear(y => y + 1); setCalMonth(0); }
    else setCalMonth(m => m + 1);
  };

  const cells: (number | null)[] = [
    ...Array(firstDayOfWeek).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  // Pad to full weeks
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Calendar header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <button onClick={prevMonth} className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors">
          <ChevronLeft className="h-4 w-4 text-gray-600" />
        </button>
        <h2 className="font-bold text-gray-900 text-base">
          {MONTH_NAMES[calMonth]} {calYear}
        </h2>
        <button onClick={nextMonth} className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors">
          <ChevronRight className="h-4 w-4 text-gray-600" />
        </button>
      </div>

      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 border-b border-gray-100">
        {DAY_LABELS.map(d => (
          <div key={d} className="py-2 text-center text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7">
        {cells.map((day, idx) => {
          if (!day) return <div key={`empty-${idx}`} className="min-h-[80px] border-b border-r border-gray-50 bg-gray-50/50" />;
          const key = `${calYear}-${String(calMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const dayEvents = eventsByDay[key] ?? [];
          const isToday = day === today.getDate() && calMonth === today.getMonth() && calYear === today.getFullYear();
          return (
            <div key={key} className={cn(
              "min-h-[80px] border-b border-r border-gray-100 p-1.5 transition-colors",
              isToday ? "bg-blue-50/60" : "hover:bg-gray-50"
            )}>
              <span className={cn(
                "inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold mb-1",
                isToday ? "bg-[#1a2744] text-white" : "text-gray-700"
              )}>
                {day}
              </span>
              {dayEvents.slice(0, 2).map(ev => (
                <Link key={ev.id} href={`/events/${ev.id}`}
                  className="block truncate text-[10px] font-medium bg-[#1a2744]/10 text-[#1a2744] rounded px-1 py-0.5 mb-0.5 hover:bg-[#1a2744]/20 transition-colors">
                  {ev.title}
                </Link>
              ))}
              {dayEvents.length > 2 && (
                <span className="text-[9px] text-gray-400 font-medium">+{dayEvents.length - 2} more</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Sort dropdown ─────────────────────────────────────────────────────────────
function SortDropdown({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = SORT_OPTIONS.find(o => o.value === value) ?? SORT_OPTIONS[0];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 text-sm font-bold text-gray-900 hover:text-[#1a2744] transition-colors"
      >
        <SortDesc className="h-4 w-4" />
        {current.label}
        <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1.5 w-44 bg-white rounded-xl border border-gray-200 shadow-lg z-20 overflow-hidden">
          {SORT_OPTIONS.map(opt => (
            <button key={opt.value} onClick={() => { onChange(opt.value); setOpen(false); }}
              className={cn(
                "w-full flex items-center justify-between px-3.5 py-2.5 text-sm hover:bg-gray-50 transition-colors",
                opt.value === value ? "font-semibold text-[#1a2744]" : "text-gray-700"
              )}>
              {opt.label}
              {opt.value === value && <Check className="h-3.5 w-3.5 text-[#1a2744]" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main content ──────────────────────────────────────────────────────────────
function EventsContent() {
  const searchParams = useSearchParams();

  const [events, setEvents] = useState<Event[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "calendar">(
    searchParams.get("view") === "calendar" ? "calendar" : "grid"
  );

  const [dateFrom, setDateFrom] = useState("");
  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [sortOrder, setSortOrder] = useState("-event_date");
  const [search, setSearch] = useState(searchParams.get("search") ?? "");

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number | undefined> = { page, ordering: sortOrder };
      if (search) params.search = search;
      if (dateFrom) params.date_from = dateFrom;
      if (selectedCats.length === 1) params.category = selectedCats[0];
      const res = await getEvents(params as Parameters<typeof getEvents>[0]);
      setEvents(res.results);
      setTotal(res.count);
    } catch { /* silent */ } finally { setLoading(false); }
  }, [page, sortOrder, search, dateFrom, selectedCats]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);
  useEffect(() => { getCategories().then(setCategories).catch(() => { }); }, []);

  const totalPages = Math.ceil(total / 9);
  const applyFilters = () => { setPage(1); fetchEvents(); };
  const clearFilters = () => { setSelectedCats([]); setDateFrom(""); setPage(1); };
  const toggleCat = (id: string) =>
    setSelectedCats(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);

  const currentYear = new Date().getFullYear();

  // ── Build page numbers for pagination ──────────────────────────────────────
  // Always show: 1, 2, 3, …, last  (matching the screenshot)
  const buildPageNumbers = (): (number | "ellipsis")[] => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | "ellipsis")[] = [1, 2, 3];
    if (totalPages > 4) pages.push("ellipsis");
    pages.push(totalPages);
    return pages;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* ── NAVBAR ── */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center gap-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="h-8 w-8 rounded-lg bg-[#1a2744] flex items-center justify-center">
              <GraduationCap style={{ height: 18, width: 18, color: "white" }} />
            </div>
            <span className="font-bold text-[#1a2744] text-sm">CampusEvents</span>
          </Link>

          {/* Nav links — removed Clubs */}
          <div className="hidden md:flex items-center gap-1">
            {[
              { h: "/events", l: "Events" },
              { h: "/dashboard/my-events", l: "My Bookings" },
            ].map(({ h, l }) => (
              <Link key={l} href={h}
                className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-md hover:bg-gray-50 transition-colors">
                {l}
              </Link>
            ))}
          </div>

          {/* Search — pushed to the right via ml-auto */}
          <div className="ml-auto max-w-xs w-full hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={e => e.key === "Enter" && fetchEvents()}
                placeholder="Search events..."
                className="w-full pl-8 pr-3 py-1.5 text-sm rounded-md border border-gray-200 bg-gray-50 focus:outline-none focus:ring-1 focus:ring-[#1a2744]/30 focus:bg-white"
              />
            </div>
          </div>
        </div>
      </nav>

      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex gap-6">

        {/* ── SIDEBAR ── */}
        <aside className="w-56 shrink-0">
          <div className="bg-white rounded-xl border border-gray-200 p-5 sticky top-20">
            <div className="flex items-center gap-2 mb-5">
              <SlidersHorizontal className="h-4 w-4 text-gray-600" />
              <h3 className="font-semibold text-gray-900 text-sm">Filters</h3>
            </div>

            <div className="mb-5">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Date Range</p>
              <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1a2744]/30" />
            </div>

            <div className="mb-5">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Category</p>
              <div className="space-y-2">
                {(categories.length > 0 ? categories : [
                  { id: "aw", name: "Academic Workshops" },
                  { id: "sa", name: "Sports & Athletics" },
                  { id: "ac", name: "Arts & Culture" },
                  { id: "cf", name: "Career Fairs" },
                  { id: "mc", name: "Music & Concerts" },
                ]).map(cat => (
                  <label key={cat.id} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={selectedCats.includes(cat.id)} onChange={() => toggleCat(cat.id)}
                      className="h-4 w-4 rounded border-gray-300 text-[#1a2744] focus:ring-[#1a2744]" />
                    <span className="text-sm text-gray-600">{cat.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <button onClick={applyFilters}
              className="w-full py-2.5 bg-[#1a2744] text-white text-sm font-semibold rounded-lg hover:bg-[#0f1a35] transition-colors mb-2">
              Apply Filters
            </button>
            <button onClick={clearFilters} className="w-full text-sm text-gray-500 hover:text-gray-700 transition-colors py-1">
              Clear All
            </button>
          </div>
        </aside>

        {/* ── MAIN ── */}
        <main className="flex-1 min-w-0">
          {/* Header row */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Upcoming Events</h1>
              <p className="text-gray-500 mt-1">Discover what&apos;s happening on campus today</p>
            </div>

            <div className="flex items-center gap-3">
              {/* View toggle — Grid / Calendar */}
              <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-white">
                <button
                  onClick={() => setViewMode("grid")}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium transition-colors",
                    viewMode === "grid"
                      ? "bg-[#1a2744] text-white"
                      : "text-gray-500 hover:bg-gray-50"
                  )}
                >
                  <LayoutGrid className="h-3.5 w-3.5" />
                  Grid
                </button>
                <button
                  onClick={() => setViewMode("calendar")}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium transition-colors",
                    viewMode === "calendar"
                      ? "bg-[#1a2744] text-white"
                      : "text-gray-500 hover:bg-gray-50"
                  )}
                >
                  <CalendarDays className="h-3.5 w-3.5" />
                  Calendar
                </button>
              </div>

              {/* Sort — only relevant in grid mode */}
              {viewMode === "grid" && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Sort by:</span>
                  <SortDropdown value={sortOrder} onChange={(v) => { setSortOrder(v); setPage(1); }} />
                </div>
              )}
            </div>
          </div>

          {/* ── GRID VIEW ── */}
          {viewMode === "grid" && (
            <>
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse">
                      <div className="h-44 bg-gray-200" />
                      <div className="p-4 space-y-3">
                        <div className="h-3 bg-gray-200 rounded w-1/4" />
                        <div className="h-4 bg-gray-200 rounded w-3/4" />
                        <div className="h-3 bg-gray-100 rounded w-1/2" />
                        <div className="h-9 bg-gray-100 rounded mt-2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : events.length === 0 ? (
                <div className="text-center py-16 text-gray-400">No events found</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {events.map(ev => {
                    const catName = (ev as any).category_name?.toUpperCase()
                      ?? ev.category?.name?.toUpperCase()
                      ?? "EVENT";
                    const badgeCls = CATEGORY_BADGE_COLOURS[catName] ?? "bg-gray-100 text-gray-600";
                    const d = new Date(ev.event_date);
                    return (
                      <div key={ev.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow flex flex-col">
                        <div className="relative h-44 bg-gradient-to-br from-gray-700 to-gray-900">
                          {ev.banner_image && <Image src={ev.banner_image} alt={ev.title} fill className="object-cover" />}
                          <div className="absolute top-3 left-3 bg-white rounded-lg px-2.5 py-1.5 text-center shadow-sm">
                            <p className="text-[10px] font-bold text-gray-500 uppercase">{d.toLocaleString("en", { month: "short" })}</p>
                            <p className="text-lg font-bold text-gray-900 leading-none">{d.getDate()}</p>
                          </div>
                          <button className="absolute top-3 right-3 h-8 w-8 bg-white/90 rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-colors">
                            <Heart className="h-4 w-4 text-gray-400" />
                          </button>
                        </div>
                        <div className="p-4 flex flex-col flex-1">
                          <span className={`inline-block text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded mb-2 w-fit ${badgeCls}`}>
                            {(ev as any).category_name ?? ev.category?.name ?? "Event"}
                          </span>
                          <h3 className="font-bold text-gray-900 text-base mb-2 line-clamp-2 leading-snug">{ev.title}</h3>
                          <div className="space-y-1 mb-4 text-sm text-gray-500">
                            <p className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 shrink-0" />{formatDate(ev.event_date)}</p>
                            <p className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 shrink-0" />{ev.location}</p>
                          </div>
                          <Link href={`/events/${ev.id}`}
                            className="mt-auto text-center py-2 px-4 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                            View Details
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* ── PAGINATION ── */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-1 mt-8">
                  {/* Prev */}
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="h-9 w-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>

                  {buildPageNumbers().map((item, idx) =>
                    item === "ellipsis" ? (
                      <span key={`ellipsis-${idx}`} className="h-9 w-9 flex items-center justify-center text-gray-400 text-sm select-none">
                        …
                      </span>
                    ) : (
                      <button
                        key={item}
                        onClick={() => setPage(item)}
                        className={cn(
                          "h-9 w-9 rounded-lg text-sm font-medium transition-colors",
                          page === item
                            ? "bg-[#1a2744] text-white"
                            : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                        )}
                      >
                        {item}
                      </button>
                    )
                  )}

                  {/* Next */}
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="h-9 w-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition-colors"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </>
          )}

          {/* ── CALENDAR VIEW ── */}
          {viewMode === "calendar" && (
            <CalendarView events={events} />
          )}
        </main>
      </div>

      {/* ── FOOTER ── */}
      <footer className="bg-white border-t border-gray-100 py-6 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-[#1a2744] flex items-center justify-center">
                <GraduationCap style={{ height: 14, width: 14, color: "white" }} />
              </div>
              <span className="font-bold text-gray-900 text-sm">CampusEvents Information System</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <Link href="/support" className="hover:text-gray-900">Terms of Service</Link>
              <Link href="/support" className="hover:text-gray-900">Privacy Policy</Link>
              <Link href="/support" className="hover:text-gray-900">Support</Link>
            </div>
          </div>
          {/* ✅ Dynamic year */}
          <p className="text-center text-xs text-gray-400 mt-4">
            © {currentYear} University Events Committee. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function EventsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    }>
      <EventsContent />
    </Suspense>
  );
}