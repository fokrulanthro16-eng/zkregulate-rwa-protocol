"use client";

import React, { useState } from "react";
import {
  Binary,
  Cpu,
  FileCode2,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Copy,
  Check,
  ShieldAlert,
  ArrowRight,
  ShieldCheck,
  Flame,
  Activity,
} from "lucide-react";
import { FullZkPackage, verifyGroth16Proof } from "@/lib/zk-crypto";

interface Stage2Props {
  zkPackage: FullZkPackage | null;
  onGenerateProof: () => Promise<void>;
  isGenerating: boolean;
  onProceedToSbt: () => void;
}

export function Stage2ZKStudio({
  zkPackage,
  onGenerateProof,
  isGenerating,
  onProceedToSbt,
}: Stage2Props) {
  const [activeTab, setActiveTab] = useState<
    "proof" | "publicSignals" | "eip712" | "commitments"
  >("proof");
  const [copiedTab, setCopiedTab] = useState(false);
  const [isTampered, setIsTampered] = useState(false);
  const [tamperedPackage, setTamperedPackage] = useState<FullZkPackage | null>(null);
  const [verificationResult, setVerificationResult] = useState<{
    isValid: boolean;
    error?: string;
    gasEstimate?: number;
  } | null>(null);

  // Trigger mathematical Groth16 verification whenever package changes
  React.useEffect(() => {
    if (zkPackage) {
      const active = isTampered && tamperedPackage ? tamperedPackage : zkPackage;
      const res = verifyGroth16Proof(active.proof, active.publicSignals);
      setVerificationResult({
        isValid: res.isValid,
        error: res.error,
        gasEstimate: res.pairingGasEstimate,
      });
    }
  }, [zkPackage, isTampered, tamperedPackage]);

  const handleTamperProof = () => {
    if (!zkPackage) return;
    const cloned: FullZkPackage = JSON.parse(JSON.stringify(zkPackage));
    // Tamper with public signals: change eligibility bit from 1 to 0 or modify nullifier decimal
    cloned.publicSignals[0] = "0"; // Flip eligibility bit to simulate forged compliance
    cloned.proof.publicSignals[0] = "0";
    setTamperedPackage(cloned);
    setIsTampered(true);
  };

  const handleRestoreProof = () => {
    setIsTampered(false);
    setTamperedPackage(null);
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedTab(true);
    setTimeout(() => setCopiedTab(false), 1800);
  };

  const currentData = isTampered && tamperedPackage ? tamperedPackage : zkPackage;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 rounded-2xl shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 text-xs font-mono font-bold bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 rounded-full">
                STAGE 2 OF 5
              </span>
              <span className="text-xs font-mono text-slate-400">
                GROTH16 ZK-SNARK & EIP-712 CRYPTOGRAPHIC ENGINE
              </span>
            </div>
            <h2 className="text-2xl font-bold text-white mt-1.5 flex items-center gap-2">
              <Binary className="w-6 h-6 text-indigo-400" />
              Zero-Knowledge Proof (Groth16) & EIP-712 Studio
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-3xl">
              Synthesizes zero-knowledge proof vectors over the <strong>alt_bn128 curve</strong>.
              Proves legal compliance and accredited qualification with <strong>0 bytes of personal data</strong> exposed.
              Binds the proof to the investor's wallet via <strong>EIP-712 Typed Data</strong> to prevent front-running.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onGenerateProof}
              disabled={isGenerating}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-sky-500 hover:from-indigo-400 hover:to-sky-400 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-500/25 transition cursor-pointer disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Groth16...</span>
                </>
              ) : (
                <>
                  <Cpu className="w-4 h-4" />
                  <span>Generate ZK-SNARK Proof</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Visual Circuit Architecture Diagram */}
      <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Circom 2.1.6 R1CS Circuit Architecture (4,812 Non-Linear Constraints)
            </h3>
          </div>
          <span className="text-xs font-mono text-indigo-300 bg-indigo-950/60 px-2.5 py-0.5 rounded border border-indigo-800/40">
            Curve: alt_bn128 (Ethereum Precompile 0x08)
          </span>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
          {/* Box 1: Private Witness (Hidden) */}
          <div className="p-4 bg-slate-950/90 border border-slate-800 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-bold uppercase text-[11px]">
                1. Private Witness Signals
              </span>
              <span className="px-1.5 py-0.5 text-[9px] bg-rose-500/20 text-rose-300 rounded font-semibold">
                STRICTLY PRIVATE
              </span>
            </div>
            <div className="space-y-1 text-slate-300 text-[11px]">
              <div className="text-emerald-400">witness.investorBirthYear</div>
              <div className="text-emerald-400">witness.taxComplianceStatus</div>
              <div className="text-emerald-400">witness.sanctionsFlag = 0</div>
              <div className="text-emerald-400">witness.identityTrapdoor (SHA-256)</div>
              <div className="text-emerald-400">witness.identityNullifier (Secret)</div>
            </div>
            <p className="text-[10px] text-slate-500 pt-1 border-t border-slate-800">
              Scrubbed off-chain. Never leaves memory.
            </p>
          </div>

          {/* Box 2: Circom Constraints Engine */}
          <div className="p-4 bg-indigo-950/30 border border-indigo-500/40 rounded-xl space-y-2 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-indigo-300 font-bold uppercase text-[11px]">
                2. Circom R1CS Arithmetic
              </span>
              <span className="px-1.5 py-0.5 text-[9px] bg-indigo-500/30 text-indigo-200 rounded font-semibold">
                4,812 GATES
              </span>
            </div>
            <div className="space-y-1 text-indigo-200 text-[11px]">
              <div>GreaterEqThan(8): Age &gt;= 18</div>
              <div>taxComplianceStatus === 1</div>
              <div>sanctionsFlag === 0 (OFAC)</div>
              <div>Poseidon(2): Nullifier Hash Match</div>
              <div>BN128 Bilinear Pairing e(A, B)</div>
            </div>
            <p className="text-[10px] text-indigo-400/80 pt-1 border-t border-indigo-500/20">
              Evaluates QAP polynomial satisfying constraints.
            </p>
          </div>

          {/* Box 3: Public Signals Verified On-Chain */}
          <div className="p-4 bg-slate-950/90 border border-slate-800 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-bold uppercase text-[11px]">
                3. Public Signals (On-Chain)
              </span>
              <span className="px-1.5 py-0.5 text-[9px] bg-emerald-500/20 text-emerald-300 rounded font-semibold">
                PUBLIC VERIFIABLE
              </span>
            </div>
            <div className="space-y-1 text-slate-300 text-[11px]">
              <div>signal[0]: isEligible = 1</div>
              <div>signal[1]: jurisdictionCode = 840</div>
              <div>signal[2]: expiryTimestamp</div>
              <div>signal[3]: nullifierHash (Anti-Sybil)</div>
              <div>signal[4]: merkleRoot (Identity Group)</div>
            </div>
            <p className="text-[10px] text-slate-500 pt-1 border-t border-slate-800">
              Verified on Ethereum by pairing precompile in ~198k gas.
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Cryptographic Inspector & Live Verification */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Verification Badge & Tamper Attack Suite (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Verification Status Card */}
          <div
            className={`p-5 rounded-2xl border transition ${
              verificationResult?.isValid
                ? "bg-slate-900/90 border-emerald-500/50 card-glow-emerald"
                : "bg-rose-950/40 border-rose-500/60 card-glow-rose"
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Mathematical ZK Verification
              </span>
              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                  verificationResult?.isValid
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                    : "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                }`}
              >
                {verificationResult?.isValid ? "PROVED VALID" : "FORGERY DETECTED"}
              </span>
            </div>

            <div className="py-4 text-center">
              {verificationResult?.isValid ? (
                <div className="flex flex-col items-center">
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-400 mb-2">
                    <ShieldCheck className="w-10 h-10" />
                  </div>
                  <h4 className="text-base font-bold text-white">
                    Groth16 Proof Mathematically Sound
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs">
                    Curve BN128 bilinear pairing constraints satisfied:{" "}
                    <code className="text-emerald-300">e(A,B) == e(α,β)·e(C,δ)·e(x,γ)</code>
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="p-3 bg-rose-500/20 border border-rose-500/40 rounded-2xl text-rose-400 mb-2 animate-bounce">
                    <ShieldAlert className="w-10 h-10" />
                  </div>
                  <h4 className="text-base font-bold text-rose-300">
                    Pairing Constraint Violation
                  </h4>
                  <p className="text-xs text-rose-200 mt-1 font-mono break-words max-w-xs">
                    {verificationResult?.error}
                  </p>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-800 grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2.5 bg-slate-950 rounded-lg">
                <span className="text-slate-500 block text-[10px]">EVM Precompile</span>
                <span className="text-slate-200 font-semibold">0x08 (alt_bn128)</span>
              </div>
              <div className="p-2.5 bg-slate-950 rounded-lg">
                <span className="text-slate-500 block text-[10px]">Gas Consumption</span>
                <span className="text-amber-400 font-semibold">
                  {verificationResult?.gasEstimate?.toLocaleString() || 198420} units
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Tamper Proof Attack Box */}
          <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-3">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-400" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Hackathon Judge Attack Test
              </h4>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Test the mathematical resilience of the Groth16 circuit. Click below to tamper 1 byte of the
              public signals (flip eligibility bit). Observe how the ZK verifier immediately rejects the forgery!
            </p>

            <div className="pt-1 flex gap-2">
              {!isTampered ? (
                <button
                  onClick={handleTamperProof}
                  disabled={!zkPackage}
                  className="flex-1 py-2.5 bg-rose-600/80 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
                >
                  <Flame className="w-4 h-4" />
                  <span>Tamper Proof (Flip 1 Byte)</span>
                </button>
              ) : (
                <button
                  onClick={handleRestoreProof}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Restore Valid Proof</span>
                </button>
              )}
            </div>
          </div>

          {/* Proceed to Stage 3 */}
          <button
            onClick={onProceedToSbt}
            disabled={!verificationResult?.isValid}
            className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold rounded-xl text-xs shadow-lg transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <span>Proceed to Stage 3: Mint Soulbound Passport</span>
            <ArrowRight className="w-4 h-4 text-slate-950" />
          </button>
        </div>

        {/* Right: Cryptographic Payload Inspector Tabs (8 Cols) */}
        <div className="lg:col-span-8 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
          {/* Tab Navigation */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <FileCode2 className="w-4 h-4 text-indigo-400" />
              <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-mono">
                <button
                  onClick={() => setActiveTab("proof")}
                  className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                    activeTab === "proof"
                      ? "bg-indigo-600 text-white font-bold"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  proof.json
                </button>
                <button
                  onClick={() => setActiveTab("publicSignals")}
                  className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                    activeTab === "publicSignals"
                      ? "bg-indigo-600 text-white font-bold"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  publicSignals.json
                </button>
                <button
                  onClick={() => setActiveTab("eip712")}
                  className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                    activeTab === "eip712"
                      ? "bg-indigo-600 text-white font-bold"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  eip712Signature.json
                </button>
                <button
                  onClick={() => setActiveTab("commitments")}
                  className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                    activeTab === "commitments"
                      ? "bg-indigo-600 text-white font-bold"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  commitments.json
                </button>
              </div>
            </div>

            <button
              onClick={() => {
                if (!currentData) return;
                const jsonStr =
                  activeTab === "proof"
                    ? JSON.stringify(currentData.proof, null, 2)
                    : activeTab === "publicSignals"
                    ? JSON.stringify(currentData.publicSignals, null, 2)
                    : activeTab === "eip712"
                    ? JSON.stringify(currentData.attestation, null, 2)
                    : JSON.stringify(currentData.commitments, null, 2);
                handleCopy(jsonStr);
              }}
              className="flex items-center gap-1.5 px-3 py-1 text-xs text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded-lg transition cursor-pointer"
            >
              {copiedTab ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Payload</span>
                </>
              )}
            </button>
          </div>

          {/* Active Tab Content Viewer */}
          <div className="relative">
            <pre className="p-4 bg-slate-950 border border-slate-800/80 rounded-xl font-mono text-xs text-indigo-300 overflow-x-auto max-h-[380px] leading-relaxed">
              {currentData ? (
                activeTab === "proof" ? (
                  JSON.stringify(currentData.proof, null, 2)
                ) : activeTab === "publicSignals" ? (
                  JSON.stringify(
                    {
                      description: "Public signals verified on-chain by ZkCompliancePassport",
                      isEligibleBit: currentData.publicSignals[0],
                      jurisdictionCode: currentData.publicSignals[1],
                      expiryTimestamp: currentData.publicSignals[2],
                      nullifierHashDecimal: currentData.publicSignals[3],
                      merkleRootDecimal: currentData.publicSignals[4],
                      rawSignals: currentData.publicSignals,
                    },
                    null,
                    2
                  )
                ) : activeTab === "eip712" ? (
                  JSON.stringify(currentData.attestation, null, 2)
                ) : (
                  JSON.stringify(currentData.commitments, null, 2)
                )
              ) : (
                "// No ZK proof generated yet. Click 'Generate ZK-SNARK Proof' above."
              )}
            </pre>
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs font-mono text-slate-400">
            <div className="p-2.5 bg-slate-950/60 border border-slate-800/60 rounded-lg">
              <span className="text-slate-500 block text-[10px]">Curve Generator</span>
              <span className="text-slate-200">alt_bn128 (Ethereum)</span>
            </div>
            <div className="p-2.5 bg-slate-950/60 border border-slate-800/60 rounded-lg">
              <span className="text-slate-500 block text-[10px]">Proof Format</span>
              <span className="text-slate-200">Groth16 (3 group elements)</span>
            </div>
            <div className="p-2.5 bg-slate-950/60 border border-slate-800/60 rounded-lg">
              <span className="text-slate-500 block text-[10px]">Anti-Frontrun</span>
              <span className="text-emerald-400">EIP-712 ECDSA Bound</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
