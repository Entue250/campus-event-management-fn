// // ============================================================
// // CAMPUS EVENTS — Event Service
// // Placement: src/services/eventService.ts
// //
// // API Base: /api (set in api.ts via API_BASE_URL)
// // All endpoints below are relative to that base.
// //
// // Key API notes (from Swagger):
// //   - Admin list:   GET  /events/create      (yes, GET on /create)
// //   - Admin create: POST /events/create      (multipart/form-data)
// //   - Admin update: PATCH /events/update/{id} (multipart/form-data)
// //   - Admin delete: DELETE /events/delete/{id}
// //   - FormData field is "category" (UUID) — NOT "category_id"
// //   - FormData field is "capacity"  (int)  — NOT "max_capacity"
// // ============================================================

// import api from "./api";
// import type {
//   Event,
//   EventCreatePayload,
//   EventFilters,
//   PaginatedResponse,
//   RegistrationStatus,
//   Registration,
// } from "@/types";
// import { buildQueryString } from "@/utils/helpers";

// // ── GET /api/events — public list & search ───────────────────────────────────
// export async function getEvents(
//   filters: EventFilters = {}
// ): Promise<PaginatedResponse<Event>> {
//   const qs = buildQueryString(
//     filters as Record<string, string | number | boolean | undefined>
//   );
//   const { data } = await api.get<PaginatedResponse<Event>>(`/events${qs}`);
//   return data;
// }

// // ── GET /api/events/create — [Admin] list all events ────────────────────────
// // Note: The admin list endpoint is GET /events/create (Swagger: events_create_list)
// export async function getAdminEvents(
//   filters: EventFilters = {}
// ): Promise<PaginatedResponse<Event>> {
//   const qs = buildQueryString(
//     filters as Record<string, string | number | boolean | undefined>
//   );
//   const { data } = await api.get<PaginatedResponse<Event>>(
//     `/events/create${qs}`
//   );
//   return data;
// }

// // ── GET /api/events/{id} — single event detail ──────────────────────────────
// export async function getEvent(id: string): Promise<Event> {
//   const { data } = await api.get<Event>(`/events/${id}`);
//   return data;
// }

// // ── GET /api/events/upcoming?limit=N ────────────────────────────────────────
// export async function getUpcomingEvents(limit = 6): Promise<Event[]> {
//   const { data } = await api.get<PaginatedResponse<Event>>(
//     `/events/upcoming?limit=${limit}`
//   );
//   if (Array.isArray(data)) return data;
//   return data?.results ?? [];
// }

// // ── GET /api/events/popular?limit=N ─────────────────────────────────────────
// export async function getPopularEvents(limit = 6): Promise<Event[]> {
//   const { data } = await api.get<PaginatedResponse<Event>>(
//     `/events/popular?limit=${limit}`
//   );
//   if (Array.isArray(data)) return data;
//   return data?.results ?? [];
// }

// // ── GET /api/events/search?q= ───────────────────────────────────────────────
// export async function searchEvents(
//   q: string
// ): Promise<PaginatedResponse<Event>> {
//   const { data } = await api.get<PaginatedResponse<Event>>(
//     `/events/search?q=${encodeURIComponent(q)}`
//   );
//   return data;
// }

// // ── POST /api/events/{id}/register ──────────────────────────────────────────
// export async function registerForEvent(
//   eventId: string
// ): Promise<{ message: string }> {
//   const { data } = await api.post<{ message: string }>(
//     `/events/${eventId}/register`
//   );
//   return data;
// }

// // ── DELETE /api/events/{id}/cancel ──────────────────────────────────────────
// export async function cancelRegistration(
//   eventId: string
// ): Promise<{ message: string }> {
//   const { data } = await api.delete<{ message: string }>(
//     `/events/${eventId}/cancel`
//   );
//   return data;
// }

// // ── GET /api/events/{event_id}/registration-status ──────────────────────────
// export async function getRegistrationStatus(
//   eventId: string
// ): Promise<RegistrationStatus> {
//   const { data } = await api.get<RegistrationStatus>(
//     `/events/${eventId}/registration-status`
//   );
//   return data;
// }

// // ── GET /api/my-events ──────────────────────────────────────────────────────
// export async function getMyEvents(): Promise<PaginatedResponse<Event>> {
//   const { data } = await api.get<PaginatedResponse<Event>>("/my-events");
//   return data;
// }

// // ── POST /api/events/create — [Admin] create event ──────────────────────────
// // Sends multipart/form-data; "category" is the UUID field name (not category_id)
// // "capacity" is the integer field name (not max_capacity)
// export async function createEvent(payload: EventCreatePayload): Promise<Event> {
//   const form = buildEventFormData(payload);
//   const { data } = await api.post<Event>("/events/create", form, {
//     headers: { "Content-Type": "multipart/form-data" },
//   });
//   return data;
// }

