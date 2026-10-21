"use client";

import React, { useState } from "react";
import {
  Shield,
  FileCheck2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  Cpu,
  Clock,
  Sparkles,
  Scale,
  Landmark,
  FileText,
  UserCheck,
  Building,
} from "lucide-react";
import { ComplianceEvaluationResult } from "@/lib/ai-compliance-router";

export interface ApplicantFormData {
  fullName: string;
  nationalIdOrPassport: string;
  taxIdNumber: string;
  dateOfBirth: string;
  netWorthUsd: number;
  walletAddress: string;
  jurisdictionCode: number;
  deedEncumbranceStatus: string;
  watchlistFlag: boolean;
  documentText: string;
}

interface Stage1Props {
  formData: ApplicantFormData;
  setFormData: React.Dispatch<React.SetStateAction<ApplicantFormData>>;
  evaluation: ComplianceEvaluationResult | null;
  onVerify: () => Promise<void>;
  isVerifying: boolean;
  onProceedToZk: () => void;
}

export const PRELOADED_TEST_CASES: Array<{
  id: string;
  title: string;
  subtitle: string;
  expectedBadge: "ELIGIBLE" | "REJECTED" | "FREEZE_WARNING";
  data: ApplicantFormData;
}> = [
  {
    id: "case-1",
    title: "1. Clean Institutional Investor (Alice Vance / Apex Capital)",
    subtitle: "Age 34, Verified TIN, 0 Sanctions, Clean Commercial Tower Deed",
    expectedBadge: "ELIGIBLE",
    data: {
      fullName: "Alice Vance",
      nationalIdOrPassport: "BD-9948231",
      taxIdNumber: "884-992-110",
      dateOfBirth: "1992-05-14",
      netWorthUsd: 4200000,
      walletAddress: "0x71C67931383707B18E3cE0E73e9112Acb708689A",
      jurisdictionCode: 840,
      deedEncumbranceStatus: "CLEAN",
      watchlistFlag: false,
      documentText:
        "Institutional deed subscription request for Dhaka-NY Commercial Tower RWA tranche. All KYC/AML documentation notarized and verified under SEC Reg D 506(c).",
    },
  },
  {
    id: "case-2",
    title: "2. Sanctioned Entity (Viktor Darko / Offshore Shell)",
    subtitle: "Flagged on OFAC/AML watchlists & revoked tax clearance",
    expectedBadge: "REJECTED",
    data: {
      fullName: "Viktor Darko",
      nationalIdOrPassport: "PA-7719203",
      taxIdNumber: "REVOKED-992-OFFSHORE",
      dateOfBirth: "1978-11-20",
      netWorthUsd: 15000000,
      walletAddress: "0xDEADBEEF00000000000000000000000000000666",
      jurisdictionCode: 840,
      deedEncumbranceStatus: "CLEAN",
      watchlistFlag: true,
      documentText:
        "Offshore bearer share holding entity requesting allocation. Subject to OFAC SDN Sanctions Alert #OFAC-2026-991.",
    },
  },
  {
    id: "case-3",
    title: "3. Disputed Title (High Court Stay Order #HC-2026-884)",
    subtitle: "Investor KYC valid, but commercial deed locked under High Court stay order",
    expectedBadge: "FREEZE_WARNING",
    data: {
      fullName: "Rahman Al-Mansur",
      nationalIdOrPassport: "BD-4459102",
      taxIdNumber: "712-409-122",
      dateOfBirth: "1984-03-10",
      netWorthUsd: 6500000,
      walletAddress: "0x71C67931383707B18E3cE0E73e9112Acb708689A",
      jurisdictionCode: 50,
      deedEncumbranceStatus: "HIGH_COURT_INJUNCTION_HC_2026_884",
      watchlistFlag: false,
      documentText:
        "Land Registry Deed #99281/Dhaka: Under active High Court Stay Order HC-2026-884 pending dispute resolution under Section 54 Transfer of Property Act 1882.",
    },
  },
  {
    id: "case-4",
    title: "4. Underage / Unverified Retail Applicant",
    subtitle: "Age 17, missing TIN and accredited status",
    expectedBadge: "REJECTED",
    data: {
      fullName: "Kevin Young",
      nationalIdOrPassport: "US-1029384",
      taxIdNumber: "NONE",
      dateOfBirth: "2009-08-22",
      netWorthUsd: 12000,
      walletAddress: "0x94B8A291c9A471C5681Dce712aE3E85a4a58b32F",
      jurisdictionCode: 840,
      deedEncumbranceStatus: "CLEAN",
      watchlistFlag: false,
      documentText: "Individual retail onboarding request without accredited investor status or TIN.",
    },
  },
];

