import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { MERKLE_TREE_DEPTH } from '@/configs';
import { nodesQuery } from '/opt/nodejs/dynamodb-utils';
import { buildPoseidonOpt, createPoseidonHash } from '/opt/nodejs/cdk-crypto';
import { IncrementalMerkleTree } from '@zk-kit/incremental-merkle-tree';

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Credentials': true,
};

// TODO: this is not perfomant; Time complexity is O(n)
// Consider optimization using data in DynamoDB or use SparseMerkleTree
export const handler = async function (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> {
  const groupId = event.queryStringParameters?.groupId;
  const tablename = process.env.TableName as string;
  if (!groupId) {
    return {
      statusCode: 404,
      headers,
      body: 'No proofId specified',
    };
  }

  const poseidonModule = await buildPoseidonOpt();
  const hash = (poseidon: any) => (nodes: bigint[]) => {
    return createPoseidonHash(poseidon, nodes);
  };
  const identityCommitments = (await nodesQuery(groupId, 0, tablename)).map(
    node => node.hash,
  );
  const zeroValue = BigInt(0);
  const tree = new IncrementalMerkleTree(
    hash(poseidonModule),
    MERKLE_TREE_DEPTH,
    zeroValue,
  );

  for (const commitment of identityCommitments) {
    tree.insert(BigInt(commitment));
  }

  const merkleProof = tree.createProof(1);

  const result = {
    root: merkleProof.root.toString(),
    leaf: merkleProof.leaf.toString(),
    siblings: merkleProof.siblings.map(sibling => sibling.toString()),
  };
  return {
    headers,
    statusCode: 200,
    body: JSON.stringify({
      result,
    }),
  };
};
