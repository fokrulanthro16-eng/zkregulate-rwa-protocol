/**
 * zkRegulate In-Memory Deterministic EVM State Engine
 * Simulates Ethereum EVM execution, opcodes, gas telemetry, and smart contract reverts in <1ms.
 */

export interface EvmLogEntry {
  id: string;
  timestamp: string;
  blockNumber: number;
  txHash: string;
  type: "CALL" | "SLOAD" | "SSTORE" | "LOG" | "REVERT" | "SUCCESS" | "INFO";
  contract: "ZkCompliancePassport" | "RegulatedRWAToken" | "CircomVerifier";
  message: string;
  gasCost: number;
}

export interface PassportRecord {
  tokenId: number;
  holder: string;
  zkProofHash: string;
  nullifierHash: string;
  jurisdictionCode: number;
  expiryTimestamp: number;
  isSanctionsCleared: boolean;
  isRevoked: boolean;
  issuanceBlock: number;
}

export interface WalletState {
  address: string;
  name: string;
  rwaBalance: number;
  passportTokenId: number | null;
  status: "ACTIVE" | "UNVERIFIED" | "REVOKED";
  jurisdictionCode: number;
}

export const GENESIS_EXPIRY_TIMESTAMP = 1792684800; // Fixed institutional validity (Oct 2027)

export class DeterministicEvmState {
  public blockNumber: number = 21084920;
  public totalGasConsumed: number = 0;
  public stayOrderActive: boolean = false;
  public stayOrderCaseNumber: string = "High Court Injunction #HC-2026-884";

  public wallets: Record<string, WalletState> = {
    "0x71C67931383707B18E3cE0E73e9112Acb708689A": {
      address: "0x71C67931383707B18E3cE0E73e9112Acb708689A",
      name: "Alice (Verified Institutional Seller)",
      rwaBalance: 25000,
      passportTokenId: 1001,
      status: "ACTIVE",
      jurisdictionCode: 840,
    },
    "0x94B8A291c9A471C5681Dce712aE3E85a4a58b32F": {
      address: "0x94B8A291c9A471C5681Dce712aE3E85a4a58b32F",
      name: "Bob (Verified Institutional Buyer)",
      rwaBalance: 5000,
      passportTokenId: 1002,
      status: "ACTIVE",
      jurisdictionCode: 840,
    },
    "0xDEADBEEF00000000000000000000000000000666": {
      address: "0xDEADBEEF00000000000000000000000000000666",
      name: "Anon / Hacker (Unverified Wallet)",
      rwaBalance: 0,
      passportTokenId: null,
      status: "UNVERIFIED",
      jurisdictionCode: 0,
    },
  };

  public passports: Record<number, PassportRecord> = {
    1001: {
      tokenId: 1001,
      holder: "0x71C67931383707B18E3cE0E73e9112Acb708689A",
      zkProofHash: "0x4a9f82d1c67e9124b893a772c10b284c9df438812c98a541fa980991c49e2115",
      nullifierHash: "0x9c8e11a47890bfe34b829c41a547d2f8310ba98421c60b943210aa8471b029ff",
      jurisdictionCode: 840,
      expiryTimestamp: GENESIS_EXPIRY_TIMESTAMP,
      isSanctionsCleared: true,
      isRevoked: false,
      issuanceBlock: 21084900,
    },
    1002: {
      tokenId: 1002,
      holder: "0x94B8A291c9A471C5681Dce712aE3E85a4a58b32F",
      zkProofHash: "0x12c98a541fa980991c49e21154a9f82d1c67e9124b893a772c10b284c9df4388",
      nullifierHash: "0x21c60b943210aa8471b029ff9c8e11a47890bfe34b829c41a547d2f8310ba984",
      jurisdictionCode: 840,
      expiryTimestamp: GENESIS_EXPIRY_TIMESTAMP,
      isSanctionsCleared: true,
      isRevoked: false,
      issuanceBlock: 21084910,
    },
  };

