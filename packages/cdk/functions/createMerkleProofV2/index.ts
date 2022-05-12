import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { MERKLE_TREE_DEPTH, MODEL_MERKLE_TREE } from '@/configs';
import {
  createNodeGet,
  nodeGetByHash,
  nodeQuery,
  nodesQueryByGroup,
  nodesTxGet,
} from '/opt/nodejs/dynamodb-utils';
import { MerkleTreeNode } from '@/types';

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Credentials': true,
};

export const handler = async function (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> {
  const groupId = event.queryStringParameters?.groupId;
  const identityCommitment = event.queryStringParameters
    ?.identityCommitment as string;
  const TableName = process.env.TableName as string;

  if (!groupId) {
    return {
      statusCode: 404,
      headers,
      body: 'No proofId specified',
    };
  }
  // Check the index of identityCommitment
  let identityNode;
  let zeroes: MerkleTreeNode[];
  let nodes: MerkleTreeNode[];
  let root: MerkleTreeNode;
  try {
    identityNode = await nodeGetByHash(identityCommitment, groupId, TableName);
    zeroes = (await nodesQueryByGroup('0', TableName)) as MerkleTreeNode[];
    nodes = (await nodesQueryByGroup(groupId, TableName)) as MerkleTreeNode[];
    root = await nodeQuery(groupId, MERKLE_TREE_DEPTH, 0, TableName);
  } catch (e) {
    return {
      statusCode: 404,
      headers,
      body: `Incorrect data request: ${e}`,
    };
  }
  let index = identityNode.index;

  let tx = [];
  const pathIndices: number[] = [];
  const siblings: string[] = [];
  for (let level = 0; level < MERKLE_TREE_DEPTH; level += 1) {
    const position = index % 2;
    const levelStartIndex = index - position;
    const levelEndIndex = levelStartIndex + 2;

    pathIndices[level] = position;

    for (let i = levelStartIndex; i < levelEndIndex; i += 1) {
      if (i !== index) {
        const length = nodes.filter(node => node.level === level).length;
        if (i < length) {
          tx.push(
            createNodeGet({
              id: `${MODEL_MERKLE_TREE}#${groupId}_${level}_${i}`,
              TableName,
            }),
          );
        } else {
          const zeroHash = zeroes.find(z => z.level === level)?.hash as string;
          siblings[level] = zeroHash;
        }
      }
    }

    index = Math.floor(index / 2);
  }

  if (tx.length) {
    const r = await nodesTxGet(tx);
    r.forEach(node => (siblings[node.level] = node.hash));
  }
  const merkleProof = {
    leaf: identityNode.hash,
    root: root.hash,
    pathIndices,
    siblings,
  };
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ merkleProof }),
  };
};
