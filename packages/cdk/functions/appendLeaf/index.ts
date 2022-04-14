import * as AWS from 'aws-sdk';
import * as crypto from 'crypto';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { MERKLE_TREE_DEPTH } from '@/configs';
import {
  createNodePut,
  createNodeUpdate,
  nodesCount,
  nodeGetByHash,
  nodePut,
  nodeQuery,
  nodesQueryByGroup,
  nodesTxWrite,
} from '/opt/nodejs/dynamodb-utils';
import { buildPoseidon, createPoseidonHash } from '/opt/nodejs/cdk-crypto';
import { MerkleTreeNode } from '@/types';

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Credentials': true,
};

export const handler = async function (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> {
  const requestBody = JSON.parse(event.body || '');
  const groupId = requestBody?.groupId as string;
  const groupName = requestBody?.groupName as string;
  const identityCommitment = requestBody?.identityCommitment as string;
  const tableName = process.env.TableName as string;

  // TODO: add check mechanism
  // if (!checkGroup(groupId)) {
  //   throw new Error(`The group ${groupName} does not exist`);
  // }

  // Get the zero hashes.
  const zeroes = await nodesQueryByGroup('0', tableName);

  if (!zeroes || zeroes.length !== MERKLE_TREE_DEPTH) {
    throw new Error(`The zero hashes have not yet been created`);
  }

  let identityNode;
  try {
    identityNode = await nodeGetByHash(identityCommitment, groupId, tableName);
  } catch {}

  if (identityNode) {
    throw new Error(
      `The identity commitment ${identityCommitment} already exist`,
    );
  }
  // Get next available index at level 0.
  let currentIndex = await nodesCount(groupId, 0, tableName);

  /* istanbul ignore next */
  if (currentIndex >= 2 ** MERKLE_TREE_DEPTH) {
    throw new Error(`The tree is full`);
  }

  // internal id
  const id = crypto.randomBytes(16).toString('hex');
  let node = {
    hash: identityCommitment,
    id,
    index: currentIndex,
    level: 0,
    groupId,
    groupName,
    siblinghash: null,
    parent: null,
    createdAt: new Date().toISOString(),
  } as MerkleTreeNode;

  nodePut({
    Item: node,
    TableName: tableName,
  });

  console.log('node created', node);
  console.log('Inserting in:', currentIndex);

  const poseidonModule = await buildPoseidon();
  console.log('Module ready');

  for (let level = 0; level < MERKLE_TREE_DEPTH; level++) {
    let tx: AWS.DynamoDB.DocumentClient.TransactWriteItemList = [];
    if (currentIndex % 2 === 0) {
      node.siblinghash = zeroes[level].hash;
      let parentNode;
      try {
        parentNode = await nodeQuery(
          groupId,
          level + 1,
          Math.floor(currentIndex / 2),
          tableName,
        );
      } catch {}
      // console.log('parentNode', parentNode);

      if (parentNode) {
        parentNode.hash = createPoseidonHash(poseidonModule, [
          node.hash,
          node?.siblinghash,
        ]);

        // console.log('new parentNode hash', parentNode);
        tx.push(
          createNodeUpdate({
            id: parentNode.id,
            TableName: tableName,
            props: {
              UpdateExpression: 'set #h=:h',
              ExpressionAttributeNames: { '#h': 'hash' },
              ExpressionAttributeValues: { ':h': parentNode.hash },
            },
          }),
        );
      } else {
        parentNode = {
          hash: createPoseidonHash(poseidonModule, [
            node.hash,
            node?.siblinghash,
          ]),
          id: crypto.randomBytes(16).toString('hex'),
          index: Math.floor(currentIndex / 2),
          level: level + 1,
          groupId,
          groupName,
          siblinghash: null,
          parent: null,
          createdAt: new Date().toISOString(),
        };
        tx.push(
          createNodePut({
            Item: parentNode,
            TableName: tableName,
          }),
        );
      }

      tx.push(
        createNodeUpdate({
          id: node.id,
          TableName: tableName,
          props: {
            UpdateExpression: 'set #p=:p',
            ExpressionAttributeNames: { '#p': 'parent' },
            ExpressionAttributeValues: { ':p': parentNode },
          },
        }),
      );

      node = parentNode;
    } else {
      const siblingNode = await nodeQuery(
        groupId,
        level,
        currentIndex - 1,
        tableName,
      );
      node.siblinghash = siblingNode?.hash;

      const parentNode = await nodeQuery(
        groupId,
        level + 1,
        Math.floor(currentIndex / 2),
        tableName,
      );
      const newParentNode = {
        ...parentNode,
        hash: createPoseidonHash(poseidonModule, [siblingNode.hash, node.hash]),
      };

      node.parent = newParentNode;

      tx.push(
        ...[
          // Update node
          createNodeUpdate({
            id: node.id,
            TableName: tableName,
            props: {
              UpdateExpression: 'set #p=:p, #s=:s',
              ExpressionAttributeNames: {
                '#p': 'parent',
                '#s': 'siblinghash',
              },
              ExpressionAttributeValues: {
                ':p': newParentNode,
                ':s': siblingNode.hash,
              },
            },
          }),
          // Update sibling
          createNodeUpdate({
            id: siblingNode.id,
            TableName: tableName,
            props: {
              UpdateExpression: 'set #p=:p, #s=:s',
              ExpressionAttributeNames: {
                '#p': 'parent',
                '#s': 'siblinghash',
              },
              ExpressionAttributeValues: {
                ':p': newParentNode,
                ':s': node.hash,
              },
            },
          }),
          // Update parent
          createNodeUpdate({
            id: parentNode.id,
            TableName: tableName,
            props: {
              UpdateExpression: 'set #h=:h',
              ExpressionAttributeNames: { '#h': 'hash' },
              ExpressionAttributeValues: {
                ':h': newParentNode.hash,
              },
            },
          }),
        ],
      );

      node = newParentNode;
    }

    await nodesTxWrite(tx);
    currentIndex = Math.floor(currentIndex / 2);
  }

  return {
    headers,
    statusCode: 200,
    body: JSON.stringify({
      test: 'test',
    }),
  };
};
