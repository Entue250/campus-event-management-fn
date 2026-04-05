"use client";
// Placement: src/app/admin/analytics/page.tsx
//
// Real data from GET /admin/analytics/overview.
// Charts via Recharts (already available in the project via CDN in artifacts;
// install: npm install recharts).
// No dummy data. UI structure preserved from original design.

import Link from "next/link";
import { useMemo } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  BarChart3,
  TrendingUp,
  Users,
  Calendar,
  RefreshCw,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  ChevronRight,
} from "lucide-react";
import { useAnalyticsOverview } from "@/hooks/useAnalytics";
import { formatDate, cn } from "@/utils/helpers";
import type { TopEvent, MonthlyTrend, CategoryStat } from "@/types";

// ── Palette for charts ────────────────────────────────────────────────────────
const CHART_COLOURS = [
  "#1a2744",
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#ef4444",
  "#06b6d4",
];

// ── Stat card ─────────────────────────────────────────────────────────────────
interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  change?: string;
  positive?: boolean;
  iconBg?: string;
  iconCls?: string;
  loading?: boolean;
}

function StatCard({
  icon: Icon,
  label,
  value,
  change,
  positive = true,
  iconBg = "bg-blue-50",
  iconCls = "text-blue-600",
  loading = false,
}: StatCardProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
        <div className="flex items-start justify-between mb-3">
          <div className="h-10 w-10 bg-gray-100 rounded-xl" />
          <div className="h-4 w-10 bg-gray-100 rounded" />
        </div>
        <div className="h-3 bg-gray-100 rounded w-24 mb-2" />
        <div className="h-7 bg-gray-100 rounded w-16" />
      </div>
    );
  }
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-start justify-between mb-3">
        <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center", iconBg)}>
          <Icon className={cn("h-5 w-5", iconCls)} />
        </div>
        {change && (
          <span className={cn("text-xs font-bold", positive ? "text-green-600" : "text-red-500")}>
            {change}
          </span>
        )}
      </div>
      <p className="text-gray-500 text-sm">{label}</p>
      <p className="text-2xl font-bold text-gray-900">
        {typeof value === "number" ? value.toLocaleString() : value}
      </p>
    </div>
  );
}

// ── Section heading ───────────────────────────────────────────────────────────
function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-bold text-gray-900 text-base mb-4">{children}</h2>
  );
}

