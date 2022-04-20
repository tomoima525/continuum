import { IncrementalMerkleTree } from '@zk-kit/incremental-merkle-tree';
import { buildPoseidonOpt, createPoseidonHash } from '../crypto-tool';

const testMerkleTree = async () => {
  const poseidonModule = await buildPoseidonOpt();
  const hash = (poseidon: any) => (nodes: bigint[]) => {
    return createPoseidonHash(poseidon, nodes);
  };
  const tree = new IncrementalMerkleTree(hash(poseidonModule), 3, BigInt(0));
  const zeros = tree.zeroes;
  console.log(zeros);
  /**
   * [
    0n,
    '59072778429647102475079414651180362335100584636717911618918519487096416739592',
    '95724445461010048170031013165046547870653825341822222981259694836192204757780'
    ]
   */
};

async function main() {
  await testMerkleTree();
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
