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
    KeyConditionExpression: 'groupId = :id',
    FilterExpression: '#l= :l',
    ExpressionAttributeNames: {
      '#l': 'level',
    },
    ExpressionAttributeValues: {
      ':id': groupId,
      ':l': level,
    },
  };
  const r = await docClient.query(params).promise();
  return r.Items?.length || 0;
};
