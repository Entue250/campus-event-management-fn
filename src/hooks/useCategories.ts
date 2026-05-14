// ============================================================
// CAMPUS EVENTS — useCategories Hook
// Placement: src/hooks/useCategories.ts
//
// Manages category list state + CRUD actions.
// Endpoints used:
//   GET    /categories
//   POST   /categories
//   PUT    /categories/{id}
//   DELETE /categories/{id}
// ============================================================

"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/services/adminService";
import { extractErrorMessage } from "@/utils/helpers";
import toast from "react-hot-toast";
import type { Category, CategoryPayload } from "@/types";

interface UseCategoriesReturn {
  /** Full list of categories from the API */
  categories: Category[];
  /** Client-side filtered list (matches the search query) */
  filtered: Category[];
  /** Total count from the API response */
  total: number;
  loading: boolean;
  error: string | null;
  /** Live search query — updates filtered list instantly */
  search: string;
  setSearch: (q: string) => void;
  /** Manually re-fetch the list */
  refetch: () => void;
  actions: {
    create: (payload: CategoryPayload) => Promise<Category | null>;
    update: (id: string, payload: CategoryPayload) => Promise<Category | null>;
    remove: (id: string) => Promise<boolean>;
  };
}

export function useCategories(): UseCategoriesReturn {
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal]           = useState(0);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [search, setSearch]         = useState("");

  // ── Fetch ────────────────────────────────────────────────────────────────
  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await getCategories();
      setCategories(list);
      setTotal(list.length);
    } catch (err) {
      const msg = extractErrorMessage(err);
      setError(msg);
      console.error("[useCategories] fetch failed:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // ── Client-side search filter ────────────────────────────────────────────
  const filtered =
    search.trim() === ""
      ? categories
      : categories.filter(
          (c) =>
            c.name.toLowerCase().includes(search.toLowerCase()) ||
            (c.description ?? "").toLowerCase().includes(search.toLowerCase())
        );

  // ── Create ───────────────────────────────────────────────────────────────
  const create = useCallback(
    async (payload: CategoryPayload): Promise<Category | null> => {
      try {
        const created = await createCategory(payload);
        // Optimistic prepend so the new card appears immediately
        setCategories((prev) => [created, ...prev]);
        setTotal((t) => t + 1);
        toast.success("Category created!");
        return created;
      } catch (err) {
        toast.error(extractErrorMessage(err));
        return null;
      }
    },
    []
  );

  // ── Update ───────────────────────────────────────────────────────────────
  const update = useCallback(
    async (id: string, payload: CategoryPayload): Promise<Category | null> => {
      try {
        const updated = await updateCategory(id, payload);
        setCategories((prev) =>
          prev.map((c) => (c.id === id ? updated : c))
        );
        toast.success("Category updated!");
        return updated;
      } catch (err) {
        toast.error(extractErrorMessage(err));
        return null;
      }
    },
    []
  );

  // ── Delete ───────────────────────────────────────────────────────────────
  const remove = useCallback(async (id: string): Promise<boolean> => {
    try {
      await deleteCategory(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
      setTotal((t) => Math.max(0, t - 1));
      toast.success("Category deleted");
      return true;
    } catch (err) {
      toast.error(extractErrorMessage(err));
      return false;
    }
  }, []);

  return {
    categories,
    filtered,
    total,
    loading,
    error,
    search,
    setSearch,
    refetch: fetchCategories,
    actions: { create, update, remove },
  };
}