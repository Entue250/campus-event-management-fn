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

// ============================================================
// CAMPUS EVENTS — useSystemSettings Hook
// Placement: src/hooks/useSystemSettings.ts
//
// (Exported from same file for convenience — split if preferred)
// ============================================================

import { getSystemSettings, updateSystemSettings } from "@/services/adminService";
import toast from "react-hot-toast";
import type { SystemSettings } from "@/types";

interface UseSystemSettingsReturn {
    settings: SystemSettings | null;
    loading: boolean;
    saving: boolean;
    error: string | null;
    save: (payload: Partial<SystemSettings>) => Promise<boolean>;
    refetch: () => void;
}

export function useSystemSettings(): UseSystemSettingsReturn {
    const [settings, setSettings] = useState<SystemSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchSettings = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getSystemSettings();
            setSettings(data);
        } catch (err) {
            setError(extractErrorMessage(err));
            console.error("[useSystemSettings] fetch failed:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchSettings(); }, [fetchSettings]);

    const save = useCallback(async (payload: Partial<SystemSettings>): Promise<boolean> => {
        setSaving(true);
        try {
            const updated = await updateSystemSettings(payload);
            setSettings(updated);
            toast.success("Settings saved successfully!");
            return true;
        } catch (err) {
            toast.error(extractErrorMessage(err));
            return false;
        } finally {
            setSaving(false);
        }
    }, []);

    return { settings, loading, saving, error, save, refetch: fetchSettings };
}