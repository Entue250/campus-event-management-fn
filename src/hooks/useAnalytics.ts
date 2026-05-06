// ============================================================
// CAMPUS EVENTS — useAnalytics Hook
// Placement: src/hooks/useAnalytics.ts
//
// Two hooks:
//   useAnalyticsOverview()  — full analytics overview (auto-fetched)
//   useMonthlyReport()      — monthly report with month/year selector
// ============================================================

"use client";

import { useState, useEffect, useCallback } from "react";
import {
    getAnalyticsOverview,
    getMonthlyReport,
    type MonthlyReport,
} from "@/services/analyticsService";
import { extractErrorMessage } from "@/utils/helpers";
import type { AnalyticsOverview } from "@/types";

// ── useAnalyticsOverview ─────────────────────────────────────────────────────

interface UseAnalyticsOverviewReturn {
    data: AnalyticsOverview | null;
    loading: boolean;
    error: string | null;
    refetch: () => void;
}

export function useAnalyticsOverview(): UseAnalyticsOverviewReturn {
    const [data, setData] = useState<AnalyticsOverview | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetch = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await getAnalyticsOverview();
            setData(res);
        } catch (err) {
            setError(extractErrorMessage(err));
            console.error("[useAnalyticsOverview] failed:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetch(); }, [fetch]);

    return { data, loading, error, refetch: fetch };
}

// ── useMonthlyReport ─────────────────────────────────────────────────────────

interface UseMonthlyReportReturn {
    data: MonthlyReport | null;
    loading: boolean;
    error: string | null;
    month: number;
    year: number;
    setMonth: (m: number) => void;
    setYear: (y: number) => void;
    refetch: () => void;
}

export function useMonthlyReport(): UseMonthlyReportReturn {
    // Default to the current month/year
    const now = new Date();
    const [month, setMonth] = useState(now.getMonth() + 1);
    const [year, setYear] = useState(now.getFullYear());

    const [data, setData] = useState<MonthlyReport | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetch = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await getMonthlyReport(month, year);
            setData(res);
        } catch (err) {
            setError(extractErrorMessage(err));
            console.error("[useMonthlyReport] failed:", err);
        } finally {
            setLoading(false);
        }
    }, [month, year]);

    useEffect(() => { fetch(); }, [fetch]);

    return { data, loading, error, month, year, setMonth, setYear, refetch: fetch };
}