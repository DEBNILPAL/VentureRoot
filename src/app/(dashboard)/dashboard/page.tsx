"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useTranslation } from "@/features/i18n/hooks/useTranslation";
import { useAuthStore } from "@/stores/useAuthStore";
import Link from "next/link";
import { 
  ArrowRight, PieChart, TrendingUp, Sparkles, Briefcase, 
  PlusCircle, MapPin, BarChart2, ShieldCheck, ChevronRight, 
  CheckCircle2, Building2, AlertCircle, Users, Landmark, 
  Clock, Target, FileText, Compass, Layers, CheckSquare
} from "lucide-react";
import { motion } from "framer-motion";
import { useProfile } from "@/lib/data/users";
import { useBusinessesComparison } from "@/lib/data/businesses";
import { useFeasibility } from "@/lib/data/feasibility";
import { MarketReachCards } from "@/features/feasibility/components/MarketReachCards";
import { BusinessLocationFitPanel } from "@/features/feasibility/components/BusinessLocationFitPanel";
import { YourOpportunityCard } from "@/features/feasibility/components/YourOpportunityCard";
import { SupportAvailableCard } from "@/features/feasibility/components/SupportAvailableCard";
import { PrismFluxLoader } from "@/components/ui/prism-flux-loader";
import { resolveCoordinatesForLocation } from "@/services/location-search.service";
import { DynamicText } from "@/features/i18n/components/DynamicText";

// --- Framer Motion Variants ---
const EASE_OUT_EXPO = [0.22, 1, 0.36, 1] as [number, number, number, number];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: EASE_OUT_EXPO,
    },
  },
};

const headerVariants = {
  hidden: { opacity: 0, y: -10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: EASE_OUT_EXPO },
  },
};

