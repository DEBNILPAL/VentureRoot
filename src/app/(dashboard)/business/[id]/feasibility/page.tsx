"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { useParams } from "next/navigation";

import { FeasibilityStateBoundary } from "@/features/feasibility/components/FeasibilityStateBoundary";
import { MarketCard } from "@/features/feasibility/components/MarketCard";
import { OpportunityCard } from "@/features/feasibility/components/OpportunityCard";
import { CompetitionCard } from "@/features/feasibility/components/CompetitionCard";
import { SWOTCard } from "@/features/feasibility/components/SWOTCard";
import { MockDisclaimer } from "@/components/ui/mock-disclaimer";
import { RiskCard } from "@/features/feasibility/components/RiskCard";
import { PricingCard } from "@/features/feasibility/components/PricingCard";
import { PrismFluxLoader } from "@/components/ui/prism-flux-loader";

import { 
  FeasibilityData, 
  MarketAnalysis, 
  OpportunityAnalysis, 
  CompetitionAnalysis, 
  SWOTAnalysis, 
  RiskItem, 
  PricingAnalysis 
} from "@/features/feasibility/types";

import { useFeasibility } from "@/lib/data/feasibility";
import { useBusinessDetails, getUserScopeKey } from "@/lib/data/businesses";
import { getAuthoritativeCensusDensity } from "@/utils/feasibility.mapper";
import { resolveCoordinatesForLocation } from "@/services/location-search.service";
import { useTranslation } from "@/features/i18n/hooks/useTranslation";

