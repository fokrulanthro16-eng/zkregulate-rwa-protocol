"use client";

import React from "react";
import { AlertOctagon, X, ShieldAlert, Cpu, ArrowRight } from "lucide-react";

interface RevertModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  revertError: string;
  txHash: string;
  blockNumber: number;
  gasUsed: number;
  statutoryReason: string;
  contractMethod: string;
}

export function RevertModal({
  isOpen,
  onClose,
  title,
  revertError,
  txHash,
  blockNumber,
  gasUsed,
  statutoryReason,
  contractMethod,
}: RevertModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border-2 border-rose-500/80 rounded-2xl p-6 shadow-2xl card-glow-rose overflow-hidden">
        {/* Glowing header accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 via-amber-500 to-rose-600 animate-pulse" />

        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-rose-500/20 border border-rose-500/40 rounded-xl text-rose-400">
              <AlertOctagon className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-xs font-mono font-semibold bg-rose-500/20 border border-rose-500/40 text-rose-300 rounded">
                  EVM REVERT DETECTED
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  BLOCK #{blockNumber}
                </span>
              </div>
              <h3 className="text-xl font-bold text-white mt-1">{title}</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Revert error message box */}
        <div className="mt-5 p-4 bg-rose-950/40 border border-rose-800/60 rounded-xl font-mono text-sm text-rose-200 break-words">
          <div className="text-xs text-rose-400 font-semibold mb-1 uppercase tracking-wider">
            Smart Contract Revert Trace:
          </div>
          <div className="text-rose-100 font-bold">{revertError}</div>
        </div>

        {/* Legal & Regulatory Breakdown */}
        <div className="mt-4 p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4" />
            Statutory Legal Rationale
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">
            {statutoryReason}
          </p>
        </div>

        {/* Telemetry info */}
        <div className="mt-4 grid grid-cols-3 gap-3 text-xs font-mono">
          <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-lg">
            <span className="text-slate-500 block">Method Invoked</span>
            <span className="text-slate-200 font-semibold truncate block mt-0.5">
              {contractMethod}
            </span>
          </div>
          <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-lg">
            <span className="text-slate-500 block">Gas Consumed</span>
            <span className="text-amber-400 font-semibold block mt-0.5">
              {gasUsed.toLocaleString()} units
            </span>
          </div>
          <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-lg">
            <span className="text-slate-500 block">State Outcome</span>
            <span className="text-rose-400 font-semibold block mt-0.5">
              ROLLBACK (0 State Changes)
            </span>
          </div>
        </div>

        <div className="mt-4 p-2.5 bg-slate-950/40 border border-slate-800/60 rounded-lg flex items-center justify-between text-xs font-mono text-slate-400">
          <span>TX: {txHash.slice(0, 18)}...{txHash.slice(-8)}</span>
          <span className="text-emerald-400 flex items-center gap-1">
            <Cpu className="w-3.5 h-3.5" /> 100% On-Chain Protected
          </span>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-semibold transition flex items-center gap-2 cursor-pointer"
          >
            Acknowledge Revert <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
