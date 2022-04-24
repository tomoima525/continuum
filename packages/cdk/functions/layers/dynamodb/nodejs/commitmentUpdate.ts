import { CommitmentUpdate } from '@/types';
import * as AWS from 'aws-sdk';
const docClient = new AWS.DynamoDB.DocumentClient();

export const commitmentUpdate = async ({
  commitment,
  TableName,
}: {
  commitment: CommitmentUpdate;
  TableName: string;
}): Promise<boolean> => {
  const params: AWS.DynamoDB.DocumentClient.UpdateItemInput = {
    TableName,
    Key: {
      id: commitment.id,
    },
    ExpressionAttributeValues: {},
    ExpressionAttributeNames: {},
    UpdateExpression: '',
    ReturnValues: 'ALL_NEW',
  };
  let prefix = 'set ';
  let attributes = Object.keys(commitment);
  let ExpressionAttributeValues: { [key: string]: string } = {};
  let ExpressionAttributeNames: { [key: string]: string } = {};

  for (let i = 0; i < attributes.length; i++) {
    let attribute = attributes[i];
    if (attribute !== 'id') {
      params['UpdateExpression'] +=
        prefix + '#' + attribute + ' = :' + attribute;
      // @ts-ignore
      ExpressionAttributeValues[':' + attribute] = commitment[`${attribute}`];
      ExpressionAttributeNames['#' + attribute] = attribute;
      prefix = ', ';
    }
  }
  params.ExpressionAttributeNames = ExpressionAttributeNames;
  params.ExpressionAttributeValues = ExpressionAttributeValues;
  console.log(params);
  await docClient.update(params).promise();
  return true;
};
