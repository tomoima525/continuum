import * as AWS from 'aws-sdk';
const docClient = new AWS.DynamoDB.DocumentClient();

export const createNodePut = ({
  Item,
  TableName,
}: {
  Item: AWS.DynamoDB.DocumentClient.PutItemInputAttributeMap;
  TableName: string;
}): AWS.DynamoDB.DocumentClient.TransactWriteItem => {
  return {
    Put: {
      Item,
      TableName,
    },
  };
};

export const createNodeUpdate = ({
  id,
  props,
  TableName,
}: {
  TableName: string;
  id: string;
  props: {
    UpdateExpression: AWS.DynamoDB.DocumentClient.UpdateExpression;
    ExpressionAttributeNames?: AWS.DynamoDB.DocumentClient.ExpressionAttributeNameMap;
    ExpressionAttributeValues?: AWS.DynamoDB.DocumentClient.ExpressionAttributeValueMap;
  };
}): AWS.DynamoDB.DocumentClient.TransactWriteItem => {
  return {
    Update: {
      ...props,
      Key: { id },
      TableName,
    },
  };
};
export const nodesTxWrite = async (
  TransactItems: AWS.DynamoDB.DocumentClient.TransactWriteItemList,
): Promise<boolean> => {
  const params: AWS.DynamoDB.DocumentClient.TransactWriteItemsInput = {
    TransactItems,
  };

  await docClient.transactWrite(params).promise();
  return true;
};
