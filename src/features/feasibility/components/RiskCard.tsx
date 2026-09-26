"use client";

import React, { useState, useMemo } from "react";
import {
  AlertTriangle, ShieldCheck, TrendingDown,
  Truck, Wrench, FileText, DollarSign, CloudRain, Zap,
  CheckCircle2, AlertOctagon, ChevronDown
} from "lucide-react";
import { RiskItem } from "../types";
import { useTranslation } from "@/features/i18n/hooks/useTranslation";
import { DynamicText } from "@/features/i18n/components/DynamicText";

export const RiskCard = ({ data }: { data?: RiskItem[] }) => {
  const { t } = useTranslation();

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

  // Define the core risk angles
  const angleDefinitions = useMemo(() => [
    {
      id: "market",
      title: t("feasi.angleMarket") || "Market & Demand",
      description: "Customer purchasing patterns, price sensitivity, demand elasticity & competitor dynamics",
      icon: TrendingDown,
      iconColor: "text-blue-600 bg-blue-50 border-blue-200",
      matcher: (r: RiskItem) => {
        const s = `${r.angle || ""} ${r.category || ""}`.toLowerCase();
        return s.includes("market") || s.includes("demand") || s.includes("compet");
      },
    },
    {
      id: "supply",
      title: t("feasi.angleSupply") || "Supply Chain",
      description: "Input commodity costs, supplier dependencies, transport bottlenecks & procurement stability",
      icon: Truck,
      iconColor: "text-amber-600 bg-amber-50 border-amber-200",
      matcher: (r: RiskItem) => {
        const s = `${r.angle || ""} ${r.category || ""}`.toLowerCase();
        return s.includes("supply") || s.includes("logistics") || s.includes("vendor") || s.includes("procurement");
      },
    },
    {
      id: "operational",
      title: t("feasi.angleOperational") || "Operational",
      description: "Day-to-day processing, equipment downtime, technical workflows & labor retention",
      icon: Wrench,
      iconColor: "text-indigo-600 bg-indigo-50 border-indigo-200",
      matcher: (r: RiskItem) => {
        const s = `${r.angle || ""} ${r.category || ""}`.toLowerCase();
        return s.includes("operat") || s.includes("equipment") || s.includes("labor") || s.includes("workforce");
      },
    },
    {
      id: "regulatory",
      title: t("feasi.angleRegulatory") || "Regulatory",
      description: "FSSAI & food standards, statutory registrations, tax compliance & environmental laws",
      icon: FileText,
      iconColor: "text-purple-600 bg-purple-50 border-purple-200",
      matcher: (r: RiskItem) => {
        const s = `${r.angle || ""} ${r.category || ""}`.toLowerCase();
        return s.includes("regulat") || s.includes("statut") || s.includes("legal") || s.includes("compliance") || s.includes("policy") || s.includes("license");
      },
    },
    {
      id: "financial",
      title: t("feasi.angleFinancial") || "Financial & Cash Flow",
      description: "Working capital liquidity, debtor payment turnaround, margin compression & debt coverage",
      icon: DollarSign,
      iconColor: "text-emerald-600 bg-emerald-50 border-emerald-200",
      matcher: (r: RiskItem) => {
        const s = `${r.angle || ""} ${r.category || ""}`.toLowerCase();
        return s.includes("financ") || s.includes("cash") || s.includes("capital") || s.includes("margin") || s.includes("debt") || s.includes("cost");
      },
    },
    {
      id: "climate",
      title: t("feasi.angleClimate") || "Climate & Seasonal",
      description: "Monsoon impacts, extreme weather anomalies, seasonal perishability & temperature stress",
      icon: CloudRain,
      iconColor: "text-cyan-600 bg-cyan-50 border-cyan-200",
      matcher: (r: RiskItem) => {
        const s = `${r.angle || ""} ${r.category || ""}`.toLowerCase();
        return s.includes("climat") || s.includes("season") || s.includes("weather") || s.includes("environ");
      },
    },
  ], [t]);

  // Group risks by angle definition
  const groupedAngles = useMemo(() => {
    const matchedRiskIds = new Set<string>();

    const standardGroups = angleDefinitions.map((angle) => {
      const items = risks.filter((r) => {
        const matches = angle.matcher(r);
        if (matches) matchedRiskIds.add(r.id);
        return matches;
      });

      return {
        ...angle,
        items,
      };
    });

    // Capture any risks that did not match standard angle filters
    const remainingRisks = risks.filter((r) => !matchedRiskIds.has(r.id));
    if (remainingRisks.length > 0) {
      standardGroups.push({
        id: "other",
        title: "Additional Risk Vectors",
        description: "Specialized enterprise and sector-specific risk considerations",
        icon: AlertTriangle,
        iconColor: "text-rose-600 bg-rose-50 border-rose-200",
        matcher: () => true,
        items: remainingRisks,
      });
    }

    return standardGroups;
  }, [risks, angleDefinitions]);

  // State to track which angles are expanded (all non-expanded / collapsed by default)
  const [openAngles, setOpenAngles] = useState<Record<string, boolean>>({});

  const toggleAngle = (id: string) => {
    setOpenAngles((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const allExpanded = useMemo(() => {
    return groupedAngles.every((g) => openAngles[g.id]);
  }, [groupedAngles, openAngles]);

  const toggleAll = () => {
    const nextState = !allExpanded;
    const updated: Record<string, boolean> = {};
    groupedAngles.forEach((g) => {
      updated[g.id] = nextState;
    });
    setOpenAngles(updated);
  };

  if (!data || data.length === 0) return null;

  return (
    <div className="notranslate bg-white rounded-3xl border border-slate-200 shadow-sm p-5 md:p-6 flex flex-col gap-6 h-full" translate="no">

      {/* Header with Severity Breakdown and Expand All toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-rose-50 flex items-center justify-center border border-rose-200 text-rose-600 shadow-xs shrink-0">
            <AlertOctagon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-sans text-[18px] font-bold text-gray-900 leading-snug">
              {t("feasi.riskAnalysis") || t("feasi.risk") || "Risk & Mitigation Assessment"}
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              {t("feasi.riskSubtitle") || "Comprehensive vulnerability evaluation & financial exposure analysis"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap sm:justify-end">
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

          {/* Quick toggle all */}
          <button
            type="button"
            onClick={toggleAll}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors shrink-0"
          >
            {allExpanded ? "Collapse All" : "Expand All"}
          </button>
        </div>
      </div>

      {/* Heading-wise Disclosure Accordion List */}
      <div className="flex flex-col gap-3.5">
        {groupedAngles.map((angle) => {
          const isOpen = !!openAngles[angle.id];
          const Icon = angle.icon;
          const hasCritical = angle.items.some((i) => i.severity === "Critical");
          const hasHigh = angle.items.some((i) => i.severity === "High");

          return (
            <div
              key={angle.id}
              className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                isOpen
                  ? "border-slate-300 shadow-xs bg-slate-50/40"
                  : "border-slate-200 hover:border-slate-300 bg-white"
              }`}
            >
              {/* Disclosure Heading Button */}
              <button
                type="button"
                onClick={() => toggleAngle(angle.id)}
                aria-expanded={isOpen}
                className="w-full px-4 sm:px-5 py-3.5 flex items-center justify-between gap-3 text-left transition-colors hover:bg-slate-50/80 focus:outline-none"
              >
                {/* Left: Icon & Angle Information */}
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center border shrink-0 ${angle.iconColor}`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-sans text-[15px] sm:text-[16px] font-bold text-gray-900 leading-tight">
                        {angle.title}
                      </h4>
                      {angle.items.length > 0 ? (
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                          {angle.items.length} {angle.items.length === 1 ? "Risk" : "Risks"}
                        </span>
                      ) : (
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          0 Risks
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 font-medium truncate mt-0.5 max-w-md">
                      {angle.description}
                    </p>
                  </div>
                </div>

                {/* Right: Severity Badges & Animated Chevron Arrow */}
                <div className="flex items-center gap-2.5 shrink-0">
                  {hasCritical && (
                    <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                      Critical
                    </span>
                  )}
                  {hasHigh && !hasCritical && (
                    <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 border border-orange-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-600" />
                      High
                    </span>
                  )}

                  {/* Disclosure Arrow */}
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center transition-transform duration-200 ${
                      isOpen
                        ? "rotate-180 bg-slate-200/70 text-slate-800"
                        : "rotate-0 bg-slate-100/70 text-slate-500 hover:bg-slate-200"
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </button>

              {/* Expandable Disclosure Content */}
              {isOpen && (
                <div className="px-4 sm:px-5 pb-5 pt-2 border-t border-slate-100 flex flex-col gap-3.5 bg-white/60">
                  {angle.items.length === 0 ? (
                    <div className="py-5 px-4 rounded-xl bg-slate-50/70 border border-dashed border-slate-200 flex items-center gap-3">
                      <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-slate-700">
                          No Critical Vulnerabilities Identified
                        </p>
                        <p className="text-[11.5px] text-slate-500 mt-0.5">
                          Parameters for {angle.title.toLowerCase()} reflect stable baseline conditions with no immediate mitigations required.
                        </p>
                      </div>
                    </div>
                  ) : (
                    angle.items.map((risk) => (
                      <RiskItemComponent key={risk.id} risk={risk} />
                    ))
                  )}
                </div>
              )}
            </div>
          );
        })}
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
            <h4 className="font-sans text-[16px] font-bold text-gray-900 leading-snug">
              <DynamicText text={risk.title} />
            </h4>
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
          <span className="font-black text-rose-700">
            <DynamicText text={risk.financialExposure} />
          </span>
        </div>
      )}

      {/* Analytical Diagnosis */}
      <p className="font-sans text-[13.5px] text-gray-800 font-medium leading-relaxed pl-2">
        <DynamicText text={risk.explanation} />
      </p>

      {/* Impact and Mitigation Advisory Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-2 pt-1 border-t border-slate-200/60">
        {risk.potentialImpact && (
          <div className="p-3 bg-white/70 rounded-xl border border-slate-200/70">
            <span className="font-sans text-[10.5px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              {t("feasi.impact") || "Potential Operational Impact"}
            </span>
            <p className="font-sans text-[12px] text-slate-800 font-medium leading-relaxed">
              <DynamicText text={risk.potentialImpact} />
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
              <DynamicText text={risk.mitigationAdvisory} />
            </p>
          </div>
        )}
      </div>
    </div>
  );
};


