"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  ArrowRight,
  Sparkles,
  MapPin,
} from "lucide-react";
import { BusinessLocationFit } from "../types";
import { DynamicText } from "@/features/i18n/components/DynamicText";

interface BusinessLocationFitPanelProps {
  data?: BusinessLocationFit | null;
  businessId?: string;
  isLoading?: boolean;
}

export function BusinessLocationFitPanel({
  data,
  businessId,
  isLoading = false,
}: BusinessLocationFitPanelProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-emerald-100/50 p-5 sm:p-6 animate-pulse h-full flex flex-col gap-3">
        <div className="w-36 h-5 bg-emerald-50 rounded-lg" />
        <div className="w-24 h-7 bg-emerald-50/60 rounded-full" />
        <div className="w-full h-4 bg-slate-50 rounded" />
        <div className="w-3/4 h-4 bg-slate-50 rounded" />
        <div className="flex gap-2 mt-1">
          <div className="w-28 h-7 bg-slate-50 rounded-lg" />
          <div className="w-32 h-7 bg-slate-50 rounded-lg" />
        </div>
        <div className="w-full h-9 bg-slate-50 rounded-xl mt-auto" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-white rounded-2xl border border-dashed border-emerald-200/50 p-5 sm:p-6 h-full flex flex-col gap-3">
        <h3 className="text-[15px] font-bold text-[#173809]">Location Fit</h3>
        <div className="flex items-center gap-3 mt-1">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
            <MapPin className="w-4.5 h-4.5 text-emerald-600" />
          </div>
          <p className="text-sm text-slate-500 leading-relaxed">
            Location analysis will appear here once data is ready.
          </p>
        </div>
      </div>
    );
  }

  const isGood = data.status === "GOOD_FIT";
  const isNeedsAttention = data.status === "NEEDS_ATTENTION";
  const isPoor = data.status === "POOR_FIT";

  const statusConfig = isGood
    ? {
        label: data.statusLabel || "Good Fit",
        bg: "bg-[#DCFCE7]",
        text: "text-[#166534]",
        icon: CheckCircle2,
        iconColor: "text-[#22C55E]",
      }
    : isNeedsAttention
    ? {
        label: data.statusLabel || "Needs Attention",
        bg: "bg-[#FEF9C3]",
        text: "text-[#854D0E]",
        icon: AlertTriangle,
        iconColor: "text-[#EAB308]",
      }
    : {
        label: data.statusLabel || "Poor Fit",
        bg: "bg-[#FFE4E6]",
        text: "text-[#9F1239]",
        icon: AlertCircle,
        iconColor: "text-[#F43F5E]",
      };

  const StatusIcon = statusConfig.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="bg-white rounded-2xl border border-emerald-100/50 p-5 sm:p-6 h-full flex flex-col gap-4"
    >
      {/* Card Title */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg sm:text-xl font-bold text-[#173809] tracking-tight">Location Fit</h3>
        {typeof data.score === "number" && (
          <span className="text-xs text-slate-400 font-mono">{data.score}/100</span>
        )}
      </div>

      {/* Status Badge */}
      <span
        className={`self-start inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[13px] font-semibold ${statusConfig.bg} ${statusConfig.text}`}
      >
        <StatusIcon className={`w-4 h-4 ${statusConfig.iconColor}`} />
        {statusConfig.label}
      </span>

      {/* Explanation */}
      {data.explanation && (
        <p className="text-[13px] sm:text-sm text-slate-600 leading-relaxed">
          <DynamicText text={data.explanation} />
        </p>
      )}

      {/* Key Factors */}
      {data.supportingFactors && data.supportingFactors.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {data.supportingFactors.slice(0, 3).map((factor, idx) => {
            const chipClass = isPoor
              ? "bg-rose-50/80 text-rose-700"
              : isNeedsAttention
              ? "bg-amber-50/80 text-amber-700"
              : "bg-emerald-50/80 text-emerald-700";

            return (
              <span
                key={idx}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium ${chipClass}`}
              >
                <DynamicText text={factor} />
              </span>
            );
          })}
        </div>
      )}

      {/* Warning or Alternative — whichever is present */}
      {data.warning && (
        <div className="flex items-start gap-2.5 bg-amber-50/50 px-3.5 py-2.5 rounded-xl text-xs text-amber-800 leading-relaxed">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
          <span>
            <DynamicText text={data.warning} />
          </span>
        </div>
      )}

      {data.alternativeSuggestion && (
        <div className="flex items-start gap-2.5 bg-emerald-50/50 px-3.5 py-2.5 rounded-xl text-xs text-emerald-800 leading-relaxed">
          <Sparkles className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
          <span>
            <span className="font-semibold">Try: </span>
            <span className="font-semibold">
              <DynamicText text={data.alternativeSuggestion.category} />
            </span>
            {data.alternativeSuggestion.reason && (
              <span> — <DynamicText text={data.alternativeSuggestion.reason} /></span>
            )}
          </span>
        </div>
      )}

      {/* CTA */}
      <div className="mt-auto pt-1">
        <Link
          href={businessId ? `/business/${businessId}/feasibility` : "/analysis"}
          className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-[13px] font-semibold text-white bg-[#2D7A0F] hover:bg-[#236B0A] transition-colors shadow-sm group"
        >
          <span>View Full Analysis</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </motion.div>
  );
}
