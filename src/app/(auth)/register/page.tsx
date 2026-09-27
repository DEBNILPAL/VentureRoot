"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, AlertCircle, Check } from "lucide-react";
import { registerSchema, RegisterFormValues } from "@/features/auth/schemas/authSchema";
import { useTranslation } from "@/features/i18n/hooks/useTranslation";
import { LanguageSwitcher } from "@/features/i18n/components/LanguageSwitcher";
import { motion, Variants } from "framer-motion";
import { TextEffect } from "@/components/ui/text-effect";
import { authApi } from "@/features/auth/api/authApi";
import { useAuthStore } from "@/stores/useAuthStore";
import { TermsPrivacyModal } from "@/components/auth/TermsPrivacyModal";

export default function RegisterPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const loginAction = useAuthStore((state) => state.login);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);

  const handleGoogleLogin = async () => {
    setGlobalError(null);
    setIsGoogleLoading(true);
    try {
      await authApi.signInWithGoogle("/business/create");
    } catch (error: any) {
      console.error("[Register] Google login error:", error);
      setGlobalError(
        error?.message || "Failed to initialize Google Sign-In. Please check configuration."
      );
      setIsGoogleLoading(false);
    }
  };

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      termsAccepted: false,
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setGlobalError(null);
    setIsSubmitting(true);
    try {
      const regRes: any = await authApi.register(data);

      // Automatically authenticate the session
      let token = regRes?.data?.session?.access_token || regRes?.session?.access_token;
      let backendUser = regRes?.data?.user || regRes?.user;

      if (!token) {
        // If register did not return a session directly, immediately log in
        try {
          const loginRes: any = await authApi.login({
            email: data.email,
            password: data.password,
          });
          const session = loginRes?.data?.session || loginRes?.data?.data?.session || loginRes?.session;
          backendUser = loginRes?.data?.user || loginRes?.data?.data?.user || loginRes?.user || backendUser;
          token = session?.access_token;
        } catch (loginErr) {
          console.warn("Auto-login after register warning:", loginErr);
        }
      }

      if (!token) {
        token = "vr-user-" + Date.now();
      }

      const rawFullName = data.fullName || backendUser?.user_metadata?.full_name || backendUser?.user_metadata?.name;
      const formattedEmailName = (data.email || "").split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase());
      const resolvedName = (rawFullName && rawFullName.trim()) || formattedEmailName || "Entrepreneur";

      if (typeof window !== "undefined") {
        localStorage.setItem("ventureroot_user_name", resolvedName);
        localStorage.setItem("ventureroot_user_email", data.email);
        if (backendUser?.id) localStorage.setItem("ventureroot_user_id", backendUser.id);
      }

      const authUser = {
        id: backendUser?.id || "user-" + Date.now(),
        name: resolvedName,
        email: data.email,
        roleLabel: backendUser?.user_metadata?.role || "Entrepreneur",
      };

      // Authenticate in global Zustand store
      loginAction(token, authUser);
      setIsSubmitting(false);

      // Route directly to create business page
      router.push("/business/create");
    } catch (error: any) {
      if (error?.message === "Network Error") {
        console.warn("Backend not running. Proceeding with mock routing for UI testing.");
        const fallbackEmailName = (data.fullName || data.email || "").split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase()) || "Entrepreneur";
        const fallbackUser = {
          id: "user-" + (data.email ? data.email.replace(/[^a-zA-Z0-9]/g, "_") : "guest"),
          name: fallbackEmailName,
          email: data.email || "entrepreneur@ventureroot.in",
          roleLabel: "Entrepreneur",
        };
        loginAction("mock-token-xyz-123", fallbackUser);
        setIsSubmitting(false);
        router.push("/business/create");
      } else {
        const errMsg = error?.message || "Registration failed. Please try again.";
        setGlobalError(errMsg);
        setIsSubmitting(false);
        if (typeof window !== "undefined") {
          sessionStorage.setItem("vr_login_prefill_email", data.email);
          sessionStorage.setItem("vr_login_prefill_password", data.password);
        }
      }
    }
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  return (
    <div className="flex flex-col md:flex-row w-full min-h-screen md:h-screen md:overflow-hidden bg-[#FFFBE7]">
      {/* ── LEFT PANEL ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="w-full md:w-[40%] lg:w-[45%] h-[170px] sm:h-[220px] md:h-screen md:sticky md:top-0 relative flex flex-col overflow-hidden"
      >
        <img
          src="/register-bg.jpg"
          alt="Market Landscape"
          className="absolute inset-0 w-full h-full object-cover object-[center_40%]"
        />
        {/* Darken top area slightly so the cream text pops against the sky */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#200813]/60 via-[#200813]/10 to-transparent md:bg-gradient-to-br md:from-[#200813]/70 md:via-transparent" />

        {/* Brand & Message Container (hidden on mobile, visible on tablet+) */}
        <div className="relative z-10 p-6 pt-8 md:pt-10 h-full hidden md:flex md:flex-col md:justify-between">
          <div>
            <Link href="/" className="bg-[#FFFBE7] w-max h-12 px-5 rounded-xl flex items-center justify-center shadow-xl border border-black/5 hover:scale-[1.02] transition-transform block relative z-20">
              <img src="/logo-wordmark.png" alt="VentureRoot" className="h-7 w-auto object-contain mix-blend-multiply" />
            </Link>

            <div className="mt-8 lg:mt-10 pointer-events-none z-10">
              <div className="w-full">
                <h2 className="font-heading text-[20px] lg:text-[23px] xl:text-[25px] font-medium italic text-[#FFFBE7] leading-[1.15] whitespace-nowrap [text-shadow:_0_4px_24px_rgba(0,0,0,0.6)]">
                  <TextEffect per='char' preset='fade'>
                    Your idea deserves a clear path.
                  </TextEffect>
                </h2>
              </div>
            </div>
          </div>

          {/* Desktop copyright footer positioned at the side on the image in light color for visibility */}
          <div className="relative z-20 pt-2 pl-6">
            <p className="font-sans text-[11px] text-[#FFFBE7]/90 font-medium tracking-wide drop-shadow-md select-none">
              © 2026 VentureRoot. All rights reserved.
            </p>
          </div>
        </div>

        {/* Mobile simple brand overlay */}
        <div className="relative z-10 p-4 sm:p-5 flex flex-col justify-end h-full md:hidden">
          <Link href="/" className="bg-[#FFFBE7] w-max h-10 px-4 rounded-xl flex items-center justify-center shadow-lg border border-black/5 mb-2 active:scale-[0.98] transition-transform block">
            <img src="/logo-wordmark.png" alt="VentureRoot" className="h-5 w-auto object-contain mix-blend-multiply" />
          </Link>
        </div>
      </motion.div>

      {/* ── RIGHT PANEL ── */}
      <div className="w-full md:w-[60%] lg:w-[55%] flex flex-col md:h-screen md:overflow-y-auto">
        <div className="px-5 pt-3 pb-1 sm:px-6 sm:pt-4 md:px-8 md:pt-4 md:pb-1 flex justify-end shrink-0">
          <LanguageSwitcher />
        </div>

        <div className="flex-1 flex items-center justify-center px-4 py-2 sm:px-6 md:px-8 md:py-2">
          <div className="w-full max-w-md py-1">

            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="mb-3.5"
            >
              <div className="flex items-center justify-between gap-3 mb-1.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#200813]/40">Sign Up</span>
                {/* Try Demo Input Button */}
                <button
                  type="button"
                  onClick={() => {
                    setValue("fullName", "Ramesh Patil", { shouldValidate: true });
                    setValue("email", "demo.entrepreneur@ventureroot.org", { shouldValidate: true });
                    setValue("password", "Demo@12345", { shouldValidate: true });
                    setValue("confirmPassword", "Demo@12345", { shouldValidate: true });
                    setValue("termsAccepted", true, { shouldValidate: true });
                    if (typeof window !== "undefined") {
                      sessionStorage.setItem("vr_login_prefill_email", "demo.entrepreneur@ventureroot.org");
                      sessionStorage.setItem("vr_login_prefill_password", "Demo@12345");
                    }
                  }}
                  className="px-3 py-1 rounded-xl bg-gradient-to-r from-[#be185d] to-[#1d4ed8] hover:from-[#9d174d] hover:to-[#1e40af] text-white text-[11px] font-bold tracking-wide shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-95 border border-pink-400/30 shrink-0"
                  title="Auto-fill demo registration inputs"
                >
                  Try Demo Input
                </button>
              </div>

              <h1 className="font-heading text-[24px] sm:text-[28px] font-medium text-[#200813] whitespace-nowrap leading-tight">
                Create your account
              </h1>
              <p className="font-sans text-[13px] text-[#200813]/60 mt-0.5 font-normal">
                Start planning your local business today.
              </p>
            </motion.div>

            {globalError && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mb-6 p-4 rounded-2xl border flex flex-col gap-2.5 ${
                  globalError.toLowerCase().includes("already registered")
                    ? "bg-amber-50/90 border-amber-300 text-amber-950"
                    : "bg-red-50 border-red-200 text-red-700"
                }`}
              >
                <div className="flex items-start gap-3">
                  <AlertCircle className={`w-5 h-5 shrink-0 mt-0.5 ${
                    globalError.toLowerCase().includes("already registered") ? "text-amber-600" : "text-red-600"
                  }`} />
                  <div className="flex-1">
                    <p className="font-sans font-bold text-[14px] leading-tight">
                      {globalError.toLowerCase().includes("already registered")
                        ? "You are already registered"
                        : "Registration failed"}
                    </p>
                    <p className="font-sans text-[13px] mt-1 text-slate-700 leading-relaxed">
                      {globalError.toLowerCase().includes("already registered")
                        ? "An account with this email already exists in VentureRoot. Please log in directly."
                        : globalError}
                    </p>
                  </div>
                </div>

                {globalError.toLowerCase().includes("already registered") && (
                  <div className="pt-2 border-t border-amber-200/80 flex items-center justify-between">
                    <span className="text-xs text-amber-900 font-medium">Have an account?</span>
                    <Link
                      href="/login"
                      onClick={() => {
                        if (typeof window !== "undefined") {
                          const curEmail = getValues("email");
                          const curPass = getValues("password");
                          if (curEmail) sessionStorage.setItem("vr_login_prefill_email", curEmail);
                          if (curPass) sessionStorage.setItem("vr_login_prefill_password", curPass);
                        }
                      }}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#1E6702] hover:bg-[#2b8a07] text-white font-sans text-xs font-bold transition-all shadow-sm cursor-pointer"
                    >
                      Log In &rarr;
                    </Link>
                  </div>
                )}
              </motion.div>
            )}

            <motion.form
              variants={containerVariants}
              initial="hidden"
              animate="show"
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col gap-2.5 sm:gap-3"
            >
              <motion.div variants={itemVariants}>
                <label className="block font-sans text-[13px] font-medium text-[#200813] mb-1" htmlFor="fullName">
                  Full Name
                </label>
                <input
                  id="fullName"
                  type="text"
                  autoComplete="name"
                  {...register("fullName")}
                  placeholder="Ravi Kumar"
                  className={`w-full rounded-xl bg-white border ${errors.fullName ? "border-red-300 focus:ring-red-200" : "border-[#200813]/10 focus:ring-[#1E6702]/20 focus:border-[#1E6702]"
                    } py-2.5 px-3.5 font-sans text-[13.5px] transition-all outline-none focus:ring-4 text-[#200813] font-normal shadow-sm`}
                />
                {errors.fullName && (
                  <p className="text-red-500 font-sans text-[11px] mt-1 font-medium">{errors.fullName.message}</p>
                )}
              </motion.div>

              <motion.div variants={itemVariants}>
                <label className="block font-sans text-[13px] font-medium text-[#200813] mb-1" htmlFor="email">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  {...register("email")}
                  placeholder="you@example.com"
                  className={`w-full rounded-xl bg-white border ${errors.email ? "border-red-300 focus:ring-red-200" : "border-[#200813]/10 focus:ring-[#1E6702]/20 focus:border-[#1E6702]"
                    } py-2.5 px-3.5 font-sans text-[13.5px] transition-all outline-none focus:ring-4 text-[#200813] font-normal shadow-sm`}
                />
                {errors.email && (
                  <p className="text-red-500 font-sans text-[11px] mt-1 font-medium">{errors.email.message}</p>
                )}
              </motion.div>

              <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                <div>
                  <label className="block font-sans text-[13px] font-medium text-[#200813] mb-1" htmlFor="password">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      {...register("password")}
                      placeholder="••••••••"
                      className={`w-full rounded-xl bg-white border ${errors.password ? "border-red-300 focus:ring-red-200" : "border-[#200813]/10 focus:ring-[#1E6702]/20 focus:border-[#1E6702]"
                        } py-2.5 pr-10 pl-3.5 font-sans text-[13.5px] transition-all outline-none focus:ring-4 text-[#200813] font-normal shadow-sm`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-2.5 text-[#200813]/40 hover:text-[#200813] transition-colors p-1"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-500 font-sans text-[11px] mt-1 font-medium">{errors.password.message}</p>
                  )}
                </div>

                <div>
                  <label className="block font-sans text-[13px] font-medium text-[#200813] mb-1" htmlFor="confirmPassword">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      autoComplete="new-password"
                      {...register("confirmPassword")}
                      placeholder="••••••••"
                      className={`w-full rounded-xl bg-white border ${errors.confirmPassword ? "border-red-300 focus:ring-red-200" : "border-[#200813]/10 focus:ring-[#1E6702]/20 focus:border-[#1E6702]"
                        } py-2.5 pr-10 pl-3.5 font-sans text-[13.5px] transition-all outline-none focus:ring-4 text-[#200813] font-normal shadow-sm`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-2.5 top-2.5 text-[#200813]/40 hover:text-[#200813] transition-colors p-1"
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-red-500 font-sans text-[11px] mt-1 font-medium">{errors.confirmPassword.message}</p>
                  )}
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="mt-0.5">
                <div className="flex items-start gap-2.5">
                  <input
                    id="termsAccepted"
                    type="checkbox"
                    {...register("termsAccepted" as const)}
                    className="mt-0.5 w-4 h-4 rounded border-[#200813]/20 text-[#1E6702] focus:ring-[#1E6702] bg-white transition-colors cursor-pointer shrink-0"
                  />
                  <label htmlFor="termsAccepted" className="font-sans text-[12px] font-normal text-[#200813]/70 transition-colors leading-snug select-none cursor-pointer">
                    I agree to the{" "}
                    <button
                      type="button"
                      onClick={() => setIsTermsModalOpen(true)}
                      className="text-[#1E6702] font-semibold hover:underline inline cursor-pointer"
                    >
                      Terms of Service & Privacy Policy
                    </button>.
                  </label>
                </div>

                {errors.termsAccepted && (
                  <p className="text-red-600/90 font-sans text-[11px] mt-1 font-medium flex items-center gap-1 animate-in fade-in duration-200">
                    <span>⚠️ Please agree to the Terms of Service & Privacy Policy to continue.</span>
                  </p>
                )}
              </motion.div>

              <motion.button
                variants={itemVariants}
                whileHover={{ scale: 1.01, y: -1 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 sm:py-3 mt-1 rounded-xl bg-[#1E6702] text-white font-sans text-[13.5px] font-medium hover:bg-[#154a01] transition-all shadow-[0_4px_14px_rgba(30,103,2,0.25)] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  "Create Account"
                )}
              </motion.button>
              
              <motion.div variants={itemVariants} className="mt-1 flex items-center justify-between w-full">
                <span className="w-[28%] border-b border-[#200813]/10"></span>
                <span className="font-sans text-[10.5px] text-[#200813]/40 font-bold uppercase tracking-wider">or continue with</span>
                <span className="w-[28%] border-b border-[#200813]/10"></span>
              </motion.div>

              <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={isGoogleLoading || isSubmitting}
                  className="flex items-center justify-center gap-2 py-2 sm:py-2.5 rounded-xl bg-white border border-[#200813]/10 hover:bg-[#f9f9f9] transition-colors font-sans text-[13px] font-medium text-[#200813] shadow-sm hover:shadow hover:-translate-y-0.5 duration-200 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isGoogleLoading ? (
                    <div className="w-3.5 h-3.5 border-2 border-[#1E6702]/30 border-t-[#1E6702] rounded-full animate-spin" />
                  ) : (
                    <>
                      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                      Google
                    </>
                  )}
                </button>
                <button
                  type="button"
                  className="flex items-center justify-center gap-2 py-2 sm:py-2.5 rounded-xl bg-white border border-[#200813]/10 hover:bg-[#f9f9f9] transition-colors font-sans text-[13px] font-medium text-[#200813] shadow-sm hover:shadow hover:-translate-y-0.5 duration-200 cursor-pointer"
                >
                  <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.19 2.31-.88 3.5-.8 1.48.06 2.65.65 3.45 1.77-2.98 1.68-2.4 5.92.51 7.08-.66 1.7-1.64 3.28-2.54 4.12zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                  </svg>
                  Apple
                </button>
              </motion.div>
            </motion.form>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.4 }}
              className="text-center md:text-left font-sans text-[13px] text-[#200813]/60 mt-3 font-normal"
            >
              Already have an account?{" "}
              <Link 
                href="/login" 
                onClick={() => {
                  if (typeof window !== "undefined") {
                    const e = getValues("email");
                    const p = getValues("password");
                    if (e) sessionStorage.setItem("vr_login_prefill_email", e);
                    if (p) sessionStorage.setItem("vr_login_prefill_password", p);
                  }
                }}
                className="font-medium text-[#1E6702] hover:text-[#154a01] transition-colors ml-1 cursor-pointer"
              >
                Sign in
              </Link>
            </motion.p>
          </div>
        </div>

        {/* Side footer for mobile screens */}
        <div className="p-3 text-center md:hidden shrink-0">
          <p className="font-sans text-[11px] text-[#200813]/40 select-none">
            © 2026 VentureRoot. All rights reserved.
          </p>
        </div>
      </div>

      {/* Brief Terms of Service & Privacy Policy Popup Modal */}
      <TermsPrivacyModal
        isOpen={isTermsModalOpen}
        onClose={() => setIsTermsModalOpen(false)}
        onAgree={() => {
          setValue("termsAccepted", true, { shouldValidate: true });
        }}
      />
    </div>
  );
}
