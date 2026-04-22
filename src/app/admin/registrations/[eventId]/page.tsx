"use client";
// Placement: src/app/admin/registrations/[eventId]/page.tsx
//
// Shows all registrations for a specific event.
// Endpoint: GET /api/admin/events/{event_id}/registrations
//
// Navigation breadcrumb:
//   Admin > Registrations > {Event Title}
//
// Design follows the same pattern as other admin pages:
//   - Sticky header with search
//   - Stat cards
//   - Table with skeleton loader
//   - Paginated results

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
    BarChart3,
    CheckCircle,
    Timer,
    XCircle,
    ChevronLeft,
    ChevronRight,
    ArrowLeft,
    MoreHorizontal,
    Eye,
} from "lucide-react";
import { getEventRegistrations } from "@/services/eventService";
import { getEvent } from "@/services/eventService";
import { cn } from "@/utils/helpers";
import type { AdminRegistration } from "@/types";

// ── Status badge colours ──────────────────────────────────────────────────────
const STATUS_STYLE: Record<string, string> = {
    REGISTERED: "bg-green-100 text-green-700",
    ATTENDED: "bg-blue-100 text-blue-700",
    CANCELLED: "bg-red-100 text-red-700",
    CONFIRMED: "bg-green-100 text-green-700",
    PENDING: "bg-gray-100 text-gray-600",
};

const INITIALS_BG = [
    "bg-gray-200 text-gray-600",
    "bg-blue-100 text-blue-700",
    "bg-purple-100 text-purple-700",
    "bg-green-100 text-green-700",
    "bg-orange-100 text-orange-700",
];

function getInitials(name: string): string {
    return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
}