  public nextTokenId = 1003;
  public logs: EvmLogEntry[] = [];
  private _logCounter: number = 0;
  private _txCounter: number = 1000;

  constructor() {
    this.addLog(
      "INFO",
      "RegulatedRWAToken",
      "EVM Genesis initialized: Dhaka-NY Tower RWA ($10M USD / 100,000 shares) loaded into memory.",
      0,
      "0x0000000000000000000000000000000000000000000000000000000000000000",
      "Genesis"
    );
  }

  private generateTxHash(): string {
    this._txCounter++;
    const hexSeq = this._txCounter.toString(16).padStart(8, "0");
    const digest = `0x${hexSeq}48c1e9205a3b2a69de6dbf7f01ed13b2108b2c43e7943210aa8471b029ff`.slice(0, 66);
    return digest;
  }

  public addLog(
    type: EvmLogEntry["type"],
    contract: EvmLogEntry["contract"],
    message: string,
    gasCost: number,
    customTx?: string,
    customTimestamp?: string
  ) {
    this.totalGasConsumed += gasCost;
    this._logCounter++;
    const entry: EvmLogEntry = {
      id: `log-${this._logCounter}`,
      timestamp: customTimestamp || (typeof window !== "undefined" ? new Date().toLocaleTimeString() : "12:00:00 UTC"),
      blockNumber: this.blockNumber,
      txHash: customTx || this.generateTxHash(),
      type,
      contract,
      message,
      gasCost,
    };
    this.logs.unshift(entry);
    if (this.logs.length > 80) this.logs.pop();
  }

  /**
   * Mint Soulbound Compliance Passport
   */
  public mintPassport(
    holder: string,
    zkProofHash: string,
    nullifierHash: string,
    jurisdictionCode: number,
    expiryTimestamp: number
  ): { success: boolean; tokenId?: number; txHash: string; gasUsed: number; error?: string } {
    this.blockNumber++;
    const txHash = this.generateTxHash();

    this.addLog(
      "CALL",
      "ZkCompliancePassport",
      `mintCompliancePassport(to=${holder.slice(0, 8)}..., nullifier=${nullifierHash.slice(0, 10)}..., jurisdiction=${jurisdictionCode})`,
      21000,
      txHash
    );

    // Verify nullifier not duplicated
    for (const p of Object.values(this.passports)) {
      if (p.nullifierHash.toLowerCase() === nullifierHash.toLowerCase()) {
        const error = `REVERT: PassportAlreadyMintedForNullifier(${nullifierHash.slice(0, 14)}...)`;
        this.addLog("REVERT", "ZkCompliancePassport", error, 23400, txHash);
        return { success: false, txHash, gasUsed: 23400, error };
      }
    }

    const tokenId = this.nextTokenId++;
    this.passports[tokenId] = {
      tokenId,
      holder,
      zkProofHash,
      nullifierHash,
      jurisdictionCode,
      expiryTimestamp,
      isSanctionsCleared: true,
      isRevoked: false,
      issuanceBlock: this.blockNumber,
    };

    if (this.wallets[holder]) {
      this.wallets[holder].passportTokenId = tokenId;
      this.wallets[holder].status = "ACTIVE";
      this.wallets[holder].jurisdictionCode = jurisdictionCode;
    } else {
      this.wallets[holder] = {
        address: holder,
        name: `Institutional Holder (${holder.slice(0, 6)}...)`,
        rwaBalance: 0,
        passportTokenId: tokenId,
        status: "ACTIVE",
        jurisdictionCode,
      };
    }

    this.addLog(
      "SSTORE",
      "ZkCompliancePassport",
      `Stored PassportRecord for TokenID #${tokenId} with 0 BYTES PII on-chain`,
      45000,
      txHash
    );
    this.addLog(
      "LOG",
      "ZkCompliancePassport",
      `Locked(tokenId=${tokenId}) & CompliancePassportMinted emitted`,
      12500,
      txHash
    );
    this.addLog(
      "SUCCESS",
      "ZkCompliancePassport",
      `STATUS: 1 (SUCCESS) - SBT #${tokenId} bound to ${holder.slice(0, 8)}...`,
      0,
      txHash
    );

    return { success: true, tokenId, txHash, gasUsed: 78500 };
  }