// ── Chart skeleton ────────────────────────────────────────────────────────────
function ChartSkeleton({ height = 220 }: { height?: number }) {
  return (
    <div
      className="bg-gray-50 rounded-xl animate-pulse"
      style={{ height }}
    />
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function AnalyticsPage() {
  const { data, loading, error, refetch } = useAnalyticsOverview();

  // ── Derived chart data ─────────────────────────────────────────────────
  const trendData = useMemo<MonthlyTrend[]>(
    () => data?.monthly_registration_trend ?? [],
    [data]
  );

  const categoryData = useMemo<CategoryStat[]>(
    () => data?.category_breakdown ?? [],
    [data]
  );

  const topEvents = useMemo<TopEvent[]>(
    () => data?.top_events ?? [],
    [data]
  );

  // Event status breakdown for bar chart
  const eventStatusData = useMemo(
    () =>
      data
        ? [
          { name: "Upcoming", value: data.events.upcoming },
          { name: "Ongoing", value: data.events.ongoing },
          { name: "Completed", value: data.events.completed },
          { name: "Cancelled", value: data.events.cancelled },
        ]
        : [],
    [data]
  );

  // Registration breakdown for mini pie
  const regBreakdown = useMemo(
    () =>
      data
        ? [
          { name: "Active", value: data.registrations.active },
          { name: "Attended", value: data.registrations.attended },
          { name: "Cancelled", value: data.registrations.cancelled },
        ]
        : [],
    [data]
  );

  // User breakdown
  const userBreakdown = useMemo(
    () =>
      data
        ? [
          { name: "Students", value: data.users.students },
          { name: "Admins", value: data.users.admins },
        ]
        : [],
    [data]
  );

  if (error) {
    return (
      <div className="flex-1 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-10 w-10 text-red-400 mx-auto mb-3" />
          <p className="text-gray-700 font-semibold mb-1">Failed to load analytics</p>
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
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <BarChart3 className="h-4 w-4" />
          Reports &amp; Analytics
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={refetch}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
            Refresh
          </button>
          <Link
            href="/admin/analytics/reports"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1a2744] text-white text-sm font-semibold rounded-lg hover:bg-[#0f1a35] transition-colors"
          >
            <FileText className="h-3.5 w-3.5" />
            Monthly Report
          </Link>
        </div>
      </header>

      <div className="p-6">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-2xl font-bold text-gray-900">Reports &amp; Analytics</h1>
          {data?.generated_at && (
            <p className="text-xs text-gray-400">
              Last updated: {formatDate(data.generated_at)}
            </p>
          )}
        </div>
        <p className="text-gray-500 mb-6">
          In-depth analytics and reporting for campus events.
        </p>

        {/* ── Stat cards — 4 columns ───────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            icon={Calendar}
            label="Total Events"
            value={data?.events.total ?? 0}
            change={`+${data?.events.created_this_month ?? 0} this month`}
            iconBg="bg-blue-50"
            iconCls="text-blue-600"
            loading={loading}
          />
          <StatCard
            icon={Users}
            label="Total Registrations"
            value={data?.registrations.total ?? 0}
            change={`+${data?.registrations.this_week ?? 0} this week`}
            iconBg="bg-green-50"
            iconCls="text-green-600"
            loading={loading}
          />
          <StatCard
            icon={TrendingUp}
            label="Active Users"
            value={data?.users.active ?? 0}
            change={`+${data?.users.new_this_month ?? 0} this month`}
            iconBg="bg-purple-50"
            iconCls="text-purple-600"
            loading={loading}
          />
          <StatCard
            icon={BarChart3}
            label="Upcoming Events"
            value={data?.events.upcoming ?? 0}
            change={`${data?.events.published ?? 0} published`}
            iconBg="bg-orange-50"
            iconCls="text-orange-600"
            loading={loading}
          />
        </div>

        {/* ── Second row of stats ──────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            icon={Users}
            label="Total Users"
            value={data?.users.total ?? 0}
            iconBg="bg-teal-50"
            iconCls="text-teal-600"
            loading={loading}
          />
          <StatCard
            icon={CheckCircle}
            label="Attended"
            value={data?.registrations.attended ?? 0}
            iconBg="bg-green-50"
            iconCls="text-green-600"
            loading={loading}
          />
          <StatCard
            icon={Clock}
            label="Support Tickets"
            value={data?.support.total ?? 0}
            change={data?.support.urgent ? `${data.support.urgent} urgent` : undefined}
            positive={false}
            iconBg="bg-red-50"
            iconCls="text-red-500"
            loading={loading}
          />
          <StatCard
            icon={TrendingUp}
            label="New This Week"
            value={data?.users.new_this_week ?? 0}
            iconBg="bg-indigo-50"
            iconCls="text-indigo-600"
            loading={loading}
          />
        </div>

        {/* ── Charts row 1: Registration Trend + Event Status ──────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
          {/* Monthly Registration Trend */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <SectionTitle>Monthly Registration Trend</SectionTitle>
            {loading ? (
              <ChartSkeleton />
            ) : trendData.length === 0 ? (
              <div className="h-[220px] flex items-center justify-center text-gray-400 text-sm">
                No trend data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 11, fill: "#9ca3af" }}
                    tickFormatter={(v: string) => {
                      const [yr, mo] = v.split("-");
                      return new Date(Number(yr), Number(mo) - 1).toLocaleString("en", {
                        month: "short",
                      });
                    }}
                  />
                  <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }}
                    labelFormatter={(v: unknown) => {
                      const str = String(v ?? "");
                      const [yr, mo] = str.split("-");
                      if (!yr || !mo) return str;
                      return new Date(Number(yr), Number(mo) - 1).toLocaleString("en", {
                        month: "long",
                        year: "numeric",
                      });
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="registrations"
                    stroke={CHART_COLOURS[0]}
                    strokeWidth={2.5}
                    dot={{ fill: CHART_COLOURS[0], r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Event Status Breakdown */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <SectionTitle>Event Status Breakdown</SectionTitle>
            {loading ? (
              <ChartSkeleton />
            ) : eventStatusData.every((d) => d.value === 0) ? (
              <div className="h-[220px] flex items-center justify-center text-gray-400 text-sm">
                No event data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={eventStatusData} barSize={36}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#9ca3af" }} />
                  <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }}
                  />
                  <Bar dataKey="value" name="Events" radius={[4, 4, 0, 0]}>
                    {eventStatusData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLOURS[i % CHART_COLOURS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* ── Charts row 2: Category Breakdown + Registration Breakdown ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
          {/* Category Breakdown — horizontal bar */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <SectionTitle>Events by Category</SectionTitle>
            {loading ? (
              <ChartSkeleton height={260} />
            ) : categoryData.length === 0 ? (
              <div className="h-[260px] flex items-center justify-center text-gray-400 text-sm">
                No category data
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart
                  layout="vertical"
                  data={categoryData}
                  margin={{ left: 8 }}
                  barSize={18}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: "#9ca3af" }} allowDecimals={false} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 10, fill: "#6b7280" }}
                    width={130}
                  />
                  <Tooltip
                    contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }}
                  />
                  <Bar dataKey="event_count" name="Events" radius={[0, 4, 4, 0]}>
                    {categoryData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLOURS[i % CHART_COLOURS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Registration + User breakdown — two mini pies */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <SectionTitle>Registrations &amp; Users</SectionTitle>
            {loading ? (
              <ChartSkeleton height={260} />
            ) : (
              <div className="grid grid-cols-2 gap-4 h-[260px]">
                {/* Registrations pie */}
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide text-center mb-2">
                    Registrations
                  </p>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={regBreakdown}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={70}
                        paddingAngle={3}
                      >
                        {regBreakdown.map((_, i) => (
                          <Cell key={i} fill={CHART_COLOURS[i % CHART_COLOURS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #e5e7eb" }}
                      />
                      <Legend
                        iconSize={8}
                        wrapperStyle={{ fontSize: 11 }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* User role pie */}
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide text-center mb-2">
                    Users by Role
                  </p>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={userBreakdown}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={70}
                        paddingAngle={3}
                      >
                        {userBreakdown.map((_, i) => (
                          <Cell key={i} fill={CHART_COLOURS[i % CHART_COLOURS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #e5e7eb" }}
                      />
                      <Legend
                        iconSize={8}
                        wrapperStyle={{ fontSize: 11 }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Bottom row: Top Events table + Support stats ─────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Top Events — spans 2 cols */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-bold text-gray-900">Top Events by Registration</h2>
              <Link
                href="/admin/events"
                className="text-xs text-[#1a2744] font-semibold hover:underline flex items-center gap-0.5"
              >
                View all <ChevronRight className="h-3 w-3" />
              </Link>
            </div>

            {loading ? (
              <div className="p-5 space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse flex items-center gap-3">
                    <div className="h-3 bg-gray-100 rounded w-6" />
                    <div className="h-3 bg-gray-100 rounded flex-1" />
                    <div className="h-3 bg-gray-100 rounded w-20" />
                    <div className="h-3 bg-gray-100 rounded w-10" />
                  </div>
                ))}
              </div>
            ) : topEvents.length === 0 ? (
              <div className="p-12 text-center text-gray-400 text-sm">
                No events found
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    {["#", "EVENT TITLE", "DATE", "REGISTRATIONS"].map((h) => (
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
                  {topEvents.map((ev: TopEvent, i: number) => (
                    <tr
                      key={ev.id}
                      className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-3 px-4 text-gray-400 font-medium text-xs">
                        {i + 1}
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-semibold text-gray-900 line-clamp-1">
                          {ev.title}
                        </p>
                      </td>
                      <td className="py-3 px-4 text-gray-500 text-xs whitespace-nowrap">
                        {formatDate(ev.event_date)}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center justify-center min-w-[2rem] px-2.5 py-1 rounded-full text-xs font-bold bg-[#1a2744]/10 text-[#1a2744]">
                          {ev.reg_count}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Support + User quick stats — spans 1 col */}
          <div className="space-y-4">
            {/* Support tickets */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="font-bold text-gray-900 mb-4 text-sm">Support Tickets</h3>
              {loading ? (
                <div className="space-y-2 animate-pulse">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-8 bg-gray-100 rounded-lg" />
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {[
                    { label: "Open", value: data?.support.open ?? 0, cls: "bg-blue-50 text-blue-700" },
                    { label: "In Progress", value: data?.support.in_progress ?? 0, cls: "bg-yellow-50 text-yellow-700" },
                    { label: "Resolved", value: data?.support.resolved ?? 0, cls: "bg-green-50 text-green-700" },
                    { label: "Urgent", value: data?.support.urgent ?? 0, cls: "bg-red-50 text-red-600" },
                  ].map(({ label, value, cls }) => (
                    <div key={label} className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-50">
                      <span className="text-sm text-gray-600">{label}</span>
                      <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full", cls)}>
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* User activity */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="font-bold text-gray-900 mb-4 text-sm">User Activity</h3>
              {loading ? (
                <div className="space-y-2 animate-pulse">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-8 bg-gray-100 rounded-lg" />
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {[
                    { label: "Total Users", value: data?.users.total ?? 0 },
                    { label: "New This Month", value: data?.users.new_this_month ?? 0 },
                    { label: "Pending Approval", value: data?.users.pending_approval ?? 0 },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-50">
                      <span className="text-sm text-gray-600">{label}</span>
                      <span className="text-sm font-bold text-gray-900">{value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}