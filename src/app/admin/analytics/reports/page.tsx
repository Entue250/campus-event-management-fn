"use client";
// Placement: src/app/admin/analytics/reports/page.tsx
//
// Monthly Report page.
// Breadcrumb: Admin > Analytics > Reports
// Endpoint: GET /admin/analytics/monthly-report?month=N&year=N

import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  BarChart3,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  ChevronRight,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import { useMonthlyReport } from "@/hooks/useAnalytics";
import { formatDate, cn } from "@/utils/helpers";
import type { MonthlyReportEvent } from "@/services/analyticsService";

// ── Colour palette ────────────────────────────────────────────────────────────
const CHART_COLOURS = ["#1a2744", "#3b82f6", "#10b981", "#f59e0b"];

// ── Status badge ──────────────────────────────────────────────────────────────
const STATUS_STYLE: Record<string, string> = {
  UPCOMING:  "bg-blue-100 text-blue-700",
  ONGOING:   "bg-yellow-100 text-yellow-700",
  COMPLETED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-600",
};

// ── Month options ─────────────────────────────────────────────────────────────
const MONTHS = [
  { value: 1,  label: "January"   },
  { value: 2,  label: "February"  },
  { value: 3,  label: "March"     },
  { value: 4,  label: "April"     },
  { value: 5,  label: "May"       },
  { value: 6,  label: "June"      },
  { value: 7,  label: "July"      },
  { value: 8,  label: "August"    },
  { value: 9,  label: "September" },
  { value: 10, label: "October"   },
  { value: 11, label: "November"  },
  { value: 12, label: "December"  },
];

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = [CURRENT_YEAR - 1, CURRENT_YEAR, CURRENT_YEAR + 1];

