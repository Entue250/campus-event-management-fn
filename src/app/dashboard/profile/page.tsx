// "use client";
// import { useEffect, useState } from "react";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { z } from "zod";
// import { Camera, User, Shield, KeyRound, Eye, EyeOff } from "lucide-react";
// import { getProfile, updateProfile, changePassword } from "@/services/userService";
// import { useAuthStore } from "@/context/authStore";
// import { getInitials, extractErrorMessage } from "@/utils/helpers";
// import type { User as UserType } from "@/types";
// import toast from "react-hot-toast";

// const profileSchema = z.object({ full_name: z.string().min(2) });
// type ProfileForm = z.infer<typeof profileSchema>;

// const pwdSchema = z.object({
//   old_password: z.string().min(1),
//   new_password: z.string().min(8, "Min 8 characters"),
//   confirm_new_password: z.string(),
// }).refine(d => d.new_password === d.confirm_new_password, { message: "Passwords don't match", path: ["confirm_new_password"] });
// type PwdForm = z.infer<typeof pwdSchema>;

// export default function ProfilePage() {
//   const { user: storeUser, setUser } = useAuthStore();
//   const [profile, setProfile] = useState<UserType | null>(null);
//   const [showOld, setShowOld] = useState(false);
//   const [showNew, setShowNew] = useState(false);

//   const { register: regProfile, handleSubmit: hsProfile, formState: { errors: pErr, isSubmitting: pSub }, reset: resetProfile } =
//     useForm<ProfileForm>({ resolver: zodResolver(profileSchema) });

//   const { register: regPwd, handleSubmit: hsPwd, formState: { errors: wErr, isSubmitting: wSub }, reset: resetPwd } =
//     useForm<PwdForm>({ resolver: zodResolver(pwdSchema) });

//   useEffect(() => {
//     getProfile().then(p => { setProfile(p); resetProfile({ full_name: p.full_name }); }).catch(() => {});
//   }, [resetProfile]);

//   const onSaveProfile = async (data: ProfileForm) => {
//     try {
//       const updated = await updateProfile(data);
//       setProfile(updated);
//       setUser(updated);
//       toast.success("Profile updated!");
//     } catch (err) { toast.error(extractErrorMessage(err)); }
//   };

//   const onChangePwd = async (data: PwdForm) => {
//     try {
//       await changePassword({ old_password: data.old_password, new_password: data.new_password, confirm_new_password: data.confirm_new_password });
//       toast.success("Password changed!");
//       resetPwd();
//     } catch (err) { toast.error(extractErrorMessage(err)); }
//   };

//   const u = profile ?? storeUser;

//   return (
//     <div className="flex-1 bg-gray-50 min-h-screen p-6">
//       <div className="max-w-2xl">
//         <h1 className="text-2xl font-bold text-gray-900 mb-1">Profile</h1>
//         <p className="text-gray-500 mb-6">Manage your account settings.</p>

//         {/* Profile card */}
//         <div className="bg-white rounded-xl border border-gray-200 p-6 mb-5">
//           <div className="flex items-start gap-5 mb-6">
//             <div className="relative">
//               <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-2xl font-bold">
//                 {getInitials(u?.full_name ?? "U")}
//               </div>
//               <button className="absolute bottom-0 right-0 h-7 w-7 bg-[#1a2744] rounded-full flex items-center justify-center text-white hover:bg-[#0f1a35]">
//                 <Camera className="h-3.5 w-3.5" />
//               </button>
//             </div>
//             <div>
//               <h2 className="text-lg font-bold text-gray-900">{u?.full_name}</h2>
//               <p className="text-sm text-gray-500">{u?.email}</p>
//               <span className="inline-block mt-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700">{u?.role}</span>
//             </div>
//           </div>

