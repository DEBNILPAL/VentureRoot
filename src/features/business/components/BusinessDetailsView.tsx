"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Map, Activity, ArrowRight, ArrowLeft, TrendingUp, ChevronRight, Check,
  ShieldAlert, FileText, Compass, IndianRupee, Layers, BarChart2,
  Wrench, Building, Users, Zap, AlertTriangle, ShieldCheck, Briefcase, Edit3, Trash2
} from "lucide-react";
import { EditorialDonutChart, FinancialTrajectoryAreaChart } from "@/components/ui/charts";
import { useBusinessDetails } from "@/lib/data/businesses";
import { useParams, useRouter } from "next/navigation";
import { DashboardBackground } from "@/components/layout/DashboardBackground";
import { DeleteBusinessModal } from "@/features/business/components/DeleteBusinessModal";
import { useTranslation } from "@/features/i18n/hooks/useTranslation";
import { getDynamicBusinessResources } from "@/services/business-resources.service";
import { calculateFinancialTrajectory } from "@/services/financial-trajectory.service";

export interface BusinessDetails {
  id: string;
  name: string;
  category: string;
  subcategory?: string;
  description?: string;
  status: "Draft" | "Analyzing" | "Ready";
  location: { state: string; district: string; block?: string; village?: string; };
  capital: { availableMargin: number; workingCapital?: number; expectedInvestment?: number; };
  operations: { expectedRevenue: number; expectedPrice?: number; productionQuantity?: number; };
  resources: { land?: string; equipment?: string; existingResources?: string; };
}