// ── Stat tile ─────────────────────────────────────────────────────────────────
function StatTile({
  icon: Icon,
  label,
  value,
  iconBg,
  iconCls,
  loading,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  iconBg: string;
  iconCls: string;
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
        <div className="h-10 w-10 bg-gray-100 rounded-xl mb-3" />
        <div className="h-3 bg-gray-100 rounded w-24 mb-2" />
        <div className="h-7 bg-gray-100 rounded w-12" />
      </div>
    );
  }
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center mb-3", iconBg)}>
        <Icon className={cn("h-5 w-5", iconCls)} />
      </div>
      <p className="text-gray-500 text-sm">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value.toLocaleString()}</p>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function MonthlyReportsPage() {
  const {
    data,
    loading,
    error,
    month,
    year,
    setMonth,
    setYear,
    refetch,
  } = useMonthlyReport();

  const inputCls =
    "border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a2744]/20 bg-white appearance-none";

  if (error) {
    return (
      <div className="flex-1 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-10 w-10 text-red-400 mx-auto mb-3" />
          <p className="text-gray-700 font-semibold mb-1">Failed to load report</p>
          <p className="text-sm text-gray-400 mb-4">{error}</p>
          <button
            onClick={refetch}
            className="flex items-center gap-2 px-4 py-2 bg-[#1a2744] text-white text-sm font-semibold rounded-lg mx-auto"
          >
            <RefreshCw className="h-4 w-4" /> Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gray-50 min-h-screen">
      {/* ── Top bar ─────────────────────────────────────────────────────── */}
      <header className="bg-white border-b border-gray-200 px-6 h-14 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/analytics"
            className="h-8 w-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
            aria-label="Back to analytics"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <h1 className="font-semibold text-gray-900">Monthly Report</h1>
        </div>

        {/* Month / Year selectors + Refresh */}
        <div className="flex items-center gap-2">
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className={inputCls}
          >
            {MONTHS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>

          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className={inputCls}
          >
            {YEAR_OPTIONS.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>

          <button
            onClick={refetch}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
            Refresh
          </button>
        </div>
      </header>

      <div className="p-6">
        {/* ── Breadcrumb ───────────────────────────────────────────────── */}
        <div className="flex items-center gap-1 text-sm text-gray-400 mb-4">
          <Link href="/admin" className="hover:text-gray-600">Admin</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href="/admin/analytics" className="hover:text-gray-600">Analytics</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-gray-700">Reports</span>
        </div>

        {/* ── Period heading ────────────────────────────────────────────── */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {data
              ? `${data.period.month_name} ${data.period.year} Report`
              : "Monthly Report"}
          </h1>
          <p className="text-gray-500 mt-1">
            Event and registration summary for the selected period.
          </p>
        </div>

        {/* ── Event stat cards ──────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatTile
            icon={Calendar}
            label="Total Events"
            value={data?.events.total ?? 0}
            iconBg="bg-blue-50"
            iconCls="text-blue-600"
            loading={loading}
          />
          <StatTile
            icon={Clock}
            label="Upcoming"
            value={data?.events.upcoming ?? 0}
            iconBg="bg-yellow-50"
            iconCls="text-yellow-600"
            loading={loading}
          />
          <StatTile
            icon={CheckCircle}
            label="Completed"
            value={data?.events.completed ?? 0}
            iconBg="bg-green-50"
            iconCls="text-green-600"
            loading={loading}
          />
          <StatTile
            icon={XCircle}
            label="Cancelled"
            value={data?.events.cancelled ?? 0}
            iconBg="bg-red-50"
            iconCls="text-red-500"
            loading={loading}
          />
        </div>

        {/* ── Registration stat cards ───────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <StatTile
            icon={BarChart3}
            label="Total Registrations"
            value={data?.registrations.total ?? 0}
            iconBg="bg-[#1a2744]/10"
            iconCls="text-[#1a2744]"
            loading={loading}
          />
          <StatTile
            icon={CheckCircle}
            label="Active Registrations"
            value={data?.registrations.active ?? 0}
            iconBg="bg-green-50"
            iconCls="text-green-600"
            loading={loading}
          />
          <StatTile
            icon={XCircle}
            label="Cancelled Registrations"
            value={data?.registrations.cancelled ?? 0}
            iconBg="bg-red-50"
            iconCls="text-red-500"
            loading={loading}
          />
        </div>

        {/* ── Weekly breakdown chart ────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-bold text-gray-900 mb-4 text-base">
              Weekly Registration Breakdown
            </h2>
            {loading ? (
              <div className="h-[200px] bg-gray-50 rounded-xl animate-pulse" />
            ) : !data || data.registrations.weekly_breakdown.length === 0 ? (
              <div className="h-[200px] flex items-center justify-center text-gray-400 text-sm">
                No weekly data for this period
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={data.registrations.weekly_breakdown} barSize={36}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis
                    dataKey="week"
                    tick={{ fontSize: 10, fill: "#9ca3af" }}
                    tickFormatter={(v: string) =>
                      new Date(v).toLocaleDateString("en", {
                        month: "short",
                        day: "numeric",
                      })
                    }
                  />
                  <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }}
                    labelFormatter={(v: unknown) => {
                      const str = String(v ?? "");
                      if (!str) return str;
                      return `Week of ${new Date(str).toLocaleDateString("en", {
                        month: "long",
                        day: "numeric",
                      })}`;
                    }}
                  />
                  <Bar dataKey="count" name="Registrations" radius={[4, 4, 0, 0]}>
                    {data.registrations.weekly_breakdown.map((_, i) => (
                      <Cell key={i} fill={CHART_COLOURS[i % CHART_COLOURS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Period summary card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-bold text-gray-900 mb-4 text-base">Period Summary</h2>
            {loading ? (
              <div className="space-y-3 animate-pulse">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-10 bg-gray-100 rounded-lg" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {[
                  {
                    label: "Period",
                    value: data
                      ? `${data.period.month_name} ${data.period.year}`
                      : "—",
                  },
                  {
                    label: "Total Events",
                    value: data?.events.total ?? 0,
                  },
                  {
                    label: "Total Registrations",
                    value: data?.registrations.total ?? 0,
                  },
                  {
                    label: "Active Registrations",
                    value: data?.registrations.active ?? 0,
                  },
                  {
                    label: "Cancellation Rate",
                    value:
                      data && data.registrations.total > 0
                        ? `${Math.round(
                            (data.registrations.cancelled /
                              data.registrations.total) *
                              100
                          )}%`
                        : "0%",
                  },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className="flex items-center justify-between px-4 py-2.5 rounded-lg bg-gray-50"
                  >
                    <span className="text-sm text-gray-600">{label}</span>
                    <span className="text-sm font-bold text-gray-900">{value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Event list table ──────────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-5 border-b border-gray-100">
            <h2 className="font-bold text-gray-900">
              Events in{" "}
              {data
                ? `${data.period.month_name} ${data.period.year}`
                : "this period"}
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Full list of events scheduled or completed during this period.
            </p>
          </div>

          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {["TITLE", "ORGANIZER", "DATE", "STATUS"].map((h) => (
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
                [...Array(4)].map((_, i) => (
                  <tr key={i} className="border-b border-gray-50 animate-pulse">
                    <td className="py-4 px-4">
                      <div className="h-3 bg-gray-100 rounded w-3/4" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-3 bg-gray-100 rounded w-32" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-3 bg-gray-100 rounded w-24" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-6 bg-gray-100 rounded w-20" />
                    </td>
                  </tr>
                ))
              ) : !data || data.events.list.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="py-12 text-center text-gray-400 text-sm"
                  >
                    No events found for this period
                  </td>
                </tr>
              ) : (
                data.events.list.map((ev: MonthlyReportEvent) => (
                  <tr
                    key={ev.id}
                    className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <p className="font-semibold text-gray-900 line-clamp-1">
                        {ev.title}
                      </p>
                    </td>
                    <td className="py-4 px-4 text-gray-500">{ev.organizer}</td>
                    <td className="py-4 px-4 text-gray-500 whitespace-nowrap">
                      {formatDate(ev.event_date)}
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={cn(
                          "text-xs font-semibold px-2.5 py-1 rounded-full",
                          STATUS_STYLE[ev.status] ?? "bg-gray-100 text-gray-600"
                        )}
                      >
                        {ev.status.charAt(0) + ev.status.slice(1).toLowerCase()}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}