  /**
   * Attempt illegal transfer of Soulbound Passport (Simulate Hack)
   */
  public simulateIllegalPassportTransfer(
    from: string,
    to: string,
    tokenId: number
  ): { success: boolean; txHash: string; gasUsed: number; revertReason: string } {
    this.blockNumber++;
    const txHash = this.generateTxHash();

    this.addLog(
      "CALL",
      "ZkCompliancePassport",
      `transferFrom(from=${from.slice(0, 8)}..., to=${to.slice(0, 8)}..., tokenId=${tokenId})`,
      21000,
      txHash
    );

    const revertReason = `REVERT: SoulboundTokenNonTransferable(caller=${from}, tokenId=${tokenId}) — Compliance Identity Cannot Be Sold or Transferred`;

    this.addLog("REVERT", "ZkCompliancePassport", revertReason, 24150, txHash);

    return {
      success: false,
      txHash,
      gasUsed: 24150,
      revertReason,
    };
  }

  /**
   * Revoke Passport (Sanctions Kill Switch)
   */
  public revokePassport(
    tokenId: number,
    reason: string = "OFAC Sanctions Watchlist Positive Match"
  ): { success: boolean; txHash: string; gasUsed: number } {
    this.blockNumber++;
    const txHash = this.generateTxHash();

    const passport = this.passports[tokenId];
    if (passport) {
      passport.isRevoked = true;
      passport.isSanctionsCleared = false;
      if (this.wallets[passport.holder]) {
        this.wallets[passport.holder].status = "REVOKED";
      }
    }

    this.addLog(
      "CALL",
      "ZkCompliancePassport",
      `revokePassport(tokenId=${tokenId}, reason="${reason}")`,
      21000,
      txHash
    );
    this.addLog(
      "SSTORE",
      "ZkCompliancePassport",
      `Flagged tokenId #${tokenId} as isRevoked=true, isSanctionsCleared=false`,
      32000,
      txHash
    );
    this.addLog(
      "LOG",
      "ZkCompliancePassport",
      `CompliancePassportRevoked(tokenId=${tokenId}, reason="${reason}")`,
      12000,
      txHash
    );

    return { success: true, txHash, gasUsed: 65000 };
  }

  /**
   * Toggle Judicial Stay Order
   */
  public toggleStayOrder(active: boolean, caseNumber?: string): { success: boolean; txHash: string } {
    this.blockNumber++;
    const txHash = this.generateTxHash();
    this.stayOrderActive = active;
    if (caseNumber) this.stayOrderCaseNumber = caseNumber;

    this.addLog(
      "CALL",
      "RegulatedRWAToken",
      `setJudicialStayOrder(active=${active}, caseNumber="${this.stayOrderCaseNumber}")`,
      21000,
      txHash
    );
    this.addLog(
      "SSTORE",
      "RegulatedRWAToken",
      `Updated judicialStayOrderActive = ${active}`,
      20000,
      txHash
    );
    this.addLog(
      "LOG",
      "RegulatedRWAToken",
      `JudicialStayOrderToggled(active=${active}, caseNumber="${this.stayOrderCaseNumber}")`,
      12000,
      txHash
    );

    return { success: true, txHash };
  }

  /**
   * Check if an address has a valid passport
   */
  public isValidPassport(address: string): boolean {
    const wallet = this.wallets[address];
    if (!wallet || !wallet.passportTokenId) return false;
    const passport = this.passports[wallet.passportTokenId];
    if (!passport) return false;
    if (passport.isRevoked) return false;
    if (!passport.isSanctionsCleared) return false;
    const currentSec = typeof window !== "undefined" ? Math.floor(Date.now() / 1000) : 1761000000;
    if (currentSec > passport.expiryTimestamp) return false;
    return true;
  }

