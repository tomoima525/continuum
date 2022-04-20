import { MerkleTreeNode } from '@/types';
import * as AWS from 'aws-sdk';
const docClient = new AWS.DynamoDB.DocumentClient();

export const nodesQuery = async (
  groupId: string,
  level: number,
  TableName: string,
): Promise<MerkleTreeNode[]> => {
  const params: AWS.DynamoDB.DocumentClient.QueryInput = {
    TableName,
    IndexName: 'GroupIndex',
    KeyConditionExpression: 'groupId = :id',
    FilterExpression: '#l = :l',
    ExpressionAttributeNames: {
      '#l': 'level',
    },
    ExpressionAttributeValues: {
      ':id': groupId,
      ':l': level,
    },
  };
  const r = await docClient.query(params).promise();
  if (!r.Items?.length) {
    throw new Error('no value');
  }
  const convertedData = r.Items?.map(item => {
    const parent = AWS.DynamoDB.Converter.output(item?.parent);
    return {
      ...item,
      parent,
    } as MerkleTreeNode;
  });
  return convertedData;
};
