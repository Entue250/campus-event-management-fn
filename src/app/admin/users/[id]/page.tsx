"use client";
// Placement: src/app/admin/users/[id]/page.tsx
//
// Full user profile view.
// Breadcrumb: Admin > Users > {Full Name}
// Endpoint: GET /api/admin/users/{user_id}

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
    ChevronRight,
    ArrowLeft,
    Pencil,
    UserX,
    UserCheck,
    Trash2,
    Mail,
    Calendar,
    Clock,
    Shield,
    User as UserIcon,
} from "lucide-react";
import { getUserById, approveUser, rejectUser, toggleUserActive, deleteUser } from "@/services/userService";
import { getInitials, cn, formatDate, timeAgo, extractErrorMessage } from "@/utils/helpers";
import type { User } from "@/types";
import toast from "react-hot-toast";

const AVATAR_COLOURS = [
    "bg-blue-100 text-blue-700",
    "bg-purple-100 text-purple-700",
    "bg-orange-100 text-orange-700",
    "bg-teal-100 text-teal-700",
];

function approvalBadge(user: User): { label: string; cls: string } {
    if (user.is_rejected) return { label: "Rejected", cls: "bg-red-100 text-red-600" };
    if (user.is_approved) return { label: "Approved", cls: "bg-green-100 text-green-700" };
    return { label: "Pending", cls: "bg-yellow-100 text-yellow-700" };
}

