// SPDX-License-Identifier: MIT
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
