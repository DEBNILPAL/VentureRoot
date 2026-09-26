"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  TrendingUp,
  Crosshair,
  Target,
  AlertCircle,
  Layers,
  Users,
} from "lucide-react";
import { OpportunityAnalysis, CompetitionAnalysis } from "../types";
import { resolveCatchmentCompetitors } from "../utils/competitorResolver";
import { DynamicText } from "@/features/i18n/components/DynamicText";

interface YourOpportunityCardProps {
  opportunity?: OpportunityAnalysis | null;
  competition?: CompetitionAnalysis | null;
  competitorRadar?: any | null;
  demandIndicator?: string | null;
  businessId?: string;
  category?: string;
  locationName?: string;
  centerCoords?: [number, number];
  isLoading?: boolean;
}

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];

export function YourOpportunityCard({
  opportunity,
  competition,
  competitorRadar,
  demandIndicator,
  businessId,
  category = "Enterprise",
  locationName = "Target Location",
  centerCoords,
  isLoading = false,
}: YourOpportunityCardProps) {
  // Authoritative synced competitor data (identical single-source with Feasibility page)
  const resolved = useMemo(() => {
    return resolveCatchmentCompetitors({
      competitorRadar,
      competition,
      category,
      locationName,
      centerCoords,
    });
  }, [competitorRadar, competition, category, locationName, centerCoords]);

  const {
    raw10km,
    raw20km,
    allCompetitors,
    totalGovt,
    totalPvt,
    totalDirect,
    totalIndirect,
  } = resolved;

  const summaryText =
    opportunity?.summary ||
    opportunity?.demandOpportunity ||
    opportunity?.why?.summary ||
    null;

  const localDemandInsight =
    demandIndicator ||
    opportunity?.keyDrivers?.[0] ||
    opportunity?.observations?.[0] ||
    null;

  // Dynamic assessment of opportunity vs competitive risk
  const rankMatch = summaryText?.match(/ranks #(\d+)/i);
  const scoreMatch =
    summaryText?.match(/score of ([\d.]+)\/100/i) ||
    summaryText?.match(/([\d.]+)%?\s*\/\s*100/);
  const parsedScore = scoreMatch ? parseFloat(scoreMatch[1]) : null;
  const parsedRank = rankMatch ? parseInt(rankMatch[1], 10) : null;

  // Low opportunity threshold: score < 50 or bottom rank (> 5)
  const isLowOpportunity =
    (parsedScore !== null && parsedScore < 50) ||
    (parsedRank !== null && parsedRank > 5);

  const cardTitle = isLowOpportunity ? "Competitive Assessment" : "Your Opportunity";
  const CardIcon = isLowOpportunity ? Target : Crosshair;

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-emerald-100/50 p-5 sm:p-6 animate-pulse h-full flex flex-col gap-3">
        <div className="w-36 h-5 bg-emerald-50 rounded-lg" />
        <div className="w-full h-4 bg-slate-50 rounded" />
        <div className="w-3/4 h-4 bg-slate-50 rounded" />
        <div className="space-y-3 pt-2">
          <div className="w-full h-8 bg-emerald-50/40 rounded-lg" />
          <div className="w-full h-8 bg-emerald-50/40 rounded-lg" />
        </div>
        <div className="w-full h-10 bg-emerald-50 rounded-xl mt-auto" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE }}
      className="bg-white/95 backdrop-blur-sm rounded-2xl border border-slate-200/80 shadow-[0_8px_30px_-6px_rgba(0,0,0,0.06),0_2px_4px_rgba(0,0,0,0.02)] p-5 sm:p-6 h-full flex flex-col justify-between relative overflow-hidden transition-all duration-300 hover:shadow-[0_12px_32px_-6px_rgba(0,0,0,0.09)]"
    >
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-slate-300/60 to-transparent pointer-events-none" />

      <div className="flex flex-col gap-3.5">
        {/* Card Title & Zone Badge */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-xl ${
                isLowOpportunity
                  ? "bg-amber-50 text-amber-800 border-amber-200/80"
                  : "bg-emerald-50 text-[#1E6702] border-emerald-200/60"
              } border flex items-center justify-center shrink-0`}
            >
              <CardIcon className="w-4 h-4" />
            </div>
            <h3
              className={`font-heading text-lg sm:text-xl font-bold ${
                isLowOpportunity ? "text-slate-900" : "text-[#173809]"
              } tracking-tight`}
            >
              {cardTitle}
            </h3>
          </div>
          <span
            className={`font-sans text-[10.5px] font-bold ${
              isLowOpportunity
                ? "text-amber-900 bg-amber-50 border-amber-200/80"
                : "text-emerald-800 bg-emerald-50 border-emerald-200/60"
            } px-2.5 py-0.5 rounded-full border tracking-wider`}
          >
            {allCompetitors.length} Total Verified
          </span>
        </div>

        {/* Summary */}
        {summaryText ? (
          <p className="font-sans text-[13px] sm:text-sm text-slate-600 leading-relaxed">
            {summaryText}
          </p>
        ) : (
          <p className="font-sans text-xs text-slate-500 leading-relaxed">
            Direct market catchment and competitor radius intelligence verified for {category} in {locationName}.
          </p>
        )}

        {/* Catchment Competitors — 100% Synced Single-Source with Feasibility Page */}
        <div
          className={`flex flex-col gap-2.5 ${
            isLowOpportunity
              ? "bg-slate-50/80 border-slate-200/80"
              : "bg-[#F0FDF4] border-emerald-100/60"
          } rounded-xl p-3.5 sm:p-4 border`}
        >
          <div className="flex items-center justify-between mb-0.5">
            <span
              className={`text-[12.5px] font-bold ${
                isLowOpportunity ? "text-slate-900" : "text-[#173809]"
              }`}
            >
              Nearby Competitors
            </span>
            <span
              className={`text-[11px] font-semibold ${
                isLowOpportunity
                  ? "text-slate-700 border-slate-200"
                  : "text-emerald-800 border-emerald-200/70"
              } bg-white px-2 py-0.5 rounded-md border shadow-2xs`}
            >
              {allCompetitors.length} Total Verified
            </span>
          </div>

          {/* Symmetrical Catchment Zone Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
            {/* 10 km Primary Catchment */}
            <div
              className={`p-3 bg-white rounded-xl border ${
                isLowOpportunity ? "border-amber-200/70" : "border-emerald-200/70"
              } flex flex-col gap-1 shadow-2xs`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-[10.5px] font-bold uppercase tracking-wider ${
                    isLowOpportunity ? "text-amber-800" : "text-emerald-800"
                  } flex items-center gap-1.5`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isLowOpportunity ? "bg-amber-500" : "bg-emerald-500"
                    } shrink-0`}
                  />
                  10 km Catchment
                </span>
              </div>
              <div className="flex flex-wrap items-baseline gap-1 mt-0.5">
                <span
                  className={`text-2xl font-black ${
                    isLowOpportunity ? "text-slate-900" : "text-emerald-950"
                  } tabular-nums leading-none`}
                >
                  {raw10km.length}
                </span>
                <span
                  className={`text-[11.5px] font-semibold ${
                    isLowOpportunity ? "text-slate-600" : "text-emerald-700"
                  }`}
                >
                  competitors
                </span>
              </div>
              <span className="text-[10.5px] text-slate-500 font-medium">Core service radius</span>
            </div>

            {/* 10–20 km District Extended Reach */}
            <div className="p-3 bg-white rounded-xl border border-indigo-200/70 flex flex-col gap-1 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[10.5px] font-bold uppercase tracking-wider text-indigo-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                  10–20 km District
                </span>
              </div>
              <div className="flex flex-wrap items-baseline gap-1 mt-0.5">
                <span className="text-2xl font-black text-indigo-950 tabular-nums leading-none">
                  {raw20km.length}
                </span>
                <span className="text-[11.5px] font-semibold text-indigo-700">competitors</span>
              </div>
              <span className="text-[10.5px] text-slate-500 font-medium">Extended catchment</span>
            </div>
          </div>

          {/* Quick Sub-Stats Sync Badges — Exact same counts as Feasibility page pills */}
          <div
            className={`grid grid-cols-4 gap-1 pt-1.5 border-t ${
              isLowOpportunity ? "border-slate-200/60" : "border-emerald-200/50"
            } text-[10.5px] text-slate-600 font-medium text-center`}
          >
            <span className="bg-white/90 py-1 px-1 rounded border border-sky-200 text-sky-800 font-bold truncate">
              🏛️ {totalGovt} Govt
            </span>
            <span className="bg-white/90 py-1 px-1 rounded border border-purple-200 text-purple-800 font-bold truncate">
              🏢 {totalPvt} Pvt
            </span>
            <span className="bg-white/90 py-1 px-1 rounded border border-red-200 text-red-800 font-bold truncate">
              {totalDirect} Direct
            </span>
            <span className="bg-white/90 py-1 px-1 rounded border border-amber-200 text-amber-800 font-bold truncate">
              {totalIndirect} Ind.
            </span>
          </div>
        </div>

        {/* Demand / Risk Signal */}
        {isLowOpportunity ? (
          <div className="flex items-start gap-2 bg-amber-50/80 px-3 py-2 rounded-xl border border-amber-200/80">
            <AlertCircle className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
            <p className="text-[11.5px] text-amber-950 font-medium leading-snug">
              {opportunity?.demandOpportunity ? (
                <>
                  <DynamicText text={opportunity.demandOpportunity} /> —{" "}
                </>
              ) : ""}
              {allCompetitors.length} active competitors in catchment zone require strong differentiation.
            </p>
          </div>
        ) : localDemandInsight ? (
          <div className="flex items-start gap-2 bg-emerald-50/60 px-3 py-2 rounded-xl border border-emerald-100/60">
            <TrendingUp className="w-3.5 h-3.5 text-[#1E6702] shrink-0 mt-0.5" />
            <p className="text-[11.5px] text-emerald-950 font-medium leading-snug">
              <DynamicText text={localDemandInsight} />
            </p>
          </div>
        ) : null}
      </div>

      {/* Primary CTA */}
      <div className="pt-3 mt-1">
        <Link
          href={businessId ? `/business/${businessId}/feasibility` : "/analysis"}
          className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-[13px] font-semibold bg-[#1E6702] text-white hover:bg-[#155201] transition-all shadow-sm hover:shadow-emerald-900/20 group cursor-pointer"
        >
          <span>Explore Full Feasibility</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </motion.div>
  );
}