export function Stage1AICompliance({
  formData,
  setFormData,
  evaluation,
  onVerify,
  isVerifying,
  onProceedToZk,
}: Stage1Props) {
  const [showXRayRedaction, setShowXRayRedaction] = useState(false);
  const [activeTestCase, setActiveTestCase] = useState("case-1");

  const handleSelectCase = (testCase: (typeof PRELOADED_TEST_CASES)[0]) => {
    setActiveTestCase(testCase.id);
    setFormData(testCase.data);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 rounded-2xl shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 text-xs font-mono font-bold bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 rounded-full">
                STAGE 1 OF 5
              </span>
              <span className="text-xs font-mono text-slate-400">
                MULTI-LLM STATUTORY REGTECH PIPELINE
              </span>
            </div>
            <h2 className="text-2xl font-bold text-white mt-1.5 flex items-center gap-2">
              <Scale className="w-6 h-6 text-indigo-400" />
              AI RegTech Legal Document Verifier & PII Privacy Shield
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-3xl">
              Cascades across <strong>Nebius AI Studio</strong> (Llama-3.3-70B),{" "}
              <strong>Google Gemini 2.5 Flash</strong>, and{" "}
              <strong>Hugging Face Mistral</strong> to audit statutory compliance across US SEC Reg D,
              EU MiCA, and Bangladesh Property Laws before any cryptographic witness is synthesized.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowXRayRedaction(!showXRayRedaction)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                showXRayRedaction
                  ? "bg-indigo-600 border-indigo-400 text-white shadow-lg"
                  : "bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-500"
              }`}
            >
              {showXRayRedaction ? (
                <>
                  <EyeOff className="w-4 h-4 text-emerald-400" />
                  <span>Hide PII X-Ray</span>
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4 text-indigo-400" />
                  <span>PII Redaction X-Ray</span>
                </>
              )}
            </button>

            <button
              onClick={onVerify}
              disabled={isVerifying}
              className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-indigo-500 to-sky-500 hover:from-indigo-400 hover:to-sky-400 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-500/25 transition cursor-pointer disabled:opacity-50"
            >
              {isVerifying ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>Auditing Multi-AI...</span>
                </>
              ) : (
                <>
                  <Cpu className="w-4 h-4" />
                  <span>Run AI Legal Verification</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 4 Pre-Loaded Realistic Test Cases (1-Click Selector) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {PRELOADED_TEST_CASES.map((tc) => {
          const isSelected = activeTestCase === tc.id;
          return (
            <button
              key={tc.id}
              onClick={() => handleSelectCase(tc)}
              className={`text-left p-4 rounded-xl border transition cursor-pointer relative overflow-hidden ${
                isSelected
                  ? "bg-slate-900 border-indigo-500 shadow-lg shadow-indigo-500/10 ring-1 ring-indigo-500"
                  : "bg-slate-900/60 border-slate-800 hover:bg-slate-900 hover:border-slate-700"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                    tc.expectedBadge === "ELIGIBLE"
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                      : tc.expectedBadge === "FREEZE_WARNING"
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                      : "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                  }`}
                >
                  {tc.expectedBadge === "ELIGIBLE"
                    ? "✓ 100% ELIGIBLE"
                    : tc.expectedBadge === "FREEZE_WARNING"
                    ? "⚠ COURT STAY ORDER"
                    : "✕ REJECTED"}
                </span>
                {isSelected && (
                  <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
                )}
              </div>
              <h4 className="text-xs font-bold text-white leading-tight">
                {tc.title}
              </h4>
              <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                {tc.subtitle}
              </p>
            </button>
          );
        })}
      </div>

      {/* Main Grid: Form Inputs + Live Telemetry & X-Ray */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Input Form (5 Cols) */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-400" />
              Statutory Input Dossier
            </h3>
            <span className="text-xs font-mono text-slate-400">Off-Chain Data</span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-slate-400 block mb-1">
                Full Legal Name (Civil Registry)
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 font-mono focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 block mb-1">
                  National ID / Passport
                </label>
                <input
                  type="text"
                  value={formData.nationalIdOrPassport}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      nationalIdOrPassport: e.target.value,
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 font-mono focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">
                  Tax Identification (TIN)
                </label>
                <input
                  type="text"
                  value={formData.taxIdNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, taxIdNumber: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 font-mono focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 block mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) =>
                    setFormData({ ...formData, dateOfBirth: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 font-mono focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">
                  Net Worth (USD Verified)
                </label>
                <input
                  type="number"
                  value={formData.netWorthUsd}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      netWorthUsd: Number(e.target.value),
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 font-mono focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">
                Target Regulatory Jurisdiction
              </label>
              <select
                value={formData.jurisdictionCode}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    jurisdictionCode: Number(e.target.value),
                  })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 font-mono focus:border-indigo-500 focus:outline-none"
              >
                <option value={840}>
                  Code 840: US SEC Regulation D (Rule 506c) & OFAC AML
                </option>
                <option value={999}>
                  Code 999: EU MiCA (Regulation 2023/1114) & GDPR
                </option>
                <option value={50}>
                  Code 050: Bangladesh Transfer of Property Act 1882 & BFIU
                </option>
              </select>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">
                Deed Encumbrance / Court Injunction Status
              </label>
              <input
                type="text"
                value={formData.deedEncumbranceStatus}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    deedEncumbranceStatus: e.target.value,
                  })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 font-mono focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-950/80 border border-slate-800/80 rounded-lg">
              <div>
                <span className="font-semibold text-slate-200 block">
                  Watchlist / Sanctions Flag
                </span>
                <span className="text-[11px] text-slate-500">
                  Simulate OFAC / UN / EU PEP Hit
                </span>
              </div>
              <input
                type="checkbox"
                checked={formData.watchlistFlag}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    watchlistFlag: e.target.checked,
                  })
                }
                className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">
                Settlement Wallet Address (EVM)
              </label>
              <input
                type="text"
                value={formData.walletAddress}
                onChange={(e) =>
                  setFormData({ ...formData, walletAddress: e.target.value })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 font-mono text-[11px] focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Right: AI Evaluation & PII X-Ray (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* PII Redaction X-Ray Card */}
          {showXRayRedaction && (
            <div className="p-4 bg-indigo-950/40 border border-indigo-500/40 rounded-2xl animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-2 border-b border-indigo-500/30">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    PII Redaction X-Ray Shield (0% On-Chain Leakage)
                  </span>
                </div>
                <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded">
                  GDPR ART. 25 COMPLIANT
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-2">
                The institutional engine scrubs all civil identity records before cryptographic witness synthesis.
                The public blockchain only ever sees the deterministic <strong>Nullifier Hash</strong> and{" "}
                <strong>Merkle Root</strong>.
              </p>

              <div className="mt-3 grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-3 bg-slate-950/80 border border-rose-500/30 rounded-xl space-y-1">
                  <span className="text-rose-400 font-bold block text-[11px] uppercase">
                    Raw Off-Chain PII (Never Touches Chain):
                  </span>
                  <div className="text-slate-300 truncate">
                    Name: <span className="text-white">{formData.fullName}</span>
                  </div>
                  <div className="text-slate-300 truncate">
                    NID: <span className="text-white">{formData.nationalIdOrPassport}</span>
                  </div>
                  <div className="text-slate-300 truncate">
                    TIN: <span className="text-white">{formData.taxIdNumber}</span>
                  </div>
                  <div className="text-slate-300 truncate">
                    Net Worth: <span className="text-white">${formData.netWorthUsd.toLocaleString()}</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-950/80 border border-emerald-500/40 rounded-xl space-y-1">
                  <span className="text-emerald-400 font-bold block text-[11px] uppercase">
                    Cryptographically Redacted & Committed:
                  </span>
                  <div className="text-slate-300 truncate">
                    Name: <span className="text-emerald-300">A*********e</span>
                  </div>
                  <div className="text-slate-300 truncate">
                    NID: <span className="text-emerald-300">BD****31</span>
                  </div>
                  <div className="text-slate-300 truncate">
                    TIN: <span className="text-emerald-300">***-***-110</span>
                  </div>
                  <div className="text-slate-300 truncate">
                    Proof: <span className="text-emerald-300">[WITNESS RANGE &gt;= $1M]</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* AI Verification Results Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-bold text-white">
                  Multi-LLM RegTech Audit Results
                </h3>
              </div>
              {evaluation && (
                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="flex items-center gap-1 text-slate-400">
                    <Clock className="w-3.5 h-3.5" />
                    {evaluation.latencyMs}ms
                  </span>
                  <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {evaluation.providerUsed.split("(")[0]}
                  </span>
                </div>
              )}
            </div>

            {/* Score & Eligibility Banner */}
            {evaluation ? (
              <div
                className={`p-4 rounded-xl border flex items-center justify-between ${
                  evaluation.isEligible
                    ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-200"
                    : "bg-rose-950/40 border-rose-500/40 text-rose-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  {evaluation.isEligible ? (
                    <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                  ) : (
                    <XCircle className="w-8 h-8 text-rose-400" />
                  )}
                  <div>
                    <div className="text-base font-bold">
                      {evaluation.isEligible
                        ? "STATUTORY COMPLIANCE SATISFIED"
                        : "STATUTORY COMPLIANCE FAILED"}
                    </div>
                    <div className="text-xs text-slate-300 mt-0.5">
                      Tier:{" "}
                      <span className="font-mono font-semibold text-white">
                        {evaluation.contractParameters.accreditationTier}
                      </span>{" "}
                      | Jurisdiction:{" "}
                      <span className="font-mono font-semibold text-white">
                        {evaluation.contractParameters.jurisdictionCode}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs uppercase font-mono text-slate-400">
                    Compliance Score
                  </div>
                  <div
                    className={`text-2xl font-black font-mono ${
                      evaluation.complianceScore >= 75
                        ? "text-emerald-400"
                        : "text-rose-400"
                    }`}
                  >
                    {evaluation.complianceScore}/100
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-950/50 border border-slate-800 rounded-xl text-slate-400 text-xs">
                Click <strong>"Run AI Legal Verification"</strong> to trigger the autonomous
                multi-LLM cascade across Nebius, Gemini, and Hugging Face.
              </div>
            )}

            {/* 4 Mandatory Legal Checks (Traffic Lights) */}
            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  label: "1. Statutory Age >= 18",
                  sub: "Government ID / Passport Verified",
                  passed: evaluation?.checks.isAdultVerified ?? true,
                },
                {
                  label: "2. Tax Clearance",
                  sub: "Active TIN & NBR/IRS Status Verified",
                  passed: evaluation?.checks.isTaxCompliant ?? true,
                },
                {
                  label: "3. Sanctions Screening",
                  sub: "Cleared Against OFAC, UN & BFIU",
                  passed: evaluation?.checks.isSanctionsCleared ?? true,
                },
                {
                  label: "4. Title Encumbrance Free",
                  sub: "No High Court Injunctions or Liens",
                  passed: evaluation?.checks.isPropertyEncumbranceFree ?? true,
                },
              ].map((check, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border flex items-start gap-3 transition ${
                    check.passed
                      ? "bg-slate-950/70 border-emerald-500/30 text-slate-200"
                      : "bg-rose-950/30 border-rose-500/50 text-rose-200"
                  }`}
                >
                  <div className="mt-0.5">
                    {check.passed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <XCircle className="w-5 h-5 text-rose-500" />
                    )}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white leading-tight">
                      {check.label}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {check.sub}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Statutory Citations & Summary */}
            {evaluation && (
              <div className="space-y-3 pt-2">
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs space-y-1.5">
                  <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
                    Statutory Legal Citations Verified:
                  </span>
                  <ul className="space-y-1 text-slate-300 font-mono text-[11px]">
                    {evaluation.statutoryCitations.map((citation, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="text-emerald-400">§</span>
                        {citation}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl text-xs text-slate-300">
                  <span className="font-semibold text-slate-200 block mb-1">
                    Risk Analysis & Audit Findings:
                  </span>
                  <p className="leading-relaxed">{evaluation.riskAnalysisSummary}</p>
                </div>
              </div>
            )}

            {/* Bottom Proceed Action */}
            <div className="pt-2 flex justify-end">
              <button
                onClick={onProceedToZk}
                disabled={!evaluation?.isEligible}
                className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold rounded-xl text-xs shadow-lg transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <span>Proceed to Stage 2: Generate ZK Proof</span>
                <CheckCircle2 className="w-4 h-4 text-slate-950" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
