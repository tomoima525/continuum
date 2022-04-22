import { Group } from '@/types';
import * as AWS from 'aws-sdk';
const docClient = new AWS.DynamoDB.DocumentClient();

// For now we only have one type of Groups
export const groupsQuery = async (TableName: string): Promise<Group[]> => {
  const params: AWS.DynamoDB.DocumentClient.QueryInput = {
    TableName,
    IndexName: 'GroupOwnerIndex',
    KeyConditionExpression: 'groupOwnerId = :id',
    ExpressionAttributeValues: {
      ':id': '1', // Github
    },
  };
  const r = await docClient.query(params).promise();
  if (!r.Items?.length) {
    throw new Error('no value');
  }

  return r.Items as Group[];
};
