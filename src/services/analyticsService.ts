// ============================================================
// CAMPUS EVENTS — Analytics Service
// Placement: src/services/analyticsService.ts
//
// Endpoints:
//   GET /admin/analytics/overview   — full analytics overview
//   GET /admin/analytics/monthly-report?month=3&year=2026 — monthly report
// ============================================================

import api from "./api";
import type { AnalyticsOverview } from "@/types";

// ── Monthly report types (not in main types/index.ts — analytics-specific) ───

export interface MonthlyReportEvent {
    id: string;
    title: string;
    event_date: string;
    status: string;
    organizer: string;
}

export interface WeeklyBreakdown {
    week: string;  // ISO date of week start, e.g. "2026-03-23"
    count: number;
}

export interface MonthlyReport {
    period: {
        year: number;
        month: number;
        month_name: string;
    };
    events: {
        total: number;
        upcoming: number;
        completed: number;
        cancelled: number;
        list: MonthlyReportEvent[];
    };
    registrations: {
        total: number;
        active: number;
        cancelled: number;
        weekly_breakdown: WeeklyBreakdown[];
    };
}

// ── GET /api/admin/analytics/overview ────────────────────────────────────────
export async function getAnalyticsOverview(): Promise<AnalyticsOverview> {
    const { data } = await api.get<AnalyticsOverview>(
        "/admin/analytics/overview"
    );
    return data;
}

// ── GET /api/admin/analytics/monthly-report ───────────────────────────────────
// Pass month (1-12) and year; backend returns data for that period.
export async function getMonthlyReport(
    month: number,
    year: number
): Promise<MonthlyReport> {
    const { data } = await api.get<MonthlyReport>(
        `/admin/analytics/monthly-report?month=${month}&year=${year}`
    );
    return data;
}