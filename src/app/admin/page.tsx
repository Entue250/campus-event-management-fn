"use client";
// Placement: src/app/admin/page.tsx
//
// Fix: Top Performing Events "Category" column was showing "Loading..."
// because TopEvent from the analytics overview API has no category field.
// Solution: fetch the admin events list and build an eventCategoryMap
// keyed by event id → category name. This map is then used in the
// catLabel resolver instead of trying to read ev.category (which is
// always undefined on a TopEvent).

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/services/api";
import {
  CalendarDays, Users, ClipboardList, TrendingUp,
  AlertTriangle, Database, HardDrive, Activity, Wifi,
} from "lucide-react";
import { getAnalyticsOverview, getCategories } from "@/services/adminService";
import { getPopularEvents, getAdminEvents } from "@/services/eventService";
import { formatDate } from "@/utils/helpers";
import type { AnalyticsOverview, Event } from "@/types";

// ── Types ─────────────────────────────────────────────────────────────────────

interface SystemHealth {
  status: string;
  timestamp: string;
  django_version: string;
  components: {
    database: { status: string };
    media_storage: { status: string; path?: string };
  };
}

interface EventListItem extends Omit<Event, "category"> {
  category_name?: string;
  category?: string | { id: string; name: string } | null;
  capacity?: number;
  registered_count?: number;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getCategoryLabel(
  ev: EventListItem,
  categoryMap: Record<string, string>
): string {
  if (ev.category_name) return ev.category_name;
  if (ev.category && typeof ev.category === "object" && "name" in ev.category) {
    return (ev.category as { name: string }).name;
  }
  if (typeof ev.category === "string") return categoryMap[ev.category] ?? "—";
  return "—";
}

const STATUS_STYLE: Record<string, string> = {
  COMPLETED: "bg-green-100 text-green-700",
  UPCOMING:  "bg-blue-100  text-blue-700",
  ONGOING:   "bg-teal-100  text-teal-700",
  CANCELLED: "bg-red-100   text-red-600",
  OPEN:      "bg-blue-100  text-blue-700",
  PLANNING:  "bg-yellow-100 text-yellow-700",
};

const HEALTH_COLOUR = (s: string) =>
  s === "healthy" ? "text-green-600" : s === "degraded" ? "text-yellow-600" : "text-red-600";
const HEALTH_BG = (s: string) =>
  s === "healthy" ? "bg-green-50" : s === "degraded" ? "bg-yellow-50" : "bg-red-50";
const HEALTH_DOT = (s: string) =>
  s === "healthy" ? "bg-green-500" : s === "degraded" ? "bg-yellow-500" : "bg-red-500";

// ── Component ─────────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const [analytics, setAnalytics]       = useState<AnalyticsOverview | null>(null);
  const [popularEvents, setPopularEvents] = useState<EventListItem[]>([]);
  const [health, setHealth]             = useState<SystemHealth | null>(null);
  const [loadingHealth, setLoadingHealth] = useState(true);

  // category id → name (used by the "Popular Events" list)
  const [categoryMap, setCategoryMap] = useState<Record<string, string>>({});

  // event id → category name (used by "Top Performing Events" table)
  // TopEvent from the analytics overview has no category field, so we
  // enrich by fetching the admin events list and indexing by id.
  const [eventCategoryMap, setEventCategoryMap] = useState<Record<string, string>>({});

  useEffect(() => {
    // ── Analytics overview ──────────────────────────────────────────────────
    getAnalyticsOverview()
      .then(setAnalytics)
      .catch(() => {});

    // ── Popular events (for the card list) ──────────────────────────────────
    getPopularEvents(6)
      .then((evs) => setPopularEvents(evs as EventListItem[]))
      .catch(() => {});

    // ── System health ────────────────────────────────────────────────────────
    api
      .get<SystemHealth>("/admin/system/health")
      .then(({ data }) => setHealth(data))
      .catch(() => {})
      .finally(() => setLoadingHealth(false));

    // ── Category id → name map (for popular events list) ────────────────────
    getCategories()
      .then((cats) => {
        const map: Record<string, string> = {};
        for (const c of cats) map[c.id] = c.name;
        setCategoryMap(map);
      })
      .catch(() => {});

    // ── Event id → category name map (for Top Performing Events table) ───────
    // The analytics overview `top_events` array only has:
    //   { id, title, event_date, reg_count }
    // There is no `category` field, so categoryMap can't help.
    // We fetch the admin event list (which returns category_name) and build
    // a lookup so the table can resolve event id → category name instantly.
    getAdminEvents({ page: 1 })
      .then((res) => {
        const map: Record<string, string> = {};
        for (const ev of res.results) {
          // category_name is a flat field returned by the admin list endpoint
          const evExtended = ev as Event & { category_name?: string };
          if (evExtended.category_name) {
            map[ev.id] = evExtended.category_name;
          } else if (ev.category && typeof ev.category === "object" && ev.category !== null) {
            map[ev.id] = ev.category.name;
          }
        }
        setEventCategoryMap(map);
      })
      .catch(() => {});
  }, []);