export default function FeasibilityPage() {
  const params = useParams();
  const id = params?.id as string;
  const { t } = useTranslation();

  const { data: fetchedFeasibility, isLoading, error } = useFeasibility(id);
  const { data: businessDetails } = useBusinessDetails(id);
  const [feasibilityData, setFeasibilityData] = useState<FeasibilityData | null>(null);

  const rawLocation = useMemo(() => {
    if ((businessDetails as any)?.location) return (businessDetails as any).location;
    if ((fetchedFeasibility as any)?.business?.location) return (fetchedFeasibility as any).business.location;
    if ((fetchedFeasibility as any)?.feasibility?.business?.location) return (fetchedFeasibility as any).feasibility.business.location;
    if (typeof window !== "undefined") {
      try {
        const scopeKey = getUserScopeKey();
        const cached = localStorage.getItem(`ventureroot_businesses_${scopeKey}`);
        if (cached) {
          const list = JSON.parse(cached);
          const found = list.find((b: any) => b.id === id);
          if (found?.location) return found.location;
        }
      } catch (_) {}
    }
    return null;
  }, [businessDetails, fetchedFeasibility, id]);

  const resolvedLoc = useMemo(() => resolveCoordinatesForLocation(rawLocation), [rawLocation]);

  const centerCoords: [number, number] = useMemo(
    () => [resolvedLoc.lat, resolvedLoc.lon],
    [resolvedLoc]
  );

  const locationName = useMemo(() => {
    if (!rawLocation) return resolvedLoc.label || "Target Location";
    if (typeof rawLocation === "string") return rawLocation;
    const parts = [
      rawLocation.village,
      rawLocation.block || rawLocation.subdistrict,
      rawLocation.district,
      rawLocation.state,
    ].filter(Boolean);
    const unique = parts.filter((v, idx, arr) => arr.indexOf(v) === idx);
    return unique.join(", ") || resolvedLoc.label || "Target Location";
  }, [rawLocation, resolvedLoc]);

  const businessCategory = (businessDetails as any)?.category?.name || (businessDetails as any)?.category || "Enterprise";

  useEffect(() => {
    if (fetchedFeasibility) {
      // Resolve feasibility data payload
      const source = (fetchedFeasibility.market || fetchedFeasibility.pricing)
        ? fetchedFeasibility
        : (fetchedFeasibility.feasibility || fetchedFeasibility);

      // Compute authoritative census density for this location if reach numbers need reinforcement
      const density = getAuthoritativeCensusDensity((businessDetails as any)?.location, businessDetails);
      const default5km = Math.round(78.54 * density);
      const default10km = Math.round(314.16 * density);
      const default20km = Math.round(1256.64 * density);

      const market = source.market || {};
      const reach = market.reach || {};

      const populatedMarket: MarketAnalysis = {
        ...market,
        reach: {
          radius5km: reach.radius5km || default5km,
          radius10km: reach.radius10km || default10km,
          radius20km: reach.radius20km || default20km,
        },
      };

      const pricing = source.pricing || {};
      const populatedPricing: PricingAnalysis = {
        expectedLocalPrice: pricing.expectedLocalPrice ?? 55,
        observedMarketPrice: pricing.observedMarketPrice ?? 52,
        priceRange: pricing.priceRange || { min: 48, max: 62 },
        unit: pricing.unit || "₹/unit",
        marketValue: pricing.marketValue || "Above Average",
        observations: pricing.observations || [],
        pricingFactors: pricing.pricingFactors || [],
        ...pricing,
      };

      setFeasibilityData({
        status: source.status || "SUCCESS",
        market: populatedMarket,
        opportunity: (source.opportunity || {}) as OpportunityAnalysis,
        competition: (source.competition || {}) as CompetitionAnalysis,
        swot: (source.swot || {}) as unknown as SWOTAnalysis,
        risks: (source.risks || []) as RiskItem[],
        pricing: populatedPricing,
      });
    }
  }, [fetchedFeasibility, businessDetails]);

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center p-12">
        <div className="flex flex-col items-center gap-4 text-center">
          <PrismFluxLoader size={38} speed={4} />
          <p className="font-sans text-[15px] font-medium text-slate-500">
            Running market intelligence analysis…
          </p>
        </div>
      </div>
    );
  }

  if (error || (!isLoading && !feasibilityData)) {
    return (
      <div className="w-full h-full flex items-center justify-center p-12">
        <div className="flex flex-col items-center gap-4 text-center max-w-md">
          <div className="text-4xl">⚠️</div>
          <h2 className="font-heading text-[22px] font-bold text-slate-800">Analysis Unavailable</h2>
          <p className="font-sans text-[14px] text-slate-500">
            {error?.message || "The ML analysis service is not running. Please start the Python model services (Model 1 on port 8001, Model 2 on port 8002) and try again."}
          </p>
          <Link href={`/business/${id}`} className="mt-2 px-4 py-2 bg-[#1E6702] text-white rounded-lg font-sans text-[14px] font-semibold hover:bg-[#185a02] transition-colors">
            Back to Business
          </Link>
        </div>
      </div>
    );
  }

  if (!feasibilityData) return null;

  // Derive composite confidence from Opportunity score (or mock average)
  const compositeConfidence = feasibilityData.opportunity?.confidence?.score || 84;

  return (
    <div className="w-full h-full p-4 md:p-6 lg:p-8 flex flex-col gap-6 bg-background font-sans">
      <main className="flex-1 w-full max-w-full flex flex-col gap-6">
        
        {/* Header Section */}
        <div className="notranslate mb-4 sm:mb-6" translate="no">
          <div className="flex items-center gap-2 mb-2 sm:mb-3 min-w-0 max-w-full">
            <Link
              href="/feasibility"
              className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white hover:bg-emerald-50 text-slate-700 hover:text-[#1E6702] border border-slate-200 transition-all active:scale-95 shadow-xs shrink-0"
              title="Back to Feasibility Hub"
              aria-label="Back to Feasibility Hub"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold text-slate-500 overflow-x-auto no-scrollbar whitespace-nowrap py-1 min-w-0 flex-1">
              <Link href="/feasibility" className="hover:text-[#1E6702] transition-colors hover:underline shrink-0">
                {t("nav.feasibility") || "Feasibility"}
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 opacity-60 shrink-0" />
              <Link href={`/business/${id}`} className="hover:text-[#1E6702] transition-colors hover:underline shrink-0">
                {businessDetails?.name || "Business"}
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 opacity-60 shrink-0" />
              <span className="text-slate-800 font-bold shrink-0">{t("feasi.bizIntel") || "Business Intelligence"}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <h1 className="font-heading text-[24px] sm:text-[32px] font-bold text-[#242424] tracking-tight leading-tight flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
                <span>{t("feasi.bizIntel") || "Business Intelligence"}</span>
                {businessDetails?.name && (
                  <>
                    <span className="text-slate-400 font-normal">-</span>
                    <span className="italic font-serif font-medium text-slate-600 text-lg sm:text-[24px]">
                      {businessDetails.name}
                    </span>
                  </>
                )}
              </h1>
              <p className="font-sans text-[13px] sm:text-[14px] text-slate-500 font-medium mt-0.5">
                {t("feasi.bizIntelSub") || "Hyper-local market demand, competitor positioning, and feasibility intelligence."}
              </p>
            </div>
            
            <div className="flex flex-wrap gap-2 mt-1 sm:mt-0 shrink-0">
              <Link href={`/business/${id}/finance`} className="px-3.5 py-1.5 sm:px-4 sm:py-2 bg-surface text-primary border border-slate-200 font-sans text-[13px] sm:text-[14px] font-semibold rounded-full shadow-sm hover:bg-slate-50 transition-colors">
                ₹ {t("nav.finance") || "Finance"}
              </Link>
              <Link href={`/business/${id}/roadmap`} className="px-3.5 py-1.5 sm:px-4 sm:py-2 bg-surface text-vr-red border border-slate-200 font-sans text-[13px] sm:text-[14px] font-semibold rounded-full shadow-sm hover:bg-slate-50 transition-colors">
                ⊕ {t("nav.roadmap") || "Roadmap"}
              </Link>
            </div>
          </div>
        </div>

        <FeasibilityStateBoundary status={feasibilityData.status}>
          {/* Stats Banner */}
          {/* Stats Banner (Mobile Responsive Grid) */}
          <div className="notranslate bg-[#81cc87] rounded-2xl p-3.5 sm:p-5 grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-2.5 sm:gap-3.5 mb-6 shadow-xs" translate="no">
            <div className="flex flex-col gap-0.5 bg-[#3c8a45] p-3 rounded-xl min-w-0 shadow-xs">
              <span className="font-sans text-[11px] font-bold text-white uppercase tracking-wider truncate">{t("feasi.pop5km") || "5KM Population"}</span>
              <div className="font-sans text-xl sm:text-2xl font-bold text-white truncate">
                {(feasibilityData.market?.reach?.radius5km ?? 12450).toLocaleString("en-IN")}
              </div>
            </div>

            <div className="flex flex-col gap-0.5 bg-[#3c8a45] p-3 rounded-xl min-w-0 shadow-xs">
              <span className="font-sans text-[11px] font-bold text-white uppercase tracking-wider truncate">{t("feasi.pop10km") || "10KM Population"}</span>
              <div className="font-sans text-xl sm:text-2xl font-bold text-white truncate">
                {(feasibilityData.market?.reach?.radius10km ?? 48200).toLocaleString("en-IN")}
              </div>
            </div>

            <div className="flex flex-col gap-0.5 bg-[#3c8a45] p-3 rounded-xl min-w-0 shadow-xs">
              <span className="font-sans text-[11px] font-bold text-white uppercase tracking-wider truncate">{t("feasi.pop20km") || "20KM Population"}</span>
              <div className="font-sans text-xl sm:text-2xl font-bold text-white truncate">
                {(
                  feasibilityData.market?.reach?.radius20km ||
                  (feasibilityData.market?.reach?.radius10km ? Math.round(feasibilityData.market.reach.radius10km * 4.0) : 192800)
                ).toLocaleString("en-IN")}
              </div>
            </div>

            <div className="flex flex-col gap-0.5 bg-[#3c8a45] p-3 rounded-xl min-w-0 shadow-xs">
              <span className="font-sans text-[11px] font-bold text-white uppercase tracking-wider truncate">{t("feasi.obsPrice") || "Observed Price"}</span>
              <div className="font-sans text-xl sm:text-2xl font-bold text-white truncate flex items-baseline gap-1">
                ₹{feasibilityData.pricing?.observedMarketPrice ?? 52}{" "}
                <span className="font-sans text-[11px] text-white/90 font-medium">
                  /{feasibilityData.pricing?.unit ? feasibilityData.pricing.unit.replace(/^₹\/?/, "") : "unit"}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-0.5 bg-[#3c8a45] p-3 rounded-xl min-w-0 shadow-xs">
              <span className="font-sans text-[11px] font-bold text-white uppercase tracking-wider truncate">{t("feasi.expPrice") || "Expected Price"}</span>
              <div className="font-sans text-xl sm:text-2xl font-bold text-white truncate flex items-center gap-1">
                <span>₹{feasibilityData.pricing?.expectedLocalPrice ?? 55}</span>
                <span className="font-sans text-[9px] font-bold uppercase tracking-wider bg-white text-[#3c8a45] rounded-full px-1.5 py-0.5 shrink-0">
                  ▲
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-0.5 bg-[#3c8a45] p-3 rounded-xl min-w-0 col-span-2 sm:col-span-1 shadow-xs">
              <span className="font-sans text-[11px] font-bold text-white uppercase tracking-wider truncate">{t("feasi.confScore") || "Confidence"}</span>
              <div className="font-sans text-xl sm:text-2xl font-bold text-white flex items-baseline gap-1">
                {compositeConfidence} <span className="font-sans text-[11px] text-white/90 font-medium">/100</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 pb-16 items-start">
            
            {/* Market is full width (Map) + half width (Stats), MarketCard returns a fragment */}
            <MarketCard
              data={feasibilityData.market}
              centerCoords={centerCoords}
              locationName={locationName}
              category={businessCategory}
              competitors={feasibilityData.competition?.competitors}
            />

            <div className="col-span-1 h-full">
              <OpportunityCard data={feasibilityData.opportunity} />
            </div>

            <div className="col-span-1 h-full">
              <PricingCard data={feasibilityData.pricing} />
            </div>
            
            <div className="col-span-1 h-full">
              <RiskCard data={feasibilityData.risks} />
            </div>

            <div className="col-span-1 xl:col-span-2">
              <CompetitionCard
                data={feasibilityData.competition}
                centerCoords={centerCoords}
                businessName={(businessDetails as any)?.name || "Your Venture"}
                category={businessCategory}
                locationName={locationName}
                competitorRadar={
                  (fetchedFeasibility as any)?.competitorRadar ||
                  (fetchedFeasibility as any)?.feasibility?.competitorRadar ||
                  (feasibilityData as any)?.competitorRadar ||
                  null
                }
              />
            </div>

            <div className="col-span-1 xl:col-span-2">
              <SWOTCard data={feasibilityData.swot} />
            </div>

          </div>
        </FeasibilityStateBoundary>
      </main>
    </div>
  );
}
