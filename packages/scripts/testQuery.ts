import * as AWS from 'aws-sdk';

const credentials = new AWS.SharedIniFileCredentials({ profile: 'knot' });
AWS.config.credentials = credentials;
const docClient = new AWS.DynamoDB.DocumentClient({
  region: 'us-west-2',
  credentials,
});

const nodeGetByHash = async (
  hash: string,
  groupId: string,
  TableName: string,
): Promise<any> => {
  const params: AWS.DynamoDB.DocumentClient.QueryInput = {
    TableName,
    IndexName: 'GroupIndex',
    KeyConditionExpression: 'groupId = :id AND #h = :hash',
    ExpressionAttributeNames: {
      '#h': 'hash',
    },
    ExpressionAttributeValues: {
      ':id': groupId,
      ':hash': hash,
    },
  };
  const r = await docClient.query(params).promise();
  if (!r.Items?.length) {
    throw new Error('no value');
  }
  const parent = AWS.DynamoDB.Converter.output(r.Items[0].parent);
  return {
    ...r.Items[0],
    parent,
  };
};

export const nodesQuery = async (
  groupId: string,
  level: number,
  TableName: string,
): Promise<any> => {
  const params: AWS.DynamoDB.DocumentClient.QueryInput = {
    TableName,
    IndexName: 'GroupIndex',
    KeyConditionExpression: 'groupId = :g',
    FilterExpression: '#l = :l AND contains(#i, :i)',
    ExpressionAttributeNames: {
      '#l': 'level',
      '#i': 'id',
    },
    ExpressionAttributeValues: {
      ':g': groupId,
      ':l': level,
      ':i': 'MerkleTree',
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
    };
  });
  return convertedData;
};

async function main() {
  const tableName = 'CdkStack-dev-DynamoDBContinuumCE168742-T43BFABPMSO7';

  // const r = await nodeGetByHash('0', '0', tableName);
  // console.log('===', r);
  const q = await nodesQuery(
    'Group#8f2cd5673434a49e4b4f52c2d68e8ec8',
    0,
    tableName,
  );
  console.log('===x', q);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
