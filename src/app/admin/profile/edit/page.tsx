"use client";
// Placement: src/app/admin/profile/edit/page.tsx
//
// Edit profile page.
// Breadcrumb: Admin > Profile > Edit
// Endpoints:
//   GET  /profile        — pre-fill form
//   PUT  /profile/update — submit changes (multipart/form-data for image)

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ChevronRight, ArrowLeft, Camera, Save, Upload } from "lucide-react";
import { useProfile, useUpdateProfile } from "@/hooks/useProfile";
import { getInitials, cn } from "@/utils/helpers";

// ── Form schema ───────────────────────────────────────────────────────────────
const schema = z.object({
    full_name: z.string().min(2, "Full name must be at least 2 characters"),
});

type EditForm = z.infer<typeof schema>;

const inputCls =
    "w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a2744]/20 focus:border-[#1a2744]";

export default function EditProfilePage() {
    const router = useRouter();
    const { profile, loading } = useProfile();
    const { update, updating } = useUpdateProfile();

    // Avatar preview state
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const fileRef = useRef<HTMLInputElement>(null);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isDirty },
    } = useForm<EditForm>({ resolver: zodResolver(schema) });

    // Pre-fill form once profile loads
    useEffect(() => {
        if (profile) {
            reset({ full_name: profile.full_name });
            if (profile.profile_image) setAvatarPreview(profile.profile_image);
        }
    }, [profile, reset]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setAvatarFile(file);
        setAvatarPreview(URL.createObjectURL(file));
    };

    const onSubmit = async (data: EditForm) => {
        const payload: { full_name: string; profile_image?: File } = {
            full_name: data.full_name,
        };
        if (avatarFile) payload.profile_image = avatarFile;

        const updated = await update(payload);
        if (updated) router.push("/admin/profile");
    };

    // ── Loading skeleton ──────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="flex-1 bg-gray-50 min-h-screen p-6">
                <div className="max-w-xl mx-auto animate-pulse space-y-4">
                    <div className="h-4 bg-gray-100 rounded w-48" />
                    <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
                        <div className="h-20 w-20 bg-gray-100 rounded-xl" />
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="h-12 bg-gray-100 rounded-lg" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    const displaySrc = avatarPreview ?? profile?.profile_image ?? null;

    return (
        <div className="flex-1 bg-gray-50 min-h-screen">
            {/* ── Top bar ─────────────────────────────────────────────────────── */}
            <header className="bg-white border-b border-gray-200 px-6 h-14 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.back()}
                        className="h-8 w-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
                        aria-label="Go back"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </button>
                    <h1 className="font-semibold text-gray-900">Edit Profile</h1>
                </div>
                <div className="h-8 w-8 rounded-full bg-amber-400 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">
                        {getInitials(profile?.full_name ?? "A")}
                    </span>
                </div>
            </header>

            <div className="p-6 max-w-xl mx-auto">
                {/* Breadcrumb */}
                <div className="flex items-center gap-1 text-sm text-gray-400 mb-4">
                    <Link href="/admin" className="hover:text-gray-600">Admin</Link>
                    <ChevronRight className="h-3.5 w-3.5" />
                    <Link href="/admin/profile" className="hover:text-gray-600">Profile</Link>
                    <ChevronRight className="h-3.5 w-3.5" />
                    <span className="text-gray-700">Edit</span>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-1">Edit Profile</h2>
                <p className="text-gray-500 mb-6">Update your personal information and profile photo.</p>

                <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
                    {/* ── Avatar upload ─────────────────────────────────────────── */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <h3 className="font-bold text-gray-900 mb-4">Profile Photo</h3>

                        <div className="flex items-center gap-5">
                            {/* Avatar preview */}
                            <div className="relative shrink-0">
                                <div className="h-20 w-20 rounded-xl bg-gray-200 flex items-center justify-center text-xl font-bold text-gray-600 overflow-hidden border-2 border-gray-100">
                                    {displaySrc ? (
                                        <Image
                                            src={displaySrc}
                                            alt="Profile"
                                            width={80}
                                            height={80}
                                            className="object-cover w-full h-full"
                                        />
                                    ) : (
                                        getInitials(profile?.full_name ?? "A")
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => fileRef.current?.click()}
                                    className="absolute bottom-0 right-0 h-7 w-7 bg-[#1a2744] rounded-full flex items-center justify-center text-white hover:bg-[#0f1a35] transition-colors"
                                >
                                    <Camera className="h-3.5 w-3.5" />
                                </button>
                            </div>

                            {/* Upload trigger */}
                            <div>
                                <button
                                    type="button"
                                    onClick={() => fileRef.current?.click()}
                                    className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    <Upload className="h-4 w-4 text-gray-400" />
                                    {avatarFile ? "Change Photo" : "Upload Photo"}
                                </button>
                                {avatarFile && (
                                    <p className="text-xs text-gray-400 mt-1.5">{avatarFile.name}</p>
                                )}
                                <p className="text-xs text-gray-400 mt-1">PNG, JPG or JPEG. Max 5MB.</p>
                            </div>

                            <input
                                ref={fileRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleFileChange}
                            />
                        </div>
                    </div>

                    {/* ── Personal information ───────────────────────────────────── */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <h3 className="font-bold text-gray-900 mb-5">Personal Information</h3>

                        <div className="space-y-4">
                            {/* Full name — editable */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Full Name <span className="text-red-400">*</span>
                                </label>
                                <input
                                    {...register("full_name")}
                                    placeholder="Your full name"
                                    className={inputCls}
                                />
                                {errors.full_name && (
                                    <p className="text-xs text-red-500 mt-1">
                                        {errors.full_name.message}
                                    </p>
                                )}
                            </div>

                            {/* Email — read-only (backend doesn't support email change here) */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Email Address{" "}
                                    <span className="text-gray-400 font-normal">(read-only)</span>
                                </label>
                                <input
                                    value={profile?.email ?? ""}
                                    readOnly
                                    className={cn(inputCls, "bg-gray-50 cursor-not-allowed text-gray-400")}
                                />
                            </div>

                            {/* Role — read-only */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Role{" "}
                                    <span className="text-gray-400 font-normal">(read-only)</span>
                                </label>
                                <input
                                    value={profile?.role === "ADMIN" ? "Administrator" : "Student"}
                                    readOnly
                                    className={cn(inputCls, "bg-gray-50 cursor-not-allowed text-gray-400")}
                                />
                            </div>
                        </div>
                    </div>

                    {/* ── Actions ───────────────────────────────────────────────── */}
                    <div className="flex items-center justify-between">
                        <Link
                            href="/admin/profile"
                            className="px-5 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={updating || (!isDirty && !avatarFile)}
                            className="flex items-center gap-2 px-6 py-2.5 bg-[#1a2744] text-white text-sm font-semibold rounded-lg hover:bg-[#0f1a35] disabled:opacity-60 transition-colors"
                        >
                            <Save className="h-4 w-4" />
                            {updating ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}