function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString("en", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

// ── Registration detail modal/panel ──────────────────────────────────────────
// Shows full details for a single registration inline (no new page needed)
interface DetailPanelProps {
    reg: AdminRegistration;
    onClose: () => void;
}

function RegistrationDetailPanel({ reg, onClose }: DetailPanelProps) {
    const statusStyle = STATUS_STYLE[reg.status] ?? "bg-gray-100 text-gray-600";
    const statusLabel = reg.status.charAt(0) + reg.status.slice(1).toLowerCase();

    return (
        // Overlay
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
            onClick={onClose}
        >
            {/* Panel — stop propagation so clicking inside doesn't close */}
            <div
                className="bg-white rounded-2xl border border-gray-200 shadow-xl w-full max-w-md mx-4 p-6"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-start justify-between mb-5">
                    <div>
                        <h2 className="font-bold text-gray-900 text-lg">Registration Detail</h2>
                        <p className="text-xs text-gray-400 mt-0.5">ID: {reg.id.slice(0, 8).toUpperCase()}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="h-8 w-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        ✕
                    </button>
                </div>

                {/* Student info */}
                <div className="bg-gray-50 rounded-xl p-4 mb-4">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                        Student
                    </p>
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-[#1a2744] flex items-center justify-center text-white text-sm font-bold shrink-0">
                            {getInitials(reg.user_name)}
                        </div>
                        <div>
                            <p className="font-semibold text-gray-900">{reg.user_name}</p>
                            <p className="text-sm text-gray-500">{reg.user_email}</p>
                        </div>
                    </div>
                </div>

                {/* Event info */}
                <div className="bg-gray-50 rounded-xl p-4 mb-4">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                        Event
                    </p>
                    <p className="font-semibold text-gray-900">{reg.event_title}</p>
                </div>

                {/* Status & dates */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                            Status
                        </p>
                        <span className={cn("text-xs font-semibold px-2.5 py-1 rounded-full", statusStyle)}>
                            {statusLabel}
                        </span>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                            Registered On
                        </p>
                        <p className="text-sm font-semibold text-gray-900">
                            {formatDate(reg.registration_date)}
                        </p>
                    </div>
                </div>

                {/* Cancellation date (if cancelled) */}
                {reg.cancelled_at && (
                    <div className="bg-red-50 rounded-xl p-4 mb-4">
                        <p className="text-xs font-semibold text-red-400 uppercase tracking-wide mb-1">
                            Cancelled On
                        </p>
                        <p className="text-sm font-semibold text-red-700">
                            {formatDate(reg.cancelled_at)}
                        </p>
                    </div>
                )}

                {/* Notes */}
                {reg.notes && (
                    <div className="bg-gray-50 rounded-xl p-4 mb-4">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
                            Notes
                        </p>
                        <p className="text-sm text-gray-700">{reg.notes}</p>
                    </div>
                )}

                <button
                    onClick={onClose}
                    className="w-full py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                    Close
                </button>
            </div>
        </div>
    );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function EventRegistrationsPage() {
    const { eventId } = useParams<{ eventId: string }>();
    const router = useRouter();

    const [registrations, setRegistrations] = useState<AdminRegistration[]>([]);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [eventTitle, setEventTitle] = useState("Event");

    // Registration selected for detail panel
    const [selected, setSelected] = useState<AdminRegistration | null>(null);

    // ── Fetch event title for breadcrumb ──────────────────────────────────────
    useEffect(() => {
        if (!eventId) return;
        getEvent(eventId)
            .then((ev) => setEventTitle(ev.title))
            .catch(() => { }); // non-critical — breadcrumb falls back to "Event"
    }, [eventId]);

    // ── Fetch registrations for this event ────────────────────────────────────
    const fetchRegistrations = useCallback(async () => {
        if (!eventId) return;
        setLoading(true);
        try {
            const res = await getEventRegistrations(eventId);
            setRegistrations(res.results);
            setTotal(res.count);
            setTotalPages(
                res.total_pages ?? Math.max(1, Math.ceil(res.count / 10))
            );
        } catch (err) {
            console.error("[EventRegistrationsPage] fetch failed:", err);
            setRegistrations([]);
            setTotal(0);
            setTotalPages(1);
        } finally {
            setLoading(false);
        }
    }, [eventId, currentPage]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        fetchRegistrations();
    }, [fetchRegistrations]);

    // ── Stat counts ───────────────────────────────────────────────────────────
    const registeredCount = registrations.filter(
        (r) => r.status === "REGISTERED" || r.status === "CONFIRMED"
    ).length;
    const attendedCount = registrations.filter((r) => r.status === "ATTENDED").length;
    const cancelledCount = registrations.filter((r) => r.status === "CANCELLED").length;

    // ── Page window ───────────────────────────────────────────────────────────
    const pageWindow = Array.from(
        new Set(
            [1, currentPage - 1, currentPage, currentPage + 1, totalPages].filter(
                (p) => p >= 1 && p <= totalPages
            )
        )
    ).sort((a, b) => a - b);

    return (
        <>
            {/* Detail panel overlay */}
            {selected && (
                <RegistrationDetailPanel
                    reg={selected}
                    onClose={() => setSelected(null)}
                />
            )}

            <div className="flex-1 bg-gray-50 min-h-screen">
                {/* ── Top bar ───────────────────────────────────────────────────── */}
                <header className="bg-white border-b border-gray-200 px-6 h-14 flex items-center justify-between sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        {/* Back button */}
                        <button
                            onClick={() => router.back()}
                            className="h-8 w-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
                            aria-label="Go back"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </button>
                        <h1 className="font-semibold text-gray-900">Event Registrations</h1>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <input
                                placeholder="Search registrations..."
                                className="pl-9 pr-4 py-1.5 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none w-52"
                            />
                            <svg
                                className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400"
                                fill="none" viewBox="0 0 24 24" stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <button className="h-8 w-8 border border-gray-200 rounded-lg flex items-center justify-center text-gray-400">
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                            <span className="absolute -top-0.5 -right-0.5 h-2 w-2 bg-red-500 rounded-full" />
                        </button>
                    </div>
                </header>

                <div className="p-6">
                    {/* ── Breadcrumb ──────────────────────────────────────────────── */}
                    <div className="flex items-center gap-1 text-sm text-gray-400 mb-4">
                        <Link href="/admin" className="hover:text-gray-600">Admin</Link>
                        <ChevronRight className="h-3.5 w-3.5" />
                        <Link href="/admin/registrations" className="hover:text-gray-600">
                            Registrations
                        </Link>
                        <ChevronRight className="h-3.5 w-3.5" />
                        <span className="text-gray-700 truncate max-w-xs">{eventTitle}</span>
                    </div>

                    <h1 className="text-2xl font-bold text-gray-900 mb-1">{eventTitle}</h1>
                    <p className="text-gray-500 mb-6">
                        Viewing all registrations for this event.
                    </p>

                    {/* ── Stat cards ────────────────────────────────────────────── */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <div className="bg-white rounded-xl border border-gray-200 p-5">
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <p className="text-sm text-gray-500">Total</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {total.toLocaleString()}
                                    </p>
                                </div>
                                <div className="h-10 w-10 bg-gray-100 rounded-xl flex items-center justify-center shrink-0">
                                    <BarChart3 className="h-5 w-5 text-gray-500" />
                                </div>
                            </div>
                            <p className="text-xs text-gray-400">Registrations for this event</p>
                        </div>

                        <div className="bg-white rounded-xl border border-gray-200 p-5">
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <p className="text-sm text-gray-500">Registered</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {registeredCount.toLocaleString()}
                                    </p>
                                </div>
                                <div className="h-10 w-10 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                </div>
                            </div>
                            <p className="text-xs text-gray-400">Active registrations</p>
                        </div>

                        <div className="bg-white rounded-xl border border-gray-200 p-5">
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <p className="text-sm text-gray-500">Attended</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {attendedCount.toLocaleString()}
                                    </p>
                                </div>
                                <div className="h-10 w-10 bg-yellow-100 rounded-xl flex items-center justify-center shrink-0">
                                    <Timer className="h-5 w-5 text-yellow-600" />
                                </div>
                            </div>
                            <p className="text-xs text-gray-400">Checked-in attendees</p>
                        </div>

                        <div className="bg-white rounded-xl border border-gray-200 p-5">
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <p className="text-sm text-gray-500">Cancelled</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {cancelledCount.toLocaleString()}
                                    </p>
                                </div>
                                <div className="h-10 w-10 bg-red-100 rounded-xl flex items-center justify-center shrink-0">
                                    <XCircle className="h-5 w-5 text-red-500" />
                                </div>
                            </div>
                            <p className="text-xs text-red-500">Cancelled registrations</p>
                        </div>
                    </div>

                    {/* ── Table card ────────────────────────────────────────────── */}
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                        <div className="p-5 flex items-start justify-between">
                            <div>
                                <h2 className="font-bold text-gray-900">Registration List</h2>
                                <p className="text-sm text-gray-500">
                                    All students registered for{" "}
                                    <span className="font-medium text-gray-700">{eventTitle}</span>.
                                </p>
                            </div>
                            <p className="text-sm text-gray-400 self-center">
                                {total.toLocaleString()} result{total !== 1 ? "s" : ""}
                            </p>
                        </div>

                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-y border-gray-100">
                                    {[
                                        "STUDENT NAME",
                                        "EMAIL ADDRESS",
                                        "EVENT TITLE",
                                        "REGISTRATION DATE",
                                        "STATUS",
                                        "ACTIONS",
                                    ].map((h) => (
                                        <th
                                            key={h}
                                            className="text-left py-3 px-4 text-[10px] font-semibold text-gray-400 uppercase tracking-wide"
                                        >
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>

                            <tbody>
                                {loading ? (
                                    [...Array(4)].map((_, i) => (
                                        <tr key={i} className="border-b border-gray-50 animate-pulse">
                                            <td className="py-4 px-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 bg-gray-100 rounded-full" />
                                                    <div className="h-4 bg-gray-100 rounded w-24" />
                                                </div>
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="h-3 bg-gray-100 rounded w-32" />
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="h-3 bg-gray-100 rounded w-28" />
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="h-3 bg-gray-100 rounded w-20" />
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="h-6 bg-gray-100 rounded w-20" />
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="h-3 bg-gray-100 rounded w-6" />
                                            </td>
                                        </tr>
                                    ))
                                ) : registrations.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="py-12 text-center text-gray-400 text-sm"
                                        >
                                            No registrations found for this event
                                        </td>
                                    </tr>
                                ) : (
                                    registrations.map((reg: AdminRegistration, i: number) => {
                                        const initials = getInitials(reg.user_name);
                                        const bgCls = INITIALS_BG[i % INITIALS_BG.length];
                                        const statusStyle =
                                            STATUS_STYLE[reg.status] ?? "bg-gray-100 text-gray-600";
                                        const statusLabel =
                                            reg.status.charAt(0) + reg.status.slice(1).toLowerCase();

                                        return (
                                            <tr
                                                key={reg.id}
                                                className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                                            >
                                                {/* Student name */}
                                                <td className="py-4 px-4">
                                                    <div className="flex items-center gap-3">
                                                        <div
                                                            className={`h-9 w-9 rounded-full ${bgCls} flex items-center justify-center text-xs font-bold shrink-0`}
                                                        >
                                                            {initials}
                                                        </div>
                                                        <span className="font-semibold text-gray-900">
                                                            {reg.user_name}
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* Email */}
                                                <td className="py-4 px-4 text-gray-500">
                                                    {reg.user_email}
                                                </td>

                                                {/* Event title */}
                                                <td className="py-4 px-4 text-gray-700 font-medium">
                                                    {reg.event_title}
                                                </td>

                                                {/* Date */}
                                                <td className="py-4 px-4 text-gray-500">
                                                    {formatDate(reg.registration_date)}
                                                </td>

                                                {/* Status badge */}
                                                <td className="py-4 px-4">
                                                    <span
                                                        className={cn(
                                                            "text-xs font-semibold px-3 py-1.5 rounded-full",
                                                            statusStyle
                                                        )}
                                                    >
                                                        {statusLabel}
                                                    </span>
                                                </td>

                                                {/* Actions — Eye opens the detail panel */}
                                                <td className="py-4 px-4">
                                                    <button
                                                        onClick={() => setSelected(reg)}
                                                        className="text-gray-400 hover:text-[#1a2744] transition-colors"
                                                        title="View registration details"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>

                        {/* ── Pagination ────────────────────────────────────────── */}
                        {totalPages > 1 && (
                            <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
                                <button
                                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40"
                                >
                                    <ChevronLeft className="h-4 w-4" /> Previous
                                </button>

                                <div className="flex items-center gap-1">
                                    {pageWindow.map((p, idx) => {
                                        const prev = pageWindow[idx - 1];
                                        const showEllipsis = prev !== undefined && p - prev > 1;
                                        return (
                                            <span key={p} className="flex items-center gap-1">
                                                {showEllipsis && (
                                                    <span className="px-1 text-gray-400 text-sm">…</span>
                                                )}
                                                <button
                                                    onClick={() => setCurrentPage(p)}
                                                    className={cn(
                                                        "h-8 w-8 rounded text-sm font-medium",
                                                        currentPage === p
                                                            ? "bg-[#1a2744] text-white"
                                                            : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                                                    )}
                                                >
                                                    {p}
                                                </button>
                                            </span>
                                        );
                                    })}
                                </div>

                                <button
                                    onClick={() =>
                                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                                    }
                                    disabled={currentPage >= totalPages}
                                    className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40"
                                >
                                    Next <ChevronRight className="h-4 w-4" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}