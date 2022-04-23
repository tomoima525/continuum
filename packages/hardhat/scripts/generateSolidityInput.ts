import { ethers } from "hardhat";
import createIdentity from "@interep/identity";
import { IncrementalMerkleTree } from "@zk-kit/incremental-merkle-tree";
import { Semaphore } from "@zk-kit/protocols";
// https://github.com/NomicFoundation/hardhat/issues/2266 should remove node/recommended fixed the resolver
import { MERKLE_TREE_DEPTH } from "../../configs";
import { buildPoseidonOpt, createPoseidonHash } from "../../crypto-tool";
import { BigNumber } from "ethers";

async function main() {
  const poseidonModule = await buildPoseidonOpt();
  const hash = (poseidon: any) => (nodes: bigint[]) => {
    return createPoseidonHash(poseidon, nodes);
  };
  const signers = await ethers.getSigners();
  const signer = signers[0];
  // groupId: Group#1d08c8f42a6cba815291e34b72291b09
  // nullifier: 142167766954351307463776207967215261815
  const identity = await createIdentity(
    (message) => signer.signMessage(message),
    "Group#1d08c8f42a6cba815291e34b72291b09"
  );
  console.log(MERKLE_TREE_DEPTH);
  const identityCommitment = identity.genIdentityCommitment().toString();

  const tree = new IncrementalMerkleTree(
    hash(poseidonModule),
    MERKLE_TREE_DEPTH,
    BigInt(0)
  );
  tree.insert(BigInt(identityCommitment));

  const merkleProof = tree.createProof(0);
  // console.log("proof", merkleProof);
  const witness = Semaphore.genWitness(
    identity.getTrapdoor(),
    identity.getNullifier(),
    merkleProof,
    BigInt("142167766954351307463776207967215261815"),
    "continuum"
  );

  const { publicSignals, proof } = await Semaphore.genProof(
    witness,
    "circuit/semaphore.wasm",
    "circuit/semaphore_final.zkey"
  );

  const solidityProof = Semaphore.packToSolidityProof(proof);

  // Convert it into uint256 format

  const output = solidityProof
    .map((v) => BigNumber.from(v).toHexString())
    .reduce((previous, current) => {
      return previous + "," + current;
    });
  console.log(`[${output}]`);
  console.log(
    "merkleRoot:",
    BigNumber.from(publicSignals.merkleRoot).toHexString()
  );
  console.log(
    "nullifierHash:",
    BigNumber.from(publicSignals.nullifierHash).toHexString()
  );
  console.log(
    "externalNullier:",
    BigNumber.from(publicSignals.externalNullifier).toHexString()
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => {
    process.exitCode = 1;
  })
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
