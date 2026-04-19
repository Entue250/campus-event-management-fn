"use client";
// Placement: src/app/admin/notifications/create/page.tsx
//
// Breadcrumb: Admin > Notifications > Send Notification
// Two modes:
//   "broadcast" → POST /admin/notifications/broadcast (quick, title+message only)
//   "targeted"  → POST /admin/notifications/create    (full payload)

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ChevronRight, ArrowLeft, Send, Megaphone } from "lucide-react";
import { broadcastNotification, createNotification } from "@/services/notificationService";
import { extractErrorMessage, cn } from "@/utils/helpers";
import toast from "react-hot-toast";
import type { NotificationType } from "@/types";

// ── Notification types from backend ──────────────────────────────────────────
const NOTIFICATION_TYPES: { value: NotificationType; label: string }[] = [
    { value: "BROADCAST", label: "Broadcast" },
    { value: "ANNOUNCEMENT", label: "Announcement" },
    { value: "REMINDER", label: "Event Reminder" },
    { value: "SYSTEM", label: "System Message" },
    { value: "REGISTRATION", label: "Event Registration" },
    { value: "CANCELLATION", label: "Event Cancellation" },
    { value: "EVENT_UPDATE", label: "Event Updated" },
    { value: "APPROVAL", label: "Account Approved" },
    { value: "REJECTION", label: "Account Rejected" },
];

const TARGET_OPTIONS = [
    { value: "all_users", label: "All Users", desc: "Send to all active users" },
    { value: "specific_user", label: "Specific User", desc: "Send to one user by ID" },
    { value: "event_registrants", label: "Event Registrants", desc: "Send to registrants of an event" },
] as const;

type TargetType = (typeof TARGET_OPTIONS)[number]["value"];

