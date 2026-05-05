// ============================================================
// CAMPUS EVENTS — useAdminEvents Hook
// Placement: src/hooks/useAdminEvents.ts
//
// Centralises admin event CRUD logic:
//   - paginated list (GET /events/create)
//   - delete with auto-refetch
//   - toggle publish status
// Import this hook in admin pages to avoid duplicating fetch logic.
// ============================================================

"use client";

import { useState, useEffect, useCallback } from "react";
import {
    getAdminEvents,
    deleteEvent,
    togglePublishEvent,
} from "@/services/eventService";
import { extractErrorMessage } from "@/utils/helpers";
import toast from "react-hot-toast";
import type { Event, EventFilters, PaginatedResponse } from "@/types";

interface UseAdminEventsOptions {
    initialFilters?: EventFilters;
}

export function useAdminEvents({ initialFilters = {} }: UseAdminEventsOptions = {}) {
    const [data, setData] = useState<PaginatedResponse<Event> | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState<EventFilters>(initialFilters);

    // ── Fetch paginated event list ──────────────────────────────────────────
    const fetchEvents = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await getAdminEvents(filters);
            setData(result);
        } catch (err) {
            const msg = extractErrorMessage(err);
            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    // ── Delete an event and refetch ─────────────────────────────────────────
    const remove = useCallback(
        async (id: string): Promise<boolean> => {
            try {
                await deleteEvent(id);
                toast.success("Event deleted successfully");
                await fetchEvents();
                return true;
            } catch (err) {
                toast.error(extractErrorMessage(err));
                return false;
            }
        },
        [fetchEvents]
    );

    // ── Toggle publish status and refetch ───────────────────────────────────
    const togglePublish = useCallback(
        async (id: string): Promise<boolean> => {
            try {
                const result = await togglePublishEvent(id);
                toast.success(result.message ?? "Publish status updated");
                await fetchEvents();
                return true;
            } catch (err) {
                toast.error(extractErrorMessage(err));
                return false;
            }
        },
        [fetchEvents]
    );

    return {
        /** Paginated response (null while initial load) */
        data,
        /** Flat array of events for the current page */
        events: data?.results ?? [],
        /** Total count across all pages */
        total: data?.count ?? 0,
        loading,
        error,
        /** Current filter/pagination state */
        filters,
        /** Update filters (triggers refetch) */
        setFilters,
        /** Manually trigger a refetch */
        refetch: fetchEvents,
        /** Delete event by id */
        remove,
        /** Toggle publish/unpublish by id */
        togglePublish,
    };
}