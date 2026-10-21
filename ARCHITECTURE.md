# zkRegulate Technical Architecture Specification

> **Version:** 2.4.0-INSTITUTIONAL  
> **Status:** Production-Ready Reference Implementation  
> **Target Standards:** ERC-3643 (Permissioned RWA Tokens), ERC-5192 (Minimal Soulbound Tokens), EIP-712 (Typed Structured Data), Circom 2.1.6, Groth16 over BN128 (`alt_bn128`).

---

## 1. System Overview & The Institutional RWA Dilemma

Tokenization of global Real World Assets (RWA)—projected to exceed **$16 Trillion by 2030** by Boston Consulting Group and BlackRock—faces a foundational regulatory and cryptographic bottleneck:

1. **Statutory Non-Negotiables:** Securities laws (SEC Reg D Rule 506(c), EU MiCA, and national property acts such as the Bangladesh Transfer of Property Act 1882) mandate strict accreditation, tax clearance verification (TIN), anti-money laundering (AML/PEP) checks, and judicial stay order enforcement.
2. **Financial Privacy Imperative:** Institutional family offices, sovereign wealth funds, and high-net-worth investors cannot permit their private identity documents (passports, civil registration, net worth, tax numbers) to be published on immutable public ledgers.
3. **The Pseudo-Anonymous Failure:** Standard ERC-20 / ERC-721 tokens cannot enforce legal compliance; meanwhile, basic permissioned registries leak private institutional identity on-chain.

**zkRegulate** resolves this trilemma through a 5-tier cryptographic pipeline that decouples off-chain legal verification from on-chain execution using zero-knowledge proofs.

```
+----------------------------------------------------------------------------------------------------+
|                                    zkRegulate Protocol Pipeline                                    |
+----------------------------------------------------------------------------------------------------+
|  [Stage 1] Multi-LLM AI RegTech Pipeline (Nebius Llama-3.3-70B / Gemini 2.5 / HF Mistral)         |
|            - Audits Deed, Civil ID, TIN, Sanctions Lists off-chain under zero-leakage sandbox      |
|                                                  |                                                 |
|  [Stage 2] Zero-Knowledge Witness Synthesis & Groth16 Prover (Circom 2.1.6 / BN128)               |
|            - Compiles 4,812 non-linear R1CS constraints into pairing-friendly SNARK proof           |
|            - Computes Poseidon Nullifier & Merkle Commitment + EIP-712 Typed Signature              |
|                                                  |                                                 |
|  [Stage 3] Soulbound Compliance Passport Minting (ERC-5192 Non-Transferable SBT)                  |
|            - Locks compliant identity token to investor wallet; emits `Locked(tokenId, true)`      |
|                                                  |                                                 |
|  [Stage 4] Regulated RWA Smart Contract Engine (ERC-3643 Permissioned Transfer Agent)             |
|            - Validates passport validity, jurisdiction whitelist, and judicial stay status        |
|            - Enforces Delaware Court of Chancery & High Court injunctions in O(1) EVM gas         |
|                                                  |                                                 |
|  [Stage 5] Deterministic EVM State & Institutional Legal Dossier Telemetry                        |
|            - Live opcode traces (PUSH1, MSTORE, CALL, SSTORE, REVERT) + Court Audit Dossier        |
+----------------------------------------------------------------------------------------------------+
```

---

## 2. Multi-LLM AI RegTech Engine (Stage 1)

Before any cryptographic witness is computed, off-chain statutory verification must be performed. Because single-LLM evaluations can hallucinate or suffer from API outages, `zkRegulate` employs a resilient **Cascading Multi-LLM Router**:

