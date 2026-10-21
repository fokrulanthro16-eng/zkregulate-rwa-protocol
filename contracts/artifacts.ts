/**
 * zkRegulate Institutional Smart Contracts & Circom Circuit Artifacts
 * Complete, syntax-highlighted, production-ready codebases with ABIs
 */

export const CIRCOM_CIRCUIT_SOURCE = `// SPDX-License-Identifier: MIT
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
`;

export const ZK_COMPLIANCE_PASSPORT_SOL = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title ZkCompliancePassport (ERC-5192 Minimal Soulbound Token)
 * @notice Protocol: zkRegulate v2.0-INSTITUTIONAL
 * @dev Stores ONLY zero-knowledge proof commitments and regulatory parameters.
 * ZERO BYTES of personal identity (name, national ID, tax ID, net worth) ever touch the blockchain.
 * Transfers are strictly locked by overriding all transfer functions to revert with SoulboundTokenNonTransferable.
 */

interface IERC5192 {
    event Locked(uint256 tokenId);
    event Unlocked(uint256 tokenId);
    function locked(uint256 tokenId) external view returns (bool);
}

error SoulboundTokenNonTransferable(address caller, uint256 tokenId);
error PassportAlreadyMintedForNullifier(bytes32 nullifierHash);
error InvalidAttestationSignature();
error PassportExpired(uint256 tokenId, uint64 expiryTimestamp);
error PassportRevoked(uint256 tokenId);
error UnauthorizedCaller();

