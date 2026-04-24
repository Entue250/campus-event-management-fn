"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { CalendarDays, MapPin, Tag, ChevronRight } from "lucide-react";
import { getEvents } from "@/services/eventService";
import { getCategories } from "@/services/adminService";
import { formatDate, cn } from "@/utils/helpers";
import type { Event, Category } from "@/types";

const BADGE_COLOURS: Record<string, string> = {
  ACADEMIC: "bg-blue-600 text-white",
  SOCIAL: "bg-green-600 text-white",
  SPORTS: "bg-orange-500 text-white",
  WORKSHOPS: "bg-purple-600 text-white",
  ARTS: "bg-pink-500 text-white",
};

export default function StudentBrowseEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [selCategory, setSelCategory] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number | undefined> = {};
      if (search) params.search = search;
      if (selCategory) params.category = selCategory;
      const res = await getEvents(params as Parameters<typeof getEvents>[0]);
      setEvents(res.results);
    } catch { /* silent */ } finally { setLoading(false); }
  }, [search, selCategory]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);
  useEffect(() => { getCategories().then(setCategories).catch(() => {}); }, []);

  return (
    <div className="flex-1 bg-gray-50 min-h-screen">
      {/* Top bar */}
      <header className="bg-white border-b border-gray-200 px-6 h-14 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-[#1a2744] flex items-center justify-center">
            <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          </div>
          <span className="font-bold text-gray-900 text-sm">Campus Events</span>
        </div>
        <div className="flex items-center gap-3">
          <button className="h-8 w-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
          </button>
          <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
            <svg className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
          </div>
        </div>
      </header>

      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Browse Events</h1>
        <p className="text-gray-500 mb-5">Discover what&apos;s happening around campus today.</p>

        {/* Filters bar */}
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <div className="relative flex-1 min-w-64">
            <input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key==="Enter" && fetchEvents()}
              placeholder="Search events by name or keyword..."
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-[#1a2744]/30" />
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
          <div className="relative">
            <select value={selCategory} onChange={e => setSelCategory(e.target.value)}
              className="pl-9 pr-10 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none appearance-none min-w-[160px]">
              <option value="">All Categories</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 rotate-90 pointer-events-none" />
          </div>
          <div className="relative">
            <button className="flex items-center gap-2 pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-white hover:bg-gray-50 min-w-[140px]">
              <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              Date Range <ChevronRight className="h-4 w-4 text-gray-400 rotate-90 ml-auto" />
            </button>
          </div>
          <button onClick={fetchEvents}
            className="px-5 py-2.5 bg-[#1a2744] text-white text-sm font-semibold rounded-xl hover:bg-[#0f1a35] transition-colors">
            Apply Filters
          </button>
        </div>

        {/* Event grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {[...Array(6)].map((_,i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-200 overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-200" />
                <div className="p-4 space-y-3">
                  <div className="h-3 bg-gray-100 rounded w-1/4" />
                  <div className="h-4 bg-gray-100 rounded w-3/4" />
                  <div className="h-3 bg-gray-50 rounded w-1/2" />
                  <div className="h-8 bg-gray-50 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-16 text-gray-400">No events found</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {events.map((ev) => {
              const catName = ev.category?.name?.toUpperCase() ?? "EVENT";
              const badgeCls = BADGE_COLOURS[catName] ?? "bg-gray-700 text-white";
              return (
                <div key={ev.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow flex flex-col">
                  <div className="relative h-48 bg-gradient-to-br from-gray-700 to-gray-900">
                    {ev.banner_image && (
                      <img src={ev.banner_image} alt={ev.title} className="w-full h-full object-cover" />
                    )}
                    <span className={`absolute top-3 left-3 text-[10px] font-bold uppercase px-2 py-0.5 rounded ${badgeCls}`}>
                      {ev.category?.name ?? "Event"}
                    </span>
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <p className="text-xs text-gray-400 mb-1.5 flex items-center gap-1">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {formatDate(ev.event_date)}
                    </p>
                    <h3 className="font-bold text-gray-900 text-base mb-1.5 line-clamp-2">{ev.title}</h3>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mb-4">
                      <MapPin className="h-3.5 w-3.5 shrink-0" />{ev.location}
                    </p>
                    <Link href={`/events/${ev.id}`}
                      className="mt-auto block text-center py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
                      View Details
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
