"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, GraduationCap, Mail, Lock } from "lucide-react";
import { login } from "@/services/authService";
import { useAuthStore } from "@/context/authStore";
import { extractErrorMessage } from "@/utils/helpers";
import toast from "react-hot-toast";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
  remember: z.boolean().optional(),
});
type LoginForm = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [showPwd, setShowPwd] = useState(false);
  const [apiError, setApiError] = useState("");

  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<LoginForm>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: LoginForm) => {
    setApiError("");
    try {
      // login() saves tokens to localStorage and returns { message, tokens, user }
      const res = await login({ email: data.email, password: data.password });
      setUser(res.user);
      toast.success("Welcome back!");
      // Redirect based on role
      router.push(res.user.role === "ADMIN" ? "/admin" : "/dashboard");
    } catch (err) {
      setApiError(extractErrorMessage(err));
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* ── Left panel ── */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#1a2744] flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '28px 28px' }} />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <span className="text-white font-bold text-lg">CampusEvents</span>
          </div>
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Connecting your<br />campus community.
          </h1>
          <p className="text-blue-200 text-base leading-relaxed max-w-sm">
            Discover workshops, social gatherings, and academic seminars happening right across your university.
          </p>
        </div>

        <div className="relative z-10">
          <div className="flex gap-10">
            <div>
              <p className="text-3xl font-bold text-white">500+</p>
              <p className="text-blue-300 text-sm mt-1">Monthly Events</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-white">12k+</p>
              <p className="text-blue-300 text-sm mt-1">Active Students</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back</h2>
            <p className="text-gray-500">Please enter your details to sign in</p>
          </div>

          {apiError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Campus Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input {...register("email")} type="email" placeholder="name@university.edu"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a2744]/20 focus:border-[#1a2744]" />
              </div>
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
            </div>

            <div>
              <div className="flex justify-between mb-1.5">
                <label className="text-sm font-medium text-gray-700">Password</label>
                <Link href="/forgot-password" className="text-sm font-semibold text-gray-900 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input {...register("password")} type={showPwd ? "text" : "password"} placeholder="••••••••"
                  className="w-full pl-10 pr-11 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a2744]/20 focus:border-[#1a2744]" />
                <button type="button" onClick={() => setShowPwd(v => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
            </div>

            <div className="flex items-center gap-2">
              <input {...register("remember")} type="checkbox" id="remember"
                className="h-4 w-4 rounded border-gray-300 text-[#1a2744] focus:ring-[#1a2744]" />
              <label htmlFor="remember" className="text-sm text-gray-600">Remember me for 30 days</label>
            </div>

            <button type="submit" disabled={isSubmitting}
              className="w-full py-3 bg-[#1a2744] text-white font-semibold rounded-lg hover:bg-[#0f1a35] transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
              {isSubmitting ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-sm text-gray-400">Or continue with SSO</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <button className="w-full py-3 border border-gray-200 rounded-lg flex items-center justify-center gap-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Campus Portal
          </button>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-bold text-gray-900 hover:underline">Register here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
