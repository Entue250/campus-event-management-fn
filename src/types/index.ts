// // ============================================================
// // CAMPUS EVENTS INFORMATION SYSTEM — All TypeScript Types
// // ============================================================

// // ── Auth ─────────────────────────────────────────────────────────────────────
// export interface LoginPayload {
//   email: string;
//   password: string;
// }

// export interface RegisterPayload {
//   full_name: string;
//   email: string;
//   password: string;
//   confirm_password: string;   // backend requires this field
//   role: "STUDENT" | "ADMIN";
// }

// export interface AuthTokens {
//   access: string;
//   refresh: string;
// }

// // ACTUAL backend login response shape:
// // { message, access, refresh, user }   ← tokens are at the TOP LEVEL, not nested
// export interface AuthResponse {
//   message: string;
//   access: string;       // direct field, not tokens.access
//   refresh: string;      // direct field, not tokens.refresh
//   user: User;
// }

// export interface RefreshResponse {
//   access: string;
// }

// // ── User ──────────────────────────────────────────────────────────────────────
// export type UserRole = "ADMIN" | "STUDENT";
// export type RejectionReason = "INVALID_EMAIL" | "DUPLICATE" | "OTHER";

// export interface User {
//   id: string;
//   full_name: string;
//   email: string;
//   role: UserRole;
//   profile_image: string | null;
//   is_active: boolean;
//   is_approved: boolean;
//   is_rejected: boolean;
//   rejection_reason: RejectionReason | null;
//   rejection_note: string;
//   two_factor_enabled: boolean;
//   date_joined: string;
//   last_login: string | null;
//   registration_status?: string;
//   status?: string;
//   attended_count?: number;
//   registered_count?: number;
// }

// export interface ProfileUpdatePayload {
//   full_name?: string;
//   profile_image?: File;
// }

// export interface ChangePasswordPayload {
//   old_password: string;
//   new_password: string;
//   confirm_new_password: string;
// }

// export interface AdminUserRejectPayload {
//   reason: RejectionReason;
//   note?: string;
// }

// export interface AdminUserRoleChangePayload {
//   role: UserRole;
// }

// // ── Category ─────────────────────────────────────────────────────────────────
// export interface Category {
//   id: string;
//   name: string;
//   description: string;
//   event_count?: number;
// }

// export interface CategoryPayload {
//   name: string;
//   description?: string;
// }

// // ── Event ─────────────────────────────────────────────────────────────────────
// export type EventStatus = "UPCOMING" | "ONGOING" | "COMPLETED" | "CANCELLED";

// export interface Event {
//   id: string;
//   title: string;
//   description: string;
//   event_date: string;
//   end_date: string | null;
//   location: string;
//   organizer: string;
//   category: Category | null;
//   status: EventStatus;
//   max_capacity: number | null;
//   registration_count: number;
//   is_published: boolean;
//   banner_image: string | null;
//   registration_fee: string | number | null;
//   created_at: string;
//   updated_at: string;
//   registration_status?: string;
// }

// export interface EventCreatePayload {
//   title: string;
//   description: string;
//   event_date: string;
//   end_date?: string;
//   location: string;
//   organizer?: string;
//   category_id?: string;
//   max_capacity?: string | number;
//   registration_fee?: string | number;
//   is_published?: boolean;
//   banner_image?: File;
//   start_time?: string;
//   end_time?: string;
//   status?: string;
// }

// export interface EventFilters {
//   search?: string;
//   category?: string;
//   status?: EventStatus;
//   date_from?: string;
//   date_to?: string;
//   ordering?: string;
//   page?: number;
// }

// // ── Registration ──────────────────────────────────────────────────────────────
// export type RegistrationStatusType =
//   | "REGISTERED" | "CANCELLED" | "ATTENDED" | "CONFIRMED" | "PENDING";

// export interface Registration {
//   id: string;
//   user: User;
//   event: Event;
//   status: RegistrationStatusType;
//   registration_date?: string;
//   created_at?: string;
//   cancelled_at: string | null;
// }

