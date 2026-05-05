// ============================================================
// CAMPUS EVENTS — useAdminRegistrations Hook
// Placement: src/hooks/useAdminRegistrations.ts
//
// Fetches paginated admin registrations from:
//   GET /api/admin/registrations
//
// Supports: page, search, status, event_id filters.
// ============================================================

"use client";

import { useState, useEffect, useCallback } from "react";
import { getAdminRegistrations } from "@/services/adminService";
import type { AdminRegistration } from "@/types";

interface UseAdminRegistrationsOptions {
    initialPage?: number;
    search?: string;
    status?: string;
    event_id?: string;
}

interface UseAdminRegistrationsReturn {
    registrations: AdminRegistration[];
    total: number;
    currentPage: number;
    totalPages: number;
    loading: boolean;
    error: string | null;
    setPage: (page: number) => void;
}

export function useAdminRegistrations({
    initialPage = 1,
    search = "",
    status = "",
    event_id = "",
}: UseAdminRegistrationsOptions = {}): UseAdminRegistrationsReturn {
    const [registrations, setRegistrations] = useState<AdminRegistration[]>([]);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [currentPage, setCurrentPage] = useState(initialPage);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchRegistrations = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await getAdminRegistrations({
                page: currentPage,
                search: search || undefined,
                status: status || undefined,
                event_id: event_id || undefined,
            });
            setRegistrations(res.results);
            setTotal(res.count);
            // Use total_pages from API if available, otherwise compute from count
            setTotalPages(
                res.total_pages ?? Math.max(1, Math.ceil(res.count / 10))
            );
        } catch (err) {
            console.error("[useAdminRegistrations] fetch failed:", err);
            setError("Failed to load registrations");
            setRegistrations([]);
            setTotal(0);
            setTotalPages(1);
        } finally {
            setLoading(false);
        }
    }, [currentPage, search, status, event_id]);

    useEffect(() => {
        fetchRegistrations();
    }, [fetchRegistrations]);

    return {
        registrations,
        total,
        currentPage,
        totalPages,
        loading,
        error,
        setPage: setCurrentPage,
    };
}