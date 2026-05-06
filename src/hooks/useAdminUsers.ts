// ============================================================
// CAMPUS EVENTS — useAdminUsers Hook
// Placement: src/hooks/useAdminUsers.ts
//
// Centralises all admin user-management logic:
//   - paginated list with search + filters
//   - approve / reject / toggle-status / change-role / delete
// ============================================================

"use client";

import { useState, useEffect, useCallback } from "react";
import {
    getAdminUsers,
    approveUser,
    rejectUser,
    toggleUserActive,
    changeUserRole,
    deleteUser,
} from "@/services/userService";
import { extractErrorMessage } from "@/utils/helpers";
import toast from "react-hot-toast";
import type { User, AdminUserRejectPayload, AdminUserRoleChangePayload } from "@/types";

interface UseAdminUsersOptions {
    initialPage?: number;
    search?: string;
    /** Filter by role: "ADMIN" | "STUDENT" | "" */
    role?: string;
    /** Filter by active state: "true" | "false" | "" */
    isActive?: string;
}

interface UseAdminUsersReturn {
    users: User[];
    total: number;
    currentPage: number;
    totalPages: number;
    loading: boolean;
    error: string | null;
    setPage: (page: number) => void;
    refetch: () => void;
    actions: {
        approve: (userId: string) => Promise<void>;
        reject: (userId: string, payload: AdminUserRejectPayload) => Promise<void>;
        toggleStatus: (userId: string) => Promise<void>;
        changeRole: (userId: string, payload: AdminUserRoleChangePayload) => Promise<void>;
        remove: (userId: string) => Promise<void>;
    };
}

export function useAdminUsers({
    initialPage = 1,
    search = "",
    role = "",
    isActive = "",
}: UseAdminUsersOptions = {}): UseAdminUsersReturn {
    const [users, setUsers] = useState<User[]>([]);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [currentPage, setCurrentPage] = useState(initialPage);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // ── Fetch ─────────────────────────────────────────────────────────────────
    const fetchUsers = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params: Record<string, string | number | undefined> = {
                page: currentPage,
            };
            if (search) params.search = search;
            if (role) params.role = role;
            if (isActive) params.is_active = isActive;

            const res = await getAdminUsers(params);
            setUsers(res.results);
            setTotal(res.count);
            setTotalPages(
                res.total_pages ?? Math.max(1, Math.ceil(res.count / 10))
            );
        } catch (err) {
            const msg = extractErrorMessage(err);
            setError(msg);
            setUsers([]);
            setTotal(0);
            setTotalPages(1);
            console.error("[useAdminUsers] fetch failed:", err);
        } finally {
            setLoading(false);
        }
    }, [currentPage, search, role, isActive]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    // ── Actions ───────────────────────────────────────────────────────────────

    const approve = useCallback(
        async (userId: string) => {
            try {
                const res = await approveUser(userId);
                toast.success(res.message ?? "User approved");
                // Optimistic update
                setUsers((prev) =>
                    prev.map((u) =>
                        u.id === userId ? { ...u, is_approved: true } : u
                    )
                );
            } catch (err) {
                toast.error(extractErrorMessage(err));
            }
        },
        []
    );

    const reject = useCallback(
        async (userId: string, payload: AdminUserRejectPayload) => {
            try {
                const res = await rejectUser(userId, payload);
                toast.success(res.message ?? "User rejected");
                setUsers((prev) =>
                    prev.map((u) =>
                        u.id === userId ? { ...u, is_rejected: true, is_approved: false } : u
                    )
                );
            } catch (err) {
                toast.error(extractErrorMessage(err));
            }
        },
        []
    );

    const toggleStatus = useCallback(
        async (userId: string) => {
            try {
                const res = await toggleUserActive(userId);
                toast.success(res.message ?? "Status updated");
                setUsers((prev) =>
                    prev.map((u) =>
                        u.id === userId ? { ...u, is_active: res.is_active } : u
                    )
                );
            } catch (err) {
                toast.error(extractErrorMessage(err));
            }
        },
        []
    );

    const changeRole = useCallback(
        async (userId: string, payload: AdminUserRoleChangePayload) => {
            try {
                const res = await changeUserRole(userId, payload);
                toast.success(res.message ?? "Role updated");
                setUsers((prev) =>
                    prev.map((u) =>
                        u.id === userId ? { ...u, role: payload.role } : u
                    )
                );
            } catch (err) {
                toast.error(extractErrorMessage(err));
            }
        },
        []
    );

    const remove = useCallback(
        async (userId: string) => {
            try {
                await deleteUser(userId);
                toast.success("User deleted");
                setUsers((prev) => prev.filter((u) => u.id !== userId));
                setTotal((t) => Math.max(0, t - 1));
            } catch (err) {
                toast.error(extractErrorMessage(err));
            }
        },
        []
    );

    return {
        users,
        total,
        currentPage,
        totalPages,
        loading,
        error,
        setPage: setCurrentPage,
        refetch: fetchUsers,
        actions: { approve, reject, toggleStatus, changeRole, remove },
    };
}