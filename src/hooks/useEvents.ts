// ============================================================
// CAMPUS EVENTS — useEvents Hook
// ============================================================

"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getEvents,
  registerForEvent,
  cancelRegistration,
} from "@/services/eventService";
import { extractErrorMessage } from "@/utils/helpers";
import toast from "react-hot-toast";
import type { Event, EventFilters, PaginatedResponse } from "@/types";

export function useEvents(initialFilters: EventFilters = {}) {
  const [data, setData] = useState<PaginatedResponse<Event> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<EventFilters>(initialFilters);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getEvents(filters);
      setData(result);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const register = useCallback(async (eventId: string) => {
    try {
      const result = await registerForEvent(eventId);
      toast.success(result.message ?? "Registered successfully!");
      fetchEvents();
      return true;
    } catch (err) {
      toast.error(extractErrorMessage(err));
      return false;
    }
  }, [fetchEvents]);

  const cancel = useCallback(async (eventId: string) => {
    try {
      const result = await cancelRegistration(eventId);
      toast.success(result.message ?? "Registration cancelled.");
      fetchEvents();
      return true;
    } catch (err) {
      toast.error(extractErrorMessage(err));
      return false;
    }
  }, [fetchEvents]);

  return {
    data,
    events: data?.results ?? [],
    total: data?.count ?? 0,
    loading,
    error,
    filters,
    setFilters,
    refetch: fetchEvents,
    register,
    cancel,
  };
}