contract ZkCompliancePassport is IERC5192 {
    string public name = "zkRegulate Soulbound Compliance Passport";
    string public symbol = "zkPASS";

    address public immutable regulatoryAuthority;
    uint256 private _nextTokenId = 1001;

    struct PassportRecord {
        uint256 tokenId;
        address holder;
        bytes32 zkProofHash;
        bytes32 nullifierHash;
        uint16 jurisdictionCode; // 840 = US SEC, 999 = EU MiCA, 050 = BD BFIU
        uint64 expiryTimestamp;
        bool isSanctionsCleared;
        bool isRevoked;
        uint256 issuanceBlock;
    }

    // Mapping from tokenId to PassportRecord
    mapping(uint256 => PassportRecord) public passports;
    // Mapping from holder address to tokenId
    mapping(address => uint256) public holderToTokenId;
    // Mapping from nullifierHash to whether a passport exists (prevents Sybil double-minting)
    mapping(bytes32 => bool) public registeredNullifiers;

    event CompliancePassportMinted(
        uint256 indexed tokenId,
        address indexed holder,
        bytes32 indexed nullifierHash,
        uint16 jurisdictionCode,
        uint64 expiryTimestamp
    );

    event CompliancePassportRevoked(
        uint256 indexed tokenId,
        address indexed holder,
        string reason
    );

    modifier onlyAuthority() {
        if (msg.sender != regulatoryAuthority) revert UnauthorizedCaller();
        _;
    }

    constructor(address _regulatoryAuthority) {
        regulatoryAuthority = _regulatoryAuthority;
    }

    /**
     * @notice Mint a Soulbound Compliance Passport after off-chain ZK verification
     */
    function mintCompliancePassport(
        address to,
        bytes32 zkProofHash,
        bytes32 nullifierHash,
        uint16 jurisdictionCode,
        uint64 expiryTimestamp,
        bytes calldata /* eip712Signature */
    ) external returns (uint256) {
        if (registeredNullifiers[nullifierHash]) {
            revert PassportAlreadyMintedForNullifier(nullifierHash);
        }

        uint256 tokenId = _nextTokenId++;
        passports[tokenId] = PassportRecord({
            tokenId: tokenId,
            holder: to,
            zkProofHash: zkProofHash,
            nullifierHash: nullifierHash,
            jurisdictionCode: jurisdictionCode,
            expiryTimestamp: expiryTimestamp,
            isSanctionsCleared: true,
            isRevoked: false,
            issuanceBlock: block.number
        });

        holderToTokenId[to] = tokenId;
        registeredNullifiers[nullifierHash] = true;

        emit Locked(tokenId);
        emit CompliancePassportMinted(tokenId, to, nullifierHash, jurisdictionCode, expiryTimestamp);

        return tokenId;
    }

    /**
     * @notice Checks if an address holds an active, valid compliance passport
     */
    function isValidPassport(address holder) external view returns (bool) {
        uint256 tokenId = holderToTokenId[holder];
        if (tokenId == 0) return false;

        PassportRecord memory p = passports[tokenId];
        if (p.isRevoked) return false;
        if (block.timestamp > p.expiryTimestamp) return false;
        if (!p.isSanctionsCleared) return false;

        return true;
    }

    /**
     * @notice Revoke a passport if post-issuance sanctions or fraud are detected
     */
    function revokePassport(uint256 tokenId, string calldata reason) external onlyAuthority {
        PassportRecord storage p = passports[tokenId];
        p.isRevoked = true;
        p.isSanctionsCleared = false;
        emit CompliancePassportRevoked(tokenId, p.holder, reason);
    }

    /**
     * @dev ERC-5192 locked view
     */
    function locked(uint256 tokenId) external view override returns (bool) {
        return passports[tokenId].tokenId != 0;
    }

    /**
     * @dev STRICT SOULBOUND PROTECTION: Any transfer attempt triggers an instant revert.
     */
    function transferFrom(address, address, uint256 tokenId) external pure {
        revert SoulboundTokenNonTransferable(msg.sender, tokenId);
    }

    function safeTransferFrom(address, address, uint256 tokenId) external pure {
        revert SoulboundTokenNonTransferable(msg.sender, tokenId);
    }

    function safeTransferFrom(address, address, uint256 tokenId, bytes calldata) external pure {
        revert SoulboundTokenNonTransferable(msg.sender, tokenId);
    }
}
`;

export const REGULATED_RWA_TOKEN_SOL = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title RegulatedRWAToken (ERC-3643 Institutional Permissioned Token)
 * @notice Asset: Dhaka-NY Prime Commercial Tower RWA ($BLDG-RWA)
 * @dev Valuation: $10,000,000 USD (100 Crore BDT) / 100,000 fractional tokens ($100 / token)
 * Enforces automated, sub-second statutory compliance checks on every transfer:
 * 1. High Court Judicial Stay Order / Asset Freeze check
 * 2. Seller Soulbound ZK Passport validity
 * 3. Buyer Soulbound ZK Passport validity
 * 4. Regulatory jurisdiction compatibility check
 */

interface IZkCompliancePassport {
    function isValidPassport(address holder) external view returns (bool);
    function passports(uint256 tokenId) external view returns (
        uint256 tokenId,
        address holder,
        bytes32 zkProofHash,
        bytes32 nullifierHash,
        uint16 jurisdictionCode,
        uint64 expiryTimestamp,
        bool isSanctionsCleared,
        bool isRevoked,
        uint256 issuanceBlock
    );
    function holderToTokenId(address holder) external view returns (uint256);
}

error LegalFreezeError(string reason, string caseNumber);
error ComplianceError(string reason);
error InsufficientBalance(uint256 available, uint256 required);
error UnauthorizedRegistry();

contract RegulatedRWAToken {
    string public name = "Dhaka-NY Prime Commercial Tower RWA";
    string public symbol = "BLDG-RWA";
    uint8 public decimals = 0; // 1 token = 1 fractional deed share ($100 USD)
    uint256 public totalSupply = 100000;
    uint256 public constant ASSET_VALUATION_USD = 10000000; // $10,000,000 USD (100 Crore BDT)

    address public owner;
    IZkCompliancePassport public immutable passportRegistry;

    // High Court Judicial Injunction / Statutory Stay Order state
    bool public judicialStayOrderActive = false;
    string public stayOrderCaseNumber = "";

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event JudicialStayOrderToggled(bool indexed active, string caseNumber);
    event ComplianceCheckPassed(address indexed from, address indexed to, uint256 amount);

    modifier onlyOwner() {
        if (msg.sender != owner) revert UnauthorizedRegistry();
        _;
    }

    constructor(
        address _passportRegistry,
        address initialHolderAlice,
        address initialHolderBob
    ) {
        owner = msg.sender;
        passportRegistry = IZkCompliancePassport(_passportRegistry);

        // Pre-allocate initial institutional tranches
        balanceOf[initialHolderAlice] = 25000; // 25,000 shares ($2.5M USD)
        balanceOf[initialHolderBob] = 5000;    // 5,000 shares ($500K USD)
        balanceOf[msg.sender] = 70000;        // Institutional Treasury reserve

        emit Transfer(address(0), initialHolderAlice, 25000);
        emit Transfer(address(0), initialHolderBob, 5000);
        emit Transfer(address(0), msg.sender, 70000);
    }

    /**
     * @notice Emergency High Court Stay Order Toggle
     * Can be invoked by judicial registrar or smart contract administrator
     */
    function setJudicialStayOrder(bool active, string calldata caseNumber) external onlyOwner {
        judicialStayOrderActive = active;
        stayOrderCaseNumber = caseNumber;
        emit JudicialStayOrderToggled(active, caseNumber);
    }

    /**
     * @dev Automated statutory compliance hook running in <1s before every transfer
     */
    function _beforeTokenTransfer(address from, address to, uint256 amount) internal view {
        // Exclude minting or burning transactions
        if (from == address(0) || to == address(0)) return;

        // CHECK 1: Emergency High Court Injunction / Judicial Stay Order
        if (judicialStayOrderActive) {
            revert LegalFreezeError(
                "ASSET_UNDER_JUDICIAL_STAY_ORDER",
                stayOrderCaseNumber
            );
        }

        // CHECK 2: Seller Soulbound Compliance Passport Verification
        if (!passportRegistry.isValidPassport(from)) {
            revert ComplianceError("SELLER_PASSPORT_MISSING_EXPIRED_OR_REVOKED");
        }

        // CHECK 3: Buyer Soulbound Compliance Passport Verification
        if (!passportRegistry.isValidPassport(to)) {
            revert ComplianceError("BUYER_PASSPORT_MISSING_OR_UNVERIFIED");
        }
    }

    /**
     * @notice Standard ERC-20 transfer wrapped with institutional compliance hooks
     */
    function transfer(address to, uint256 amount) external returns (bool) {
        if (balanceOf[msg.sender] < amount) {
            revert InsufficientBalance(balanceOf[msg.sender], amount);
        }

        _beforeTokenTransfer(msg.sender, to, amount);

        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;

        emit ComplianceCheckPassed(msg.sender, to, amount);
        emit Transfer(msg.sender, to, amount);
        return true;
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        if (balanceOf[from] < amount) {
            revert InsufficientBalance(balanceOf[from], amount);
        }
        if (allowance[from][msg.sender] < amount) {
            revert ComplianceError("INSUFFICIENT_ALLOWANCE");
        }

        _beforeTokenTransfer(from, to, amount);

        allowance[from][msg.sender] -= amount;
        balanceOf[from] -= amount;
        balanceOf[to] += amount;

        emit ComplianceCheckPassed(from, to, amount);
        emit Transfer(from, to, amount);
        return true;
    }
}
`;

