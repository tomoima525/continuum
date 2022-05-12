import { MerkleTreeNode } from '@/types';
import * as AWS from 'aws-sdk';
const docClient = new AWS.DynamoDB.DocumentClient();

export const nodesQueryByGroup = async (
  groupId: string,
  TableName: string,
): Promise<MerkleTreeNode[] | undefined> => {
  const params: AWS.DynamoDB.DocumentClient.QueryInput = {
    TableName,
    IndexName: 'GroupIndex',
    KeyConditionExpression: 'groupId = :g',
    FilterExpression: 'contains(#i, :i)',
    ExpressionAttributeNames: {
      '#i': 'id',
    },
    ExpressionAttributeValues: {
      ':g': groupId,
      ':i': 'MerkleTree',
    },
  };
  const result: MerkleTreeNode[] = [];
  const query = async (queryParams: AWS.DynamoDB.DocumentClient.QueryInput) => {
    const r = await docClient.query(queryParams).promise();
    const nodes: MerkleTreeNode[] = (r.Items as MerkleTreeNode[]) || [];
    result.push(...nodes);

    if (typeof r.LastEvaluatedKey !== 'undefined') {
      const newParams = {
        ...queryParams,
        ExclusiveStartKey: r.LastEvaluatedKey,
      };
      await query(newParams);
    }
  };

  await query(params);
  return result;
};
