"use client";

import React, { useState } from "react";
import {
  Building,
  Layers,
  ArrowRightLeft,
  ShieldCheck,
  ShieldAlert,
  AlertOctagon,
  Scale,
  CheckCircle2,
  XCircle,
  Coins,
  ArrowRight,
  Sparkles,
  RefreshCcw,
  UserCheck,
  UserX,
  Gavel,
} from "lucide-react";
import { DeterministicEvmState } from "@/lib/evm-engine";

interface Stage4Props {
  evmState: DeterministicEvmState;
  onExecuteScenarioA: () => void;
  onExecuteScenarioB: () => void;
  onToggleStayOrder: () => void;
  onRevokeBobsPassport: () => void;
  onReinstateBobsPassport: () => void;
  onProceedToStage5: () => void;
}

export function Stage4RWASimulator({
  evmState,
  onExecuteScenarioA,
  onExecuteScenarioB,
  onToggleStayOrder,
  onRevokeBobsPassport,
  onReinstateBobsPassport,
  onProceedToStage5,
}: Stage4Props) {
  const [transferAmount, setTransferAmount] = useState<number>(500);

  const alice = evmState.wallets["0x71C67931383707B18E3cE0E73e9112Acb708689A"];
  const bob = evmState.wallets["0x94B8A291c9A471C5681Dce712aE3E85a4a58b32F"];
  const anon = evmState.wallets["0xDEADBEEF00000000000000000000000000000666"];

  const isBobRevoked = bob?.status === "REVOKED";

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 rounded-2xl shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 text-xs font-mono font-bold bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 rounded-full">
                STAGE 4 OF 5
              </span>
              <span className="text-xs font-mono text-slate-400">
                SELF-REGULATING RWA SMART CONTRACT SIMULATOR
              </span>
            </div>
            <h2 className="text-2xl font-bold text-white mt-1.5 flex items-center gap-2">
              <Building className="w-6 h-6 text-indigo-400" />
              Dhaka-NY Prime Commercial Tower RWA ($BLDG-RWA)
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-3xl">
              Valuation: <strong>$10,000,000 USD (100 Crore BDT)</strong> | Total Supply:{" "}
              <strong>100,000 Fractional Shares ($100/token)</strong>. Enforces statutory compliance
              in <strong>&lt;1 second</strong> on every transfer via the automated{" "}
              <code className="text-indigo-300 font-mono">_beforeTokenTransfer</code> hook.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Stay order quick indicator badge */}
            <div
              className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-bold flex items-center gap-1.5 ${
                evmState.stayOrderActive
                  ? "bg-rose-950/80 border-rose-500 text-rose-300 animate-pulse"
                  : "bg-emerald-950/80 border-emerald-500/40 text-emerald-300"
              }`}
            >
              <Gavel className="w-4 h-4" />
              <span>
                {evmState.stayOrderActive
                  ? "HIGH COURT STAY ORDER: ACTIVE"
                  : "COURT STATUS: TITLE CLEAR"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Live Wallet Registry & Balances Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Coins className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">
              Live Permissioned Wallet Registry & Token Balances
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400">
            ERC-3643 Permissioned Token Standard
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[11px] uppercase">
                <th className="pb-2.5">Entity / Role</th>
                <th className="pb-2.5">Wallet Address</th>
                <th className="pb-2.5">Token Balance ($BLDG-RWA)</th>
                <th className="pb-2.5">Asset Equity (USD)</th>
                <th className="pb-2.5">Soulbound ZK Passport</th>
                <th className="pb-2.5 text-right">Transfer Eligibility</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {/* Alice */}
              <tr className="hover:bg-slate-800/30">
                <td className="py-3 font-semibold text-white">
                  Alice (Verified Seller)
                </td>
                <td className="py-3 text-slate-400">
                  {alice?.address.slice(0, 10)}...{alice?.address.slice(-6)}
                </td>
                <td className="py-3 text-emerald-400 font-bold">
                  {alice?.rwaBalance.toLocaleString()} shares
                </td>
                <td className="py-3 text-slate-300">
                  ${((alice?.rwaBalance || 0) * 100).toLocaleString()} USD
                </td>
                <td className="py-3">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    ACTIVE (SBT #{alice?.passportTokenId})
                  </span>
                </td>
                <td className="py-3 text-right">
                  <span className="text-emerald-400 font-semibold flex items-center justify-end gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> CLEARED
                  </span>
                </td>
              </tr>

              {/* Bob */}
              <tr className="hover:bg-slate-800/30">
                <td className="py-3 font-semibold text-white">
                  Bob (Verified Buyer)
                </td>
                <td className="py-3 text-slate-400">
                  {bob?.address.slice(0, 10)}...{bob?.address.slice(-6)}
                </td>
                <td className="py-3 text-emerald-400 font-bold">
                  {bob?.rwaBalance.toLocaleString()} shares
                </td>
                <td className="py-3 text-slate-300">
                  ${((bob?.rwaBalance || 0) * 100).toLocaleString()} USD
                </td>
                <td className="py-3">
                  {isBobRevoked ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                      REVOKED (OFAC HIT)
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      ACTIVE (SBT #{bob?.passportTokenId})
                    </span>
                  )}
                </td>
                <td className="py-3 text-right">
                  {isBobRevoked ? (
                    <span className="text-rose-400 font-semibold flex items-center justify-end gap-1">
                      <XCircle className="w-3.5 h-3.5" /> BLOCKED
                    </span>
                  ) : (
                    <span className="text-emerald-400 font-semibold flex items-center justify-end gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> CLEARED
                    </span>
                  )}
                </td>
              </tr>

              {/* Anon / Hacker */}
              <tr className="hover:bg-slate-800/30">
                <td className="py-3 font-semibold text-rose-300">
                  Anon / Hacker (Unverified)
                </td>
                <td className="py-3 text-slate-400">
                  {anon?.address.slice(0, 10)}...{anon?.address.slice(-6)}
                </td>
                <td className="py-3 text-slate-500 font-bold">
                  {anon?.rwaBalance} shares
                </td>
                <td className="py-3 text-slate-500">$0 USD</td>
                <td className="py-3">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
                    NONE (UNVERIFIED)
                  </span>
                </td>
                <td className="py-3 text-right">
                  <span className="text-rose-400 font-semibold flex items-center justify-end gap-1">
                    <XCircle className="w-3.5 h-3.5" /> REJECTED
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Interactive 4-Scenario Smart Contract Execution Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Scenario A: Compliant Transfer */}
        <div className="p-5 bg-slate-900/90 border border-emerald-500/30 rounded-2xl space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded">
              SCENARIO A: 100% COMPLIANT TRANSFER
            </span>
            <span className="text-xs font-mono text-emerald-400">Expected: SUCCESS</span>
          </div>

          <h4 className="text-sm font-bold text-white">
            Alice (Verified) &rarr; Bob (Verified)
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            Both parties hold valid Soulbound Passports, no court stays exist, and jurisdiction matches.
            The smart contract executes the transfer in &lt;1 second.
          </p>

          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono flex items-center justify-between text-slate-300">
            <span>Amount: 500 $BLDG-RWA ($50,000 USD)</span>
            <span className="text-emerald-400 font-semibold">Checks 1-4: PASS</span>
          </div>

          <button
            onClick={onExecuteScenarioA}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
          >
            <CheckCircle2 className="w-4 h-4 text-slate-950" />
            <span>Execute Compliant Transfer (500 Shares)</span>
          </button>
        </div>

        {/* Scenario B: Unverified Buyer Transfer Attempt */}
        <div className="p-5 bg-slate-900/90 border border-rose-500/30 rounded-2xl space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 rounded">
              SCENARIO B: UNVERIFIED BUYER ATTEMPT
            </span>
            <span className="text-xs font-mono text-rose-400">Expected: REVERT</span>
          </div>

          <h4 className="text-sm font-bold text-white">
            Alice (Verified) &rarr; Anon (0xDEAD...666)
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            Alice attempts to transfer RWA shares to a wallet lacking a Soulbound Compliance Passport.
            The <code className="text-rose-300 font-mono">_beforeTokenTransfer</code> hook automatically reverts.
          </p>

          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono flex items-center justify-between text-rose-300">
            <span>Amount: 500 $BLDG-RWA</span>
            <span className="font-semibold">Revert: BUYER_PASSPORT_MISSING</span>
          </div>

          <button
            onClick={onExecuteScenarioB}
            className="w-full py-2.5 bg-rose-600/80 hover:bg-rose-500 text-white font-bold rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-rose-600/20"
          >
            <AlertOctagon className="w-4 h-4" />
            <span>Attempt Transfer to Unverified Wallet</span>
          </button>
        </div>

        {/* Scenario C: Emergency High Court Stay Order Toggle */}
        <div className="p-5 bg-slate-900/90 border border-amber-500/30 rounded-2xl space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded">
              SCENARIO C: HIGH COURT STAY ORDER
            </span>
            <span
              className={`text-xs font-mono font-bold ${
                evmState.stayOrderActive ? "text-rose-400" : "text-slate-400"
              }`}
            >
              State: {evmState.stayOrderActive ? "FROZEN" : "INACTIVE"}
            </span>
          </div>

          <h4 className="text-sm font-bold text-white">
            Judicial Stay Order Toggle (Case #HC-2026-884)
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            Simulate a judicial registrar issuing an injunction under Section 54 Transfer of Property Act.
            When active, <strong>ALL transfers on the RWA token are frozen</strong>, even between verified parties!
          </p>

          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono flex items-center justify-between text-amber-300">
            <span>Case: High Court Injunction #HC-2026-884</span>
            <span className="font-semibold">
              {evmState.stayOrderActive ? "BLOCKS ALL TRANSFERS" : "OFF"}
            </span>
          </div>

          <button
            onClick={onToggleStayOrder}
            className={`w-full py-2.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-2 shadow-lg ${
              evmState.stayOrderActive
                ? "bg-amber-600 hover:bg-amber-500 text-slate-950"
                : "bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/40"
            }`}
          >
            <Gavel className="w-4 h-4" />
            <span>
              {evmState.stayOrderActive
                ? "Lift High Court Stay Order (Unfreeze)"
                : "Impose High Court Stay Order (Freeze RWA)"}
            </span>
          </button>
        </div>

        {/* Scenario D: Sanctions Revocation Kill-Switch */}
        <div className="p-5 bg-slate-900/90 border border-indigo-500/30 rounded-2xl space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 rounded">
              SCENARIO D: SANCTIONS KILL-SWITCH
            </span>
            <span
              className={`text-xs font-mono font-bold ${
                isBobRevoked ? "text-rose-400" : "text-emerald-400"
              }`}
            >
              Bob Status: {isBobRevoked ? "REVOKED" : "CLEARED"}
            </span>
          </div>

          <h4 className="text-sm font-bold text-white">
            OFAC Sanctions Revocation Kill-Switch
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            Simulate an emergency regulator notice flagging Bob's Nullifier Hash on an OFAC PEP watchlist.
            Revoking Bob's SBT instantly blocks all inbound and outbound RWA transactions.
          </p>

          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono flex items-center justify-between text-indigo-300">
            <span>Target: Bob (SBT #1002)</span>
            <span className="font-semibold">
              {isBobRevoked ? "PASSPORT REVOKED" : "PASSPORT VALID"}
            </span>
          </div>

          {isBobRevoked ? (
            <button
              onClick={onReinstateBobsPassport}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
            >
              <UserCheck className="w-4 h-4 text-slate-950" />
              <span>Reinstate Bob's Passport (Clear Sanctions)</span>
            </button>
          ) : (
            <button
              onClick={onRevokeBobsPassport}
              className="w-full py-2.5 bg-rose-600/80 hover:bg-rose-500 text-white font-bold rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-rose-600/20"
            >
              <UserX className="w-4 h-4" />
              <span>Revoke Bob's Passport (Simulate OFAC Hit)</span>
            </button>
          )}
        </div>
      </div>

      {/* Proceed to Stage 5 */}
      <div className="pt-2 flex justify-end">
        <button
          onClick={onProceedToStage5}
          className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold rounded-xl text-xs shadow-lg transition cursor-pointer flex items-center gap-2"
        >
          <span>Proceed to Stage 5: EVM Telemetry & Audit Dossier</span>
          <ArrowRight className="w-4 h-4 text-slate-950" />
        </button>
      </div>
    </div>
  );
}
