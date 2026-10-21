"use client";

import React from "react";
import {
  ShieldCheck,
  Cpu,
  Zap,
  Play,
  RotateCcw,
  Sparkles,
  Wallet,
  Activity,
  Layers,
} from "lucide-react";

interface NavbarProps {
  executionMode: "SANDBOX" | "METAMASK";
  setExecutionMode: (mode: "SANDBOX" | "METAMASK") => void;
  connectedWallet: string | null;
  onConnectWallet: () => void;
  onStartWalkthrough: () => void;
  onResetState: () => void;
  activeStage: number;
  setActiveStage: (stage: number) => void;
  isAutoRunning: boolean;
}

export function Navbar({
  executionMode,
  setExecutionMode,
  connectedWallet,
  onConnectWallet,
  onStartWalkthrough,
  onResetState,
  activeStage,
  setActiveStage,
  isAutoRunning,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-xl">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="relative p-2.5 bg-gradient-to-br from-indigo-500/20 via-emerald-500/20 to-sky-500/20 border border-indigo-500/30 rounded-xl shadow-lg">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-300 bg-clip-text text-transparent">
                  zkRegulate
                </span>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold tracking-wider uppercase bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-full">
                  v2.0-INSTITUTIONAL
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Privacy-Preserving RWA & Soulbound Compliance Passport Protocol
              </p>
            </div>
          </div>

          {/* Center: Live Multi-AI Telemetry Badge */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-slate-900/90 border border-slate-800 rounded-xl text-xs font-mono">
            <div className="flex items-center gap-1.5 text-slate-400">
              <Activity className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
              <span>Multi-AI Router:</span>
            </div>
            <div className="flex items-center gap-2 pl-1">
              <span className="flex items-center gap-1 text-emerald-300 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-800/40">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                Nebius (Llama-3.3)
              </span>
              <span className="flex items-center gap-1 text-sky-300 bg-sky-950/50 px-2 py-0.5 rounded border border-sky-800/40">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
                Gemini 2.5
              </span>
              <span className="flex items-center gap-1 text-amber-300 bg-amber-950/50 px-2 py-0.5 rounded border border-amber-800/40">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                HF Mistral
              </span>
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-3">
            {/* Execution Mode Toggle */}
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs font-medium">
              <button
                onClick={() => setExecutionMode("SANDBOX")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  executionMode === "SANDBOX"
                    ? "bg-indigo-600 text-white shadow-md font-semibold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
                title="Zero-gas in-memory EVM execution for instant judge evaluation"
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>EVM Sandbox</span>
              </button>
              <button
                onClick={() => {
                  setExecutionMode("METAMASK");
                  onConnectWallet();
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  executionMode === "METAMASK"
                    ? "bg-emerald-600 text-white shadow-md font-semibold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
                title="Connect live browser Web3 wallet"
              >
                <Wallet className="w-3.5 h-3.5" />
                <span>
                  {connectedWallet
                    ? `${connectedWallet.slice(0, 6)}...${connectedWallet.slice(-4)}`
                    : "Live Wallet"}
                </span>
              </button>
            </div>

            {/* Guided Tour Walkthrough Button */}
            <button
              onClick={onStartWalkthrough}
              disabled={isAutoRunning}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-lg cursor-pointer ${
                isAutoRunning
                  ? "bg-amber-600/80 text-white animate-pulse"
                  : "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-emerald-500/20"
              }`}
            >
              {isAutoRunning ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>Running Demo Tour...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-slate-950" />
                  <span>1-Click Guided Demo</span>
                </>
              )}
            </button>

            {/* Reset State Button */}
            <button
              onClick={onResetState}
              className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 rounded-xl transition cursor-pointer"
              title="Reset state to initial Genesis values"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 5-Stage Step Navigation Bar */}
        <div className="flex items-center justify-between py-2.5 overflow-x-auto no-scrollbar gap-2 border-t border-slate-800/40">
          {[
            { id: 1, label: "Stage 1: AI RegTech Verifier", desc: "Statutory Law & PII Shield" },
            { id: 2, label: "Stage 2: Groth16 ZK Studio", desc: "BN128 Proof & EIP-712" },
            { id: 3, label: "Stage 3: Soulbound Passport", desc: "ERC-5192 Non-Transferable SBT" },
            { id: 4, label: "Stage 4: RWA Token Simulator", desc: "Dhaka-NY Tower ($10M USD)" },
            { id: 5, label: "Stage 5: EVM Telemetry & Audit", desc: "Opcodes & Legal Dossier" },
          ].map((stage) => {
            const isActive = activeStage === stage.id;
            return (
              <button
                key={stage.id}
                onClick={() => setActiveStage(stage.id)}
                className={`flex-1 min-w-[200px] text-left px-3 py-2 rounded-xl border transition cursor-pointer ${
                  isActive
                    ? "bg-indigo-950/60 border-indigo-500/60 shadow-lg text-white"
                    : "bg-slate-900/40 border-slate-800/60 text-slate-400 hover:bg-slate-900 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-bold ${
                      isActive ? "text-indigo-300" : "text-slate-300"
                    }`}
                  >
                    {stage.label}
                  </span>
                  <span
                    className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-mono ${
                      isActive
                        ? "bg-indigo-500 text-white font-bold"
                        : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {stage.id}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 truncate mt-0.5">
                  {stage.desc}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
