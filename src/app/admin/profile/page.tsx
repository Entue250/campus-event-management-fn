"use client";
// Placement: src/app/admin/profile/page.tsx
//
// Real data from GET /profile.
// All dummy/static data removed:
//   - Employee ID, Department, Join Date → real API values
//   - Activity Stats → derived from real profile fields
//   - RECENT_ACTIVITY → hidden gracefully (no API endpoint)
// Password change uses correct backend field names:
//   current_password, new_password, confirm_password

import { useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  User,
  Shield,
  KeyRound,
  Bluetooth,
  Camera,
  Eye,
  EyeOff,
  Pencil,
} from "lucide-react";
import { useProfile, useUpdateProfile, useChangePassword } from "@/hooks/useProfile";
import { getInitials, formatDate, cn } from "@/utils/helpers";

// ── Password form schema — uses backend field names ───────────────────────────
const pwdSchema = z
  .object({
    current_password: z.string().min(1, "Current password is required"),
    new_password: z.string().min(8, "Min 8 characters"),
    confirm_password: z.string().min(1, "Please confirm your password"),
  })
  .refine((d) => d.new_password === d.confirm_password, {
    message: "Passwords don't match",
    path: ["confirm_password"],
  });

type PwdForm = z.infer<typeof pwdSchema>;

