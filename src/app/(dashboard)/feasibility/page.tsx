"use client";

import React from "react";
import Link from "next/link";
import {
  ShieldAlert, ArrowLeft, ArrowRight, MapPin, PlusCircle,
  BarChart2, ShieldCheck, ChevronRight, Activity, Sparkles
} from "lucide-react";
import { motion } from "framer-motion";
import { useBusinessesComparison } from "@/lib/data/businesses";
import { PrismFluxLoader } from "@/components/ui/prism-flux-loader";

const EASE_OUT_EXPO = [0.22, 1, 0.36, 1] as const;

export default function FeasibilityHubPage() {
  const { data: businesses, isLoading } = useBusinessesComparison();

  if (isLoading) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center p-6 gap-3">
        <PrismFluxLoader size={38} speed={4} />
        <p className="text-sm font-semibold text-slate-600">Retrieving your registered ventures...</p>
      </div>
    );
  }

  const hasBusinesses = businesses && businesses.length > 0;

  return (
    <div className="w-full min-h-screen p-4 sm:p-6 lg:p-8 flex flex-col gap-6 max-w-7xl mx-auto">
      
      {/* ─── Page Header with Clear Hierarchy & Back Navigation ─── */}
      <div className="flex flex-col gap-3 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-2.5">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white hover:bg-emerald-50 text-slate-700 hover:text-[#1E6702] border border-slate-200 transition-all active:scale-95 shadow-xs"
            title="Back to Dashboard"
            aria-label="Back to Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
            <Link href="/dashboard" className="hover:text-[#1E6702] transition-colors hover:underline">
              Dashboard
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 opacity-60" />
            <span className="text-slate-800 font-bold">Feasibility Hub</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-1">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#1E6702] text-xs font-bold border border-emerald-200 flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5" /> Intelligence & Feasibility Hub
              </span>
              <span className="text-xs text-slate-400 font-medium">
                {hasBusinesses ? `${businesses.length} ${businesses.length === 1 ? "Venture" : "Ventures"} Available` : "0 Ventures"}
              </span>
            </div>
            <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
              Enterprise Feasibility Intelligence
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
              Select a registered venture to inspect hyper-local census demographic reach, competitor density, and algorithmic viability scores.
            </p>
          </div>

          <Link
            href="/business/create"
            className="self-start sm:self-auto px-5 py-2.5 bg-[#1E6702] hover:bg-[#165201] text-white text-xs sm:text-sm font-bold rounded-xl shadow-md hover:shadow-emerald-950/20 hover:-translate-y-0.5 transition-all flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Register New Business</span>
          </Link>
        </div>
      </div>

      {/* ─── Business Selection Grid ─── */}
      {hasBusinesses ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {businesses.map((biz: any, idx: number) => {
            const capexEst = (
              Number(biz.expectedRevenue ? biz.expectedRevenue * 0.4 : biz.availableMargin * 3 || 100000) / 100000
            ).toFixed(1);
            const marginAmt = Number(biz.availableMargin || 0);
            const revenueAmt = Number(biz.expectedRevenue || 0);
            const categoryName = biz.category?.name || biz.category || "Agro & Rural Enterprise";
            const locationStr = biz.location?.district
              ? `${biz.location.district}, ${biz.location.state || ""}`
              : biz.location?.state || "Local District";

            return (
              <motion.div
                key={biz.id || idx}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: idx * 0.06, ease: EASE_OUT_EXPO }}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md p-4 sm:p-6 flex flex-col justify-between gap-5 transition-all relative overflow-hidden group"
              >
                <div className="space-y-4">
                  {/* Card Header */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="whitespace-nowrap px-3 py-1 rounded-full bg-emerald-50 text-[#1E6702] text-xs font-extrabold tracking-wide border border-emerald-200">
                        Venture {idx + 1}
                      </span>
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                    </div>
                    <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200 whitespace-nowrap shrink-0">
                      {biz.status || "Active / Verified"}
                    </span>
                  </div>

                  {/* Title & Location */}
                  <div>
                    <h2 className="font-heading text-xl font-bold text-slate-900 group-hover:text-[#1E6702] transition-colors line-clamp-1">
                      {biz.name || `Business ${idx + 1}`}
                    </h2>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mt-1 flex-wrap">
                      <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 font-semibold text-[11px] border border-amber-200/60">
                        {categoryName}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{locationStr}</span>
                      </span>
                    </div>
                  </div>

                  {/* Feasibility Telemetry Strip */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-2.5 pt-2 border-t border-slate-100 text-xs">
                    <div className="p-2 sm:p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex flex-col gap-0.5 min-w-0">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider truncate">
                        Promoter Margin
                      </span>
                      <span className="font-bold text-slate-900 text-xs sm:text-sm truncate">
                        ₹{marginAmt.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="p-2 sm:p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-100 flex flex-col gap-0.5 min-w-0">
                      <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider truncate">
                        Capex Scale
                      </span>
                      <span className="font-bold text-[#1E6702] text-xs sm:text-sm truncate">
                        ₹{capexEst} Lakhs
                      </span>
                    </div>
                    <div className="p-2 sm:p-2.5 rounded-xl bg-teal-50/60 border border-teal-100 flex flex-col gap-0.5 col-span-2 sm:col-span-1 min-w-0">
                      <span className="text-[10px] uppercase font-bold text-teal-800 tracking-wider truncate">
                        Target Revenue
                      </span>
                      <span className="font-bold text-teal-900 text-xs sm:text-sm truncate">
                        {revenueAmt > 0 ? `₹${revenueAmt.toLocaleString("en-IN")}/mo` : "₹1.2L/mo"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Primary Action Button */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 sm:gap-3">
                  <Link
                    href={`/business/${biz.id}`}
                    className="text-center py-2.5 px-3 sm:px-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors whitespace-nowrap shrink-0"
                  >
                    Overview
                  </Link>
                  <Link
                    href={`/business/${biz.id}/feasibility`}
                    className="flex-1 py-2.5 px-3 sm:px-4 rounded-xl bg-[#1E6702] hover:bg-[#165201] text-white text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 sm:gap-2 shadow-sm hover:shadow-emerald-950/20 active:scale-98 min-w-0 text-center"
                  >
                    <BarChart2 className="w-4 h-4 shrink-0" />
                    <span className="truncate">Inspect Feasibility Report</span>
                    <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: EASE_OUT_EXPO }}
          className="bg-white rounded-3xl border-2 border-dashed border-slate-200 p-8 sm:p-14 text-center flex flex-col items-center gap-5 max-w-xl mx-auto shadow-sm my-8"
        >
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#1E6702]">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-heading text-lg sm:text-xl font-bold text-slate-900">
              No Registered Ventures Yet
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-sm">
              Register a business first to calculate census demographic scores, infrastructure feasibility, and market demand intelligence.
            </p>
          </div>
          <Link
            href="/business/create"
            className="px-6 py-2.5 bg-[#1E6702] hover:bg-[#165201] text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition-all flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Register First Business</span>
          </Link>
        </motion.div>
      )}
    </div>
  );
}
