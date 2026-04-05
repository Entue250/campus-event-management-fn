// ============================================================
// CAMPUS EVENTS — Forgot Password Page
// ============================================================

"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { GraduationCap, CheckCircle } from "lucide-react";
import { forgotPassword } from "@/services/authService";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ErrorMessage } from "@/components/ui/index";
import { extractErrorMessage } from "@/utils/helpers";

const schema = z.object({
  email: z.string().email("Enter a valid email address"),
});
type ForgotForm = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [apiError, setApiError] = useState("");

  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<ForgotForm>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: ForgotForm) => {
    setApiError("");
    try {
      await forgotPassword(data.email);
      setSent(true);
    } catch (err) {
      setApiError(extractErrorMessage(err));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-950 via-navy-900 to-primary-900 flex items-center justify-center p-4">
      <div className="relative w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8 animate-slide-up">
          <div className="text-center mb-8">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-600 mb-4">
              <GraduationCap className="h-7 w-7 text-white" />
            </div>
            <h1 className="font-display text-2xl font-bold text-gray-900">
              Forgot Password
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Enter your email and we&apos;ll send a reset link
            </p>
          </div>

          {sent ? (
            <div className="text-center">
              <CheckCircle className="h-14 w-14 text-green-500 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-1">Check your inbox!</h3>
              <p className="text-sm text-gray-500 mb-6">
                If an account exists with that email, a reset link has been sent.
              </p>
              <Link href="/login">
                <Button className="w-full">Back to Login</Button>
              </Link>
            </div>
          ) : (
            <>
              {apiError && <div className="mb-4"><ErrorMessage message={apiError} /></div>}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                <Input
                  {...register("email")}
                  type="email"
                  label="Email Address"
                  placeholder="you@university.edu"
                  error={errors.email?.message}
                  required
                />
                <Button type="submit" loading={isSubmitting} className="w-full" size="lg">
                  Send Reset Link
                </Button>
              </form>
            </>
          )}

          <p className="text-center text-sm text-gray-500 mt-6">
            Remember your password?{" "}
            <Link href="/login" className="text-primary-600 font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