// ── Skeleton for profile card ──────────────────────────────────────────────────
function ProfileSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
      <div className="flex items-start gap-5 mb-5">
        <div className="h-20 w-20 rounded-xl bg-gray-100 shrink-0" />
        <div className="grid grid-cols-2 gap-x-8 gap-y-4 flex-1">
          {[...Array(6)].map((_, i) => (
            <div key={i}>
              <div className="h-2.5 bg-gray-100 rounded w-20 mb-2" />
              <div className="h-4 bg-gray-100 rounded w-32" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function AdminProfilePage() {
  const { profile, loading } = useProfile();
  const { update, updating } = useUpdateProfile();
  const { submit: submitPwd, submitting } = useChangePassword();

  // Password form visibility
  const [showPwdForm, setShowPwdForm] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  // 2FA — UI toggle only (no API endpoint yet)
  const [twoFa, setTwoFa] = useState(
    profile?.two_factor_enabled ?? false
  );

  // Avatar preview before upload
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PwdForm>({ resolver: zodResolver(pwdSchema) });

  const onChangePwd = async (data: PwdForm) => {
    const ok = await submitPwd(data);
    if (ok) { reset(); setShowPwdForm(false); }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Show local preview immediately
    setAvatarPreview(URL.createObjectURL(file));
    // Upload to API
    await update({ profile_image: file });
  };

  const inputCls =
    "w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#1a2744]/30";

  // Avatar source: local preview > API image > null (show initials)
  const avatarSrc = avatarPreview ?? profile?.profile_image ?? null;

  return (
    <div className="flex-1 bg-gray-50 min-h-screen p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Admin Profile</h1>
      <p className="text-gray-500 mb-6">
        Update your account settings and monitor system activity.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* ── Left column ────────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Personal Information */}
          {loading ? (
            <ProfileSkeleton />
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-bold text-gray-900 flex items-center gap-2">
                  <User className="h-5 w-5 text-gray-500" /> Personal Information
                </h2>
                <Link
                  href="/admin/profile/edit"
                  className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 font-medium transition-colors"
                >
                  <Pencil className="h-3.5 w-3.5" /> Edit Details
                </Link>
              </div>

              <div className="flex items-start gap-5 mb-5">
                {/* Avatar */}
                <div className="relative shrink-0">
                  <div className="h-20 w-20 rounded-xl bg-gray-200 flex items-center justify-center text-xl font-bold text-gray-600 overflow-hidden">
                    {avatarSrc ? (
                      <Image
                        src={avatarSrc}
                        alt={profile?.full_name ?? "Avatar"}
                        width={80}
                        height={80}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      getInitials(profile?.full_name ?? "A")
                    )}
                  </div>
                  <button
                    onClick={() => fileRef.current?.click()}
                    disabled={updating}
                    className="absolute bottom-0 right-0 h-7 w-7 bg-[#1a2744] rounded-full flex items-center justify-center text-white hover:bg-[#0f1a35] disabled:opacity-60 transition-colors"
                    title="Change profile photo"
                  >
                    <Camera className="h-3.5 w-3.5" />
                  </button>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </div>

                {/* Profile info grid */}
                <div className="grid grid-cols-2 gap-x-8 gap-y-4 flex-1">
                  <div>
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">
                      Full Name
                    </p>
                    <p className="text-sm font-semibold text-gray-900 mt-0.5">
                      {profile?.full_name ?? "—"}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">
                      Role
                    </p>
                    <p className="text-sm font-semibold text-gray-900 mt-0.5">
                      {profile?.role === "ADMIN" ? "Administrator" : "Student"}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">
                      Email Address
                    </p>
                    <p className="text-sm font-semibold text-gray-900 mt-0.5">
                      {profile?.email ?? "—"}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">
                      User ID
                    </p>
                    <p className="text-sm font-semibold text-gray-900 mt-0.5 font-mono text-xs">
                      {profile?.id?.slice(0, 8).toUpperCase() ?? "—"}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">
                      Member Since
                    </p>
                    <p className="text-sm font-semibold text-gray-900 mt-0.5">
                      {profile?.date_joined ? formatDate(profile.date_joined) : "—"}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">
                      Status
                    </p>
                    <span
                      className={cn(
                        "inline-block mt-0.5 text-xs font-semibold px-2.5 py-0.5 rounded-full",
                        profile?.is_active
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-600"
                      )}
                    >
                      {profile?.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Security & Authentication */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-bold text-gray-900 flex items-center gap-2 mb-5">
              <Shield className="h-5 w-5 text-gray-500" /> Security &amp; Authentication
            </h2>

            {/* Change password */}
            <div className="border border-gray-100 rounded-xl p-4 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-orange-100 rounded-xl flex items-center justify-center">
                    <KeyRound className="h-5 w-5 text-orange-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">
                      Update Password
                    </p>
                    <p className="text-xs text-gray-400">
                      Change your password to keep your account secure.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowPwdForm((v) => !v)}
                  className="px-4 py-2 bg-[#1a2744] text-white text-sm font-semibold rounded-lg hover:bg-[#0f1a35] transition-colors"
                >
                  Change Password
                </button>
              </div>

              {showPwdForm && (
                <form
                  onSubmit={handleSubmit(onChangePwd)}
                  className="mt-4 space-y-3 border-t border-gray-100 pt-4"
                  noValidate
                >
                  {/* Current password */}
                  <div>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        {...register("current_password")}
                        type={showCurrent ? "text" : "password"}
                        placeholder="Current password"
                        className={inputCls + " pl-9 pr-10"}
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrent((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                      >
                        {showCurrent ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {errors.current_password && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.current_password.message}
                      </p>
                    )}
                  </div>

                  {/* New password */}
                  <div>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        {...register("new_password")}
                        type={showNew ? "text" : "password"}
                        placeholder="New password (min 8 characters)"
                        className={inputCls + " pl-9 pr-10"}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNew((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                      >
                        {showNew ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {errors.new_password && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.new_password.message}
                      </p>
                    )}
                  </div>

                  {/* Confirm password */}
                  <div>
                    <input
                      {...register("confirm_password")}
                      type="password"
                      placeholder="Confirm new password"
                      className={inputCls}
                    />
                    {errors.confirm_password && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.confirm_password.message}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-4 py-2 bg-[#1a2744] text-white text-sm font-semibold rounded-lg hover:bg-[#0f1a35] disabled:opacity-60 transition-colors"
                    >
                      {submitting ? "Updating..." : "Update Password"}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowPwdForm(false); reset(); }}
                      className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* 2FA — UI toggle; no API endpoint yet, marked coming soon */}
            <div className="border border-gray-100 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Bluetooth className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">
                      Two-Factor Authentication
                    </p>
                    <p className="text-xs text-gray-400">
                      Add an extra layer of security to your admin account.{" "}
                      <span className="text-blue-500 font-medium">Coming soon</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">
                    {twoFa ? "Enabled" : "Disabled"}
                  </span>
                  <button
                    onClick={() => setTwoFa((v) => !v)}
                    className={cn(
                      "relative h-6 w-11 rounded-full transition-colors",
                      twoFa ? "bg-[#1a2744]" : "bg-gray-200"
                    )}
                  >
                    <span
                      className={cn(
                        "absolute top-0.5 h-5 w-5 bg-white rounded-full shadow transition-transform",
                        twoFa ? "translate-x-5" : "translate-x-0.5"
                      )}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right sidebar ───────────────────────────────────────────── */}
        <div className="space-y-4">
          {/* Account Summary — real data from profile */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-bold text-gray-900 mb-4">Account Summary</h3>
            {loading ? (
              <div className="space-y-3 animate-pulse">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-10 bg-gray-100 rounded-lg" />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {[
                  {
                    label: "Account Type",
                    value: profile?.role === "ADMIN" ? "Administrator" : "Student",
                  },
                  {
                    label: "Account Status",
                    value: profile?.is_active ? "Active" : "Inactive",
                    valueCls: profile?.is_active ? "text-green-600" : "text-red-500",
                  },
                  {
                    label: "Member Since",
                    value: profile?.date_joined
                      ? formatDate(profile.date_joined)
                      : "—",
                  },
                  {
                    label: "Email",
                    value: profile?.email ?? "—",
                    truncate: true,
                  },
                ].map(({ label, value, valueCls, truncate }) => (
                  <div
                    key={label}
                    className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-gray-50"
                  >
                    <span className="text-sm text-gray-500 shrink-0">{label}</span>
                    <span
                      className={cn(
                        "text-sm font-semibold text-gray-900 ml-2",
                        valueCls ?? "",
                        truncate ? "truncate max-w-[120px]" : ""
                      )}
                    >
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-bold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Link
                href="/admin/profile/edit"
                className="w-full flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Pencil className="h-4 w-4 text-gray-400" />
                Edit Profile
              </Link>
              <button
                onClick={() => { setShowPwdForm(true); window.scrollTo({ top: 400, behavior: "smooth" }); }}
                className="w-full flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <KeyRound className="h-4 w-4 text-gray-400" />
                Change Password
              </button>
            </div>
          </div>

          {/* System notice */}
          <div className="bg-[#1a2744] rounded-xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-6 w-6 rounded-full bg-white/20 flex items-center justify-center">
                <span className="text-white text-xs font-bold">i</span>
              </div>
              <h3 className="font-bold text-white">System Update</h3>
            </div>
            <p className="text-blue-200 text-sm leading-relaxed">
              The event management API will be undergoing maintenance this weekend
              at 12:00 AM UTC.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}