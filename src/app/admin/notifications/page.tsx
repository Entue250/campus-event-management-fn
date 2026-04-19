"use client";
// Placement: src/app/admin/notifications/page.tsx
//
// Real data from GET /notifications + GET /notifications/count
// Actions: mark one read, mark all read, delete

import Link from "next/link";
import {
    Bell,
    Plus,
    CheckCheck,
    Trash2,
    Check,
    RefreshCw,
} from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import { cn, formatDate, timeAgo } from "@/utils/helpers";
import type { Notification, NotificationType } from "@/types";

// ── Type badge colours ────────────────────────────────────────────────────────
const TYPE_STYLE: Record<NotificationType, string> = {
    REGISTRATION: "bg-green-100  text-green-700",
    CANCELLATION: "bg-red-100    text-red-600",
    EVENT_UPDATE: "bg-blue-100   text-blue-700",
    APPROVAL: "bg-teal-100   text-teal-700",
    REJECTION: "bg-red-100    text-red-700",
    BROADCAST: "bg-purple-100 text-purple-700",
    ANNOUNCEMENT: "bg-orange-100 text-orange-600",
    REMINDER: "bg-yellow-100 text-yellow-700",
    SYSTEM: "bg-gray-100   text-gray-600",
    EVENT: "bg-blue-100   text-blue-700",
    BILLING: "bg-indigo-100 text-indigo-700",
    WARNING: "bg-orange-100 text-orange-700",
};

function typeBadge(type: NotificationType): string {
    return TYPE_STYLE[type] ?? "bg-gray-100 text-gray-600";
}

function typeLabel(type: NotificationType): string {
    return type.charAt(0) + type.slice(1).toLowerCase().replace(/_/g, " ");
}

// ── Skeleton row ──────────────────────────────────────────────────────────────
function SkeletonRow() {
    return (
        <div className="flex items-start gap-4 p-4 border-b border-gray-100 animate-pulse">
            <div className="h-9 w-9 bg-gray-100 rounded-full shrink-0" />
            <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-100 rounded w-1/3" />
                <div className="h-3 bg-gray-50 rounded w-2/3" />
            </div>
            <div className="h-6 bg-gray-100 rounded w-20 shrink-0" />
        </div>
    );
}

// ── Notification row ──────────────────────────────────────────────────────────
interface NotificationRowProps {
    notification: Notification;
    onMarkRead: (id: string) => void;
    onDelete: (id: string) => void;
}

function NotificationRow({ notification: n, onMarkRead, onDelete }: NotificationRowProps) {
    return (
        <div
            className={cn(
                "flex items-start gap-4 p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors group",
                !n.is_read && "bg-blue-50/40"
            )}
        >
            {/* Unread dot */}
            <div className="mt-1 shrink-0">
                <div
                    className={cn(
                        "h-2.5 w-2.5 rounded-full mt-1.5",
                        n.is_read ? "bg-gray-200" : "bg-blue-500"
                    )}
                />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <p className={cn("text-sm font-semibold text-gray-900", n.is_read && "font-medium")}>
                        {n.title}
                    </p>
                    <span className={cn("text-[10px] font-bold uppercase px-2 py-0.5 rounded-full", typeBadge(n.notification_type))}>
                        {typeLabel(n.notification_type)}
                    </span>
                </div>
                <p className="text-sm text-gray-500 line-clamp-2">{n.message}</p>
                <p className="text-xs text-gray-400 mt-1">{timeAgo(n.created_at)}</p>
            </div>

            {/* Actions — visible on hover */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                {!n.is_read && (
                    <button
                        onClick={() => onMarkRead(n.id)}
                        className="h-8 w-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors"
                        title="Mark as read"
                    >
                        <Check className="h-4 w-4" />
                    </button>
                )}
                <button
                    onClick={() => onDelete(n.id)}
                    className="h-8 w-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                    title="Delete"
                >
                    <Trash2 className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function NotificationsPage() {
    const { notifications, unreadCount, total, loading, error, refetch, actions } =
        useNotifications();

    return (
        <div className="flex-1 bg-gray-50 min-h-screen">
            {/* ── Top bar ─────────────────────────────────────────────────────── */}
            <header className="bg-white border-b border-gray-200 px-6 h-14 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Bell className="h-4 w-4" />
                    Notifications
                    {unreadCount > 0 && (
                        <span className="ml-1 h-5 min-w-5 px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                            {unreadCount}
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={refetch}
                        disabled={loading}
                        className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors"
                    >
                        <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
                        Refresh
                    </button>
                    {unreadCount > 0 && (
                        <button
                            onClick={actions.markAllRead}
                            className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                        >
                            <CheckCheck className="h-3.5 w-3.5" />
                            Mark all read
                        </button>
                    )}
                    <Link
                        href="/admin/notifications/create"
                        className="flex items-center gap-1.5 px-4 py-2 bg-[#1a2744] text-white text-sm font-semibold rounded-lg hover:bg-[#0f1a35] transition-colors"
                    >
                        <Plus className="h-4 w-4" />
                        Send Notification
                    </Link>
                </div>
            </header>

            <div className="p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-1">Notifications</h1>
                <p className="text-gray-500 mb-6">
                    Manage and send notifications to campus community members.
                </p>

                {/* ── Stats row ────────────────────────────────────────────────── */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                    {[
                        { label: "Total", value: total, cls: "text-gray-900" },
                        { label: "Unread", value: unreadCount, cls: "text-blue-600" },
                        { label: "Read", value: total - unreadCount, cls: "text-green-600" },
                    ].map(({ label, value, cls }) => (
                        <div key={label} className="bg-white rounded-xl border border-gray-200 p-5">
                            <p className="text-sm text-gray-500">{label}</p>
                            <p className={cn("text-2xl font-bold mt-0.5", cls)}>
                                {loading ? (
                                    <span className="inline-block h-7 w-12 bg-gray-100 rounded animate-pulse" />
                                ) : (
                                    value.toLocaleString()
                                )}
                            </p>
                        </div>
                    ))}
                </div>

                {/* ── Notifications list ────────────────────────────────────────── */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                        <h2 className="font-bold text-gray-900">All Notifications</h2>
                        <p className="text-sm text-gray-400">{total.toLocaleString()} total</p>
                    </div>

                    {loading ? (
                        [...Array(6)].map((_, i) => <SkeletonRow key={i} />)
                    ) : error ? (
                        <div className="p-12 text-center">
                            <Bell className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500 font-medium">Failed to load notifications</p>
                            <button onClick={refetch} className="mt-3 text-sm text-[#1a2744] hover:underline">
                                Try again
                            </button>
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="p-12 text-center">
                            <Bell className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500 font-medium">No notifications</p>
                            <p className="text-sm text-gray-400 mt-1">
                                Send your first notification to the campus community.
                            </p>
                        </div>
                    ) : (
                        notifications.map((n) => (
                            <NotificationRow
                                key={n.id}
                                notification={n}
                                onMarkRead={actions.markOneRead}
                                onDelete={actions.remove}
                            />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}