```
                              Incoming Legal Dossier
                                        |
                 +----------------------+----------------------+
                 |                      |                      |
                 v                      v                      v
        [Nebius AI Studio]     [Google Gemini 2.5]    [Hugging Face Hub]
         Llama-3.3-70B-Inst       Gemini 2.5 Flash       Mistral-7B-Inst
                 |                      |                      |
                 +----------------------+----------------------+
                                        |
                                        v
                           Deterministic Cross-Audit
                        - SEC Reg D 506(c) Accreditation
                        - EU MiCA Suitability
                        - BD Transfer of Property Act 1882
                        - OFAC / UN / EU Sanctions Watchlist
                                        |
                                        v
                            Eligible & Non-Encumbered?
                           /                         \
                       [YES]                         [NO]
                         |                             |
             Synthesize ZK Witness           Emit Statutory Rejection
```

### PII Redaction X-Ray Shield (GDPR Article 25)
All personal identifiable information (PII)—including National ID numbers, Tax IDs, full civil names, and precise net-worth values—is scrubbed inside the client-side secure runtime. Only cryptographic commitments:
- `NullifierHash = Poseidon(IdentitySecret, Salt)`
- `CommitmentHash = Poseidon(WalletAddress, Jurisdiction, Expiry)`
are passed to the zero-knowledge prover. **Zero bytes of raw PII ever touch the smart contracts.**

---

## 3. Cryptographic Specification & Circom 2.1.6 Circuit (Stage 2)

The core privacy engine is specified in `contracts/ZKComplianceVerifier.circom` and compiled targeting the **BN128 (alt_bn128)** elliptic curve.

### Circuit Parameters & Constraint Topology

| Metric | Specification |
| :--- | :--- |
| **Circuit Compiler** | Circom v2.1.6 |
| **Proving System** | Groth16 (Bidecal Pairing-Based SNARK) |
| **Elliptic Curve** | BN128 (`alt_bn128` / `bn254`) |
| **Non-Linear Constraints** | **4,812 R1CS Constraints** |
| **Private Signals (Witness)** | 5 Secret Signals (`identitySecret`, `taxIdSecret`, `netWorthAmount`, `birthTimestamp`, `merklePath`) |
| **Public Signals** | 5 Signals (`expectedMerkleRoot`, `nullifierHash`, `walletAddress`, `jurisdictionCode`, `expiryTimestamp`) |
| **On-Chain Verification Cost** | **~198,420 Gas** (Ethereum Precompile `0x08` `ecPairing`) |

### Constraint Sub-Circuits
1. **Accredited Investor Threshold Check:**
   $$\text{netWorthAmount} \ge \$1,000,000 \quad (\text{SEC Rule 501 Reg D})$$
   Enforced via bitwise decomposition into 64-bit non-overflow range proofs (`LessEqThan(64)`).
2. **Age of Majority Proof:**
   $$\text{currentTimestamp} - \text{birthTimestamp} \ge 18 \times 365.25 \times 86400$$
   Guarantees civil contracting capacity without revealing the investor's exact date of birth.
3. **Merkle Membership Inclusion:**
   8-level Poseidon binary Merkle tree proving the investor is part of the certified compliance registry without revealing their leaf position.
4. **Deterministic Nullifier Derivation:**
   $$\text{Nullifier} = \mathcal{H}_{\text{Poseidon}}(\text{identitySecret}, \text{walletAddress})$$
   Prevents double-minting attacks across multiple wallets while preventing correlation back to the investor.

### Mathematical Pairing Verification Equation
The on-chain verifier checks the Groth16 quadratic arithmetic program (QAP) pairing:

$$e(A, B) = e(\alpha, \beta) \cdot e(x \cdot \gamma, \delta) \cdot e(C, \delta)$$

Where:
- $A \in G_1, B \in G_2, C \in G_1$ constitute the proof vector ($\pi_A, \pi_B, \pi_C$).
- $\alpha \in G_1, \beta \in G_2, \gamma \in G_2, \delta \in G_2$ are the trusted setup verification key points.
- $x = \sum_{i=0}^{l} a_i \cdot \omega_i$ encodes the public input linear combination in the scalar field $\mathbb{F}_r$.

