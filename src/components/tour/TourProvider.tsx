"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, X, Check } from "lucide-react";
import { useBusinessesComparison } from "@/lib/data/businesses";

export interface NavTourStep {
  targetId: string;
  title: string;
  desc: string;
  stepNum: number;
  totalSteps: number;
}

export const DASHBOARD_NAV_STEPS: NavTourStep[] = [
  {
    targetId: "nav-dashboard",
    title: "Dashboard",
    desc: "Overview of your active ventures, financial health, and status.",
    stepNum: 1,
    totalSteps: 8,
  },
  {
    targetId: "nav-analysis",
    title: "Market Analysis",
    desc: "Check local census density, competitors, and viability scores.",
    stepNum: 2,
    totalSteps: 8,
  },
  {
    targetId: "nav-my-business",
    title: "My Business",
    desc: "Manage your registered ventures and compare metrics.",
    stepNum: 3,
    totalSteps: 8,
  },
  {
    targetId: "nav-finance",
    title: "Finance & Schemes",
    desc: "Explore government loans (PMEGP/Mudra), subsidies, and EMI schedules.",
    stepNum: 4,
    totalSteps: 8,
  },
  {
    targetId: "nav-feasibility",
    title: "Feasibility Radar",
    desc: "View SWOT analysis, break-even graphs, and required licenses.",
    stepNum: 5,
    totalSteps: 8,
  },
  {
    targetId: "nav-new-business",
    title: "New Business",
    desc: "Start a new venture through our simple 6-step form wizard.",
    stepNum: 6,
    totalSteps: 8,
  },
  {
    targetId: "nav-advisor",
    title: "AI Advisor",
    desc: "Chat with your AI mentor in simple words for strategic guidance.",
    stepNum: 7,
    totalSteps: 8,
  },
  {
    targetId: "nav-language",
    title: "Language Options",
    desc: "Switch between English, हिन्दी, and বাংলা anytime to use VentureRoot in your regional language.",
    stepNum: 8,
    totalSteps: 8,
  },
];

interface TourContextType {
  isActive: boolean;
  currentStepIndex: number;
  startTour: () => void;
  nextStep: () => void;
  prevStep: () => void;
  endTour: () => void;
}

const TourContext = createContext<TourContextType>({
  isActive: false,
  currentStepIndex: 0,
  startTour: () => {},
  nextStep: () => {},
  prevStep: () => {},
  endTour: () => {},
});

export const useTour = () => useContext(TourContext);

const TOUR_STORAGE_KEY = "ventureroot_walkthrough_seen_v2";

