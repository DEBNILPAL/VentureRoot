"use client";

import React, { useState, useMemo } from "react";
import {
  AlertTriangle, ShieldCheck, Filter, TrendingDown,
  Truck, Wrench, FileText, DollarSign, CloudRain, Zap,
  CheckCircle2, AlertOctagon
} from "lucide-react";
import { RiskItem } from "../types";
import { useTranslation } from "@/features/i18n/hooks/useTranslation";

export const RiskCard = ({ data }: { data?: RiskItem[] }) => {
  const { t } = useTranslation();
  const [activeFilter, setActiveFilter] = useState<string>("all");

  const risks = useMemo(() => data || [], [data]);

  const severityCounts = useMemo(() => {
    let critical = 0;
    let high = 0;
    let medium = 0;
    let low = 0;
    risks.forEach((r) => {
      if (r.severity === "Critical") critical++;
      else if (r.severity === "High") high++;
      else if (r.severity === "Medium") medium++;
      else low++;
    });
    return { critical, high, medium, low, total: risks.length };
  }, [risks]);

  const filteredRisks = useMemo(() => {
    if (activeFilter === "all") return risks;
    return risks.filter((r) => {
      const cat = (r.category || "").toLowerCase();
      const angle = (r.angle || "").toLowerCase();
      const filter = activeFilter.toLowerCase();
      return cat.includes(filter) || angle.includes(filter);
    });
  }, [risks, activeFilter]);

  if (!data || data.length === 0) return null;

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 md:p-6 flex flex-col gap-5 h-full">

      {/* Header with Severity Breakdown */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-rose-50 flex items-center justify-center border border-rose-200 text-rose-600 shadow-xs">
            <AlertOctagon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-sans text-[18px] font-bold text-gray-900">
              {t("feasi.riskAnalysis") || t("feasi.risk") || "Multi-Angle Risk & Mitigation Assessment"}
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              {t("feasi.riskSubtitle") || "Comprehensive 6-angle vulnerability evaluation & financial exposure analysis"}
            </p>
          </div>
        </div>

        {/* Severity Summary Pills */}
        <div className="flex items-center gap-1.5 flex-wrap text-xs">
          {severityCounts.critical > 0 && (
            <span className="px-2.5 py-1 rounded-full bg-red-50 text-red-800 border border-red-200 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
              {severityCounts.critical} {t("feasi.critical") || "Critical"}
            </span>
          )}
          {severityCounts.high > 0 && (
            <span className="px-2.5 py-1 rounded-full bg-orange-50 text-orange-800 border border-orange-200 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-600" />
              {severityCounts.high} {t("feasi.high") || "High"}
            </span>
          )}
          {severityCounts.medium > 0 && (
            <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
              {severityCounts.medium} {t("feasi.medium") || "Medium"}
            </span>
          )}
        </div>
      </div>

      {/* Risk Angle Filter Buttons */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5" /> {t("feasi.riskAngle") || "Risk Angle"}:
        </span>
        <div className="flex flex-wrap gap-1.5">
          {[
            { id: "all", label: `${t("feasi.allAngles") || "All Angles"} (${risks.length})` },
            { id: "market", label: t("feasi.angleMarket") || "Market & Demand" },
            { id: "supply", label: t("feasi.angleSupply") || "Supply Chain" },
            { id: "operational", label: t("feasi.angleOperational") || "Operational" },
            { id: "regulatory", label: t("feasi.angleRegulatory") || "Regulatory" },
            { id: "financial", label: t("feasi.angleFinancial") || "Financial & Cash Flow" },
            { id: "climate", label: t("feasi.angleClimate") || "Climate & Seasonal" },
          ].map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveFilter(id)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                activeFilter === id
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Risk Items Grid */}
      <div className="flex flex-col gap-4">
        {filteredRisks.length === 0 ? (
          <p className="text-center text-xs text-slate-400 font-medium py-6">
            No risks recorded under this angle.
          </p>
        ) : (
          filteredRisks.map((risk) => (
            <RiskItemComponent key={risk.id} risk={risk} />
          ))
        )}
      </div>
    </div>
  );
};

const severityStyles: Record<string, { bg: string; border: string; badge: string; bar: string; iconBg: string }> = {
  Critical: {
    bg: "bg-rose-50/40",
    border: "border-rose-200",
    badge: "bg-rose-100 text-rose-800 border-rose-300",
    bar: "bg-rose-600",
    iconBg: "bg-rose-100 text-rose-700",
  },
  High: {
    bg: "bg-orange-50/40",
    border: "border-orange-200",
    badge: "bg-orange-100 text-orange-800 border-orange-300",
    bar: "bg-orange-500",
    iconBg: "bg-orange-100 text-orange-700",
  },
  Medium: {
    bg: "bg-amber-50/40",
    border: "border-amber-200",
    badge: "bg-amber-100 text-amber-900 border-amber-300",
    bar: "bg-amber-500",
    iconBg: "bg-amber-100 text-amber-700",
  },
  Low: {
    bg: "bg-slate-50",
    border: "border-slate-200",
    badge: "bg-slate-100 text-slate-700 border-slate-300",
    bar: "bg-slate-400",
    iconBg: "bg-slate-100 text-slate-600",
  },
};

const getAngleIcon = (category: string) => {
  const cat = (category || "").toLowerCase();
  if (cat.includes("market")) return <TrendingDown className="w-4 h-4" />;
  if (cat.includes("supply")) return <Truck className="w-4 h-4" />;
  if (cat.includes("operational")) return <Wrench className="w-4 h-4" />;
  if (cat.includes("regulatory") || cat.includes("statutory")) return <FileText className="w-4 h-4" />;
  if (cat.includes("financial") || cat.includes("cash")) return <DollarSign className="w-4 h-4" />;
  return <CloudRain className="w-4 h-4" />;
};

const RiskItemComponent = ({ risk }: { risk: RiskItem }) => {
  const { t } = useTranslation();
  const style = severityStyles[risk.severity] || severityStyles.Low;

  return (
    <div className={`relative rounded-2xl border p-5 flex flex-col gap-4 overflow-hidden shadow-xs hover:shadow-md transition-all ${style.bg} ${style.border}`}>
      {/* Left severity indicator bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${style.bar}`} />

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pl-2">
        <div className="flex items-start gap-2.5">
          <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${style.iconBg}`}>
            {getAngleIcon(risk.category)}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-[10.5px] font-black text-slate-500 uppercase tracking-wider">
                {risk.category} {t("feasi.riskCat") || "Risk"}
              </span>
              {risk.probability && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                  {risk.probability} {t("feasi.probability") || "Probability"}
                </span>
              )}
            </div>
            <h4 className="font-sans text-[16px] font-bold text-gray-900 leading-snug">{risk.title}</h4>
          </div>
        </div>

        <span className={`px-3 py-1 rounded-full font-sans text-xs font-bold border self-start sm:self-center shrink-0 ${style.badge}`}>
          {risk.severity} {t("feasi.impact") || "Severity"}
        </span>
      </div>

      {/* Financial Exposure Callout */}
      {risk.financialExposure && (
        <div className="mx-2 p-2.5 rounded-xl bg-white/80 border border-slate-200/80 flex items-center justify-between gap-3 text-xs">
          <span className="font-bold text-slate-600 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-600" />
            {t("feasi.financialExposure") || "Financial Margin Exposure"}:
          </span>
          <span className="font-black text-rose-700">{risk.financialExposure}</span>
        </div>
      )}

      {/* Analytical Diagnosis */}
      <p className="font-sans text-[13.5px] text-gray-800 font-medium leading-relaxed pl-2">
        {risk.explanation}
      </p>

      {/* Impact and Mitigation Advisory Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-2 pt-1 border-t border-slate-200/60">
        {risk.potentialImpact && (
          <div className="p-3 bg-white/70 rounded-xl border border-slate-200/70">
            <span className="font-sans text-[10.5px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              {t("feasi.impact") || "Potential Operational Impact"}
            </span>
            <p className="font-sans text-[12px] text-slate-800 font-medium leading-relaxed">
              {risk.potentialImpact}
            </p>
          </div>
        )}

        {risk.mitigationAdvisory && (
          <div className="p-3 bg-emerald-50/80 rounded-xl border border-emerald-200/80">
            <span className="font-sans text-[10.5px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1 mb-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              {t("feasi.mitigationPlaybook") || "Actionable Mitigation Playbook"}
            </span>
            <p className="font-sans text-[12px] text-emerald-950 font-medium leading-relaxed">
              {risk.mitigationAdvisory}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};


