import * as AWS from 'aws-sdk';
const docClient = new AWS.DynamoDB.DocumentClient();

export const commitmentPut = async ({
  Item,
  TableName,
}: {
  Item: AWS.DynamoDB.DocumentClient.PutItemInputAttributeMap;
  TableName: string;
}): Promise<boolean> => {
  const params: AWS.DynamoDB.DocumentClient.PutItemInput = {
    Item,
    TableName,
  };

  await docClient.put(params).promise();
  return true;
};
