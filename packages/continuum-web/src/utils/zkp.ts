import { keccak256 } from '@ethersproject/solidity';
import { formatBytes32String } from '@ethersproject/strings';
import { groth16 } from 'snarkjs';
import {
  MerkleProof,
  StrBigInt,
  SemaphoreWitness,
  SemaphoreFullProof,
  SemaphoreSolidityProof,
  Proof,
} from 'types';

export const genSignalHash = (signal: string): StrBigInt => {
  return (
    BigInt(keccak256(['bytes32'], [formatBytes32String(signal)])) >> BigInt(8)
  );
};

/**
 * Creates a Semaphore witness for the Semaphore ZK proof.
 * @param identityTrapdoor The identity trapdoor.
 * @param identityNullifier The identity nullifier.
 * @param merkleProof The Merkle proof that identity exists in Semaphore tree.
 * @param externalNullifier The topic on which vote should be broadcasted.
 * @param signal The signal that should be broadcasted.
 * @param shouldHash True if the signal must be hashed before broadcast.
 * @returns The Semaphore witness.
 */
export const genWitness = (
  identityTrapdoor: StrBigInt,
  identityNullifier: StrBigInt,
  merkleProof: MerkleProof,
  externalNullifier: StrBigInt,
  signal: string,
): SemaphoreWitness => {
  return {
    identityNullifier,
    identityTrapdoor,
    treePathIndices: merkleProof.pathIndices,
    treeSiblings: merkleProof.siblings,
    externalNullifier,
    signalHash: genSignalHash(signal),
  };
};

export const genProof = async (
  witness: any,
  wasmFilePath: string,
  finalZkeyPath: string,
): Promise<SemaphoreFullProof> => {
  const { proof, publicSignals } = await groth16.fullProve(
    witness,
    wasmFilePath,
    finalZkeyPath,
    null,
  );

  return {
    proof,
    publicSignals: {
      merkleRoot: publicSignals[0],
      nullifierHash: publicSignals[1],
      signalHash: publicSignals[2],
      externalNullifier: publicSignals[3],
    },
  };
};

export const packToSolidityProof = (proof: Proof): SemaphoreSolidityProof => {
  return [
    proof.pi_a[0],
    proof.pi_a[1],
    proof.pi_b[0][1],
    proof.pi_b[0][0],
    proof.pi_b[1][1],
    proof.pi_b[1][0],
    proof.pi_c[0],
    proof.pi_c[1],
  ];
};
