"use client";

import React from "react";
import { X, ShieldCheck, FileText, CheckCircle2 } from "lucide-react";

interface TermsPrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAgree?: () => void;
}

export function TermsPrivacyModal({
  isOpen,
  onClose,
  onAgree,
}: TermsPrivacyModalProps) {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="terms-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 flex flex-col gap-4 text-left overflow-hidden max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#1E6702]/10 flex items-center justify-center text-[#1E6702]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 id="terms-modal-title" className="font-heading font-bold text-lg text-slate-900 leading-snug">
                Terms & Privacy Policy
              </h3>
              <p className="font-sans text-xs text-slate-500">
                Brief summary for VentureRoot users
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="space-y-4 overflow-y-auto pr-1 text-slate-700 text-xs font-sans leading-relaxed max-h-[55vh]">
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
            <h4 className="font-bold text-slate-900 text-xs mb-1 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-[#1E6702]" />
              1. Platform Account & Authenticity
            </h4>
            <p className="text-slate-600">
              VentureRoot is built to help local entrepreneurs model and launch viable businesses. You agree to register with valid contact information to access DPR reports and government scheme matching.
            </p>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
            <h4 className="font-bold text-slate-900 text-xs mb-1 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#1E6702]" />
              2. Privacy & Data Confidentiality
            </h4>
            <p className="text-slate-600">
              All entered business plans, target locations, available margins, and financial records belong solely to you. We strictly protect your information and never sell or distribute your private business data to third parties.
            </p>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
            <h4 className="font-bold text-slate-900 text-xs mb-1 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#1E6702]" />
              3. AI Insights & Financial Estimates
            </h4>
            <p className="text-slate-600">
              Viability scores, census market catchments, subsidy eligibility (such as PMEGP or MUDRA), and cash flow forecasts are data-driven advisory calculations meant to guide your planning. Final loans and statutory approvals remain subject to official bank and government procedures.
            </p>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
            <h4 className="font-bold text-slate-900 text-xs mb-1 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-[#1E6702]" />
              4. Security & User Rights
            </h4>
            <p className="text-slate-600">
              Your account is guarded with industry-standard encryption. You can edit your enterprise profiles or delete your account completely at any time from your profile settings.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Close
          </button>
          {onAgree && (
            <button
              type="button"
              onClick={() => {
                onAgree();
                onClose();
              }}
              className="px-5 py-2 text-xs font-bold text-white bg-[#1E6702] hover:bg-[#154a01] rounded-xl transition-all shadow-sm cursor-pointer"
            >
              I Agree & Accept
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
