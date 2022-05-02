import { Group } from '@/types';
import * as AWS from 'aws-sdk';
const docClient = new AWS.DynamoDB.DocumentClient();

// For now we only have one type of Groups
export const groupQuery = async (
  id: string,
  TableName: string,
): Promise<Group> => {
  const params: AWS.DynamoDB.DocumentClient.QueryInput = {
    TableName,
    IndexName: 'GroupOwnerIndex',
    KeyConditionExpression: 'groupOwnerId = :ownerId',
    FilterExpression: '#i =:i',
    ExpressionAttributeNames: {
      '#i': 'id',
    },
    ExpressionAttributeValues: {
      ':ownerId': '1', // Github
      ':i': id,
    },
  };
  console.log(params);
  const r = await docClient.query(params).promise();
  if (!r.Items?.length) {
    throw new Error('no value');
  }

  return r.Items[0] as Group;
};
