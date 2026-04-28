"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, GraduationCap, User, Mail, Lock, Shield, Map, UserPlus } from "lucide-react";
import { register as registerUser } from "@/services/authService";
import { extractErrorMessage } from "@/utils/helpers";
import toast from "react-hot-toast";

const schema = z.object({
  full_name: z.string().min(2, "Full name required"),
  email: z.string().email("Valid email required"),
  role: z.enum(["STUDENT", "ADMIN"] as const),
  password: z.string().min(8, "Min 8 characters"),
  confirm_password: z.string().min(1, "Please confirm your password"),
  terms: z.boolean().refine(v => v, "You must accept the terms"),
}).refine(d => d.password === d.confirm_password, {
  message: "Passwords don't match",
  path: ["confirm_password"],
});
type RegisterForm = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [apiError, setApiError] = useState("");

  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<RegisterForm>({
      resolver: zodResolver(schema),
      defaultValues: { role: "STUDENT" },
    });

  const onSubmit = async (data: RegisterForm) => {
    setApiError("");
    try {
      // Send all required fields to backend:
      // full_name, email, password, confirm_password, role
      await registerUser({
        full_name: data.full_name,
        email: data.email,
        password: data.password,
        confirm_password: data.confirm_password,
        role: data.role,
      });
      toast.success("Account created! Awaiting admin approval before you can log in.");
      router.push("/login");
    } catch (err) {
      setApiError(extractErrorMessage(err));
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* ── Left: form ── */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center p-8 lg:p-16 bg-gray-50">
        <div className="w-full max-w-md mx-auto">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-6 lg:hidden">
            <div className="h-8 w-8 rounded-lg bg-[#1a2744] flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-[#1a2744]">Campus Events</span>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
            <p className="text-gray-500 text-sm">
              Join your campus community today and never miss an event.
            </p>
          </div>

          {apiError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  {...register("full_name")}
                  placeholder="Alex Johnson"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1a2744]/20 focus:border-[#1a2744]"
                />
              </div>
              {errors.full_name && <p className="mt-1 text-xs text-red-500">{errors.full_name.message}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">University Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  {...register("email")}
                  type="email"
                  placeholder="alex.j@university.edu"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1a2744]/20 focus:border-[#1a2744]"
                />
              </div>
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Role</label>
              <div className="relative">
                <Shield className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  {...register("role")}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1a2744]/20 focus:border-[#1a2744] appearance-none"
                >
                  <option value="STUDENT">Student</option>
                  <option value="ADMIN">Admin</option>
                </select>
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Password + Confirm */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    {...register("password")}
                    type={showPwd ? "text" : "password"}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1a2744]/20 focus:border-[#1a2744]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password</label>
                <div className="relative">
                  <Shield className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    {...register("confirm_password")}
                    type={showConfirm ? "text" : "password"}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1a2744]/20 focus:border-[#1a2744]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.confirm_password && <p className="mt-1 text-xs text-red-500">{errors.confirm_password.message}</p>}
              </div>
            </div>

            {/* Terms */}
            <div className="flex items-start gap-2">
              <input
                {...register("terms")}
                type="checkbox"
                id="terms"
                className="h-4 w-4 mt-0.5 rounded border-gray-300 text-[#1a2744] focus:ring-[#1a2744]"
              />
              <label htmlFor="terms" className="text-sm text-gray-600">
                I agree to the{" "}
                <Link href="/support" className="text-[#1a2744] underline font-medium">Terms of Service</Link>
                {" "}and{" "}
                <Link href="/support" className="text-[#1a2744] underline font-medium">Privacy Policy</Link>.
              </label>
            </div>
            {errors.terms && <p className="text-xs text-red-500">{errors.terms.message}</p>}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-[#1a2744] text-white font-semibold rounded-lg hover:bg-[#0f1a35] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              <UserPlus className="h-4 w-4" />
              {isSubmitting ? "Registering..." : "Register Now"}
            </button>
          </form>

          <div className="mt-5 pt-5 border-t border-gray-200">
            <p className="text-center text-sm text-gray-500">
              Already have an account?{" "}
              <Link href="/login" className="font-bold text-gray-900 hover:underline">Sign In</Link>
            </p>
          </div>
        </div>
      </div>

      {/* ── Right: dark panel ── */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#1a2744] flex-col items-center justify-center p-12 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "28px 28px" }}
        />
        <div className="relative z-10 text-center max-w-sm w-full">
          <div className="h-20 w-20 rounded-full bg-[#263354] flex items-center justify-center mx-auto mb-6">
            <svg className="h-10 w-10 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-white mb-3">Discover Campus Life</h2>
          <p className="text-blue-200 text-sm mb-8 leading-relaxed">
            Connect with student organizations, attend workshops, and make the most of your university experience.
          </p>
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-[#1e3060] rounded-xl p-4 text-left">
              <div className="h-8 w-8 bg-[#263354] rounded-lg flex items-center justify-center mb-2">
                <Shield className="h-4 w-4 text-blue-300" />
              </div>
              <p className="text-white font-semibold text-sm">Real-time RSVP</p>
              <p className="text-blue-300 text-xs mt-1">Instantly book seats for popular events.</p>
            </div>
            <div className="bg-[#1e3060] rounded-xl p-4 text-left">
              <div className="h-8 w-8 bg-[#263354] rounded-lg flex items-center justify-center mb-2">
                <Map className="h-4 w-4 text-blue-300" />
              </div>
              <p className="text-white font-semibold text-sm">Interactive Map</p>
              <p className="text-blue-300 text-xs mt-1">Find events happening on campus.</p>
            </div>
          </div>
          <div className="bg-[#1e3060] rounded-2xl p-4 flex items-center gap-4">
            <div className="flex -space-x-2">
              {["bg-teal-400", "bg-orange-400", "bg-purple-400", "bg-blue-400"].map((c, i) => (
                <div key={i} className={`h-8 w-8 rounded-full ${c} border-2 border-[#1e3060] flex items-center justify-center`}>
                  <User className="h-4 w-4 text-white" />
                </div>
              ))}
            </div>
            <div className="text-left">
              <p className="text-white text-sm font-semibold">Join 12,000+ students</p>
              <p className="text-blue-300 text-xs">Already part of the community</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
