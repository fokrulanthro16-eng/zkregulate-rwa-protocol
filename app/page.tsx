"use client";

import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import confetti from "canvas-confetti";
import { Navbar } from "@/components/Navbar";
import { Stage1AICompliance, ApplicantFormData, PRELOADED_TEST_CASES } from "@/components/Stage1AICompliance";
import { Stage2ZKStudio } from "@/components/Stage2ZKStudio";
import { Stage3SoulboundPassport } from "@/components/Stage3SoulboundPassport";
import { Stage4RWASimulator } from "@/components/Stage4RWASimulator";
import { Stage5EVMTerminal } from "@/components/Stage5EVMTerminal";
import { RevertModal } from "@/components/RevertModal";
import { DeterministicEvmState } from "@/lib/evm-engine";
import { FullZkPackage } from "@/lib/zk-crypto";
import { ComplianceEvaluationResult } from "@/lib/ai-compliance-router";

export default function ZkRegulateCommandCenter() {
  const [activeStage, setActiveStage] = useState<number>(1);
  const [executionMode, setExecutionMode] = useState<"SANDBOX" | "METAMASK">("SANDBOX");
  const [connectedWallet, setConnectedWallet] = useState<string | null>(null);
  const [isAutoRunning, setIsAutoRunning] = useState<boolean>(false);

  // In-Memory EVM Engine instance
  const [evmState, setEvmState] = useState<DeterministicEvmState>(() => new DeterministicEvmState());

  // Stage 1 State: Form & AI Evaluation
  const [formData, setFormData] = useState<ApplicantFormData>(PRELOADED_TEST_CASES[0].data);
  const [evaluation, setEvaluation] = useState<ComplianceEvaluationResult | null>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);

  // Stage 2 State: ZK Proof Package
  const [zkPackage, setZkPackage] = useState<FullZkPackage | null>(null);
  const [isGeneratingZk, setIsGeneratingZk] = useState<boolean>(false);

  // Stage 3 State: Soulbound Minting
  const [isMintingSbt, setIsMintingSbt] = useState<boolean>(false);

  // Revert Modal State
  const [revertModalData, setRevertModalData] = useState<{
    isOpen: boolean;
    title: string;
    revertError: string;
    txHash: string;
    blockNumber: number;
    gasUsed: number;
    statutoryReason: string;
    contractMethod: string;
  }>({
    isOpen: false,
    title: "",
    revertError: "",
    txHash: "",
    blockNumber: 0,
    gasUsed: 0,
    statutoryReason: "",
    contractMethod: "",
  });

  // Re-render helper for EVM State updates
  const refreshEvmState = () => {
    setEvmState(Object.assign(new DeterministicEvmState(), evmState));
  };

  // Initial load: automatically perform initial verification for Alice Vance so the app is immediately ready
  useEffect(() => {
    handleRunVerification();
  }, []);

  // Web3 Wallet Connection (MetaMask)
  const handleConnectWallet = async () => {
    if (typeof window !== "undefined" && (window as any).ethereum) {
      try {
        const provider = new ethers.BrowserProvider((window as any).ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        if (accounts.length > 0) {
          setConnectedWallet(accounts[0]);
          setFormData((prev) => ({ ...prev, walletAddress: accounts[0] }));
        }
      } catch (err) {
        console.warn("Wallet connect cancelled or failed:", err);
      }
    } else {
      // Fallback: connect deterministic Alice address
      setConnectedWallet("0x71C67931383707B18E3cE0E73e9112Acb708689A");
    }
  };

  // Stage 1: Call Multi-LLM API
  const handleRunVerification = async () => {
    setIsVerifying(true);
    try {
      const res = await fetch("/api/verify-compliance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success && data.evaluation) {
        setEvaluation(data.evaluation);
      }
    } catch (err) {
      console.error("Verification failed:", err);
    } finally {
      setIsVerifying(false);
    }
  };

  // Stage 2: Generate ZK Proof & EIP-712 Attestation
  const handleGenerateZkProof = async () => {
    setIsGeneratingZk(true);
    try {
      const res = await fetch("/api/generate-zk-proof", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.fullName,
          nationalIdOrPassport: formData.nationalIdOrPassport,
          taxIdNumber: formData.taxIdNumber,
          dateOfBirth: formData.dateOfBirth,
          netWorthUsd: formData.netWorthUsd,
          walletAddress: formData.walletAddress,
          jurisdictionCode: formData.jurisdictionCode,
          isEligible: evaluation?.isEligible ?? true,
          expiryTimestamp: evaluation?.contractParameters.expiryTimestamp,
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setZkPackage(data.data);
      }
    } catch (err) {
      console.error("ZK Proof generation failed:", err);
    } finally {
      setIsGeneratingZk(false);
    }
  };

  // Stage 3: Mint Soulbound Passport
  const handleMintPassport = async () => {
    if (!zkPackage) return;
    setIsMintingSbt(true);

    try {
      // Small simulated latency for institutional mining
      await new Promise((resolve) => setTimeout(resolve, 600));

      const mintRes = evmState.mintPassport(
        formData.walletAddress,
        zkPackage.commitments.zkProofHash,
        zkPackage.commitments.nullifierHash,
        formData.jurisdictionCode,
        Math.floor(Date.now() / 1000) + 31536000
      );

      refreshEvmState();

      if (!mintRes.success && mintRes.error) {
        setRevertModalData({
          isOpen: true,
          title: "Double-Mint Sybil Attack Blocked",
          revertError: mintRes.error,
          txHash: mintRes.txHash,
          blockNumber: evmState.blockNumber,
          gasUsed: mintRes.gasUsed,
          statutoryReason:
            "This identity's Poseidon Nullifier Hash is already registered on-chain. Sybil duplicate passport creation is strictly prohibited.",
          contractMethod: "ZkCompliancePassport.mintCompliancePassport()",
        });
      }
    } finally {
      setIsMintingSbt(false);
    }
  };

  // Stage 3 Hack Simulation: Illegal Transfer of Soulbound Passport
  const handleTriggerIllegalTransfer = () => {
    const res = evmState.simulateIllegalPassportTransfer(
      formData.walletAddress,
      "0xDEADBEEF00000000000000000000000000000666",
      1001
    );
    refreshEvmState();

    setRevertModalData({
      isOpen: true,
      title: "Soulbound Token Transfer Intercepted",
      revertError: res.revertReason,
      txHash: res.txHash,
      blockNumber: evmState.blockNumber,
      gasUsed: res.gasUsed,
      statutoryReason:
        "ERC-5192 standard mandates absolute non-transferability. Compliance identity credentials and Soulbound Passports cannot be sold, gifted, or transferred under statutory securities law.",
      contractMethod: "ZkCompliancePassport.transferFrom()",
    });
  };

  // Stage 4: Scenario A (Compliant Transfer Alice -> Bob)
  const handleExecuteScenarioA = () => {
    const res = evmState.transferRWA(
      "0x71C67931383707B18E3cE0E73e9112Acb708689A",
      "0x94B8A291c9A471C5681Dce712aE3E85a4a58b32F",
      500
    );
    refreshEvmState();

    if (res.success) {
      try {
        confetti({
          particleCount: 50,
          spread: 50,
          origin: { y: 0.7 },
          colors: ["#10b981", "#38bdf8"],
        });
      } catch {}
    } else if (res.error) {
      handleShowRevertModal(res.error, res.txHash, res.gasUsed, res.revertStage);
    }
  };

  // Stage 4: Scenario B (Unverified Buyer Transfer Attempt Alice -> Anon)
  const handleExecuteScenarioB = () => {
    const res = evmState.transferRWA(
      "0x71C67931383707B18E3cE0E73e9112Acb708689A",
      "0xDEADBEEF00000000000000000000000000000666",
      500
    );
    refreshEvmState();

    if (!res.success && res.error) {
      handleShowRevertModal(res.error, res.txHash, res.gasUsed, res.revertStage);
    }
  };

  // Stage 4: Toggle High Court Stay Order
  const handleToggleStayOrder = () => {
    evmState.toggleStayOrder(!evmState.stayOrderActive);
    refreshEvmState();
  };

  // Stage 4: Revoke Bob's Passport
  const handleRevokeBobsPassport = () => {
    evmState.revokePassport(1002, "OFAC PEP Watchlist Sanctions Match");
    refreshEvmState();
  };

  // Stage 4: Reinstate Bob's Passport
  const handleReinstateBobsPassport = () => {
    const bobPassport = evmState.passports[1002];
    if (bobPassport) {
      bobPassport.isRevoked = false;
      bobPassport.isSanctionsCleared = true;
      if (evmState.wallets[bobPassport.holder]) {
        evmState.wallets[bobPassport.holder].status = "ACTIVE";
      }
      evmState.addLog(
        "SSTORE",
        "ZkCompliancePassport",
        "Reinstated Bob's Passport #1002 (Sanctions Cleared)",
        21000
      );
      refreshEvmState();
    }
  };

  // Map EVM Revert to rich explanation
  const handleShowRevertModal = (
    error: string,
    txHash: string,
    gasUsed: number,
    stage?: string
  ) => {
    let title = "Smart Contract Revert Detected";
    let statutoryReason =
      "Statutory compliance check failed in RegulatedRWAToken._beforeTokenTransfer().";

    if (stage === "COURT_STAY_ORDER") {
      title = "High Court Judicial Stay Order Injunction";
      statutoryReason =
        "The High Court has issued an interim injunction (#HC-2026-884) under Section 54 Transfer of Property Act 1882 restraining all alienation or transfer of title for the Dhaka-NY Commercial Tower.";
    } else if (stage === "BUYER_PASSPORT") {
      title = "Unverified Buyer Compliance Interception";
      statutoryReason =
        "Under SEC Regulation D Rule 506(c) and EU MiCA Article 16, institutional RWAs can only be transferred to wallets possessing an active, unexpired Soulbound ZK Compliance Passport.";
    } else if (stage === "SELLER_PASSPORT") {
      title = "Seller Sanctions or Revocation Freeze";
      statutoryReason =
        "The seller's Soulbound Passport has expired or been revoked due to adverse sanctions watchlist screening.";
    }

    setRevertModalData({
      isOpen: true,
      title,
      revertError: error,
      txHash,
      blockNumber: evmState.blockNumber,
      gasUsed,
      statutoryReason,
      contractMethod: "RegulatedRWAToken.transfer()",
    });
  };

  // Reset to initial clean state
  const handleResetState = () => {
    evmState.resetToDefault();
    refreshEvmState();
    setFormData(PRELOADED_TEST_CASES[0].data);
    setEvaluation(null);
    setZkPackage(null);
    setActiveStage(1);
    handleRunVerification();
  };

  // 1-Click Guided Judge Walkthrough
  const handleStartWalkthrough = async () => {
    if (isAutoRunning) return;
    setIsAutoRunning(true);

    try {
      // Step 1: Ensure Stage 1 has Alice Vance and run AI verification
      setActiveStage(1);
      setFormData(PRELOADED_TEST_CASES[0].data);
      await handleRunVerification();
      await new Promise((r) => setTimeout(r, 1400));

      // Step 2: Move to Stage 2 and generate ZK Proof
      setActiveStage(2);
      await handleGenerateZkProof();
      await new Promise((r) => setTimeout(r, 1600));

      // Step 3: Move to Stage 3 and mint Soulbound Passport
      setActiveStage(3);
      await handleMintPassport();
      await new Promise((r) => setTimeout(r, 1600));

      // Step 4: Move to Stage 4 and execute compliant transfer
      setActiveStage(4);
      handleExecuteScenarioA();
      await new Promise((r) => setTimeout(r, 1600));

      // Step 5: Toggle High Court Stay Order to show real revert in action
      handleToggleStayOrder();
      await new Promise((r) => setTimeout(r, 800));
      handleExecuteScenarioA(); // Will trigger court freeze revert!
      await new Promise((r) => setTimeout(r, 2000));

      // Step 6: Move to Stage 5 for opcode audit trace
      setActiveStage(5);
    } finally {
      setIsAutoRunning(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        executionMode={executionMode}
        setExecutionMode={setExecutionMode}
        connectedWallet={connectedWallet}
        onConnectWallet={handleConnectWallet}
        onStartWalkthrough={handleStartWalkthrough}
        onResetState={handleResetState}
        activeStage={activeStage}
        setActiveStage={setActiveStage}
        isAutoRunning={isAutoRunning}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-6">
        {activeStage === 1 && (
          <Stage1AICompliance
            formData={formData}
            setFormData={setFormData}
            evaluation={evaluation}
            onVerify={handleRunVerification}
            isVerifying={isVerifying}
            onProceedToZk={async () => {
              if (!zkPackage) {
                await handleGenerateZkProof();
              }
              setActiveStage(2);
            }}
          />
        )}

        {activeStage === 2 && (
          <Stage2ZKStudio
            zkPackage={zkPackage}
            onGenerateProof={handleGenerateZkProof}
            isGenerating={isGeneratingZk}
            onProceedToSbt={() => setActiveStage(3)}
          />
        )}

        {activeStage === 3 && (
          <Stage3SoulboundPassport
            zkPackage={zkPackage}
            evmState={evmState}
            onMintPassport={handleMintPassport}
            isMinting={isMintingSbt}
            onTriggerIllegalTransfer={handleTriggerIllegalTransfer}
            onProceedToRwa={() => setActiveStage(4)}
            targetWallet={formData.walletAddress}
          />
        )}

        {activeStage === 4 && (
          <Stage4RWASimulator
            evmState={evmState}
            onExecuteScenarioA={handleExecuteScenarioA}
            onExecuteScenarioB={handleExecuteScenarioB}
            onToggleStayOrder={handleToggleStayOrder}
            onRevokeBobsPassport={handleRevokeBobsPassport}
            onReinstateBobsPassport={handleReinstateBobsPassport}
            onProceedToStage5={() => setActiveStage(5)}
          />
        )}

        {activeStage === 5 && (
          <Stage5EVMTerminal
            evmState={evmState}
            zkPackage={zkPackage}
            evaluation={evaluation}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 text-xs text-slate-500 font-mono">
        <div className="w-full px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-slate-400 font-semibold">zkRegulate Protocol</span>
            <span>| Institutional Zero-Knowledge RWA Compliance Engine</span>
          </div>
          <div>
            Built with Groth16 ZK-SNARKs, ERC-5192 Soulbound Tokens & ERC-3643 Permissioned Assets
          </div>
        </div>
      </footer>

      {/* Revert Modal Dialog */}
      <RevertModal
        isOpen={revertModalData.isOpen}
        onClose={() => setRevertModalData((prev) => ({ ...prev, isOpen: false }))}
        title={revertModalData.title}
        revertError={revertModalData.revertError}
        txHash={revertModalData.txHash}
        blockNumber={revertModalData.blockNumber}
        gasUsed={revertModalData.gasUsed}
        statutoryReason={revertModalData.statutoryReason}
        contractMethod={revertModalData.contractMethod}
      />
    </div>
  );
}