// export interface RegistrationStatus {
//   is_registered: boolean;
//   registration: Registration | null;
// }

// // ── Notification ──────────────────────────────────────────────────────────────
// export type NotificationType =
//   | "REGISTRATION" | "CANCELLATION" | "EVENT_UPDATE" | "APPROVAL"
//   | "REJECTION" | "BROADCAST" | "ANNOUNCEMENT" | "REMINDER"
//   | "SYSTEM" | "EVENT" | "BILLING" | "WARNING";

// export interface Notification {
//   id: string;
//   title: string;
//   message: string;
//   notification_type: NotificationType;
//   is_read: boolean;
//   related_event: Event | null;
//   created_at: string;
// }

// export interface NotificationBroadcastPayload {
//   title: string;
//   message: string;
//   notification_type?: NotificationType;
//   target: "specific_user" | "all_users" | "event_registrants";
//   user_id?: string;
//   event_id?: string;
// }

// // ── Support ───────────────────────────────────────────────────────────────────
// export type TicketStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
// export type TicketPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
// export type TicketCategory =
//   | "TECHNICAL" | "ACCOUNT" | "EVENT"
//   | "GENERAL" | "REGISTRATION" | "BILLING" | "OTHER";

// export interface SupportTicket {
//   id: string;
//   user: User | null;
//   name: string;
//   email: string;
//   subject: string;
//   message: string;
//   category: TicketCategory;
//   status: TicketStatus;
//   priority: TicketPriority;
//   admin_response: string;
//   responded_by: User | null;
//   responded_at: string | null;
//   closed_at: string | null;
//   created_at: string;
//   updated_at: string;
// }

// export interface SupportTicketPayload {
//   name?: string;
//   email: string;
//   subject: string;
//   message: string;
//   category?: TicketCategory;
// }

// export interface SupportRespondPayload {
//   admin_response: string;
//   status?: TicketStatus;
// }

// export interface SupportPriorityPayload {
//   priority: TicketPriority;
// }

// // ── System Settings ───────────────────────────────────────────────────────────
// export interface SystemSettings {
//   id: string;
//   university_name: string;
//   site_name: string;
//   site_description: string;
//   contact_email: string;
//   timezone: string;
//   university_logo: string | null;
//   registration_enabled: boolean;
//   max_registrations_per_event: number;
//   send_registration_emails: boolean;
//   send_cancellation_emails: boolean;
//   event_reminder_enabled: boolean;
//   registration_confirmation_enabled: boolean;
//   event_update_notifications: boolean;
//   two_factor_enforcement: boolean;
//   ssl_enabled: boolean;
//   session_timeout_minutes: number;
//   max_login_attempts: number;
//   maintenance_mode: boolean;
//   maintenance_message: string;
//   last_backup_at: string | null;
//   maintenance_scheduled_at: string | null;
//   updated_at: string;
// }

// // ── Analytics ─────────────────────────────────────────────────────────────────
// export interface UserAnalyticsStats {
//   total: number;
//   students: number;
//   admins: number;
//   pending_approval: number;
//   rejected: number;
//   active: number;
//   new_this_month: number;
//   new_this_week: number;
// }

// export interface EventAnalyticsStats {
//   total: number;
//   upcoming: number;
//   ongoing: number;
//   completed: number;
//   cancelled: number;
//   published: number;
//   created_this_month: number;
// }

// export interface RegistrationAnalyticsStats {
//   total: number;
//   active: number;
//   cancelled: number;
//   attended: number;
//   this_month: number;
//   this_week: number;
// }

// export interface SupportAnalyticsStats {
//   total: number;
//   open: number;
//   in_progress: number;
//   resolved: number;
//   urgent: number;
// }

// export interface TopEvent {
//   id: string;
//   title: string;
//   event_date: string;
//   reg_count: number;
//   max_capacity?: number;
//   category?: string | Category;
//   status?: string;
// }

// export interface MonthlyTrend {
//   month: string;
//   registrations: number;
// }

