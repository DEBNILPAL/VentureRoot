"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default function GlobalErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log detailed error to developer console without exposing to the DOM
    console.error("[App Error Boundary caught unhandled error]:", error);
  }, [error]);

  return (
    <div className="min-h-screen w-full bg-[#FFFBE7] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-3xl border border-black/10 shadow-xl p-8 text-center flex flex-col items-center">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4 border border-amber-200">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <h2 className="font-heading text-xl font-bold text-[#200813]">
          Something went wrong
        </h2>

        <p className="font-sans text-sm text-[#200813]/60 mt-2 leading-relaxed">
          An unexpected error occurred while processing your request. Please try again or return to the dashboard.
        </p>

        {error.digest && (
          <p className="font-mono text-[11px] text-gray-400 mt-2">
            Reference ID: {error.digest}
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-3 w-full mt-6">
          <button
            type="button"
            onClick={() => reset()}
            className="flex-1 py-3 px-4 rounded-xl bg-[#1E6702] hover:bg-[#154a01] text-white font-sans text-sm font-medium transition-all shadow-sm flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </button>

          <Link
            href="/dashboard"
            className="py-3 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#200813] font-sans text-sm font-medium transition-colors flex items-center justify-center gap-1.5"
          >
            <Home className="w-4 h-4" />
            <span>Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
