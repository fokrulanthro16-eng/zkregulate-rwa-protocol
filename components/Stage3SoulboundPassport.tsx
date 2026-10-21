"use client";

import React, { useState } from "react";
import {
  Award,
  Lock,
  ShieldCheck,
  AlertOctagon,
  Cpu,
  ArrowRight,
  Flame,
  QrCode,
  Sparkles,
  Fingerprint,
  Calendar,
  Building2,
  CheckCircle2,
} from "lucide-react";
import confetti from "canvas-confetti";
import { FullZkPackage } from "@/lib/zk-crypto";
import { DeterministicEvmState, PassportRecord } from "@/lib/evm-engine";

interface Stage3Props {
  zkPackage: FullZkPackage | null;
  evmState: DeterministicEvmState;
  onMintPassport: () => Promise<void>;
  isMinting: boolean;
  onTriggerIllegalTransfer: () => void;
  onProceedToRwa: () => void;
  targetWallet: string;
}

export function Stage3SoulboundPassport({
  zkPackage,
  evmState,
  onMintPassport,
  isMinting,
  onTriggerIllegalTransfer,
  onProceedToRwa,
  targetWallet,
}: Stage3Props) {
  // Find current passport if minted
  const currentTokenId = evmState.wallets[targetWallet]?.passportTokenId || 1001;
  const currentPassport: PassportRecord | undefined =
    evmState.passports[currentTokenId];

  const handleMintWithConfetti = async () => {
    await onMintPassport();
    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
        colors: ["#10b981", "#6366f1", "#38bdf8"],
      });
    } catch {
      // Fallback if confetti canvas unavailable
    }
  };

  const jurisdictionName =
    currentPassport?.jurisdictionCode === 840
      ? "US SEC Regulation D (506c) / OFAC"
      : currentPassport?.jurisdictionCode === 999
      ? "EU MiCA & GDPR Data Directive"
      : "Bangladesh Transfer of Property Act 1882 / BFIU";

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 rounded-2xl shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 text-xs font-mono font-bold bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 rounded-full">
                STAGE 3 OF 5
              </span>
              <span className="text-xs font-mono text-slate-400">
                ON-CHAIN SOULBOUND IDENTITY REGISTRY (ERC-5192)
              </span>
            </div>
            <h2 className="text-2xl font-bold text-white mt-1.5 flex items-center gap-2">
              <Award className="w-6 h-6 text-emerald-400" />
              On-Chain Soulbound Compliance Passport (ERC-5192 SBT)
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-3xl">
              Permanently binds the zero-knowledge attestation to the investor's Ethereum address.
              The ERC-5192 protocol strictly enforces <strong>non-transferability</strong>—any transfer
              or sale attempt is intercepted by EVM opcodes and rolled back.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleMintWithConfetti}
              disabled={isMinting || !zkPackage}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 rounded-xl text-xs font-bold shadow-lg shadow-emerald-500/25 transition cursor-pointer disabled:opacity-50"
            >
              {isMinting ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>Minting On-Chain SBT...</span>
                </>
              ) : (
                <>
                  <Award className="w-4 h-4" />
                  <span>Mint Soulbound Compliance Passport</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Holographic SBT Card + Illegal Transfer Hack Simulation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Holographic Soulbound Passport Card (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative p-6 sm:p-8 rounded-3xl border border-indigo-500/40 holo-card shadow-2xl overflow-hidden code-glow">
            {/* Holographic Watermark Background */}
            <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -left-12 -top-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Top Card Header */}
            <div className="flex items-start justify-between relative z-10">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-indigo-500/30 to-emerald-500/30 border border-emerald-400/40 rounded-2xl shadow-inner">
                  <Fingerprint className="w-8 h-8 text-emerald-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-emerald-300">
                      INSTITUTIONAL PASSPORT
                    </span>
                    <span className="px-2 py-0.5 text-[9px] font-mono font-extrabold bg-indigo-500/30 text-indigo-200 border border-indigo-400/40 rounded-full">
                      ERC-5192 SBT
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-white tracking-tight mt-0.5">
                    zkRegulate Compliance Passport
                  </h3>
                </div>
              </div>

              {/* Token ID Badge */}
              <div className="text-right">
                <div className="px-3 py-1 bg-slate-950/80 border border-indigo-500/50 rounded-xl font-mono text-xs font-bold text-indigo-300 shadow-sm">
                  SBT #{currentTokenId}
                </div>
                <div className="mt-1 flex items-center justify-end gap-1 text-[10px] text-emerald-400 font-mono">
                  <Lock className="w-3 h-3" /> LOCKED TO HOLDER
                </div>
              </div>
            </div>

            {/* Card Body Metrics */}
            <div className="mt-6 space-y-4 relative z-10 font-mono text-xs">
              {/* Holder Wallet */}
              <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl">
                <span className="text-[10px] text-slate-400 block uppercase">
                  Holder Wallet (Non-Transferable Bind)
                </span>
                <span className="text-white font-bold text-xs sm:text-sm break-all mt-0.5 block">
                  {currentPassport?.holder || targetWallet}
                </span>
              </div>

              {/* Two-Column Grid: Jurisdiction + Expiry */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl">
                  <span className="text-[10px] text-slate-400 block uppercase">
                    Jurisdiction Clearance
                  </span>
                  <span className="text-emerald-300 font-semibold block mt-0.5 text-xs truncate">
                    Code {currentPassport?.jurisdictionCode || 840}: {jurisdictionName}
                  </span>
                </div>

                <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl">
                  <span className="text-[10px] text-slate-400 block uppercase">
                    Statutory Validity
                  </span>
                  <span className="text-slate-200 font-semibold flex items-center gap-1.5 mt-0.5 text-xs">
                    <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                    Valid Thru: Oct 2027 (365 Days)
                  </span>
                </div>
              </div>

              {/* Nullifier Hash (Sybil Defense) */}
              <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 block uppercase">
                    On-Chain Nullifier Hash (Double-Mint Prevention)
                  </span>
                  <span className="text-[9px] text-indigo-400 font-mono">
                    SHA-256 WITNESS
                  </span>
                </div>
                <span className="text-indigo-300 font-mono text-[11px] break-all block mt-0.5">
                  {currentPassport?.nullifierHash ||
                    zkPackage?.commitments.nullifierHash ||
                    "0x9c8e11a47890bfe34b829c41a547d2f8310ba98421c60b943210aa8471b029ff"}
                </span>
              </div>
            </div>

            {/* Bottom Holographic Security Seal */}
            <div className="mt-6 pt-4 border-t border-indigo-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 relative z-10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center text-emerald-400">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] font-black tracking-wider text-emerald-300 uppercase block">
                    0 BYTES PII ON-CHAIN
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    Pure ZK Commitment Verification
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-950/90 border border-emerald-500/40 rounded-xl">
                <QrCode className="w-4 h-4 text-emerald-400" />
                <span className="text-[10px] font-mono text-emerald-300 font-bold">
                  STATUS: SOULBOUND ACTIVE
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Hack Simulation & Security Explanations (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Hack Simulation Box */}
          <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
              <Flame className="w-5 h-5 text-rose-500" />
              <div>
                <h4 className="text-sm font-bold text-white">
                  Simulate Illegal Passport Transfer (Hack Test)
                </h4>
                <p className="text-xs text-slate-400">
                  EVM Transfer Lock Stress Test
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              In standard ERC-721 tokens, identities can be transferred, rented, or sold on secondary markets.
              The <strong>zkRegulate ERC-5192 implementation</strong> strictly overrides{" "}
              <code className="text-indigo-300 font-mono">transferFrom()</code> and{" "}
              <code className="text-indigo-300 font-mono">safeTransferFrom()</code> to revert at the EVM opcode level.
            </p>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs space-y-1">
              <div className="text-slate-500 text-[10px]">ATTACK VECTOR:</div>
              <div className="text-slate-300 truncate">
                From: <span className="text-emerald-400">Alice (0x71C...89A)</span>
              </div>
              <div className="text-slate-300 truncate">
                To: <span className="text-rose-400">Hacker (0xDEAD...666)</span>
              </div>
              <div className="text-slate-300">
                TokenID: <span className="text-white">#{currentTokenId}</span>
              </div>
            </div>

            <button
              onClick={onTriggerIllegalTransfer}
              className="w-full py-3 bg-rose-600/80 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-rose-600/20"
            >
              <AlertOctagon className="w-4 h-4" />
              <span>Attempt Illegal Transfer (Trigger Revert)</span>
            </button>
          </div>

          {/* ERC-5192 Statutory Guarantee Box */}
          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-2 text-xs">
            <span className="font-bold text-slate-200 block">
              Institutional Compliance Guarantee:
            </span>
            <ul className="space-y-1.5 text-slate-400 font-mono text-[11px]">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Locked state permanently emits IERC5192.Locked(tokenId)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>OFAC/PEP sanctions revocation supported via regulator kill-switch</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>No civil PII exposed in Ethereum storage or transaction logs</span>
              </li>
            </ul>
          </div>

          {/* Proceed to Stage 4 Button */}
          <button
            onClick={onProceedToRwa}
            className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold rounded-xl text-xs shadow-lg transition cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Proceed to Stage 4: Regulated RWA Simulator</span>
            <ArrowRight className="w-4 h-4 text-slate-950" />
          </button>
        </div>
      </div>
    </div>
  );
}
