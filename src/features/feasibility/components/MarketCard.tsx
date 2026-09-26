"use client";

import React from "react";
import { Users, TrendingUp, Target, MapPin } from "lucide-react";
import { MarketAnalysis } from "../types";
import { useTranslation } from "@/features/i18n/hooks/useTranslation";
import { DynamicText } from "@/features/i18n/components/DynamicText";
import { LocationIntelligenceMap } from "@/features/location/components/LocationIntelligenceMap";

export const MarketCard = ({
  data,
  centerCoords,
  locationName,
  category,
  competitors,
}: {
  data?: MarketAnalysis;
  centerCoords?: [number, number];
  locationName?: string;
  category?: string;
  competitors?: any[];
}) => {
  const { t } = useTranslation();

  if (!data) return null;

  return (
    <>
      {/* 1. Location Intelligence (Map) - Full Width */}
      <div className="notranslate col-span-1 xl:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm p-5 md:p-6 flex flex-col gap-5" translate="no">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-vr-teal/10 flex items-center justify-center border border-vr-teal/20">
            <MapPin className="w-5 h-5 text-vr-teal" />
          </div>
          <h2 className="font-heading text-[28px] md:text-[32px] font-bold text-gray-900">
            {t("feasi.locationIntel") || "Location Intelligence"}
          </h2>
        </div>

        <div className="w-full rounded-2xl overflow-hidden border border-slate-200 relative min-h-[450px] bg-slate-50">
          <LocationIntelligenceMap
            center={centerCoords}
            locationName={locationName}
            category={category}
            competitors={competitors}
          />
        </div>
      </div>

      {/* 2. Market Demand (Stats) - Half Width */}
      <div className="notranslate col-span-1 bg-white rounded-3xl border border-slate-200 shadow-sm p-5 md:p-6 flex flex-col gap-6 h-full" translate="no">

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
            <Users className="w-5 h-5 text-slate-600" />
          </div>
          <h3 className="font-sans text-[18px] font-bold text-gray-900">
            {t("feasi.marketDemand") || t("feasi.market") || "Market Demand"}
          </h3>
        </div>

        {/* Population Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div className="font-sans text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
              <MapPin className="w-3 h-3" /> {t("feasi.pop5km") || "5km Reach"}
            </div>
            <div className="font-sans text-[22px] sm:text-[26px] font-bold text-gray-900">
              {data.reach.radius5km.toLocaleString("en-IN")}
            </div>
          </div>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div className="font-sans text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
              <MapPin className="w-3 h-3" /> {t("feasi.pop10km") || "10km Reach"}
            </div>
            <div className="font-sans text-[22px] sm:text-[26px] font-bold text-gray-900">
              {data.reach.radius10km.toLocaleString("en-IN")}
            </div>
          </div>
          {data.reach.radius20km ? (
            <div className="col-span-2 sm:col-span-1 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div className="font-sans text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                <MapPin className="w-3 h-3" /> {t("feasi.pop20km") || "20km Reach"}
              </div>
              <div className="font-sans text-[22px] sm:text-[26px] font-bold text-gray-900">
                {data.reach.radius20km.toLocaleString("en-IN")}
              </div>
            </div>
          ) : null}
        </div>

        {/* Customer Segments */}
        <div>
          <div className="font-sans text-[16px] font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Target className="w-5 h-5 text-vr-teal" /> {t("feasi.custSeg") || "Customer Segments"}
          </div>
          <ul className="flex flex-col gap-2.5">
            {(data.customerSegments || []).map((segment, idx) => (
              <li key={idx} className="flex items-start gap-2.5 font-sans text-[14px] text-gray-800 font-medium">
                <span className="w-2 h-2 rounded-full bg-vr-teal mt-1.5 shrink-0" />
                <DynamicText as="span" text={segment} />
              </li>
            ))}
          </ul>
        </div>

        {/* Market Trends */}
        <div>
          <div className="font-sans text-[16px] font-bold text-gray-900 mb-3 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-500" /> {t("feasi.trends") || "Market Trends"}
          </div>
          <ul className="flex flex-col gap-2.5">
            {(data.marketTrends || []).map((trend, idx) => (
              <li key={idx} className="flex items-start gap-2.5 font-sans text-[14px] text-gray-800 font-medium">
                <span className="w-2 h-2 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                <DynamicText as="span" text={trend} />
              </li>
            ))}
          </ul>
        </div>

      </div>
    </>
  );
};
