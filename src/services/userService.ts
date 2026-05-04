
// // ============================================================
// // CAMPUS EVENTS — User / Profile Service
// // Placement: src/services/userService.ts
// // Backend URLs have NO trailing slashes
// // ============================================================

// import api from "./api";
// import type {
//   User,
//   ProfileUpdatePayload,
//   PaginatedResponse,
//   AdminUserRejectPayload,
//   AdminUserRoleChangePayload,
//   StudentDashboardData,
// } from "@/types";

// // ── GET /api/profile ──────────────────────────────────────────────────────────
// export async function getProfile(): Promise<User> {
//   const { data } = await api.get<User>("/profile");
//   return data;
// }

// // ── PATCH /api/profile/update ─────────────────────────────────────────────────
// export async function updateProfile(
//   payload: ProfileUpdatePayload
// ): Promise<User> {
//   const form = new FormData();
//   if (payload.full_name) form.append("full_name", payload.full_name);
//   if (payload.profile_image instanceof File)
//     form.append("profile_image", payload.profile_image);
//   const { data } = await api.patch<User>("/profile/update", form, {
//     headers: { "Content-Type": "multipart/form-data" },
//   });
//   return data;
// }

// // ── POST /api/auth/change-password ────────────────────────────────────────────
// // Backend expects: { current_password, new_password, confirm_password }
// // The hook (useProfile) maps old_password → current_password internally.
// export async function changePassword(payload: {
//   old_password: string;       // mapped from "current_password" in the UI form
//   new_password: string;
//   confirm_new_password: string; // mapped from "confirm_password" in the UI form
// }): Promise<{ message: string }> {
//   const { data } = await api.post<{ message: string }>(
//     "/auth/change-password",
//     {
//       current_password: payload.old_password,
//       new_password:     payload.new_password,
//       confirm_password: payload.confirm_new_password,
//     }
//   );
//   return data;
// }

// // ── GET /api/student/dashboard ────────────────────────────────────────────────
// export async function getStudentDashboard(): Promise<StudentDashboardData> {
//   const { data } = await api.get<StudentDashboardData>("/student/dashboard");
//   return data;
// }

// // ── GET /api/admin/users ──────────────────────────────────────────────────────
// // Supports: page, search, role, is_active, is_approved
// export async function getAdminUsers(
//   params: Record<string, string | number | undefined> = {}
// ): Promise<PaginatedResponse<User>> {
//   const search = new URLSearchParams();
//   for (const [k, v] of Object.entries(params)) {
//     if (v !== undefined && v !== "") search.set(k, String(v));
//   }
//   const qs = search.toString() ? `?${search}` : "";
//   const { data } = await api.get<PaginatedResponse<User>>(`/admin/users${qs}`);
//   return data;
// }

// // ── GET /api/admin/users/{user_id} ────────────────────────────────────────────
// export async function getUserById(userId: string): Promise<User> {
//   const { data } = await api.get<User>(`/admin/users/${userId}`);
//   return data;
// }

// // ── PUT /api/admin/users/{user_id} ────────────────────────────────────────────
// export async function updateUser(
//   userId: string,
//   payload: Partial<Pick<User, "full_name" | "role" | "is_active" | "is_approved">>
// ): Promise<User> {
//   const { data } = await api.put<User>(`/admin/users/${userId}`, payload);
//   return data;
// }

// // ── GET /api/admin/users/pending ──────────────────────────────────────────────
// export async function getPendingUsers(): Promise<User[]> {
//   const { data } = await api.get<User[]>("/admin/users/pending");
//   return data;
// }

// // ── GET /api/admin/users/rejected ─────────────────────────────────────────────
// export async function getRejectedUsers(): Promise<User[]> {
//   const { data } = await api.get<User[]>("/admin/users/rejected");
//   return data;
// }

// // ── POST /api/admin/users/{id}/approve ────────────────────────────────────────
// export async function approveUser(
//   userId: string
// ): Promise<{ message: string }> {
//   const { data } = await api.post<{ message: string }>(
//     `/admin/users/${userId}/approve`
//   );
//   return data;
// }

// // ── POST /api/admin/users/{id}/reject ─────────────────────────────────────────
// export async function rejectUser(
//   userId: string,
//   payload: AdminUserRejectPayload
// ): Promise<{ message: string }> {
//   const { data } = await api.post<{ message: string }>(
//     `/admin/users/${userId}/reject`,
//     payload
//   );
//   return data;
// }

// // ── POST /api/admin/users/{id}/change-role ────────────────────────────────────
// export async function changeUserRole(
//   userId: string,
//   payload: AdminUserRoleChangePayload
// ): Promise<{ message: string }> {
//   const { data } = await api.post<{ message: string }>(
//     `/admin/users/${userId}/change-role`,
//     payload
//   );
//   return data;
// }

// // ── POST /api/admin/users/{id}/toggle-status ──────────────────────────────────
// export async function toggleUserActive(
//   userId: string
// ): Promise<{ message: string; is_active: boolean }> {
//   const { data } = await api.post<{ message: string; is_active: boolean }>(
//     `/admin/users/${userId}/toggle-status`
//   );
//   return data;
// }

