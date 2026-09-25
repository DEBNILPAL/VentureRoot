"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Users, ArrowRight, Compass, MapPin, Target } from "lucide-react";
import { MarketReachMetrics } from "../types";
import { DynamicText } from "@/features/i18n/components/DynamicText";

interface MarketReachCardsProps {
  data?: MarketReachMetrics | null;
  businessId?: string;
  isLoading?: boolean;
}

const EASE_OUT_EXPO = [0.22, 1, 0.36, 1] as [number, number, number, number];

const cardVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: EASE_OUT_EXPO },
  },
};

/**
 * Clean, Cohesive Donut Progress Meter
 */
function DonutMeter({
  percentage = 100,
  label = "Total",
  gradientId,
  startColor = "#34D399",
  endColor = "#059669",
  trackColor = "#ECFDF5",
}: {
  percentage: number;
  label: string;
  gradientId: string;
  startColor?: string;
  endColor?: string;
  trackColor?: string;
}) {
  const r = 36;
  const circ = 2 * Math.PI * r; // ~226.19
  const clamped = Math.max(0, Math.min(100, Number(percentage) || 0));
  const offset = circ - (clamped / 100) * circ;
  const displayVal = clamped % 1 === 0 ? clamped : clamped.toFixed(1);

  return (
    <div className="relative flex items-center justify-center w-24 h-24 sm:w-28 sm:h-28 shrink-0">
      <svg className="w-full h-full -rotate-90 overflow-visible" viewBox="0 0 88 88">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={startColor} />
            <stop offset="100%" stopColor={endColor} />
          </linearGradient>
        </defs>
        {/* Track */}
        <circle
          cx="44"
          cy="44"
          r={r}
          fill="none"
          stroke={trackColor}
          strokeWidth="7"
        />
        {/* Progress Stroke */}
        <circle
          cx="44"
          cy="44"
          r={r}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth="7"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      {/* Center Label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="font-heading text-lg sm:text-xl font-bold text-slate-900 leading-none">
          {displayVal}%
        </span>
        <span className="text-xs font-semibold text-slate-500 mt-1">
          {label}
        </span>
      </div>
    </div>
  );
}

function MarketReachSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 w-full">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="bg-white rounded-2xl border border-slate-100 p-5 sm:p-6 shadow-sm animate-pulse flex flex-col justify-between h-56"
        >
          <div className="space-y-2">
            <div className="w-36 h-5 bg-slate-100 rounded" />
            <div className="w-48 h-3 bg-slate-50 rounded" />
          </div>
          <div className="my-4 flex items-center justify-between">
            <div className="space-y-2 flex-1">
              <div className="w-28 h-8 bg-slate-100 rounded" />
              <div className="w-20 h-4 bg-slate-50 rounded" />
            </div>
            <div className="w-20 h-20 rounded-full bg-slate-100 shrink-0" />
          </div>
          <div className="w-full h-10 bg-slate-50 rounded-xl" />
        </div>
      ))}
    </div>
  );
}

export function MarketReachCards({
  data,
  businessId,
  isLoading = false,
}: MarketReachCardsProps) {
  if (isLoading) {
    return <MarketReachSkeleton />;
  }

  if (!data || !data.tam || !data.sam || !data.som) {
    return (
      <div className="w-full bg-white rounded-2xl border border-slate-100 p-6 text-center flex flex-col items-center justify-center gap-2 shadow-sm">
        <p className="text-xs sm:text-sm font-semibold text-slate-700">
          Calculating authoritative market catchment analytics...
        </p>
        <span className="text-xs text-slate-500">
          Demographic density and commercial reach models are analyzing this location.
        </span>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-3.5">
      {/* Clean, Symmetrical Section Header OUTSIDE the cards */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="font-heading text-lg sm:text-xl font-bold text-[#173809] tracking-tight">
            Market Reach
          </h2>
          <span className="text-xs text-slate-400 hidden sm:inline">•</span>
          <span className="text-xs text-slate-600 hidden sm:inline font-normal">
            Local customer size and revenue potential
          </span>
        </div>
        {businessId && (
          <Link
            href={`/business/${businessId}/feasibility`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#173809] bg-white border border-[#173809]/20 hover:bg-[#173809]/5 hover:border-[#173809]/40 transition-all shadow-2xs group"
          >
            <span>View Full Market Details</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        )}
      </div>

      {/* 3 Premium Pastel Cards (Inspired by Reference Design) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 w-full items-stretch">
        
        {/* ─── CARD 1: TAM (Soft Rose / Salmon Pastel) ─── */}
        <motion.div
          variants={cardVariants}
          className="group relative overflow-hidden bg-[#FFF5F5] rounded-2xl border border-rose-100/90 shadow-[0_4px_20px_-4px_rgba(244,63,94,0.08)] hover:shadow-[0_8px_28px_-4px_rgba(244,63,94,0.16)] transition-all duration-300 p-5 sm:p-6 flex flex-col justify-between h-full"
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-xs font-semibold text-rose-900/70 block mb-1">
                Total Addressable Market (TAM)
              </span>
              <h3 className="font-heading text-base sm:text-[17px] font-bold text-slate-900 tracking-tight leading-snug">
                All Customers in Your District
              </h3>
            </div>
            {/* Solid Circular Vibrant Icon Pill */}
            <div className="w-11 h-11 rounded-full bg-[#F43F5E] text-white flex items-center justify-center shrink-0 shadow-sm">
              <Compass className="w-5 h-5 text-white" />
            </div>
          </div>

          {/* Value + Donut Meter */}
          <div className="my-4 flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="font-heading text-2xl sm:text-[28px] font-bold text-slate-900 tracking-tight">
                {data.tam.formattedValue}
              </div>
              {data.tam.formattedCustomerCount && (
                <div className="mt-1 flex items-center gap-1.5 text-xs font-medium text-slate-600">
                  <Users className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                  <span>{data.tam.formattedCustomerCount}</span>
                </div>
              )}
            </div>

            <DonutMeter
              percentage={data.tam.chartValue}
              label="Universe"
              gradientId="tamDonutGrad"
              startColor="#FB7185"
              endColor="#E11D48"
              trackColor="#FFE4E6"
            />
          </div>

          {/* Plain-Language Explanation Capsule */}
          <div className="pt-2 mt-auto">
            <p className="text-xs text-slate-700 leading-relaxed font-normal bg-white/80 p-3 rounded-xl border border-rose-100/80 shadow-2xs">
              <DynamicText text={data.tam.explanation} />
            </p>
          </div>
        </motion.div>

        {/* ─── CARD 2: SAM (Soft Sky Blue Pastel) ─── */}
        <motion.div
          variants={cardVariants}
          className="group relative overflow-hidden bg-[#EFF6FF] rounded-2xl border border-blue-100/90 shadow-[0_4px_20px_-4px_rgba(59,130,246,0.08)] hover:shadow-[0_8px_28px_-4px_rgba(59,130,246,0.16)] transition-all duration-300 p-5 sm:p-6 flex flex-col justify-between h-full"
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-xs font-semibold text-blue-900/70 block mb-1">
                Serviceable Local Market (SAM)
              </span>
              <h3 className="font-heading text-base sm:text-[17px] font-bold text-slate-900 tracking-tight leading-snug">
                Customers Living Close (10km)
              </h3>
            </div>
            {/* Solid Circular Vibrant Icon Pill */}
            <div className="w-11 h-11 rounded-full bg-[#3B82F6] text-white flex items-center justify-center shrink-0 shadow-sm">
              <MapPin className="w-5 h-5 text-white" />
            </div>
          </div>

          {/* Value + Donut Meter */}
          <div className="my-4 flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="font-heading text-2xl sm:text-[28px] font-bold text-slate-900 tracking-tight">
                {data.sam.formattedValue}
              </div>
              {data.sam.formattedCustomerCount && (
                <div className="mt-1 flex items-center gap-1.5 text-xs font-medium text-slate-600">
                  <Users className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>{data.sam.formattedCustomerCount}</span>
                </div>
              )}
            </div>

            <DonutMeter
              percentage={data.sam.chartValue}
              label="10km Area"
              gradientId="samDonutGrad"
              startColor="#60A5FA"
              endColor="#2563EB"
              trackColor="#DBEAFE"
            />
          </div>

          {/* Plain-Language Explanation Capsule */}
          <div className="pt-2 mt-auto">
            <p className="text-xs text-slate-700 leading-relaxed font-normal bg-white/80 p-3 rounded-xl border border-blue-100/80 shadow-2xs">
              <DynamicText text={data.sam.explanation} />
            </p>
          </div>
        </motion.div>

        {/* ─── CARD 3: SOM (Soft Mint / Sage Pastel) ─── */}
        <motion.div
          variants={cardVariants}
          className="group relative overflow-hidden bg-[#ECFDF5] rounded-2xl border border-emerald-100/90 shadow-[0_4px_20px_-4px_rgba(16,185,129,0.08)] hover:shadow-[0_8px_28px_-4px_rgba(16,185,129,0.16)] transition-all duration-300 p-5 sm:p-6 flex flex-col justify-between h-full"
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-xs font-semibold text-emerald-900/70 block mb-1">
                Target Sales Goal (SOM)
              </span>
              <h3 className="font-heading text-base sm:text-[17px] font-bold text-slate-900 tracking-tight leading-snug">
                Realistic Year 1 Target
              </h3>
            </div>
            {/* Solid Circular Vibrant Icon Pill */}
            <div className="w-11 h-11 rounded-full bg-[#10B981] text-white flex items-center justify-center shrink-0 shadow-sm">
              <Target className="w-5 h-5 text-white" />
            </div>
          </div>

          {/* Value + Donut Meter */}
          <div className="my-4 flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="font-heading text-2xl sm:text-[28px] font-bold text-slate-900 tracking-tight">
                {data.som.formattedValue}
              </div>
              {data.som.formattedCustomerCount && (
                <div className="mt-1 flex items-center gap-1.5 text-xs font-medium text-slate-600">
                  <Users className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{data.som.formattedCustomerCount}</span>
                </div>
              )}
            </div>

            <DonutMeter
              percentage={data.som.chartValue}
              label="Yr 1 Target"
              gradientId="somDonutGrad"
              startColor="#34D399"
              endColor="#059669"
              trackColor="#D1FAE5"
            />
          </div>

          {/* Plain-Language Explanation Capsule */}
          <div className="pt-2 mt-auto">
            <p className="text-xs text-slate-700 leading-relaxed font-normal bg-white/80 p-3 rounded-xl border border-emerald-100/80 shadow-2xs">
              <DynamicText text={data.som.explanation} />
            </p>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
