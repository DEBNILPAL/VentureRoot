"use client";

import React, { useState } from "react";
import apiClient from "@/lib/api/client";
import {
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Loader2,
  FileSearch,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Sparkles,
  Quote,
} from "lucide-react";
import { PrismFluxLoader } from "@/components/ui/prism-flux-loader";

// ──────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────
interface Citation {
  rank: number;
  relevance_score: number;
  relevance_percent: number;
  document: string;
  section: string;
  excerpt: string;
  source_type: string;
}

interface VerificationResult {
  verdict: "VERIFIED" | "FLAG_WARNING" | "REJECTED";
  compliance_score: number;
  verification_report: string;
  citations: Citation[];
  retrieved_chunks_count: number;
  model_used: string;
  reportId: string;
}

interface RagVerificationPanelProps {
  reportId: string;
  businessName?: string;
}

// ──────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────
const VERDICT_CONFIG = {
  VERIFIED: {
    icon: ShieldCheck,
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    badge: "bg-emerald-100 text-emerald-800",
    label: "Verified & Compliant",
  },
  FLAG_WARNING: {
    icon: ShieldAlert,
    color: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-200",
    badge: "bg-amber-100 text-amber-800",
    label: "Warnings Detected",
  },
  REJECTED: {
    icon: ShieldX,
    color: "text-rose-700",
    bg: "bg-rose-50",
    border: "border-rose-200",
    badge: "bg-rose-100 text-rose-800",
    label: "Compliance Violations",
  },
};

function ScoreMeter({ score }: { score: number }) {
  const color =
    score >= 80 ? "#059669" : score >= 60 ? "#d97706" : "#e11d48";
  return (
    <div className="flex items-center gap-3">
      <div className="relative w-12 h-12 flex-shrink-0">
        <svg className="w-12 h-12 -rotate-90" viewBox="0 0 48 48">
          <circle cx="24" cy="24" r="20" fill="none" stroke="#e5e7eb" strokeWidth="5" />
          <circle
            cx="24"
            cy="24"
            r="20"
            fill="none"
            stroke={color}
            strokeWidth="5"
            strokeDasharray={`${(score / 100) * 125.7} 125.7`}
            strokeLinecap="round"
          />
        </svg>
        <span
          className="absolute inset-0 flex items-center justify-center text-[11px] font-bold"
          style={{ color }}
        >
          {score}
        </span>
      </div>
      <div>
        <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">
          Compliance Score
        </p>
        <p className="text-[13px] font-semibold text-gray-900">{score}/100</p>
      </div>
    </div>
  );
}

