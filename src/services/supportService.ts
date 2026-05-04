// ============================================================
// CAMPUS EVENTS — Support Service
// Backend URLs have NO trailing slashes
// ============================================================

import api from "./api";
import type {
  SupportTicket, SupportTicketPayload, SupportRespondPayload,
  SupportPriorityPayload, PaginatedResponse, Notification, NotificationBroadcastPayload
} from "@/types";

// Backend: POST /api/support
export async function submitTicket(payload: SupportTicketPayload): Promise<{ message: string }> {
  const { data } = await api.post<{ message: string }>("/support", payload);
  return data;
}

// Backend: GET /api/support/my-tickets
export async function getMyTickets(): Promise<PaginatedResponse<SupportTicket>> {
  const { data } = await api.get<PaginatedResponse<SupportTicket>>("/support/my-tickets");
  return data;
}

// Backend: GET /api/admin/support
export async function getAdminTickets(
  params: Record<string, string | number | undefined> = {}
): Promise<PaginatedResponse<SupportTicket>> {
  const search = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined) search.set(k, String(v));
  }
  const qs = search.toString() ? `?${search}` : "";
  const { data } = await api.get<PaginatedResponse<SupportTicket>>(`/admin/support${qs}`);
  return data;
}

// Backend: GET /api/admin/support/{id}
export async function getAdminTicket(id: string): Promise<SupportTicket> {
  const { data } = await api.get<SupportTicket>(`/admin/support/${id}`);
  return data;
}

// Backend: PATCH /api/admin/support/{id}/respond  (via detail view)
export async function respondToTicket(id: string, payload: SupportRespondPayload): Promise<SupportTicket> {
  const { data } = await api.patch<SupportTicket>(`/admin/support/${id}`, payload);
  return data;
}

// Backend: PATCH /api/admin/support/{id}/priority
export async function changeTicketPriority(id: string, payload: SupportPriorityPayload): Promise<{ message: string }> {
  const { data } = await api.patch<{ message: string }>(`/admin/support/${id}/priority`, payload);
  return data;
}

// Backend: POST /api/admin/support/{id}/close
export async function closeTicket(id: string): Promise<{ message: string }> {
  const { data } = await api.post<{ message: string }>(`/admin/support/${id}/close`);
  return data;
}

// ── GET /api/notifications ────────────────────────────────────────────────────
export async function getNotifications(): Promise<PaginatedResponse<Notification>> {
  const { data } = await api.get<PaginatedResponse<Notification>>("/notifications");
  return data;
}

// ── GET /api/notifications/count ──────────────────────────────────────────────
export async function getUnreadCount(): Promise<{ unread_count: number }> {
  const { data } = await api.get<{ unread_count: number }>("/notifications/count");
  return data;
}

// ── PUT /api/notifications/read-all ──────────────────────────────────────────
export async function markAllAsRead(): Promise<{ message: string }> {
  const { data } = await api.put<{ message: string }>("/notifications/read-all");
  return data;
}

// ── PUT /api/notifications/read/{notification_id} ─────────────────────────────
export async function markAsRead(
  notificationId: string
): Promise<{ message: string }> {
  const { data } = await api.put<{ message: string }>(
    `/notifications/read/${notificationId}`
  );
  return data;
}

// ── DELETE /api/notifications/{notification_id} ───────────────────────────────
export async function deleteNotification(
  notificationId: string
): Promise<void> {
  await api.delete(`/notifications/${notificationId}`);
}

// ── POST /api/admin/notifications/broadcast ───────────────────────────────────
// Quick broadcast to ALL active users — only requires title + message
export async function broadcastNotification(payload: {
  title: string;
  message: string;
}): Promise<{ message: string }> {
  const { data } = await api.post<{ message: string }>(
    "/admin/notifications/broadcast",
    payload
  );
  return data;
}

// ── POST /api/admin/notifications/create ──────────────────────────────────────
// Targeted notification — send to specific_user, all_users, or event registrants
export async function createNotification(
  payload: NotificationBroadcastPayload
): Promise<{ message: string }> {
  const { data } = await api.post<{ message: string }>(
    "/admin/notifications/create",
    payload
  );
  return data;
}