// export interface CategoryStat {
//   id: string;
//   name: string;
//   event_count: number;
// }

// export interface AnalyticsOverview {
//   users: UserAnalyticsStats;
//   events: EventAnalyticsStats;
//   registrations: RegistrationAnalyticsStats;
//   support: SupportAnalyticsStats;
//   top_events: TopEvent[];
//   monthly_registration_trend: MonthlyTrend[];
//   category_breakdown: CategoryStat[];
//   generated_at: string;
// }

// export interface StudentDashboardStats {
//   total_registered: number;
//   total_attended: number;
//   total_cancelled: number;
//   unread_notifications: number;
// }

// export interface StudentDashboardData {
//   user: Pick<User, "id" | "full_name" | "email" | "role">;
//   stats: StudentDashboardStats;
//   upcoming_events: Event[];
//   my_registered_events: Registration[];
//   recent_notifications: Notification[];
//   unread_notifications: number;
//   registered_count?: number;
//   attended_count?: number;
// }

// // ── Pagination ────────────────────────────────────────────────────────────────
// export interface PaginatedResponse<T> {
//   count: number;
//   next: string | null;
//   previous: string | null;
//   results: T[];
//   unread_count?: number;
// }

// export type ApiFieldErrors = Record<string, string | string[] >;

// export interface ApiError {
//   detail?: string;
//   message?: string;
//   [key: string]: string | string[] | undefined
// }

// // ── AuditLog ──────────────────────────────────────────────────────────────────
// export type AuditAction =
//   | "CREATE" | "UPDATE" | "DELETE" | "APPROVE" | "REJECT"
//   | "LOGIN" | "LOGOUT" | "BROADCAST" | "SETTINGS" | "TOGGLE" | "ROLE_CHANGE";

// export interface AuditLog {
//   id: string;
//   admin: User | null;
//   action: AuditAction;
//   resource_type: string;
//   resource_id: string;
//   description: string;
//   ip_address: string | null;
//   created_at: string;
// }

// ============================================================
// CAMPUS EVENTS INFORMATION SYSTEM — All TypeScript Types
// Placement: src/types/index.ts
// ============================================================

// ── Auth ───────────────────────────────────────────────────────────────────────
export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  full_name: string;
  email: string;
  password: string;
  confirm_password: string;
  role: "STUDENT" | "ADMIN";
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface AuthResponse {
  message: string;
  access: string;
  refresh: string;
  user: User;
}

export interface RefreshResponse {
  access: string;
}

// ── User ────────────────────────────────────────────────────────────────────────
export type UserRole = "ADMIN" | "STUDENT";
export type RejectionReason = "INVALID_EMAIL" | "DUPLICATE" | "OTHER";

export interface User {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  profile_image: string | null;
  is_active: boolean;
  is_approved: boolean;
  is_rejected: boolean;
  rejection_reason: RejectionReason | null;
  rejection_note: string;
  two_factor_enabled: boolean;
  date_joined: string;
  last_login: string | null;
  registration_status?: string;
  status?: string;
  attended_count?: number;
  registered_count?: number;
}

export interface ProfileUpdatePayload {
  full_name?: string;
  profile_image?: File;
}

export interface ChangePasswordPayload {
  old_password: string;
  new_password: string;
  confirm_new_password: string;
}

export interface AdminUserRejectPayload {
  reason: RejectionReason;
  note?: string;
}

export interface AdminUserRoleChangePayload {
  role: UserRole;
}

// ── Category ───────────────────────────────────────────────────────────────────
export interface Category {
  id: string;
  name: string;
  description: string;
  event_count?: number;
  /** ISO datetime returned by GET /categories and POST /categories */
  created_at?: string;
}

export interface CategoryPayload {
  name: string;
  description?: string;
}

// ── Event ───────────────────────────────────────────────────────────────────────
export type EventStatus = "UPCOMING" | "ONGOING" | "COMPLETED" | "CANCELLED";

