"use client";

import React, { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  IndianRupee,
  Percent,
  Clock,
  Gift,
} from "lucide-react";
import apiClient from "@/lib/api/client";
import { computeFinancialPlan, autoSelectScheme } from "@/features/finance/schemeEngine";
import { DynamicText } from "@/features/i18n/components/DynamicText";

interface SupportAvailableCardProps {
  businessId?: string;
  availableMargin?: number;
  initialFinanceData?: any;
  isLoading?: boolean;
}

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];

function formatInr(n: number): string {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)} Lakh`;
  return `₹${n.toLocaleString("en-IN")}`;
}

export function SupportAvailableCard({
  businessId,
  availableMargin = 0,
  initialFinanceData = null,
  isLoading = false,
}: SupportAvailableCardProps) {
  const [fetchedFinance, setFetchedFinance] = useState<any>(initialFinanceData);
  const [isFetching, setIsFetching] = useState<boolean>(false);

  useEffect(() => {
    if (!businessId) return;
    let isMounted = true;
    setIsFetching(true);

    apiClient
      .get(`/finance/${businessId}`)
      .then((res: any) => {
        if (isMounted) {
          const payload = res?.data?.data?.finance || res?.data?.finance || null;
          if (payload) setFetchedFinance(payload);
          setIsFetching(false);
        }
      })
      .catch(() => {
        if (isMounted) setIsFetching(false);
      });

    return () => { isMounted = false; };
  }, [businessId]);

  const schemeData = useMemo(() => {
    if (availableMargin > 0) {
      const plan = computeFinancialPlan(availableMargin);
      if (plan.schemeResult.routed) {
        const s = plan.schemeResult.scheme;
        return {
          name: s.name,
          interestRate: `${s.interestRate}% p.a.`,
          maxLoanFormatted: formatInr(plan.loanAmount || s.maxLoanAmount),
          tenure: `${s.tenureYears} Years (${s.tenureMonths} mos)`,
          moratorium: `${s.moratoriumMonths} Months`,
          statusMsg: s.description,
          isEligible: true,
          hasSubsidy: s.id === "term-loan",
        };
      }
    }

    const rawScheme =
      fetchedFinance?.engineScheme?.scheme ||
      fetchedFinance?.engineScheme ||
      fetchedFinance?.scheme ||
      initialFinanceData?.scheme ||
      null;

    if (rawScheme) {
      const name = rawScheme.name || rawScheme.scheme_id || "Government Credit Scheme";
      const interestRate = rawScheme.interest_rate
        ? rawScheme.interest_rate > 1
          ? `${rawScheme.interest_rate}% p.a.`
          : `${(rawScheme.interest_rate * 100).toFixed(1)}% p.a.`
        : rawScheme.standardInterestRate
        ? `${(rawScheme.standardInterestRate * 100).toFixed(1)}% p.a.`
        : "6.5% – 8.0% p.a.";

      const maxLoan = rawScheme.max_loan || rawScheme.maxLoan || rawScheme.eligible_loan;
      const tenureMonths = rawScheme.tenure_months || rawScheme.standardTenureMonths || 84;
      const tenureYears = rawScheme.tenure_years || Math.round(tenureMonths / 12);
      const moratoriumMonths = rawScheme.moratorium_months || rawScheme.moratoriumMonths || 6;
      const isWithinLimit = fetchedFinance?.engineScheme?.is_within_scheme_limit ?? true;
      const statusMsg =
        fetchedFinance?.engineScheme?.status_message ||
        rawScheme.statusMessage ||
        `Project cost qualifies for ${name}.`;

      return {
        name,
        interestRate,
        maxLoanFormatted: maxLoan ? formatInr(maxLoan) : "Up to 90% Project Cost",
        tenure: `${tenureYears} Years (${tenureMonths} mos)`,
        moratorium: `${moratoriumMonths} Months`,
        statusMsg,
        isEligible: isWithinLimit,
        hasSubsidy: name.toLowerCase().includes("term"),
      };
    }

    const defaultRoute = autoSelectScheme(1250000);
    if (defaultRoute.routed) {
      const s = defaultRoute.scheme;
      return {
        name: s.name,
        interestRate: `${s.interestRate}% p.a.`,
        maxLoanFormatted: formatInr(s.maxLoanAmount),
        tenure: `${s.tenureYears} Years (${s.tenureMonths} mos)`,
        moratorium: `${s.moratoriumMonths} Months`,
        statusMsg: s.description,
        isEligible: true,
        hasSubsidy: s.id === "term-loan",
      };
    }

    return null;
  }, [fetchedFinance, initialFinanceData, availableMargin]);

  /* Stat tiles config with soft green icon backgrounds */
  const stats = schemeData
    ? [
        {
          label: "Loan Amount",
          value: schemeData.maxLoanFormatted,
          icon: IndianRupee,
          iconBg: "bg-[#DCFCE7]",
          iconColor: "text-[#16A34A]",
        },
        {
          label: "Interest Rate",
          value: schemeData.interestRate,
          icon: Percent,
          iconBg: "bg-[#D1FAE5]",
          iconColor: "text-[#059669]",
        },
        {
          label: "Grace Period",
          value: schemeData.moratorium?.toLowerCase() || "6 months",
          icon: Clock,
          iconBg: "bg-[#ECFDF5]",
          iconColor: "text-[#047857]",
        },
        {
          label: "Govt Support",
          value: schemeData.hasSubsidy ? "Up to 35%" : "90% Funding",
          icon: Gift,
          iconBg: "bg-[#F0FDF4]",
          iconColor: "text-[#15803D]",
        },
      ]
    : [];

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-emerald-100/50 p-5 sm:p-6 animate-pulse h-full flex flex-col gap-3">
        <div className="w-36 h-5 bg-emerald-50 rounded-lg" />
        <div className="w-full h-4 bg-slate-50 rounded" />
        <div className="grid grid-cols-2 gap-2 pt-2">
          <div className="h-14 bg-emerald-50/40 rounded-xl" />
          <div className="h-14 bg-emerald-50/40 rounded-xl" />
          <div className="h-14 bg-emerald-50/40 rounded-xl" />
          <div className="h-14 bg-emerald-50/40 rounded-xl" />
        </div>
        <div className="w-full h-9 bg-slate-50 rounded-xl mt-auto" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE }}
      className="bg-white rounded-2xl border border-emerald-100/50 p-5 sm:p-6 h-full flex flex-col gap-4"
    >
      {/* Card Title + Badge */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg sm:text-xl font-bold text-[#173809] tracking-tight">Govt. Support</h3>
        {schemeData && (
          <span className="text-[11px] font-semibold text-[#166534] bg-[#DCFCE7] px-2 py-0.5 rounded-md">
            Govt Backed
          </span>
        )}
      </div>

      {/* Scheme Name & Description */}
      {schemeData ? (
        <div>
          <h4 className="text-sm font-bold text-slate-800 leading-snug">
            <DynamicText text={schemeData.name} />
          </h4>
          <p className="text-[13px] text-slate-500 leading-relaxed mt-1">
            <DynamicText text={schemeData.statusMsg || "A government loan matched to your business."} />
          </p>
        </div>
      ) : (
        <p className="text-sm text-slate-400 italic">
          Configure your enterprise to unlock scheme matching.
        </p>
      )}

      {/* 2×2 Stat Grid */}
      {stats.length > 0 && (
        <div className="grid grid-cols-2 gap-2.5">
          {stats.map((s, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2.5 p-3 rounded-xl bg-[#FAFFF7] border border-emerald-100/40"
            >
              <div className={`w-8 h-8 rounded-lg ${s.iconBg} flex items-center justify-center shrink-0`}>
                <s.icon className={`w-4 h-4 ${s.iconColor}`} />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] text-slate-400 leading-tight">{s.label}</p>
                <p className="text-[13px] font-bold text-slate-800 truncate">{s.value}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CTA */}
      <div className="mt-auto pt-1">
        <Link
          href={businessId ? `/business/${businessId}/finance` : "/analysis"}
          className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-[13px] font-semibold text-white bg-[#2D7A0F] hover:bg-[#236B0A] transition-colors shadow-sm group"
        >
          <span>Explore Schemes & Subsidies</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </motion.div>
  );
}
