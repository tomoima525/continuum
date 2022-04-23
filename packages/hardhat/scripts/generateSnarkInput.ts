import { ethers } from "hardhat";
import createIdentity from "@interep/identity";
import { IncrementalMerkleTree } from "@zk-kit/incremental-merkle-tree";
import { Semaphore } from "@zk-kit/protocols";
import * as fs from "fs";
import * as path from "path";
// https://github.com/NomicFoundation/hardhat/issues/2266 should remove node/recommended fixed the resolver
import { MERKLE_TREE_DEPTH } from "../../configs";
import { buildPoseidonOpt, createPoseidonHash } from "../../crypto-tool";

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
  console.log("proof", merkleProof);
  const input = {
    identityTrapdoor: identity.getTrapdoor().toString(),
    identityNullifier: identity.getNullifier().toString(),
    treePathIndices: merkleProof.pathIndices,
    treeSiblings: merkleProof.siblings.map((v) => v.toString()),
    signalHash: Semaphore.genSignalHash("continuum").toString(),
    externalNullifier: BigInt(
      "142167766954351307463776207967215261815"
    ).toString(),
  };
  console.log(input);
  // write to file
  const inputPath = path.join(__dirname, `/../circuit/`, "input.json");
  if (fs.existsSync(inputPath)) {
    fs.unlinkSync(inputPath);
  }
  fs.openSync(inputPath, "w");
  fs.writeFileSync(inputPath, JSON.stringify(input));
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