export function TourProvider({ children }: { children: React.ReactNode }) {
  const [isActive, setIsActive] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const pathname = usePathname();

  const { data: businesses } = useBusinessesComparison();
  const hasBusinesses = Array.isArray(businesses) && businesses.length > 0;

  // First time auto-prompt: ONLY after user has created a business and enters dashboard
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!hasBusinesses) return; // Do not show if no business created yet

    const hasSeen = localStorage.getItem(TOUR_STORAGE_KEY);
    const isDashboard =
      pathname.startsWith("/dashboard") ||
      pathname.startsWith("/business") ||
      pathname.startsWith("/analysis") ||
      pathname.startsWith("/finance") ||
      pathname.startsWith("/feasibility") ||
      pathname.startsWith("/advisor");

    if (!hasSeen && isDashboard) {
      const timer = setTimeout(() => {
        setIsActive(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [pathname, hasBusinesses]);

  const updateTargetPosition = useCallback(() => {
    if (!isActive) {
      setTargetRect(null);
      return;
    }
    const step = DASHBOARD_NAV_STEPS[currentStepIndex];
    if (!step) return;

    const el = document.getElementById(step.targetId);
    if (el) {
      const rect = el.getBoundingClientRect();
      setTargetRect(rect);
    } else {
      setTargetRect(null);
    }
  }, [isActive, currentStepIndex]);

  useEffect(() => {
    updateTargetPosition();
    window.addEventListener("resize", updateTargetPosition);
    window.addEventListener("scroll", updateTargetPosition);
    return () => {
      window.removeEventListener("resize", updateTargetPosition);
      window.removeEventListener("scroll", updateTargetPosition);
    };
  }, [updateTargetPosition]);

  const startTour = () => {
    setCurrentStepIndex(0);
    setIsActive(true);
  };

  const endTour = () => {
    setIsActive(false);
    if (typeof window !== "undefined") {
      localStorage.setItem(TOUR_STORAGE_KEY, "true");
    }
  };

  const nextStep = () => {
    if (currentStepIndex < DASHBOARD_NAV_STEPS.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      endTour();
    }
  };

  const prevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const currentStep = DASHBOARD_NAV_STEPS[currentStepIndex];

  return (
    <TourContext.Provider
      value={{
        isActive,
        currentStepIndex,
        startTour,
        nextStep,
        prevStep,
        endTour,
      }}
    >
      {children}

      {/* Floating Non-intrusive Tooltip below target Navbar button - NO BACKDROP BLUR */}
      <AnimatePresence>
        {isActive && currentStep && targetRect && (
          <div className="fixed inset-0 z-[9999] pointer-events-none">
            <div
              className="absolute pointer-events-auto transition-all duration-200 ease-out"
              style={{
                top: `${targetRect.bottom + 10}px`,
                left: `${Math.min(
                  Math.max(targetRect.left + targetRect.width / 2 - 130, 16),
                  typeof window !== "undefined" ? window.innerWidth - 280 : 300
                )}px`,
              }}
            >
              <motion.div
                key={currentStep.targetId}
                initial={{ opacity: 0, y: -6, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.96 }}
                className="relative w-[260px] bg-white rounded-xl p-3 shadow-[0_10px_30px_rgba(0,0,0,0.18)] border border-slate-200/90 text-slate-800"
              >
                {/* Arrow pointing UP towards the navbar button */}
                <div
                  className="absolute -top-2 w-3.5 h-3.5 bg-white border-t border-l border-slate-200 rotate-45"
                  style={{
                    left: `${Math.min(Math.max(targetRect.left + targetRect.width / 2 - (Math.min(Math.max(targetRect.left + targetRect.width / 2 - 130, 16), typeof window !== "undefined" ? window.innerWidth - 280 : 300)) - 7, 16), 230)}px`,
                  }}
                />

                {/* Header with Step count and Close */}
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold tracking-wider uppercase text-[#1E6702] bg-[#1E6702]/10 px-2 py-0.5 rounded-md">
                    Step {currentStep.stepNum} of {currentStep.totalSteps}
                  </span>
                  <button
                    onClick={endTour}
                    className="text-slate-400 hover:text-slate-600 p-0.5 rounded-sm transition-colors cursor-pointer"
                    title="Skip tour"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Title & Desc in simple, clean layman words */}
                <h4 className="font-heading font-bold text-xs text-slate-900 leading-snug">
                  {currentStep.title}
                </h4>
                <p className="font-sans text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                  {currentStep.desc}
                </p>

                {/* Compact Actions */}
                <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-100">
                  <button
                    onClick={endTour}
                    className="text-[11px] text-slate-400 hover:text-slate-700 font-medium cursor-pointer"
                  >
                    Skip
                  </button>
                  <div className="flex items-center gap-1.5">
                    {currentStepIndex > 0 && (
                      <button
                        onClick={prevStep}
                        className="px-2 py-1 text-[11px] text-slate-600 hover:bg-slate-100 rounded-md font-medium cursor-pointer"
                      >
                        Back
                      </button>
                    )}
                    <button
                      onClick={nextStep}
                      className="px-2.5 py-1 text-[11px] bg-[#1E6702] hover:bg-[#164e01] text-white rounded-md font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer"
                    >
                      {currentStepIndex === DASHBOARD_NAV_STEPS.length - 1 ? (
                        <>Got it <Check className="w-3 h-3" /></>
                      ) : (
                        <>Next <ArrowRight className="w-3 h-3" /></>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </TourContext.Provider>
  );
}