  // ── Derived values ────────────────────────────────────────────────────────
  const stats = [
    {
      label: "Total Events",
      value: analytics?.events?.total,
      change: `+${analytics?.events?.created_this_month ?? 0} this month`,
      icon: CalendarDays, iconBg: "bg-blue-50", iconColor: "text-blue-600", positive: true,
    },
    {
      label: "Upcoming Events",
      value: analytics?.events?.upcoming,
      change: `${analytics?.events?.ongoing ?? 0} ongoing`,
      icon: TrendingUp, iconBg: "bg-orange-50", iconColor: "text-orange-500", positive: true,
    },
    {
      label: "Total Registrations",
      value: analytics?.registrations?.total,
      change: `+${analytics?.registrations?.this_month ?? 0} this month`,
      icon: ClipboardList, iconBg: "bg-purple-50", iconColor: "text-purple-600", positive: true,
    },
    {
      label: "Active Users",
      value: analytics?.users?.active,
      change: `+${analytics?.users?.new_this_month ?? 0} this month`,
      icon: Users, iconBg: "bg-green-50", iconColor: "text-green-600", positive: true,
    },
  ];

  const trend     = analytics?.monthly_registration_trend ?? [];
  const maxTrend  = Math.max(...trend.map((t) => t.registrations), 1);
  const topEvents = analytics?.top_events ?? [];

  const dateLabel = new Date().toLocaleDateString("en", {
    weekday: "short", month: "short", day: "numeric",
  });