  /**
   * Transfer RWA Tokens with automated institutional compliance hooks
   */
  public transferRWA(
    from: string,
    to: string,
    amount: number
  ): {
    success: boolean;
    txHash: string;
    gasUsed: number;
    error?: string;
    revertStage?: "COURT_STAY_ORDER" | "SELLER_PASSPORT" | "BUYER_PASSPORT" | "BALANCE";
  } {
    this.blockNumber++;
    const txHash = this.generateTxHash();

    this.addLog(
      "CALL",
      "RegulatedRWAToken",
      `transfer(to=${to.slice(0, 8)}..., amount=${amount} $BLDG-RWA)`,
      21000,
      txHash
    );

    // Balance check
    const fromWallet = this.wallets[from];
    if (!fromWallet || fromWallet.rwaBalance < amount) {
      const error = `REVERT: InsufficientBalance(available=${fromWallet?.rwaBalance || 0}, required=${amount})`;
      this.addLog("REVERT", "RegulatedRWAToken", error, 23000, txHash);
      return { success: false, txHash, gasUsed: 23000, error, revertStage: "BALANCE" };
    }

    // CHECK 1: Emergency High Court Judicial Stay Order
    this.addLog(
      "SLOAD",
      "RegulatedRWAToken",
      `Checking judicialStayOrderActive... [State: ${this.stayOrderActive ? "ACTIVE FREEZE" : "CLEAN"}]`,
      2100,
      txHash
    );

    if (this.stayOrderActive) {
      const error = `REVERT: LegalFreezeError("ASSET_UNDER_JUDICIAL_STAY_ORDER", "${this.stayOrderCaseNumber}") — Token transfer prohibited by High Court Injunction`;
      this.addLog("REVERT", "RegulatedRWAToken", error, 26500, txHash);
      return { success: false, txHash, gasUsed: 26500, error, revertStage: "COURT_STAY_ORDER" };
    }

    // CHECK 2: Seller Soulbound Compliance Passport Verification
    this.addLog(
      "CALL",
      "ZkCompliancePassport",
      `ExtCall isValidPassport(seller=${from.slice(0, 8)}...)`,
      4600,
      txHash
    );
    if (!this.isValidPassport(from)) {
      const error = `REVERT: ComplianceError("SELLER_PASSPORT_MISSING_EXPIRED_OR_REVOKED") — Seller identity lacks valid ZK Compliance Passport`;
      this.addLog("REVERT", "RegulatedRWAToken", error, 28100, txHash);
      return { success: false, txHash, gasUsed: 28100, error, revertStage: "SELLER_PASSPORT" };
    }

    // CHECK 3: Buyer Soulbound Compliance Passport Verification
    this.addLog(
      "CALL",
      "ZkCompliancePassport",
      `ExtCall isValidPassport(buyer=${to.slice(0, 8)}...)`,
      4600,
      txHash
    );
    if (!this.isValidPassport(to)) {
      const error = `REVERT: ComplianceError("BUYER_PASSPORT_MISSING_OR_UNVERIFIED") — Recipient wallet (${to.slice(0, 8)}...) does not hold an active ZK Compliance Passport`;
      this.addLog("REVERT", "RegulatedRWAToken", error, 29800, txHash);
      return { success: false, txHash, gasUsed: 29800, error, revertStage: "BUYER_PASSPORT" };
    }

    // Execute state changes
    fromWallet.rwaBalance -= amount;
    if (!this.wallets[to]) {
      this.wallets[to] = {
        address: to,
        name: `Wallet (${to.slice(0, 6)}...)`,
        rwaBalance: 0,
        passportTokenId: null,
        status: "UNVERIFIED",
        jurisdictionCode: 0,
      };
    }
    this.wallets[to].rwaBalance += amount;

    this.addLog(
      "SSTORE",
      "RegulatedRWAToken",
      `Updated balanceOf[${from.slice(0, 6)}...] = ${fromWallet.rwaBalance}`,
      5000,
      txHash
    );
    this.addLog(
      "SSTORE",
      "RegulatedRWAToken",
      `Updated balanceOf[${to.slice(0, 6)}...] = ${this.wallets[to].rwaBalance}`,
      5000,
      txHash
    );
    this.addLog(
      "LOG",
      "RegulatedRWAToken",
      `ComplianceCheckPassed(from, to, ${amount}) & Transfer emitted`,
      7500,
      txHash
    );
    this.addLog(
      "SUCCESS",
      "RegulatedRWAToken",
      `STATUS: 1 CONFIRMED | Transferred ${amount} $BLDG-RWA in block #${this.blockNumber}`,
      0,
      txHash
    );

    return { success: true, txHash, gasUsed: 52430 };
  }