export default function UserDetailPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();

    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [acting, setActing] = useState(false);

    useEffect(() => {
        if (!id) return;
        setLoading(true);
        getUserById(id)
            .then(setUser)
            .catch(() => toast.error("Failed to load user"))
            .finally(() => setLoading(false));
    }, [id]);

    const withAction = async (fn: () => Promise<void>) => {
        setActing(true);
        try { await fn(); } finally { setActing(false); }
    };

    const handleToggleStatus = () =>
        withAction(async () => {
            const res = await toggleUserActive(id);
            setUser((u) => u ? { ...u, is_active: res.is_active } : u);
            toast.success(res.message ?? "Status updated");
        });

    const handleApprove = () =>
        withAction(async () => {
            const res = await approveUser(id);
            setUser((u) => u ? { ...u, is_approved: true, is_rejected: false } : u);
            toast.success(res.message ?? "User approved");
        });

    const handleReject = () =>
        withAction(async () => {
            const res = await rejectUser(id, { reason: "OTHER" });
            setUser((u) => u ? { ...u, is_rejected: true, is_approved: false } : u);
            toast.success(res.message ?? "User rejected");
        });

    const handleDelete = async () => {
        if (!confirm(`Delete user "${user?.full_name}"? This cannot be undone.`)) return;
        try {
            await deleteUser(id);
            toast.success("User deleted");
            router.push("/admin/users");
        } catch (err) {
            toast.error(extractErrorMessage(err));
        }
    };

    // ── Loading skeleton ──────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="flex-1 bg-gray-50 min-h-screen p-6">
                <div className="max-w-3xl mx-auto space-y-4 animate-pulse">
                    <div className="h-4 bg-gray-100 rounded w-48" />
                    <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="h-16 w-16 bg-gray-100 rounded-full" />
                            <div className="space-y-2">
                                <div className="h-5 bg-gray-100 rounded w-40" />
                                <div className="h-3 bg-gray-50 rounded w-56" />
                            </div>
                        </div>
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="h-12 bg-gray-100 rounded-lg" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex-1 bg-gray-50 min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-500 mb-4">User not found</p>
                    <button onClick={() => router.back()}
                        className="flex items-center gap-2 px-4 py-2 bg-[#1a2744] text-white text-sm font-semibold rounded-lg mx-auto">
                        <ArrowLeft className="h-4 w-4" /> Go Back
                    </button>
                </div>
            </div>
        );
    }

    const approval = approvalBadge(user);
    const avatarCls = AVATAR_COLOURS[user.full_name.charCodeAt(0) % AVATAR_COLOURS.length];

    return (
        <div className="flex-1 bg-gray-50 min-h-screen">
            {/* ── Top bar ─────────────────────────────────────────────────────── */}
            <header className="bg-white border-b border-gray-200 px-6 h-14 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <button onClick={() => router.back()}
                        className="h-8 w-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors">
                        <ArrowLeft className="h-4 w-4" />
                    </button>
                    <h1 className="font-semibold text-gray-900">User Details</h1>
                </div>
                <div className="flex items-center gap-2">
                    <Link href={`/admin/users/${user.id}/edit`}
                        className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                        <Pencil className="h-4 w-4" /> Edit
                    </Link>
                    <button onClick={handleDelete} disabled={acting}
                        className="flex items-center gap-1.5 px-4 py-2 border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors disabled:opacity-50">
                        <Trash2 className="h-4 w-4" /> Delete
                    </button>
                </div>
            </header>

            <div className="p-6 max-w-3xl mx-auto">
                {/* Breadcrumb */}
                <div className="flex items-center gap-1 text-sm text-gray-400 mb-4">
                    <Link href="/admin" className="hover:text-gray-600">Admin</Link>
                    <ChevronRight className="h-3.5 w-3.5" />
                    <Link href="/admin/users" className="hover:text-gray-600">Users</Link>
                    <ChevronRight className="h-3.5 w-3.5" />
                    <span className="text-gray-700 truncate max-w-xs">{user.full_name}</span>
                </div>

                {/* Profile card */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 mb-5">
                    <div className="flex items-start gap-5 mb-6">
                        {user.profile_image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={user.profile_image} alt={user.full_name}
                                className="h-16 w-16 rounded-full object-cover shrink-0" />
                        ) : (
                            <div className={`h-16 w-16 rounded-full ${avatarCls} flex items-center justify-center text-lg font-bold shrink-0`}>
                                {getInitials(user.full_name)}
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <h2 className="text-xl font-bold text-gray-900">{user.full_name}</h2>
                            <p className="text-sm text-gray-500 mt-0.5">{user.email}</p>
                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-700">
                                    {user.role === "ADMIN" ? "Admin" : "Student"}
                                </span>
                                <span className={cn("text-xs font-semibold px-2.5 py-1 rounded-full", approval.cls)}>
                                    {approval.label}
                                </span>
                                <span className={cn("flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full",
                                    user.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600")}>
                                    <span className={cn("h-1.5 w-1.5 rounded-full", user.is_active ? "bg-green-500" : "bg-red-500")} />
                                    {user.is_active ? "Active" : "Suspended"}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Info grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-gray-50 rounded-xl p-4 flex items-start gap-3">
                            <Mail className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                            <div>
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Email</p>
                                <p className="text-sm font-semibold text-gray-900">{user.email}</p>
                            </div>
                        </div>

                        <div className="bg-gray-50 rounded-xl p-4 flex items-start gap-3">
                            <Shield className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                            <div>
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Role</p>
                                <p className="text-sm font-semibold text-gray-900">
                                    {user.role === "ADMIN" ? "Administrator" : "Student"}
                                </p>
                            </div>
                        </div>

                        <div className="bg-gray-50 rounded-xl p-4 flex items-start gap-3">
                            <Calendar className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                            <div>
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Date Joined</p>
                                <p className="text-sm font-semibold text-gray-900">{formatDate(user.date_joined)}</p>
                            </div>
                        </div>

                        <div className="bg-gray-50 rounded-xl p-4 flex items-start gap-3">
                            <Clock className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                            <div>
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Last Login</p>
                                <p className="text-sm font-semibold text-gray-900">
                                    {user.last_login ? timeAgo(user.last_login) : "Never"}
                                </p>
                            </div>
                        </div>

                        {user.attended_count !== undefined && (
                            <div className="bg-gray-50 rounded-xl p-4 flex items-start gap-3">
                                <UserIcon className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                                <div>
                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Events Attended</p>
                                    <p className="text-sm font-semibold text-gray-900">{user.attended_count}</p>
                                </div>
                            </div>
                        )}

                        {user.registered_count !== undefined && (
                            <div className="bg-gray-50 rounded-xl p-4 flex items-start gap-3">
                                <UserIcon className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                                <div>
                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Events Registered</p>
                                    <p className="text-sm font-semibold text-gray-900">{user.registered_count}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Quick actions card ───────────────────────────────────────── */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h3 className="font-bold text-gray-900 mb-4">Quick Actions</h3>
                    <div className="flex flex-wrap gap-3">
                        {/* Approve — only for pending users */}
                        {!user.is_approved && !user.is_rejected && (
                            <button onClick={handleApprove} disabled={acting}
                                className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm font-semibold hover:bg-green-100 transition-colors disabled:opacity-50">
                                <UserCheck className="h-4 w-4" /> Approve
                            </button>
                        )}

                        {/* Reject — only for non-rejected */}
                        {!user.is_rejected && (
                            <button onClick={handleReject} disabled={acting}
                                className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm font-semibold hover:bg-red-100 transition-colors disabled:opacity-50">
                                <UserX className="h-4 w-4" /> Reject
                            </button>
                        )}

                        {/* Toggle active */}
                        <button onClick={handleToggleStatus} disabled={acting}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border transition-colors disabled:opacity-50",
                                user.is_active
                                    ? "bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100"
                                    : "bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                            )}>
                            <UserX className="h-4 w-4" />
                            {user.is_active ? "Suspend" : "Reactivate"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}