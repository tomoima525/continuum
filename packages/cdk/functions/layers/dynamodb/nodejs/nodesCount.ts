import { MerkleTreeNode } from '@/types';
import * as AWS from 'aws-sdk';
const docClient = new AWS.DynamoDB.DocumentClient();

export const nodesCount = async (
  groupId: string,
  level: number,
  TableName: string,
): Promise<number> => {
  const params: AWS.DynamoDB.DocumentClient.QueryInput = {
    TableName,
    IndexName: 'GroupIndex',
    KeyConditionExpression: 'groupId = :g',
    FilterExpression: '#l= :l AND contains(#i, :i)',
    ExpressionAttributeNames: {
      '#l': 'level',
      '#i': 'id',
    },
    ExpressionAttributeValues: {
      ':g': groupId,
      ':l': level,
      ':i': 'MerkleTree',
    },
  };
  const r = await docClient.query(params).promise();
  return r.Items?.length || 0;
};