export default function DashboardPage() {
  const { t } = useTranslation();
  const { user, fetchUser } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [selectedBusinessIndex, setSelectedBusinessIndex] = useState(0);

  useEffect(() => {
    fetchUser();
    const timer = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timer);
  }, [fetchUser]);

  const { data: profileData } = useProfile();
  const { data: businesses, isLoading: isBusinessesLoading } = useBusinessesComparison();

  // Dynamic active business based on user selection
  const currentIdx = businesses && businesses.length > 0
    ? Math.min(selectedBusinessIndex, businesses.length - 1)
    : 0;
  const activeBusiness = businesses?.[currentIdx];
  const { data: activeFeasibility, isLoading: isFeasibilityLoading } = useFeasibility(activeBusiness?.id || "");

  const firstName =
    user?.name?.split(" ")[0] ||
    (typeof window !== "undefined" ? localStorage.getItem("ventureroot_user_name")?.split(" ")[0] : null) ||
    profileData?.fullName?.split(" ")[0] ||
    "Entrepreneur";

  const locationStr =
    profileData?.location?.district && profileData?.location?.state
      ? `${profileData.location.district}, ${profileData.location.state}`
      : user?.location || profileData?.location?.state || "Local Region";

  const resolvedLoc = useMemo(() => resolveCoordinatesForLocation(activeBusiness?.location), [activeBusiness?.location]);
  const centerCoords: [number, number] = useMemo(() => [resolvedLoc.lat, resolvedLoc.lon], [resolvedLoc]);

  const businessLocationStr = activeBusiness?.location?.district
    ? `${activeBusiness.location.district}, ${activeBusiness.location.state || profileData?.location?.state || "State"}`
    : activeBusiness?.location?.state || locationStr;

  // Dynamic business details
  let businessName = activeBusiness?.name || `Business ${currentIdx + 1}`;
  if (typeof businessName === "string" && businessName.length > 30 && businessName.includes("-")) {
    businessName = "Rural Enterprise Venture";
  }
  let rawCategory = activeBusiness?.category?.name || activeBusiness?.category || "Agro-Processing & Value Addition";
  if (typeof rawCategory === "string" && rawCategory.length > 25 && rawCategory.includes("-")) {
    rawCategory = "Rural Enterprise";
  }
  const businessCategory = rawCategory.toLowerCase();
  const businessId = activeBusiness?.id || "";

  // Dynamic available margin from business or profile
  const availableMargin = Number(
    activeBusiness?.availableMargin ??
    activeBusiness?.capital?.availableMargin ??
    profileData?.financial?.availableCapital ??
    0
  );

  const hasNoBusinesses = !isBusinessesLoading && (!businesses || businesses.length === 0);
  const isPageLoading = !mounted || isBusinessesLoading || (isFeasibilityLoading && !activeFeasibility && !hasNoBusinesses);

  if (isPageLoading) {
    return (
      <div className="w-full min-h-[75vh] flex flex-col items-center justify-center p-6">
        <PrismFluxLoader size={38} speed={4} text="Retrieving your registered ventures..." />
      </div>
    );
  }

  return (
    <div className="relative w-full h-full p-3 sm:p-5 md:p-6 lg:p-8 flex flex-col gap-5 sm:gap-6 overflow-x-hidden min-h-screen">

      {/* ─── Hazy Blur Container for Dashboard Content when No Businesses ─── */}
      <div className={hasNoBusinesses ? "filter blur-[8px] opacity-35 pointer-events-none select-none transition-all duration-700 flex flex-col gap-5 sm:gap-6" : "flex flex-col gap-5 sm:gap-6"}>

      {/* ═══ HEADER: Multi-Business Tabs + Executive Status ═══ */}
      <motion.div
        variants={headerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col gap-4"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div>
            {businesses && businesses.length > 0 ? (
              <>
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span className="font-sans text-[11px] uppercase tracking-wider font-extrabold text-[#1E6702] bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 rounded-md shadow-2xs">
                    Venture {currentIdx + 1}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-xs font-semibold text-slate-700 bg-stone-100/80 border border-stone-200/60 px-2 py-0.5 rounded-md">
                    <DynamicText text={rawCategory} />
                  </span>
                </div>
                <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#173809] tracking-tight leading-tight">
                  <DynamicText text={businessName} />
                </h1>
                <div className="text-slate-600 text-xs sm:text-sm font-medium mt-1.5 flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <span className="inline-flex items-center gap-1 text-slate-700 font-semibold">
                    <MapPin className="w-3.5 h-3.5 text-[#1E6702] shrink-0" />
                    <DynamicText text={businessLocationStr} />
                  </span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="font-sans text-[11px] uppercase tracking-wider font-extrabold text-[#1E6702] bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 rounded-md shadow-2xs">
                    Venture Workspace
                  </span>
                </div>
                <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#173809] tracking-tight leading-tight">
                  Rural Business Dashboard
                </h1>
                <div className="text-slate-600 text-xs sm:text-sm font-medium mt-1.5 flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <span className="inline-flex items-center gap-1 text-slate-700 font-semibold">
                    <MapPin className="w-3.5 h-3.5 text-[#1E6702] shrink-0" />
                    <DynamicText text={locationStr} />
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-500">
                    Welcome, {firstName}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* ─── Multi-Business Horizontal Switcher (Scroll-safe on mobile) ─── */}
        {businesses && businesses.length > 0 ? (
          <div className="w-full flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-0.5 scrollbar-none">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-nowrap">
              {businesses.map((biz: any, idx: number) => {
                const isSelected = idx === currentIdx;
                return (
                  <button
                    key={biz.id || idx}
                    type="button"
                    title={biz.name || `Business ${idx + 1}`}
                    onClick={() => setSelectedBusinessIndex(idx)}
                    className={`shrink-0 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl text-xs font-bold transition-all flex items-center gap-1 sm:gap-1.5 ${
                      isSelected
                        ? "bg-[#1E6702] text-white shadow-sm shadow-emerald-900/20 ring-1.5 ring-emerald-600/30 scale-[1.01]"
                        : "bg-white hover:bg-slate-50 text-slate-700 border border-slate-200"
                    }`}
                  >
                    <Briefcase className={`w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 ${isSelected ? "text-emerald-200" : "text-slate-400"}`} />
                    <span className={isSelected ? "text-emerald-200 font-extrabold" : "text-slate-400"}>
                      <span className="sm:hidden">V{idx + 1}:</span>
                      <span className="hidden sm:inline">Venture {idx + 1}:</span>
                    </span>
                    <span className="truncate max-w-[120px] sm:max-w-[200px]">
                      {biz.name || `Business ${idx + 1}`}
                    </span>
                  </button>
                );
              })}

              <Link
                href="/business/create"
                className="shrink-0 px-2 py-0.5 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#1E6702] text-[10px] sm:text-xs font-bold border border-emerald-200 transition-all flex items-center gap-1"
              >
                <PlusCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                <span className="sm:hidden">Add</span>
                <span className="hidden sm:inline">+ Add Venture</span>
              </Link>
            </div>
          </div>
        ) : null}

        {/* ─── Dedicated First-Time / Zero-Business Onboarding Banner ─── */}
        {!isBusinessesLoading && (!businesses || businesses.length === 0) && (
          <div className="bg-gradient-to-r from-[#173809] via-slate-900 to-[#122b07] text-white rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 shadow-lg border border-emerald-800/40 relative overflow-hidden">
            <div className="absolute right-0 top-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold mb-2 border border-emerald-500/30">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>New Dedicated Entrepreneur Workspace</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                Welcome to your dashboard, {firstName}!
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
                You haven&apos;t added any rural enterprises yet. Create your first business profile to unlock live demographic intelligence, AI-backed DPR generation, and automated statutory compliance verification.
              </p>
            </div>
            <div className="relative z-10 shrink-0 flex flex-wrap gap-2.5">
              <Link
                href="/business/create"
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-md hover:shadow-emerald-500/25 flex items-center gap-2"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Create Your First Venture</span>
              </Link>
              <Link
                href="/analysis"
                className="bg-white/10 hover:bg-white/15 text-white border border-white/20 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-colors flex items-center gap-1.5"
              >
                <span>Run Quick Feasibility</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}

      </motion.div>

      {/* ═══ MARKET REACH SECTION (TAM • SAM • SOM) ═══ */}
      <MarketReachCards
        data={activeFeasibility?.market?.marketReachMetrics}
        businessId={activeBusiness?.id}
        isLoading={!activeFeasibility && isBusinessesLoading}
      />

      {/* ═══ THREE-COLUMN INSIGHTS ROW ═══ */}
      <motion.div
        variants={containerVariants}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 items-stretch"
      >
        <BusinessLocationFitPanel
          data={activeFeasibility?.businessLocationFit}
          businessId={activeBusiness?.id}
          isLoading={!activeFeasibility && isBusinessesLoading}
        />
        <YourOpportunityCard
          opportunity={activeFeasibility?.opportunity}
          competition={activeFeasibility?.competition}
          competitorRadar={activeFeasibility?.competitorRadar}
          demandIndicator={activeFeasibility?.market?.demandIndicators?.[0]}
          businessId={activeBusiness?.id}
          category={rawCategory}
          locationName={businessLocationStr}
          centerCoords={centerCoords}
          isLoading={!activeFeasibility && isBusinessesLoading}
        />
        <SupportAvailableCard
          businessId={activeBusiness?.id}
          availableMargin={availableMargin}
          initialFinanceData={activeFeasibility?.finance}
          isLoading={!activeFeasibility && isBusinessesLoading}
        />
      </motion.div>

      </div> {/* ─── Closes Hazy Blur Container ─── */}

      {/* ─── Focal Overlay Prompt when User Has No Business ─── */}
      {hasNoBusinesses && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.45, ease: EASE_OUT_EXPO }}
            className="bg-white/95 backdrop-blur-2xl border-2 border-[#1E6702]/30 rounded-3xl p-6 sm:p-10 shadow-2xl max-w-lg w-full text-center flex flex-col items-center gap-5 relative overflow-hidden"
          >
            <div className="absolute right-0 top-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-wide">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span>No Business Registered Yet</span>
            </div>

            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1E6702] to-[#124201] text-white flex items-center justify-center shadow-lg shadow-emerald-950/20">
              <Building2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-[#242424] tracking-tight">
                Welcome, {firstName}!
              </h2>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed max-w-md mx-auto">
                Your executive dashboard is currently hazy because no business is connected to your account. Creating your enterprise unlocks live Census demographic catchment, scheme subsidies (PMEGP/MUDRA), and bankable DPR analysis.
              </p>
              <p className="text-emerald-800 font-semibold text-xs bg-emerald-50/80 p-2.5 rounded-xl border border-emerald-200/60">
                Please create your first rural enterprise to activate your workspace.
              </p>
            </div>

            <div className="w-full flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                href="/business/create"
                className="w-full sm:w-auto px-6 py-3.5 bg-[#1E6702] hover:bg-[#165201] text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-emerald-900/25 hover:shadow-emerald-900/40 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ Create Your Business</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/analysis"
                className="w-full sm:w-auto px-5 py-3.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-semibold text-xs sm:text-sm rounded-xl shadow-xs transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-emerald-700" />
                <span>Run Instant Feasibility</span>
              </Link>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
}

