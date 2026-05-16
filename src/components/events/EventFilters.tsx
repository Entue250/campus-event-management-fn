// ============================================================
// CAMPUS EVENTS — EventFilters Component
// ============================================================

"use client";

import { useState, useEffect } from "react";
import { Search, Filter } from "lucide-react";
import { getCategories } from "@/services/adminService";
import type { Category, EventFilters } from "@/types";
import { cn } from "@/utils/helpers";

interface EventFiltersProps {
  filters: EventFilters;
  onChange: (filters: EventFilters) => void;
}

const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "UPCOMING", label: "Upcoming" },
  { value: "ONGOING", label: "Ongoing" },
  { value: "COMPLETED", label: "Completed" },
];

const SORT_OPTIONS = [
  { value: "-event_date", label: "Newest First" },
  { value: "event_date", label: "Oldest First" },
  { value: "title", label: "A – Z" },
  { value: "-registration_count", label: "Most Popular" },
];

export function EventFiltersBar({ filters, onChange }: EventFiltersProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState(filters.search ?? "");

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => {
      onChange({ ...filters, search: search || undefined, page: 1 });
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center shadow-card">
      {/* Search */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        <input
          type="search"
          placeholder="Search events…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
      </div>

      {/* Category filter */}
      <div className="flex items-center gap-2 shrink-0">
        <Filter className="h-4 w-4 text-gray-400" />
        <select
          value={filters.category ?? ""}
          onChange={(e) =>
            onChange({ ...filters, category: e.target.value || undefined, page: 1 })
          }
          className="text-sm rounded-lg border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Status filter */}
      <select
        value={filters.status ?? ""}
        onChange={(e) =>
          onChange({
            ...filters,
            status: (e.target.value as EventFilters["status"]) || undefined,
            page: 1,
          })
        }
        className="text-sm rounded-lg border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500 shrink-0"
      >
        {STATUS_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>

      {/* Sort */}
      <select
        value={filters.ordering ?? "-event_date"}
        onChange={(e) =>
          onChange({ ...filters, ordering: e.target.value, page: 1 })
        }
        className="text-sm rounded-lg border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500 shrink-0"
      >
        {SORT_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

// ── Compact chip filters (used on home page / dashboard) ──────────────────────
interface ChipFiltersProps {
  categories: Category[];
  selected: string;
  onSelect: (id: string) => void;
}

export function CategoryChips({ categories, selected, onSelect }: ChipFiltersProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onSelect("")}
        className={cn(
          "px-4 py-1.5 rounded-full text-sm font-medium border transition-colors",
          selected === ""
            ? "bg-primary-600 text-white border-primary-600"
            : "border-gray-300 text-gray-600 hover:border-primary-400 hover:text-primary-600"
        )}
      >
        All
      </button>
      {categories.map((c) => (
        <button
          key={c.id}
          onClick={() => onSelect(c.id)}
          className={cn(
            "px-4 py-1.5 rounded-full text-sm font-medium border transition-colors",
            selected === c.id
              ? "bg-primary-600 text-white border-primary-600"
              : "border-gray-300 text-gray-600 hover:border-primary-400 hover:text-primary-600"
          )}
        >
          {c.name}
        </button>
      ))}
    </div>
  );
}
