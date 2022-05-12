import { MerkleTreeNode } from '@/types';
import * as AWS from 'aws-sdk';
const docClient = new AWS.DynamoDB.DocumentClient();

export const createNodeGet = ({
  id,
  TableName,
}: {
  TableName: string;
  id: string;
}): AWS.DynamoDB.DocumentClient.TransactGetItem => {
  return {
    Get: {
      Key: { id },
      TableName,
    },
  };
};

export const nodesTxGet = async (
  TransactItems: AWS.DynamoDB.DocumentClient.TransactGetItemList,
): Promise<MerkleTreeNode[]> => {
  const params: AWS.DynamoDB.DocumentClient.TransactGetItemsInput = {
    TransactItems,
  };

  const r = await docClient.transactGet(params).promise();
  if (!r.Responses?.length) {
    throw new Error('no value');
  }

  const convertedData = r.Responses?.map(response => {
    const parent = AWS.DynamoDB.Converter.output(response.Item?.parent);
    return {
      ...response.Item,
      parent,
    } as MerkleTreeNode;
  });
  return convertedData;
};