const compactCurrencyFormatter = (value: any) => {
  if (typeof value !== 'number') return value;
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(0)}k`;
  return `₹${value}`;
};

export const BusinessDetailsView = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string || "";
  const { data: fetchedBusiness, isLoading } = useBusinessDetails(id);
  const [business, setBusiness] = useState<BusinessDetails | null>(null);
  const [trajectoryScenario, setTrajectoryScenario] = useState<"base" | "conservative">("base");
  const [resourceTab, setResourceTab] = useState<"land" | "equipments" | "growth">("land");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    if (fetchedBusiness) {
      const normalized: BusinessDetails = {
        ...fetchedBusiness,
        id: fetchedBusiness.id,
        name: fetchedBusiness.name || "Business Venture",
        category: (fetchedBusiness.category as any)?.name || fetchedBusiness.category || "General Enterprise",
        description: fetchedBusiness.description || "Enterprise details and feasibility analysis.",
        status: (fetchedBusiness.status as any) || "Draft",
        location: fetchedBusiness.location || { state: "Local", district: "Region" },
        capital: {
          availableMargin: fetchedBusiness.capital?.availableMargin ?? Number((fetchedBusiness as any).availableMargin) ?? 0,
          workingCapital: fetchedBusiness.capital?.workingCapital ?? Math.round((Number((fetchedBusiness as any).availableMargin) || 0) * 0.4),
          expectedInvestment: fetchedBusiness.capital?.expectedInvestment ?? Number((fetchedBusiness as any).availableMargin) ?? 0,
        },
        operations: {
          expectedRevenue: fetchedBusiness.operations?.expectedRevenue ?? Number((fetchedBusiness as any).expectedRevenue) ?? 0,
          expectedPrice: fetchedBusiness.operations?.expectedPrice ?? 50,
          productionQuantity: fetchedBusiness.operations?.productionQuantity ?? 1000,
        },
        resources: {
          existingResources: fetchedBusiness.resources?.existingResources ?? (fetchedBusiness as any).existingResources ?? "Facilities & equipment",
        },
      };
      setBusiness(normalized);
    }
  }, [fetchedBusiness]);

  const dynamicResources = useMemo(() => {
    if (!business) return null;
    return getDynamicBusinessResources({
      category: business.category,
      businessName: business.name,
      location: business.location,
      availableMargin: business.capital.availableMargin,
      expectedRevenue: business.operations.expectedRevenue,
      existingResources: business.resources.existingResources,
    });
  }, [business]);

  const financialTrajectory = useMemo(() => {
    if (!business) return null;
    return calculateFinancialTrajectory({
      expectedMonthlyRevenue: business.operations.expectedRevenue,
      availableMargin: business.capital.availableMargin,
      category: business.category,
      scenario: trajectoryScenario,
    });
  }, [business, trajectoryScenario]);

  if (isLoading) {
    return (
      <div className="w-full h-full p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-[#1E6702] border-t-transparent rounded-full animate-spin" />
          <p className="font-sans text-sm text-slate-500 font-medium">Loading venture details...</p>
        </div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="w-full h-full p-4 md:p-6 lg:p-8 flex flex-col items-center justify-center min-h-[450px]">
        <div className="max-w-md w-full bg-[#fffff5] rounded-2xl border border-gray-900/10 p-8 shadow-lg text-center flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#1E6702]/10 flex items-center justify-center text-[#1E6702]">
            <Compass className="w-8 h-8" />
          </div>
          <h2 className="font-heading text-[22px] font-bold text-slate-900">Venture Not Found</h2>
          <p className="font-sans text-sm text-slate-500">
            This venture plan could not be found or you haven't created a business plan yet.
          </p>
          <Link
            href="/business/create"
            className="mt-2 px-6 py-3 bg-[#1E6702] hover:bg-[#164e01] text-white font-semibold rounded-xl shadow-md transition-all duration-200"
          >
            Create New Venture
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full p-3.5 sm:p-6 lg:p-8 flex flex-col gap-5 sm:gap-6 relative z-10">

      <div className="flex flex-col gap-6 relative z-10 w-full">
        {/* HEADER */}
        <div className="flex flex-col gap-2 w-full text-[#402a03] mb-4">
          {/* Back Arrow Button & Breadcrumb Path */}
          <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
            <Link
              href="/business"
              aria-label="Back to all businesses"
              title="Back to all businesses"
              className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white hover:bg-emerald-50 text-slate-700 hover:text-[#1E6702] border border-slate-200 hover:border-[#1E6702]/40 shadow-xs hover:shadow-sm transition-all active:scale-95 shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>

            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
              <Link
                href="/business"
                className="hover:text-[#1E6702] transition-colors hover:underline"
              >
                My Registered Businesses
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 opacity-60" />
              <span className="text-slate-800 font-bold truncate max-w-[220px] sm:max-w-none">{business.name}</span>
            </div>
          </div>

          <span className="font-sans text-[11px] font-bold uppercase tracking-wider text-[#402a03]/70">
            {business.category} • {business.subcategory || 'DAIRY FARMING'}
          </span>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-4">
              <h1 className="font-heading text-[24px] sm:text-[32px] font-bold text-[#402a03] tracking-tight leading-tight">
                {business.name}
              </h1>
              <span className="px-2.5 py-1 rounded-full bg-[#402a03]/10 font-sans text-[12px] font-bold text-[#402a03] flex items-center gap-1.5 shadow-sm border border-[#402a03]/20">
                <div className="w-1.5 h-1.5 rounded-full bg-[#402a03] animate-pulse"></div> {business.status}
              </span>
            </div>
            <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
              <Link
                href={`/business/${business.id}/edit`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-emerald-50 text-slate-700 hover:text-[#1E6702] border border-slate-200 hover:border-emerald-300 shadow-xs text-xs sm:text-sm font-bold transition-all active:scale-95"
              >
                <Edit3 className="w-4 h-4 text-[#1E6702]" />
                <span>Edit Details</span>
              </Link>
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 shadow-xs text-xs sm:text-sm font-bold transition-all active:scale-95 cursor-pointer"
                title="Delete Venture"
              >
                <Trash2 className="w-4 h-4 text-rose-600" />
                <span>Delete</span>
              </button>
            </div>
          </div>
          <p className="font-sans text-[14px] text-[#402a03]/80 font-medium mt-0.5">
            {business.description || "A small-scale commercial dairy farm focusing on high-yield buffalo milk production for local cooperative supply."}
          </p>
        </div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch mt-2">

          {/* LEFT: BUSINESS SNAPSHOT */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-sans text-[11px] font-bold uppercase tracking-wider text-black-500">
                Business Snapshot <span className="text-black mx-1">•</span> Key operational parameters
              </h2>
              <span className="font-sans text-[11px] font-bold text-teal-600 bg-teal-50 px-2.5 py-1 rounded-md">Live Model</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
              {/* Capital Card */}
              <div className="bg-[#fffff5] rounded-xl border border-gray-900/8 shadow-[0_4px_24px_rgb(0,0,0,0.05)] p-5 flex flex-col relative overflow-hidden transition-all duration-300">
                <div className="absolute top-0 left-0 right-0 h-1 bg-orange-400"></div>
                <div className="flex items-center justify-between mb-6 mt-1">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-full bg-orange-50 text-orange-600"><IndianRupee className="w-4 h-4" /></div>
                    <span className="font-heading text-[20px] font-bold text-slate-800 tracking-tight">Capital</span>
                  </div>
                  <span className="font-sans text-[11px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded tracking-wider">FUNDED</span>
                </div>
                <div className="flex flex-col gap-6">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-sans text-[12px] font-medium text-slate-500">Available equity</span>
                      <span className="font-sans text-[12px] font-bold text-orange-600">Self-funded</span>
                    </div>
                    <span className="font-sans text-[24px] font-bold text-slate-900 tracking-tight">₹{business.capital.availableMargin?.toLocaleString('en-IN') || "1,50,000"}</span>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-sans text-[12px] font-medium text-slate-500">Expected investment</span>
                      <span className="font-sans text-[14px] font-bold text-slate-800 tracking-tight">₹{business.capital.expectedInvestment?.toLocaleString('en-IN') || "8,00,000"}</span>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="font-sans text-[11px] text-slate-400 font-medium">18.75% covered</span>
                      <span className="font-sans text-[11px] text-slate-400 font-medium">₹6.5L debt gap</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Operations Card */}
              <div className="bg-[#fffff5] rounded-xl border border-gray-900/8 shadow-[0_4px_24px_rgb(0,0,0,0.05)] p-5 flex flex-col relative overflow-hidden transition-all duration-300">
                <div className="absolute top-0 left-0 right-0 h-1 bg-[#402a03]"></div>
                <div className="flex items-center justify-between mb-6 mt-1">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-full bg-[#402a03]/10 text-[#402a03]"><Activity className="w-4 h-4" /></div>
                    <span className="font-heading text-[20px] font-bold text-slate-800 tracking-tight">Operations</span>
                  </div>
                  <span className="font-sans text-[11px] font-bold text-[#402a03] bg-[#402a03]/10 px-2 py-0.5 rounded border border-[#402a03]/20 tracking-wider">+12% baseline</span>
                </div>
                <div className="flex flex-col gap-6">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-sans text-[12px] font-medium text-slate-500">Target monthly revenue</span>
                    </div>
                    <span className="font-sans text-[24px] font-bold text-slate-900 tracking-tight">₹{business.operations.expectedRevenue?.toLocaleString('en-IN') || "45,000"}</span>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-sans text-[12px] font-medium text-slate-500">Production volume</span>
                    </div>
                    <span className="font-sans text-[14px] font-bold text-slate-800">{business.operations.productionQuantity || "30"} units / day</span>
                    <span className="font-sans text-[12px] text-slate-400 font-medium block mt-1">
                      {business.category} capacity for ₹{Number(business.operations.expectedRevenue || 50000).toLocaleString('en-IN')}/mo target
                    </span>
                  </div>
                </div>
              </div>

              {/* Resources Card - Dynamic Multi-Tab Module */}
              <div className="bg-[#fffff5] rounded-xl border border-gray-900/8 shadow-[0_4px_24px_rgb(0,0,0,0.05)] p-5 flex flex-col relative overflow-hidden transition-all duration-300">
                <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-600"></div>
                <div className="flex items-center justify-between mb-4 mt-1">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-full bg-emerald-50 text-emerald-700"><Layers className="w-4 h-4" /></div>
                    <span className="font-heading text-[18px] font-bold text-slate-800 tracking-tight">Resources & Assets</span>
                  </div>
                  <span className="font-sans text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 tracking-wider">
                    {business.category} Model
                  </span>
                </div>

                {/* Resource Category Tabs */}
                <div className="flex items-center gap-1.5 mb-4 bg-slate-100/70 p-1 rounded-lg">
                  {[
                    { id: "land", label: t("biz.landFacility") || "Land & Facility" },
                    { id: "equipments", label: t("biz.machinery") || "Machinery" },
                    { id: "growth", label: t("biz.growthResources") || "Growth Resources" },
                  ].map(({ id, label }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setResourceTab(id as typeof resourceTab)}
                      className={`flex-1 py-1 px-1.5 rounded-md text-[11px] font-bold transition-all ${
                        resourceTab === id
                          ? "bg-white text-slate-900 shadow-xs"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                {/* Tab 1: Land & Facility */}
                {resourceTab === "land" && (
                  <div className="flex flex-col gap-3 text-xs animate-in fade-in duration-200">
                    <div>
                      <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Required Area</span>
                      <span className="font-bold text-slate-900 text-[13px]">{dynamicResources?.land.requiredArea}</span>
                    </div>
                    <div>
                      <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Estimated Land Valuation / Lease</span>
                      <span className="font-bold text-emerald-700 text-[12.5px]">{dynamicResources?.land.valuation}</span>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Tenure & Regulatory Norm</span>
                      <p className="text-[11px] text-slate-700 leading-relaxed font-medium">
                        {dynamicResources?.land.tenureType} • {dynamicResources?.land.zoning}
                      </p>
                    </div>
                  </div>
                )}

                {/* Tab 2: Core Machinery & Equipment */}
                {resourceTab === "equipments" && (
                  <div className="flex flex-col gap-2 max-h-[170px] overflow-y-auto pr-1 text-xs animate-in fade-in duration-200">
                    <div className="flex items-center justify-between pb-1 mb-1 border-b border-slate-100">
                      <span className="text-[10.5px] font-bold text-slate-500">Core Machinery</span>
                      <span className="text-[11px] font-black text-slate-900">Total ₹{dynamicResources?.totalEquipmentCost.toLocaleString('en-IN')}</span>
                    </div>
                    {dynamicResources?.equipments.map((eq: any, i: number) => (
                      <div key={i} className="p-2 bg-slate-50/80 rounded-lg border border-slate-100 flex items-center justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <span className="font-bold text-slate-800 text-[11px] block truncate">{eq.name}</span>
                          <span className={`text-[9.5px] font-semibold px-1.5 py-0.2 rounded-full border inline-block ${
                            eq.priority === "Essential" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-blue-50 text-blue-700 border-blue-200"
                          }`}>
                            {eq.priority}
                          </span>
                        </div>
                        <span className="font-bold text-[11px] text-slate-900 shrink-0">₹{eq.estimatedCost.toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Tab 3: Growth & Scaling Resources */}
                {resourceTab === "growth" && (
                  <div className="flex flex-col gap-2.5 text-xs animate-in fade-in duration-200">
                    <div>
                      <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Human Capital Needed</span>
                      <span className="text-slate-800 text-[11.5px] font-medium leading-relaxed">{dynamicResources?.growthResources.humanCapital}</span>
                    </div>
                    <div>
                      <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">3-Phase Power & Utilities</span>
                      <span className="text-slate-800 text-[11.5px] font-medium leading-relaxed">{dynamicResources?.growthResources.powerAndUtilities}</span>
                    </div>
                    <div>
                      <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Working Capital Buffer</span>
                      <span className="text-emerald-700 text-[11.5px] font-bold">{dynamicResources?.growthResources.workingCapitalReserve}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: LOCATION */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-sans text-[11px] font-bold uppercase tracking-wider text-black-500">
                Location <span className="text-black mx-1">•</span> Regional Cluster
              </h2>
              <span className="font-sans text-[11px] font-bold text-slate-700 bg-slate-200/60 px-2.5 py-0.5 rounded-md border border-slate-300/40">
                {business.location.district || "Target District"} Cluster
              </span>
            </div>
            <div className="bg-[#fffff5] rounded-xl border border-gray-900/8 shadow-[0_4px_24px_rgb(0,0,0,0.05)] p-5 sm:p-6 flex flex-col h-full justify-between transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-[#1E6702]"></div>
              <div className="flex flex-col gap-3.5 pt-1">
                <div className="flex items-center justify-between py-1">
                  <span className="font-sans text-[13px] text-slate-500 font-medium">State</span>
                  <span className="font-sans text-[13px] font-bold text-slate-900 flex items-center gap-1.5">{business.location.state} <Check className="w-3.5 h-3.5 text-[#1E6702]" /></span>
                </div>
                <div className="w-full h-px bg-slate-100"></div>
                <div className="flex items-center justify-between py-1">
                  <span className="font-sans text-[13px] text-slate-500 font-medium">District</span>
                  <span className="font-sans text-[13px] font-bold text-slate-900">{business.location.district}</span>
                </div>
                <div className="w-full h-px bg-slate-100"></div>
                <div className="flex items-center justify-between py-1">
                  <span className="font-sans text-[13px] text-slate-500 font-medium">Block</span>
                  <span className="font-sans text-[13px] font-bold text-slate-900">{business.location.block || "District Block"}</span>
                </div>
                <div className="w-full h-px bg-slate-100"></div>
                <div className="flex items-center justify-between py-1">
                  <span className="font-sans text-[13px] text-slate-500 font-medium">Village</span>
                  <span className="font-sans text-[13px] font-bold text-[#1E6702] flex items-center gap-1 cursor-pointer hover:underline">{business.location.village || "Target Village"}</span>
                </div>
              </div>

              {/* Bottom Regional Hub Ecosystem Info Box */}
              <div className="mt-4 p-3 bg-slate-50/80 rounded-xl border border-slate-200/60 flex items-center gap-3">
                <div className="p-2 bg-[#1E6702]/10 rounded-lg text-[#1E6702] shrink-0">
                  <Map className="w-4 h-4" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[11px] font-bold text-slate-800 truncate">
                    {business.location.district || "Regional"} Agro-Industrial Hub
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">
                    Active supply chain & market connectivity
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ROW 2: FINANCIAL TRAJECTORY & NEXT STEPS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch mt-4">

          {/* LEFT: FINANCIAL TRAJECTORY */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
              <h2 className="font-sans text-[11px] font-bold uppercase tracking-wider text-black-500">
                Financial Trajectory <span className="text-black mx-1">•</span> Revenue, Costs & Operating Drag
              </h2>
              {/* Scenario Toggle */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setTrajectoryScenario("base")}
                  className={`px-2.5 py-0.5 rounded-md text-[10.5px] font-bold transition-all ${
                    trajectoryScenario === "base"
                      ? "bg-white text-emerald-800 shadow-xs"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {t("biz.baseScenario") || "Base Trajectory"}
                </button>
                <button
                  type="button"
                  onClick={() => setTrajectoryScenario("conservative")}
                  className={`px-2.5 py-0.5 rounded-md text-[10.5px] font-bold transition-all ${
                    trajectoryScenario === "conservative"
                      ? "bg-white text-rose-800 shadow-xs"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {t("biz.conservativeScenario") || "High-Friction Loss Scenario"}
                </button>
              </div>
            </div>

            <div className="bg-[#fffff5] rounded-xl border border-gray-900/8 shadow-[0_4px_24px_rgb(0,0,0,0.05)] p-5 sm:p-6 flex flex-col h-full justify-between transition-all duration-300">
              <div className="flex flex-col xl:flex-row gap-6 xl:gap-8 h-full items-stretch">

                {/* Area Chart */}
                <div className="flex flex-col flex-1 min-w-0 justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1.5 flex-wrap gap-2">
                      <h3 className="font-heading text-[18px] font-bold text-slate-900 tracking-tight">
                        Projected Revenue & Operating Margin (6 Months)
                      </h3>
                      <span className="font-sans text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 shrink-0">
                        +{financialTrajectory?.summary.growthPct || 100}% growth
                      </span>
                    </div>

                    {/* Break-even & Loss indicator */}
                    <div className="flex items-center gap-2 mb-3 flex-wrap text-xs">
                      <span className="px-2 py-0.5 rounded-md font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] flex items-center gap-1">
                        <Check className="w-3 h-3 text-emerald-600" />
                        Break-even: {financialTrajectory?.breakEvenMonth}
                      </span>
                      {financialTrajectory?.summary.isInitialLossExpected && (
                        <span className="px-2 py-0.5 rounded-md font-bold bg-rose-50 text-rose-700 border border-rose-200 text-[11px]">
                          ⚠️ M1 Launch Drag: -₹{financialTrajectory?.summary.m1Loss.toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="w-full h-[185px] flex-1 min-w-0 my-1">
                    <FinancialTrajectoryAreaChart
                      data={financialTrajectory?.trajectory || []}
                      tickFormatter={compactCurrencyFormatter}
                    />
                  </div>

                  <div className="flex justify-between items-center text-[11.5px] font-bold pt-2 mt-2 border-t border-slate-100 flex-wrap gap-2">
                    <span className="flex items-center gap-1.5 text-slate-600">
                      <div className="w-2 h-2 rounded-full bg-[#1E6702]"></div>
                      M1: ₹{financialTrajectory?.summary.m1Revenue.toLocaleString('en-IN')}
                      <span className={financialTrajectory?.trajectory[0]?.isLoss ? "text-rose-600 font-bold" : "text-emerald-700"}>
                        ({financialTrajectory?.trajectory[0]?.isLoss ? `-₹${Math.abs(financialTrajectory?.trajectory[0]?.netProfit).toLocaleString('en-IN')}` : `+₹${financialTrajectory?.trajectory[0]?.netProfit.toLocaleString('en-IN')}`})
                      </span>
                    </span>
                    <span className="text-slate-600">
                      M6: <span className="text-[#1E6702]">₹{financialTrajectory?.summary.m6Revenue.toLocaleString('en-IN')}</span>
                      <span className="text-emerald-700 font-bold ml-1">(Profit: +₹{financialTrajectory?.summary.m6Profit.toLocaleString('en-IN')})</span>
                    </span>
                  </div>
                </div>

                <div className="w-px bg-slate-200/60 hidden xl:block self-stretch"></div>

                {/* Cost breakdown */}
                <div className="w-full xl:w-[320px] 2xl:w-[340px] shrink-0 flex flex-col justify-between min-w-0 pt-4 xl:pt-0 border-t xl:border-t-0 border-slate-100">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <h3 className="font-heading text-[18px] font-bold text-slate-900 tracking-tight">Outlay Breakdown</h3>
                      <span className="font-sans text-[12px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">Total {financialTrajectory?.totalCostLakhs}</span>
                    </div>
                    <p className="font-sans text-[11.5px] text-slate-500 mb-3">Capital expenditure & launch operating reserves</p>
                  </div>

                  <div className="flex items-center gap-3 sm:gap-4 my-auto">
                    <div className="w-[105px] h-[105px] shrink-0 relative">
                      <EditorialDonutChart
                        data={financialTrajectory?.costBreakdown || []}
                        nameKey="name"
                        valueKey="value"
                        innerRadius={32}
                        outerRadius={48}
                      />
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                        <span className="font-sans text-[8.5px] font-bold text-slate-400 uppercase tracking-wider">OUTLAY</span>
                        <span className="font-sans text-[12px] font-bold text-slate-800 leading-tight">{financialTrajectory?.totalCostLakhs}</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 flex-1 min-w-0">
                      {(financialTrajectory?.costBreakdown || []).map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 min-w-0 flex-1">
                            <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.fill }}></div>
                            <span className="font-sans text-[11px] font-semibold text-slate-700 truncate" title={item.name}>{item.name}</span>
                          </div>
                          <span className="font-sans text-[11px] font-bold text-slate-900 shrink-0 tabular-nums">{item.pct}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* RIGHT: NEXT STEPS (PASTEL) */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-sans text-[11px] font-bold uppercase tracking-wider text-black-500">
                Next Steps
              </h2>
              <span className="font-sans text-[11px] font-medium text-slate-500">3 Workstreams</span>
            </div>

            <div className="flex flex-col gap-3 h-full">
              {/* Compare */}
              <Link href={`/business/compare`} className="group flex items-center justify-between p-4 rounded-2xl transition-all shadow-sm bg-[#234670] hover:bg-[#234670]/90 flex-1">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-[#f2f5d0]/10 rounded-xl group-hover:scale-110 transition-transform">
                    <BarChart2 className="w-5 h-5 text-[#f2f5d0]" />
                  </div>
                  <div className="flex flex-col text-left gap-0.5">
                    <span className="font-sans text-[16px] font-bold text-[#f2f5d0]">Compare</span>
                    <span className="font-sans text-[12px] text-[#f2f5d0]/80 font-medium">Compare multiple businesses</span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-[#f2f5d0]/50 group-hover:translate-x-1 transition-transform" />
              </Link>

              {/* Reports */}
              <Link href={business?.id ? `/reports/${business.id}` : `/reports`} className="group flex items-center justify-between p-4 rounded-2xl transition-all shadow-sm bg-[#301608] hover:bg-[#301608]/90 flex-1">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-[#f9fadc]/10 rounded-xl group-hover:scale-110 transition-transform">
                    <FileText className="w-5 h-5 text-[#f9fadc]" />
                  </div>
                  <div className="flex flex-col text-left gap-0.5">
                    <span className="font-sans text-[16px] font-bold text-[#f9fadc]">Get Reports</span>
                    <span className="font-sans text-[12px] text-[#f9fadc]/80 font-medium">Detailed Project Report (DPR) ready</span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-[#f9fadc]/50 group-hover:translate-x-1 transition-transform" />
              </Link>

              {/* Roadmap */}
              <Link href={`/business/${business.id}/roadmap`} className="group flex items-center justify-between p-4 rounded-2xl transition-all shadow-sm bg-[#5f9ea0] hover:bg-[#5f9ea0]/90 flex-1">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-[#eff5df]/20 rounded-xl group-hover:scale-110 transition-transform">
                    <Compass className="w-5 h-5 text-[#eff5df]" />
                  </div>
                  <div className="flex flex-col text-left gap-0.5">
                    <span className="font-sans text-[16px] font-bold text-[#eff5df]">Roadmap</span>
                    <span className="font-sans text-[12px] text-[#eff5df]/80 font-medium">Phase 1 of 4 in progress</span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-[#eff5df]/50 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <DeleteBusinessModal
          isOpen={isDeleteModalOpen}
          businessId={business.id}
          businessName={business.name}
          onClose={() => setIsDeleteModalOpen(false)}
          onDeleted={() => {
            router.push("/business");
          }}
        />
      )}
    </div>
  );
};