export interface Event {
  id: string;
  title: string;
  description: string;
  event_date: string;
  end_date: string | null;
  location: string;
  organizer: string;
  category: Category | null;
  /** Flat category name returned by admin list endpoint */
  category_name?: string;
  status: EventStatus;
  max_capacity: number | null;
  /** Alias for max_capacity returned by some endpoints */
  capacity?: number;
  registration_count: number;
  /** Number of confirmed registrations (returned by admin list) */
  registered_count?: number;
  /** Available spots remaining */
  available_spots?: number | null;
  is_published: boolean;
  banner_image: string | null;
  registration_fee: string | number | null;
  /** Tags string (comma-separated) */
  tags?: string;
  created_at: string;
  updated_at: string;
  registration_status?: string;
}

export interface EventCreatePayload {
  title: string;
  description: string;
  event_date: string;
  end_date?: string;
  location: string;
  organizer?: string;
  /** UUID sent as FormData field "category" */
  category_id?: string;
  /** Sent as FormData field "capacity" */
  max_capacity?: string | number;
  registration_fee?: string | number;
  is_published?: boolean;
  banner_image?: File;
  start_time?: string;
  end_time?: string;
  status?: string;
  /** Comma-separated tags string */
  tags?: string;
}

export interface EventFilters {
  search?: string;
  category?: string;
  status?: EventStatus;
  date_from?: string;
  date_to?: string;
  ordering?: string;
  page?: number;
}

// ── Registration ────────────────────────────────────────────────────────────────
export type RegistrationStatusType =
  | "REGISTERED"
  | "CANCELLED"
  | "ATTENDED"
  | "CONFIRMED"
  | "PENDING";

/**
 * Standard Registration — used in student-facing endpoints.
 * `user` and `event` are nested objects.
 */
export interface Registration {
  id: string;
  user: User;
  event: Event;
  status: RegistrationStatusType;
  registration_date?: string;
  created_at?: string;
  cancelled_at: string | null;
}

export interface RegistrationStatus {
  is_registered: boolean;
  registration: Registration | null;
}

/**
 * AdminRegistration — shape returned by:
 *   GET /admin/registrations/
 *   GET /admin/events/{event_id}/registrations
 *
 * `user` and `event` are raw UUID strings; names/emails are flat fields.
 */
export interface AdminRegistration {
  id: string;
  /** UUID of the user */
  user: string;
  user_name: string;
  user_email: string;
  /** UUID of the event */
  event: string;
  event_title: string;
  status: RegistrationStatusType;
  registration_date: string;
  cancelled_at: string | null;
  notes: string;
}

// ── Notification ────────────────────────────────────────────────────────────────
export type NotificationType =
  | "REGISTRATION"
  | "CANCELLATION"
  | "EVENT_UPDATE"
  | "APPROVAL"
  | "REJECTION"
  | "BROADCAST"
  | "ANNOUNCEMENT"
  | "REMINDER"
  | "SYSTEM"
  | "EVENT"
  | "BILLING"
  | "WARNING";

export interface Notification {
  id: string;
  title: string;
  message: string;
  notification_type: NotificationType;
  is_read: boolean;
  related_event: Event | null;
  created_at: string;
}

export interface NotificationBroadcastPayload {
  title: string;
  message: string;
  notification_type?: NotificationType;
  target: "specific_user" | "all_users" | "event_registrants";
  user_id?: string;
  event_id?: string;
}

// ── Support ─────────────────────────────────────────────────────────────────────
export type TicketStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
export type TicketPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
export type TicketCategory =
  | "TECHNICAL"
  | "ACCOUNT"
  | "EVENT"
  | "GENERAL"
  | "REGISTRATION"
  | "BILLING"
  | "OTHER";

