import { Commitment } from '@/types';
import * as AWS from 'aws-sdk';
const docClient = new AWS.DynamoDB.DocumentClient();

export const findNodesByGroup = async (
  groupId: string,
  TableName: string,
): Promise<Commitment[] | undefined> => {
  const params: AWS.DynamoDB.DocumentClient.QueryInput = {
    TableName,
    IndexName: 'GroupIndex',
    KeyConditionExpression: 'groupId = :id',
    ExpressionAttributeValues: {
      ':id': groupId,
    },
  };
  const r = await docClient.query(params).promise();
  const convertedData = r.Items?.map(item => {
    const parent = AWS.DynamoDB.Converter.output(item?.org);
    return {
      ...item,
      parent,
    } as Commitment;
  });
  return convertedData;
};
