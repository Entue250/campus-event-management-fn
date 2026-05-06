// ============================================================
// CAMPUS EVENTS — useAuditLogs Hook
// Placement: src/hooks/useAuditLogs.ts
// ============================================================

"use client";

import { useState, useEffect, useCallback } from "react";
import { getAuditLogs } from "@/services/adminService";
import { extractErrorMessage } from "@/utils/helpers";
import type { AuditLog, PaginatedResponse } from "@/types";

interface UseAuditLogsReturn {
    logs: AuditLog[];
    total: number;
    totalPages: number;
    currentPage: number;
    loading: boolean;
    error: string | null;
    setPage: (p: number) => void;
    refetch: () => void;
}

export function useAuditLogs(): UseAuditLogsReturn {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetch = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res: PaginatedResponse<AuditLog> = await getAuditLogs({ page: currentPage });
            setLogs(res.results);
            setTotal(res.count);
            setTotalPages(res.total_pages ?? Math.max(1, Math.ceil(res.count / 10)));
        } catch (err) {
            setError(extractErrorMessage(err));
            console.error("[useAuditLogs] fetch failed:", err);
        } finally {
            setLoading(false);
        }
    }, [currentPage]);

    useEffect(() => { fetch(); }, [fetch]);

    return {
        logs,
        total,
        totalPages,
        currentPage,
        loading,
        error,
        setPage: setCurrentPage,
        refetch: fetch,
    };
}
