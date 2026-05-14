// // ============================================================
// // CAMPUS EVENTS — useNotifications Hook
// // ============================================================

// "use client";

// import { useState, useEffect, useCallback } from "react";
// import {
//   getNotifications,
//   getUnreadCount,
//   markAsRead,
//   markAllAsRead,
// } from "@/services/notificationService";
// import { extractErrorMessage } from "@/utils/helpers";
// import toast from "react-hot-toast";
// import type { Notification } from "@/types";

// export function useNotifications() {
//   const [notifications, setNotifications] = useState<Notification[]>([]);
//   const [unreadCount, setUnreadCount] = useState(0);
//   const [loading, setLoading] = useState(true);
//   const [page, setPage] = useState(1);
//   const [total, setTotal] = useState(0);

//   const fetchNotifications = useCallback(async () => {
//     setLoading(true);
//     try {
//       const result = await getNotifications(page);
//       setNotifications(result.results);
//       setTotal(result.count);
//       setUnreadCount(result.unread_count ?? 0);
//     } catch (err) {
//       console.error(extractErrorMessage(err));
//     } finally {
//       setLoading(false);
//     }
//   }, [page]);

//   const fetchUnreadCount = useCallback(async () => {
//     try {
//       const result = await getUnreadCount();
//       setUnreadCount(result.unread_count);
//     } catch {
//       // Silently fail for background polling
//     }
//   }, []);

//   useEffect(() => {
//     fetchNotifications();
//   }, [fetchNotifications]);

//   const read = useCallback(async (id: string) => {
//     try {
//       await markAsRead(id);
//       setNotifications((prev) =>
//         prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
//       );
//       setUnreadCount((c) => Math.max(0, c - 1));
//     } catch (err) {
//       toast.error(extractErrorMessage(err));
//     }
//   }, []);

//   const readAll = useCallback(async () => {
//     try {
//       await markAllAsRead();
//       setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
//       setUnreadCount(0);
//       toast.success("All notifications marked as read");
//     } catch (err) {
//       toast.error(extractErrorMessage(err));
//     }
//   }, []);

//   return {
//     notifications,
//     unreadCount,
//     loading,
//     page,
//     total,
//     setPage,
//     refetch: fetchNotifications,
//     fetchUnreadCount,
//     read,
//     readAll,
//   };
// }

// ============================================================
// CAMPUS EVENTS — useNotifications Hook
// Placement: src/hooks/useNotifications.ts
// ============================================================

"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getNotifications,
  getUnreadCount,
  markAllAsRead,
  markAsRead,
  deleteNotification,
} from "@/services/notificationService";
import { extractErrorMessage } from "@/utils/helpers";
import toast from "react-hot-toast";
import type { Notification } from "@/types";

interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  total: number;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  actions: {
    markOneRead: (id: string) => Promise<void>;
    markAllRead: () => Promise<void>;
    remove: (id: string) => Promise<void>;
  };
}

export function useNotifications(): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount]     = useState(0);
  const [total, setTotal]                 = useState(0);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [listRes, countRes] = await Promise.all([
        getNotifications(),
        getUnreadCount(),
      ]);
      setNotifications(listRes.results);
      setTotal(listRes.count);
      setUnreadCount(countRes.unread_count);
    } catch (err) {
      setError(extractErrorMessage(err));
      console.error("[useNotifications] fetch failed:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── Mark one as read ──────────────────────────────────────────────────────
  const markOneRead = useCallback(async (id: string) => {
    try {
      await markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  }, []);

  // ── Mark all as read ──────────────────────────────────────────────────────
  const markAllRead = useCallback(async () => {
    try {
      await markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
      toast.success("All notifications marked as read");
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  }, []);

  // ── Delete ─────────────────────────────────────────────────────────────────
  const remove = useCallback(async (id: string) => {
    try {
      await deleteNotification(id);
      setNotifications((prev) => {
        const n = prev.find((x) => x.id === id);
        if (n && !n.is_read) setUnreadCount((c) => Math.max(0, c - 1));
        return prev.filter((x) => x.id !== id);
      });
      setTotal((t) => Math.max(0, t - 1));
      toast.success("Notification deleted");
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  }, []);

  return {
    notifications,
    unreadCount,
    total,
    loading,
    error,
    refetch: fetchAll,
    actions: { markOneRead, markAllRead, remove },
  };
}