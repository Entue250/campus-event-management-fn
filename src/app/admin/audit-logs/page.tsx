"use client";
// Placement: src/app/admin/audit-logs/page.tsx
//
// Real data from GET /admin/audit-logs
// Pagination via useAuditLogs hook

import {
    FileText,
    RefreshCw,
    ChevronLeft,
    ChevronRight,
    Shield,
} from "lucide-react";
import { useAuditLogs } from "@/hooks/useAuditLogsAndSettings";
import { formatDate, cn } from "@/utils/helpers";
import type { AuditLog, AuditAction } from "@/types";

// ── Action badge colours ──────────────────────────────────────────────────────
const ACTION_STYLE: Record<AuditAction, string> = {
    CREATE: "bg-green-100  text-green-700",
    UPDATE: "bg-blue-100   text-blue-700",
    DELETE: "bg-red-100    text-red-600",
    APPROVE: "bg-teal-100   text-teal-700",
    REJECT: "bg-red-100    text-red-700",
    LOGIN: "bg-gray-100   text-gray-600",
    LOGOUT: "bg-gray-100   text-gray-500",
    BROADCAST: "bg-purple-100 text-purple-700",
    SETTINGS: "bg-orange-100 text-orange-600",
    TOGGLE: "bg-yellow-100 text-yellow-700",
    ROLE_CHANGE: "bg-indigo-100 text-indigo-700",
};

function actionBadge(action: AuditAction): string {
    return ACTION_STYLE[action] ?? "bg-gray-100 text-gray-600";
}

export default function AuditLogsPage() {
    const { logs, total, totalPages, currentPage, loading, error, setPage, refetch } =
        useAuditLogs();

    // ── Page window ───────────────────────────────────────────────────────────
    const pageWindow = Array.from(
        new Set(
            [1, currentPage - 1, currentPage, currentPage + 1, totalPages].filter(
                (p) => p >= 1 && p <= totalPages
            )
        )
    ).sort((a, b) => a - b);

    return (
        <div className="flex-1 bg-gray-50 min-h-screen">
            {/* ── Top bar ─────────────────────────────────────────────────────── */}
            <header className="bg-white border-b border-gray-200 px-6 h-14 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Shield className="h-4 w-4" />
                    Audit Logs
                </div>
                <button
                    onClick={refetch}
                    disabled={loading}
                    className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors"
                >
                    <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
                    Refresh
                </button>
            </header>

            <div className="p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-1">Audit Logs</h1>
                <p className="text-gray-500 mb-6">
                    Track every administrative action performed in the system.
                </p>

                {/* ── Stats ─────────────────────────────────────────────────────── */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                    {[
                        { label: "Total Entries", value: total, cls: "text-gray-900" },
                        { label: "Current Page", value: currentPage, cls: "text-[#1a2744]" },
                        { label: "Total Pages", value: totalPages, cls: "text-gray-600" },
                    ].map(({ label, value, cls }) => (
                        <div key={label} className="bg-white rounded-xl border border-gray-200 p-5">
                            <p className="text-sm text-gray-500">{label}</p>
                            <p className={cn("text-2xl font-bold mt-0.5", cls)}>
                                {loading ? (
                                    <span className="inline-block h-7 w-10 bg-gray-100 rounded animate-pulse" />
                                ) : (
                                    value.toLocaleString()
                                )}
                            </p>
                        </div>
                    ))}
                </div>

                {/* ── Table ─────────────────────────────────────────────────────── */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                        <div>
                            <h2 className="font-bold text-gray-900">Activity Log</h2>
                            <p className="text-sm text-gray-500 mt-0.5">
                                Complete audit trail of admin actions.
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-gray-400" />
                            <p className="text-sm text-gray-400">
                                {total.toLocaleString()} entries
                            </p>
                        </div>
                    </div>

                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-100">
                                {["ADMIN", "ACTION", "RESOURCE", "DESCRIPTION", "IP ADDRESS", "TIMESTAMP"].map((h) => (
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
                                [...Array(8)].map((_, i) => (
                                    <tr key={i} className="border-b border-gray-50 animate-pulse">
                                        <td className="py-3 px-4"><div className="h-3 bg-gray-100 rounded w-28" /></td>
                                        <td className="py-3 px-4"><div className="h-6 bg-gray-100 rounded w-16" /></td>
                                        <td className="py-3 px-4"><div className="h-3 bg-gray-100 rounded w-16" /></td>
                                        <td className="py-3 px-4"><div className="h-3 bg-gray-100 rounded w-48" /></td>
                                        <td className="py-3 px-4"><div className="h-3 bg-gray-100 rounded w-20" /></td>
                                        <td className="py-3 px-4"><div className="h-3 bg-gray-100 rounded w-24" /></td>
                                    </tr>
                                ))
                            ) : error ? (
                                <tr>
                                    <td colSpan={6} className="py-12 text-center text-gray-400 text-sm">
                                        Failed to load audit logs.{" "}
                                        <button onClick={refetch} className="text-[#1a2744] hover:underline">
                                            Retry
                                        </button>
                                    </td>
                                </tr>
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-12 text-center text-gray-400 text-sm">
                                        No audit logs found
                                    </td>
                                </tr>
                            ) : (
                                logs.map((log: AuditLog) => {
                                    // admin field is a string name in the API response
                                    const adminName =
                                        typeof log.admin === "object" && log.admin !== null
                                            ? log.admin.full_name
                                            : (log.admin as unknown as string) ?? "—";

                                    return (
                                        <tr
                                            key={log.id}
                                            className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                                        >
                                            <td className="py-3 px-4">
                                                <p className="font-semibold text-gray-900 text-xs">{adminName}</p>
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className={cn("text-[10px] font-bold uppercase px-2 py-1 rounded-full", actionBadge(log.action))}>
                                                    {log.action.replace(/_/g, " ")}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-gray-500 text-xs">{log.resource_type}</td>
                                            <td className="py-3 px-4 text-gray-600 text-xs max-w-xs">
                                                <p className="line-clamp-2">{log.description}</p>
                                            </td>
                                            <td className="py-3 px-4 text-gray-400 text-xs font-mono">
                                                {log.ip_address ?? "—"}
                                            </td>
                                            <td className="py-3 px-4 text-gray-400 text-xs whitespace-nowrap">
                                                {formatDate(log.created_at)}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>

                    {/* ── Pagination ────────────────────────────────────────────── */}
                    {totalPages > 1 && (
                        <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
                            <p className="text-sm text-gray-500">
                                Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
                            </p>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setPage(Math.max(1, currentPage - 1))}
                                    disabled={currentPage === 1}
                                    className="h-8 w-8 flex items-center justify-center rounded border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </button>
                                {pageWindow.map((p, idx) => {
                                    const prev = pageWindow[idx - 1];
                                    const showEllipsis = prev !== undefined && p - prev > 1;
                                    return (
                                        <span key={p} className="flex items-center gap-1">
                                            {showEllipsis && <span className="px-1 text-gray-400 text-sm">…</span>}
                                            <button
                                                onClick={() => setPage(p)}
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
                                <button
                                    onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
                                    disabled={currentPage >= totalPages}
                                    className="h-8 w-8 flex items-center justify-center rounded border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}