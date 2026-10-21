import { NextRequest, NextResponse } from "next/server";
import { routeComplianceVerification, ComplianceEvaluationInput } from "@/lib/ai-compliance-router";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const input: ComplianceEvaluationInput = {
      fullName: body.fullName || "Alice Vance",
      nationalIdOrPassport: body.nationalIdOrPassport || "BD-9948231",
      taxIdNumber: body.taxIdNumber || "884-992-110",
      dateOfBirth: body.dateOfBirth || "1992-05-14",
      netWorthUsd: Number(body.netWorthUsd) || 4200000,
      walletAddress: body.walletAddress || "0x71C67931383707B18E3cE0E73e9112Acb708689A",
      jurisdictionCode: Number(body.jurisdictionCode) || 840,
      deedEncumbranceStatus: body.deedEncumbranceStatus || "CLEAN",
      watchlistFlag: Boolean(body.watchlistFlag),
      documentText: body.documentText,
    };

    const evaluation = await routeComplianceVerification(input);

    return NextResponse.json({
      success: true,
      timestamp: Date.now(),
      evaluation,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    console.error("Compliance verification API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}