  return (
    <div className="flex-1 bg-gray-50 min-h-screen">

      {/* ── Top bar ─────────────────────────────────────────────────────── */}
      <header className="bg-white border-b border-gray-200 px-6 h-14 flex items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <input
            placeholder="Search events, students, or venues..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-1 focus:ring-[#1a2744]/30"
          />
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <div className="flex items-center gap-3">
          <button className="h-9 w-9 border border-gray-200 rounded-lg flex items-center justify-center text-gray-500">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>
          <button className="h-9 w-9 border border-gray-200 rounded-lg flex items-center justify-center text-gray-500">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-3 3v-3z" />
            </svg>
          </button>
          <span className="text-sm text-gray-500">{dateLabel}</span>
        </div>
      </header>

      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Dashboard Overview</h1>
        <p className="text-gray-500 mb-6">Real-time analytics for your campus activity engagement.</p>

        {/* ── Stats ────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {stats.map(({ label, value, change, icon: Icon, iconBg, iconColor, positive }) => (
            <div key={label} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-start justify-between mb-3">
                <div className={`h-10 w-10 ${iconBg} rounded-xl flex items-center justify-center`}>
                  <Icon className={`h-5 w-5 ${iconColor}`} />
                </div>
                <span className={`text-xs font-bold ${positive ? "text-green-600" : "text-red-500"}`}>
                  {change}
                </span>
              </div>
              <p className="text-gray-500 text-sm">{label}</p>
              <p className="text-2xl font-bold text-gray-900">
                {value !== undefined ? (
                  value.toLocaleString()
                ) : (
                  <span className="inline-block h-7 w-16 bg-gray-100 rounded animate-pulse" />
                )}
              </p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">

          {/* ── Monthly registration trend chart ─────────────────────── */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-5">
              <div>
                <h2 className="font-bold text-gray-900">Monthly Registration Trend</h2>
                <p className="text-sm text-gray-400">
                  {trend.length > 0
                    ? `${trend[0].month} – ${trend[trend.length - 1].month}`
                    : "Loading data..."}
                </p>
              </div>
              {trend.length > 0 && (
                <div className="text-right">
                  <p className="text-xs text-gray-400">Total this period</p>
                  <p className="text-lg font-bold text-gray-900">
                    {trend.reduce((s, t) => s + t.registrations, 0).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
            {trend.length === 0 ? (
              <div className="flex items-end gap-3 h-44 border-b border-gray-100">
                {[40, 55, 45, 70, 80, 65].map((h, i) => (
                  <div key={i} className="flex-1">
                    <div className="w-full rounded-t-sm bg-gray-100 animate-pulse" style={{ height: `${h * 1.2}px` }} />
                  </div>
                ))}
              </div>
            ) : (
              <>
                <div className="flex items-end gap-2 h-44 border-b border-gray-100">
                  {trend.map(({ month, registrations }) => {
                    const pct = Math.round((registrations / maxTrend) * 100);
                    return (
                      <div key={month} className="flex-1 flex flex-col items-center group relative">
                        <div className="absolute bottom-full mb-1 hidden group-hover:flex flex-col items-center pointer-events-none">
                          <div className="bg-gray-900 text-white text-[10px] font-semibold px-2 py-1 rounded whitespace-nowrap">
                            {registrations} registrations
                          </div>
                          <div className="border-4 border-transparent border-t-gray-900" />
                        </div>
                        <div
                          className="w-full rounded-t bg-[#1a2744] transition-all duration-500"
                          style={{ height: `${Math.max(pct * 1.44, 4)}px` }}
                        />
                      </div>
                    );
                  })}
                </div>
                <div className="flex gap-2 mt-2">
                  {trend.map(({ month }) => (
                    <div key={month} className="flex-1 text-center text-[10px] text-gray-400 truncate">
                      {month}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* ── System Health ─────────────────────────────────────────── */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900">System Health</h2>
              <Activity className="h-4 w-4 text-gray-400" />
            </div>
            {loadingHealth ? (
              <div className="space-y-3">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="h-14 rounded-lg bg-gray-100 animate-pulse" />
                ))}
              </div>
            ) : health ? (
              <div className="space-y-3">
                <div className={`rounded-lg p-3 flex items-center gap-3 ${HEALTH_BG(health.status)}`}>
                  <div className={`h-2.5 w-2.5 rounded-full shrink-0 ${HEALTH_DOT(health.status)}`} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-bold capitalize ${HEALTH_COLOUR(health.status)}`}>
                      System {health.status}
                    </p>
                    <p className="text-[10px] text-gray-400">Django {health.django_version}</p>
                  </div>
                  <Wifi className={`h-4 w-4 shrink-0 ${HEALTH_COLOUR(health.status)}`} />
                </div>

                <div className={`rounded-lg p-3 flex items-center gap-3 ${HEALTH_BG(health.components.database.status)}`}>
                  <div className={`h-2.5 w-2.5 rounded-full shrink-0 ${HEALTH_DOT(health.components.database.status)}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">Database</p>
                    <p className={`text-[10px] font-medium capitalize ${HEALTH_COLOUR(health.components.database.status)}`}>
                      {health.components.database.status}
                    </p>
                  </div>
                  <Database className={`h-4 w-4 shrink-0 ${HEALTH_COLOUR(health.components.database.status)}`} />
                </div>

                <div className={`rounded-lg p-3 flex items-center gap-3 ${HEALTH_BG(health.components.media_storage.status)}`}>
                  <div className={`h-2.5 w-2.5 rounded-full shrink-0 ${HEALTH_DOT(health.components.media_storage.status)}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">Media Storage</p>
                    <p className={`text-[10px] font-medium capitalize ${HEALTH_COLOUR(health.components.media_storage.status)}`}>
                      {health.components.media_storage.status}
                    </p>
                  </div>
                  <HardDrive className={`h-4 w-4 shrink-0 ${HEALTH_COLOUR(health.components.media_storage.status)}`} />
                </div>

                <p className="text-[10px] text-gray-400 text-right pt-1">
                  Checked{" "}
                  {new Date(health.timestamp).toLocaleTimeString("en", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-gray-400">
                <AlertTriangle className="h-8 w-8 mb-2" />
                <p className="text-sm">Health check unavailable</p>
              </div>
            )}
          </div>
        </div>

        {/* ── Category breakdown + Popular events ──────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="font-bold text-gray-900 mb-4">Events by Category</h2>
            {(analytics?.category_breakdown ?? []).length === 0 ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((n) => (
                  <div key={n} className="h-8 rounded bg-gray-100 animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {analytics!.category_breakdown.slice(0, 6).map((cat, i) => {
                  const maxCount = Math.max(
                    ...analytics!.category_breakdown.map((c) => c.event_count),
                    1
                  );
                  const pct = Math.round((cat.event_count / maxCount) * 100);
                  const COLOURS = [
                    "bg-blue-500", "bg-emerald-500", "bg-orange-500",
                    "bg-purple-500", "bg-pink-500", "bg-teal-500",
                  ];
                  return (
                    <div key={cat.id}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-700 font-medium truncate max-w-[70%]">
                          {cat.name}
                        </span>
                        <span className="text-gray-400">{cat.event_count}</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${COLOURS[i % COLOURS.length]}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900">Most Popular Events</h2>
              <Link href="/admin/events" className="text-sm font-semibold text-[#1a2744] hover:underline">
                View All
              </Link>
            </div>
            {popularEvents.length === 0 ? (
              <div className="space-y-3">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="h-12 rounded-lg bg-gray-100 animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {popularEvents.map((ev, i) => {
                  const cap    = (ev as EventListItem).capacity ?? 0;
                  const reg    = (ev as EventListItem).registered_count ?? 0;
                  const status = ev.status ?? "UPCOMING";
                  return (
                    <div
                      key={ev.id}
                      className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors"
                    >
                      <span className="text-xs font-bold text-gray-300 w-5 shrink-0">
                        #{i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{ev.title}</p>
                        <p className="text-xs text-gray-400">
                          {getCategoryLabel(ev, categoryMap)} · {formatDate(ev.event_date)}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${STATUS_STYLE[status] ?? "bg-gray-100 text-gray-600"}`}
                        >
                          {status}
                        </span>
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          {reg}{cap > 0 ? `/${cap}` : ""} registered
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── Top Performing Events table ───────────────────────────────── */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900">Top Performing Events</h2>
            <Link href="/admin/events" className="text-sm font-semibold text-[#1a2744] hover:underline">
              Manage All Events
            </Link>
          </div>

          {topEvents.length === 0 ? (
            <div className="space-y-2">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-12 rounded bg-gray-100 animate-pulse" />
              ))}
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {["EVENT NAME", "CATEGORY", "DATE", "REGISTRATIONS", "STATUS"].map((h) => (
                    <th
                      key={h}
                      className="text-left py-2.5 px-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {topEvents.map((ev) => {
                  const regCount = typeof ev.reg_count === "number" ? ev.reg_count : 0;
                  const maxCap   = typeof ev.max_capacity === "number" ? ev.max_capacity : 0;
                  const pct      = maxCap > 0 ? (regCount / maxCap) * 100 : Math.min(regCount * 10, 100);
                  const status   = (ev as typeof ev & { status?: string }).status ?? "UPCOMING";

                  // ── Resolve category for this event ──────────────────────
                  // TopEvent has no category field, so we look up the event
                  // in the eventCategoryMap (built from the admin events list).
                  // Falls back to "—" if the admin events list hasn't loaded yet
                  // or the event isn't in the first page.
                  const catLabel = eventCategoryMap[ev.id] ?? "—";

                  return (
                    <tr
                      key={ev.id}
                      className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-3 px-2 font-semibold text-gray-900 max-w-[200px] truncate">
                        {ev.title}
                      </td>
                      <td className="py-3 px-2 text-gray-500">{catLabel}</td>
                      <td className="py-3 px-2 text-gray-500 whitespace-nowrap">
                        {formatDate(ev.event_date)}
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#1a2744] rounded-full"
                              style={{ width: `${Math.min(pct, 100)}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-600 shrink-0">
                            {regCount}{maxCap > 0 ? `/${maxCap}` : ""}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <span
                          className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${STATUS_STYLE[status] ?? "bg-gray-100 text-gray-600"}`}
                        >
                          {status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}