// // ── PATCH /api/events/update/{id} — [Admin] partial update ──────────────────
// // Sends multipart/form-data with only the fields that changed
// export async function updateEvent(
//   id: string,
//   payload: Partial<EventCreatePayload>
// ): Promise<Event> {
//   const form = buildEventFormData(payload);
//   const { data } = await api.patch<Event>(`/events/update/${id}`, form, {
//     headers: { "Content-Type": "multipart/form-data" },
//   });
//   return data;
// }

// // ── DELETE /api/events/delete/{id} — [Admin] delete event ───────────────────
// export async function deleteEvent(id: string): Promise<void> {
//   await api.delete(`/events/delete/${id}`);
// }

// // ── POST /api/admin/events/{id}/toggle-publish ──────────────────────────────
// export async function togglePublishEvent(
//   id: string
// ): Promise<{ message: string; is_published: boolean }> {
//   const { data } = await api.post<{ message: string; is_published: boolean }>(
//     `/admin/events/${id}/toggle-publish`
//   );
//   return data;
// }

// // ── GET /api/admin/events/{id}/registrations ────────────────────────────────
// export async function getEventRegistrations(
//   eventId: string
// ): Promise<PaginatedResponse<Registration>> {
//   const { data } = await api.get<PaginatedResponse<Registration>>(
//     `/admin/events/${eventId}/registrations`
//   );
//   return data;
// }

// // ── Helper: build FormData from payload ─────────────────────────────────────
// // Handles field name mapping:
// //   payload.category_id  → FormData "category"   (backend expects UUID as "category")
// //   payload.max_capacity → FormData "capacity"    (backend field is "capacity")
// //   payload.banner_image → FormData "banner_image" (File object)
// //   All other fields are stringified as-is.
// function buildEventFormData(
//   payload: Partial<EventCreatePayload>
// ): FormData {
//   const form = new FormData();
//   const { banner_image, category_id, max_capacity, ...rest } = payload;

//   // Append standard string/number fields
//   for (const [key, value] of Object.entries(rest)) {
//     if (value !== undefined && value !== null && value !== "") {
//       form.append(key, String(value));
//     }
//   }

//   // Map category_id → "category" (backend field name)
//   if (category_id) {
//     form.append("category", category_id);
//   }

//   // Map max_capacity → "capacity" (backend field name)
//   if (max_capacity !== undefined && max_capacity !== null && max_capacity !== "") {
//     form.append("capacity", String(max_capacity));
//   }

//   // Append image file if provided
//   if (banner_image instanceof File) {
//     form.append("banner_image", banner_image);
//   }

//   return form;
// }

// ============================================================
// CAMPUS EVENTS — Event Service
// Placement: src/services/eventService.ts
//
// Key API notes (from Swagger):
//   - Admin list:   GET  /events/create
//   - Admin create: POST /events/create      (multipart/form-data)
//   - Admin update: PATCH /events/update/{id} (multipart/form-data)
//   - Admin delete: DELETE /events/delete/{id}
//   - FormData field "category" = UUID (NOT "category_id")
//   - FormData field "capacity"  = int  (NOT "max_capacity")
//   - FormData field "tags"      = comma-separated string (NEW)
// ============================================================

import api from "./api";
import type {
  Event,
  EventCreatePayload,
  EventFilters,
  PaginatedResponse,
  RegistrationStatus,
  AdminRegistration,
} from "@/types";
import { buildQueryString } from "@/utils/helpers";

// ── GET /api/events — public list & search ───────────────────────────────────
export async function getEvents(
  filters: EventFilters = {}
): Promise<PaginatedResponse<Event>> {
  const qs = buildQueryString(
    filters as Record<string, string | number | boolean | undefined>
  );
  const { data } = await api.get<PaginatedResponse<Event>>(`/events${qs}`);
  return data;
}

// ── GET /api/events/create — [Admin] list all events ────────────────────────
// Note: Swagger shows GET /events/create is the admin list endpoint
export async function getAdminEvents(
  filters: EventFilters = {}
): Promise<PaginatedResponse<Event>> {
  const qs = buildQueryString(
    filters as Record<string, string | number | boolean | undefined>
  );
  const { data } = await api.get<PaginatedResponse<Event>>(
    `/events/create${qs}`
  );
  return data;
}

// ── GET /api/events/{id} ─────────────────────────────────────────────────────
export async function getEvent(id: string): Promise<Event> {
  const { data } = await api.get<Event>(`/events/${id}`);
  return data;
}

