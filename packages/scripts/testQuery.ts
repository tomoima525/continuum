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

async function main() {
  const tableName = 'CdkStack-dev-DynamoDBMerkleTree8A62F92F-675JA7NPNV';

  const r = await nodeGetByHash('0', '0', tableName);
  console.log('===', r);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
