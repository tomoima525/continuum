//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

/// @title Continuum interface.
/// @dev Interface of a Continuum contract.
interface IContinuum {
    /// @dev Emitted when a Semaphore proof is verified.
    /// @param signal: Semaphore signal.
    event ProofVerified(bytes32 signal);

    /// @dev Emitted when a Semaphore proof is verified.
    /// @param tokenId: Id of the token.
    /// @param to: address minted
    event Minted(uint256 tokenId, address to);

    /// @dev Saves the nullifier hash to avoid double signaling and exit an event
    /// if the zero-knowledge proof is valid.
    /// @param root: root of tree
    /// @param nullifierHash: Nullifier hash.
    /// @param externalNullifier: External nullifier.
    /// @param proof: Zero-knowledge proof.
    /// @param tokenURI: tokenURI for nft.
    function mint(
        uint256 root,
        uint256 nullifierHash,
        uint256 externalNullifier,
        uint256[8] calldata proof,
        string memory tokenURI
    ) external;
}
