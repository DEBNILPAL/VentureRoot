"use client";

import React, { useState, useMemo } from "react";
import {
  Crosshair, MapPin, Tag, ShieldCheck, Filter, Sparkles,
  Building2, Landmark, Users, Wifi, Globe, Phone, Clock,
  TrendingUp, AlertTriangle, Target, ChevronDown, ChevronUp,
  Radio, Navigation, BarChart3, Layers, CheckCircle2,
  Award, ShieldAlert, Zap, ArrowUpRight, Scale
} from "lucide-react";
import { CompetitionAnalysis } from "../types";
import { useTranslation } from "@/features/i18n/hooks/useTranslation";
import { getAuthoritativeCensusDensity } from "@/utils/feasibility.mapper";
import { resolveCatchmentCompetitors } from "../utils/competitorResolver";
import { DynamicText } from "@/features/i18n/components/DynamicText";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Competitor {
  id: string;
  name: string;
  type?: string;
  sectorType?: string;
  ownership?: string;
  facilityType?: string;
  source?: string;
  location?: string;
  distanceKm?: number;
  position?: [number, number];
  pricing?: string;
  strengths?: string[];
  weaknesses?: string[];
  positioning?: string;
  businessImpact?: string;
  contact?: string | null;
  openingHours?: string | null;
  aiEnriched?: boolean;
  tags?: Record<string, string | null>;
  rank?: number;
  strengthScore?: number;
  threatLevel?: "Critical Threat" | "Major Threat" | "Moderate Challenger" | "Peripheral Competitor" | string;
  whyMajorCompetitor?: string;
  strategicCountermeasure?: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const isCompetitorGovt = (comp: Competitor): boolean => {
  const s = ((comp.sectorType || "") as string).toLowerCase();
  const o = ((comp.ownership || "") as string).toLowerCase();
  const n = ((comp.name || "") as string).toLowerCase();
  const f = ((comp.facilityType || "") as string).toLowerCase();
  return (
    s.includes("govt") || s.includes("public") ||
    o.includes("gov") || o.includes("public") ||
    n.includes("government") || n.includes("civil hospital") ||
    n.includes("community health") || n.includes("primary health") ||
    n.includes("phc") || n.includes("chc") || n.includes("ayush") ||
    n.includes("esic") || s.includes("cooperative") ||
    o.includes("co-operative") || n.includes("cooperative") ||
    n.includes("apmc") || n.includes("mandi") || s.includes("mandi") ||
    f.includes("mandi") || f.includes("civil hospital") || f.includes("chc")
  );
};

// ─── Expanded Competitor Card ─────────────────────────────────────────────────

const CompetitorCard = ({ comp, index }: { comp: Competitor; index: number }) => {
  const [expanded, setExpanded] = useState(false);
  const isIndirect = comp.type?.toLowerCase().includes("indirect");
  const isGovt = isCompetitorGovt(comp);

  return (
    <div className={`bg-white rounded-2xl border transition-all duration-200 ${
      isGovt
        ? "border-sky-200 hover:border-sky-400 hover:shadow-sky-100"
        : "border-purple-200 hover:border-purple-400 hover:shadow-purple-100"
    } hover:shadow-md`}>
      {/* Card header */}
      <div className="p-4 pb-3">
        <div className="flex items-start justify-between gap-3 mb-2">
          {/* Name + location */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                isGovt
                  ? "bg-sky-50 text-sky-700 border-sky-200"
                  : "bg-purple-50 text-purple-700 border-purple-200"
              }`}>
                {isGovt ? "🏛️ Govt" : "🏥 Private"}
              </span>
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                !isIndirect
                  ? "bg-red-50 text-red-700 border-red-200"
                  : "bg-amber-50 text-amber-800 border-amber-200"
              }`}>
                {comp.type || (isIndirect ? "Indirect" : "Direct")}
              </span>
              {comp.aiEnriched && (
                <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" /> AI Enriched
                </span>
              )}
              {comp.source?.includes("OpenStreetMap") && (
                <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
                  <Globe className="w-2.5 h-2.5" /> Live OSM
                </span>
              )}
            </div>
            <h5 className="font-bold text-[14px] text-gray-900 leading-snug line-clamp-2">{comp.name}</h5>
            <div className="flex items-center gap-3 mt-1 flex-wrap text-xs text-slate-500">
              <span className="flex items-center gap-1 font-medium">
                <Navigation className="w-3 h-3 text-slate-400 shrink-0" />
                {comp.location || `${comp.distanceKm?.toFixed(1)} km away`}
              </span>
              {comp.facilityType && (
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold text-[10px]">
                  {comp.facilityType}
                </span>
              )}
            </div>
          </div>

          {/* Distance badge */}
          <div className={`shrink-0 flex flex-col items-center justify-center w-14 h-14 rounded-xl border-2 ${
            isGovt ? "border-sky-200 bg-sky-50" : "border-purple-200 bg-purple-50"
          }`}>
            <span className={`text-lg font-black leading-none ${isGovt ? "text-sky-700" : "text-purple-700"}`}>
              {comp.distanceKm?.toFixed(1)}
            </span>
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">km</span>
          </div>
        </div>

        {/* Pricing row */}
        <div className="flex items-center justify-between mt-2 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <Tag className="w-3 h-3 text-slate-400 shrink-0" />
            <span className="font-semibold">Observed Pricing:</span>
          </div>
          <span className="text-xs font-bold text-emerald-800">{comp.pricing || "Market Rate"}</span>
        </div>
      </div>

      {/* Strengths / Weaknesses */}
      {(comp.strengths?.length || comp.weaknesses?.length) ? (
        <div className="px-4 pb-3">
          <div className="grid grid-cols-2 gap-3 text-xs">
            {comp.strengths?.length ? (
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-teal-700 mb-1.5">Strengths</span>
                <ul className="space-y-1 text-slate-700">
                  {comp.strengths.slice(0, 2).map((s, i) => (
                    <li key={i} className="flex items-start gap-1.5 leading-snug">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-1.5 shrink-0" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {comp.weaknesses?.length ? (
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-red-600 mb-1.5">Weaknesses</span>
                <ul className="space-y-1 text-slate-700">
                  {comp.weaknesses.slice(0, 2).map((w, i) => (
                    <li key={i} className="flex items-start gap-1.5 leading-snug">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 shrink-0" />
                      <span>{w}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      {/* Expand toggle */}
      {(comp.positioning || comp.businessImpact || comp.source || comp.contact) && (
        <div className="border-t border-slate-100">
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="w-full flex items-center justify-between px-4 py-2 text-xs text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <span className="font-semibold">{expanded ? "Hide details" : "Show strategic insights"}</span>
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {expanded && (
            <div className="px-4 pb-4 space-y-2.5">
              {comp.positioning && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <p className="text-[10.5px] text-emerald-900 leading-relaxed">
                    <span className="font-bold">🎯 Strategic Edge: </span>
                    {comp.positioning}
                  </p>
                </div>
              )}
              {comp.businessImpact && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
                  <span className="flex items-center gap-1.5 font-bold text-blue-900 text-[10px] mb-1">
                    <BarChart3 className="w-3 h-3 text-blue-700 shrink-0" />
                    Business Impact
                  </span>
                  <p className="text-[11px] text-blue-900 font-medium leading-relaxed">{comp.businessImpact}</p>
                </div>
              )}
              <div className="flex flex-wrap gap-2 text-[10px]">
                {comp.source && (
                  <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full font-semibold border border-slate-200 flex items-center gap-1">
                    <Radio className="w-2.5 h-2.5" /> {comp.source}
                  </span>
                )}
                {comp.contact && (
                  <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full font-semibold border border-slate-200 flex items-center gap-1">
                    <Phone className="w-2.5 h-2.5" /> {comp.contact}
                  </span>
                )}
                {comp.openingHours && (
                  <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full font-semibold border border-slate-200 flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" /> {comp.openingHours}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Client-side Top Competitors Scoring Helper ────────────────────────────────

export const computeClientSideTopCompetitors = (all: Competitor[], category: string): Competitor[] => {
  const isHealthcare =
    category.toLowerCase().includes("health") ||
    category.toLowerCase().includes("hospital") ||
    category.toLowerCase().includes("clinic");

  const scored = all.map((c) => {
    const dist = c.distanceKm || 5;
    const isGovt = isCompetitorGovt(c);
    const isDirect = !c.type?.toLowerCase().includes("indirect");

    // 1. Proximity score (max 35 pts)
    const proximityScore = Math.max(8, Math.round(35 - Math.min(dist, 16) * 1.75));

    // 2. Scale & capacity score (max 25 pts)
    let scaleScore = 15;
    const fac = (c.facilityType || c.name || "").toLowerCase();
    if (isHealthcare) {
      if (fac.includes("civil hospital") || fac.includes("medical college") || fac.includes("super-specialty")) scaleScore = 25;
      else if (fac.includes("multi-specialty") || fac.includes("hospital")) scaleScore = 21;
      else if (fac.includes("nursing") || fac.includes("chc")) scaleScore = 17;
      else scaleScore = 12;
    } else {
      if (fac.includes("mandi") || fac.includes("mega") || fac.includes("apex") || fac.includes("corporate")) scaleScore = 25;
      else if (fac.includes("cooperative") || fac.includes("processing") || fac.includes("cluster")) scaleScore = 20;
      else if (fac.includes("enterprise") || fac.includes("wholesale")) scaleScore = 16;
      else scaleScore = 11;
    }

    // 3. Sector authority & moat (max 22 pts)
    const sectorScore = isGovt ? 22 : (isDirect ? 18 : 14);

    // 4. Infrastructure & verification (max 18 pts)
    let infraScore = 10;
    if (c.contact) infraScore += 3;
    if (c.openingHours) infraScore += 2;
    if (c.source?.includes("OpenStreetMap")) infraScore += 3;

    const strengthScore = Math.min(99, Math.max(45, proximityScore + scaleScore + sectorScore + infraScore));
    return { ...c, strengthScore };
  }).sort((a, b) => (b.strengthScore || 0) - (a.strengthScore || 0));

  return scored.slice(0, 6).map((c, idx) => {
    const rank = idx + 1;
    const isGovt = isCompetitorGovt(c);
    const isDirect = !c.type?.toLowerCase().includes("indirect");
    const distStr = `${Number(c.distanceKm || 0).toFixed(1)} km`;

    let threatLevel: "Critical Threat" | "Major Threat" | "Moderate Challenger" | "Peripheral Competitor" = "Moderate Challenger";
    if ((c.strengthScore || 0) >= 88) threatLevel = "Critical Threat";
    else if ((c.strengthScore || 0) >= 78) threatLevel = "Major Threat";

    let whyMajor = c.whyMajorCompetitor || "";
    let countermeasure = c.strategicCountermeasure || "";

    if (!whyMajor) {
      if (isHealthcare) {
        if (isGovt) {
          whyMajor = `Regional statutory healthcare anchor located ${distStr} away. With ${c.pricing || "Free OPD & PM-JAY 100% cashless coverage"}, they absorb the vast volume of rural patient footfall, setting an unbreakable statutory price floor for basic consultations and maternity procedures.`;
          countermeasure = `Avoid competing on price: deliver premium private single-bed rooms, zero wait times, proactive bedside care, and 24x7 resident doctors that overburdened public facilities cannot match.`;
        } else if (isDirect) {
          whyMajor = `Direct private multi-specialty rival situated ${distStr} away. Operating with modern OT setups and private insurance empanelments, they aggressively contend for middle-class and insured patient admissions.`;
          countermeasure = `Counter with 100% transparent, all-inclusive package pricing with zero hidden consumable charges, and run weekly diagnostic health camps in local panchayats.`;
        } else {
          whyMajor = `Primary healthcare referral node located ${distStr} away. They command established neighborhood trust and intercept early outpatient footfall across the regional transit route.`;
          countermeasure = `Coordinate structured emergency referrals for complex surgical cases while providing faster diagnostics and specialized OPD clinics.`;
        }
      } else {
        if (isGovt || c.ownership?.toLowerCase().includes("cooperative")) {
          whyMajor = `Dominant district procurement center located ${distStr} away with cooperative federation backing. They manage massive daily commodity volumes, benefit from statutory procurement rates, and control village aggregation routes.`;
          countermeasure = `Outperform them by eliminating delayed payout cycles: offer immediate same-day digital payouts to producers and deliver certified farm-fresh goods directly to local consumers.`;
        } else if (isDirect) {
          whyMajor = `Direct commercial competitor located within ${distStr}. They compete directly for local consumer wallet share with dedicated distribution vans, branded packaging, and established retail shopkeeper relationships.`;
          countermeasure = `Differentiate on hyper-local freshness, certified hygiene, transparent batch tracing, and guaranteed next-morning shelf replenishment for local retailers.`;
        } else {
          whyMajor = `Major wholesale trading terminal and clearing yard situated ${distStr} away. They dictate regional wholesale prices and control commodity liquidity across the trade corridor.`;
          countermeasure = `Utilize this terminal for bulk clearance of seasonal inventory surplus while retaining the 20–30% premium margin through direct retail consumer sales.`;
        }
      }
    }

    return {
      ...c,
      rank,
      threatLevel,
      whyMajorCompetitor: whyMajor,
      strategicCountermeasure: countermeasure,
    };
  });
};

// ─── Top Ranked Competitor Card ───────────────────────────────────────────────

const TopRankedCompetitorCard = ({ comp }: { comp: Competitor }) => {
  const isGovt = isCompetitorGovt(comp);
  const isDirect = !comp.type?.toLowerCase().includes("indirect");

  const rankLabel = useMemo(() => {
    switch (comp.rank) {
      case 1:
        return "#1 Dominant Market Anchor";
      case 2:
        return "#2 Direct Challenger";
      case 3:
        return "#3 Strategic Rival";
      default:
        return `#${comp.rank || 4} High-Impact Competitor`;
    }
  }, [comp.rank]);

  const threatColor = useMemo(() => {
    switch (comp.threatLevel) {
      case "Critical Threat":
        return "bg-rose-50 text-rose-700 border-rose-200";
      case "Major Threat":
        return "bg-amber-50 text-amber-800 border-amber-200";
      case "High Threat":
        return "bg-amber-50 text-amber-800 border-amber-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  }, [comp.threatLevel]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 hover:shadow-sm transition-all duration-200 p-5 flex flex-col justify-between gap-4">
      {/* Top Bar: Rank & Threat Level */}
      <div>
        <div className="flex items-center justify-between gap-2 flex-wrap mb-2.5">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-900 text-white tracking-wide flex items-center gap-1.5 shadow-xs">
            {rankLabel}
          </span>
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border flex items-center gap-1 ${threatColor}`}>
              <ShieldAlert className="w-3 h-3" />
              {comp.threatLevel || "High Threat"}
            </span>
            <div className="flex items-center gap-1 bg-slate-100 text-slate-800 border border-slate-200 px-2.5 py-0.5 rounded-full text-[11px] font-bold">
              <span>{comp.strengthScore || 85}</span>
              <span className="text-[9px] text-slate-400 font-normal">/100</span>
            </div>
          </div>
        </div>

        {/* Competitor Name & Meta */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h4 className="font-bold text-base text-gray-900 leading-snug">{comp.name}</h4>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap text-xs text-slate-600">
              <span className="flex items-center gap-1 font-semibold text-emerald-700">
                <Navigation className="w-3 h-3 text-emerald-600 shrink-0" />
                {Number(comp.distanceKm).toFixed(1)} km away
              </span>
              <span className="text-slate-300">•</span>
              <span className="px-2 py-0.5 rounded-full text-[10.5px] font-semibold bg-slate-50 text-slate-700 border border-slate-200">
                {isGovt ? "🏛️ Govt" : "🏢 Private"}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10.5px] font-semibold bg-slate-50 text-slate-700 border border-slate-200">
                {isDirect ? "Direct Rival" : "Indirect Feeder"}
              </span>
              {comp.facilityType && (
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold text-[10px]">
                  {comp.facilityType}
                </span>
              )}
              {comp.source?.includes("OpenStreetMap") && (
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold text-[10px] border border-slate-200 flex items-center gap-1">
                  <Globe className="w-2.5 h-2.5 text-slate-500" /> Live OSM
                </span>
              )}
            </div>
          </div>

          {/* Pricing Box */}
          <div className="shrink-0 text-right p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="text-[10px] uppercase font-bold text-slate-500 flex items-center justify-end gap-1">
              <Tag className="w-2.5 h-2.5" /> Pricing
            </div>
            <div className="text-xs font-bold text-slate-900 mt-0.5 max-w-[140px] truncate">
              {comp.pricing || "Market Parity"}
            </div>
          </div>
        </div>
      </div>

      {/* WHY THIS IS A MAJOR COMPETITOR (Market Analysis Callout) */}
      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
          <AlertTriangle className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span>Why This Is a Major Competitor (Market Analysis)</span>
        </div>
        <p className="text-[12.5px] text-slate-700 font-medium leading-relaxed">
          <DynamicText text={comp.whyMajorCompetitor} />
        </p>
      </div>

      {/* RECOMMENDED STRATEGIC COUNTERMEASURE */}
      <div className="p-3.5 rounded-xl bg-emerald-50/40 border border-emerald-200/70">
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-800 uppercase tracking-wider mb-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>Recommended Strategic Playbook & Countermeasure</span>
        </div>
        <p className="text-[12.5px] text-emerald-950 font-medium leading-relaxed">
          <DynamicText text={comp.strategicCountermeasure} />
        </p>
      </div>

      {/* Strengths & Weaknesses Quick Row */}
      {(comp.strengths?.length || comp.weaknesses?.length) ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-slate-100 text-[11.5px]">
          {comp.strengths?.length ? (
            <div className="flex items-start gap-1.5 text-slate-600">
              <span className="font-bold text-slate-800 shrink-0">Key Strength:</span>
              <span className="line-clamp-1 font-medium text-slate-600">
                <DynamicText text={comp.strengths[0]} />
              </span>
            </div>
          ) : null}
          {comp.weaknesses?.length ? (
            <div className="flex items-start gap-1.5 text-slate-600">
              <span className="font-bold text-slate-800 shrink-0">Vulnerability:</span>
              <span className="line-clamp-1 font-medium text-slate-600">
                <DynamicText text={comp.weaknesses[0]} />
              </span>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};

// ─── Radius Band Section ──────────────────────────────────────────────────────

const RadiusBand = ({
  label,
  sublabel,
  color,
  competitors,
  filterType,
  isHealthcare,
  defaultOpen = true,
}: {
  label: string;
  sublabel: string;
  color: "emerald" | "indigo";
  competitors: Competitor[];
  filterType: string;
  isHealthcare: boolean;
  defaultOpen?: boolean;
}) => {
  const [open, setOpen] = useState(defaultOpen);

  const filtered = useMemo(() => {
    if (filterType === "direct") return competitors.filter((c) => !c.type?.toLowerCase().includes("indirect"));
    if (filterType === "indirect") return competitors.filter((c) => c.type?.toLowerCase().includes("indirect"));
    if (filterType === "govt") return competitors.filter(isCompetitorGovt);
    if (filterType === "private") return competitors.filter((c) => !isCompetitorGovt(c));
    return competitors;
  }, [competitors, filterType]);

  const govtCount = competitors.filter(isCompetitorGovt).length;
  const pvtCount = competitors.length - govtCount;
  const directCount = competitors.filter((c) => !c.type?.toLowerCase().includes("indirect")).length;
  const indirectCount = competitors.length - directCount;

  const colorMap = {
    emerald: {
      ring: "border-emerald-300",
      bg: "bg-emerald-50",
      badge: "bg-emerald-100 text-emerald-800 border-emerald-300",
      dot: "bg-emerald-500",
      text: "text-emerald-700",
      header: "bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200",
    },
    indigo: {
      ring: "border-indigo-300",
      bg: "bg-indigo-50",
      badge: "bg-indigo-100 text-indigo-800 border-indigo-300",
      dot: "bg-indigo-500",
      text: "text-indigo-700",
      header: "bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200",
    },
  }[color];

  if (competitors.length === 0) return null;

  return (
    <div className={`rounded-2xl border-2 ${colorMap.ring} overflow-hidden`}>
      {/* Band header */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between p-4 border-b ${colorMap.header} transition-colors`}
      >
        <div className="flex items-center gap-3">
          <div className={`w-2.5 h-2.5 rounded-full ${colorMap.dot} ring-4 ring-offset-1 ${colorMap.bg}`} />
          <div className="text-left">
            <div className={`text-sm font-black ${colorMap.text}`}>{label}</div>
            <div className="text-[11px] text-slate-500 font-medium">{sublabel}</div>
          </div>
          <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${colorMap.badge}`}>
            {competitors.length} total
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
            <span className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-700 border border-sky-200">🏛️ {govtCount} Govt</span>
            <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 border border-purple-200">🏥 {pvtCount} Pvt</span>
            <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200">{directCount} Direct</span>
            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200">{indirectCount} Indirect</span>
          </div>
          {open ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
        </div>
      </button>

      {open && (
        <div className="p-4">
          {filtered.length === 0 ? (
            <p className="text-center text-xs text-slate-400 font-medium py-4">No competitors match this filter in this band.</p>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filtered.map((comp, i) => (
                <CompetitorCard key={comp.id || i} comp={comp} index={i} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Main CompetitionCard ─────────────────────────────────────────────────────

export const CompetitionCard = ({
  data,
  centerCoords,
  businessName = "Your Venture",
  category = "Enterprise",
  locationName = "Target Location",
  competitorRadar = null,
}: {
  data?: CompetitionAnalysis;
  centerCoords?: [number, number];
  businessName?: string;
  category?: string;
  locationName?: string;
  competitorRadar?: {
    within10km?: Competitor[];
    within20km?: Competitor[];
    topCompetitors?: Competitor[];
    total?: number;
    source?: string;
    aiEnriched?: string;
    fetchedAt?: string;
  } | null;
}) => {
  const { t } = useTranslation();
  const [filterType, setFilterType] = useState<"all" | "direct" | "indirect" | "govt" | "private">("all");
  const [topFilter, setTopFilter] = useState<"all" | "direct" | "govt" | "private">("all");

  const isHealthcare =
    category.toLowerCase().includes("health") ||
    category.toLowerCase().includes("hospital") ||
    category.toLowerCase().includes("clinic");

  // ── Authoritative Catchment Competitor Resolution (Synced with Dashboard) ──
  const resolved = useMemo(() => {
    return resolveCatchmentCompetitors({
      competitorRadar,
      competition: data,
      category,
      locationName,
      centerCoords,
    });
  }, [competitorRadar, data, category, locationName, centerCoords]);

  const rawCompetitors10km = resolved.raw10km;
  const rawCompetitors20km = resolved.raw20km;
  const allCompetitors = resolved.allCompetitors;

  const totalGovt = resolved.totalGovt;
  const totalPvt = resolved.totalPvt;
  const totalDirect = resolved.totalDirect;
  const totalIndirect = resolved.totalIndirect;

  const populationReach = useMemo(() => {
    const density = getAuthoritativeCensusDensity({ name: locationName }, { name: locationName });
    return {
      km10: Math.round(314.16 * density),
      km20: Math.round(1256.64 * density),
    };
  }, [locationName]);

  const isLiveData = !!competitorRadar?.within10km?.length || !!competitorRadar?.within20km?.length;
  const isAiEnriched = competitorRadar?.aiEnriched === "gemini-enriched" || competitorRadar?.aiEnriched === "ai-enriched";

  // ── Top 5–6 High-Strength Competitors Radar & Deep Analysis ──
  const topRankedCompetitors = useMemo(() => {
    if (competitorRadar?.topCompetitors && competitorRadar.topCompetitors.length > 0) {
      return competitorRadar.topCompetitors;
    }
    return computeClientSideTopCompetitors(allCompetitors, category);
  }, [competitorRadar?.topCompetitors, allCompetitors, category]);

  const filteredTopCompetitors = useMemo(() => {
    if (topFilter === "direct") return topRankedCompetitors.filter((c) => !c.type?.toLowerCase().includes("indirect"));
    if (topFilter === "govt") return topRankedCompetitors.filter(isCompetitorGovt);
    if (topFilter === "private") return topRankedCompetitors.filter((c) => !isCompetitorGovt(c));
    return topRankedCompetitors;
  }, [topRankedCompetitors, topFilter]);

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 md:p-6 flex flex-col gap-6 h-full">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-200">
            <Crosshair className="w-5 h-5 text-[#1E6702]" />
          </div>
          <div>
            <h3 className="font-sans text-[18px] font-bold text-gray-900">
              {t("feasi.comp") || "Competition Landscape & Radius Intelligence"}
            </h3>
            <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5 flex-wrap">
              {isLiveData ? (
                <>
                  <span className="flex items-center gap-1 text-emerald-700 font-bold">
                    <CheckCircle2 className="w-3 h-3" /> Live OSM Data
                  </span>
                  {isAiEnriched && (
                    <span className="flex items-center gap-1 text-purple-700 font-bold">
                      <Sparkles className="w-3 h-3" /> AI-Enriched
                    </span>
                  )}
                  {competitorRadar?.fetchedAt && (
                    <span className="text-slate-400">• fetched {new Date(competitorRadar.fetchedAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</span>
                  )}
                </>
              ) : (
                "Verified local competitors within 10km & 20km catchment zones"
              )}
            </p>
          </div>
        </div>

        {/* Summary pills */}
        <div className="flex items-center gap-1.5 text-xs flex-wrap">
          <span className="px-2.5 py-1 rounded-full bg-sky-50 text-sky-700 border border-sky-200 font-bold">
            🏛️ {totalGovt} Govt
          </span>
          <span className="px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200 font-bold">
            🏥 {totalPvt} Private
          </span>
          <span className="px-2.5 py-1 rounded-full bg-red-50 text-red-700 border border-red-200 font-bold">
            {totalDirect} Direct
          </span>
          <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-bold">
            {totalIndirect} Indirect
          </span>
        </div>
      </div>

      {/* ── Overview ── */}
      {data?.overview && (
        <p className="font-sans text-[14px] text-gray-800 font-medium leading-relaxed bg-slate-50/80 p-4 rounded-2xl border border-slate-100">
          <DynamicText text={data.overview} />
        </p>
      )}

      {/* ── Population reach summary ── */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 rounded-2xl border-2 border-emerald-200 bg-emerald-50 flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center">
              <Target className="w-4 h-4 text-emerald-700" />
            </div>
            <span className="text-xs font-black text-emerald-800 uppercase tracking-wider">10 km Catchment</span>
          </div>
          <div className="mt-1">
            <span className="text-2xl font-black text-emerald-900">
              {rawCompetitors10km.length}
            </span>
            <span className="text-sm font-bold text-emerald-700 ml-1">competitors</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-800 font-medium">
            <Users className="w-3 h-3" />
            ~{populationReach.km10.toLocaleString("en-IN")} pop. reach • 314 km²
          </div>
        </div>
        <div className="p-4 rounded-2xl border-2 border-indigo-200 bg-indigo-50 flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-indigo-100 border border-indigo-300 flex items-center justify-center">
              <Layers className="w-4 h-4 text-indigo-700" />
            </div>
            <span className="text-xs font-black text-indigo-800 uppercase tracking-wider">10–20 km District</span>
          </div>
          <div className="mt-1">
            <span className="text-2xl font-black text-indigo-900">
              {rawCompetitors20km.length}
            </span>
            <span className="text-sm font-bold text-indigo-700 ml-1">competitors</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-indigo-800 font-medium">
            <Users className="w-3 h-3" />
            ~{populationReach.km20.toLocaleString("en-IN")} pop. reach • 1,257 km²
          </div>
        </div>
      </div>

      {/* ── Top 5–6 High-Strength Competitors Radar & Deep Analysis ── */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 md:p-6 shadow-sm flex flex-col gap-5">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center shadow-xs shrink-0">
              <Award className="w-5 h-5 text-slate-700" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-sans text-[17px] font-bold text-gray-900">
                  Top 5–6 Dominant Competitors & Threat Rankings
                </h4>
                <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                  Threat Radar
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Algorithmic multi-factor evaluation based on web-scraped facility capacity, statutory price floor, proximity friction, and verified commercial reach.
              </p>
            </div>
          </div>

          {/* Sub-filter for top competitors */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {[
              { id: "all", label: `Top ${topRankedCompetitors.length}` },
              { id: "direct", label: "Direct Only" },
              { id: "govt", label: "Govt Anchors" },
              { id: "private", label: "Private Scale" },
            ].map(({ id, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => setTopFilter(id as typeof topFilter)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                  topFilter === id
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Top Competitor Grid */}
        {filteredTopCompetitors.length === 0 ? (
          <p className="text-center text-xs text-slate-400 font-medium py-4">No top-ranked competitors match this sub-filter.</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredTopCompetitors.map((comp) => (
              <TopRankedCompetitorCard key={comp.id || comp.rank} comp={comp} />
            ))}
          </div>
        )}
      </div>

      {/* ── Global filter pills ── */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5" /> Filter:
        </span>
        <div className="flex flex-wrap gap-1.5">
          {[
            { id: "all", label: `All (${allCompetitors.length})`, active: "bg-slate-800 text-white", inactive: "bg-slate-100 text-slate-600 hover:bg-slate-200" },
            { id: "direct", label: `Direct (${totalDirect})`, active: "bg-red-600 text-white", inactive: "text-red-700 hover:bg-red-50 border border-red-200" },
            { id: "indirect", label: `Indirect (${totalIndirect})`, active: "bg-amber-600 text-white", inactive: "text-amber-700 hover:bg-amber-50 border border-amber-200" },
            { id: "govt", label: `Govt (${totalGovt})`, active: "bg-sky-600 text-white", inactive: "text-sky-700 hover:bg-sky-50 border border-sky-200" },
            { id: "private", label: `Private (${totalPvt})`, active: "bg-purple-600 text-white", inactive: "text-purple-700 hover:bg-purple-50 border border-purple-200" },
          ].map(({ id, label, active, inactive }) => (
            <button
              key={id}
              type="button"
              onClick={() => setFilterType(id as typeof filterType)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                filterType === id ? active : `bg-white ${inactive}`
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Radius Band: 0–10 km ── */}
      <RadiusBand
        label="Within 10 km — Core Trade Zone"
        sublabel={`Immediate catchment • ${rawCompetitors10km.length} competitors verified`}
        color="emerald"
        competitors={rawCompetitors10km}
        filterType={filterType}
        isHealthcare={isHealthcare}
        defaultOpen={true}
      />

      {/* ── Radius Band: 10–20 km ── */}
      <RadiusBand
        label="10–20 km — District Catchment"
        sublabel={`Extended district zone • ${rawCompetitors20km.length} competitors verified`}
        color="indigo"
        competitors={rawCompetitors20km}
        filterType={filterType}
        isHealthcare={isHealthcare}
        defaultOpen={false}
      />

      {/* ── Data source footer ── */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
        <div className="flex flex-wrap gap-2 mb-2">
          <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Radio className="w-3 h-3 text-slate-500" /> Data Sources:
          </span>
        </div>
        <div className="flex flex-wrap gap-2 text-[10.5px]">
          {isLiveData ? (
            <>
              <span className="px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 font-semibold flex items-center gap-1">
                <Globe className="w-3 h-3" /> OpenStreetMap (Overpass API) — Live Web Scraping
              </span>
              {isAiEnriched && (
                <span className="px-2.5 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-800 font-semibold flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Neural AI Engine — Strategic Enrichment
                </span>
              )}
            </>
          ) : (
            <>
              <span className="px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-semibold">MoHFW / NHM Registry</span>
              <span className="px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-semibold">PM-JAY Empanelled List</span>
              <span className="px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-semibold">Udyam Registration Portal</span>
              <span className="px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-semibold">Agmarknet APMC</span>
              <span className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-semibold flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Domain ML Model Fallback
              </span>
            </>
          )}
        </div>
      </div>

      {/* ── Differentiation guidance ── */}
      {(data?.observations || []).length > 0 && (
        <div className="bg-emerald-50/70 border border-emerald-100 rounded-2xl p-4 text-xs">
          <span className="font-bold text-emerald-800 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#1E6702]" />
            Strategic Differentiation Guidance
          </span>
          <p className="text-emerald-950 font-medium leading-relaxed mt-1">
            {data?.observations?.[0]}
          </p>
        </div>
      )}
    </div>
  );
};