// ── Zod schema ────────────────────────────────────────────────────────────────
const schema = z.object({
    title: z.string().min(2, "Title is required"),
    message: z.string().min(5, "Message is required"),
    target: z.enum(["all_users", "specific_user", "event_registrants"]),
    notification_type: z.string().min(1, "Please select a type"),
    user_id: z.string().optional(),
    event_id: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const inputCls =
    "w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a2744]/20 focus:border-[#1a2744]";

export default function CreateNotificationPage() {
    const router = useRouter();
    const [mode, setMode] = useState<"broadcast" | "targeted">("broadcast");

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            target: "all_users",
            notification_type: "BROADCAST",
        },
    });

    const target = watch("target") as TargetType;

    const onSubmit = async (data: FormData) => {
        try {
            if (mode === "broadcast") {
                await broadcastNotification({ title: data.title, message: data.message });
            } else {
                await createNotification({
                    title: data.title,
                    message: data.message,
                    target: data.target as "specific_user" | "all_users" | "event_registrants",
                    notification_type: data.notification_type as NotificationType,
                    user_id: data.user_id || undefined,
                    event_id: data.event_id || undefined,
                });
            }
            toast.success("Notification sent!");
            router.push("/admin/notifications");
        } catch (err) {
            toast.error(extractErrorMessage(err));
        }
    };

    return (
        <div className="flex-1 bg-gray-50 min-h-screen">
            {/* ── Top bar ─────────────────────────────────────────────────────── */}
            <header className="bg-white border-b border-gray-200 px-6 h-14 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.back()}
                        className="h-8 w-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </button>
                    <h1 className="font-semibold text-gray-900">Send Notification</h1>
                </div>
                <div className="h-8 w-8 rounded-full bg-amber-400 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">A</span>
                </div>
            </header>

            <div className="p-6 max-w-2xl mx-auto">
                {/* Breadcrumb */}
                <div className="flex items-center gap-1 text-sm text-gray-400 mb-4">
                    <Link href="/admin" className="hover:text-gray-600">Admin</Link>
                    <ChevronRight className="h-3.5 w-3.5" />
                    <Link href="/admin/notifications" className="hover:text-gray-600">Notifications</Link>
                    <ChevronRight className="h-3.5 w-3.5" />
                    <span className="text-gray-700">Send Notification</span>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-1">Send Notification</h2>
                <p className="text-gray-500 mb-6">
                    Broadcast a message to all users or target specific recipients.
                </p>

                {/* ── Mode selector ─────────────────────────────────────────────── */}
                <div className="grid grid-cols-2 gap-3 mb-5">
                    {[
                        { key: "broadcast", icon: Megaphone, label: "Quick Broadcast", desc: "Send to all active users instantly" },
                        { key: "targeted", icon: Send, label: "Targeted", desc: "Choose recipients and type" },
                    ].map(({ key, icon: Icon, label, desc }) => (
                        <button
                            key={key}
                            type="button"
                            onClick={() => setMode(key as "broadcast" | "targeted")}
                            className={cn(
                                "flex items-start gap-3 p-4 rounded-xl border-2 transition-colors text-left",
                                mode === key
                                    ? "border-[#1a2744] bg-[#1a2744]/5"
                                    : "border-gray-200 bg-white hover:border-gray-300"
                            )}
                        >
                            <div className={cn(
                                "h-9 w-9 rounded-lg flex items-center justify-center shrink-0",
                                mode === key ? "bg-[#1a2744] text-white" : "bg-gray-100 text-gray-500"
                            )}>
                                <Icon className="h-4.5 w-4.5" style={{ height: 18, width: 18 }} />
                            </div>
                            <div>
                                <p className="font-semibold text-gray-900 text-sm">{label}</p>
                                <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                            </div>
                        </button>
                    ))}
                </div>

                <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
                    {/* ── Basic content ─────────────────────────────────────────── */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <h3 className="font-bold text-gray-900 mb-5">Notification Content</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Title <span className="text-red-400">*</span>
                                </label>
                                <input {...register("title")} placeholder="e.g. System Maintenance Notice" className={inputCls} />
                                {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Message <span className="text-red-400">*</span>
                                </label>
                                <textarea
                                    {...register("message")}
                                    rows={4}
                                    placeholder="Write your notification message here..."
                                    className={inputCls + " resize-none"}
                                />
                                {errors.message && <p className="text-xs text-red-500 mt-1">{errors.message.message}</p>}
                            </div>
                        </div>
                    </div>

                    {/* ── Targeted options ─────────────────────────────────────── */}
                    {mode === "targeted" && (
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <h3 className="font-bold text-gray-900 mb-5">Targeting &amp; Type</h3>
                            <div className="space-y-4">
                                {/* Target */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        Send To <span className="text-red-400">*</span>
                                    </label>
                                    <div className="relative">
                                        <select {...register("target")} className={inputCls + " appearance-none"}>
                                            {TARGET_OPTIONS.map((o) => (
                                                <option key={o.value} value={o.value}>{o.label} — {o.desc}</option>
                                            ))}
                                        </select>
                                        <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 rotate-90 pointer-events-none" />
                                    </div>
                                </div>

                                {/* User ID (conditional) */}
                                {target === "specific_user" && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                            User ID <span className="text-red-400">*</span>
                                        </label>
                                        <input {...register("user_id")} placeholder="UUID of the target user" className={inputCls} />
                                    </div>
                                )}

                                {/* Event ID (conditional) */}
                                {target === "event_registrants" && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                            Event ID <span className="text-red-400">*</span>
                                        </label>
                                        <input {...register("event_id")} placeholder="UUID of the target event" className={inputCls} />
                                    </div>
                                )}

                                {/* Notification type */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        Notification Type <span className="text-red-400">*</span>
                                    </label>
                                    <div className="relative">
                                        <select {...register("notification_type")} className={inputCls + " appearance-none"}>
                                            {NOTIFICATION_TYPES.map((t) => (
                                                <option key={t.value} value={t.value}>{t.label}</option>
                                            ))}
                                        </select>
                                        <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 rotate-90 pointer-events-none" />
                                    </div>
                                    {errors.notification_type && (
                                        <p className="text-xs text-red-500 mt-1">{errors.notification_type.message}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── Actions ──────────────────────────────────────────────── */}
                    <div className="flex items-center justify-between">
                        <Link
                            href="/admin/notifications"
                            className="px-5 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex items-center gap-2 px-6 py-2.5 bg-[#1a2744] text-white text-sm font-semibold rounded-lg hover:bg-[#0f1a35] disabled:opacity-60 transition-colors"
                        >
                            <Send className="h-4 w-4" />
                            {isSubmitting
                                ? "Sending..."
                                : mode === "broadcast"
                                    ? "Broadcast to All"
                                    : "Send Notification"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}