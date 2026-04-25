"use client";
// Placement: src/app/admin/users/[id]/edit/page.tsx
//
// Edit user: full_name, role, is_active.
// Breadcrumb: Admin > Users > {Full Name} > Edit
// Endpoint: PUT /api/admin/users/{user_id}

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ChevronRight, ArrowLeft, Save, UserCheck, UserX } from "lucide-react";
import { getUserById, updateUser, changeUserRole, approveUser, rejectUser } from "@/services/userService";
import { getInitials, cn, extractErrorMessage } from "@/utils/helpers";
import type { User } from "@/types";
import toast from "react-hot-toast";

const schema = z.object({
    full_name: z.string().min(2, "Full name must be at least 2 characters"),
    role: z.enum(["ADMIN", "STUDENT"]),
    is_active: z.boolean(),
});

type EditForm = z.infer<typeof schema>;

const AVATAR_COLOURS = [
    "bg-blue-100 text-blue-700",
    "bg-purple-100 text-purple-700",
    "bg-orange-100 text-orange-700",
    "bg-teal-100 text-teal-700",
];

export default function EditUserPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();

    const [user, setUser] = useState<User | null>(null);
    const [loadingUser, setLoadingUser] = useState(true);

    const {
        register,
        handleSubmit,
        reset,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<EditForm>({ resolver: zodResolver(schema) });

    // Pre-fill form when user loads
    useEffect(() => {
        if (!id) return;
        setLoadingUser(true);
        getUserById(id)
            .then((u) => {
                setUser(u);
                reset({
                    full_name: u.full_name,
                    role: u.role,
                    is_active: u.is_active,
                });
            })
            .catch(() => toast.error("Failed to load user"))
            .finally(() => setLoadingUser(false));
    }, [id, reset]);

    const watchedRole = watch("role");

    const onSubmit = async (data: EditForm) => {
        if (!user) return;
        try {
            // Update core fields via PUT
            await updateUser(id, {
                full_name: data.full_name,
                is_active: data.is_active,
            });

            // Role change has its own dedicated endpoint
            if (data.role !== user.role) {
                await changeUserRole(id, { role: data.role });
            }

            toast.success("User updated successfully");
            router.push(`/admin/users/${id}`);
        } catch (err) {
            toast.error(extractErrorMessage(err));
        }
    };

    const handleApprove = async () => {
        try {
            const res = await approveUser(id);
            setUser((u) => u ? { ...u, is_approved: true, is_rejected: false } : u);
            toast.success(res.message ?? "User approved");
        } catch (err) {
            toast.error(extractErrorMessage(err));
        }
    };

    const handleReject = async () => {
        try {
            const res = await rejectUser(id, { reason: "OTHER" });
            setUser((u) => u ? { ...u, is_rejected: true, is_approved: false } : u);
            toast.success(res.message ?? "User rejected");
        } catch (err) {
            toast.error(extractErrorMessage(err));
        }
    };

    const inputCls =
        "w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a2744]/20 focus:border-[#1a2744]";

    if (loadingUser) {
        return (
            <div className="flex-1 bg-gray-50 min-h-screen p-6">
                <div className="max-w-2xl mx-auto space-y-4 animate-pulse">
                    <div className="h-4 bg-gray-100 rounded w-56" />
                    <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
                        {[...Array(4)].map((_, i) => (
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
                    <h1 className="font-semibold text-gray-900">Edit User</h1>
                </div>
                <div className="h-8 w-8 rounded-full bg-orange-400 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">A</span>
                </div>
            </header>

            <div className="p-6 max-w-2xl mx-auto">
                {/* Breadcrumb */}
                <div className="flex items-center gap-1 text-sm text-gray-400 mb-4">
                    <Link href="/admin" className="hover:text-gray-600">Admin</Link>
                    <ChevronRight className="h-3.5 w-3.5" />
                    <Link href="/admin/users" className="hover:text-gray-600">Users</Link>
                    <ChevronRight className="h-3.5 w-3.5" />
                    <Link href={`/admin/users/${user.id}`} className="hover:text-gray-600 truncate max-w-[140px]">
                        {user.full_name}
                    </Link>
                    <ChevronRight className="h-3.5 w-3.5" />
                    <span className="text-gray-700">Edit</span>
                </div>

                {/* User identity header */}
                <div className="flex items-center gap-4 mb-6">
                    {user.profile_image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={user.profile_image} alt={user.full_name}
                            className="h-14 w-14 rounded-full object-cover shrink-0" />
                    ) : (
                        <div className={`h-14 w-14 rounded-full ${avatarCls} flex items-center justify-center text-base font-bold shrink-0`}>
                            {getInitials(user.full_name)}
                        </div>
                    )}
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">{user.full_name}</h2>
                        <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
                    {/* ── Basic details ────────────────────────────────────────── */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <h3 className="font-bold text-gray-900 mb-5">Basic Information</h3>

                        <div className="space-y-4">
                            {/* Full name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Full Name
                                </label>
                                <input {...register("full_name")} className={inputCls} />
                                {errors.full_name && (
                                    <p className="text-xs text-red-500 mt-1">{errors.full_name.message}</p>
                                )}
                            </div>

                            {/* Email — read-only, shown for reference */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Email <span className="text-gray-400 font-normal">(read-only)</span>
                                </label>
                                <input
                                    value={user.email}
                                    readOnly
                                    className={inputCls + " bg-gray-50 cursor-not-allowed text-gray-400"}
                                />
                            </div>

                            {/* Role */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Role
                                </label>
                                <div className="relative">
                                    <select {...register("role")} className={inputCls + " appearance-none"}>
                                        <option value="STUDENT">Student</option>
                                        <option value="ADMIN">Administrator</option>
                                    </select>
                                    <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 rotate-90 pointer-events-none" />
                                </div>
                                {watchedRole !== user.role && (
                                    <p className="text-xs text-orange-500 mt-1">
                                        Role will be changed via the change-role endpoint on save.
                                    </p>
                                )}
                            </div>

                            {/* Active toggle */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Account Status
                                </label>
                                <div className="relative">
                                    <select
                                        {...register("is_active", { setValueAs: (v) => v === "true" })}
                                        className={inputCls + " appearance-none"}
                                    >
                                        <option value="true">Active</option>
                                        <option value="false">Suspended</option>
                                    </select>
                                    <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 rotate-90 pointer-events-none" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── Approval actions ─────────────────────────────────────── */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <h3 className="font-bold text-gray-900 mb-2">Approval Status</h3>
                        <p className="text-sm text-gray-500 mb-4">
                            Current:{" "}
                            <span className={cn("font-semibold",
                                user.is_rejected ? "text-red-600" : user.is_approved ? "text-green-700" : "text-yellow-600")}>
                                {user.is_rejected ? "Rejected" : user.is_approved ? "Approved" : "Pending"}
                            </span>
                        </p>
                        <div className="flex gap-3">
                            {!user.is_approved && !user.is_rejected && (
                                <button type="button" onClick={handleApprove}
                                    className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm font-semibold hover:bg-green-100 transition-colors">
                                    <UserCheck className="h-4 w-4" /> Approve
                                </button>
                            )}
                            {!user.is_rejected && (
                                <button type="button" onClick={handleReject}
                                    className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm font-semibold hover:bg-red-100 transition-colors">
                                    <UserX className="h-4 w-4" /> Reject
                                </button>
                            )}
                            {user.is_rejected && (
                                <button type="button" onClick={handleApprove}
                                    className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm font-semibold hover:bg-green-100 transition-colors">
                                    <UserCheck className="h-4 w-4" /> Re-approve
                                </button>
                            )}
                        </div>
                    </div>

                    {/* ── Form actions ─────────────────────────────────────────── */}
                    <div className="flex items-center justify-between">
                        <Link href={`/admin/users/${user.id}`}
                            className="px-5 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                            Cancel
                        </Link>
                        <button type="submit" disabled={isSubmitting}
                            className="flex items-center gap-2 px-6 py-2.5 bg-[#1a2744] text-white text-sm font-semibold rounded-lg hover:bg-[#0f1a35] disabled:opacity-60 transition-colors">
                            <Save className="h-4 w-4" />
                            {isSubmitting ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}