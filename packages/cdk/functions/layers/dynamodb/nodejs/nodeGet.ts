import * as AWS from 'aws-sdk';
import { MerkleTreeNode } from '@/types';

const docClient = new AWS.DynamoDB.DocumentClient();

export const nodeGetByHash = async (
  hash: string,
  groupId: string,
  TableName: string,
): Promise<MerkleTreeNode> => {
  const params: AWS.DynamoDB.DocumentClient.QueryInput = {
    TableName,
    IndexName: 'GroupIndex',
    KeyConditionExpression: 'groupId = :g',
    FilterExpression: '#h = :hash AND contains(#i, :i)',
    ExpressionAttributeNames: {
      '#h': 'hash',
      '#i': 'id',
    },
    ExpressionAttributeValues: {
      ':g': groupId,
      ':hash': hash,
      ':i': 'MerkleTree',
    },
  };
  const r = await docClient.query(params).promise();
  if (!r.Items?.length) {
    throw new Error('no value');
  }
  const parent = AWS.DynamoDB.Converter.output(r.Items[0].parent);
  return {
    ...r.Items[0],
    parent,
  } as MerkleTreeNode;
};
