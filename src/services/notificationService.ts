// ============================================================
// CAMPUS EVENTS — Notification Service
// Placement: src/services/notificationService.ts
// ============================================================

import api from "./api";
import type { Notification, NotificationBroadcastPayload, PaginatedResponse } from "@/types";

// ── Broadcast-specific payload (title + message only) ─────────────────────────
// Separate from NotificationBroadcastPayload which requires 'target'.
// POST /admin/notifications/broadcast is a quick blast to all active users.
interface BroadcastPayload {
  title: string;
  message: string;
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
// Quick broadcast to ALL active users — only requires title + message.
// Uses BroadcastPayload (NOT NotificationBroadcastPayload) because this
// endpoint does not accept or require a 'target' field.
export async function broadcastNotification(
  payload: BroadcastPayload
): Promise<{ message: string }> {
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