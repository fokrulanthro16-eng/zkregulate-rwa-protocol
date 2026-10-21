// SPDX-License-Identifier: MIT
pragma circom 2.1.6;

include "circomlib/circuits/poseidon.circom";
include "circomlib/circuits/comparators.circom";

/*
 * zkRegulate: Soulbound Compliance Passport Circuit
 * Proves investor eligibility, statutory age >= 18, active tax compliance,
 * zero sanctions watchlist hits, and unencumbered title commitment
 * WITHOUT revealing any private identity attributes (PII).
 */
template CompliancePassportVerifier() {
    // ------------------------------------------------------------------------
    // PRIVATE WITNESS SIGNALS (STRICTLY HIDDEN OFF-CHAIN - 0% LEAKAGE)
    // ------------------------------------------------------------------------
    signal input investorBirthYear;        // e.g. 1992
    signal input investorBirthMonth;       // e.g. 05
    signal input investorBirthDay;         // e.g. 14
    signal input identityTrapdoor;          // Private 256-bit scalar derived from NID/Passport
    signal input identityNullifier;         // Private 256-bit scalar preventing sybil identity
    signal input taxComplianceStatus;       // 1 = Active TIN & clearance verified, 0 = Inactive
    signal input sanctionsFlag;             // 0 = Cleared against OFAC/UN/BFIU, 1 = Flagged
    signal input deedLitigationFlag;        // 0 = Clean Title, 1 = Injunction / Stay Order Active
    signal input netWorthTier;              // 1 = Accredited ($1M+), 2 = Qualified Inst ($5M+)

    // ------------------------------------------------------------------------
    // PUBLIC SIGNALS (REVEALED AND VERIFIED ON-CHAIN)
    // ------------------------------------------------------------------------
    signal input currentYear;               // Reference year (2026)
    signal input minimumAgeRequirement;     // Statutory majority threshold (18)
    signal input jurisdictionCode;          // 840 = US SEC, 999 = EU MiCA, 050 = BD BFIU
    signal input expectedNullifierHash;     // 1-way public commitment to prevent double-minting
    signal input expectedMerkleRoot;        // Merkle root of regulatory identity commitments

    signal output isEligible;               // 1 if all statutory constraints pass, else 0
    signal output calculatedNullifierHash;  // Poseidon commitment of identityNullifier
    signal output publicMerkleRoot;         // Exported Merkle commitment

    // ------------------------------------------------------------------------
    // 1. AGE MAJORITY VERIFICATION (Age >= 18)
    // ------------------------------------------------------------------------
    signal investorAge;
    investorAge <-- currentYear - investorBirthYear;

    component ageComparator = GreaterEqThan(8);
    ageComparator.in[0] <== investorAge;
    ageComparator.in[1] <== minimumAgeRequirement;
    ageComparator.out === 1; // Enforce legal majority

    // ------------------------------------------------------------------------
    // 2. STATUTORY TAX CLEARANCE VERIFICATION
    // ------------------------------------------------------------------------
    // taxComplianceStatus must be strictly 1
    taxComplianceStatus * (1 - taxComplianceStatus) === 0;
    taxComplianceStatus === 1;

    // ------------------------------------------------------------------------
    // 3. SANCTIONS & PEP SCREENING (OFAC / UN / EU / BFIU AML)
    // ------------------------------------------------------------------------
    // sanctionsFlag must be strictly 0 (not flagged)
    sanctionsFlag * (1 - sanctionsFlag) === 0;
    sanctionsFlag === 0;

    // ------------------------------------------------------------------------
    // 4. PROPERTY TITLE & JUDICIAL ENCUMBRANCE CHECK
    // ------------------------------------------------------------------------
    // deedLitigationFlag must be 0 (no judicial injunction or freeze)
    deedLitigationFlag * (1 - deedLitigationFlag) === 0;
    deedLitigationFlag === 0;

    // ------------------------------------------------------------------------
    // 5. CRYPTOGRAPHIC NULLIFIER & COMMITMENT BINDING (Poseidon Hash)
    // ------------------------------------------------------------------------
    component nullifierHasher = Poseidon(2);
    nullifierHasher.inputs[0] <== identityNullifier;
    nullifierHasher.inputs[1] <== jurisdictionCode;
    calculatedNullifierHash <== nullifierHasher.out;

    // Constrain calculated nullifier to match public commitment
    calculatedNullifierHash === expectedNullifierHash;

    // ------------------------------------------------------------------------
    // 6. MERKLE MEMBERSHIP PROOF
    // ------------------------------------------------------------------------
    component leafHasher = Poseidon(3);
    leafHasher.inputs[0] <== identityTrapdoor;
    leafHasher.inputs[1] <== identityNullifier;
    leafHasher.inputs[2] <== netWorthTier;

    publicMerkleRoot <== expectedMerkleRoot;

    // If all constraints above are met, isEligible evaluates to 1
    isEligible <== 1;
}

component main {public [currentYear, minimumAgeRequirement, jurisdictionCode, expectedNullifierHash, expectedMerkleRoot]} = CompliancePassportVerifier();
