"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useTranslation } from "@/features/i18n/hooks/useTranslation";
import { LanguageSwitcher } from "@/features/i18n/components/LanguageSwitcher";
import { motion } from "framer-motion";

export function CleanNavbar() {
  const { t } = useTranslation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const [guideStep, setGuideStep] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const hasSeen = localStorage.getItem("ventureroot_home_guide_seen");
      if (!hasSeen) {
        setGuideStep(1);
      }
    }
  }, []);

  const handleDismissGuide = () => {
    setGuideStep(null);
    if (typeof window !== "undefined") {
      localStorage.setItem("ventureroot_home_guide_seen", "true");
    }
  };

  const handleReloadGuide = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("ventureroot_home_guide_seen");
      localStorage.removeItem("ventureroot_walkthrough_seen_v2");
    }
    setGuideStep(1);
  };

  return (
    <>
      <nav className="w-full bg-transparent py-4 px-6 md:px-12 z-50 relative flex items-center justify-between">
        {/* Left: Logo */}
        <div className="flex items-center">
          <Link 
            href="/" 
            className="bg-[#FFFBE7]/90 backdrop-blur-sm px-3 py-1.5 md:px-3 md:py-1.5 rounded-lg flex items-center justify-center shadow-sm border border-black/5 hover:bg-white transition-all active:scale-[0.98]"
          >
            <img src="/logo-wordmark.png" alt="VentureRoot Logo" className="h-5 md:h-[22px] w-auto object-contain mix-blend-multiply" />
          </Link>
        </div>

        {/* Center/Right: Nav Links (Desktop) */}
        <div className="hidden md:flex items-center gap-2" onMouseLeave={() => setHoveredIndex(null)}>
          <Link 
            href="/" 
            onMouseEnter={() => setHoveredIndex(0)}
            className="relative px-4 py-2 text-sm font-semibold text-secondary transition-colors active:scale-[0.97]"
          >
            {hoveredIndex === 0 && (
              <motion.div
                layoutId="navbar-pill"
                className="absolute inset-0 bg-[#1E6702]/10 rounded-full"
                transition={{ duration: 0.2, ease: "easeInOut" }}
              />
            )}
            <span className="relative z-10">{t("nav.home") || "Home"}</span>
          </Link>

          {[
            { name: t("nav.howItWorks") || "How It Works", href: "/#how-it-works", targetId: "how-it-works", idx: 1 },
            { name: t("nav.contactUs") || "Contact Us", href: "/#contact", targetId: "contact", idx: 2 },
          ].map((link) => (
            <Link 
              key={link.href}
              href={link.href} 
              onClick={(e) => {
                if (typeof window !== "undefined" && window.location.pathname === "/") {
                  const targetEl = document.getElementById(link.targetId);
                  if (targetEl) {
                    e.preventDefault();
                    targetEl.scrollIntoView({ behavior: "smooth" });
                  }
                }
              }}
              onMouseEnter={() => setHoveredIndex(link.idx)}
              className="relative px-4 py-2 text-sm font-semibold text-secondary hover:text-primary transition-colors active:scale-[0.97]"
            >
              {hoveredIndex === link.idx && (
                <motion.div
                  layoutId="navbar-pill"
                  className="absolute inset-0 bg-[#1E6702]/10 rounded-full"
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                />
              )}
              <span className="relative z-10">{link.name}</span>
            </Link>
          ))}

          {/* Retry Guide Step-by-Step Button */}
          <button 
            type="button"
            onClick={handleReloadGuide}
            onMouseEnter={() => setHoveredIndex(3)}
            className="relative px-4 py-2 text-sm font-semibold text-secondary hover:text-primary transition-colors active:scale-[0.97] cursor-pointer"
            title="Replay step-by-step user guide"
          >
            {hoveredIndex === 3 && (
              <motion.div
                layoutId="navbar-pill"
                className="absolute inset-0 bg-[#1E6702]/10 rounded-full"
                transition={{ duration: 0.2, ease: "easeInOut" }}
              />
            )}
            <span className="relative z-10">
              Retry Guide
            </span>
          </button>
        </div>

        {/* Right: Actions (Desktop) */}
        <div className="hidden md:flex items-center gap-6 relative">
          <div className="relative">
            <LanguageSwitcher />

            {/* Step 1: Language Switcher guide tooltip */}
            {guideStep === 1 && (
              <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2.5 z-50 pointer-events-auto">
                {/* Arrow pointing UP to LanguageSwitcher */}
                <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-t border-l border-slate-300 rotate-45 z-10" />

                <div className="relative w-64 bg-white/95 backdrop-blur-xs rounded-xl p-3 shadow-[0_8px_25px_rgba(0,0,0,0.14)] border border-slate-200 text-slate-800">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[10px] font-bold text-[#1E6702] uppercase tracking-wider bg-[#1E6702]/10 px-2 py-0.5 rounded-md">
                      Step 1 of 2
                    </span>
                    <button
                      type="button"
                      onClick={handleDismissGuide}
                      className="text-slate-400 hover:text-slate-600 text-xs p-0.5 cursor-pointer"
                      title="Skip guide"
                    >
                      ✕
                    </button>
                  </div>
                  <h4 className="font-heading font-bold text-xs text-slate-900 leading-snug">
                    🌐 Change Language
                  </h4>
                  <p className="font-sans text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                    Switch between English, हिन्दी, or বাংলা anytime to use VentureRoot in your preferred language.
                  </p>
                  <div className="mt-2.5 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={handleDismissGuide}
                      className="text-[11px] text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      Skip
                    </button>
                    <button
                      type="button"
                      onClick={() => setGuideStep(2)}
                      className="text-[11px] font-bold bg-[#1E6702] text-white px-2.5 py-1 rounded-md hover:bg-[#155201] transition-colors cursor-pointer"
                    >
                      Next →
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <Link href="/login" className="text-sm font-semibold text-secondary hover:text-primary transition-colors">
            {t("auth.loginButton")}
          </Link>
          
          <div className="relative">
            <Link
              href="/register"
              className="text-sm font-bold bg-[#1E6702] text-white px-5 py-2.5 rounded-full shadow-sm hover:bg-[#185502] transition-colors active:scale-[0.97] inline-block"
            >
              {t("auth.registerButton") || "Create Account"}
            </Link>

            {/* Step 2: Create an account guide tooltip */}
            {guideStep === 2 && (
              <div className="absolute right-0 top-full mt-2.5 z-50 pointer-events-auto">
                {/* Arrow pointing UP to Create Account */}
                <div className="absolute -top-1.5 right-8 w-3 h-3 bg-white border-t border-l border-slate-300 rotate-45 z-10" />

                <div className="relative w-64 bg-white/95 backdrop-blur-xs rounded-xl p-3 shadow-[0_8px_25px_rgba(0,0,0,0.14)] border border-slate-200 text-slate-800">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[10px] font-bold text-[#1E6702] uppercase tracking-wider bg-[#1E6702]/10 px-2 py-0.5 rounded-md">
                      Step 2 of 2
                    </span>
                    <button
                      type="button"
                      onClick={handleDismissGuide}
                      className="text-slate-400 hover:text-slate-600 text-xs p-0.5 cursor-pointer"
                      title="Skip guide"
                    >
                      ✕
                    </button>
                  </div>
                  <h4 className="font-heading font-bold text-xs text-slate-900 leading-snug">
                    Create an account
                  </h4>
                  <p className="font-sans text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                    Start here to set up your profile and explore businesses.
                  </p>
                  <div className="mt-2.5 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setGuideStep(1)}
                      className="text-[11px] text-slate-600 hover:text-slate-800 cursor-pointer"
                    >
                      ← Back
                    </button>
                    <button
                      type="button"
                      onClick={handleDismissGuide}
                      className="text-[11px] font-bold bg-[#1E6702] text-white px-2.5 py-1 rounded-md hover:bg-[#155201] transition-colors cursor-pointer"
                    >
                      Got it ✓
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 text-secondary hover:bg-secondary/5 rounded-md transition-colors"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-background/95 backdrop-blur-md z-40 flex flex-col p-6 pt-24 gap-6 md:hidden">
          <Link 
            href="/" 
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-xl font-semibold text-secondary"
          >
            {t("nav.home")}
          </Link>
          <Link 
            href="/#how-it-works" 
            onClick={(e) => {
              setIsMobileMenuOpen(false);
              if (typeof window !== "undefined" && window.location.pathname === "/") {
                const el = document.getElementById("how-it-works");
                if (el) {
                  e.preventDefault();
                  el.scrollIntoView({ behavior: "smooth" });
                }
              }
            }}
            className="text-xl font-semibold text-secondary"
          >
            {t("nav.howItWorks")}
          </Link>
          <Link 
            href="/#contact" 
            onClick={(e) => {
              setIsMobileMenuOpen(false);
              if (typeof window !== "undefined" && window.location.pathname === "/") {
                const el = document.getElementById("contact");
                if (el) {
                  e.preventDefault();
                  el.scrollIntoView({ behavior: "smooth" });
                }
              }
            }}
            className="text-xl font-semibold text-secondary"
          >
            {t("nav.contactUs")}
          </Link>
          <button 
            type="button"
            onClick={() => {
              setIsMobileMenuOpen(false);
              handleReloadGuide();
            }}
            className="text-left text-xl font-semibold text-secondary"
          >
            Retry Guide
          </button>
          <div className="h-px bg-secondary/10 my-2" />
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold text-secondary">{t("nav.language")}</span>
            <LanguageSwitcher />
          </div>
          <Link
            href="/login"
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-xl font-semibold text-secondary mt-2"
          >
            {t("auth.loginButton")}
          </Link>
          <Link
            href="/register"
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-xl font-bold bg-secondary text-white px-5 py-4 rounded-xl text-center shadow-md"
          >
            {t("auth.registerTitle")}
          </Link>
        </div>
      )}
    </>
  );
}
