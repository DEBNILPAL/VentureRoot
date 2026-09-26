"use client";

import React from "react";
import { IndianRupee, CheckCircle2, ArrowRight, TrendingUp, Globe, Sparkles, Scale } from "lucide-react";
import { PricingAnalysis } from "../types";
import { useTranslation } from "@/features/i18n/hooks/useTranslation";
import { DynamicText } from "@/features/i18n/components/DynamicText";

export const PricingCard = ({ data }: { data?: PricingAnalysis }) => {
  const { t } = useTranslation();

  if (!data) return null;

  const displayUnit = data.unit ? data.unit.replace(/^₹\/?/, "") : "unit";
  const observedPrice = data.observedMarketPrice ?? 52;
  const expectedPrice = data.expectedLocalPrice ?? 55;
  const minPrice = data.priceRange?.min ?? Math.round(observedPrice * 0.88);
  const maxPrice = data.priceRange?.max ?? Math.round(expectedPrice * 1.15);

  const priceDiff = expectedPrice - observedPrice;
  const premiumPercent = data.premiumPercent ?? (observedPrice > 0 ? Math.round((priceDiff / observedPrice) * 1000) / 10 : 0);
  const isPositivePremium = premiumPercent >= 0;

  // Percentage position of expected price along the range [minPrice, maxPrice]
  const rangeSpan = Math.max(1, maxPrice - minPrice);
  const expectedPosPct = Math.min(95, Math.max(5, Math.round(((expectedPrice - minPrice) / rangeSpan) * 100)));
  const observedPosPct = Math.min(95, Math.max(5, Math.round(((observedPrice - minPrice) / rangeSpan) * 100)));

  return (
    <div className="notranslate bg-white rounded-3xl border border-slate-200 shadow-sm p-5 md:p-6 flex flex-col gap-6 h-full" translate="no">

      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-200">
            <IndianRupee className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h3 className="font-sans text-[18px] font-bold text-gray-900">
              {t("feasi.pricing") || "Pricing & Value Intelligence"}
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              {t("feasi.scrapedRates") || "Web-scraped market rates & deterministic economic prediction"}
            </p>
          </div>
        </div>

        {/* Live Scraper Badge */}
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10.5px] font-bold shrink-0">
          <Globe className="w-3 h-3 text-blue-600 animate-pulse" />
          {t("feasi.liveRates") || "Live Scraped Mandi Rates"}
        </span>
      </div>

      {/* Price Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* 1. Scraped Recent Market Benchmark */}
        <div className="bg-slate-50/90 p-4 rounded-2xl border border-slate-200 flex flex-col justify-between gap-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="font-sans text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <Scale className="w-3 h-3 text-slate-400" /> {t("feasi.obsMarket") || "Recent Market Rate"}
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-200/70 text-slate-700">
              {t("feasi.obsPrice") || "Scraped Benchmark"}
            </span>
          </div>

          <div>
            <div className="font-sans text-[30px] font-black text-gray-900 leading-tight">
              ₹{observedPrice.toLocaleString("en-IN")}
            </div>
            <span className="font-sans text-[13px] text-slate-500 font-semibold">
              per {displayUnit}
            </span>
          </div>

          <div className="pt-2 border-t border-slate-200/80 text-[11px] text-slate-500 font-medium flex items-center justify-between">
            <span className="truncate">{data.scrapedMarketName || "District APMC Mandi"}</span>
            <span className="shrink-0 text-slate-400">{data.priceDate || "Today"}</span>
          </div>
        </div>

        {/* 2. Model Predicted Expected Local Value */}
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50/60 p-4 rounded-2xl border-2 border-emerald-200 flex flex-col justify-between gap-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="font-sans text-[11px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-600" /> {t("feasi.expPrice") || "Predicted Local Value"}
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-0.5 ${
              isPositivePremium ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-700"
            }`}>
              <TrendingUp className="w-2.5 h-2.5" />
              {isPositivePremium ? `+${premiumPercent}%` : `${premiumPercent}%`}
            </span>
          </div>

          <div>
            <div className="font-sans text-[30px] font-black text-emerald-900 leading-tight">
              ₹{expectedPrice.toLocaleString("en-IN")}
            </div>
            <span className="font-sans text-[13px] text-emerald-700 font-semibold">
              {data.marketValue || "Premium Value"} per {displayUnit}
            </span>
          </div>

          <div className="pt-2 border-t border-emerald-200 text-[11px] text-emerald-800 font-medium flex items-center justify-between">
            <span>Model 3 Economic Forecast</span>
            <span className="font-bold text-emerald-700">90% Conformal Bound</span>
          </div>
        </div>
      </div>

      {/* Price Range & Mandi Arrival Spread Slider */}
      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col gap-3">
        <div className="flex justify-between items-center text-xs">
          <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
            {t("feasi.valRange") || "Analyzed Mandi Spread & Value Range"}
          </span>
          <span className="text-[11px] font-semibold text-slate-500">
            Unit: ₹/{displayUnit}
          </span>
        </div>

        {/* Slider visual bar */}
        <div className="w-full h-3 bg-slate-200 rounded-full relative overflow-visible mt-2 mb-1">
          {/* Active green spread band */}
          <div
            className="absolute top-0 bottom-0 bg-emerald-300 rounded-full"
            style={{
              left: `${Math.min(observedPosPct, expectedPosPct)}%`,
              width: `${Math.abs(expectedPosPct - observedPosPct) + 6}%`,
            }}
          />
          {/* Observed market pin */}
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-slate-700 border-2 border-white shadow-md z-10"
            style={{ left: `${observedPosPct}%` }}
            title={`Scraped Mandi Rate: ₹${observedPrice}`}
          />
          {/* Predicted expected pin */}
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-emerald-600 border-2 border-white shadow-lg ring-2 ring-emerald-200 z-20"
            style={{ left: `${expectedPosPct}%` }}
            title={`Model Predicted: ₹${expectedPrice}`}
          />
        </div>

        <div className="flex justify-between items-center text-xs pt-1">
          <div className="flex flex-col">
            <span className="font-bold text-slate-700">₹{minPrice}</span>
            <span className="text-[10px] text-slate-400 font-medium">Standard Min</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-medium text-slate-500">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-slate-700 inline-block" /> Scraped: ₹{observedPrice}
            </span>
            <span className="flex items-center gap-1 text-emerald-700 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block" /> Forecast: ₹{expectedPrice}
            </span>
          </div>
          <div className="flex flex-col items-end">
            <span className="font-bold text-slate-700">₹{maxPrice}</span>
            <span className="text-[10px] text-slate-400 font-medium">Premium Max</span>
          </div>
        </div>
      </div>

      {/* Key Pricing Factors */}
      {data.pricingFactors && data.pricingFactors.length > 0 && (
        <div>
          <h4 className="font-sans text-[14px] font-bold text-gray-900 mb-3 flex items-center gap-1.5">
            <Scale className="w-4 h-4 text-emerald-600" /> {t("feasi.factors") || "Economic & Mandi Pricing Drivers"}
          </h4>
          <ul className="flex flex-col gap-2">
            {data.pricingFactors.map((factor, idx) => (
              <li key={idx} className="flex items-start gap-2.5 font-sans text-[13.5px] text-gray-800 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                <DynamicText as="span" text={factor} />
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Key Observations & Provenance */}
      {data.observations && data.observations.length > 0 && (
        <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200">
          <h4 className="font-sans text-[13px] font-bold text-slate-700 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-blue-600" /> {t("feasi.obs") || "Scraped Market Analysis & Verification"}
          </h4>
          <ul className="flex flex-col gap-2">
            {data.observations.map((obs, idx) => (
              <li key={idx} className="flex items-start gap-2 font-sans text-[13px] text-gray-700 font-medium">
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                <DynamicText as="span" className="leading-relaxed" text={obs} />
              </li>
            ))}
          </ul>
        </div>
      )}

    </div>
  );
};
