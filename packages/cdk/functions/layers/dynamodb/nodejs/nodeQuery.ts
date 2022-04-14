import { MerkleTreeNode } from '@/types';
import * as AWS from 'aws-sdk';
const docClient = new AWS.DynamoDB.DocumentClient();

export const nodeQuery = async (
  groupId: string,
  level: number,
  index: number,
  TableName: string,
): Promise<MerkleTreeNode> => {
  const params: AWS.DynamoDB.DocumentClient.QueryInput = {
    TableName,
    IndexName: 'GroupIndex',
    KeyConditionExpression: 'groupId = :id',
    FilterExpression: '#l = :l AND #i =:i',
    ExpressionAttributeNames: {
      '#l': 'level',
      '#i': 'index',
    },
    ExpressionAttributeValues: {
      ':id': groupId,
      ':i': index,
      ':l': level,
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
