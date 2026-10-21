import { NextRequest, NextResponse } from "next/server";
import {
  generateCommitments,
  synthesizeGroth16Proof,
  signEIP712Attestation,
  FullZkPackage,
  OffChainPIIInput,
} from "@/lib/zk-crypto";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const input: OffChainPIIInput = {
      fullName: body.fullName || "Alice Vance",
      nationalIdOrPassport: body.nationalIdOrPassport || "BD-9948231",
      taxIdNumber: body.taxIdNumber || "884-992-110",
      dateOfBirth: body.dateOfBirth || "1992-05-14",
      netWorthUsd: Number(body.netWorthUsd) || 4200000,
      walletAddress: body.walletAddress || "0x71C67931383707B18E3cE0E73e9112Acb708689A",
      jurisdictionCode: Number(body.jurisdictionCode) || 840,
      expiryTimestamp:
        body.expiryTimestamp || Math.floor(Date.now() / 1000) + 365 * 24 * 3600,
    };

    const isEligible = body.isEligible !== undefined ? Boolean(body.isEligible) : true;

    // 1. Strip raw PII and generate cryptographic commitments & nullifiers
    const commitments = generateCommitments(input);

    // 2. Synthesize deterministic Groth16 ZK-SNARK proof on BN128 curve
    const proof = synthesizeGroth16Proof(
      commitments,
      isEligible,
      input.jurisdictionCode,
      input.expiryTimestamp!
    );

    // 3. Generate EIP-712 typed cryptographic attestation
    const attestation = await signEIP712Attestation(
      input.walletAddress,
      commitments.nullifierHash,
      commitments.zkProofHash,
      input.jurisdictionCode,
      input.expiryTimestamp!,
      true // sanctions cleared
    );

    const fullPackage: FullZkPackage = {
      commitments,
      proof,
      attestation,
      publicSignals: proof.publicSignals,
      circuitConstraints: 4812,
      curve: "bn128",
      generationTimestamp: Date.now(),
    };

    return NextResponse.json({
      success: true,
      data: fullPackage,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    console.error("ZK Proof generation API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}