// // ── DELETE /api/admin/users/{id} ──────────────────────────────────────────────
// export async function deleteUser(userId: string): Promise<void> {
//   await api.delete(`/admin/users/${userId}`);
// }

// ============================================================
// CAMPUS EVENTS — User / Profile Service
// Placement: src/services/userService.ts
// Backend URLs have NO trailing slashes
// ============================================================

import api from "./api";
import type {
  User,
  ProfileUpdatePayload,
  PaginatedResponse,
  AdminUserRejectPayload,
  AdminUserRoleChangePayload,
  StudentDashboardData,
} from "@/types";

// ── GET /api/profile ──────────────────────────────────────────────────────────
export async function getProfile(): Promise<User> {
  const { data } = await api.get<User>("/profile");
  return data;
}

// ── PUT /api/profile/update ───────────────────────────────────────────────────
// NOTE: The backend accepts PUT (not PATCH) for this endpoint.
export async function updateProfile(
  payload: ProfileUpdatePayload
): Promise<User> {
  const form = new FormData();
  if (payload.full_name) form.append("full_name", payload.full_name);
  if (payload.profile_image instanceof File)
    form.append("profile_image", payload.profile_image);
  const { data } = await api.put<User>("/profile/update", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

// ── POST /api/auth/change-password ────────────────────────────────────────────
// Backend expects: { current_password, new_password, confirm_password }
// The hook (useProfile) maps old_password → current_password internally.
export async function changePassword(payload: {
  old_password: string;       // mapped from "current_password" in the UI form
  new_password: string;
  confirm_new_password: string; // mapped from "confirm_password" in the UI form
}): Promise<{ message: string }> {
  const { data } = await api.post<{ message: string }>(
    "/auth/change-password",
    {
      current_password: payload.old_password,
      new_password: payload.new_password,
      confirm_password: payload.confirm_new_password,
    }
  );
  return data;
}

// ── GET /api/student/dashboard ────────────────────────────────────────────────
export async function getStudentDashboard(): Promise<StudentDashboardData> {
  const { data } = await api.get<StudentDashboardData>("/student/dashboard");
  return data;
}

// ── GET /api/admin/users ──────────────────────────────────────────────────────
// Supports: page, search, role, is_active, is_approved
export async function getAdminUsers(
  params: Record<string, string | number | undefined> = {}
): Promise<PaginatedResponse<User>> {
  const search = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== "") search.set(k, String(v));
  }
  const qs = search.toString() ? `?${search}` : "";
  const { data } = await api.get<PaginatedResponse<User>>(`/admin/users${qs}`);
  return data;
}

// ── GET /api/admin/users/{user_id} ────────────────────────────────────────────
export async function getUserById(userId: string): Promise<User> {
  const { data } = await api.get<User>(`/admin/users/${userId}`);
  return data;
}

// ── PUT /api/admin/users/{user_id} ────────────────────────────────────────────
export async function updateUser(
  userId: string,
  payload: Partial<Pick<User, "full_name" | "role" | "is_active" | "is_approved">>
): Promise<User> {
  const { data } = await api.put<User>(`/admin/users/${userId}`, payload);
  return data;
}

// ── GET /api/admin/users/pending ──────────────────────────────────────────────
export async function getPendingUsers(): Promise<User[]> {
  const { data } = await api.get<User[]>("/admin/users/pending");
  return data;
}

// ── GET /api/admin/users/rejected ─────────────────────────────────────────────
export async function getRejectedUsers(): Promise<User[]> {
  const { data } = await api.get<User[]>("/admin/users/rejected");
  return data;
}

// ── POST /api/admin/users/{id}/approve ────────────────────────────────────────
export async function approveUser(
  userId: string
): Promise<{ message: string }> {
  const { data } = await api.post<{ message: string }>(
    `/admin/users/${userId}/approve`
  );
  return data;
}

// ── POST /api/admin/users/{id}/reject ─────────────────────────────────────────
export async function rejectUser(
  userId: string,
  payload: AdminUserRejectPayload
): Promise<{ message: string }> {
  const { data } = await api.post<{ message: string }>(
    `/admin/users/${userId}/reject`,
    payload
  );
  return data;
}

// ── POST /api/admin/users/{id}/change-role ────────────────────────────────────
export async function changeUserRole(
  userId: string,
  payload: AdminUserRoleChangePayload
): Promise<{ message: string }> {
  const { data } = await api.post<{ message: string }>(
    `/admin/users/${userId}/change-role`,
    payload
  );
  return data;
}

// ── POST /api/admin/users/{id}/toggle-status ──────────────────────────────────
export async function toggleUserActive(
  userId: string
): Promise<{ message: string; is_active: boolean }> {
  const { data } = await api.post<{ message: string; is_active: boolean }>(
    `/admin/users/${userId}/toggle-status`
  );
  return data;
}

// ── DELETE /api/admin/users/{id} ──────────────────────────────────────────────
export async function deleteUser(userId: string): Promise<void> {
  await api.delete(`/admin/users/${userId}`);
}