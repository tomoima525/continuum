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
  const identityCommitment = event.queryStringParameters
    ?.identityCommitment as string;
  const tablename = process.env.TableName as string;
  if (!groupId) {
    return {
      statusCode: 404,
      headers,
      body: 'No proofId specified',
    };
  }
  console.log('====', groupId, tablename);
  const poseidonModule = await buildPoseidonOpt();
  const hash = (poseidon: any) => (nodes: bigint[]) => {
    return createPoseidonHash(poseidon, nodes);
  };
  let identityCommitments;
  try {
    identityCommitments = (await nodesQuery(groupId, 0, tablename)).map(
      node => node.hash,
    );
  } catch (e) {
    console.log('no commitments', groupId);
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        result: {},
      }),
    };
  }
  const zeroValue = BigInt(0);
  const tree = new IncrementalMerkleTree(
    hash(poseidonModule),
    MERKLE_TREE_DEPTH,
    zeroValue,
  );

  for (const commitment of identityCommitments) {
    tree.insert(BigInt(commitment));
  }

  const leafIndex = tree.leaves.indexOf(BigInt(identityCommitment));

  const p = tree.createProof(leafIndex);

  const merkleProof = {
    root: p.root.toString(),
    leaf: p.leaf.toString(),
    siblings: p.siblings.map(sibling => sibling.toString()),
    pathIndices: p.pathIndices,
  };
  return {
    headers,
    statusCode: 200,
    body: JSON.stringify({
      merkleProof,
    }),
  };
};
