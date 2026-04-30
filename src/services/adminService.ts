// ============================================================
// CAMPUS EVENTS — Admin Service
// Placement: src/services/adminService.ts
// Backend URLs have NO trailing slashes
// ============================================================

import api from "./api";
import type {
  AnalyticsOverview,
  Category,
  CategoryPayload,
  SystemSettings,
  AuditLog,
  PaginatedResponse,
  AdminRegistration,
} from "@/types";

// ── Analytics ────────────────────────────────────────────────────────────────
// Backend: GET /api/admin/analytics/overview
export async function getAnalyticsOverview(): Promise<AnalyticsOverview> {
  const { data } = await api.get<AnalyticsOverview>(
    "/admin/analytics/overview"
  );
  return data;
}

// ── Audit Logs ───────────────────────────────────────────────────────────────
// Backend: GET /api/admin/audit-logs
export async function getAuditLogs(
  params: Record<string, string | number | undefined> = {}
): Promise<PaginatedResponse<AuditLog>> {
  const search = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined) search.set(k, String(v));
  }
  const qs = search.toString() ? `?${search}` : "";
  const { data } = await api.get<PaginatedResponse<AuditLog>>(
    `/admin/audit-logs${qs}`
  );
  return data;
}

// ── Categories ───────────────────────────────────────────────────────────────
// Backend: GET /api/categories
export async function getCategories(): Promise<Category[]> {
  const { data } = await api.get<PaginatedResponse<Category> | Category[]>(
    "/categories"
  );
  if (Array.isArray(data)) return data;
  return (data as PaginatedResponse<Category>)?.results ?? [];
}

// Backend: POST /api/categories
export async function createCategory(
  payload: CategoryPayload
): Promise<Category> {
  const { data } = await api.post<Category>("/categories", payload);
  return data;
}

// Backend: PUT /api/categories/{id}
export async function updateCategory(
  id: string,
  payload: CategoryPayload
): Promise<Category> {
  const { data } = await api.put<Category>(`/categories/${id}`, payload);
  return data;
}

// Backend: DELETE /api/categories/{id}
export async function deleteCategory(id: string): Promise<void> {
  await api.delete(`/categories/${id}`);
}

// ── System Settings ──────────────────────────────────────────────────────────
// Backend: GET /api/admin/settings
export async function getSystemSettings(): Promise<SystemSettings> {
  const { data } = await api.get<SystemSettings>("/admin/settings");
  return data;
}

// Backend: PATCH /api/admin/settings
export async function updateSystemSettings(
  payload: Partial<SystemSettings>
): Promise<SystemSettings> {
  const { data } = await api.put<SystemSettings>("/admin/settings", payload);
  return data;
}

// ── Admin Registrations ──────────────────────────────────────────────────────
// Backend: GET /api/admin/registrations
//
// Supported query params:
//   page       – page number
//   search     – search by user name/email or event title
//   status     – filter by registration status (REGISTERED | ATTENDED | CANCELLED)
//   event_id   – filter by specific event UUID
export async function getAdminRegistrations(
  params: {
    page?: number;
    search?: string;
    status?: string;
    event_id?: string;
  } = {}
): Promise<PaginatedResponse<AdminRegistration>> {
  const search = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== "") search.set(k, String(v));
  }
  const qs = search.toString() ? `?${search}` : "";
  const { data } = await api.get<PaginatedResponse<AdminRegistration>>(
    `/admin/registrations${qs}`
  );
  return data;
}

// ── Toggle Event Publish ─────────────────────────────────────────────────────
// Backend: POST /api/admin/events/{event_id}/toggle-publish
// Toggles the is_published flag of an event.
export async function toggleEventPublish(
  eventId: string
): Promise<{ message: string; is_published: boolean }> {
  const { data } = await api.post<{ message: string; is_published: boolean }>(
    `/admin/events/${eventId}/toggle-publish`
  );
  return data;
}