export interface SupportTicket {
  id: string;
  user: User | null;
  name: string;
  email: string;
  subject: string;
  message: string;
  category: TicketCategory;
  status: TicketStatus;
  priority: TicketPriority;
  admin_response: string;
  responded_by: User | null;
  responded_at: string | null;
  closed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface SupportTicketPayload {
  name?: string;
  email: string;
  subject: string;
  message: string;
  category?: TicketCategory;
}

export interface SupportRespondPayload {
  admin_response: string;
  status?: TicketStatus;
}

export interface SupportPriorityPayload {
  priority: TicketPriority;
}

// ── System Settings ─────────────────────────────────────────────────────────────
export interface SystemSettings {
  id: string;
  university_name: string;
  site_name: string;
  site_description: string;
  contact_email: string;
  timezone: string;
  university_logo: string | null;
  registration_enabled: boolean;
  max_registrations_per_event: number;
  send_registration_emails: boolean;
  send_cancellation_emails: boolean;
  event_reminder_enabled: boolean;
  registration_confirmation_enabled: boolean;
  event_update_notifications: boolean;
  two_factor_enforcement: boolean;
  ssl_enabled: boolean;
  session_timeout_minutes: number;
  max_login_attempts: number;
  maintenance_mode: boolean;
  maintenance_message: string;
  last_backup_at: string | null;
  maintenance_scheduled_at: string | null;
  updated_at: string;
}

// ── Analytics ───────────────────────────────────────────────────────────────────
export interface UserAnalyticsStats {
  total: number;
  students: number;
  admins: number;
  pending_approval: number;
  rejected: number;
  active: number;
  new_this_month: number;
  new_this_week: number;
}

export interface EventAnalyticsStats {
  total: number;
  upcoming: number;
  ongoing: number;
  completed: number;
  cancelled: number;
  published: number;
  created_this_month: number;
}

export interface RegistrationAnalyticsStats {
  total: number;
  active: number;
  cancelled: number;
  attended: number;
  this_month: number;
  this_week: number;
}

export interface SupportAnalyticsStats {
  total: number;
  open: number;
  in_progress: number;
  resolved: number;
  urgent: number;
}

export interface TopEvent {
  id: string;
  title: string;
  event_date: string;
  reg_count: number;
  max_capacity?: number;
  category?: string | Category;
  status?: string;
}

export interface MonthlyTrend {
  month: string;
  registrations: number;
}

export interface CategoryStat {
  id: string;
  name: string;
  event_count: number;
}

export interface AnalyticsOverview {
  users: UserAnalyticsStats;
  events: EventAnalyticsStats;
  registrations: RegistrationAnalyticsStats;
  support: SupportAnalyticsStats;
  top_events: TopEvent[];
  monthly_registration_trend: MonthlyTrend[];
  category_breakdown: CategoryStat[];
  generated_at: string;
}

export interface StudentDashboardStats {
  total_registered: number;
  total_attended: number;
  total_cancelled: number;
  unread_notifications: number;
}

export interface StudentDashboardData {
  user: Pick<User, "id" | "full_name" | "email" | "role">;
  stats: StudentDashboardStats;
  upcoming_events: Event[];
  my_registered_events: Registration[];
  recent_notifications: Notification[];
  unread_notifications: number;
  registered_count?: number;
  attended_count?: number;
}

// ── Pagination ──────────────────────────────────────────────────────────────────
export interface PaginatedResponse<T> {
  count: number;
  /** Total number of pages (returned by some admin endpoints) */
  total_pages?: number;
  /** Current page number (returned by some admin endpoints) */
  current_page?: number;
  next: string | null;
  previous: string | null;
  results: T[];
  unread_count?: number;
}

export type ApiFieldErrors = Record<string, string | string[]>;

export interface ApiError {
  detail?: string;
  message?: string;
  [key: string]: string | string[] | undefined;
}

// ── AuditLog ────────────────────────────────────────────────────────────────────
export type AuditAction =
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "APPROVE"
  | "REJECT"
  | "LOGIN"
  | "LOGOUT"
  | "BROADCAST"
  | "SETTINGS"
  | "TOGGLE"
  | "ROLE_CHANGE";

export interface AuditLog {
  id: string;
  admin: User | null;
  action: AuditAction;
  resource_type: string;
  resource_id: string;
  description: string;
  ip_address: string | null;
  created_at: string;
}