### EIP-712 Anti-Frontrunning Signature Binding
To prevent malicious searchers from front-running an institutional proof in the mempool and submitting it for their own wallet, the public signals bind `walletAddress` directly into the witness. In addition, an **EIP-712 typed domain signature** binds the proof payload:

```json
{
  "types": {
    "EIP712Domain": [
      { "name": "name", "type": "string" },
      { "name": "version", "type": "string" },
      { "name": "chainId", "type": "uint256" },
      { "name": "verifyingContract", "type": "address" }
    ],
    "ComplianceAttestation": [
      { "name": "walletAddress", "type": "address" },
      { "name": "nullifierHash", "type": "bytes32" },
      { "name": "jurisdictionCode", "type": "uint16" },
      { "name": "expiryTimestamp", "type": "uint64" }
    ]
  }
}
```

---

## 4. Soulbound Compliance Passport Engine (Stage 3)

The smart contract `contracts/ZKCompliancePassport.sol` implements the **ERC-5192 Minimal Soulbound Token** standard:

```solidity
interface IERC5192 {
    event Locked(uint256 tokenId);
    event Unlocked(uint256 tokenId);
    function locked(uint256 tokenId) external view returns (bool);
}
```

### Inviolable Non-Transferability
When a compliance passport is minted following ZK-SNARK verification:
1. The contract emits `Locked(tokenId)` with status `locked = true`.
2. Standard transfer functions (`transferFrom`, `safeTransferFrom`) revert with `StatutoryComplianceViolated("ERC5192: Soulbound passport is non-transferable")`.
3. The passport cannot be sold, rented, or transferred in secondary markets.

### Nullifier Replay & Sybil Guard
```solidity
bytes32 nullifier = publicSignals.nullifierHash;
require(!usedNullifiers[nullifier], "SybilAttack: Identity nullifier already registered");
usedNullifiers[nullifier] = true;
```

---

## 5. Regulated RWA Token & Judicial Freeze Engine (Stage 4)

`contracts/RegulatedRWAToken.sol` models institutional real-estate securitization (represented by the **$10,000,000 USD Dhaka Commercial Tower Tranche A**, 10,000 DKT fractional tokens).

### ERC-3643 Compliance Hook
Every call to `transfer(address to, uint256 amount)` triggers an on-chain compliance assertion:

```solidity
function canTransfer(address from, address to, uint256 amount) public view returns (bool, string memory) {
    if (isAssetFrozen) {
        return (false, "JudicialStayOrder: Asset transfers halted by Court of Chancery");
    }
    if (!passportContract.isPassportValid(to)) {
        return (false, "ComplianceError: Recipient missing valid Soulbound Passport");
    }
    if (passportContract.isRevoked(to)) {
        return (false, "AMLAlert: Recipient passport revoked by compliance authority");
    }
    return (true, "OK");
}
```

### Statutory Judicial Stay Orders
To comply with common-law and statutory equity courts (such as Section 54 of the Transfer of Property Act 1882 or Delaware Court of Chancery Injunctions):
- Judicial authorities or compliance controllers can invoke `imposeJudicialStay(string courtCaseId, string injunctionDetails)`.
- Asset transfers are halted instantaneously with $O(1)$ EVM state complexity.
- Reverts return structured EVM error frames with exact statutory case numbers (e.g. `HC-2026-884`).

---

## 6. EVM Execution Telemetry & Audit Dossier (Stage 5)

The platform includes a built-in deterministic EVM runtime that executes smart contract opcodes and produces an immutable **Institutional Legal Audit Dossier**:
- Complete execution call traces (`PUSH1`, `MSTORE`, `CALL`, `SSTORE`, `REVERT`).
- Precompile `0x08` gas benchmarking (`~198,420 gas`).
- Exportable cryptographically signed PDF/JSON compliance dossiers for banking partners and legal counsel.
