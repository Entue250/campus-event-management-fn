// ============================================================
// CAMPUS EVENTS — Constants & Helpers
// ============================================================

// ── API Base URL ──────────────────────────────────────────────────────────────
// Change this to your deployed backend URL in production.
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

// ── Token storage keys ────────────────────────────────────────────────────────
export const ACCESS_TOKEN_KEY = "campus_access_token";
export const REFRESH_TOKEN_KEY = "campus_refresh_token";
export const USER_KEY = "campus_user";

// ── Pagination defaults ───────────────────────────────────────────────────────
export const DEFAULT_PAGE_SIZE = 10;

// ── Event status badge colours ────────────────────────────────────────────────
import type { EventStatus, TicketStatus, TicketPriority, RegistrationStatus } from "@/types";

export const EVENT_STATUS_COLOURS: Record<EventStatus, string> = {
  UPCOMING: "bg-blue-100 text-blue-800",
  ONGOING: "bg-green-100 text-green-800",
  COMPLETED: "bg-gray-100 text-gray-700",
  CANCELLED: "bg-red-100 text-red-800",
};

export const REGISTRATION_STATUS_COLOURS: Record<RegistrationStatus, string> = {
  REGISTERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
  ATTENDED: "bg-blue-100 text-blue-800",
};

export const TICKET_STATUS_COLOURS: Record<TicketStatus, string> = {
  OPEN: "bg-yellow-100 text-yellow-800",
  IN_PROGRESS: "bg-blue-100 text-blue-800",
  RESOLVED: "bg-green-100 text-green-800",
  CLOSED: "bg-gray-100 text-gray-700",
};

export const TICKET_PRIORITY_COLOURS: Record<TicketPriority, string> = {
  LOW: "bg-gray-100 text-gray-700",
  MEDIUM: "bg-blue-100 text-blue-800",
  HIGH: "bg-orange-100 text-orange-800",
  URGENT: "bg-red-100 text-red-800",
};
