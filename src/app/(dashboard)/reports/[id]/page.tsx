"use client";
import React, { use } from "react";
import { ReportDetailView } from "@/features/reports/components/ReportDetailView";
import { Report } from "@/features/reports/types";
import { useReportDetails } from "@/lib/data/reports";
import { Loader2, AlertTriangle } from "lucide-react";
import Link from "next/link";

export default function ReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Unwrap params — Next.js 15 passes params as a Promise
  const { id } = use(params);

  return <ReportDetailContent id={id} />;
}

// Separate component so we can use hooks after unwrapping params
function ReportDetailContent({ id }: { id: string }) {
  const { data: report, isLoading, error } = useReportDetails(id);

  // ── Loading ─────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-[#81cc87]/10">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-full border-4 border-[#ebcb2f]/30 border-t-[#ebcb2f] animate-spin" />
          </div>
          <div className="text-center">
            <p className="font-sans text-[15px] font-bold text-slate-700">
              Synthesising Detailed Project Report…
            </p>
            <p className="font-sans text-[12px] text-slate-400 mt-1">
              Loading business data, feasibility analysis & financial projections
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-[#81cc87]/10">
        <div className="bg-white rounded-2xl border border-red-100 p-10 text-center max-w-md shadow-sm">
          <AlertTriangle className="w-10 h-10 text-red-400 mx-auto mb-4" />
          <h2 className="font-sans text-[18px] font-bold text-gray-900 mb-2">
            Report Unavailable
          </h2>
          <p className="font-sans text-[13px] text-gray-500 mb-6">
            {error.message || "Could not load this report. Please try again."}
          </p>
          <Link
            href="/reports"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#141411] text-white font-sans text-[13px] font-bold hover:bg-[#141411]/90 transition-all"
          >
            ← Back to Reports
          </Link>
        </div>
      </div>
    );
  }

  // ── No data ──────────────────────────────────────────────────────────────
  if (!report) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-[#81cc87]/10">
        <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center max-w-md shadow-sm">
          <h2 className="font-sans text-[18px] font-bold text-gray-900 mb-2">
            Report Not Found
          </h2>
          <p className="font-sans text-[13px] text-gray-500 mb-6">
            No report found for ID: <code className="bg-gray-100 px-1 rounded">{id}</code>
          </p>
          <Link
            href="/reports"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#141411] text-white font-sans text-[13px] font-bold hover:bg-[#141411]/90 transition-all"
          >
            ← Back to Reports
          </Link>
        </div>
      </div>
    );
  }

  return <ReportDetailView report={report as Report} />;
}
