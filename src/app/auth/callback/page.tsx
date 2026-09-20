"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import { useAuthStore } from "@/stores/useAuthStore";
import { authApi } from "@/features/auth/api/authApi";
import { AlertCircle, ArrowRight } from "lucide-react";
import { getSafeRedirectUrl } from "@/lib/security/redirect";

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex w-full min-h-screen items-center justify-center bg-[#FFFBE7]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-3 border-[#1E6702]/30 border-t-[#1E6702] rounded-full animate-spin" />
            <p className="font-sans text-sm text-[#200813]/70 font-medium">
              Connecting with Google...
            </p>
          </div>
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = getSafeRedirectUrl(searchParams.get("redirect"), "/dashboard");
  const loginAction = useAuthStore((state) => state.login);

  const [status, setStatus] = useState<"processing" | "success" | "error">(
    "processing"
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function handleAuthCallback() {
      try {
        const supabase = getSupabaseBrowserClient();
        const code = searchParams.get("code");
        const errorParam = searchParams.get("error");
        const errorDescription = searchParams.get("error_description");

        if (errorParam) {
          throw new Error(
            errorDescription ||
              "Google authorization failed. Please try signing in again."
          );
        }

        // If PKCE code is in the query params, exchange it for session
        if (code) {
          const { error: exchangeError } =
            await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) {
            console.warn(
              "[AuthCallback] Code exchange warning:",
              exchangeError.message
            );
          }
        }

        // Get current session (either after exchange or from URL hash token)
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError || !session) {
          // If session is still not resolved, listen once for auth state change
          const {
            data: { subscription },
          } = supabase.auth.onAuthStateChange(async (event, newSession) => {
            if (newSession && isMounted) {
              subscription.unsubscribe();
              await processSession(newSession);
            }
          });

          // Timeout fallback in case nothing resolves
          setTimeout(() => {
            if (isMounted && status === "processing") {
              subscription.unsubscribe();
              setStatus("error");
              setErrorMessage(
                "Could not retrieve your authentication session. Please try logging in again."
              );
            }
          }, 6000);
          return;
        }

        await processSession(session);
      } catch (err: any) {
        if (isMounted) {
          console.error("[AuthCallback] Error completing sign-in:", err);
          setStatus("error");
          setErrorMessage(
            err?.message ||
              "Failed to complete Google authentication. Please try again."
          );
        }
      }
    }

    async function processSession(session: any) {
      const user = session.user;
      const token = session.access_token;

      const meta = user?.user_metadata || {};
      const rawFullName =
        meta.full_name ||
        meta.name ||
        meta.user_name ||
        (user?.email
          ? user.email
              .split("@")[0]
              .replace(/[._-]/g, " ")
              .replace(/\b\w/g, (c: string) => c.toUpperCase())
          : "Entrepreneur");

      // Save user name locally for immediate greeting across pages
      if (typeof window !== "undefined") {
        localStorage.setItem("ventureroot_user_name", rawFullName);
      }

      // Sync user profile to backend Prisma database
      try {
        await authApi.syncOAuthUser(token);
      } catch (syncErr: any) {
        console.warn(
          "[AuthCallback] Profile sync warning (continuing login):",
          syncErr?.message
        );
      }

      const authUser = {
        id: user.id,
        name: rawFullName,
        email: user.email || "",
        roleLabel: meta.role || "Entrepreneur",
      };

      // Set Zustand auth store and cookies
      loginAction(token, authUser);

      if (isMounted) {
        setStatus("success");
        setTimeout(() => {
          router.replace(redirectUrl);
        }, 500);
      }
    }

    handleAuthCallback();

    return () => {
      isMounted = false;
    };
  }, [searchParams, router, redirectUrl, loginAction, status]);

  return (
    <div className="flex w-full min-h-screen items-center justify-center bg-[#FFFBE7] p-6">
      <div className="w-full max-w-md bg-white rounded-3xl border border-black/10 shadow-xl p-8 text-center flex flex-col items-center">
        <Link href="/" className="mb-6 block hover:scale-[1.02] transition-transform">
          <img
            src="/logo-wordmark.png"
            alt="VentureRoot"
            className="h-9 w-auto object-contain mix-blend-multiply mx-auto"
          />
        </Link>

        {status === "processing" && (
          <div className="flex flex-col items-center py-6">
            <div className="w-10 h-10 border-3 border-[#1E6702]/30 border-t-[#1E6702] rounded-full animate-spin mb-4" />
            <h2 className="font-heading text-xl font-medium text-[#200813]">
              Authenticating with Google
            </h2>
            <p className="font-sans text-sm text-[#200813]/60 mt-2">
              Verifying your credentials and preparing your dashboard...
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center py-6">
            <div className="w-10 h-10 rounded-full bg-[#1E6702]/10 text-[#1E6702] flex items-center justify-center text-xl font-bold mb-4">
              ✓
            </div>
            <h2 className="font-heading text-xl font-medium text-[#200813]">
              Welcome to VentureRoot!
            </h2>
            <p className="font-sans text-sm text-[#200813]/60 mt-2">
              Redirecting you to your account...
            </p>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center py-4 w-full">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mb-4 border border-red-200">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h2 className="font-heading text-xl font-medium text-[#200813]">
              Authentication Issue
            </h2>
            <p className="font-sans text-sm text-red-600 mt-2 bg-red-50 border border-red-200 p-3 rounded-xl w-full text-left">
              {errorMessage}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 w-full mt-6">
              <Link
                href="/login"
                className="flex-1 py-3 px-4 rounded-xl bg-[#1E6702] hover:bg-[#154a01] text-white font-sans text-sm font-medium transition-all shadow-sm flex items-center justify-center gap-2"
              >
                <span>Back to Log In</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/"
                className="py-3 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#200813] font-sans text-sm font-medium transition-colors"
              >
                Home
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