  /**
   * Reset simulation to clean default
   */
  public resetToDefault() {
    this.blockNumber = 21084920;
    this.totalGasConsumed = 0;
    this.stayOrderActive = false;
    this.stayOrderCaseNumber = "High Court Injunction #HC-2026-884";
    this.nextTokenId = 1003;
    this.wallets = {
      "0x71C67931383707B18E3cE0E73e9112Acb708689A": {
        address: "0x71C67931383707B18E3cE0E73e9112Acb708689A",
        name: "Alice (Verified Institutional Seller)",
        rwaBalance: 25000,
        passportTokenId: 1001,
        status: "ACTIVE",
        jurisdictionCode: 840,
      },
      "0x94B8A291c9A471C5681Dce712aE3E85a4a58b32F": {
        address: "0x94B8A291c9A471C5681Dce712aE3E85a4a58b32F",
        name: "Bob (Verified Institutional Buyer)",
        rwaBalance: 5000,
        passportTokenId: 1002,
        status: "ACTIVE",
        jurisdictionCode: 840,
      },
      "0xDEADBEEF00000000000000000000000000000666": {
        address: "0xDEADBEEF00000000000000000000000000000666",
        name: "Anon / Hacker (Unverified Wallet)",
        rwaBalance: 0,
        passportTokenId: null,
        status: "UNVERIFIED",
        jurisdictionCode: 0,
      },
    };
    this.passports = {
      1001: {
        tokenId: 1001,
        holder: "0x71C67931383707B18E3cE0E73e9112Acb708689A",
        zkProofHash: "0x4a9f82d1c67e9124b893a772c10b284c9df438812c98a541fa980991c49e2115",
        nullifierHash: "0x9c8e11a47890bfe34b829c41a547d2f8310ba98421c60b943210aa8471b029ff",
        jurisdictionCode: 840,
        expiryTimestamp: GENESIS_EXPIRY_TIMESTAMP,
        isSanctionsCleared: true,
        isRevoked: false,
        issuanceBlock: 21084900,
      },
      1002: {
        tokenId: 1002,
        holder: "0x94B8A291c9A471C5681Dce712aE3E85a4a58b32F",
        zkProofHash: "0x12c98a541fa980991c49e21154a9f82d1c67e9124b893a772c10b284c9df4388",
        nullifierHash: "0x21c60b943210aa8471b029ff9c8e11a47890bfe34b829c41a547d2f8310ba984",
        jurisdictionCode: 840,
        expiryTimestamp: GENESIS_EXPIRY_TIMESTAMP,
        isSanctionsCleared: true,
        isRevoked: false,
        issuanceBlock: 21084910,
      },
    };
    this.logs = [];
    this.addLog(
      "INFO",
      "RegulatedRWAToken",
      "EVM State reset to default clean genesis.",
      0
    );
  }
}
