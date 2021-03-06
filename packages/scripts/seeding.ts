import * as AWS from 'aws-sdk';
import crypto from 'crypto';
import { MERKLE_TREE_DEPTH } from '../configs/index';
import { buildPoseidonOpt, createPoseidonHash } from '../crypto-tool';
import groups from './groups.json';

// use your local profile
const credentials = new AWS.SharedIniFileCredentials({ profile: 'knot' });
AWS.config.credentials = credentials;
const docClient = new AWS.DynamoDB.DocumentClient({
  region: 'us-west-2',
  credentials,
});

export const seedGroups = async (TableName: string): Promise<unknown> => {
  console.log('seeding groups');
  let putRequests: AWS.DynamoDB.DocumentClient.WriteRequest[] = [];
  try {
    groups.forEach(group => {
      // internal id
      const id = crypto.randomBytes(16).toString('hex');
      const nullifier = BigInt('0x' + id).toString(10);

      const putRequest: AWS.DynamoDB.DocumentClient.WriteRequest = {
        PutRequest: {
          Item: {
            id: `Group#${id}`,
            nullifier,
            name: group.name,
            criteria: group.criteria,
            attr_key: group.attr_key,
            groupOwnerId: '1',
            createdAt: new Date().toISOString(),
          },
        },
      };
      putRequests.push(putRequest);
    });

    // console.log('===', JSON.stringify(putRequests));
    const putParams: AWS.DynamoDB.DocumentClient.BatchWriteItemInput = {
      RequestItems: {
        [`${TableName}`]: putRequests,
      },
    };
    await docClient.batchWrite(putParams).promise();
  } catch (e) {
    console.log(e);
    return;
  }
  return;
};

export const seedZeroHashes = async (TableName: string): Promise<unknown> => {
  console.log('Seeding zero hashes...');

  let zeroHash = '0';
  let result;
  const params: AWS.DynamoDB.DocumentClient.QueryInput = {
    TableName,
    IndexName: 'GroupIndex',
    KeyConditionExpression: 'groupId = :id',
    ExpressionAttributeValues: {
      ':id': '0',
    },
  };
  try {
    result = (await docClient
      .query(params)
      .promise()) as AWS.DynamoDB.DocumentClient.QueryOutput;
  } catch (e) {
    console.log('=== e', e);
    return;
  }

  if (result.Count && result.Count > 0) {
    console.log('Zero seeds exists');
    return;
  }
  const poseidonModule = await buildPoseidonOpt();
  let putRequests: AWS.DynamoDB.DocumentClient.WriteRequest[] = [];
  try {
    for (let level = 0; level < MERKLE_TREE_DEPTH; level++) {
      zeroHash =
        level === 0
          ? zeroHash
          : createPoseidonHash(poseidonModule, [zeroHash, zeroHash]);
      console.log({ zeroHash });
      // internal id
      const id = crypto.randomBytes(16).toString('hex');

      const putRequest: AWS.DynamoDB.DocumentClient.WriteRequest = {
        PutRequest: {
          Item: {
            id: `MerkleTree#${id}`,
            hash: zeroHash,
            level,
            groupId: '0',
            groupName: 'ZeroHash',
            createdAt: new Date().toISOString(),
          },
        },
      };
      putRequests.push(putRequest);
    }
    const putParams: AWS.DynamoDB.DocumentClient.BatchWriteItemInput = {
      RequestItems: {
        [`${TableName}`]: putRequests,
      },
    };
    await docClient.batchWrite(putParams).promise();
  } catch (e) {
    console.log('put error', e);
  }
  try {
    result = (await docClient
      .query(params)
      .promise()) as AWS.DynamoDB.DocumentClient.QueryOutput;
    console.log(`Inserted ${result.Count} items`);
  } catch (e) {
    console.log('=== e', e);
    return;
  }
  return {};
};
