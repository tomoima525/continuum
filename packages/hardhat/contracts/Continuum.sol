// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./IContinuum.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@appliedzkp/semaphore-contracts/interfaces/IVerifier.sol";
import "@appliedzkp/semaphore-contracts/base/SemaphoreCore.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/// @title Continuum
contract Continuum is IContinuum, SemaphoreCore, ERC721URIStorage {
    using Counters for Counters.Counter;

    Counters.Counter private supplyCounter;
    IVerifier private verifier;

    /// @dev
    /// @param verifierAddress: Verifier address.
    constructor(address verifierAddress) ERC721("Continuum v2", "CNT") {
        verifier = IVerifier(verifierAddress);
    }

    /// @dev See {IContinuum-mint}.
    function mint(
        uint256 root,
        uint256 nullifierHash,
        uint256 externalNullifier,
        uint256[8] calldata proof,
        string memory tokenURI
    ) external override {
        bytes32 signal = bytes32("continuum");
        _verifyProof(
            signal,
            root,
            nullifierHash,
            externalNullifier,
            proof,
            verifier
        );

        // Prevent double-signaling (nullifierHash = hash(groupId + identityNullifier)).
        _saveNullifierHash(nullifierHash);

        emit ProofVerified(signal);

        _mint(msg.sender, totalSupply());
        _setTokenURI(totalSupply(), tokenURI);

        emit Minted(totalSupply(), msg.sender);

        supplyCounter.increment();
    }

    function totalSupply() public view returns (uint256) {
        return supplyCounter.current();
    }
}