//           <form onSubmit={hsProfile(onSaveProfile)} className="space-y-4" noValidate>
//             <div className="flex items-center gap-2 mb-3">
//               <User className="h-5 w-5 text-gray-500" />
//               <h3 className="font-semibold text-gray-900">Personal Information</h3>
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
//               <input {...regProfile("full_name")} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#1a2744]/30" />
//               {pErr.full_name && <p className="text-xs text-red-500 mt-1">{pErr.full_name.message}</p>}
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
//               <input value={u?.email ?? ""} disabled className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500 cursor-not-allowed" />
//             </div>
//             <button type="submit" disabled={pSub}
//               className="px-5 py-2.5 bg-[#1a2744] text-white text-sm font-semibold rounded-lg hover:bg-[#0f1a35] disabled:opacity-60 transition-colors">
//               {pSub ? "Saving..." : "Save Changes"}
//             </button>
//           </form>
//         </div>

//         {/* Password card */}
//         <div className="bg-white rounded-xl border border-gray-200 p-6">
//           <div className="flex items-center gap-2 mb-5">
//             <Shield className="h-5 w-5 text-gray-500" />
//             <h3 className="font-semibold text-gray-900">Security & Authentication</h3>
//           </div>

//           <form onSubmit={hsPwd(onChangePwd)} className="space-y-4" noValidate>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
//               <div className="relative">
//                 <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
//                 <input {...regPwd("old_password")} type={showOld ? "text" : "password"}
//                   className="w-full pl-9 pr-10 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#1a2744]/30" />
//                 <button type="button" onClick={() => setShowOld(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
//                   {showOld ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
//                 </button>
//               </div>
//               {wErr.old_password && <p className="text-xs text-red-500 mt-1">{wErr.old_password.message}</p>}
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
//               <div className="relative">
//                 <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
//                 <input {...regPwd("new_password")} type={showNew ? "text" : "password"}
//                   className="w-full pl-9 pr-10 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#1a2744]/30" />
//                 <button type="button" onClick={() => setShowNew(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
//                   {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
//                 </button>
//               </div>
//               {wErr.new_password && <p className="text-xs text-red-500 mt-1">{wErr.new_password.message}</p>}
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
//               <input {...regPwd("confirm_new_password")} type="password"
//                 className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#1a2744]/30" />
//               {wErr.confirm_new_password && <p className="text-xs text-red-500 mt-1">{wErr.confirm_new_password.message}</p>}
//             </div>
//             <button type="submit" disabled={wSub}
//               className="px-5 py-2.5 bg-[#1a2744] text-white text-sm font-semibold rounded-lg hover:bg-[#0f1a35] disabled:opacity-60 transition-colors">
//               {wSub ? "Updating..." : "Change Password"}
//             </button>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";
// Placement: src/app/dashboard/profile/page.tsx
//
// APIs integrated:
//   GET  /profile          — load profile data
//   PUT  /profile/update   — save full_name + profile_image (multipart/form-data)
//   POST /auth/change-password — { current_password, new_password, confirm_password }
//
// Pattern mirrors the admin profile page (src/app/admin/profile/page.tsx).
// UI layout and Tailwind classes are UNCHANGED.

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Camera, User, Shield, KeyRound, Eye, EyeOff } from "lucide-react";
import { getProfile, updateProfile, changePassword } from "@/services/userService";
import { useAuthStore } from "@/context/authStore";
import { getInitials, extractErrorMessage, formatDate } from "@/utils/helpers";
import type { User as UserType } from "@/types";
import toast from "react-hot-toast";

// ── Profile form schema ───────────────────────────────────────────────────────
const profileSchema = z.object({
  full_name: z.string().min(2, "Full name must be at least 2 characters"),
});
type ProfileForm = z.infer<typeof profileSchema>;

// ── Password form schema ──────────────────────────────────────────────────────
// Field names match what userService.changePassword() expects as its payload.
// The service then maps them to the correct backend names:
//   old_password        → current_password
//   confirm_new_password → confirm_password
const pwdSchema = z
  .object({
    old_password: z.string().min(1, "Current password is required"),
    new_password: z.string().min(8, "Min 8 characters"),
    confirm_new_password: z.string().min(1, "Please confirm your password"),
  })
  .refine((d) => d.new_password === d.confirm_new_password, {
    message: "Passwords don't match",
    path: ["confirm_new_password"],
  });