function CitationCard({ citation, index }: { citation: Citation; index: number }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-start gap-3 p-4 text-left hover:bg-gray-50 transition-colors cursor-pointer"
      >
        <div className="w-6 h-6 rounded-full bg-[#ebcb2f]/20 text-[#141411] flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5">
          {index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="font-sans text-[12px] font-bold text-gray-900 truncate">
              {citation.document}
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#f9faeb] border border-[#ebcb2f]/30 text-[10px] font-bold text-gray-700">
              {citation.relevance_percent}% match
            </span>
          </div>
          <p className="font-sans text-[11px] text-gray-500 font-semibold uppercase tracking-wide">
            § {citation.section}
          </p>
        </div>
        <div className="shrink-0 mt-0.5 text-gray-400">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4">
          <div className="ml-9 border-l-2 border-[#ebcb2f]/40 pl-3 mt-1">
            <Quote className="w-3 h-3 text-[#ebcb2f] mb-1 rotate-180" />
            <p className="font-sans text-[12px] text-gray-600 leading-relaxed italic">
              {citation.excerpt}
            </p>
            <div className="mt-2 flex items-center gap-1.5">
              <BookOpen className="w-3 h-3 text-gray-400" />
              <span className="font-sans text-[10px] text-gray-400 font-semibold uppercase">
                {citation.source_type}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function VerificationReportSection({ markdown }: { markdown: string }) {
  // Simple markdown renderer for the verification report
  const lines = markdown.split("\n");

  return (
    <div className="prose prose-sm max-w-none font-sans text-[14px] text-gray-700 leading-relaxed space-y-2">
      {lines.map((line, i) => {
        if (line.startsWith("### ")) {
          return (
            <h4 key={i} className="font-bold text-[14px] text-gray-900 mt-4 mb-2 flex items-center gap-2">
              {line.replace("### ", "")}
            </h4>
          );
        }
        if (line.startsWith("**VERDICT")) {
          return null; // Rendered separately
        }
        if (line.startsWith("**Compliance Score")) {
          return null; // Rendered separately
        }
        if (line.startsWith("---")) {
          return <hr key={i} className="border-gray-100 my-3" />;
        }
        if (line.startsWith("- ✅") || line.startsWith("- **")) {
          return (
            <div key={i} className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
              <p className="text-[13px]">{line.replace(/^- [✅\*]*/, "").replace(/\*\*/g, "")}</p>
            </div>
          );
        }
        if (line.startsWith("- ⚠️")) {
          return (
            <div key={i} className="flex items-start gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 mt-0.5 shrink-0" />
              <p className="text-[13px]">{line.replace("- ⚠️", "").trim()}</p>
            </div>
          );
        }
        if (line.startsWith("- ❌")) {
          return (
            <div key={i} className="flex items-start gap-2">
              <XCircle className="w-3.5 h-3.5 text-rose-600 mt-0.5 shrink-0" />
              <p className="text-[13px]">{line.replace("- ❌", "").trim()}</p>
            </div>
          );
        }
        if (line.startsWith("- ")) {
          return (
            <div key={i} className="flex items-start gap-2 text-[13px] text-gray-600 pl-1">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-1.5 shrink-0" />
              <p>{line.replace("- ", "").replace(/\*\*/g, "")}</p>
            </div>
          );
        }
        if (line.trim() === "") return <div key={i} className="h-1" />;

        // Safe bold handling without dangerouslySetInnerHTML
        const parts = line.split(/(\*\*[^*]+\*\*)/g);
        return (
          <p key={i} className="text-[13px] text-gray-700">
            {parts.map((part, pIdx) =>
              part.startsWith("**") && part.endsWith("**") ? (
                <strong key={pIdx} className="font-semibold text-gray-900">
                  {part.slice(2, -2)}
                </strong>
              ) : (
                part
              )
            )}
          </p>
        );
      })}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// Main Panel Component
// ──────────────────────────────────────────────────────────────
export function RagVerificationPanel({
  reportId,
  businessName = "Business",
}: RagVerificationPanelProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [serviceUrl, setServiceUrl] = useState<string | null>(null);
  const [showReport, setShowReport] = useState(true);
  const [showCitations, setShowCitations] = useState(false);

  const runVerification = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Use apiClient — automatically injects Bearer token from auth store
      const res = await apiClient.post(`/reports/${reportId}/verify`);
      setResult(res.data?.data || res.data);
      setShowReport(true);
      setShowCitations(true);
    } catch (err: any) {
      // Extract the most useful error message from axios error or API response
      const apiData = err?.response?.data;
      const message =
        apiData?.hint ||
        apiData?.error ||
        apiData?.message ||
        err?.message ||
        "Verification failed. Check that the RAG service is running.";
      setError(message);
      setServiceUrl(apiData?.service_url || null);
    } finally {
      setLoading(false);
    }
  };

  const verdictCfg = result
    ? VERDICT_CONFIG[result.verdict] || VERDICT_CONFIG["FLAG_WARNING"]
    : null;
  const VerdictIcon = verdictCfg?.icon;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-xs overflow-hidden">
      {/* ── Header ──────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4 px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-[#f9faeb] to-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#ebcb2f]/20 flex items-center justify-center">
            <FileSearch className="w-5 h-5 text-[#141411]" />
          </div>
          <div>
            <h3 className="font-sans text-[15px] font-bold text-gray-900">
              Regulatory Compliance Verification
            </h3>
            <p className="font-sans text-[12px] text-gray-500">
              RAG-powered · AI Compliance Agent · {" "}
              <span className="font-semibold text-[#1E6702]">3,994 regulation chunks</span>
            </p>
          </div>
        </div>

        <button
          id="run-rag-verification-btn"
          onClick={runVerification}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#141411] text-white font-sans text-[13px] font-bold hover:bg-[#141411]/90 active:scale-95 transition-all shadow-md disabled:opacity-75 cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Verifying...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-[#ebcb2f]" />
              {result ? "Re-verify" : "Run Verification"}
            </>
          )}
        </button>
      </div>

      {/* ── Loading State ────────────────────────────────────── */}
      {loading && (
        <div className="px-6 py-10 flex flex-col items-center justify-center gap-4 text-center">
          <PrismFluxLoader size={38} speed={4} />
          <div>
            <p className="font-sans text-[14px] font-semibold text-gray-800">
              Verifying against business regulations…
            </p>
            <p className="font-sans text-[12px] text-gray-500 mt-1">
              Retrieving relevant regulation chunks · Running AI compliance agent · Analysing compliance
            </p>
            <p className="font-sans text-[11px] text-amber-600 mt-2 font-medium">
              ⏳ First verification may take ~30–45 seconds (Render cold start)
            </p>
          </div>
        </div>
      )}

      {/* ── Error State ──────────────────────────────────────── */}
      {error && !loading && (
        <div className="px-6 py-5 flex items-start gap-3 bg-rose-50 border-b border-rose-100">
          <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="min-w-0">
            <p className="font-sans text-[13px] font-bold text-rose-800">Verification Failed</p>
            <p className="font-sans text-[12px] text-rose-700 mt-0.5 break-words">{error}</p>
            <div className="mt-2 space-y-1">
              <p className="font-sans text-[11px] text-rose-600">
                Start the local RAG service with:
              </p>
              <code className="block bg-rose-100 text-rose-800 text-[11px] px-2 py-1 rounded font-mono">
                cd ML_Fin/Models_and_RAG/RAG &amp;&amp; uvicorn api.main:app --port 8004
              </code>
              {serviceUrl && (
                <p className="font-sans text-[11px] text-rose-500">
                  Configured URL: <code className="bg-rose-100 px-1 rounded">{serviceUrl}</code>
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Empty State ──────────────────────────────────────── */}
      {!loading && !result && !error && (
        <div className="px-6 py-8 flex flex-col items-center justify-center text-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-[#f9faeb] border border-[#ebcb2f]/30 flex items-center justify-center">
            <ShieldCheck className="w-7 h-7 text-gray-400" />
          </div>
          <div>
            <p className="font-sans text-[14px] font-semibold text-gray-800">
              AI Regulation Verification Not Run Yet
            </p>
            <p className="font-sans text-[12px] text-gray-500 max-w-xs mt-1 leading-relaxed">
              Click <strong>Run Verification</strong> to verify the ML predictions in this report
              against {" "}
              <strong>3,994 indexed business regulation chunks</strong> using Neural AI Intelligence.
            </p>
          </div>
        </div>
      )}

      {/* ── Result ───────────────────────────────────────────── */}
      {result && !loading && (
        <div className="divide-y divide-gray-100">

          {/* Verdict Banner */}
          <div className={`px-6 py-5 flex flex-col sm:flex-row sm:items-center gap-5 ${verdictCfg?.bg}`}>
            <div className="flex items-center gap-4 flex-1">
              {VerdictIcon && (
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${verdictCfg.bg} border ${verdictCfg.border}`}>
                  <VerdictIcon className={`w-6 h-6 ${verdictCfg.color}`} />
                </div>
              )}
              <div>
                <span className={`inline-flex px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider ${verdictCfg?.badge}`}>
                  {result.verdict.replace("_", " ")}
                </span>
                <p className="font-sans text-[15px] font-bold text-gray-900 mt-1">
                  {verdictCfg?.label}
                </p>
                <p className="font-sans text-[11px] text-gray-500 mt-0.5">
                  Verified by {result.model_used} · {result.retrieved_chunks_count} regulation chunks retrieved
                </p>
              </div>
            </div>
            <ScoreMeter score={result.compliance_score} />
          </div>

          {/* Full Verification Report */}
          <div>
            <button
              onClick={() => setShowReport(!showReport)}
              className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#ebcb2f]" />
                <span className="font-sans text-[13px] font-bold text-gray-900">
                  Full Verification Report
                </span>
                <span className="text-[11px] text-gray-400 font-medium">
                  — Generated by AI Compliance Agent
                </span>
              </div>
              {showReport ? (
                <ChevronUp className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              )}
            </button>

            {showReport && (
              <div className="px-6 pb-6">
                <div className="bg-gray-50 rounded-xl border border-gray-100 p-5">
                  <VerificationReportSection markdown={result.verification_report} />
                </div>
              </div>
            )}
          </div>

          {/* Citations from RAG */}
          <div>
            <button
              onClick={() => setShowCitations(!showCitations)}
              className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#1E6702]" />
                <span className="font-sans text-[13px] font-bold text-gray-900">
                  Regulatory Citations
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#1E6702]/10 text-[10px] font-bold text-[#1E6702]">
                  {result.citations.length} sources
                </span>
              </div>
              {showCitations ? (
                <ChevronUp className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              )}
            </button>

            {showCitations && (
              <div className="px-6 pb-6 space-y-2">
                <p className="font-sans text-[11px] text-gray-500 mb-3">
                  Retrieved from <strong>BAAI/bge-large-en-v1.5</strong> cosine similarity search
                  against <strong>ChromaDB</strong> business regulations collection.
                </p>
                {result.citations.map((citation, idx) => (
                  <CitationCard key={idx} citation={citation} index={idx} />
                ))}
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