// ── GET /api/events/upcoming?limit=N ────────────────────────────────────────
export async function getUpcomingEvents(limit = 6): Promise<Event[]> {
  const { data } = await api.get<PaginatedResponse<Event>>(
    `/events/upcoming?limit=${limit}`
  );
  if (Array.isArray(data)) return data;
  return data?.results ?? [];
}

// ── GET /api/events/popular?limit=N ─────────────────────────────────────────
export async function getPopularEvents(limit = 6): Promise<Event[]> {
  const { data } = await api.get<PaginatedResponse<Event>>(
    `/events/popular?limit=${limit}`
  );
  if (Array.isArray(data)) return data;
  return data?.results ?? [];
}

// ── GET /api/events/search?q= ───────────────────────────────────────────────
export async function searchEvents(
  q: string
): Promise<PaginatedResponse<Event>> {
  const { data } = await api.get<PaginatedResponse<Event>>(
    `/events/search?q=${encodeURIComponent(q)}`
  );
  return data;
}

// ── POST /api/events/{id}/register ──────────────────────────────────────────
export async function registerForEvent(
  eventId: string
): Promise<{ message: string }> {
  const { data } = await api.post<{ message: string }>(
    `/events/${eventId}/register`
  );
  return data;
}

// ── DELETE /api/events/{id}/cancel ──────────────────────────────────────────
export async function cancelRegistration(
  eventId: string
): Promise<{ message: string }> {
  const { data } = await api.delete<{ message: string }>(
    `/events/${eventId}/cancel`
  );
  return data;
}

// ── GET /api/events/{event_id}/registration-status ──────────────────────────
export async function getRegistrationStatus(
  eventId: string
): Promise<RegistrationStatus> {
  const { data } = await api.get<RegistrationStatus>(
    `/events/${eventId}/registration-status`
  );
  return data;
}

// ── GET /api/my-events ──────────────────────────────────────────────────────
export async function getMyEvents(): Promise<PaginatedResponse<Event>> {
  const { data } = await api.get<PaginatedResponse<Event>>("/my-events");
  return data;
}

// ── POST /api/events/create — [Admin] create event ──────────────────────────
export async function createEvent(payload: EventCreatePayload): Promise<Event> {
  const form = buildEventFormData(payload);
  const { data } = await api.post<Event>("/events/create", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

// ── PATCH /api/events/update/{id} — [Admin] partial update ──────────────────
export async function updateEvent(
  id: string,
  payload: Partial<EventCreatePayload>
): Promise<Event> {
  const form = buildEventFormData(payload);
  const { data } = await api.patch<Event>(`/events/update/${id}`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

// ── DELETE /api/events/delete/{id} — [Admin] delete event ───────────────────
export async function deleteEvent(id: string): Promise<void> {
  await api.delete(`/events/delete/${id}`);
}

// ── POST /api/admin/events/{id}/toggle-publish ──────────────────────────────
export async function togglePublishEvent(
  id: string
): Promise<{ message: string; is_published: boolean }> {
  const { data } = await api.post<{ message: string; is_published: boolean }>(
    `/admin/events/${id}/toggle-publish`
  );
  return data;
}

// ── GET /api/admin/events/{id}/registrations ────────────────────────────────
export async function getEventRegistrations(
  eventId: string
): Promise<PaginatedResponse<AdminRegistration>> {
  const { data } = await api.get<PaginatedResponse<AdminRegistration>>(
    `/admin/events/${eventId}/registrations`
  );
  return data;
}

// ── Helper: build FormData ───────────────────────────────────────────────────
// Field name mapping (payload prop → FormData key sent to backend):
//   category_id  → "category"     (backend UUID field name)
//   max_capacity → "capacity"     (backend integer field name)
//   tags         → "tags"         (comma-separated string)
//   banner_image → "banner_image" (File object)
function buildEventFormData(
  payload: Partial<EventCreatePayload>
): FormData {
  const form = new FormData();
  const { banner_image, category_id, max_capacity, tags, ...rest } = payload;

  // All remaining scalar fields
  for (const [key, value] of Object.entries(rest)) {
    if (value !== undefined && value !== null && value !== "") {
      form.append(key, String(value));
    }
  }

  // category_id → "category"
  if (category_id) {
    form.append("category", category_id);
  }

  // max_capacity → "capacity"
  if (max_capacity !== undefined && max_capacity !== null && max_capacity !== "") {
    form.append("capacity", String(max_capacity));
  }

  // tags (comma-separated, e.g. "AI, Ethics, Tech")
  if (tags !== undefined && tags !== null && String(tags).trim() !== "") {
    form.append("tags", String(tags).trim());
  }

  // Image file
  if (banner_image instanceof File) {
    form.append("banner_image", banner_image);
  }

  return form;
}