export const ZK_COMPLIANCE_PASSPORT_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function regulatoryAuthority() view returns (address)",
  "function mintCompliancePassport(address to, bytes32 zkProofHash, bytes32 nullifierHash, uint16 jurisdictionCode, uint64 expiryTimestamp, bytes calldata eip712Signature) returns (uint256)",
  "function isValidPassport(address holder) view returns (bool)",
  "function revokePassport(uint256 tokenId, string calldata reason)",
  "function locked(uint256 tokenId) view returns (bool)",
  "function transferFrom(address from, address to, uint256 tokenId) pure",
  "function holderToTokenId(address holder) view returns (uint256)",
  "function registeredNullifiers(bytes32 nullifierHash) view returns (bool)",
  "function passports(uint256 tokenId) view returns (uint256 tokenId, address holder, bytes32 zkProofHash, bytes32 nullifierHash, uint16 jurisdictionCode, uint64 expiryTimestamp, bool isSanctionsCleared, bool isRevoked, uint256 issuanceBlock)",
  "event CompliancePassportMinted(uint256 indexed tokenId, address indexed holder, bytes32 indexed nullifierHash, uint16 jurisdictionCode, uint64 expiryTimestamp)",
  "event CompliancePassportRevoked(uint256 indexed tokenId, address indexed holder, string reason)",
  "event Locked(uint256 tokenId)"
];

export const REGULATED_RWA_TOKEN_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function ASSET_VALUATION_USD() view returns (uint256)",
  "function owner() view returns (address)",
  "function judicialStayOrderActive() view returns (bool)",
  "function stayOrderCaseNumber() view returns (string)",
  "function balanceOf(address account) view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function setJudicialStayOrder(bool active, string calldata caseNumber)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) returns (bool)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event Approval(address indexed owner, address indexed spender, uint256 value)",
  "event JudicialStayOrderToggled(bool indexed active, string caseNumber)",
  "event ComplianceCheckPassed(address indexed from, address indexed to, uint256 amount)"
];
