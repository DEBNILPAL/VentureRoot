"use client";

import React from "react";
import Link from "next/link";
import { useBusinessesComparison } from "@/lib/data/businesses";
import { PrismFluxLoader } from "@/components/ui/prism-flux-loader";
import { PlusCircle, BarChart2, ArrowRight, Lock, Sparkles, Building2, Home } from "lucide-react";
import { motion } from "framer-motion";

interface BusinessRequiredGateProps {
  children: React.ReactNode;
  featureName?: string;
  description?: string;
}

export function BusinessRequiredGate({
  children,
  featureName = "this feature",
  description,
}: BusinessRequiredGateProps) {
  const { data: businesses, isLoading } = useBusinessesComparison();

  if (isLoading) {
    return (
      <div className="w-full min-h-[50vh] flex flex-col items-center justify-center p-6 gap-3">
        <PrismFluxLoader size={36} speed={4} />
        <p className="font-sans text-xs sm:text-sm font-semibold text-slate-500">
          Checking your enterprise status...
        </p>
      </div>
    );
  }

  const hasBusinesses = Array.isArray(businesses) && businesses.length > 0;

  if (hasBusinesses) {
    return <>{children}</>;
  }

  return (
    <div className="w-full min-h-[75vh] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-xl bg-white/95 backdrop-blur-md rounded-3xl border border-emerald-800/15 shadow-2xl p-6 sm:p-10 text-center relative overflow-hidden"
      >
        {/* Glow ambient decoration */}
        <div className="absolute -top-16 -right-16 w-44 h-44 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-44 h-44 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Icon & Badge */}
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#1E6702] to-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-950/20 mb-4">
            <Building2 className="w-8 h-8" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-[#1E6702] border border-emerald-200 text-xs font-bold mb-3">
            <Lock className="w-3.5 h-3.5" />
            <span>Business Setup Required</span>
          </div>

          <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Create a Business to Unlock Access
          </h2>

          <p className="font-sans text-xs sm:text-sm text-slate-600 mt-2.5 max-w-md leading-relaxed">
            {description ||
              `To access ${featureName}, you need at least one registered business. Once created, all reports, financial forecasts, feasibility scores, and advisor insights will be customized to your business.`}
          </p>

          {/* Action CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 w-full max-w-md">
            <Link
              href="/business/create"
              className="px-5 py-3 rounded-xl bg-[#1E6702] hover:bg-[#165201] text-white font-sans text-sm font-bold shadow-md hover:shadow-emerald-900/20 transition-all flex items-center justify-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create New Business</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/analysis"
              className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-sans text-sm font-semibold transition-colors flex items-center justify-center gap-2 border border-slate-200"
            >
              <BarChart2 className="w-4 h-4 text-[#1E6702]" />
              <span>Run Market Analysis</span>
            </Link>
          </div>

          {/* Return link */}
          <div className="mt-6 pt-4 border-t border-slate-100 w-full flex justify-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-slate-700 transition-colors"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Return to Dashboard</span>
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
