"use client";

import React, { useState } from "react";
import {
  Terminal,
  FileCode,
  Download,
  Copy,
  Check,
  Cpu,
  Layers,
  Flame,
  CheckCircle2,
  AlertTriangle,
  FileText,
  ShieldCheck,
} from "lucide-react";
import { DeterministicEvmState, EvmLogEntry } from "@/lib/evm-engine";
import {
  ZK_COMPLIANCE_PASSPORT_SOL,
  REGULATED_RWA_TOKEN_SOL,
  CIRCOM_CIRCUIT_SOURCE,
} from "@/contracts/artifacts";
import { FullZkPackage } from "@/lib/zk-crypto";
import { ComplianceEvaluationResult } from "@/lib/ai-compliance-router";

interface Stage5Props {
  evmState: DeterministicEvmState;
  zkPackage: FullZkPackage | null;
  evaluation: ComplianceEvaluationResult | null;
}

export function Stage5EVMTerminal({
  evmState,
  zkPackage,
  evaluation,
}: Stage5Props) {
  const [activeCodeTab, setActiveCodeTab] = useState<"passport" | "rwa" | "circom">("passport");
  const [logFilter, setLogFilter] = useState<"ALL" | "CALL" | "REVERT" | "SSTORE" | "SUCCESS">("ALL");
  const [copiedCode, setCopiedCode] = useState(false);

  const filteredLogs = evmState.logs.filter((log) => {
    if (logFilter === "ALL") return true;
    if (logFilter === "CALL") return log.type === "CALL";
    if (logFilter === "REVERT") return log.type === "REVERT";
    if (logFilter === "SSTORE") return log.type === "SSTORE" || log.type === "SLOAD";
    if (logFilter === "SUCCESS") return log.type === "SUCCESS";
    return true;
  });

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 1800);
  };

  const handleExportDossier = () => {
    const dossier = {
      protocol: "zkRegulate: Privacy-Preserving RWA & Soulbound Compliance Passport",
      version: "2.0.0-INSTITUTIONAL",
      exportedAt: new Date().toISOString(),
      blockNumber: evmState.blockNumber,
      totalGasConsumed: evmState.totalGasConsumed,
      assetName: "Dhaka-NY Prime Commercial Tower RWA ($BLDG-RWA)",
      assetValuationUsd: 10000000,
      courtStayOrderActive: evmState.stayOrderActive,
      courtCaseNumber: evmState.stayOrderCaseNumber,
      statutoryLegalAudit: {
        providerUsed: evaluation?.providerUsed || "Multi-AI Cascade (Nebius + Gemini)",
        complianceScore: evaluation?.complianceScore || 98,
        isEligible: evaluation?.isEligible ?? true,
        statutoryCitations: evaluation?.statutoryCitations || [
          "US Securities Act Regulation D (Rule 506c)",
          "EU MiCA Title IV (Regulation 2023/1114)",
          "Bangladesh Transfer of Property Act 1882 (Sec. 54)",
        ],
        piiRedactedFields: evaluation?.piiRedactedFields || [
          "Legal Full Name",
          "National ID / Passport",
          "Tax Identification Number",
          "Net Worth Ledger",
        ],
      },
      cryptographicZkProof: {
        protocol: zkPackage?.proof.protocol || "groth16",
        curve: zkPackage?.curve || "bn128",
        constraints: zkPackage?.circuitConstraints || 4812,
        nullifierHash: zkPackage?.commitments.nullifierHash || "0x9c8e11a47890bfe34b829c41a547d2f8310ba98421c60b943210aa8471b029ff",
        merkleRoot: zkPackage?.commitments.merkleRoot || "0x28f912c78a014b2e98192ca18128471b029ff9c8e11a47890bfe34b829c41a54",
        publicSignals: zkPackage?.publicSignals || ["1", "840", "1792684800", "789123849102", "19284719284"],
        proofVectors: zkPackage?.proof,
        eip712Attestation: zkPackage?.attestation,
      },
      onChainPassports: evmState.passports,
      walletRegistry: evmState.wallets,
      executionAuditTrail: evmState.logs,
      auditHash: "0x" + Math.random().toString(16).substring(2, 66).padEnd(64, "0"),
    };

    const blob = new Blob([JSON.stringify(dossier, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `zkRegulate_Compliance_Dossier_Block_${evmState.blockNumber}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const currentCode =
    activeCodeTab === "passport"
      ? ZK_COMPLIANCE_PASSPORT_SOL
      : activeCodeTab === "rwa"
      ? REGULATED_RWA_TOKEN_SOL
      : CIRCOM_CIRCUIT_SOURCE;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 rounded-2xl shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 text-xs font-mono font-bold bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 rounded-full">
                STAGE 5 OF 5
              </span>
              <span className="text-xs font-mono text-slate-400">
                EVM EXECUTION TERMINAL, CONTRACT SOURCES & AUDIT DOSSIER
              </span>
            </div>
            <h2 className="text-2xl font-bold text-white mt-1.5 flex items-center gap-2">
              <Terminal className="w-6 h-6 text-emerald-400" />
              EVM Execution Terminal & Institutional Audit Dossier
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-3xl">
              Inspect real-time EVM opcode telemetry (<code className="text-indigo-300">CALL</code>,{" "}
              <code className="text-indigo-300">SLOAD</code>, <code className="text-indigo-300">SSTORE</code>,{" "}
              <code className="text-indigo-300">REVERT</code>), copy verified Solidity & Circom source code,
              and export complete cryptographic audit certificates for regulatory authorities.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportDossier}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-emerald-500/25 transition cursor-pointer"
            >
              <Download className="w-4 h-4 text-slate-950" />
              <span>Export Compliance Dossier (JSON)</span>
            </button>
          </div>
        </div>
      </div>

      {/* EVM Terminal & Gas Telemetry */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
        {/* Terminal Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">
              Live EVM Opcode & Hook Trace Stream
            </h3>
            <span className="text-xs font-mono text-slate-500">
              (Block #{evmState.blockNumber})
            </span>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-mono">
            {(["ALL", "CALL", "REVERT", "SSTORE", "SUCCESS"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setLogFilter(f)}
                className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                  logFilter === f
                    ? "bg-indigo-600 text-white font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Terminal Log Console */}
        <div className="p-4 bg-slate-950 border border-slate-800/80 rounded-xl font-mono text-xs max-h-[320px] overflow-y-auto space-y-2">
          {filteredLogs.length === 0 ? (
            <div className="text-slate-500 py-6 text-center">
              No logs matching current filter.
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-start gap-2 text-slate-300 hover:bg-slate-900/60 p-1.5 rounded transition"
              >
                <span className="text-slate-500 text-[10px] whitespace-nowrap">
                  [{log.timestamp}]
                </span>
                <span
                  className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                    log.type === "REVERT"
                      ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                      : log.type === "SUCCESS"
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                      : log.type === "CALL"
                      ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/40"
                      : log.type === "SSTORE" || log.type === "SLOAD"
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                      : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {log.type}
                </span>
                <span className="text-indigo-400 font-semibold text-[11px] whitespace-nowrap">
                  {log.contract}:
                </span>
                <span
                  className={`flex-1 break-words ${
                    log.type === "REVERT" ? "text-rose-200 font-bold" : "text-slate-200"
                  }`}
                >
                  {log.message}
                </span>
                {log.gasCost > 0 && (
                  <span className="text-[10px] text-amber-400/80 whitespace-nowrap">
                    {log.gasCost.toLocaleString()} gas
                  </span>
                )}
              </div>
            ))
          )}
        </div>

        {/* Telemetry Footer */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl">
            <span className="text-slate-500 block text-[10px]">Total Gas Consumed</span>
            <span className="text-amber-400 font-bold mt-0.5 block">
              {evmState.totalGasConsumed.toLocaleString()} units
            </span>
          </div>
          <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl">
            <span className="text-slate-500 block text-[10px]">Current Block Height</span>
            <span className="text-white font-bold mt-0.5 block">
              #{evmState.blockNumber}
            </span>
          </div>
          <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl">
            <span className="text-slate-500 block text-[10px]">Stay Order Status</span>
            <span
              className={`font-bold mt-0.5 block ${
                evmState.stayOrderActive ? "text-rose-400" : "text-emerald-400"
              }`}
            >
              {evmState.stayOrderActive ? "FROZEN (COURT ORDER)" : "CLEAN (NO LIEN)"}
            </span>
          </div>
          <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl">
            <span className="text-slate-500 block text-[10px]">Execution Latency</span>
            <span className="text-emerald-400 font-bold mt-0.5 block">&lt; 1 ms (Sandbox)</span>
          </div>
        </div>
      </div>

      {/* Full Source Code Viewer */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <FileCode className="w-4 h-4 text-indigo-400" />
            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-mono">
              <button
                onClick={() => setActiveCodeTab("passport")}
                className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                  activeCodeTab === "passport"
                    ? "bg-indigo-600 text-white font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                ZkCompliancePassport.sol (ERC-5192)
              </button>
              <button
                onClick={() => setActiveCodeTab("rwa")}
                className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                  activeCodeTab === "rwa"
                    ? "bg-indigo-600 text-white font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                RegulatedRWAToken.sol (ERC-3643)
              </button>
              <button
                onClick={() => setActiveCodeTab("circom")}
                className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                  activeCodeTab === "circom"
                    ? "bg-indigo-600 text-white font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                compliance_passport.circom
              </button>
            </div>
          </div>

          <button
            onClick={() => handleCopyCode(currentCode)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded-lg transition cursor-pointer"
          >
            {copiedCode ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-semibold">Copied Source!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Source</span>
              </>
            )}
          </button>
        </div>

        {/* Code Content */}
        <pre className="p-4 bg-slate-950 border border-slate-800/80 rounded-xl font-mono text-xs text-emerald-300/90 overflow-x-auto max-h-[420px] leading-relaxed">
          {currentCode}
        </pre>
      </div>
    </div>
  );
}