type PwdForm = z.infer<typeof pwdSchema>;

// ── Loading skeleton ──────────────────────────────────────────────────────────
function ProfileSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 mb-5 animate-pulse">
      <div className="flex items-start gap-5 mb-6">
        <div className="h-20 w-20 rounded-full bg-gray-100 shrink-0" />
        <div className="space-y-2 flex-1">
          <div className="h-5 bg-gray-100 rounded w-40" />
          <div className="h-3 bg-gray-50 rounded w-56" />
          <div className="h-5 bg-gray-100 rounded w-16" />
        </div>
      </div>
      <div className="space-y-4">
        <div className="h-10 bg-gray-100 rounded-lg" />
        <div className="h-10 bg-gray-100 rounded-lg" />
        <div className="h-10 bg-gray-100 rounded w-28" />
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const { user: storeUser, setUser } = useAuthStore();

  const [profile, setProfile] = useState<UserType | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);

  // Avatar preview before upload
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // ── Profile form ──────────────────────────────────────────────────────────
  const {
    register: regProfile,
    handleSubmit: hsProfile,
    formState: { errors: pErr, isSubmitting: pSub },
    reset: resetProfile,
  } = useForm<ProfileForm>({ resolver: zodResolver(profileSchema) });

  // ── Password form ─────────────────────────────────────────────────────────
  const {
    register: regPwd,
    handleSubmit: hsPwd,
    formState: { errors: wErr, isSubmitting: wSub },
    reset: resetPwd,
  } = useForm<PwdForm>({ resolver: zodResolver(pwdSchema) });

  // ── Fetch profile on mount ────────────────────────────────────────────────
  useEffect(() => {
    setLoadingProfile(true);
    getProfile()
      .then((p) => {
        setProfile(p);
        resetProfile({ full_name: p.full_name });
        if (p.profile_image) setAvatarPreview(p.profile_image);
      })
      .catch(() => toast.error("Failed to load profile"))
      .finally(() => setLoadingProfile(false));
  }, [resetProfile]);

  // ── Avatar file picker ────────────────────────────────────────────────────
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  // ── Save profile — PUT /profile/update (multipart/form-data) ─────────────
  const onSaveProfile = async (data: ProfileForm) => {
    try {
      const updated = await updateProfile({
        full_name: data.full_name,
        profile_image: avatarFile ?? undefined,
      });
      setProfile(updated);
      setUser(updated);
      // If a new image was uploaded and returned by the API, update preview
      if (updated.profile_image) setAvatarPreview(updated.profile_image);
      setAvatarFile(null); // clear pending file after successful save
      toast.success("Profile updated!");
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  // ── Change password — POST /auth/change-password ──────────────────────────
  // userService.changePassword maps:
  //   old_password        → current_password  (backend field)
  //   confirm_new_password → confirm_password  (backend field)
  const onChangePwd = async (data: PwdForm) => {
    try {
      await changePassword({
        old_password: data.old_password,
        new_password: data.new_password,
        confirm_new_password: data.confirm_new_password,
      });
      toast.success("Password changed!");
      resetPwd();
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  // Displayed user — prefer freshly loaded profile, fall back to auth store
  const u = profile ?? storeUser;

  // Avatar display: local preview > API image > initials
  const displayAvatar = avatarPreview ?? profile?.profile_image ?? null;

  const inputCls =
    "w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#1a2744]/30";

  return (
    <div className="flex-1 bg-gray-50 min-h-screen p-6">
      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Profile</h1>
        <p className="text-gray-500 mb-6">Manage your account settings.</p>

        {/* ── Profile card ─────────────────────────────────────────────── */}
        {loadingProfile ? (
          <ProfileSkeleton />
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-5">
            {/* Avatar + name row */}
            <div className="flex items-start gap-5 mb-6">
              <div className="relative shrink-0">
                <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-2xl font-bold overflow-hidden">
                  {displayAvatar ? (
                    <Image
                      src={displayAvatar}
                      alt={u?.full_name ?? "Avatar"}
                      width={80}
                      height={80}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    getInitials(u?.full_name ?? "U")
                  )}
                </div>
                {/* Avatar upload trigger */}
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="absolute bottom-0 right-0 h-7 w-7 bg-[#1a2744] rounded-full flex items-center justify-center text-white hover:bg-[#0f1a35] transition-colors"
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

              <div>
                <h2 className="text-lg font-bold text-gray-900">{u?.full_name}</h2>
                <p className="text-sm text-gray-500">{u?.email}</p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700">
                    {u?.role === "ADMIN" ? "Administrator" : "Student"}
                  </span>
                  <span
                    className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${u?.is_active
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-600"
                      }`}
                  >
                    {u?.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
                {/* Member since — real date from API */}
                {u?.date_joined && (
                  <p className="text-xs text-gray-400 mt-1.5">
                    Member since {formatDate(u.date_joined)}
                  </p>
                )}
                {/* Show pending avatar file name */}
                {avatarFile && (
                  <p className="text-xs text-blue-500 mt-1">
                    📷 {avatarFile.name} — will be saved with profile
                  </p>
                )}
              </div>
            </div>

            {/* Personal information form */}
            <form onSubmit={hsProfile(onSaveProfile)} className="space-y-4" noValidate>
              <div className="flex items-center gap-2 mb-3">
                <User className="h-5 w-5 text-gray-500" />
                <h3 className="font-semibold text-gray-900">Personal Information</h3>
              </div>

              {/* Full name — editable */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  {...regProfile("full_name")}
                  className={inputCls}
                />
                {pErr.full_name && (
                  <p className="text-xs text-red-500 mt-1">{pErr.full_name.message}</p>
                )}
              </div>

              {/* Email — read-only (backend doesn't support email update here) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address{" "}
                  <span className="text-gray-400 font-normal">(read-only)</span>
                </label>
                <input
                  value={u?.email ?? ""}
                  readOnly
                  className={`${inputCls} bg-gray-50 text-gray-500 cursor-not-allowed`}
                />
              </div>

              <button
                type="submit"
                disabled={pSub}
                className="px-5 py-2.5 bg-[#1a2744] text-white text-sm font-semibold rounded-lg hover:bg-[#0f1a35] disabled:opacity-60 transition-colors"
              >
                {pSub ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </div>
        )}

        {/* ── Password card ─────────────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-5">
            <Shield className="h-5 w-5 text-gray-500" />
            <h3 className="font-semibold text-gray-900">Security &amp; Authentication</h3>
          </div>

          <form onSubmit={hsPwd(onChangePwd)} className="space-y-4" noValidate>
            {/* Current password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Password
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  {...regPwd("old_password")}
                  type={showOld ? "text" : "password"}
                  placeholder="Your current password"
                  className={`${inputCls} pl-9 pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowOld((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                >
                  {showOld ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {wErr.old_password && (
                <p className="text-xs text-red-500 mt-1">{wErr.old_password.message}</p>
              )}
            </div>

            {/* New password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  {...regPwd("new_password")}
                  type={showNew ? "text" : "password"}
                  placeholder="Min 8 characters"
                  className={`${inputCls} pl-9 pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowNew((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                >
                  {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {wErr.new_password && (
                <p className="text-xs text-red-500 mt-1">{wErr.new_password.message}</p>
              )}
            </div>

            {/* Confirm new password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm New Password
              </label>
              <input
                {...regPwd("confirm_new_password")}
                type="password"
                placeholder="Repeat new password"
                className={inputCls}
              />
              {wErr.confirm_new_password && (
                <p className="text-xs text-red-500 mt-1">
                  {wErr.confirm_new_password.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={wSub}
              className="px-5 py-2.5 bg-[#1a2744] text-white text-sm font-semibold rounded-lg hover:bg-[#0f1a35] disabled:opacity-60 transition-colors"
            >
              {wSub ? "Updating..." : "Change Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}