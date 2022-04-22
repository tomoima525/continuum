import { Commitment } from '@/types';
import * as AWS from 'aws-sdk';
const docClient = new AWS.DynamoDB.DocumentClient();

export const commitmentsQueryByAddress = async (
  address: string,
  TableName: string,
): Promise<Commitment[]> => {
  const params: AWS.DynamoDB.DocumentClient.QueryInput = {
    TableName,
    IndexName: 'CommitmentUserIndex',
    KeyConditionExpression: 'userId = :id',
    ExpressionAttributeValues: {
      ':id': `User#${address}`,
    },
  };
  const r = await docClient.query(params).promise();
  if (!r.Items?.length) {
    return [];
  }
  return r.Items as Commitment[];
};
