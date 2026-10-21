// SPDX-License-Identifier: MIT
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
